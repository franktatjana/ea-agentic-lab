"""
Orchestration Agent Module

This module provides the meta-layer for process management, agent creation,
conflict detection, and version control.

Components:
- OrchestrationAgent: Main orchestrator
- ProcessParser: Free-form text to structured process
- ConflictDetector: Identifies process conflicts
- AgentFactory: Creates new agents from processes
- PlaybookGenerator: Generates playbooks from process steps
- VersionController: Manages versioning and rollback
- AuditLogger: Immutable audit trail
"""

from .orchestration_agent import OrchestrationAgent
from .process_parser import ProcessParser
from .conflict_detector import ConflictDetector
from .agent_factory import AgentFactory
from .playbook_generator import PlaybookGenerator
from .version_controller import VersionController
from .audit_logger import AuditLogger

__all__ = [
    'OrchestrationAgent',
    'ProcessParser',
    'ConflictDetector',
    'AgentFactory',
    'PlaybookGenerator',
    'VersionController',
    'AuditLogger',
]
