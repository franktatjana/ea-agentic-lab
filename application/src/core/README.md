# Core

This directory contains the Python implementation of the EA Agentic Lab execution engine, including playbook execution, agent orchestration, and utility tools.

## Directory Structure

```text
core/
├── agent_framework/        # Base agent implementation
│   └── base_agent.py       # BaseAgent class for all agents
│
├── playbook_engine/        # Playbook execution system
│   ├── __init__.py
│   ├── playbook_loader.py      # Load and parse playbook YAML
│   ├── playbook_executor.py    # Execute playbook steps
│   ├── dll_evaluator.py        # Decision Logic Language evaluation
│   ├── threshold_manager.py    # Threshold-based triggers
│   └── evidence_validator.py   # Validate playbook evidence
│
├── orchestration/          # Agent orchestration system
│   ├── __init__.py
│   ├── orchestration_agent.py  # Meta-agent for process management
│   ├── agent_factory.py        # Create agent instances
│   ├── process_parser.py       # Parse process definitions
│   ├── conflict_detector.py    # Detect agent conflicts
│   ├── playbook_generator.py   # Generate playbooks from processes
│   ├── version_controller.py   # Version control for artifacts
│   └── audit_logger.py         # Audit trail logging
│
├── workflows/              # Workflow orchestration
│   ├── __init__.py
│   └── governance_orchestrator.py  # Governance workflow execution
│
├── config/                 # Configuration
│   └── paths.py            # Path configurations
│
├── connectors/             # Data source connectors
│   ├── __init__.py
│   ├── base.py             # BaseConnector interface
│   ├── registry.py         # Connector factory
│   ├── filesystem.py       # Local markdown files
│   ├── github_connector.py # GitHub issues/PRs/discussions
│   └── google_drive.py     # Google Docs/Sheets
│
└── tools/                  # Utility tools
    ├── markdown_tools.py   # Markdown file reading/writing with frontmatter
    └── doc_generator.py    # Documentation generation
```

## Components

### Agent Framework (`agent_framework/`)

Base implementation for all agents:

```python
from core.agent_framework.base_agent import BaseAgent

class CustomAgent(BaseAgent):
    def __init__(self, config_path):
        super().__init__(config_path)

    def process(self, input_data):
        # Agent-specific logic
        pass
```

### Playbook Engine (`playbook_engine/`)

Executes playbooks defined in YAML:

| Module | Purpose |
|--------|---------|
| `playbook_loader.py` | Load and validate playbook YAML files |
| `playbook_executor.py` | Execute playbook steps sequentially |
| `dll_evaluator.py` | Evaluate Decision Logic Language expressions |
| `threshold_manager.py` | Manage threshold-based triggers and alerts |
| `evidence_validator.py` | Validate required evidence for playbook steps |

**Usage:**

```python
from core.playbook_engine import PlaybookLoader, PlaybookExecutor

loader = PlaybookLoader()
playbook = loader.load("playbooks/executable/PB_201_swot_analysis.yaml")

executor = PlaybookExecutor()
result = executor.execute(playbook, context=account_context)
```

### Orchestration (`orchestration/`)

Manages agent lifecycle and coordination:

| Module | Purpose |
|--------|---------|
| `orchestration_agent.py` | Meta-agent for process management |
| `agent_factory.py` | Instantiate agents from configuration |
| `process_parser.py` | Parse process definitions to workflows |
| `conflict_detector.py` | Detect and resolve agent conflicts |
| `playbook_generator.py` | Generate playbooks from process specs |
| `version_controller.py` | Track artifact versions |
| `audit_logger.py` | Log all agent actions for audit |

**Usage:**

```python
from core.orchestration import AgentFactory, OrchestrationAgent

factory = AgentFactory()
sa_agent = factory.create("solution_architects/agents/sa_agent.yaml")

orchestrator = OrchestrationAgent()
orchestrator.coordinate([sa_agent, ae_agent], context)
```

### Workflows (`workflows/`)

High-level workflow orchestration:

```python
from core.workflows import GovernanceOrchestrator

orchestrator = GovernanceOrchestrator()
orchestrator.run_weekly_governance(realm="ACME")
```

### Tools (`tools/`)

Utility functions:

| Tool | Purpose |
|------|---------|
| `markdown_tools.py` | Read/write markdown files with YAML frontmatter |
| `doc_generator.py` | Generate documentation from artifacts |

### Connectors (`connectors/`)

Pluggable data source connectors for pulling notes from various systems:

| Connector | Source | Setup |
|-----------|--------|-------|
| `filesystem` | Local markdown files | None |
| `github` | Issues, PRs, Discussions | `gh` CLI |
| `google_drive` | Docs, Sheets, .md | OAuth |

**Usage:**

```python
from core.connectors import get_connector, ConnectorType

# Filesystem (reads from vault/infohub/)
fs = get_connector(ConnectorType.FILESYSTEM)
notes = fs.fetch_notes(realm_id='ACME', node_id='PROJECT')

# GitHub (reads issues, PRs)
gh = get_connector(ConnectorType.GITHUB, config={
    'owner': 'my-org',
    'repo': 'my-repo'
})
notes = gh.fetch_notes()

# Notes are standardized across all connectors
for note in notes:
    print(f"{note.source.value}: {note.title}")
```

See [connectors/README.md](connectors/README.md) for full documentation.

## Configuration

### Path Configuration (`config/paths.py`)

Defines standard paths for the system:

```python
from core.config.paths import (
    PROJECT_ROOT,      # ea-agentic-lab/
    DOMAIN_ROOT,       # ea-agentic-lab/domain/
    VAULT_ROOT,        # ea-agentic-lab/vault/
    DATA_ROOT,         # ea-agentic-lab/data/
    INFOHUB_ROOT,      # ea-agentic-lab/vault/infohub/
    AGENT_OUTPUT,      # ea-agentic-lab/data/agent_outputs/
    EXAMPLE_REALM,     # ea-agentic-lab/vault/infohub/examples/ACME/
    get_agent_output_dir,  # Get output dir for specific agent
    get_realm_path,        # Get path to a realm
    get_node_path,         # Get path to a node
)
```

## Development

### Running Tests

```bash
pytest tests/
```

### Adding New Modules

1. Create module in appropriate subdirectory
2. Add to `__init__.py` for exports
3. Write tests in `tests/`
4. Update this README

## Related Documentation

- [Playbook Framework](../docs/playbook-framework.md) - Playbook design
- [Playbook Execution Specification](../docs/playbook-execution-specification.md) - Execution details
- [Agent Architecture](../docs/agent-architecture.md) - Agent system design
