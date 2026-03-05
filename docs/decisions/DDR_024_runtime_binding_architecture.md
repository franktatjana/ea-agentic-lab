# DDR-024: Runtime Binding Architecture

**Status:** ACCEPTED
**Date:** 2026-03-05
**Version:** 1.0
**Category:** Domain Decision Record
**Extends:** DDR-019 (domain model, tool layer), DDR-023 (prompt data dependencies)

---

## Context

Agent definitions correctly separate contract (what the agent needs) from topology (where services live). Every agent declares `a2a.agent_url: null`, every ClientTool has no `base_url`, and every invoke-* tool omits its target endpoint. The spec is structurally ready for runtime wiring but lacks two things: a declaration on each tool telling the platform which resolution strategy to use, and configuration templates that map tool IDs to actual service endpoints.

| Gap | Evidence |
|-----|----------|
| No resolution strategy on tools | 192 ClientTool declarations across 47 agents, zero `resolver:` fields. Platform has no structured way to determine how to bind a tool at deployment |
| No tool-to-connector mapping | `connectors.yaml` defines data source connections but nothing links `read-crm-data` to the CRM connector or `invoke-rfp-agent` to the RFP agent's endpoint |
| No service registry for agents | `a2a.agent_url: null` on all agents, no configuration file mapping agent IDs to deployment endpoints |
| $component_ref unresolved at runtime | 33 `$component_ref` references in specialized agent variants need compile-time resolution rules |
| Mock binding undocumented | Development mock pattern exists implicitly but has no formal binding configuration |

The framework already separates concerns at other layers: DDR-023 made prompt-to-tool data contracts explicit, DDR-019 established the domain model layers. Runtime binding follows the same pattern, making the tool-to-service relationship explicit and declarative.

---

## Decision

Introduce a three-resolver model where each tool declares its resolution strategy and two configuration templates provide the binding layer.

### 1. Resolver Types

| Resolver | Applies to | Resolution source |
|----------|-----------|-------------------|
| `service-registry` | Data access and persistence tools (read-*, write-*, save-*, scan-*, get-*) | `config/tool_resolver.yaml` |
| `agent-registry` | Agent routing tools (invoke-*) and a2a.agent_url | `config/service_registry.yaml` |
| `inline` | Platform-intrinsic tools (ask-user) | None, handled by platform runtime |

### 2. Contract vs Binding Separation

The agent definition YAML declares the **contract**: what the tool does, what data it needs, its risk level, and which resolver strategy applies. The configuration templates provide the **binding**: where the service lives, what credentials to use, which mode to operate in.

This separation means the same agent definition deploys across mock, development, staging, and production without modification. Only the active configuration profile changes.

### 3. Tool Declaration

Every ClientTool's `x-ea-agent` block gains a `resolver` field:

```yaml
tools:
- id: read-crm-data
  component_type: ClientTool
  description: Access CRM opportunity data
  x-ea-agent:
    risk: low
    resolver: service-registry
    error_responses:
    - type: no_data
      signal: SIG_CRM_UNAVAILABLE

- id: invoke-rfp-agent
  component_type: ClientTool
  description: Route to RFP response agent
  x-ea-agent:
    risk: low
    resolver: agent-registry

- id: ask-user
  component_type: ClientTool
  description: Request human input
  x-ea-agent:
    risk: low
    resolver: inline
```

### 4. Configuration Templates

**service_registry.yaml**: Profile-based mapping of agent IDs to deployment endpoints. Used by `agent-registry` resolver for invoke-* tools and a2a.agent_url resolution.

**tool_resolver.yaml**: Profile-based mapping of tool IDs to connector types and operations. Used by `service-registry` resolver for data access and persistence tools.

Both templates support four profiles: mock (local stubs), dev (local services), staging (pre-production), and production (live systems). The active profile is selected via `EA_RUNTIME_PROFILE` environment variable.

### 5. $component_ref Resolution

`$component_ref` references are resolved at compile time, not runtime. When a parent agent references `$component_ref: sa-discovery-agent`, the platform's definition compiler replaces the reference with the full specialized agent spec before any runtime binding occurs. The ref value must match an agent `id` in the registry.

### 6. a2a Block

No changes to the a2a block structure. The existing `agent_url: null` and `connection_config` fields remain as-is. Resolution happens externally through `service_registry.yaml`. Adding resolver fields to the a2a block would re-couple contract and runtime concerns.

---

## Alternatives Considered

### A. Embed base_url directly in tool definitions

**Pro:** Simple, everything in one file.
**Con:** Couples agent definitions to deployment topology. Every environment change requires modifying the definition YAML. Breaks the contract/binding separation that makes definitions portable.
**Rejected:** Violates the design principle that definitions are deployment-agnostic.

### B. Single unified registry for all tools and agents

**Pro:** One configuration file to manage.
**Con:** Data connector tools and agent routing have different lifecycles, different credential models, and different operational concerns. A CRM connector outage is handled differently from an agent endpoint being unavailable. Forcing them into one registry obscures these differences.
**Rejected:** Different resolution concerns deserve separate configuration surfaces.

### C. Derive resolver from tool ID prefix convention

**Pro:** Zero changes to definition files, pure convention.
**Con:** Fragile, breaks if naming conventions change. `get-*` tools could be mistaken for HTTP GETs rather than data access. New tool prefixes would need code changes to the resolver engine. Implicit conventions create onboarding friction.
**Rejected:** Explicit declarations are more robust than implicit conventions.

---

## Consequences

### Positive

- Every tool has an explicit, validatable resolution path
- Agent definitions remain deployment-agnostic, same YAML works across all environments
- Platform can validate at startup that all tool resolvers have corresponding config entries
- Clear separation makes it straightforward to add new resolver types (e.g., `event-bus` for async tools)
- Mock binding becomes a first-class configuration profile rather than an implicit workaround

### Negative

- 192 tool declarations need a new field (one-time migration)
- Two new configuration files to maintain per environment
- Resolver field adds a concept that definition authors need to understand

### Risks

- Configuration drift between environments if profiles are not managed through infrastructure-as-code
- Tool resolver mappings could become stale if new tools are added without corresponding config entries

---

## Change Log

| Change | Affected Files |
|--------|---------------|
| Add `resolver:` to all ClientTool x-ea-agent blocks | 47 *-definition.yaml files (192 tool blocks) |
| Create agent endpoint registry | domain/config/service_registry.yaml (new) |
| Create tool-to-connector mapping | domain/config/tool_resolver.yaml (new) |
| Document runtime binding in domain model | docs/architecture/system/domain-model.md |
| Document tool resolution strategies | docs/architecture/system/tool-design-principles.md |
| Document tool-to-connector mapping | docs/architecture/system/connector-architecture.md |

---

## Related Decisions

- [DDR-019: Agent System Domain Model](DDR_019_agent_system_domain_model.md), defines the tool layer this decision extends
- [DDR-023: Prompt Data Dependencies](DDR_023_prompt_data_dependencies.md), established requires_data contracts that runtime binding enables

---

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-03-05 | ACCEPTED | Initial decision: three-resolver model with explicit declarations |
