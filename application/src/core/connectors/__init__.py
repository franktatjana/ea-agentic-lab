"""
Data Source Connectors for EA Agentic Lab

Provides pluggable connectors to fetch data from various sources:
- Local filesystem (markdown files)
- GitHub (issues, PRs, discussions)
- Google Drive (documents, sheets)

Usage:
    from core.connectors import get_connector, ConnectorType

    # Get a connector
    connector = get_connector(ConnectorType.GITHUB, config={...})

    # Fetch notes for a realm/node
    notes = connector.fetch_notes(realm_id='ACME', node_id='PROJECT')
"""

from .base import BaseConnector, ConnectorType, Note
from .registry import get_connector, register_connector, list_connectors

__all__ = [
    'BaseConnector',
    'ConnectorType',
    'Note',
    'get_connector',
    'register_connector',
    'list_connectors',
]
