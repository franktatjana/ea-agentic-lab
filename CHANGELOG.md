# Changelog

## Unreleased

### Added

- Documentation spine: `docs/START_HERE.md`, `docs/overview/executive-summary.md`, `docs/reference/repository-paths.md`, and `docs/overview/README.md` so in-app `/docs` stays under `docs/` while still pointing to `domain/` and `vault/` paths.
- Customer Advocacy agent (cad-agent): full role elaboration with 12 runbook prompts, 8 playbooks, 3 knowledge references, agent config, and personality
- RACI cross-reference validation in `validate_definitions.py --raci`: detects stale references, missing playbooks, orphan roles
- RACI fix script `fix_raci.py`: automated repair of playbook_raci drift across all agent definitions
- `role_context` profiles added to poc-agent, rfp-agent, infosec-agent, retrospective-agent, specialist-agent
- `docs/architecture/system/orchestration-patterns.md`: maps the five canonical agentic patterns (prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer) to the ea-agentic-lab domain model with pattern combinations
- Canvas data assemblers for the four remaining active canvas types: Problem-Solution Fit, Architecture Communication, Execution Map, QBR Tracking
- `dev.sh`: one-command local startup that runs the FastAPI backend and Next.js frontend together

### Changed

- Root `EXECUTIVE_SUMMARY.md` is a short pointer to the canonical summary under `docs/overview/`; handbook and indexes link to in-docs paths.
- Docs browser default route opens `START_HERE.md`; Agents, Blueprints, and Playbook hub pages link to relevant architecture and reference docs.
- Playbook RACI sections synced across 40 agent definitions: 126 stale entries removed, 54 missing playbooks added, 15 agents got new playbook_raci sections
- Fixed `getRoleKey` in role-config.ts: Customer Advocacy (cad-agent) was misclassified as Customer Architect (ca) due to prefix collision
- Frontend default theme switched from dark to light
- Agent definitions service now caches parsed YAMLs in-memory and warms both `list_definitions` and `list_handoffs` during FastAPI lifespan startup, fixing the Render 30s request timeout on `/api/v1/definitions` (4.2s per-request re-parse of 196 YAMLs eliminated)

### Removed

- Orphaned search-specialist-agent playbooks (10 files, no agent definition existed)
- Legacy Streamlit UI and its standalone orchestration module, superseded by the Next.js web app (ADR-001/002/003)

---

## 2026-03-22 - Runbook Design Principles Retrofit (All 23 Agent Prompt Files)

### Added

- `docs/architecture/playbooks/runbook-design-principles.md`: 10 universal runbook design principles standard document
- STEP 0 input gates, confidence metadata, compound classification, empty state handling, action prerequisites, field-level state deltas, quality checks per deliverable, FULL/QUICK/DISCOVERY run modes, two-data-point trend rule, and executive summary as contract across all agent prompts

### Changed

- All 23 agent prompt files retrofitted from simple CAF format to full runbook format with numbered steps, named deliverables, and quality checks
- Mature agents (AE, CA, VE) updated with missing principles #3 (compound classification), #5 (action prerequisites), #8 (run modes), #10 (executive summary as contract)
- CLAUDE.md updated: prompt format reference changed from CAF to runbook format

---

## 2026-03-21 - Domain Best Practice Audits (SA, CA, CI, VE) and System Technical Audit

### Added

- `references/industry-best-practices.yaml` for SA agent: 11 high-priority gaps including pillar-based architecture review, ADR lifecycle management, architecture diagram generation, RFP automation, CFO-level financial modeling
- `references/industry-best-practices.yaml` for CA agent: 5 high-priority gaps including stakeholder intelligence, predictive health scoring, revenue-weighted risk, financial impact quantification, time-to-value tracking
- `references/industry-best-practices.yaml` for CI agent: 9 high-priority gaps including deal-triggered auto-push delivery, conversation intelligence, expanded signal taxonomy, battlecard auto-refresh, CRM integration
- `references/industry-best-practices.yaml` for VE agent: 18 high-priority gaps including TEI flexibility value, buyer co-creation, living business case, Monte Carlo ROI ranges, industry value driver libraries
- `agent-technical-best-practices.yaml` system-wide: 3 high-priority technical gaps (MCP, agent evaluation/CLEAR metrics, OTEL observability), validated holonic architecture as industry-leading
- Gap-derived challenges added to all 4 agent definitions with `source: REF_*_BP_001` traceability

### Sources checked (SA audit)

- [AWS Well-Architected Review Accelerator](https://aws.amazon.com/blogs/machine-learning/accelerate-aws-well-architected-reviews-with-generative-ai/)
- [AWS ADR Best Practices](https://aws.amazon.com/blogs/architecture/master-architecture-decision-records-adrs-best-practices-for-effective-decision-making/)
- [6pillars.ai Automated Reviews](https://www.6pillars.ai/automated-well-architected-reviews)
- [Microsoft Architecture Review Agent](https://github.com/Azure-Samples/agent-architecture-review-sample)
- [Azure AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [UK Government ADR Framework](https://www.gov.uk/government/publications/architectural-decision-record-framework/architectural-decision-record-framework)
- [Gartner Strategic Technology Trends 2026](https://www.gartner.com/en/newsroom/press-releases/2025-10-20-gartner-identifies-the-top-strategic-technology-trends-for-2026)
- [Gartner EA Trends 2025](https://www.gartner.com/en/articles/2025-trends-for-enterprise-architecture)
- [Forrester Predictions 2026](https://www.forrester.com/predictions/)
- [O'Reilly Agentic AI Architecture Governance](https://www.oreilly.com/radar/how-agentic-ai-empowers-architecture-governance/)
- [TOGAF ADM AI Automation](https://cdotimes.com/2025/02/28/ai-automation-in-enterprise-architecture-the-future-of-digital-business-optimization/)
- [Enterprise POC Best Practices](https://tryopine.com/blog/enterprise-poc-best-practices-how-to-keep-complex-deals-on-track)
- [Gainsight Pre-to-Post Sales Handoff](https://www.gainsight.com/blog/5-step-playbook-for-nailing-pre-to-post-sales-outcomes-handoff/)
- [1up.ai AI Presales Use Cases](https://1up.ai/blog/ai-presales-use-cases/)
- [SiftHub AI Sales Engineers](https://www.sifthub.io/blog/how-ai-sales-engineers-are-transforming-presales)
- [Inventive.ai AI for Sales Engineering](https://www.inventive.ai/blog-posts/ai-transforming-sales-engineering-workflows)

### Sources checked (CA audit)

- [TSIA: State of Customer Success 2026](https://www.tsia.com/blog/state-of-customer-success-2026-ai-economics)
- [Gainsight/Staircase AI](https://www.gainsight.com/staircase-ai/)
- [ChurnZero: Agentic AI for CS](https://churnzero.com/blog/agentic-ai-customer-success/)
- [Gartner: AI in Customer Service 2026](https://www.gartner.com/en/newsroom/press-releases/2025-12-17-customer-service-and-support-leaders-must-prioritize-blending-human-strengths-with-ai-intelligence-in-2026)
- [Forrester: Predictions 2026](https://www.forrester.com/blogs/2026-the-year-ai-gets-real-for-customer-service-but-its-not-glamorous-work/)
- [McKinsey: The NRR Advantage](https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-net-revenue-retention-advantage-driving-success-in-b2b-tech)
- [G2: AI in Churn Reduction 2026](https://learn.g2.com/ai-in-churn-reduction)
- [Totango: Customer-Led Growth](https://www.totango.com/blog/2025-will-be-a-turning-point-for-customer-led-growth)
- [EverAfter: Customer Health Score Guide](https://www.everafter.ai/glossary/customer-health-score)
- [Red Hat: Five Tenets of TAM](https://www.redhat.com/en/blog/five-tenets-technical-account-management)
- [Practical CSM: 10 Ways AI Transforms CS](https://practicalcsm.com/ten-ways-ai-will-disrupt-customer-success-management/)
- [Gainsight: Health Score Models](https://www.gainsight.com/blog/choosing-your-customer-health-score-model/)

### Sources checked (CI audit)

- [Klue Compete Agent](https://klue.com/compete-agent)
- [Crayon State of Competitive Intelligence](https://www.crayon.co/state-of-competitive-intelligence)
- [Crayon: AI Reinventing CI](https://www.crayon.co/blog/a-smarter-way-to-compete-how-ai-is-reinventing-competitive-intelligence)
- [Kompyte GPT AI Features](https://www.kompyte.com/kompyte-competitive-intelligence-automation-ai)
- [Gartner: AI-Guided Selling](https://www.gartner.com/en/newsroom/press-releases/gartner-predicts-75--of-b2b-sales-organizations-will-augment-tra)
- [Forrester: Five Findings About M&CI Programs](https://www.forrester.com/blogs/five-findings-about-todays-market-and-competitive-intelligence-programs/)
- [SCIP AI-Powered CI Workshop](https://www.scip.org/page/AI-Powered-Competitive-Intelligence)
- [CI Alliance: AI Transforming CI](https://www.competitiveintelligencealliance.io/how-ai-and-automation-are-transforming-competitive-intelligence/)
- [Clozd Win-Loss Analysis](https://www.clozd.com/solutions/win-loss-analysis)
- [Highspot: Win-Loss Analysis](https://www.highspot.com/blog/win-loss-analysis/)
- [Signal Labs: Competitor Monitoring](https://usesignallabs.com/use-cases/competitor-monitoring)

### Sources checked (VE audit)

- [Forrester TEI Methodology](https://www.forrester.com/research/total-economic-impact/)
- [Gartner: Value Realization Office](https://www.gartner.com/en/articles/value-realization)
- [IDC: Value Selling Maturity](https://www.idc.com/research/value-selling)
- [Ecosystems.io Collaborative Value](https://www.ecosystems.io/)
- [Mediafly ValueStory](https://www.mediafly.com/)
- [DecisionLink (Bain)](https://www.bain.com/)
- [LeveragePoint Value Management](https://www.leveragepoint.com/)
- [Value Selling Associates](https://www.valueselling.com/)
- [Corporate Visions / B2B DecisionLabs](https://corporatevisions.com/)
- [Bain B2B Elements of Value](https://www.bain.com/insights/the-b2b-elements-of-value/)

### Sources checked (system technical audit)

- [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [Anthropic: Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic: Agent Skills Open Standard](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills)
- [Anthropic: Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Google: Eight Multi-Agent Patterns in ADK](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)
- [Google: A2A Protocol v0.3](https://github.com/a2aproject/A2A)
- [OpenAI: Agents SDK Multi-Agent](https://openai.github.io/openai-agents-python/multi_agent/)
- [OpenAI: Practical Guide to Building Agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)
- [Microsoft: Agent Framework](https://learn.microsoft.com/en-us/agent-framework/overview/)
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [Amazon: Evaluating AI Agents](https://aws.amazon.com/blogs/machine-learning/evaluating-ai-agents-real-world-lessons-from-building-agentic-systems-at-amazon/)
- [OpenTelemetry for Agents](https://langfuse.com/blog/2024-07-ai-agent-observability-with-langfuse)
- [MIT Technology Review: From Guardrails to Governance](https://www.technologyreview.com/2026/02/04/1131014/from-guardrails-to-governance-a-ceos-guide-for-securing-agentic-systems/)
- [Taxonomy of Hierarchical Multi-Agent Systems](https://arxiv.org/html/2508.12683)

---

## 2026-03-21 - AE Best Practice Audit and Terminology Mapping

### Added

- `references/industry-best-practices.yaml` for AE agent: structured gap analysis against industry standards
- 6 new AE challenges from industry gaps: transcript-based qualification, revenue cadences, battle card maintenance, in-call coaching, prescriptive multi-threading, buyer-facing mutual action plans
- Terminology mapping table in domain model: maps YAML keys (`flows:`, `skills/`, `prompt_registry`) to domain concepts (Runbook, Skill, Prompt)
- Change tracking rule added to CLAUDE.md

### Sources checked

- [Gartner: AI Agents Will Outnumber Sellers 10x](https://www.gartner.com/en/newsroom/press-releases/2025-11-18-gartner-predicts-by-2028-ai-agents-will-outnumber-sellers-by-10x)
- [Gartner: AI Agents $15T in B2B Purchases](https://www.digitalcommerce360.com/2025/11/28/gartner-ai-agents-15-trillion-in-b2b-purchases-by-2028/)
- [Gartner: 75% of Buyers Prefer Human Interaction](https://www.gartner.com/en/newsroom/press-releases/2025-08-25-gartner-says-by-2030-that-75-percent-of-b2b-buyers-will-prefer-sales-experiences-that-prioritize-human-interaction-over-ai)
- [Forrester 2026 B2B Predictions](https://investor.forrester.com/news-releases/news-release-details/forresters-2026-b2b-marketing-sales-and-product-predictions-b2b)
- [McKinsey: State of AI 2025](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai)
- [HBR: Successful Sales Teams Embracing Agentic AI](https://hbr.org/2025/09/how-successful-sales-teams-are-embracing-agentic-ai)
- [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [Anthropic: Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Gong: Conversation Intelligence](https://www.gong.io/conversation-intelligence)
- [Gong: Identify Champions with AI](https://www.gong.io/blog/identify-account-champions-with-ai)
- [Clari: AI Agents for Revenue](https://www.clari.com/blog/catalyzing-revenue-transformation-with-ai-agents/)
- [Outreach AI Revenue Platform](https://www.outreach.io/resources/blog/ai-revenue-execution-platform-may-2025-release)
- [Salesforce Agentforce](https://www.salesforce.com/agentforce/einstein-copilot/)
- [Microsoft Copilot for Sales 2025 Wave 2](https://learn.microsoft.com/en-us/copilot/release-plan/2025wave2/copilot-sales/)
- [Force Management: Ascender AI](https://www.forcemanagement.com/newsroom-press/fm-launches-ascender-ai)
- [Winning by Design + Momentum Partnership](https://www.momentum.io/blog/momentum-partners-with-winning-by-design)
- [Spotlight.ai: MEDDICC Implementation](https://www.spotlight.ai/post/meddicc-implementation-guide-for-enterprise-sales-teams)
- [SalesHood: AI Digital Sales Rooms](https://www.globenewswire.com/news-release/2025/12/03/3198525/0/en/SalesHood-Announces-Enhanced-Agentic-AI-Powered-Digital-Sales-Rooms.html)
- [Competitive Battle Cards 2025](https://www.unleash.so/post/competitive-intelligence-tools-in-2025-building-ai-powered-battlecards-that-actually-win-deals)
- [Multi-Threading 2025 Guide](https://www.yess.ai/post/multi-threading-2025-guide)

---

## 2026-03-20 - Prompt Registry Audit (DDR-023 Enforcement)

### Changed

- Audited all 50+ agent definition YAMLs for prompt_registry completeness: every `{variable}` in tasks.yaml prompt text now has a matching entry in inputs/outputs/requires_data metadata
- 34 definition files updated across AE (7), SA (7), CA (5), governance (6), and standalone agents (9)
- 1,275 lines of metadata added: missing input fields, output declarations, and requires_data blocks

---

## 2026-03-18 - Frontend Type Fix

### Fixed

- Narrow `img` src to string before calling `startsWith` (type error in agent profile rendering)

---

## 2026-03-16 - New Roles and UI Formatting

### Added

- Field CTO role with domain-grouped challenges (architecture governance, technical strategy, cross-functional)
- Alliance Architect role for partner technical alignment
- Partner Agent split into commercial and technical sub-agents
- Sales team cadences reference to AE agent (daily pulse, weekly strategy, monthly review, quarterly offsite)

### Changed

- FCTO, CTO, AA, HAM, ISV registered in abbreviations list for uppercase UI rendering
- Stakeholder landscape: opening keywords (CTO, CIO, etc.) rendered bold + white
- Field CTO moved from Leadership to Architecture tab
- Field CTO challenges rewritten: more specific, consequence-driven, grouped by domain
- All playbook statuses reset to draft (not reviewed yet)

---

## 2026-03-15 - CA Decomposition and SA Expansion

### Changed

- CA Agent decomposed into 6 sub-agents, orchestrator rewritten as pure router
- CA sub-agents extended with TAM-sourced capabilities
- ca-agent.md updated with TAM capabilities across sub-agents
- SA Engagement Agent broadened, Five Whys renamed to Situation Diagnostic
- SA Discovery Agent expanded to cover full lifecycle

---

## 2026-03-12 - Agent Definitions and UI Polish

### Added

- Full sub-agent challenge lists for SA POC, RFP, Risk, Value agents
- `read-capability-docs` tool added to RFP agent
- Shared CSS design tokens, standardized text sizes across pages
- Agent definitions page: OrchestratorList with foldable sub-agents, icon updates

### Changed

- Challenge groups made collapsible, `with_this_agent` trimmed to single sentence
- Overhead items shown as challenges with identical formatting
- Sub-agent category inheritance fixed, POC track removed from composition
- Agent definition YAMLs updated across domain

### Fixed

- Nested `<a>` hydration error in activity map domain cards
- Missing `challengeOverhead` helper restored

---

## 2026-03-10 - Challenge/Scenario Parity and UI Polish

### Changed

- Challenge:scenario parity completed across all 49 agents
- Escalation trigger icon standardized to AlertTriangle across all views
- UI polish: agent data completion, role count fix

### Fixed

- Overflow, sentence split, duplicates, and type safety issues in agent views

---

## 2026-03-08 - SA Competency Closing

### Changed

- SA competency gaps closed with PB_SA_011-015
- Playbook renumbering for consistent ID scheme
- DDR-025 methodology references added

---

## 2026-03-06 - Playbook Taxonomy and Agent Hardening

### Added

- `agent-scaffold.yaml` template for new agent creation
- DDR-024: Runtime binding specification

### Changed

- All 33 agent configs hardened with 6 standard fields
- Playbook taxonomy migration to new category system
- Agent definition hardening across all roles
- Agent docs updated with sub-agent and governance counts
- Fixed OP_ intended_agent_role, SA ghost references, stale docs and paths

### Removed

- Accidentally staged domain.zip artifact
- Obsolete PRD (architecture docs and DDRs supersede it)

---

## 2026-03-05 - DDR-022/023/024 and Error Handling

### Added

- DDR-022: Knowledge evolution from static references to scope-based Q&A service
- DDR-023: Prompt data dependencies specification
- DDR-024: Runtime binding specification
- Three-layer error handling added to all 18 AE/SA agent definitions
- Acronym fixes, data deps flyout, and ZIP bundle download in UI

---

## 2026-03-04 - SA Decomposition and Autonomy Model

### Added

- Agent autonomy model documentation
- Autonomy blocks added to all AE sub-agents
- Save tools and tool references added to AE sub-agent workflows

### Changed

- SA Agent rewritten as near-pure router with 9 sub-agents
- Frontend sub-agent rendering fixed
- Hardcoded agent data removed from frontend, role config centralized
- Definitions UI reorganized

---

## 2026-03-03 - Agent Definitions and Profiles UI

### Added

- AE agent profile detail page and YAML definition
- Agent definitions, profiles UI, domain model, governance specs (checkpoint)

---

## 2026-02-28 - Agent Spec Refinement

### Changed

- Split Boundaries into Permissions and Boundaries in agent spec template

---

## 2026-02-27 - Playbooks Completion and Agent Profiles

### Added

- RACI matrix added to all playbooks
- PM and Partner playbooks authored
- OP_COM_001 playbook added
- DDR-017: Support Agent dissolution
- QBR playbooks enhanced with industry best practices (v2.0)
- `vault_routing` added to all playbooks
- C06 and Delivery playbooks authored

### Changed

- Agent profiles and framework catalog updated with PM/Partner playbooks
- Stale counts fixed: 99 to 106 playbooks, 28 to 27 agents
- Runtime clarified as separate project, Owner terminology note added
- External source references removed from QBR playbooks

---

## 2026-02-25 - Bug Fix

### Fixed

- Comma in PB_901 filename causing API errors

---

## 2026-02-21 - Data Source Panel

### Added

- Data source panel in UI

---

## 2026-02-16 - Skills Architecture and Intelligence Cluster

### Added

- Skills architecture: agent-scoped skills with cross-agent catalog (DDR-016)
- Intelligence UI tabs: 10-tab realm overview with backend API
- Intelligence cluster: ACI, II, Technology Scout agents with playbooks, signals, and vault data

---

## 2026-02-15 - Knowledge Architecture and UI

### Added

- Knowledge capture API, DDR-013 and DDR-014
- DDR-015: Split Knowledge Curator into InfoHub Curator + Knowledge Vault Curator
- UI presentation contracts documented for platform independence
- Page icons, InfoHub reordering, generated customer data

---

## 2026-02-14 - Playbook UI and Metadata

### Added

- `playbook_category` taxonomy with contextual help popovers
- Target Close metric on dashboard

### Changed

- Playbook UI polish, metadata standardization, fictional vendors, license

---

## 2026-02-13 - Canvas and Portfolio

### Added

- Canvas Library page with catalog rendering
- Portfolio dashboard with node detail improvements
- DDR-010: Reports and canvas rendering
- SA playbooks PB_SA_011-015
- SA skills SK_SA_011-012
- DDR-025: Methodology Reference Architecture

### Changed

- SA Agent profile rewritten (12 skills, 15 playbooks, 9 sub-agents)
- Playbook catalog: 2-column grid, compact cards
- Dashboard route moved to `/dashboard`, landing page at `/`
- Fictional vendor names standardized

### Fixed

- MEDDPICC playbook viewer crash: `steckbrief.key_outputs` objects rendered as React children

---

## 2026-02-12 - Competitive Intelligence UI & Realm Profile Tabs

### Competitive Intelligence Panel

Replaced raw JSON dump in Internal InfoHub with structured `CompetitiveIntelligencePanel` component. The panel renders `competitive_context.yaml` data in sections account teams can act on: threat summary with win probability, per-competitor accordion (footprint, activity timeline, strengths/weaknesses, counter strategies), battlecard (our advantages with proof points, their advantages with counters), messaging do/don't guidance, win themes with stakeholder resonance, CI actions with status tracking, and competitive history with lessons learned.

Enhanced the Overview tab `CompetitiveLandscape` component with color-coded threat level badges, our differentiation points, risk factors, and POC success criteria.

Created `competitive_context.yaml` sample data for GLOBEX (ObservabilityVendorA critical threat, Titanmetrics/Vizara medium threat) and INITECH (Algolia high threat, OpenSearch low, Typesense medium), modeled after the ACME battlecard playbook structure.

### Stakeholder Interactivity

Added clickable stakeholder cards with slide-over detail panel (`StakeholderDetailPanel` via Sheet component). Panel surfaces 20+ hidden data fields: role in deal, relationship status, technology context, priorities, concerns, champion value, limitations, strategy, notes, and action required.

Added metric card filtering on the Stakeholders tab: clicking Champions/Supporters/Neutral/Blockers filters the stakeholder grid by stance, with toggle-off behavior.

### Realm Profile Tabs

Fixed field resolution for Profile, Competitive, and Growth tabs where YAML field names didn't match frontend expectations (`company_profile` vs `company_info`, `primary_competitors` vs `competitors`, nested `account_objectives` vs flat array). Added fallback chains and flattening logic.

Added competitive landscape and growth strategy data to GLOBEX and INITECH `realm_profile.yaml` files.

Improved Growth tab whitespace analysis with labeled "est. ARR" values, color-coded fit scores, blocker display, total expansion potential summary, and updated HelpPopover explaining the numbers for demo audiences.

### Knowledge Vault Layout

Fixed Knowledge Vault detail view layout: constrained prose width to `max-w-4xl`, corrected double padding from Card + CardContent, restored app-consistent spacing and heading sizes.

---

## 2026-02-09 - Playbook Editor & Catalog Redesign

### Streamlit Playbook Editor

Added in-app editing for all ~61 playbook YAML files directly from the Streamlit UI. The editor supports two modes to handle the trade-off between convenience and full control.

**Quick Edit tab** provides a structured form for commonly changed fields:

- `framework_name`, `intended_agent_role` (selectbox), `playbook_mode`, `status`
- `primary_objective`, `when_not_to_use`, `notes`
- Uses regex string replacement to preserve YAML comments and formatting

**YAML Editor tab** provides raw text editing with validation:

- Full file content in `st.text_area`
- `yaml.safe_load()` validation before write
- Error display for invalid YAML, file never corrupted on bad input

**Data loader additions** (`application/src/ui/data_loader.py`):

- `_path` field added to each playbook dict
- `read_playbook_raw()` for loading raw file content
- `save_playbook_raw()` for validated writes with cache clearing

### Catalog Redesign

Replaced the 2-column card grid with a single-column inline list for readability:

- Horizontal filter bar: search, role filter, group-by, total count
- Each row shows ID, name, role badge, status badge, mode, team, objective, triggers
- Edit button per row opens the editor

**Files changed:**

- `application/pages/3_Playbooks.py` (rewritten)
- `application/src/ui/data_loader.py` (extended)

---

## 2026-02-09 - PESTLE Analysis Ownership Change

PESTLE Analysis (PB_STR_005) is a strategic macro-environmental assessment that belongs at the leadership level. Moved ownership from SA Agent to AE Agent across all references.

**Files changed:**
- `domain/playbooks/strategy/PB_STR_005_pestle_analysis.yaml`: `intended_agent_role` SA → AE, decision rule owners updated
- `domain/mappings/agent_role_mapping.yaml`: moved PB_STR_005 from sa_agent.playbooks_owned to ae_agent.playbooks_owned, updated routing
- `domain/agents/solution_architects/agents/sa_agent.yaml`: moved PB_STR_005 from owned to contributes_to
- `docs/operating-model/raci-model.md`: updated PESTLE row to AE Lead

---

## 2026-02-08 - Streamlit App Rewrite (Single-Page Navigation)

Replaced broken multipage Streamlit app with a single-page design. The previous approach used `st.switch_page()` + `st.query_params` to pass realm/node context between pages, which failed silently and showed empty content.

**New design:**

- Sidebar selectboxes for Realm → Node navigation
- Dispatches to `render_home()`, `render_realm()`, or `render_node()` based on selection
- Node detail view has 5 tabs: Overview, Blueprint, Health, Risks & Actions, Stakeholders
- Home view shows realm cards with node counts and health summaries

**Files changed:**

- `application/app.py` (rewritten as single-page app)
- `application/pages/1_Realm.py` (deleted)
- `application/pages/2_Node.py` (deleted)

---

## 2026-02-07 - Vault Restructure & Blueprint Instances

### Vault Hierarchy

Restructured vault from flat `vault/{node}/` to nested `vault/{realm}/{node}/` hierarchy. Each node now uses `external-infohub/` and `internal-infohub/` subdirectories instead of the previous flat infohub layout.

```
vault/
├── {realm}/
│   ├── realm_profile.yaml
│   └── {node}/
│       ├── node_profile.yaml
│       ├── blueprint.yaml
│       ├── external-infohub/
│       │   ├── overview.md
│       │   ├── context/
│       │   │   └── stakeholder_map.yaml
│       │   ├── meetings/
│       │   └── value/
│       │       └── value_tracker.yaml
│       └── internal-infohub/
│           ├── governance/
│           │   └── health_score.yaml
│           ├── risks/
│           │   └── risk_register.yaml
│           ├── actions/
│           │   └── action_tracker.yaml
│           └── frameworks/
```

### Blueprint Instances

Created blueprint instances for 3 sample nodes, each combining archetype, domain, and track dimensions from the reference blueprints:

- Each node's `blueprint.yaml` is a concrete instance tailored to the node's context
- Reference blueprints moved to `domain/blueprints/reference/{archetype}/`

### Cross-Reference Updates

Updated all documentation, playbook YAMLs, agent configs, and app code to use the new `vault/{realm}/{node}/` paths and infohub directory names.

---

## 2026-02-02 - Vendor-Neutral Field Naming

### Code Changes

**app.py:**

- Renamed `products` field to `solutions` (lines 525, 741)
- Updated UI labels from "Products" to "Solutions"
- Updated variable names and dictionary keys for consistency

**Data Model:**

- Node profiles should now use `solutions` field instead of vendor-specific product fields
- Example structure:

```yaml
solutions:
  - solution: "Security Platform"
    use_case: "SIEM consolidation"
```

**Rationale:**

- Vendor-neutral naming improves reusability
- Aligns with initiative-based node structure

---

## 2026-01-16 - Documentation Naming Convention

### File Naming Standardization

Renamed all documentation files from UPPERCASE_SNAKE to lowercase-kebab for consistency:

**Root level:**

- `readme.md` → `README.md` (proper meta-file casing)
- `VERTICAL_SLICE_RESULTS.md` → `vertical-slice-results.md`

**docs/ directory:**

- `PLAYBOOK_*.md` → `playbook-*.md`
- `CORE_ENTITIES.md` → `core-entities.md`
- `OUTPUT_CONTRACT.md` → `output-contract.md`
- etc.

**docs/architecture/ directory:**

- `AGENT_RESPONSIBILITIES.md` → `agent-responsibilities.md`
- `ORCHESTRATION_AGENT.md` → `orchestration-agent.md`
- etc.

**Convention:**

- Root meta-files: UPPERCASE (`README.md`, `CHANGELOG.md`)
- All other docs: lowercase-kebab (`playbook-execution-specification.md`)

---

## 2026-01-16 - Structure Reorganization & Missing Agents

### Project Structure Cleanup

**Files Moved:**

- `PLAYBOOK_*.md`, `GAP_ANALYSIS.md`, `MVP.md` → `docs/`
- `IMPLEMENTATION_STATUS.md`, `AGENT_ARCHITECTURE.md` → `docs/`
- `tools/doc_generator.py` → `core/tools/` (consolidated)

**Removed:**
- Empty `tools/` directory at root

### Missing Agents Added (High Priority from Governance Model)

| Agent | Team | Blueprints Covered | Purpose |
|-------|------|-------------------|---------|
| PS Agent | professional_services | B10, C05 | Professional Services pre/post sales |
| Support Agent | support | C06 | Support/DSE engagement |
| Value Engineering Agent | value_engineering | A06 | Business value quantification |

### Agent Details

#### teams/professional_services/agents/ps_agent.yaml (NEW)

- **Philosophy**: What we sell must be deliverable
- **Pre-sales**: Scoping, proposal input, POC support
- **Post-sales**: Kickoff, execution tracking, handoff
- **Scope management**: Change request process, red flag detection
- **Handoff protocols**: Sales→Delivery, Delivery→Operations

#### teams/support/agents/support_agent.yaml (NEW)

- **Philosophy**: Support issues are intelligence, not just tickets
- **Pattern detection**: Repeat issues, usage gaps, escalation frequency
- **DSE engagement**: Criteria, activities, deliverables
- **Health signals**: Green/yellow/red classification
- **Account integration**: Weekly/monthly/quarterly touchpoints

#### teams/value_engineering/agents/ve_agent.yaml (NEW)

- **Philosophy**: If you can't prove value, you can't defend price
- **Lifecycle**: Discovery → Hypothesis → Proof → Realization → Amplification
- **Frameworks**: TCO analysis, ROI calculation, value driver tree
- **Metrics library**: Security, observability, general metrics
- **Stakeholder mapping**: CISO, CFO, CTO, COO value language

### Architecture Diagram Updated

- Added PS, Support, VE agents to landscape
- New "Delivery & Support" subgroup
- Updated escalation hierarchy
- Updated summary table (now 21 agents total)

### Coverage Improvement

**Before:** 17/23 blueprints (74%)
**After:** 20/23 blueprints (87%)

**Still missing (medium priority):**
- Exec Sponsor Agent (A02)
- Customer Advocacy Agent (C07)
- Post-Sales Coordinator (C03)

---

## 2026-01-16 - Strategic Agents Expansion (4 New)

### New Strategic Agents

Created 4 new strategic agents with full decision frameworks and personality traits.

| Agent | Team | Purpose |
|-------|------|---------|
| RFP Agent | teams/rfp/ | Win RFPs through strategic response orchestration |
| InfoSec Agent | teams/infosec/ | Navigate security/compliance to enable deals |
| POC Agent | teams/poc/ | Convert POCs into wins through structured execution |
| Senior Manager Agent | teams/leadership/ | Strategic oversight, coaching, escalation resolution |

### Agent Details

#### teams/rfp/agents/rfp_agent.yaml (NEW)

- **Bid/no-bid framework**: 5 weighted factors (strategic fit, competitive position, solution fit, resources, commercial)
- **Response strategy**: Comply → Explain → Differentiate
- **Team orchestration**: Roles for RFP Lead, Technical Lead, Commercial Lead, Security Lead, CI
- **Workflow phases**: Intake → Strategy → Draft → Review → Polish → Submit

#### teams/infosec/agents/infosec_agent.yaml (NEW)

- **Philosophy**: Security as deal enabler, not blocker
- **Gap classification**: Blocker, Workaround, Roadmap, Compliant
- **Questionnaire handling**: SIG, CAIQ, custom with response templates
- **Risk translation**: Security concerns → business impact

#### teams/poc/agents/poc_agent.yaml (NEW)

- **Philosophy**: POC is a buying process, not a science experiment
- **Qualification**: Go/no-go criteria before starting
- **Success criteria design**: Measurable, achievable, relevant, time-bound, limited
- **Execution phases**: Setup → Core Validation → Extended → Wrap-up
- **Metrics**: 70% conversion target, <= 3 weeks duration

#### teams/leadership/agents/senior_manager_agent.yaml (NEW)

- **Decision authority**: Owns deals > $500K, resource conflicts, non-standard terms
- **Escalation handling**: 4-hour response for urgent, 24-hour for standard
- **Coaching framework**: Questions over answers approach
- **Portfolio oversight**: Weekly/monthly/quarterly review cadence
- **Resource allocation**: Strategic value prioritization

### Architecture Update

```
teams/
├── strategic/
│   ├── solution_architects/    # SA Agent
│   ├── account_executives/     # AE Agent
│   ├── competitive_intelligence/ # CI Agent
│   ├── customer_architects/    # CA Agent
│   ├── rfp/                    # RFP Agent (NEW)
│   ├── infosec/                # InfoSec Agent (NEW)
│   ├── poc/                    # POC Agent (NEW)
│   └── leadership/             # Senior Manager Agent (NEW)
└── governance/                 # Meeting Notes, Nudger, etc.
```

---

## 2026-01-16 - Governance Agents (MVP 6)

### New Agent Category: Governance Agents

Created `teams/governance/agents/` with 6 entropy-reduction agents distinct from strategic agents (SA, AE, CI, etc.).

| Agent | Purpose | Trigger |
|-------|---------|---------|
| Meeting Notes Assistant | Turn meetings into decision-grade artifacts | meeting_ended, notes_uploaded |
| Nudger | Make follow-through unavoidable | Daily schedule, action_due |
| Task Shepherd | Ensure actions are real tasks | action_created, meeting_published |
| Decision Registrar | Kill "who decided this?" forever | decision_mentioned, keywords |
| Reporter | 10-line weekly summary for leadership | Friday 5pm, Monday 8am |
| Risk Radar | Surface risks early, keep visible | Daily scan, risk keywords |

### Agent Files Created

#### teams/governance/agents/meeting_notes_agent.yaml (NEW)
- Extracts decisions/actions/risks/questions from raw notes
- Generates confirm-or-correct digest
- Writes to meetings/, action_tracker, decision_log, risk_register
- Quality gates: owner, due date, linked context

#### teams/governance/agents/nudger_agent.yaml (NEW)
- Checks: due_soon, overdue, missing_owner, missing_date, stalled
- Escalation rules: 2 days → manager, 5 days → governance lead
- Max 1 reminder per action per day (no spam)

#### teams/governance/agents/task_shepherd_agent.yaml (NEW)
- Validates: single owner, clear due date, done-means, no duplicates
- Enrichment: priority inference, dependency detection
- Links actions to meetings/decisions/risks

#### teams/governance/agents/decision_registrar_agent.yaml (NEW)
- Lifecycle: Proposed → Confirmed → Implemented → Reverted/Superseded
- Audit trail: who, when, context, alternatives rejected
- Keywords: "decided", "agreed", "approved", "committed to"

#### teams/governance/agents/reporter_agent.yaml (NEW)
- Weekly digest: 10 lines max, TL;DR + changes + risks + blockers + priorities
- Friday 5pm weekly, Monday 8am preview
- Sources: all InfoHub artifacts

#### teams/governance/agents/risk_radar_agent.yaml (NEW)
- Detection: explicit, implicit (signals), derived (from data patterns)
- Severity: critical/high/medium/low with review cadence
- Categories: technical, commercial, relationship, competitive, timeline, resource, compliance

### Architecture

```
teams/
├── strategic/     # SA, AE, CI, CA, PM, etc. (reason, judge)
└── governance/    # Meeting Notes, Nudger, etc. (enforce, reduce entropy)
```

---

## 2026-01-16 - Governance Model Gap Completion

### Gap Analysis
Identified 6 missing components in governance model implementation vs. documentation:
1. Action Tracker (High priority)
2. Stakeholder Profiles (High priority)
3. Architecture Decision Records (Medium priority)
4. Value Tracker (Medium priority)
5. Operating Cadence (Medium priority)
6. Health Score Calculation (Medium priority)

### New InfoHub Files

#### infohub/ACME_CORP/actions/action_tracker.yaml (NEW)
- Consolidated action tracker with 18 actions from all sources
- Priority levels: P0 (8), P1 (6), P2 (4)
- Actions organized by source: CTO meeting, emergency review, deal review, SWOT
- Status tracking: pending, in_progress, completed, blocked
- Dependencies and blocking issues tracked

#### infohub/ACME_CORP/stakeholders/klaus_hoffman.yaml (NEW)
- Critical stakeholder profile for new CISO
- Comprehensive background: enterprise manufacturing, LegacySIEM expertise
- Engagement strategy: demonstrate vs. tell, POC focus
- Risk factors: competitive bias, legacy relationships
- Communication preferences and meeting history

#### infohub/ACME_CORP/stakeholders/sarah_chen.yaml (NEW)
- Champion stakeholder profile
- 3-year vendor relationship history
- Champion activities: advocated during CTO meeting
- Leverage strategy: technical credibility bridge to Klaus
- Limitations: reduced authority after CISO appointment

#### infohub/ACME_CORP/architecture/ADR_001_security_platform.md (NEW)
- TOGAF Architecture Decision Record format
- Security platform selection for combined entity (ACME + Industrietechnik)
- Options analysis: Platform A (recommended), LegacySIEM, CloudSIEM
- Technical requirements: 20 plants, OT/ICS, EU data residency
- POC validation plan with success criteria

#### infohub/ACME_CORP/value/value_tracker.yaml (NEW)
- Value hypotheses and realization tracking
- Realized value: $840K YTD (MTTD improvement, tool consolidation)
- In validation: Security tool consolidation ($660K projected)
- Pending: Unified platform efficiency, compliance efficiency
- Value by stakeholder mapping

#### infohub/ACME_CORP/governance/operating_cadence.yaml (NEW)
- Operating cadence definitions (accelerated mode due to acquisition)
- Daily standups (15 min, 09:00 CET)
- Weekly deal review (45 min, Thursdays)
- QBR schedule, technical sync, steering committee
- POC-specific governance (7-week timeline)
- Escalation criteria and calendar

#### infohub/ACME_CORP/governance/health_score.yaml (NEW)
- Health score calculation with component breakdown
- Current score: 68 (down from 72, declining trend)
- Components: Product Adoption (82), Engagement (75), Relationship (62), Commercial (70), Risk Profile (45)
- Weighted calculation formula documented
- Historical trend and improvement plan
- Active alerts: score below 70, risk component critical, relationship declining

### InfoHub README Updates
- Updated health score display: 68/100 (↓4)
- Added Quick Links for new files
- Updated InfoHub structure with complete folder tree

### InfoHub Relocation

Moved test data from `infohub/` to `examples/infohub/` for clarity:
- Test/demo data now clearly separated from production code
- Updated agent configs to reference new path
- Files affected: ae_agent.yaml, sa_agent.yaml, ci_agent.yaml, ca_agent.yaml

### Summary

- **6 governance gaps** identified and filled
- **7 new files** created in InfoHub
- **Health Score**: Calculated at 68/100 with 5 weighted components
- **Action Tracker**: 18 actions consolidated, 8 P0 priority
- **Stakeholder Profiles**: 2 profiles (Klaus - critical, Sarah - champion)
- **Architecture**: TOGAF ADR for security platform decision
- **Location**: Test data moved to `examples/infohub/`

---

## 2026-01-12 - Governance Model Extension

### Documentation Changes

#### Strategic Account Governance Model.md
- **ADDED** new section "Agentic Execution Framework" after Agent-per-Team (line ~238)
  - Core Concepts table (Playbook, DLL, Threshold Management, Evidence Validation, Output Contract)
  - Playbook Execution Lifecycle (6-step process)
  - Available Playbook Categories table (ID ranges, owners, example frameworks)
  - Decision Logic Language (DLL) specification with YAML example
  - Evidence Validation rules table
  - Human-in-the-Loop Escalation triggers table
  - Implementation Status table

### Code Changes

#### core/workflows/__init__.py (NEW)
- Created workflows module initialization

#### core/workflows/governance_orchestrator.py (NEW)
- `WorkflowStatus` enum - workflow execution states
- `StepType` enum - types of workflow steps
- `WorkflowStep` dataclass - individual step definition
- `GovernanceWorkflow` dataclass - multi-step workflow definition
- `GovernanceOrchestrator` class - workflow execution coordinator
  - `register_handler()` - register step type handlers
  - `start_workflow()` - initiate workflow execution
  - `get_ready_steps()` - get steps with satisfied dependencies
  - `execute_step()` - execute single workflow step
  - `get_workflow_status()` - current workflow status
  - `_log_event()` - audit trail logging
- Pre-defined workflow templates:
  - `STEERING_COMMITTEE_PREP` - monthly steering preparation workflow
  - `RISK_REVIEW_WORKFLOW` - cross-functional risk review workflow

#### Strategic Account Governance Model.md (continued)
- **ADDED** "Governance Process Automation" table after System Artifacts section (line ~194)
- **ADDED** "Tools & Integration Points" table (line ~206)
- **ADDED** "Agent Implementation Status" table in Agent-per-Team section (line ~261)

#### tools/doc_generator.py (NEW)
- `DocGenerator` class - generates governance documentation from code
  - `generate_playbook_catalog()` - creates playbook reference from YAML
  - `generate_agent_reference()` - creates agent documentation from configs
  - `generate_threshold_reference()` - creates threshold documentation
  - `generate_all()` - generates all docs to output directory
- CLI interface with `--project-root` and `--output-dir` arguments

#### teams/solution_architects/agents/sa_agent.yaml (UPDATED)
- **ADDED** `playbooks.owned` - PB_SA_001, PB_STR_004, PB_STR_005, PB_STR_006, PB_STR_204
- **ADDED** `playbooks.contributes_to` - PB_STR_001, PB_VE_001, PB_CA_007, PB_CI_001
- **ADDED** `execution` config (trigger_sources, output_destination, escalation_threshold)

#### teams/account_executives/agents/ae_agent.yaml (UPDATED)
- **ADDED** `playbooks.owned` - PB_STR_001, PB_STR_002, PB_STR_003, PB_VE_001, PB_VE_002
- **ADDED** `playbooks.contributes_to` - PB_STR_004, PB_CA_007, PB_CI_001
- **ADDED** `execution` config

#### teams/customer_architects/agents/ca_agent.yaml (UPDATED)
- **ADDED** `playbooks.owned` - PB_CA_007, PB_CA_008, PB_CA_009
- **ADDED** `playbooks.contributes_to` - PB_SA_001, PB_STR_004, PB_VE_001
- **ADDED** `execution` config

#### teams/competitive_intelligence/agents/ci_agent.yaml (UPDATED)
- **ADDED** `playbooks.owned` - PB_CI_001, PB_CI_702, PB_CI_703
- **ADDED** `playbooks.contributes_to` - PB_STR_001, PB_STR_004, PB_VE_001
- **ADDED** `execution` config

#### tests/test_governance_orchestrator.py (NEW)
- 17 test cases covering orchestrator functionality
  - `TestWorkflowInitialization` - workflow creation and ID generation
  - `TestDependencyResolution` - step dependency management
  - `TestStepExecution` - handler invocation and status updates
  - `TestAuditTrail` - logging and compliance tracking
  - `TestWorkflowStatus` - status retrieval
  - `TestPredefinedWorkflows` - template validation

#### run_orchestrator_demo.py (NEW)
- Interactive demo showing orchestrator in action
- Mock handlers simulating agent, playbook, human decision, and gate steps
- Supports `--workflow steering` and `--workflow risk` flags
- Outputs execution trace and audit trail

### Test Results
- **17/17 tests passing** for governance orchestrator
- Steering committee workflow: 5 steps executed in 4 rounds
- Risk review workflow: 6 steps executed in 4 rounds (3 parallel in round 1)

### InfoHub Test Data: ACME_CORP Account

#### infohub/ACME_CORP/account_profile.yaml (NEW)
- Strategic account profile ($3.5M ARR)
- Stakeholder map (CTO, Head of Engineering, Head of Data)
- Platform product footprint (Search, Analytics, APM)
- Revenue breakdown by horizon

#### infohub/ACME_CORP/meetings/external/2026-01-10_head_of_engineering.md (NEW)
- Customer executive meeting with Dr. Sarah Chen
- Security consolidation budget announcement
- Competitive context (CloudSIEM, LegacySIEM)
- Action items and signals extracted

#### infohub/ACME_CORP/meetings/internal/2026-01-12_deal_review.md (NEW)
- Internal deal review with MEDDPICC assessment (56/80 = 70%)
- $800K opportunity analysis
- Risk discussion and mitigations
- Framework application recommendations

#### infohub/ACME_CORP/frameworks/PB_STR_001_three_horizons_20260112.md (NEW)
- Three Horizons analysis executed by AE Agent
- H1 concentration risk identified (100% > 80% threshold)
- H2 pipeline: $800K security opportunity
- 3 risks, 3 actions generated

#### infohub/ACME_CORP/frameworks/PB_VE_001_value_engineering_20260112.md (NEW)
- Value Engineering analysis for security consolidation
- TCO comparison: $1.2M current → $800K proposed
- ROI: 18-month payback, 14% 3-year ROI
- Stakeholder value mapping

#### infohub/ACME_CORP/frameworks/PB_STR_004_swot_20260112.md (NEW)
- SWOT analysis coordinated by SA Agent
- 6 strengths, 4 weaknesses, 5 opportunities, 5 threats
- Strategic recommendation: Proceed with high priority
- 3 risks, 5 actions generated

#### infohub/ACME_CORP/risks/risk_register.yaml (NEW)
- 8 risks extracted from frameworks and meetings
- Severity distribution: 3 high, 4 medium, 1 low
- Mitigation strategies and owners assigned

#### infohub/ACME_CORP/decisions/decision_log.yaml (NEW)
- 5 decisions from deal review
- 3 approved, 1 implemented, 1 pending customer approval

#### infohub/ACME_CORP/README.md (NEW)
- InfoHub index and navigation
- Risk summary, action items, stakeholder map
- Folder structure documentation

### Summary of Changes
- **Documentation**: 4 new sections added to governance model
- **Code**: 5 new files created (workflows module, orchestrator, doc generator, tests, demo)
- **Configuration**: 4 agent configs updated with playbook integration
- **Test Data**: Complete InfoHub for ACME_CORP with 10 files demonstrating end-to-end governance
