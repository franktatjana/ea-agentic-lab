"""
Connector Registry

Factory for creating and managing data source connectors.
"""

from typing import Dict, Type, Optional, Any, List
from .base import BaseConnector, ConnectorType


# Registry of available connectors
_CONNECTORS: Dict[ConnectorType, Type[BaseConnector]] = {}


def register_connector(connector_type: ConnectorType, connector_class: Type[BaseConnector]):
    """
    Register a connector class.

    Args:
        connector_type: The type of connector
        connector_class: The connector class to register
    """
    _CONNECTORS[connector_type] = connector_class


def get_connector(
    connector_type: ConnectorType,
    config: Optional[Dict[str, Any]] = None
) -> BaseConnector:
    """
    Get a connector instance.

    Args:
        connector_type: Type of connector to create
        config: Configuration for the connector

    Returns:
        Configured connector instance

    Raises:
        ValueError: If connector type not registered
    """
    if connector_type not in _CONNECTORS:
        available = [ct.value for ct in _CONNECTORS.keys()]
        raise ValueError(
            f"Unknown connector type: {connector_type.value}. "
            f"Available: {available}"
        )

    connector_class = _CONNECTORS[connector_type]
    return connector_class(config)


def list_connectors() -> List[ConnectorType]:
    """List all registered connector types"""
    return list(_CONNECTORS.keys())


# Auto-register built-in connectors on import
def _register_builtins():
    """Register built-in connectors"""
    try:
        from .filesystem import FilesystemConnector
        register_connector(ConnectorType.FILESYSTEM, FilesystemConnector)
    except ImportError:
        pass

    try:
        from .github_connector import GitHubConnector
        register_connector(ConnectorType.GITHUB, GitHubConnector)
    except ImportError:
        pass

    try:
        from .google_drive import GoogleDriveConnector
        register_connector(ConnectorType.GOOGLE_DRIVE, GoogleDriveConnector)
    except ImportError:
        pass


_register_builtins()
