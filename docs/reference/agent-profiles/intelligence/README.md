---
title: "Intelligence Agents"
order: 8
---

# Intelligence Agents

Intelligence agents scan external data sources and produce structured, source-referenced intelligence for account teams. They cover company research, industry analysis, and technology signal mapping, operating on scheduled and event-driven triggers. Each agent owns a distinct scope within the intelligence pipeline, with clear handoffs ensuring data flows from collection through analysis to actionable artifacts.

| Agent | File | Purpose |
|-------|------|---------|
| [Account Intelligence Agent](aci-agent.md) | `aci_agent` | Researches companies from public sources, builds organigrams, maps business strategy, identifies opportunities |
| [Industry Intelligence Agent](ii-agent.md) | `ii_agent` | Analyzes industry structure, market trends, regulatory landscape, and sector benchmarks |
| [Tech Signal Scanner Agent](tech-signal-scanner-agent.md) | `tech_signal_scanner_agent` | Scans job postings to extract technology intelligence data for realm companies |
| [Tech Signal Analyzer Agent](tech-signal-analyzer-agent.md) | `tech_signal_analyzer_agent` | Analyzes scan data to generate and maintain technology signal maps |
