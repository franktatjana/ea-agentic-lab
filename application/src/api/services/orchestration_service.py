"""Orchestration Service - serves process registry data and runs analysis"""

from pathlib import Path
from typing import Dict, List, Optional

import yaml


def _get_registry_path() -> Path:
    return Path(__file__).parent.parent.parent / "process_registry"


class OrchestrationService:
    def __init__(self, registry_path: Optional[Path] = None):
        self.registry_path = registry_path or _get_registry_path()

    def list_processes(self) -> List[Dict]:
        proc_dir = self.registry_path / "processes"
        if not proc_dir.exists():
            return []
        processes = []
        for f in sorted(proc_dir.glob("*.yaml")):
            try:
                data = yaml.safe_load(f.read_text())
                processes.append(self._summarise(data))
            except Exception:
                continue
        return processes

    def get_process(self, process_id: str) -> Optional[Dict]:
        proc_dir = self.registry_path / "processes"
        if not proc_dir.exists():
            return None
        for f in proc_dir.glob("*.yaml"):
            try:
                data = yaml.safe_load(f.read_text())
                if data.get("process_id") == process_id:
                    return data
            except Exception:
                continue
        return None

    def analyze_process(self, process_id: str) -> Dict:
        """Run conflict + gap analysis on a single process against all others."""
        target = self.get_process(process_id)
        if not target:
            return {"error": f"Process {process_id} not found"}

        all_procs = self._load_all()
        others = [p for p in all_procs if p.get("process_id") != process_id]

        conflicts = self._detect_conflicts(target, others)
        gaps = self._detect_gaps(target)
        agents = self._extract_agents(target)
        playbooks = self._extract_playbooks(target)

        return {
            "process": self._summarise(target),
            "steps": target.get("steps", []),
            "conflicts": conflicts,
            "gaps": gaps,
            "artifacts": {
                "agents": agents,
                "playbooks": playbooks,
            },
        }

    def get_registry_stats(self) -> Dict:
        all_procs = self._load_all()
        statuses = {}
        total_conflicts = 0
        for p in all_procs:
            s = p.get("status", "unknown")
            statuses[s] = statuses.get(s, 0) + 1

        for p in all_procs:
            others = [o for o in all_procs if o.get("process_id") != p.get("process_id")]
            total_conflicts += len(self._detect_conflicts(p, others))

        # deduplicate pairwise conflicts
        total_conflicts = total_conflicts // 2 if total_conflicts > 0 else 0

        return {
            "total": len(all_procs),
            "by_status": statuses,
            "conflict_count": total_conflicts,
        }

    def get_traceability(self) -> List[Dict]:
        """Process → Step → Playbook → Agent traceability matrix."""
        rows = []
        for proc in self._load_all():
            proc_id = proc.get("process_id")
            proc_name = proc.get("name")
            for step in proc.get("steps", []):
                rows.append({
                    "process_id": proc_id,
                    "process_name": proc_name,
                    "step_id": step.get("step_id"),
                    "step_name": step.get("name"),
                    "agent_id": step.get("owner"),
                    "playbook_ref": step.get("playbook_ref"),
                    "action": step.get("action"),
                    "has_condition": step.get("condition") is not None,
                    "depends_on": step.get("depends_on", []),
                })
        return rows

    # -- private helpers --

    def _load_all(self) -> List[Dict]:
        proc_dir = self.registry_path / "processes"
        if not proc_dir.exists():
            return []
        procs = []
        for f in sorted(proc_dir.glob("*.yaml")):
            try:
                procs.append(yaml.safe_load(f.read_text()))
            except Exception:
                continue
        return procs

    def _summarise(self, proc: Dict) -> Dict:
        ownership = proc.get("ownership", {})
        primary = ownership.get("primary_owner", {})
        collaborators = ownership.get("collaborators", [])
        steps = proc.get("steps", [])

        agent_ids = set()
        agent_ids.add(primary.get("agent_id", ""))
        for c in collaborators:
            agent_ids.add(c.get("agent_id", ""))
        agent_ids.discard("")

        playbook_refs = [s.get("playbook_ref") for s in steps if s.get("playbook_ref")]

        return {
            "process_id": proc.get("process_id"),
            "name": proc.get("name"),
            "description": proc.get("description", "").strip(),
            "status": proc.get("status"),
            "trigger_event": proc.get("trigger", {}).get("event"),
            "owner_agent": primary.get("agent", "Unknown"),
            "owner_agent_id": primary.get("agent_id", ""),
            "step_count": len(steps),
            "agent_count": len(agent_ids),
            "agent_ids": sorted(agent_ids),
            "playbook_refs": playbook_refs,
            "deadline": proc.get("constraints", {}).get("deadline", {}).get("duration"),
            "tags": proc.get("metadata", {}).get("tags", []),
            "version": proc.get("version"),
            "created_at": proc.get("created_at"),
        }

    def _detect_conflicts(self, target: Dict, others: List[Dict]) -> List[Dict]:
        conflicts = []
        target_trigger = target.get("trigger", {}).get("event")

        for other in others:
            other_trigger = other.get("trigger", {}).get("event")
            if target_trigger and target_trigger == other_trigger:
                t_outputs = {s.get("outputs", [{}])[0].get("artifact") for s in target.get("steps", []) if s.get("outputs")}
                o_outputs = {s.get("outputs", [{}])[0].get("artifact") for s in other.get("steps", []) if s.get("outputs")}
                overlap = t_outputs & o_outputs
                if overlap:
                    conflicts.append({
                        "type": "output_overlap",
                        "severity": "medium",
                        "processes": [target.get("process_id"), other.get("process_id")],
                        "description": f"Both processes fire on '{target_trigger}' and produce overlapping artifacts: {', '.join(overlap)}",
                        "resolution": "Define priority order or add mutual exclusion conditions.",
                    })

            # ownership overlap: different owners producing same primary artifact
            t_primary = target.get("outputs", {}).get("primary", {}).get("artifact")
            o_primary = other.get("outputs", {}).get("primary", {}).get("artifact")
            t_owner = target.get("ownership", {}).get("primary_owner", {}).get("agent_id")
            o_owner = other.get("ownership", {}).get("primary_owner", {}).get("agent_id")
            if t_primary and t_primary == o_primary and t_owner != o_owner:
                conflicts.append({
                    "type": "ownership_overlap",
                    "severity": "high",
                    "processes": [target.get("process_id"), other.get("process_id")],
                    "description": f"Different owners ({t_owner}, {o_owner}) produce the same primary artifact '{t_primary}'.",
                    "resolution": "Assign single owner or split artifact responsibilities.",
                })

        return conflicts

    def _detect_gaps(self, proc: Dict) -> List[Dict]:
        gaps = []
        steps = proc.get("steps", [])
        step_ids = {s.get("step_id") for s in steps}

        for step in steps:
            deps = step.get("depends_on", [])
            for dep in deps:
                if dep not in step_ids:
                    gaps.append({
                        "severity": "high",
                        "description": f"Step {step.get('step_id')} depends on '{dep}' which does not exist in this process.",
                    })

            if not step.get("playbook_ref"):
                gaps.append({
                    "severity": "low",
                    "description": f"Step {step.get('step_id')} ({step.get('name')}) has no playbook reference.",
                })

        # check for handoff gaps: sequential steps with different owners but no explicit dependency
        for i in range(1, len(steps)):
            prev = steps[i - 1]
            curr = steps[i]
            if prev.get("owner") != curr.get("owner") and not curr.get("depends_on"):
                gaps.append({
                    "severity": "medium",
                    "description": f"Handoff gap: {curr.get('step_id')} ({curr.get('owner')}) follows {prev.get('step_id')} ({prev.get('owner')}) without explicit dependency.",
                })

        return gaps

    def _extract_agents(self, proc: Dict) -> List[Dict]:
        agents = {}
        ownership = proc.get("ownership", {})
        primary = ownership.get("primary_owner", {})
        if primary.get("agent_id"):
            agents[primary["agent_id"]] = {
                "agent_id": primary["agent_id"],
                "agent_name": primary.get("agent", ""),
                "role": primary.get("role", "executor"),
            }
        for c in ownership.get("collaborators", []):
            if c.get("agent_id") and c["agent_id"] not in agents:
                agents[c["agent_id"]] = {
                    "agent_id": c["agent_id"],
                    "agent_name": c.get("agent", ""),
                    "role": c.get("role", "contributor"),
                }
        return list(agents.values())

    def _extract_playbooks(self, proc: Dict) -> List[str]:
        refs = []
        for step in proc.get("steps", []):
            ref = step.get("playbook_ref")
            if ref and ref not in refs:
                refs.append(ref)
        return refs


_instance: Optional[OrchestrationService] = None


def get_orchestration_service() -> OrchestrationService:
    global _instance
    if _instance is None:
        _instance = OrchestrationService()
    return _instance
