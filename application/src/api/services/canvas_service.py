"""
Canvas Service for EA Agentic Lab API
Reads canvas specs and assembles structured data from vault for frontend rendering.
"""
import re
from pathlib import Path
from typing import Any, Optional
from functools import lru_cache

import yaml

from ..config import get_settings


class CanvasService:

    def __init__(self, vault_path: Path, domain_path: Path):
        self.vault_path = vault_path
        self.domain_path = domain_path
        self.specs_path = domain_path / "playbooks" / "canvas" / "specs"

    def get_canvas_data(self, realm_id: str, node_id: str, canvas_id: str) -> Optional[dict[str, Any]]:
        if ".." in realm_id or "/" in realm_id or ".." in node_id or "/" in node_id:
            return None

        spec = self._load_spec(canvas_id)
        if not spec:
            return None

        node_path = self._resolve_node_path(realm_id, node_id)
        if not node_path:
            return None

        metadata = self._build_metadata(node_path, realm_id)
        layout = spec.get("layout", {})

        assembler = self._get_assembler(canvas_id)
        sections = assembler(spec, node_path)

        return {
            "canvas_id": canvas_id,
            "name": spec.get("name", canvas_id),
            "description": spec.get("description", ""),
            "metadata": metadata,
            "layout": layout,
            "sections": sections,
        }

    def list_available(self, realm_id: str, node_id: str) -> list[dict[str, str]]:
        node_path = self._resolve_node_path(realm_id, node_id)
        if not node_path:
            return []
        bp = self._load_yaml(node_path / "blueprint.yaml")
        if not bp:
            return []
        canvases = bp.get("canvases", {}).get("required", [])
        return [
            {"canvas_id": str(c.get("canvas_id", "")), "status": str(c.get("status", "unknown"))}
            for c in canvases
        ]

    # -- spec loading --

    def _normalize_canvas_id(self, canvas_id: str) -> str:
        """Blueprint uses e.g. 'value_stakeholders_canvas' but specs are 'value_stakeholders'.
        Try exact match first, then strip '_canvas' suffix."""
        spec_file = self.specs_path / f"{canvas_id}.yaml"
        if spec_file.is_file():
            return canvas_id
        stripped = canvas_id.removesuffix("_canvas")
        if stripped != canvas_id and (self.specs_path / f"{stripped}.yaml").is_file():
            return stripped
        return canvas_id

    def _load_spec(self, canvas_id: str) -> Optional[dict[str, Any]]:
        normalized = self._normalize_canvas_id(canvas_id)
        spec_file = self.specs_path / f"{normalized}.yaml"
        return self._load_yaml(spec_file)

    # -- assembler dispatch --

    def _get_assembler(self, canvas_id: str):
        normalized = self._normalize_canvas_id(canvas_id)
        assemblers = {
            "context_canvas": self._assemble_context_canvas,
            "decision_canvas": self._assemble_decision_canvas,
            "risk_governance": self._assemble_risk_governance_canvas,
            "value_stakeholders": self._assemble_value_stakeholders_canvas,
            "architecture_decision": self._assemble_architecture_decision_canvas,
        }
        return assemblers.get(normalized, self._assemble_generic)

    # -- Context Canvas --

    def _assemble_context_canvas(self, spec: dict, node_path: Path) -> list[dict[str, Any]]:
        overview = self._load_yaml(node_path / "internal-infohub" / "context" / "node_overview.yaml") or {}
        biz = overview.get("business_context", {})
        tech = overview.get("technical_context", {})
        timeline_data = overview.get("timeline", {})
        success = overview.get("success_criteria", {})

        sections: list[dict[str, Any]] = []

        sections.append({
            "id": "engagement_overview",
            "label": "Engagement Overview",
            "format": "narrative",
            "data": {
                "summary": biz.get("background", ""),
                "objective": biz.get("initiative_name", ""),
                "initiative_type": biz.get("initiative_type", ""),
            },
        })

        sections.append({
            "id": "customer_context",
            "label": "Customer Context",
            "format": "structured",
            "data": self._extract_customer_context(node_path, tech),
        })

        drivers = biz.get("strategic_drivers", [])
        in_scope = [d.get("driver", "") for d in drivers if d.get("urgency") in ("critical", "high")]
        biz_case = biz.get("business_case_summary", {})
        out_of_scope = []
        if biz_case:
            out_of_scope = [
                f"Current spend: {biz_case.get('current_spend', 'N/A')}",
                f"Projected savings: {biz_case.get('projected_savings', 'N/A')}",
                f"ROI target: {biz_case.get('roi_target', 'N/A')}",
            ]
        sections.append({
            "id": "boundaries",
            "label": "Boundaries & Scope",
            "format": "two_column",
            "data": {
                "left_label": "Strategic Drivers",
                "right_label": "Business Case",
                "left_items": in_scope,
                "right_items": out_of_scope,
            },
        })

        milestones = timeline_data.get("key_milestones", [])
        phases = timeline_data.get("phases", [])
        timeline_items = []
        for m in milestones:
            timeline_items.append({
                "date": m.get("date", ""),
                "title": m.get("milestone", ""),
                "type": "milestone",
                "owner": m.get("owner", ""),
                "status": m.get("status", ""),
                "blocking": m.get("blocking", False),
            })
        for p in phases:
            timeline_items.append({
                "date": p.get("start", ""),
                "title": p.get("phase", ""),
                "type": "phase",
                "status": p.get("status", ""),
            })
        timeline_items.sort(key=lambda x: x.get("date", ""))
        sections.append({
            "id": "key_dates",
            "label": "Key Dates & Milestones",
            "format": "timeline",
            "data": {"items": timeline_items},
        })

        infra = tech.get("current_environment", {}).get("infrastructure", [])
        target = tech.get("target_environment", {})
        constraints = []
        for item in infra:
            constraints.append({"category": "Technical", "text": item})
        if target:
            for req in target.get("integration_requirements", []):
                constraints.append({"category": "Integration", "text": req})
        sections.append({
            "id": "constraints",
            "label": "Constraints & Dependencies",
            "format": "categorized",
            "data": {"items": constraints},
        })

        insights = overview.get("key_insights", {})
        exec_statements = insights.get("executive_statements", [])
        assumptions = []
        for stmt in exec_statements:
            assumptions.append({
                "text": f'{stmt.get("stakeholder", "")}: "{stmt.get("quote", "")}"',
                "status": "validated",
                "detail": stmt.get("implication", ""),
            })
        sections.append({
            "id": "assumptions",
            "label": "Key Assumptions & Insights",
            "format": "list_with_status",
            "data": {"items": assumptions},
        })

        poc_criteria = success.get("poc_criteria", {})
        tech_criteria = poc_criteria.get("technical", [])
        biz_criteria = poc_criteria.get("business", [])
        success_items = []
        for c in tech_criteria[:3]:
            success_items.append({
                "outcome": c.get("criterion", ""),
                "measure": c.get("validation", ""),
                "owner": c.get("owner", ""),
            })
        for c in biz_criteria[:2]:
            success_items.append({
                "outcome": c.get("criterion", ""),
                "measure": c.get("validation", ""),
                "owner": c.get("owner", ""),
            })
        sections.append({
            "id": "success_definition",
            "label": "Definition of Success",
            "format": "outcome_based",
            "data": {"items": success_items},
        })

        return sections

    def _extract_customer_context(self, node_path: Path, tech: dict) -> dict[str, str]:
        realm_profile = self._load_yaml(node_path.parent / "realm_profile.yaml") or {}
        node_profile = self._load_yaml(node_path / "node_profile.yaml") or {}

        env = tech.get("current_environment", {})
        target = tech.get("target_environment", {})

        return {
            "Company": realm_profile.get("realm_name", ""),
            "Industry": realm_profile.get("classification", {}).get("segment", ""),
            "Region": realm_profile.get("classification", {}).get("region", ""),
            "Current Tools": str(len(env.get("existing_tools", {}).get("acme", []))
                                 + len(env.get("existing_tools", {}).get("industrietechnik", []))) + " tools",
            "Target Coverage": target.get("coverage_target", ""),
            "Stage": node_profile.get("commercial", {}).get("stage", ""),
        }

    # -- Decision Canvas --

    def _assemble_decision_canvas(self, spec: dict, node_path: Path) -> list[dict[str, Any]]:
        log = self._load_yaml(node_path / "internal-infohub" / "decisions" / "decision_log.yaml") or {}
        decisions = log.get("decisions", [])
        pending_customer = log.get("pending_customer", [])

        active = [d for d in decisions if d.get("status") not in ("superseded", "rejected")]
        key_decisions = active[:5]
        history = [d for d in decisions if d.get("status") in ("superseded", "implemented")]

        sections: list[dict[str, Any]] = []

        decision_cards = []
        for d in key_decisions:
            decision_cards.append({
                "id": d.get("decision_id", ""),
                "title": d.get("title", ""),
                "category": d.get("category", ""),
                "status": d.get("status", ""),
                "date": d.get("date", ""),
                "decision_maker": d.get("decision_maker", ""),
                "rationale": d.get("rationale", ""),
                "implications": d.get("implications", []),
            })
        sections.append({
            "id": "key_decisions",
            "label": "Key Decisions",
            "format": "decision_cards",
            "data": {"items": decision_cards, "summary": log.get("summary", {})},
        })

        open_questions = []
        for p in pending_customer:
            open_questions.append({
                "question": p.get("title", ""),
                "description": p.get("description", ""),
                "owner": p.get("decision_maker", ""),
                "target_date": p.get("target_date", ""),
                "blocking": p.get("blocking", False),
            })
        sections.append({
            "id": "open_questions",
            "label": "Open Questions & Pending Customer Decisions",
            "format": "list_with_status",
            "data": {"items": [
                {
                    "text": q["question"],
                    "status": "blocking" if q.get("blocking") else "pending",
                    "detail": f'{q.get("owner", "")} by {q.get("target_date", "")}',
                }
                for q in open_questions
            ]},
        })

        history_items = []
        for d in history:
            history_items.append({
                "date": d.get("date", ""),
                "title": d.get("title", ""),
                "type": d.get("status", ""),
                "owner": d.get("decision_maker", ""),
                "status": d.get("status", ""),
            })
        sections.append({
            "id": "decision_history",
            "label": "Decision History",
            "format": "timeline",
            "data": {"items": history_items},
        })

        pending = [d for d in decisions if d.get("status") == "pending_approval"]
        if pending:
            sections.append({
                "id": "pending_approvals",
                "label": "Pending Approvals",
                "format": "decision_cards",
                "data": {"items": [
                    {
                        "id": d.get("decision_id", ""),
                        "title": d.get("title", ""),
                        "category": d.get("category", ""),
                        "status": "pending_approval",
                        "date": d.get("date", ""),
                        "decision_maker": d.get("decision_maker", ""),
                        "rationale": d.get("rationale", ""),
                        "implications": d.get("implications", []),
                    }
                    for d in pending
                ]},
            })

        return sections

    # -- Risk Governance Canvas --

    def _assemble_risk_governance_canvas(self, spec: dict, node_path: Path) -> list[dict[str, Any]]:
        register = self._load_yaml(node_path / "internal-infohub" / "risks" / "risk_register.yaml") or {}
        stakeholders = self._load_yaml(node_path / "internal-infohub" / "context" / "stakeholder_map.yaml") or {}

        risks = register.get("risks", [])
        sections: list[dict[str, Any]] = []

        risk_rows = []
        for r in risks[:8]:
            mitigation = r.get("mitigation", {})
            risk_rows.append({
                "id": r.get("risk_id", ""),
                "title": r.get("title", ""),
                "category": r.get("category", ""),
                "severity": r.get("severity", ""),
                "probability": r.get("probability", ""),
                "impact": r.get("impact", ""),
                "owner": r.get("owner", ""),
                "status": r.get("status", ""),
                "mitigation_strategy": mitigation.get("strategy", ""),
                "mitigation_progress": mitigation.get("progress", 0),
            })
        sections.append({
            "id": "risk_register",
            "label": "Risk Register",
            "format": "table",
            "data": {
                "items": risk_rows,
                "summary": register.get("summary", {}),
                "columns": ["Title", "Category", "Severity", "Probability", "Status", "Mitigation"],
            },
        })

        buying_center = stakeholders.get("buying_center", {})
        raci_items = []
        for role, info in buying_center.items():
            if isinstance(info, dict):
                raci_items.append({
                    "role": role.replace("_", " ").title(),
                    "name": info.get("name", ""),
                    "title": info.get("title", ""),
                    "authority": info.get("authority", ""),
                    "sentiment": info.get("sentiment", ""),
                })
        sections.append({
            "id": "raci_matrix",
            "label": "RACI / Buying Center",
            "format": "structured",
            "data": {k: v.get("name", "") + " - " + v.get("authority", "")
                     for k, v in buying_center.items() if isinstance(v, dict)},
        })

        sections.append({
            "id": "cadence",
            "label": "Review Cadence",
            "format": "categorized",
            "data": {"items": [
                {"category": "Weekly", "text": "Technical sync: task tracking, blocker resolution"},
                {"category": "Bi-weekly", "text": "Exec sync: progress, risks, decisions"},
                {"category": "As needed", "text": "Steering: strategic blockers, escalations"},
            ]},
        })

        return sections

    # -- Value & Stakeholders Canvas --

    def _assemble_value_stakeholders_canvas(self, spec: dict, node_path: Path) -> list[dict[str, Any]]:
        stakeholders = self._load_yaml(node_path / "internal-infohub" / "context" / "stakeholder_map.yaml") or {}
        overview = self._load_yaml(node_path / "internal-infohub" / "context" / "node_overview.yaml") or {}

        sections: list[dict[str, Any]] = []

        stk_list = stakeholders.get("stakeholders", [])
        stk_items = []
        for s in stk_list:
            role_info = s.get("role_in_deal", {})
            stk_items.append({
                "name": s.get("name", ""),
                "title": s.get("title", ""),
                "stance": s.get("stance", ""),
                "role_type": role_info.get("type", ""),
                "influence": role_info.get("influence", ""),
            })
        sections.append({
            "id": "stakeholder_map",
            "label": "Stakeholder Map",
            "format": "stakeholder_cards",
            "data": {"items": stk_items, "summary": stakeholders.get("summary", {})},
        })

        biz = overview.get("business_context", {})
        drivers = biz.get("strategic_drivers", [])
        value_items = []
        for d in drivers:
            value_items.append({
                "outcome": d.get("driver", ""),
                "measure": d.get("description", ""),
                "owner": d.get("urgency", ""),
            })
        sections.append({
            "id": "value_hypotheses",
            "label": "Value Hypotheses",
            "format": "outcome_based",
            "data": {"items": value_items},
        })

        biz_case = biz.get("business_case_summary", {})
        sections.append({
            "id": "success_metrics",
            "label": "Success Metrics",
            "format": "structured",
            "data": biz_case if biz_case else {},
        })

        return sections

    # -- Architecture Decision Canvas --

    def _assemble_architecture_decision_canvas(self, _spec: dict, node_path: Path) -> list[dict[str, Any]]:
        adr_content, adr_meta = self._load_adr(node_path)
        stakeholders = self._load_yaml(node_path / "internal-infohub" / "context" / "stakeholder_map.yaml") or {}
        risks_data = self._load_yaml(node_path / "internal-infohub" / "risks" / "risk_register.yaml") or {}

        sections: list[dict[str, Any]] = []

        # Problem & Context
        context_text = self._extract_md_section(adr_content, "Context")
        sections.append({
            "id": "problem_context",
            "label": "Problem & Context",
            "format": "narrative",
            "data": {
                "summary": context_text,
                "objective": adr_meta.get("title", ""),
            },
        })

        # Risks if not decided
        related_risks = risks_data.get("risks", [])[:5]
        sections.append({
            "id": "risks_if_not_decided",
            "label": "Risks if Not Decided",
            "format": "list_with_status",
            "data": {"items": [
                {
                    "text": r.get("title", ""),
                    "status": r.get("severity", ""),
                    "detail": r.get("description", "")[:120],
                }
                for r in related_risks
            ]},
        })

        # Deciders / Consulted / Affected
        decision_makers = adr_meta.get("decision_makers", [])
        stk_list = stakeholders.get("stakeholders", [])

        deciders = [{"name": dm, "role": "Decision Maker"} for dm in decision_makers]
        consulted = []
        affected = []
        for s in stk_list:
            role_info = s.get("role_in_deal", {})
            role_type = role_info.get("type", "")
            if role_type in ("technical_decision_maker", "user_buyer"):
                consulted.append({"name": s.get("name", ""), "role": s.get("title", "")})
            elif role_type not in ("economic_buyer",):
                affected.append({"name": s.get("name", ""), "role": s.get("title", "")})

        sections.append({
            "id": "people",
            "label": "People Involved",
            "format": "structured",
            "data": {
                "Deciders": ", ".join(d["name"] for d in deciders) or "TBD",
                "Consulted": ", ".join(c["name"] for c in consulted) or "TBD",
                "Affected": ", ".join(a["name"] for a in affected) or "TBD",
                "Context Owner": adr_meta.get("context_owner", ""),
            },
        })

        # Options Considered
        options_text = self._extract_md_section(adr_content, "Options Considered")
        option_blocks = re.split(r"###\s+Option\s+", options_text)
        option_items = []
        for block in option_blocks:
            block = block.strip()
            if not block:
                continue
            lines = block.split("\n")
            title_line = lines[0].strip()
            pros = []
            cons = []
            current_list = None
            for line in lines[1:]:
                stripped = line.strip()
                if stripped.startswith("**Pros**"):
                    current_list = pros
                elif stripped.startswith("**Cons**"):
                    current_list = cons
                elif stripped.startswith("**Cost**"):
                    current_list = None
                elif stripped.startswith("- ") and current_list is not None:
                    current_list.append(stripped[2:])
                elif stripped.startswith("**Status**") and "ELIMINATED" in stripped:
                    title_line += " [ELIMINATED]"
            option_items.append({
                "id": title_line.split(":")[0].strip() if ":" in title_line else title_line[:10],
                "title": title_line,
                "category": "option",
                "status": "eliminated" if "ELIMINATED" in title_line else "considered",
                "rationale": pros[:3] if pros else [],
                "implications": cons[:3] if cons else [],
            })
        sections.append({
            "id": "considered_options",
            "label": "Considered Options",
            "format": "decision_cards",
            "data": {"items": option_items},
        })

        # Decision Drivers
        drivers_text = self._extract_md_section(adr_content, "Decision Drivers")
        driver_rows = re.findall(r"\|\s*(.+?)\s*\|\s*(\w+)\s*\|\s*(.+?)\s*\|", drivers_text)
        driver_items = [
            {"category": weight.strip(), "text": f"{name.strip()}: {desc.strip()}"}
            for name, weight, desc in driver_rows
            if name.strip() != "Driver"
        ]
        sections.append({
            "id": "quality_goals",
            "label": "Decision Drivers",
            "format": "categorized",
            "data": {"items": driver_items} if driver_items else {"items": []},
        })

        # Decision Outcome
        recommendation = self._extract_md_section(adr_content, "Recommendation")
        decision_status = self._extract_md_section(adr_content, "Decision")
        sections.append({
            "id": "decision_outcome",
            "label": "Decision Outcome",
            "format": "narrative",
            "data": {
                "summary": recommendation or decision_status or "Pending",
                "objective": f"Status: {adr_meta.get('status', 'unknown').upper()}",
            },
        })

        # Consequences
        consequences_text = self._extract_md_section(adr_content, "Consequences")
        consequence_blocks = re.split(r"###\s+", consequences_text)
        consequence_items = []
        for block in consequence_blocks:
            block = block.strip()
            if not block:
                continue
            lines = block.split("\n")
            heading = lines[0].strip()
            for line in lines[1:]:
                stripped = line.strip()
                if stripped.startswith("- "):
                    consequence_items.append({
                        "text": stripped[2:],
                        "status": "positive" if "Selected" in heading else "negative",
                        "detail": heading,
                    })
        sections.append({
            "id": "consequences",
            "label": "Consequences",
            "format": "list_with_status",
            "data": {"items": consequence_items},
        })

        return sections

    def _load_adr(self, node_path: Path) -> tuple[str, dict[str, Any]]:
        """Find and load the first ADR markdown file with YAML frontmatter."""
        arch_dir = node_path / "external-infohub" / "architecture"
        if not arch_dir.is_dir():
            return "", {}
        for md_file in sorted(arch_dir.glob("ADR_*.md")):
            try:
                raw = md_file.read_text(encoding="utf-8")
            except Exception:
                continue
            meta: dict[str, Any] = {}
            content = raw
            if raw.startswith("---"):
                parts = raw.split("---", 2)
                if len(parts) >= 3:
                    try:
                        meta = yaml.safe_load(parts[1]) or {}
                    except Exception:
                        pass
                    content = parts[2]
            return content, meta
        return "", {}

    def _extract_md_section(self, content: str, heading: str) -> str:
        """Extract text under a ## heading until the next ## heading."""
        pattern = rf"^##\s+{re.escape(heading)}.*?\n(.*?)(?=^##\s|\Z)"
        match = re.search(pattern, content, re.MULTILINE | re.DOTALL)
        return match.group(1).strip() if match else ""

    # -- Generic fallback --

    def _assemble_generic(self, spec: dict, node_path: Path) -> list[dict[str, Any]]:
        sections_spec = spec.get("sections", {})
        sections: list[dict[str, Any]] = []
        for section_id, section_def in sections_spec.items():
            sections.append({
                "id": section_id,
                "label": section_def.get("label", section_id),
                "format": section_def.get("format", "default"),
                "data": {},
            })
        return sections

    # -- metadata --

    def _build_metadata(self, node_path: Path, realm_id: str) -> dict[str, str]:
        node_profile = self._load_yaml(node_path / "node_profile.yaml") or {}
        realm_profile = self._load_yaml(node_path.parent / "realm_profile.yaml") or {}
        return {
            "node_name": node_profile.get("name", node_path.name),
            "realm_name": realm_profile.get("realm_name", realm_id),
            "stage": node_profile.get("commercial", {}).get("stage", ""),
            "status": node_profile.get("status", ""),
            "last_updated": node_profile.get("created", ""),
        }

    # -- helpers --

    def _resolve_node_path(self, realm_id: str, node_id: str) -> Optional[Path]:
        for realm_dir in self.vault_path.iterdir():
            if not realm_dir.is_dir():
                continue
            profile = self._load_yaml(realm_dir / "realm_profile.yaml")
            if profile and profile.get("realm_id", "").upper() == realm_id.upper():
                node_path = realm_dir / node_id
                if node_path.exists():
                    resolved = node_path.resolve()
                    if resolved.is_relative_to(self.vault_path.resolve()):
                        return node_path
            if realm_dir.name.upper() == realm_id.upper():
                node_path = realm_dir / node_id
                if node_path.exists():
                    resolved = node_path.resolve()
                    if resolved.is_relative_to(self.vault_path.resolve()):
                        return node_path
        return None

    def _load_yaml(self, file_path: Path) -> Optional[dict[str, Any]]:
        if not file_path.is_file():
            return None
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception:
            return None


    # -- catalog --

    def get_catalog(self) -> list[dict[str, Any]]:
        registry = self._load_yaml(self.domain_path / "playbooks" / "canvas" / "registry.yaml")
        if not registry:
            return []

        canvases_map = registry.get("canvases", {})
        catalog = []

        for canvas_id, entry in canvases_map.items():
            spec = self._load_spec(canvas_id)
            section_names = []
            section_formats = []
            if spec:
                for sid, sdef in spec.get("sections", {}).items():
                    section_names.append(sdef.get("label", sid))
                    fmt = sdef.get("format", "default")
                    if fmt not in section_formats:
                        section_formats.append(fmt)

            has_assembler = canvas_id in {
                "context_canvas", "decision_canvas", "risk_governance",
                "value_stakeholders", "architecture_decision",
            }

            catalog.append({
                "canvas_id": canvas_id,
                "name": entry.get("name", canvas_id),
                "description": spec.get("description", entry.get("use_case", "")) if spec else entry.get("use_case", ""),
                "status": entry.get("status", "unknown"),
                "owner": entry.get("owner", ""),
                "use_case": entry.get("use_case", ""),
                "priority": entry.get("priority", "medium"),
                "cadence": entry.get("cadence", ""),
                "output": entry.get("output", ""),
                "core_canvas": entry.get("core_canvas", False),
                "required_by": entry.get("required_by", []),
                "has_spec": spec is not None,
                "has_assembler": has_assembler,
                "sections": section_names,
                "section_formats": section_formats,
                "section_count": len(section_names),
                "layout": spec.get("layout", {}).get("grid", "") if spec else "",
            })

        return catalog


@lru_cache
def get_canvas_service() -> CanvasService:
    settings = get_settings()
    return CanvasService(settings.vault_path, settings.domain_path)
