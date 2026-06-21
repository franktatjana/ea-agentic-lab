# DDR-026: Signal Log as Analytics System of Record

**Status:** PROPOSED
**Date:** 2026-06-15
**Version:** 1.0
**Category:** Domain Decision Record
**Extends:** DDR-001 (three-vault architecture), DDR-005 (signal-based action completion), DDR-019 (domain model)
**References:** `domain/catalogs/signal_catalog.yaml`

---

## Context

The framework cannot fill the vault with analytics because it has never decided what the durable, authoritative unit of an analytic is or where it lives. Two storage shapes exist with no declared contract between them, and the typed signal that the system names as its spine is not bound to either.

| Gap | Evidence |
|-----|----------|
| Signal declared authoritative but never stored | `signal_catalog.yaml` calls itself "the machine-readable signal contract" for "IMMUTABLE events that flow between agents," with per-type payload schemas (e.g. `SIG_HLT_003`: realm_id, node_id, previous_score, new_score, threshold_crossed, trend). No vault location holds signal instances. The contract exists, nothing writes to it. |
| Intelligence artifacts are mutable state with no contract | `vault/{REALM}/intelligence/*.yaml` (opportunity_map, realm_digest, company_profile, trend_analysis) are overwritten in place, have no declared schema, no single owner, and no link to the events that produced them. |
| Output-to-record seam open | Agent flows emit free-form fields (`budget_signals`, `competitive_assessment`); the catalog defines `SIG_COM_*` / `SIG_HLT_*`. Nothing connects flow output to a cataloged type, so no analytic can be written in a routable, queryable shape. |
| Vault routing declared, never enforced | DDR-001 added `vault_routing` to playbooks, but no write path enforces it, so destinations are advisory. |
| Downstream consumers need a stable record | A briefing must cite evidence per line; the EA Ops dashboard ingests vault content into SQLite. Both require a typed, append-only record. Free-form markdown is brittle to ingest and cannot show trend. |

Without this decision, any analytics written to the vault are bespoke per author: un-routable by the kernel, un-gradeable against extraction, and un-ingestible by the dashboard.

---

## Decision

The typed **signal instance is the atomic, append-only unit of analytic truth and the system of record for the vault's analytics layer.** Intelligence artifacts become derived projections over the signal log. The projection layer is deferred until a consumer needs it.

### 1. The signal instance is the record

An analytic fact is written as one signal instance conforming to a type in `signal_catalog.yaml`. The instance carries the cataloged payload plus mandatory provenance and evidence:

```yaml
instance_id: ACME-DATA-2026-06-15-0001
signal_id: SIG_HLT_003              # references the catalog type
signal_version: 1                   # matches the catalog type version
realm_id: ACME_CORP
node_id: DATA_ANALYTICS
emitted_at: 2026-06-15T06:14:00Z
emitted_by: human:hand-typed        # an agent id once extraction is wired
payload:                            # conforms to the type's required/optional fields
  previous_score: 72
  new_score: 58
  threshold_crossed: warning
  trend: declining
  calculated_at: 2026-06-15T06:00:00Z
evidence:                           # mandatory, at least one source per fact
  - source: crm:opportunity/ACME-DATA-ANALYTICS
    excerpt: "Renewal pushed to next quarter, sponsor reassigned"
```

A signal instance is immutable once written. Provenance and evidence are required, not optional, because a briefing line and a dashboard row must both trace to a cited source.

### 2. Storage: a node-level append-only log

Each engagement node gains a `signals/` container, peer to the existing infohubs:

```text
vault/{REALM}/{NODE}/
  internal-infohub/
  external-infohub/
  raw/
  signals/                          # new, append-only
    2026-06-15T0614_SIG_HLT_003_0001.yaml
    2026-06-15T0620_SIG_COM_002_0002.yaml
```

One immutable file per signal instance, named by `emitted_at` + `signal_id` + sequence. Append-only means files are only ever added, never edited or deleted. One-file-per-instance avoids merge conflicts on a shared log and stays git- and Obsidian-friendly.

### 3. Intelligence artifacts become projections

`intelligence/*.yaml` are reclassified as **derived projections**: recomputable views over the node signal logs, each with exactly one owner agent, never authoritative. A projection can be regenerated from the log at any time and may lag. No agent writes an intelligence artifact without the source signals existing first.

### 4. The projection layer is deferred (build the record first)

Only the signal log is built now. A projection is built when a real consumer needs it (the morning briefing or the dashboard), not speculatively. Until then the vault accrues typed signals; rendering follows. This keeps the audit trail and trend capability while deferring the projection machinery.

### 5. Normativity

`signal_catalog.yaml` and every signal instance are **normative**: schema-checked, immutable, governed by consistency rules with no concept-only exemption. Intelligence projections are **informative** until a consumer binds to them, at which point that projection's schema becomes normative.

### 6. Seed node (the falsification slice)

`ACME_CORP/DATA_ANALYTICS` is the reference node. The first 10 to 20 signals are hand-typed into its `signals/` log from real account data, conforming to the catalog. Hand-typing stubs LLM extraction so the contract is tested independently of extraction quality, and this seed set doubles as the golden set when extraction is wired (DDR-024 path, future). The decision flips to ACCEPTED once the seed node validates against the gate below.

**Validation gate:** every seeded signal conforms to its catalog type, carries at least one evidence source, and is addressable by `signal_id`; a quiet period produces no signals (no noise floor); and producing a node-level view never requires reaching into another node's log.

---

## Alternatives Considered

### A. Intelligence artifacts as system of record (state-based)

**Pro:** Simplest, artifacts are directly human-readable, matches what already sits in the `intelligence/` folders.
**Con:** No history, so no trend and no "what changed when," which is exactly what makes a briefing defensible and what the dashboard needs. Contradicts the catalog's own immutability claim.
**Rejected:** Loses the audit and trend property that the governance-first differentiator depends on.

### B. Free-form markdown analytics per author

**Pro:** Zero schema work, fastest to write.
**Con:** Un-routable by the kernel, un-gradeable against extraction, brittle for dashboard ingestion. Becomes normative the moment the dashboard reads it, forcing a later migration.
**Rejected:** Defers the typing cost to after data exists, which is the most expensive time to pay it.

### C. Signals authoritative AND full projection layer built now

**Pro:** Complete analytics pipeline in one step.
**Con:** Builds projection machinery before any consumer exists, repeating the breadth-before-falsification pattern one layer up.
**Rejected:** Projection detail is premature; build it just-in-time when the briefing or dashboard needs it (this DDR's section 4).

---

## Consequences

### Positive

- One authoritative, typed, append-only record for analytics: routable, queryable, ingestible
- Audit trail and trend come for free from the append-only log
- Evidence-per-signal gives the briefing its anti-fatigue, traceable-claim property
- The seed log doubles as the golden set for grading future LLM extraction
- Dashboard ingests a stable typed schema instead of brittle markdown
- Closes the output-to-record seam at the storage boundary by hand first, before automation

### Negative

- Adds a `signals/` container to the node structure (one-time, additive)
- Intelligence artifacts must be reclassified and eventually regenerated as projections
- A projection step is needed before signals render as narrative artifacts

### Risks

- A clean hand-typed seed can mask a hard extraction problem later; mitigated by reusing the seed as the extraction golden set
- Signal instances drifting from catalog types if no schema check runs; mitigated by making the catalog normative and lintable
- Append-only discipline is convention until enforced; a deleted or edited instance silently breaks the audit claim

---

## Change Log

| Change | Affected Files |
|--------|---------------|
| Add `signals/` append-only container to node structure | `vault/_templates/node/` (new), `docs/architecture/system/vault-architecture.md` |
| Declare signal instance schema (catalog ref + provenance + evidence) | `domain/catalogs/signal_catalog.yaml` (instance schema section) |
| Reclassify `intelligence/*.yaml` as derived projections | `docs/architecture/system/vault-architecture.md` |
| Seed reference node | `vault/ACME_CORP/DATA_ANALYTICS/signals/` (hand-typed) |

---

## Related Decisions

- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md), defines the vault structure this log extends
- [DDR-005: Signal-Based Action Completion](DDR_005_signal_based_action_completion.md), reads vault artifacts as signals; this DDR makes the signal the stored unit
- [DDR-019: Agent System Domain Model](DDR_019_agent_system_domain_model.md), the layer model whose flow outputs must type to the catalog
- [DDR-024: Runtime Binding Architecture](DDR_024_runtime_binding_architecture.md), the resolver path that wires extraction once the record exists

---

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-06-15 | PROPOSED | Signal instance as append-only analytics system of record, projections deferred, ACME_CORP/DATA_ANALYTICS seed pending validation |
