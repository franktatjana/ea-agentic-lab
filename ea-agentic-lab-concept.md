# EA Agentic Lab: Concept Description

*All examples, companies, scenarios, and data in this project are hypothetical. Names, characters, and organizations are fictional. Any resemblance to actual persons, companies, or events is purely coincidental.*

---

## 1. What It Is

EA Agentic Lab is an AI-assisted governance platform for managing complex enterprise accounts through their full pre-sales and post-sales lifecycle. It pairs a multi-agent architecture with a structured playbook engine and a three-vault knowledge model, so that engagement discipline is enforced by the system while strategic decisions stay with people.

At its current stage the project is a specification and design layer, not a production runtime. The domain model is fully defined in declarative YAML: 196 agent definitions across 25 team directories, a library of strategic and operational playbooks, canvas specifications, blueprint templates, and sample customer data. A FastAPI backend and a Next.js web dashboard render this model for browsing and inspection. The execution engine and agent runtime are the next build phase.

The guiding philosophy is short and load-bearing: **humans decide, the system enforces discipline.** Agents have agency within a defined scope, but they do not replace judgment. They keep the process honest, capture what would otherwise be lost, and surface risk early enough to act on.

---

## 2. The Problem It Addresses

Enterprise pre-sales and post-sales engagements rarely fail for lack of talent. They fail because the work has no durable structure. The same four failure modes recur across teams and accounts.

- **Governance entropy:** critical context lives in scattered emails, meeting notes, and individual memory, so no one holds the full picture of an account.
- **Inconsistent execution:** best practices exist on paper but are applied unevenly, depending on who staffs the deal and how busy they are.
- **Reactive risk management:** risks surface late, often after they have already cost time or trust, because nothing watches for them continuously.
- **Knowledge loss:** when a Solution Architect or Account Executive moves on, their account knowledge leaves with them rather than staying in the system.

EA Agentic Lab treats these as a structural problem to be solved with structure: recognizable engagement patterns, reusable blueprints that encode proven practice, and agents that keep the discipline running in the background.

---

## 3. Core Philosophy

The platform sits between two extremes that both fail in practice: fully manual account management that depends on heroics, and full automation that removes human judgment from high-stakes decisions. The design choice is to automate discipline and reserve decisions for people.

Three principles follow from that choice and shape every part of the system.

**Documents for machines, artifacts for humans.** Everything is stored as structured, schema-validated YAML first. Human-facing canvases, reports, and dashboards are rendered from that data on demand. Because the data is machine-readable, agents can validate it, gap-scan it, cross-reference it, and render it into whatever format a stakeholder needs.

**Agency within constraints.** Each agent owns a bounded scope with its own skills, knowledge, and guardrails. It can act inside that scope without asking permission for routine work, but it escalates decisions to humans and defers to peer agents where domains overlap.

**The system compounds.** Knowledge captured in one engagement, once anonymized, becomes available to every future engagement. Outcomes feed back into evaluation criteria. The intent is a platform that is measurably more useful at deal one hundred than at deal one.

---

## 4. The Conceptual Model: Three Pillars

The whole platform can be read as three pillars working together. This is the simplest mental model before the detailed domain layers.

The first pillar is **people paired with agents.** Specialists, Account Executives, Solution Architects, and Customer Architects each work alongside an AI agent team configured for their role, with role-specific playbooks and checklists they can personalize.

The second pillar is **customers classified into archetypes.** Each customer engagement is recognized as a pattern (for example competitive displacement, greenfield, or renewal), and that pattern selects a blueprint, which is filled in with the matching strategic and operational playbooks.

The third pillar is **knowledge captured automatically in two destinations.** An internal vault holds anonymized best practices and digitized tribal knowledge for the vendor, and a per-customer InfoHub holds shareable solution know-how that the customer keeps beyond the engagement.

---

## 5. The Domain Model

The domain model (defined in DDR-019 v3.0) is the formal grammar for how agents are composed. It separates reusable building blocks from agent-owned capability layers and from the organizational layers that drive runtime activation. Every agent in the system must conform to this model.

### 5.1 Building blocks (reusable)

These are the atomic, shareable units that higher layers assemble. They carry no scenario logic of their own.

- **Prompt:** an atomic instruction to the model.
- **Tool:** a connector to an external system, declared as a contract and bound to a real service at runtime.

### 5.2 Agent-owned layers

Each agent carries its own copy of these layers. They define what the agent can do and how it stays safe and grounded.

- **Skill:** a reusable capability, built from prompts and tools. A skill describes what the agent can do.
- **Runbook:** a scenario process that sequences skills. A runbook describes how to handle a specific situation. Skill and runbook are deliberately distinct: capability versus orchestration of that capability.
- **Knowledge:** domain theory and reference material. Knowledge is mandatory, because an agent without grounding is a hallucination risk.
- **Guardrails:** input validation, output checks, and signal validation. Guardrails are mandatory on every agent.

### 5.3 Organizational layers

These layers compose agents into an operating structure and connect them to engagement context.

- **Sub-Agent:** a narrower function owned by a parent agent, inheriting the parent's blueprint context.
- **Role (Agent):** a one-to-one digital twin of a human role, standing alone with its full set of skills, runbooks, knowledge, and guardrails.
- **Playbook:** a reusable unit of work with inputs, steps, outputs, and validation.
- **Blueprint:** the composition of playbooks selected for a specific engagement archetype.

### 5.4 Runtime direction

Activation flows top-down through the organizational layers. The chain is: Blueprint selects Playbooks, which orchestrate Agents, which execute Skills and Runbooks.

Every agent activation happens inside a blueprint context. The blueprint defines the engagement archetype (for example competitive displacement crossed with security), and that determines which playbooks load, which agents dispatch, and what success criteria apply. An agent that declares no blueprint archetype has no activation path and will not be dispatched.

---

## 6. Engagement Classification

Classification is the trigger that turns a new customer engagement into a concrete plan of work. Recognizing the shape of an engagement is not just labeling, it automatically selects the blueprint, loads the playbooks, assigns the evaluation criteria, and defines what success looks like.

Engagements are classified across three orthogonal dimensions, summarized below.

| Dimension | Question it answers | Example values |
|-----------|--------------------|----------------|
| Archetype | What kind of engagement is this? | Competitive displacement, greenfield, consolidation, compliance, evaluation, renewal, expansion, strategic |
| Domain | Which specialty is in play? | Security, search, observability, multi-domain |
| Track | Which service tier applies? | POC, economy, premium, fast track |

The composition rule reads as a pipeline: Archetype crossed with Domain resolves to a reference blueprint, that blueprint plus a Track produces a blueprint instance, and the blueprint instance expands into the specific playbooks that will run. Adding a new domain does not require rebuilding the system, only new specialist playbooks and checklists, because the engagement patterns stay constant.

---

## 7. Multi-Agent Architecture

The agent layer is the largest part of the framework: 196 agent definitions organized into 25 team directories. The design uses holonic decomposition, where orchestrator role agents own specialized sub-agents, so that a single human role maps to a coordinated team rather than one monolithic agent.

The agents fall into functional categories that mirror how a real account organization is structured.

- **Role agents** apply judgment, use frameworks, and make recommendations. They are the digital twins of human roles such as Account Executive, Solution Architect, Customer Architect, Value Engineer, and Competitive Intelligence lead.
- **Sub-agents** handle specialized functions inside an orchestrator role, inheriting their parent's engagement context and scope.
- **Specialist teams** bring deep domain evaluation in areas including security, search, observability, DevOps, cloud, and data.
- **Governance agents** enforce process and maintain artifacts: meeting notes, nudging on overdue work, task shepherding, decision registration, reporting, risk radar, and the curators that tend each knowledge vault.
- **Intelligence agents** process signals, scan market and technology news, and detect trends that affect live engagements.

Agents coordinate through a signal model and through explicit handoff contracts. A producer agent emits a signal, a signal bus routes it, and consumer agents react. Handoffs are symmetric by rule: if one agent defers to another, that other agent must declare what it provides back, so one-sided dependencies are treated as bugs. Responsibility for each playbook is assigned with a RACI model (responsible, accountable, consulted, informed), which keeps ownership unambiguous.

---

## 8. Playbook Engine

Playbooks are how domain expertise is encoded as repeatable process. Each playbook is a YAML definition with inputs, sequenced steps expressed in a Decision Logic Language, named outputs, and validation checklists that run before and after execution. The current repository holds 160 team and strategic playbooks plus 8 operational playbooks.

The library separates into complementary types, each serving a different rhythm of work.

- **Strategic playbooks** operationalize established consulting frameworks (for example SWOT, PESTLE, Five Forces, TOGAF, MEDDPICC, and value engineering methods) across the team domains.
- **Specialist playbooks** carry deep, domain-specific evaluation logic for security, search, and observability engagements.
- **Operational playbooks** are event-driven micro-procedures for tactical work such as meeting-note capture, risk registration, action creation, escalation, and health alerts.

A playbook runs through a consistent data flow. A trigger (an event, a signal, a threshold breach, a schedule, or a manual start) activates it. Pre-execution checklists validate the inputs. The steps execute under Decision Logic Language conditions. Outputs are written to the appropriate vault with provenance. Post-execution checklists validate quality. Finally, signals are emitted to notify downstream agents that new work is ready.

---

## 9. Three-Vault Knowledge Architecture

Knowledge is separated into three vaults, each with a distinct audience, access rule, and lifecycle. The separation exists so that customer-shareable material, vendor-internal material, and cross-account learning never leak into the wrong context. Every vault is machine-readable YAML, which is what lets agents validate, gap-scan, and cross-reference automatically.

- **Customer InfoHub** (per account, shareable with the customer): solution architecture, architecture decision records, POC plans, and learning paths. This is content the customer keeps beyond the engagement.
- **Internal Account Hub** (per account, vendor-only): competitive intelligence, risk assessments, stakeholder mapping, deal reviews, meeting notes, and daily field notes. Raw inputs from meetings feed into this hub and become the foundation for structured analysis.
- **Global Knowledge Vault** (cross-account, anonymized): best practices, winning patterns, evolved evaluation criteria, and lessons learned. It grows with every engagement through anonymized contribution from account-level knowledge.

Knowledge flows in one direction. Engagements produce account-level knowledge, and account-level knowledge feeds, after anonymization, into the global vault. That one-way flow is what makes the global vault safe to reuse across every customer while keeping account-specific detail contained.

---

## 10. Canvases and Rendered Artifacts

Because the underlying data is structured, the system renders one-page visual artifacts called canvases on demand rather than maintaining them by hand. A canvas turns the YAML behind an engagement into a stakeholder-ready view without anyone copying data into a slide.

The canvas catalog covers the recurring communication needs of an engagement: a context canvas, a decision canvas, a risk governance canvas, a value and stakeholder canvas, and an architecture decision canvas. Each is generated from the same validated data that the agents work with, so the visual and the source never drift apart.

---

## 11. How It Works: The Engagement Lifecycle

The pieces above combine into a six-step lifecycle that runs for each engagement. The lifecycle is what a practitioner actually experiences, with the domain model operating underneath it.

1. **Classify** the engagement across the three dimensions of archetype, domain, and service tier.
2. **Select a blueprint** that defines which playbooks to run, which specialists to involve, and what success looks like.
3. **Execute playbooks** that encode expertise as process: strategic playbooks apply proven frameworks, specialist playbooks bring deep domain evaluation, and operational playbooks handle meeting notes, action tracking, and health monitoring.
4. **Render canvases** that turn structured data into one-page artifacts for stakeholder communication.
5. **Store everything in the vault**, the system's institutional memory, split between a global knowledge base of validated practice and per-account InfoHubs of engagement artifacts.
6. **Learn from outcomes**, feeding deal results back into evaluation criteria so that every future engagement benefits from the ones before it.

Throughout the lifecycle, agents operate within human-defined constraints. They act within their scope, escalate decisions, and keep the record complete, while people own the calls that matter.

---

## 12. Key Differentiators

Several design choices set this platform apart from conventional account-management tooling. Each one is structured so that value compounds the longer the system runs.

**Data is machine-readable first, human-readable on demand.** Storing structured YAML before any document means agents can validate, gap-scan, and cross-reference everything, and canvases render human views only when a stakeholder needs one.

**Agent teams are personalizable per role and per account.** An Account Executive running three security deals and a search expansion gets a team weighted toward security and search specialists with displacement playbooks loaded, while an Account Executive managing strategic renewals gets retention-focused agents with health monitoring. The team adapts to how each person works.

**Every engagement produces a customer-facing knowledge repository.** The Customer InfoHub captures each architecture decision, POC plan, and learning path with full provenance, so the engagement itself yields a curated repository that can be shared, handed off, or audited years later. Knowledge sharing is a primary output, not a byproduct.

**Governance is proactive.** Governance agents continuously scan for gaps, flag overdue actions, detect stale artifacts, and nudge before problems become visible, rather than waiting for someone to check a dashboard.

**Classification drives automation.** Recognizing an engagement pattern automatically selects the blueprint, loads the playbooks, assigns evaluation criteria, and defines success, so the cost of supporting a new domain is just new specialist content, not a system rebuild.

**The system learns from outcomes.** Win and loss correlation adjusts checklist weights, field feedback reshapes evaluation criteria, and proven practices surface automatically in later engagements. Over time the platform is designed to discover which playbook sequences, discovery questions, and risk patterns predict the best outcomes.

---

## 13. Who It Is For

The platform serves the full account team, with each role getting capabilities matched to its work. The value to each role is a direct consequence of the shared structure underneath.

- **Account Executives** get deal governance, stakeholder tracking, competitive intelligence, and executive-ready canvases, which frees them to focus on relationships and strategy.
- **Solutions Architects** get structured playbooks for technical discovery, architecture assessment, and POC execution, with every finding captured permanently.
- **Domain Specialists** (security, search, observability) get evaluation checklists that evolve from deal outcomes, plus cross-domain learning that imports proven patterns from other specialties.
- **Customer Success Managers** get health scoring, risk monitoring, and renewal tracking across their portfolio, with alerts that arrive before problems become urgent.
- **Sales Leadership** gets cross-engagement visibility without manual status reports, showing which deals are at risk and which patterns win.
- **Product Managers** get field feedback aggregated across engagements, surfacing feature requests, competitive gaps, and roadmap signals.
- **Competitive Intelligence** gets structured win and loss data, competitor positioning patterns, and displacement-playbook effectiveness across all deals.

---

## 14. Technology and Current Status

The implementation choices keep the framework declarative and inspectable. File-based YAML with schema validation is the single source of truth, and the application layer reads that model rather than holding state of its own.

- **Backend:** Python 3.12+, FastAPI, Pydantic, PyYAML.
- **Frontend:** Next.js 16, React 19, TypeScript, TanStack React Query, Tailwind CSS, shadcn/Radix UI.
- **iOS companion:** Swift 5.9+, SwiftUI, iOS 17+.
- **Data:** file-based YAML, no database, three-vault knowledge architecture.
- **Agent spec:** Oracle Agent Spec 26.1.0 with an `x-ea-agent` extension namespace.

The domain model and web application are complete. The frontend provides a portfolio dashboard, a realm and node explorer with multi-tab detail views, canvas rendering, a playbook catalog, agent profiles, a blueprint overview, a knowledge-vault browser, and a documentation viewer. The backend serves realms, nodes, canvases, dashboard summaries, playbooks, blueprints, knowledge-vault CRUD, and docs. The remaining work is the execution engine and the agent runtime that will turn the specification into a running system.

---

## 15. Glossary of Core Concepts

These terms recur throughout the platform and are worth fixing in one place. They map directly to entities in the YAML model.

- **Realm:** a customer organization (for example ACME_CORP, GLOBEX, INITECH).
- **Node:** a specific engagement within a realm (for example a security consolidation).
- **Archetype:** an engagement pattern classified by signals.
- **Blueprint:** the playbook composition for a specific archetype, domain, and track.
- **Playbook:** a reusable unit of work with inputs, steps, outputs, and validation.
- **Operational playbook:** an event-driven micro-playbook for tactical procedures.
- **Canvas:** a one-page visual artifact rendered from structured data.
- **Signal:** an event emitted by an agent to trigger downstream action.
- **Checklist:** machine-readable validation rules with assertions.
- **Skill:** a reusable agent capability built from prompts and tools.
- **Runbook:** a scenario process that sequences an agent's skills.
- **Guardrails:** the mandatory input, output, and signal validation on every agent.
