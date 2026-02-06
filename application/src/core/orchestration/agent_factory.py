"""
Agent Factory

Creates new agents based on process requirements.
Generates agent configurations, folder structures, and personality files.
"""

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
import yaml


@dataclass
class AgentDefinition:
    """Definition for a new agent"""
    agent_id: str
    team: str
    purpose: str
    core_functions: List[str]
    inputs: List[str]
    outputs: List[str]
    created_from: str
    personality_traits: Optional[Dict] = None


class AgentFactory:
    """
    Creates new agents from process definitions.

    Responsibilities:
    - Check if existing agent can fulfill role
    - Generate new agent definition
    - Create folder structure
    - Generate personality file (if applicable)
    - Register in agent catalog
    """

    # Map of known agent patterns to existing agents
    KNOWN_AGENTS = {
        "sa": "SA Agent",
        "solution architect": "SA Agent",
        "ae": "AE Agent",
        "account executive": "AE Agent",
        "ca": "CA Agent",
        "customer advocate": "CA Agent",
        "customer success": "CA Agent",
        "ci": "CI Agent",
        "competitive intelligence": "CI Agent",
        "infosec": "InfoSec Agent",
        "security": "InfoSec Agent",
        "delivery": "Delivery Agent",
        "partner": "Partner Agent",
        "pm": "PM Agent",
        "product manager": "PM Agent",
        "specialist": "Specialist Agent",
    }

    # Team mapping
    TEAM_MAPPING = {
        "SA Agent": "solution_architects",
        "AE Agent": "sales",
        "CA Agent": "customer_success",
        "CI Agent": "competitive_intelligence",
        "InfoSec Agent": "infosec",
        "Delivery Agent": "delivery",
        "Partner Agent": "partners",
        "PM Agent": "product",
        "Specialist Agent": "specialists",
    }

    def __init__(self, teams_path: Optional[Path] = None):
        """
        Initialize the Agent Factory.

        Args:
            teams_path: Path to teams directory
        """
        if teams_path is None:
            teams_path = Path(__file__).parent.parent.parent / "teams"
        self.teams_path = teams_path

    def agent_exists(self, agent_name: str) -> bool:
        """
        Check if an agent already exists.

        Args:
            agent_name: Name or identifier of the agent

        Returns:
            True if agent exists
        """
        normalized = self._normalize_agent_name(agent_name)
        return normalized in self.KNOWN_AGENTS.values()

    def get_agent_for_role(self, role_description: str) -> Optional[str]:
        """
        Get existing agent that can fulfill a role.

        Args:
            role_description: Description of the role needed

        Returns:
            Agent name if found, None otherwise
        """
        normalized = self._normalize_agent_name(role_description)
        return self.KNOWN_AGENTS.get(normalized.lower())

    def create_agent(
        self,
        agent_name: str,
        source_process: Dict,
        actor: str = "orchestration_agent"
    ) -> str:
        """
        Create a new agent based on process requirements.

        Args:
            agent_name: Desired name for the agent
            source_process: Process definition that requires this agent
            actor: Who is creating the agent

        Returns:
            Created agent ID
        """
        # Normalize the name
        normalized_name = self._normalize_agent_name(agent_name)

        # Check if we should map to existing agent
        existing = self.get_agent_for_role(normalized_name)
        if existing:
            return existing

        # Generate new agent definition
        agent_def = self._generate_agent_definition(normalized_name, source_process)

        # Create folder structure
        self._create_agent_folders(agent_def)

        # Generate configuration file
        self._generate_config_file(agent_def)

        # Generate personality file if applicable
        if agent_def.personality_traits:
            self._generate_personality_file(agent_def)

        # Register in catalog
        self._register_agent(agent_def)

        # Add to known agents
        self.KNOWN_AGENTS[normalized_name.lower()] = agent_def.agent_id

        return agent_def.agent_id

    def _normalize_agent_name(self, name: str) -> str:
        """Normalize agent name for lookup/creation"""
        if not name:
            return ""

        name = name.strip()

        # Remove common suffixes
        for suffix in [" Agent", " agent", "_agent", "_Agent"]:
            if name.endswith(suffix):
                name = name[:-len(suffix)]

        return name

    def _generate_agent_definition(
        self,
        agent_name: str,
        source_process: Dict
    ) -> AgentDefinition:
        """Generate agent definition from process"""

        # Extract purpose from process
        purpose = f"Agent created to handle: {source_process.get('name', 'Unknown process')}"

        # Extract functions from process steps
        core_functions = []
        for step in source_process.get("steps", []):
            action = step.get("action", "execute")
            name = step.get("name", "")
            core_functions.append(f"{action}: {name}")

        # Extract inputs/outputs
        inputs = []
        outputs = []

        for step in source_process.get("steps", []):
            for inp in step.get("inputs", []):
                if isinstance(inp, dict):
                    inputs.append(inp.get("artifact", "input"))
                else:
                    inputs.append(str(inp))

            for out in step.get("outputs", []):
                if isinstance(out, dict):
                    outputs.append(out.get("artifact", "output"))
                else:
                    outputs.append(str(out))

        # Determine team
        team = self._determine_team(agent_name, source_process)

        return AgentDefinition(
            agent_id=f"{agent_name} Agent",
            team=team,
            purpose=purpose,
            core_functions=core_functions[:10],  # Limit to 10
            inputs=list(set(inputs))[:10],
            outputs=list(set(outputs))[:10],
            created_from=source_process.get("process_id", "unknown"),
            personality_traits=self._generate_personality_traits(agent_name)
        )

    def _determine_team(self, agent_name: str, source_process: Dict) -> str:
        """Determine which team the agent belongs to"""
        name_lower = agent_name.lower()

        # Check known mappings
        for known, team in self.TEAM_MAPPING.items():
            if name_lower in known.lower():
                return team

        # Infer from process tags
        tags = source_process.get("metadata", {}).get("tags", [])
        if "presales" in tags or "sales" in tags:
            return "sales"
        if "postsales" in tags or "customer" in tags:
            return "customer_success"
        if "technical" in tags or "architecture" in tags:
            return "solution_architects"

        return "specialists"  # Default

    def _generate_personality_traits(self, agent_name: str) -> Optional[Dict]:
        """Generate personality traits for the agent"""
        # Only strategic agents get personalities
        if agent_name.lower() in ["governance", "registrar", "tracker"]:
            return None

        return {
            "communication_style": "professional",
            "tone": "helpful and precise",
            "expertise_level": "expert",
            "collaboration_approach": "proactive"
        }

    def _create_agent_folders(self, agent_def: AgentDefinition):
        """Create folder structure for new agent"""
        team_path = self.teams_path / agent_def.team

        # Create team folder if needed
        team_path.mkdir(parents=True, exist_ok=True)

        # Create agent subfolder
        agent_folder = team_path / "agents"
        agent_folder.mkdir(exist_ok=True)

        # Create personalities folder if needed
        if agent_def.personality_traits:
            personalities_folder = team_path / "personalities"
            personalities_folder.mkdir(exist_ok=True)

    def _generate_config_file(self, agent_def: AgentDefinition):
        """Generate agent configuration YAML"""
        config = {
            "agent_id": agent_def.agent_id,
            "team": agent_def.team,
            "purpose": agent_def.purpose,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "created_by": "orchestration_agent",
            "created_from_process": agent_def.created_from,
            "status": "pending_approval",
            "core_functions": agent_def.core_functions,
            "mechanics": [
                "Process inputs according to playbooks",
                "Generate outputs as specified",
                "Escalate when blocked or uncertain"
            ],
            "inputs": agent_def.inputs,
            "outputs": agent_def.outputs,
            "escalation_to": "Senior Manager Agent",
            "playbooks": {
                "associated": [],
                "can_trigger": []
            }
        }

        # Write config file
        config_path = self.teams_path / agent_def.team / "agents" / f"{agent_def.agent_id.lower().replace(' ', '_')}.yaml"
        with open(config_path, 'w') as f:
            yaml.dump(config, f, default_flow_style=False, sort_keys=False)

    def _generate_personality_file(self, agent_def: AgentDefinition):
        """Generate personality YAML for the agent"""
        if not agent_def.personality_traits:
            return

        personality = {
            "agent_id": agent_def.agent_id,
            "traits": agent_def.personality_traits,
            "background": f"Expert in {agent_def.team} operations",
            "communication_guidelines": [
                "Be clear and concise",
                "Provide actionable insights",
                "Acknowledge uncertainty when present"
            ],
            "created_at": datetime.utcnow().isoformat() + "Z"
        }

        # Write personality file
        personality_path = self.teams_path / agent_def.team / "personalities" / f"{agent_def.agent_id.lower().replace(' ', '_')}_personality.yaml"
        with open(personality_path, 'w') as f:
            yaml.dump(personality, f, default_flow_style=False, sort_keys=False)

    def _register_agent(self, agent_def: AgentDefinition):
        """Register agent in the catalog"""
        catalog_path = self.teams_path.parent / "config" / "agent_catalog.yaml"

        # Load existing catalog
        catalog = {}
        if catalog_path.exists():
            with open(catalog_path, 'r') as f:
                catalog = yaml.safe_load(f) or {}

        # Add new agent
        if "agents" not in catalog:
            catalog["agents"] = {}

        catalog["agents"][agent_def.agent_id] = {
            "team": agent_def.team,
            "purpose": agent_def.purpose,
            "status": "pending_approval",
            "created_from": agent_def.created_from,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }

        # Save updated catalog
        catalog_path.parent.mkdir(parents=True, exist_ok=True)
        with open(catalog_path, 'w') as f:
            yaml.dump(catalog, f, default_flow_style=False, sort_keys=False)
