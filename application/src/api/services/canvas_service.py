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
            "problem_solution_fit": self._assemble_problem_solution_fit_canvas,
            "architecture_communication": self._assemble_architecture_communication_canvas,
            "execution_map": self._assemble_execution_map_canvas,
            "qbr_tracking": self._assemble_qbr_tracking_canvas,
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
            "Current Tools": str(len(env.get("existing_tools") or [])) + " tools",
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

    # -- Problem-Solution Fit Canvas --

    def _assemble_problem_solution_fit_canvas(self, spec: dict, node_path: Path) -> list[dict[str, Any]]:
        overview = self._load_yaml(node_path / "internal-infohub" / "context" / "node_overview.yaml") or {}
        biz = overview.get("business_context", {})
        stakeholders = self._load_yaml(node_path / "internal-infohub" / "context" / "stakeholder_map.yaml") or {}

        sections: list[dict[str, Any]] = []

        stk_list = stakeholders.get("stakeholders", [])
        segment_items = []
        for s in stk_list[:3]:
            segment_items.append({
                "name": s.get("title", s.get("name", "")),
                "description": f'{s.get("name", "")}, {s.get("title", "")}',
            })
        if not segment_items:
            segment_items = [
                {"name": "IT Decision Makers", "description": "CTO, VP Engineering, Enterprise Architects"},
                {"name": "Line of Business", "description": "VP Operations, Business Unit Leaders"},
                {"name": "End Users", "description": "DevOps Engineers, Platform Teams"},
            ]
        sections.append({
            "id": "customer_segments",
            "label": "Customer Segment(s)",
            "format": "structured",
            "data": {s["name"]: s["description"] for s in segment_items},
        })

        drivers = biz.get("strategic_drivers", [])
        pain_items = []
        for d in drivers[:5]:
            pain_items.append({
                "text": d.get("driver", d.get("description", "")),
                "status": d.get("urgency", "medium"),
                "detail": d.get("description", ""),
            })
        if not pain_items:
            pain_items = [
                {"text": "Manual infrastructure provisioning takes 2-3 weeks per environment", "status": "critical", "detail": "Blocks development velocity"},
                {"text": "No unified observability across hybrid cloud", "status": "high", "detail": "MTTR exceeds SLA targets by 40%"},
                {"text": "Compliance drift detected only during quarterly audits", "status": "high", "detail": "Creates regulatory exposure window"},
                {"text": "Vendor lock-in limits negotiation leverage", "status": "medium", "detail": "3-year contract renewal approaching"},
                {"text": "Shadow IT adoption growing in business units", "status": "medium", "detail": "Security and cost governance gaps"},
            ]
        sections.append({
            "id": "problems_pains",
            "label": "Problems / Pains",
            "format": "list_with_status",
            "data": {"items": pain_items},
        })

        sections.append({
            "id": "triggers_to_act",
            "label": "Triggers to Act",
            "format": "categorized",
            "data": {"items": [
                {"category": "Event", "text": "Board mandate to reduce cloud spend by 20% within 6 months"},
                {"category": "Event", "text": "Failed compliance audit triggered remediation timeline"},
                {"category": "Competitive", "text": "Competitor launched managed platform, customer teams asking for parity"},
                {"category": "Internal", "text": "Key platform engineer resigned, tribal knowledge at risk"},
            ]},
        })

        sections.append({
            "id": "emotions",
            "label": "Emotions",
            "format": "two_column",
            "data": {
                "left_label": "Before",
                "right_label": "After",
                "left_items": ["Frustrated by slow delivery", "Anxious about compliance gaps", "Overwhelmed by tool sprawl"],
                "right_items": ["Confident in platform stability", "In control of cost and compliance", "Focused on innovation, not firefighting"],
            },
        })

        sections.append({
            "id": "customer_limitations",
            "label": "Customer Limitations",
            "format": "categorized",
            "data": {"items": [
                {"category": "Budget", "text": "Capex-constrained, prefers opex model"},
                {"category": "Skills", "text": "Small platform team (4 engineers), limited Kubernetes experience"},
                {"category": "Timeline", "text": "Must show board-level results within current fiscal year"},
                {"category": "Legacy", "text": "Cannot decommission mainframe workloads in phase 1"},
                {"category": "Governance", "text": "Change advisory board meets bi-weekly, slows rollout"},
            ]},
        })

        sections.append({
            "id": "problem_root_cause",
            "label": "Problem Root / Cause",
            "format": "narrative",
            "data": {
                "summary": "Infrastructure was built organically over 8 years without platform strategy. Each team chose its own tooling, creating 14 disconnected deployment pipelines with no shared observability or policy layer. The root cause is not technical debt alone but the absence of a platform operating model.",
                "objective": "Establish unified platform layer",
            },
        })

        biz_case = biz.get("business_case_summary", {})
        solution_text = biz_case.get("proposed_solution", "") if biz_case else ""
        if not solution_text:
            solution_text = "Unified platform layer with automated provisioning (minutes, not weeks), integrated observability across all environments, continuous compliance scanning with drift remediation, and abstraction layer that prevents vendor lock-in while preserving existing investments."
        sections.append({
            "id": "your_solution",
            "label": "Your Solution",
            "format": "narrative",
            "data": {
                "summary": solution_text,
                "objective": "Platform-as-a-Product for internal teams",
            },
        })

        sections.append({
            "id": "available_solutions",
            "label": "Available Solutions",
            "format": "decision_cards",
            "data": {"items": [
                {"id": "DIY", "title": "Build In-House Platform", "category": "option", "status": "considered",
                 "rationale": ["Full control", "No vendor dependency", "Custom fit"],
                 "implications": ["12-18 month build", "Requires 3x current team", "Ongoing maintenance burden"]},
                {"id": "Hyperscaler", "title": "Single Cloud Native (AWS/Azure/GCP)", "category": "option", "status": "eliminated",
                 "rationale": ["Mature tooling", "Large ecosystem", "Managed services"],
                 "implications": ["Deepens vendor lock-in", "Multi-cloud not addressed", "Compliance gaps remain"]},
                {"id": "Proposed", "title": "Vendor Platform + Integration Layer", "category": "option", "status": "recommended",
                 "rationale": ["Fastest time to value", "Multi-cloud ready", "Built-in compliance"],
                 "implications": ["Vendor dependency (mitigated by abstraction)", "Requires change management"]},
            ]},
        })

        sections.append({
            "id": "behavior",
            "label": "Current Behavior",
            "format": "categorized",
            "data": {"items": [
                {"category": "High intensity", "text": "Manual ticket-based provisioning through ServiceNow"},
                {"category": "High intensity", "text": "SSH into production for troubleshooting (no centralized logs)"},
                {"category": "Medium intensity", "text": "Spreadsheet-based compliance tracking updated quarterly"},
                {"category": "Low intensity", "text": "Ad-hoc cost reports pulled monthly from each cloud console"},
            ]},
        })

        return sections

    # -- Architecture Communication Canvas --

    def _assemble_architecture_communication_canvas(self, spec: dict, node_path: Path) -> list[dict[str, Any]]:
        overview = self._load_yaml(node_path / "internal-infohub" / "context" / "node_overview.yaml") or {}
        risks_data = self._load_yaml(node_path / "internal-infohub" / "risks" / "risk_register.yaml") or {}
        stakeholders = self._load_yaml(node_path / "internal-infohub" / "context" / "stakeholder_map.yaml") or {}
        tech = overview.get("technical_context", {})

        sections: list[dict[str, Any]] = []

        biz = overview.get("business_context", {})
        drivers = biz.get("strategic_drivers", [])
        value_items = [d.get("driver", "") for d in drivers[:5]]
        if not value_items:
            value_items = [
                "Reduce infrastructure provisioning from weeks to minutes",
                "Unified observability across hybrid cloud",
                "Continuous compliance with automated remediation",
                "30% reduction in cloud operational costs",
                "Developer self-service without compromising governance",
            ]
        sections.append({
            "id": "value_proposition",
            "label": "Value Proposition",
            "format": "categorized",
            "data": {"items": [{"category": "Business Goal", "text": v} for v in value_items]},
        })

        sections.append({
            "id": "core_functions",
            "label": "Core Functions",
            "format": "categorized",
            "data": {"items": [
                {"category": "Provisioning", "text": "Self-service environment creation with policy guardrails"},
                {"category": "Observability", "text": "Unified metrics, logs, and traces across all workloads"},
                {"category": "Compliance", "text": "Continuous policy scanning with auto-remediation"},
                {"category": "Cost Management", "text": "Real-time spend tracking with budget alerts and optimization"},
                {"category": "Integration", "text": "API gateway for legacy and modern service communication"},
                {"category": "Security", "text": "Zero-trust network policies and secret management"},
            ]},
        })

        sections.append({
            "id": "core_decisions",
            "label": "Core Decisions",
            "format": "decision_cards",
            "data": {"items": [
                {"id": "D1", "title": "Kubernetes as orchestration layer", "category": "architecture", "status": "decided",
                 "rationale": "Industry standard, portable across clouds, large talent pool",
                 "implications": ["Learning curve for operations team", "Need managed K8s service"]},
                {"id": "D2", "title": "Event-driven integration over point-to-point", "category": "architecture", "status": "decided",
                 "rationale": "Decouples services, enables async processing, scales independently",
                 "implications": ["Eventual consistency trade-off", "Message broker becomes critical path"]},
                {"id": "D3", "title": "GitOps for infrastructure management", "category": "operations", "status": "decided",
                 "rationale": "Audit trail, rollback capability, declarative state management",
                 "implications": ["All changes must go through git, no manual cluster modifications"]},
            ]},
        })

        infra = tech.get("current_environment", {}).get("infrastructure", [])
        tech_items = infra[:8] if infra else [
            "Kubernetes (EKS / AKS)", "Terraform", "ArgoCD",
            "Prometheus + Grafana", "Apache Kafka", "PostgreSQL",
            "HashiCorp Vault", "Open Policy Agent",
        ]
        sections.append({
            "id": "technologies",
            "label": "Technologies",
            "format": "categorized",
            "data": {"items": [{"category": "Stack", "text": t} for t in tech_items]},
        })

        stk_list = stakeholders.get("stakeholders", [])
        stk_items = []
        for s in stk_list[:5]:
            stk_items.append({
                "name": s.get("name", ""),
                "title": s.get("title", ""),
                "influence": s.get("role_in_deal", {}).get("influence", ""),
            })
        if not stk_items:
            stk_items = [
                {"name": "Maria Chen", "title": "CTO (Sponsor)", "influence": "high"},
                {"name": "James Wilson", "title": "VP Engineering (Champion)", "influence": "high"},
                {"name": "Sarah Park", "title": "CISO (Gatekeeper)", "influence": "medium"},
                {"name": "David Kim", "title": "Head of Platform (User Buyer)", "influence": "medium"},
            ]
        sections.append({
            "id": "key_stakeholders",
            "label": "Key Stakeholders",
            "format": "stakeholder_cards",
            "data": {"items": stk_items},
        })

        sections.append({
            "id": "quality_requirements",
            "label": "Quality Requirements",
            "format": "categorized",
            "data": {"items": [
                {"category": "Performance", "text": "Environment provisioning < 15 minutes (p95)"},
                {"category": "Reliability", "text": "99.9% platform availability (excl. scheduled maintenance)"},
                {"category": "Scalability", "text": "Support 500 concurrent workloads across 3 cloud regions"},
                {"category": "Security", "text": "SOC 2 Type II and ISO 27001 compliance"},
                {"category": "Usability", "text": "Developer onboarding < 2 hours with self-service portal"},
            ]},
        })

        sections.append({
            "id": "business_context",
            "label": "Business Context",
            "format": "structured",
            "data": {
                "CI/CD Pipeline": "Jenkins (legacy) + GitHub Actions (new)",
                "Identity Provider": "Azure AD / Okta SSO",
                "ITSM": "ServiceNow for change management",
                "Data Platform": "Snowflake + dbt",
                "Monitoring (legacy)": "Nagios + custom scripts",
            },
        })

        sections.append({
            "id": "components_modules",
            "label": "Components / Modules",
            "format": "categorized",
            "data": {"items": [
                {"category": "Core", "text": "Platform Control Plane: cluster lifecycle, tenant management"},
                {"category": "Core", "text": "Service Mesh: mTLS, traffic routing, circuit breaking"},
                {"category": "Data", "text": "Observability Pipeline: collection, correlation, alerting"},
                {"category": "Data", "text": "Event Bus: async messaging, event sourcing, replay"},
                {"category": "Security", "text": "Policy Engine: admission control, runtime enforcement"},
                {"category": "Security", "text": "Secret Manager: rotation, injection, audit logging"},
                {"category": "Portal", "text": "Developer Portal: catalog, docs, self-service workflows"},
                {"category": "Integration", "text": "API Gateway: rate limiting, auth, legacy bridging"},
            ]},
        })

        risks = risks_data.get("risks", [])
        risk_items = []
        for r in risks[:5]:
            risk_items.append({
                "text": r.get("title", ""),
                "status": r.get("severity", "medium"),
                "detail": r.get("description", "")[:120] if r.get("description") else "",
            })
        if not risk_items:
            risk_items = [
                {"text": "Platform team capacity insufficient for parallel cloud migration", "status": "high", "detail": "4 engineers for 3 cloud targets"},
                {"text": "Legacy Nagios integration may require custom exporters", "status": "medium", "detail": "No existing Prometheus exporter for legacy checks"},
                {"text": "Kafka cluster sizing unknown until load testing", "status": "medium", "detail": "Event volume estimates vary 10x between teams"},
                {"text": "Change advisory board cadence may slow rollout", "status": "low", "detail": "Bi-weekly CAB vs. daily deployment target"},
            ]
        sections.append({
            "id": "core_risks",
            "label": "Core Risks & Missing Information",
            "format": "list_with_status",
            "data": {"items": risk_items},
        })

        return sections

    # -- Execution Map Canvas --

    def _assemble_execution_map_canvas(self, spec: dict, node_path: Path) -> list[dict[str, Any]]:
        overview = self._load_yaml(node_path / "internal-infohub" / "context" / "node_overview.yaml") or {}
        timeline_data = overview.get("timeline", {})

        sections: list[dict[str, Any]] = []

        milestones = timeline_data.get("key_milestones", [])
        timeline_items = []
        for m in milestones[:8]:
            timeline_items.append({
                "date": m.get("date", ""),
                "title": m.get("milestone", ""),
                "type": "milestone",
                "owner": m.get("owner", ""),
                "status": m.get("status", ""),
                "blocking": m.get("blocking", False),
            })
        if not timeline_items:
            timeline_items = [
                {"date": "2026-04-14", "title": "Kickoff & environment setup", "type": "milestone", "owner": "SA + Customer IT", "status": "completed", "blocking": False},
                {"date": "2026-04-28", "title": "Core platform deployment (non-prod)", "type": "milestone", "owner": "SA", "status": "in_progress", "blocking": False},
                {"date": "2026-05-12", "title": "Security review & pen test", "type": "milestone", "owner": "CISO Office", "status": "pending", "blocking": True},
                {"date": "2026-05-19", "title": "Integration testing with legacy systems", "type": "milestone", "owner": "Customer Dev Team", "status": "pending", "blocking": False},
                {"date": "2026-05-26", "title": "UAT sign-off", "type": "milestone", "owner": "VP Engineering", "status": "pending", "blocking": True},
                {"date": "2026-06-02", "title": "Production cutover (phase 1)", "type": "milestone", "owner": "Joint Team", "status": "pending", "blocking": False},
                {"date": "2026-06-16", "title": "Post-go-live hypercare complete", "type": "milestone", "owner": "SA + Support", "status": "pending", "blocking": False},
                {"date": "2026-06-30", "title": "Phase 1 retrospective & phase 2 planning", "type": "milestone", "owner": "All", "status": "pending", "blocking": False},
            ]
        sections.append({
            "id": "timeline_milestones",
            "label": "Timeline / Milestones (MAP)",
            "format": "timeline",
            "data": {"items": timeline_items},
        })

        sections.append({
            "id": "workstreams",
            "label": "Workstreams",
            "format": "two_column",
            "data": {
                "left_label": "Customer Responsibilities",
                "right_label": "Vendor Responsibilities",
                "left_items": [
                    "Provide network access and firewall rules by week 1",
                    "Assign 2 engineers for integration testing (weeks 3-5)",
                    "Complete UAT scenarios and sign-off by milestone date",
                    "Schedule change advisory board slot for production cutover",
                    "Designate platform admin for post-go-live operations",
                ],
                "right_items": [
                    "Deploy and configure core platform in customer environment",
                    "Integrate observability pipeline with existing Nagios checks",
                    "Conduct security hardening and provide pen test report",
                    "Deliver admin training (2 sessions) and runbook documentation",
                    "Provide 2-week hypercare support post-go-live",
                ],
            },
        })

        success = overview.get("success_criteria", {})
        poc_criteria = success.get("poc_criteria", {}) if success else {}
        tech_criteria = poc_criteria.get("technical", [])
        biz_criteria = poc_criteria.get("business", [])
        criteria_items = []
        for c in tech_criteria[:5]:
            criteria_items.append({
                "text": c.get("criterion", ""),
                "status": c.get("status", "pending"),
                "detail": f'{c.get("owner", "")} | {c.get("validation", "")}',
            })
        for c in biz_criteria[:3]:
            criteria_items.append({
                "text": c.get("criterion", ""),
                "status": c.get("status", "pending"),
                "detail": f'{c.get("owner", "")} | {c.get("validation", "")}',
            })
        if not criteria_items:
            criteria_items = [
                {"text": "Environment provisioning < 15 min (p95)", "status": "pending", "detail": "SA | Load test with 50 concurrent requests"},
                {"text": "All workloads pass security scan (zero critical)", "status": "pending", "detail": "CISO | Automated scan report"},
                {"text": "Legacy Nagios alerts forwarded to new platform", "status": "in_progress", "detail": "DevOps | Side-by-side comparison for 48 hours"},
                {"text": "Developer self-service portal accessible via SSO", "status": "completed", "detail": "Platform Team | 5 test users onboarded"},
                {"text": "Cost tracking dashboard shows real-time spend", "status": "pending", "detail": "FinOps | Compare with manual report baseline"},
                {"text": "Stakeholder demo: CTO approves UX and workflow", "status": "pending", "detail": "AE + SA | Live demo session"},
                {"text": "Compliance scan covers SOC 2 controls", "status": "pending", "detail": "Compliance | Audit evidence package"},
            ]
        sections.append({
            "id": "success_criteria",
            "label": "Success Criteria",
            "format": "list_with_status",
            "data": {"items": criteria_items},
        })

        sections.append({
            "id": "enablement_handover",
            "label": "Enablement & Handover",
            "format": "categorized",
            "data": {"items": [
                {"category": "Documentation", "text": "Architecture diagrams (as-built) delivered to customer wiki"},
                {"category": "Documentation", "text": "Operational runbooks for day-2 scenarios (scaling, failover, patching)"},
                {"category": "Training", "text": "Admin training completed (2 sessions, recorded)"},
                {"category": "Training", "text": "Developer onboarding guide published in portal"},
                {"category": "Access", "text": "Support portal credentials and escalation path configured"},
                {"category": "Access", "text": "Monitoring dashboards shared with operations team"},
                {"category": "Validation", "text": "Disaster recovery runbook tested (RTO < 4 hours confirmed)"},
                {"category": "Validation", "text": "Handover sign-off from customer platform lead"},
            ]},
        })

        return sections

    # -- QBR Tracking Canvas --

    def _assemble_qbr_tracking_canvas(self, spec: dict, node_path: Path) -> list[dict[str, Any]]:
        sections: list[dict[str, Any]] = []

        sections.append({
            "id": "quarter_scorecard",
            "label": "Quarter Scorecard",
            "format": "structured",
            "data": {
                "Revenue Attainment": "82% ($1.64M / $2.0M) | YELLOW",
                "Pipeline Coverage": "3.2x ($1.15M remaining, $3.68M pipeline) | GREEN",
                "Forecast Accuracy": "78% trailing (last 3 forecasts) | YELLOW",
                "Deal Quality": "Avg MEDDPICC 19.2, 1 stalled, 8% single-threaded | GREEN",
                "Competitive Win Rate": "62% (8 of 13 competitive deals) | GREEN",
                "Account Health": "Avg 71, 0 at-risk accounts | GREEN",
                "Overall Score": "76 / 100 | GREEN",
            },
        })

        sections.append({
            "id": "commitment_tracker",
            "label": "Prior QBR Commitments",
            "format": "list_with_status",
            "data": {"items": [
                {"text": "Close Meridian Health expansion ($340K) by end of Q1", "status": "completed", "detail": "AE | Closed 2026-03-22 at $355K"},
                {"text": "Rebuild pipeline in Financial Services vertical", "status": "completed", "detail": "AE + BDR | 4 new opps added ($820K total)"},
                {"text": "Resolve NovaTech platform stability complaints", "status": "completed", "detail": "SA + Support | Root cause fixed, health score 58 → 74"},
                {"text": "Develop executive relationship at Apex Manufacturing", "status": "in_progress", "detail": "AE | CTO meeting scheduled 2026-04-18"},
                {"text": "Complete competitive battlecard for CloudRival product launch", "status": "in_progress", "detail": "CI Agent | Draft ready, pending field validation"},
                {"text": "Increase MEDDPICC coverage to 100% for commit deals", "status": "completed", "detail": "AE | All 6 commit deals scored"},
            ]},
        })

        sections.append({
            "id": "portfolio_health",
            "label": "Portfolio Health",
            "format": "table",
            "data": {
                "columns": ["Account", "Health", "Trend", "Pipeline", "Coverage", "Key Risk"],
                "items": [
                    {"Account": "Meridian Health", "Health": "82", "Trend": "Improving", "Pipeline": "$580K", "Coverage": "3.1x", "Key Risk": "Budget cycle alignment"},
                    {"Account": "TechFlow Systems", "Health": "78", "Trend": "Stable", "Pipeline": "$1.2M", "Coverage": "4.0x", "Key Risk": "Competitor POC in progress"},
                    {"Account": "NovaTech Industries", "Health": "74", "Trend": "Improving", "Pipeline": "$420K", "Coverage": "2.8x", "Key Risk": "Platform trust recovery"},
                    {"Account": "Apex Manufacturing", "Health": "68", "Trend": "Stable", "Pipeline": "$650K", "Coverage": "2.2x", "Key Risk": "Single-threaded (VP Eng only)"},
                    {"Account": "DataStream Analytics", "Health": "71", "Trend": "Declining", "Pipeline": "$380K", "Coverage": "1.9x", "Key Risk": "Champion moved to new role"},
                    {"Account": "Pinnacle Finance", "Health": "65", "Trend": "Stable", "Pipeline": "$450K", "Coverage": "2.5x", "Key Risk": "Procurement timeline unclear"},
                ],
            },
        })

        sections.append({
            "id": "signals_risks",
            "label": "Signals & Risks",
            "format": "list_with_status",
            "data": {"items": [
                {"text": "CloudRival launched competing product at 20% lower price point", "status": "high", "detail": "Competitive | Affects 3 active deals | Update positioning"},
                {"text": "DataStream Analytics champion (VP Data) moved to different BU", "status": "high", "detail": "Account Health | Re-map buying center, identify new champion"},
                {"text": "Pinnacle Finance procurement freeze through end of April", "status": "medium", "detail": "Pipeline Risk | Delay Q2 close, adjust forecast"},
                {"text": "Apex Manufacturing CTO requested security whitepaper before expansion", "status": "medium", "detail": "Pipeline Risk | SA to prepare, target 2026-04-15"},
                {"text": "TechFlow competitor POC entering week 3, no decision timeline shared", "status": "medium", "detail": "Competitive | Request debrief meeting with champion"},
            ]},
        })

        sections.append({
            "id": "qbr_readiness",
            "label": "QBR Readiness",
            "format": "list_with_status",
            "data": {"items": [
                {"text": "Pipeline snapshot current (< 7 days old)", "status": "completed", "detail": "Updated 2026-04-04"},
                {"text": "Revenue targets defined for current quarter", "status": "completed", "detail": "$2.0M target confirmed"},
                {"text": "MEDDPICC assessments complete for commit deals", "status": "completed", "detail": "6/6 scored, avg 19.2"},
                {"text": "Health scores updated for all realms", "status": "completed", "detail": "All 6 accounts refreshed this week"},
                {"text": "Competitive encounters documented", "status": "in_progress", "detail": "CloudRival launch analysis pending"},
                {"text": "Prior QBR action items status updated", "status": "completed", "detail": "4/6 completed, 2 in progress"},
                {"text": "Win/loss retrospectives captured", "status": "completed", "detail": "2 wins, 1 loss documented"},
                {"text": "Pre-QBR sync with SA/CA/CI/VE agents completed", "status": "pending", "detail": "Scheduled 2026-04-10"},
                {"text": "Narrative drafted for key topics", "status": "pending", "detail": "Due 2026-04-12"},
            ]},
        })

        return sections

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
                "problem_solution_fit", "architecture_communication",
                "execution_map", "qbr_tracking",
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
