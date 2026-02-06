"""
Base Connector Interface

All data source connectors inherit from BaseConnector.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Any, Optional
from pathlib import Path


class ConnectorType(Enum):
    """Available connector types"""
    FILESYSTEM = "filesystem"
    GITHUB = "github"
    GOOGLE_DRIVE = "google_drive"
    SLACK = "slack"


@dataclass
class Note:
    """
    Standardized note format across all connectors.

    All connectors normalize their data to this format for agent consumption.
    """
    id: str                           # Unique identifier
    title: str                        # Note title
    content: str                      # Markdown content
    source: ConnectorType             # Where it came from
    source_url: Optional[str] = None  # Link back to original

    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    author: Optional[str] = None

    # Classification
    realm_id: Optional[str] = None    # Company/account
    node_id: Optional[str] = None     # Project/initiative
    tags: List[str] = field(default_factory=list)

    # Type hints for agents
    note_type: Optional[str] = None   # meeting, decision, risk, action, etc.
    participants: List[str] = field(default_factory=list)

    # Raw data for debugging
    raw_metadata: Dict[str, Any] = field(default_factory=dict)

    def to_agent_format(self) -> Dict[str, Any]:
        """Convert to format expected by agents"""
        return {
            'id': self.id,
            'content': self.content,
            'date': self.updated_at.isoformat() if self.updated_at else None,
            'tags': self.tags,
            'source': self.source.value,
            'source_url': self.source_url,
            'participants': self.participants,
            'customer_id': self.realm_id,
            'node_id': self.node_id,
            'note_type': self.note_type,
        }


class BaseConnector(ABC):
    """
    Abstract base class for all data source connectors.

    Each connector must implement:
    - fetch_notes(): Get notes for a realm/node
    - test_connection(): Verify connectivity
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize connector with optional configuration.

        Args:
            config: Connector-specific configuration (API keys, paths, etc.)
        """
        self.config = config or {}
        self._validate_config()

    @property
    @abstractmethod
    def connector_type(self) -> ConnectorType:
        """Return the connector type"""
        pass

    @abstractmethod
    def _validate_config(self) -> None:
        """Validate required configuration is present"""
        pass

    @abstractmethod
    def test_connection(self) -> bool:
        """
        Test if the connector can reach its data source.

        Returns:
            True if connection successful, False otherwise
        """
        pass

    @abstractmethod
    def fetch_notes(
        self,
        realm_id: Optional[str] = None,
        node_id: Optional[str] = None,
        since: Optional[datetime] = None,
        note_types: Optional[List[str]] = None,
        limit: Optional[int] = None
    ) -> List[Note]:
        """
        Fetch notes from the data source.

        Args:
            realm_id: Filter by realm (company/account)
            node_id: Filter by node (project/initiative)
            since: Only fetch notes updated after this time
            note_types: Filter by note type (meeting, decision, etc.)
            limit: Maximum number of notes to return

        Returns:
            List of Note objects
        """
        pass

    def fetch_for_agent(
        self,
        realm_id: Optional[str] = None,
        node_id: Optional[str] = None,
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        Fetch notes in agent-compatible format.

        Convenience method that fetches notes and converts them.
        """
        notes = self.fetch_notes(realm_id=realm_id, node_id=node_id, **kwargs)
        return [note.to_agent_format() for note in notes]

    def get_realms(self) -> List[str]:
        """
        List available realms.

        Default implementation returns empty list.
        Subclasses should override if they can enumerate realms.
        """
        return []

    def get_nodes(self, realm_id: str) -> List[str]:
        """
        List nodes within a realm.

        Default implementation returns empty list.
        Subclasses should override if they can enumerate nodes.
        """
        return []
