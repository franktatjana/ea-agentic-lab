"""
Base Agent interface for EA Agentic Lab
All specialized agents inherit from this class
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import yaml
from pathlib import Path


@dataclass
class AgentConfig:
    """Configuration for an agent"""
    agent_id: str
    team: str
    purpose: str
    core_functions: List[str]
    mechanics: List[str]
    inputs: List[str]
    outputs: List[str]
    escalation_to: str
    personality_file: Optional[str] = None
    prompts_dir: Optional[str] = None
    playbooks: Optional[Dict[str, Any]] = None
    execution: Optional[Dict[str, Any]] = None


class BaseAgent(ABC):
    """
    Abstract base class for all agents in the system

    Each agent has:
    - A clear purpose
    - Core functions it performs
    - Input sources it monitors
    - Output artifacts it generates
    - Escalation path for critical issues
    """

    def __init__(self, config: AgentConfig):
        self.config = config
        self.agent_id = config.agent_id
        self.team = config.team
        self.personality = self._load_personality()
        self.execution_history: List[Dict] = []

    def _load_personality(self) -> Optional[Dict]:
        """Load personality configuration if specified"""
        if not self.config.personality_file:
            return None

        personality_path = Path(self.config.personality_file)
        if personality_path.exists():
            with open(personality_path, 'r') as f:
                return yaml.safe_load(f)
        return None

    @abstractmethod
    def process(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main processing method - must be implemented by each agent

        Args:
            inputs: Dictionary of input data

        Returns:
            Dictionary containing:
                - outputs: Generated artifacts
                - risks: Identified risks
                - actions: Required actions
                - escalations: Items requiring escalation
        """
        pass

    @abstractmethod
    def extract_signals(self, content: str) -> List[Dict]:
        """
        Extract relevant signals from content (notes, Slack, etc.)

        Returns list of signal dictionaries with:
            - type: signal type (risk, decision, action, etc.)
            - content: signal content
            - severity: importance level
            - source: where it came from
        """
        pass

    def log_execution(self, inputs: Dict, outputs: Dict, duration: float):
        """Log execution for tracking and improvement"""
        self.execution_history.append({
            'timestamp': datetime.now().isoformat(),
            'agent_id': self.agent_id,
            'inputs_summary': self._summarize_inputs(inputs),
            'outputs_summary': self._summarize_outputs(outputs),
            'duration_seconds': duration
        })

    def _summarize_inputs(self, inputs: Dict) -> str:
        """Create brief summary of inputs"""
        return f"{len(inputs)} input sources processed"

    def _summarize_outputs(self, outputs: Dict) -> str:
        """Create brief summary of outputs"""
        artifacts = outputs.get('outputs', {})
        risks = outputs.get('risks', [])
        return f"{len(artifacts)} artifacts, {len(risks)} risks identified"

    def escalate(self, issue: Dict) -> None:
        """
        Escalate critical issues

        Args:
            issue: Dictionary with:
                - type: issue type
                - severity: HIGH, MEDIUM, LOW
                - description: issue details
                - recommended_action: suggested next steps
        """
        print(f"⚠️  ESCALATION from {self.agent_id} to {self.config.escalation_to}")
        print(f"   Type: {issue.get('type')}")
        print(f"   Severity: {issue.get('severity')}")
        print(f"   Description: {issue.get('description')}")
        print(f"   Recommended: {issue.get('recommended_action')}")

    def get_status(self) -> Dict:
        """Get current agent status"""
        return {
            'agent_id': self.agent_id,
            'team': self.team,
            'purpose': self.config.purpose,
            'executions': len(self.execution_history),
            'last_run': self.execution_history[-1]['timestamp'] if self.execution_history else None
        }


def load_agent_config(config_path: Path) -> AgentConfig:
    """Load agent configuration from YAML file"""
    with open(config_path, 'r') as f:
        config_data = yaml.safe_load(f)

    return AgentConfig(**config_data)
