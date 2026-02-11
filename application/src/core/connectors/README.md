# Data Source Connectors

Pluggable connectors for fetching data from various sources. Agents use connectors to pull notes on demand from filesystem, GitHub, Google Drive, and other systems.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Agent                                 │
├─────────────────────────────────────────────────────────────┤
│                    Connector Registry                        │
│              get_connector(ConnectorType)                    │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ Filesystem  │   GitHub    │Google Drive │     Slack         │
│ Connector   │  Connector  │ Connector   │   Connector       │
├─────────────┴─────────────┴─────────────┴───────────────────┤
│           Standardized Note Format                           │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```python
from core.connectors import get_connector, ConnectorType

# Get filesystem connector (reads from vault/)
fs = get_connector(ConnectorType.FILESYSTEM)
notes = fs.fetch_notes(realm_id='ACME_CORP', node_id='SECURITY_CONSOLIDATION')

# Get GitHub connector (reads issues, PRs, discussions)
gh = get_connector(ConnectorType.GITHUB, config={
    'owner': 'my-org',
    'repo': 'my-repo'
})
notes = gh.fetch_notes()

# Notes are standardized across all connectors
for note in notes:
    print(f"{note.source.value}: {note.title}")
    print(f"  Tags: {note.tags}")
    print(f"  Content: {note.content[:100]}...")
```

## Available Connectors

| Connector | Source | Setup Required |
|-----------|--------|----------------|
| `FILESYSTEM` | Local markdown files | None |
| `GITHUB` | Issues, PRs, Discussions | `gh` CLI authenticated |
| `GOOGLE_DRIVE` | Docs, Sheets, .md files | OAuth credentials |

## Connector Details

### Filesystem Connector

Reads markdown files with YAML frontmatter from `vault/{realm}/{node}/`.

```python
fs = get_connector(ConnectorType.FILESYSTEM, config={
    'root_path': '/custom/path'  # Optional
})

# List available realms
realms = fs.get_realms()  # ['ACME', 'GLOBALTECH', ...]

# List nodes in a realm
nodes = fs.get_nodes('ACME')  # ['PROJECT_A', 'PROJECT_B', ...]

# Fetch notes
notes = fs.fetch_notes(
    realm_id='ACME',
    node_id='PROJECT_A',
    note_types=['meeting', 'decision'],  # Filter by type
    since=datetime(2025, 1, 1),           # Only recent
    limit=50
)
```

### GitHub Connector

Fetches issues, PRs, and discussions using the `gh` CLI.

**Setup:**
```bash
# Install and authenticate gh CLI
brew install gh
gh auth login
```

**Usage:**
```python
gh = get_connector(ConnectorType.GITHUB, config={
    'owner': 'my-org',        # GitHub organization
    'repo': 'my-repo',        # Repository name
    'include_issues': True,
    'include_prs': True,
    'include_discussions': True,
    'labels': ['meeting', 'decision']  # Filter by labels
})

notes = gh.fetch_notes(
    realm_id='my-org',     # Can override owner
    node_id='my-repo'      # Can override repo
)
```

**Label Mapping:**
- Issues with `risk` label → `note_type='risk'`
- Issues with `decision` label → `note_type='decision'`
- Pull Requests → `note_type='technical_decision'`
- Discussions → `note_type='meeting'`

### Google Drive Connector

Fetches Google Docs, Sheets, and markdown files.

**Setup:**
1. Create a Google Cloud project
2. Enable Google Drive API
3. Create OAuth credentials (Desktop app type)
4. Download `credentials.json` to `config/`
5. Run authorization:

```python
gd = get_connector(ConnectorType.GOOGLE_DRIVE, config={
    'credentials_path': 'config/google_credentials.json'
})
gd.authorize()  # Opens browser for OAuth
```

**Usage:**
```python
notes = gd.fetch_notes(
    realm_id='Shared Drive Name',
    node_id='Project Folder'
)
```

## Note Format

All connectors normalize data to a standard `Note` format:

```python
@dataclass
class Note:
    id: str                    # Unique identifier
    title: str                 # Note title
    content: str               # Markdown content
    source: ConnectorType      # Where it came from
    source_url: str            # Link to original

    created_at: datetime
    updated_at: datetime
    author: str

    realm_id: str              # Company/account
    node_id: str               # Project/initiative
    tags: List[str]

    note_type: str             # meeting, decision, risk, action
    participants: List[str]
```

**Convert to agent format:**
```python
# Get format expected by agents
agent_data = note.to_agent_format()
# Returns dict with: id, content, date, tags, source, etc.
```

## Configuration

Connectors are configured in `domain/config/connectors.yaml`:

```yaml
default_connector: filesystem

connectors:
  filesystem:
    enabled: true
  github:
    enabled: true
    config:
      include_issues: true
  google_drive:
    enabled: false  # Requires setup

realm_connectors:
  ACME:
    - type: filesystem
    - type: github
      owner: acme-corp
```

## Adding New Connectors

1. Create a new file in `core/connectors/`
2. Inherit from `BaseConnector`
3. Implement required methods:

```python
from .base import BaseConnector, ConnectorType, Note

class MyConnector(BaseConnector):
    @property
    def connector_type(self) -> ConnectorType:
        return ConnectorType.MY_SOURCE

    def _validate_config(self) -> None:
        # Validate required config
        pass

    def test_connection(self) -> bool:
        # Test if source is reachable
        return True

    def fetch_notes(self, realm_id, node_id, **kwargs) -> List[Note]:
        # Fetch and return notes
        return []
```

4. Register in `registry.py`:
```python
from .my_connector import MyConnector
register_connector(ConnectorType.MY_SOURCE, MyConnector)
```
