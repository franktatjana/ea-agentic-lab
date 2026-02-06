# How to Run a Demo

Step-by-step guide for running the EA Agentic Lab demo.

## Prerequisites

- Python 3.11+ installed
- Virtual environment activated
- Required packages installed

```bash
cd ea-agentic-lab
source application/venv/bin/activate
pip install -r application/requirements.txt
```

## Demo Scenarios

The demo includes three pre-configured scenarios:

| Realm | Scenario | Key Demo Points |
|-------|----------|-----------------|
| **ACME_CORP** | Full lifecycle | Pre-sales discovery, technical deep-dive, POC progress |
| **GLOBEX** | At-risk account | Health decline, competitive threat, churn prevention |
| **INITECH** | New opportunity | Discovery, competitive evaluation, POC planning |

## Step 1: Reset Demo Data

Run the restore script to load sample data:

```bash
./vault/sample-data/restore-demo.sh
```

This will:
- Clear any existing demo realms
- Copy sample meeting notes and daily ops
- Create InfoHub structure for each realm

## Step 2: Run the Agents

### Option A: Run All Agents

```bash
# Process all realms with SA Agent
python application/scripts/run_sa_agent.py

# Process all realms with CA Agent
python application/scripts/run_ca_agent.py
```

### Option B: Run for Specific Realm

```bash
# SA Agent for ACME_CORP only
python application/scripts/run_sa_agent.py --realm ACME_CORP

# CA Agent for GLOBEX only
python application/scripts/run_ca_agent.py --realm GLOBEX
```

## Step 3: Review Outputs

Agents generate artifacts in the InfoHub:

```
vault/infohub/{realm}/MAIN/
├── context/
│   └── account_profile.md      # Generated account summary
├── risks/
│   └── risk_register.yaml      # Detected risks
├── decisions/
│   └── decision_log.yaml       # Extracted decisions
├── actions/
│   └── action_tracker.yaml     # Pending actions
└── _Dashboard.md               # Overview dashboard
```

## Demo Script: ACME_CORP (Full Lifecycle)

### 1. Show Source Data

Open the meeting notes to show raw input:

```
vault/sample-data/ACME_CORP/meetings/external/
├── 2026-01-08-discovery-call.md
├── 2026-01-15-technical-deep-dive.md
└── 2026-01-22-poc-kickoff.md
```

**Talk Track**: "These are meeting notes from account teams - discovery calls, technical deep-dives, and internal syncs. Currently, valuable intelligence is buried in these notes."

### 2. Run SA Agent

```bash
python application/scripts/run_sa_agent.py --realm ACME_CORP
```

**Talk Track**: "The SA Agent processes these notes, extracts technical signals, identifies risks, and generates structured intelligence."

### 3. Show Generated Artifacts

Open the generated risk register:

```bash
cat vault/infohub/ACME_CORP/MAIN/risks/risk_register.yaml
```

**Talk Track**: "The agent detected risks like migration complexity and timeline pressure, with proper classification and ownership."

### 4. Show Account Profile

```bash
cat vault/infohub/ACME_CORP/MAIN/context/account_profile.md
```

**Talk Track**: "A consolidated view of the account - technical landscape, stakeholders, and current status - updated automatically."

## Demo Script: GLOBEX (At-Risk Account)

### 1. Set the Scene

**Talk Track**: "GLOBEX is an existing customer showing warning signs. Usage is down 30%, the champion left, and competitors are circling."

### 2. Show Health Signals

Open the QBR meeting notes:

```
vault/sample-data/GLOBEX/meetings/external/2026-01-12-qbr-review.md
```

Point out:
- Usage decline metrics
- Competitive mention (ObservabilityVendorA)
- Customer frustration signals

### 3. Run CA Agent

```bash
python application/scripts/run_ca_agent.py --realm GLOBEX
```

### 4. Review Health Assessment

The CA Agent will:
- Calculate health score (should be RED)
- Identify churn risk signals
- Flag competitive threat
- Generate intervention recommendations

## Demo Script: INITECH (New Opportunity)

### 1. Show Discovery Notes

**Talk Track**: "INITECH is a new opportunity in technical evaluation. They're comparing us with Algolia."

### 2. Highlight Competitive Signals

Open discovery call and point out:
- Competitive mentions
- Technical requirements
- Decision criteria
- Timeline pressure

### 3. Run Agents

```bash
python application/scripts/run_sa_agent.py --realm INITECH
```

### 4. Show Competitive Intelligence

The agent extracts:
- Competitive positioning
- Technical requirements mapping
- Risk assessment for the deal

## Common Demo Questions

### Q: How does the system learn from feedback?

**A**: Agents use human-in-the-loop patterns. Outputs are reviewed, corrections are fed back, and the system improves over time.

### Q: Can it integrate with our existing tools?

**A**: Yes. Connectors are available for:
- Filesystem (markdown notes)
- GitHub (issues, PRs, discussions)
- Google Drive (docs, sheets)
- CRM and Slack integrations planned

### Q: How does it handle sensitive data?

**A**: All data stays within your infrastructure. The InfoHub is local storage. LLM calls can use private deployments.

## Troubleshooting

### No output generated

- Check that sample data was loaded correctly
- Verify Python environment is active
- Check agent logs for errors

### Agents run but no signals detected

- Ensure meeting notes have proper YAML frontmatter
- Check that tags are formatted correctly
- Review agent signal detection patterns

## Next Steps After Demo

1. **Try with real data**: Copy your actual meeting notes to InfoHub
2. **Configure connectors**: Set up GitHub or Google Drive integration
3. **Customize agents**: Adjust signal detection patterns for your needs
4. **Run playbooks**: Execute strategic playbooks for deeper analysis
