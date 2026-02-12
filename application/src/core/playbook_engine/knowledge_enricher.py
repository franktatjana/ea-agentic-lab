"""Knowledge Vault context enrichment for playbook execution.

Pulls relevant knowledge items from the Global Knowledge Vault
and injects them into the execution context so agents receive
richer inputs without any code changes to their process() methods.
"""

from typing import Any, Dict, List

from ...api.services.knowledge_service import get_knowledge_service


def enrich_context_with_knowledge(
    context: Dict[str, Any],
    playbook: Dict[str, Any],
    max_items: int = 10,
) -> Dict[str, Any]:
    """Enrich execution context with relevant Knowledge Vault items.

    Reads the node's blueprint classification from context to determine
    domain, archetype, and phase, then fetches matching knowledge items.

    Args:
        context: The InfoHub execution context dict
        playbook: The loaded playbook dict (for agent role)
        max_items: Maximum knowledge items to inject

    Returns:
        The context dict with knowledge_context added
    """
    blueprint = context.get("blueprint", {})
    if not isinstance(blueprint, dict):
        blueprint = {}

    domain = blueprint.get("domain", "general")
    archetype = blueprint.get("archetype", "all")

    operating_mode = context.get("operating_mode", "")
    phase = _mode_to_phase(operating_mode) if operating_mode else "all"

    agent_role = playbook.get("intended_agent_role", "")
    agent_role_key = _normalize_role(agent_role)

    try:
        svc = get_knowledge_service()
        items = svc.get_relevant_knowledge(
            domain=domain,
            archetype=archetype,
            phase=phase,
            agent_role=agent_role_key,
            max_items=max_items,
        )
    except Exception:
        items = []

    context["knowledge_context"] = {
        "items": [
            {
                "id": item.id,
                "title": item.title,
                "type": item.type,
                "category": item.category,
                "domain": item.domain,
                "content_summary": item.content[:200] if item.content else "",
                "full_content": item.content,
                "confidence": item.confidence,
                "tags": item.tags,
            }
            for item in items
        ],
        "query_context": {
            "domain": domain,
            "archetype": archetype,
            "phase": phase,
            "agent_role": agent_role_key,
            "items_found": len(items),
        },
    }

    return context


def _mode_to_phase(operating_mode: str) -> str:
    """Map operating_mode values to knowledge phase values."""
    mapping = {
        "pre_sales": "pre_sales",
        "implementation": "implementation",
        "post_sales": "post_sales",
        "renewal": "post_sales",
    }
    return mapping.get(operating_mode, "all")


def _normalize_role(role: str) -> str:
    """Normalize agent role string to match knowledge item relevance tags."""
    if not role:
        return ""
    lower = role.lower().replace(" ", "_")
    aliases = {
        "account_executive": "account_executive",
        "ae": "account_executive",
        "solution_architect": "solution_architect",
        "sa": "solution_architect",
        "customer_architect": "customer_architect",
        "ca": "customer_architect",
    }
    return aliases.get(lower, lower)
