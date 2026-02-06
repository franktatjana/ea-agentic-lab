"""
Path configurations for EA Agentic Lab
Centralizes all file paths used by agents
"""

import os
from pathlib import Path

# Project root (ea-agentic-lab/)
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent

# Application root (ea-agentic-lab/application/)
APPLICATION_ROOT = Path(__file__).parent.parent.parent.parent

# Domain root (ea-agentic-lab/domain/)
DOMAIN_ROOT = PROJECT_ROOT / "domain"

# Vault root (ea-agentic-lab/vault/)
VAULT_ROOT = PROJECT_ROOT / "vault"

# Data root (ea-agentic-lab/data/) - runtime outputs
DATA_ROOT = PROJECT_ROOT / "data"

# Input paths - where agents read from
INFOHUB_ROOT = VAULT_ROOT / "infohub"
KNOWLEDGE_ROOT = VAULT_ROOT / "knowledge"

# Example realm for testing/demos
EXAMPLE_REALM = INFOHUB_ROOT / "examples" / "ACME"

# Output paths - where agents write to
AGENT_OUTPUT = DATA_ROOT / "agent_outputs"
RUNS_OUTPUT = DATA_ROOT / "runs"

# Core directories within application
CORE_DIR = APPLICATION_ROOT / "src" / "core"
AGENTS_DIR = APPLICATION_ROOT / "src" / "agents"

# Domain directories
DOMAIN_AGENTS = DOMAIN_ROOT / "agents"
DOMAIN_PLAYBOOKS = DOMAIN_ROOT / "playbooks"
DOMAIN_CONFIG = DOMAIN_ROOT / "config"


def get_agent_config_path(team_name: str, agent_name: str) -> Path:
    """Get config path for an agent"""
    return DOMAIN_AGENTS / team_name / "agents" / f"{agent_name}.yaml"


def get_prompts_dir(team_name: str) -> Path:
    """Get prompts directory for a specific team"""
    return DOMAIN_AGENTS / team_name / "prompts"


def get_personality_path(team_name: str, agent_name: str) -> Path:
    """Get personality file for an agent"""
    return DOMAIN_AGENTS / team_name / "personalities" / f"{agent_name.replace('_agent', '')}_personality.yaml"


def get_realm_path(realm_id: str) -> Path:
    """Get path to a realm's InfoHub directory"""
    return INFOHUB_ROOT / realm_id


def get_node_path(realm_id: str, node_id: str) -> Path:
    """Get path to a specific node within a realm"""
    return INFOHUB_ROOT / realm_id / node_id


def get_agent_output_dir(agent_id: str) -> Path:
    """Get output directory for a specific agent"""
    output_dir = AGENT_OUTPUT / agent_id
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def get_run_output_dir(run_id: str) -> Path:
    """Get output directory for a specific run"""
    output_dir = RUNS_OUTPUT / run_id
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def ensure_directories():
    """Create all necessary directories"""
    dirs_to_create = [
        # Data outputs
        DATA_ROOT,
        AGENT_OUTPUT,
        RUNS_OUTPUT,
        # Common agent output subdirectories
        AGENT_OUTPUT / "clients",
        AGENT_OUTPUT / "customers",
        AGENT_OUTPUT / "reports",
        AGENT_OUTPUT / "risks",
        AGENT_OUTPUT / "decisions",
    ]

    for dir_path in dirs_to_create:
        dir_path.mkdir(parents=True, exist_ok=True)

    print(f"✓ Directories created/verified")


if __name__ == "__main__":
    ensure_directories()
    print(f"Project root: {PROJECT_ROOT}")
    print(f"Domain root: {DOMAIN_ROOT}")
    print(f"Vault root: {VAULT_ROOT}")
    print(f"Data root: {DATA_ROOT}")
    print(f"InfoHub: {INFOHUB_ROOT}")
    print(f"Agent outputs: {AGENT_OUTPUT}")
