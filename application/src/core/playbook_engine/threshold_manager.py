"""
Threshold Manager - Load and substitute threshold values

Reads thresholds from domain/config/playbook_thresholds.yaml and injects them
into playbook conditions and context.

Purpose:
    Externalize business parameters from playbook logic so they can be:
    1. Changed without modifying playbook YAML
    2. A/B tested with different values
    3. Overridden per-playbook while sharing global defaults

Config Structure (playbook_thresholds.yaml):
    global_thresholds:          # Shared across all playbooks
        minimum_account_arr: 500000
        renewal_warning_days: 90

    PB_001_three_horizons:      # Playbook-specific (overrides global)
        horizon_1_concentration_max: 0.80

Usage in Playbook Conditions:
    Before: "$.horizon_1.arr_percentage > ${thresholds.horizon_1_concentration_max}"
    After:  "$.horizon_1.arr_percentage > 0.80"

Lookup Order:
    1. Playbook-specific threshold (PB_xxx section)
    2. Global threshold (global_thresholds section)
    3. KeyError if not found
"""

from pathlib import Path
from typing import Dict, Any
import yaml
import re


class ThresholdManager:
    """Manage configurable thresholds for playbooks."""

    def __init__(self, config_path: Path = None):
        """
        Initialize threshold manager.

        Args:
            config_path: Path to playbook_thresholds.yaml
        """
        if config_path is None:
            # application/src/core/playbook_engine → domain/config
            config_path = Path(__file__).parent.parent.parent.parent.parent / 'domain' / 'config' / 'playbook_thresholds.yaml'

        self.config_path = config_path
        self.thresholds = self._load_thresholds()

    def _load_thresholds(self) -> Dict[str, Any]:
        """Load thresholds from YAML config."""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Threshold config not found: {self.config_path}")

        with open(self.config_path, 'r') as f:
            return yaml.safe_load(f)

    def get(self, playbook_id: str, threshold_key: str) -> Any:
        """
        Get threshold value for playbook.

        Args:
            playbook_id: Playbook ID (e.g., "PB_001_three_horizons")
            threshold_key: Threshold key (e.g., "horizon_1_concentration_max")

        Returns:
            Threshold value

        Raises:
            KeyError: If playbook or threshold key not found
        """
        # Try playbook-specific thresholds
        if playbook_id in self.thresholds:
            if threshold_key in self.thresholds[playbook_id]:
                return self.thresholds[playbook_id][threshold_key]

        # Try global thresholds
        if 'global_thresholds' in self.thresholds:
            if threshold_key in self.thresholds['global_thresholds']:
                return self.thresholds['global_thresholds'][threshold_key]

        raise KeyError(f"Threshold not found: {playbook_id}.{threshold_key}")

    def substitute_condition(self, condition: str, playbook_id: str) -> str:
        """
        Substitute ${thresholds.key} placeholders in condition.

        Args:
            condition: DLL condition with placeholders
                Example: "$.horizon_1.arr_percentage > ${thresholds.horizon_1_concentration_max}"

            playbook_id: Playbook ID for threshold lookup

        Returns:
            Condition with placeholders replaced by actual values
                Example: "$.horizon_1.arr_percentage > 0.80"
        """
        # Find all ${thresholds.xxx} patterns
        pattern = r'\$\{thresholds\.([a-z_0-9]+)\}'
        matches = re.findall(pattern, condition)

        # Replace each placeholder
        result = condition
        for threshold_key in matches:
            try:
                value = self.get(playbook_id, threshold_key)
                placeholder = f'${{thresholds.{threshold_key}}}'
                result = result.replace(placeholder, str(value))
            except KeyError:
                # Leave placeholder if threshold not found (will fail during evaluation)
                pass

        return result

    def inject_into_context(self, context: Dict[str, Any], playbook_id: str) -> Dict[str, Any]:
        """
        Inject threshold values into context at $.thresholds path.

        This allows conditions to reference thresholds like:
            $.thresholds.horizon_1_concentration_max > 0.80

        Args:
            context: InfoHub data context
            playbook_id: Playbook ID for threshold lookup

        Returns:
            Context with thresholds injected
        """
        # Get playbook-specific thresholds
        playbook_thresholds = {}
        if playbook_id in self.thresholds:
            playbook_thresholds = self.thresholds[playbook_id].copy()

        # Merge with global thresholds (playbook-specific takes precedence)
        if 'global_thresholds' in self.thresholds:
            for key, value in self.thresholds['global_thresholds'].items():
                if key not in playbook_thresholds:
                    playbook_thresholds[key] = value

        # Inject into context
        context_with_thresholds = context.copy()
        context_with_thresholds['thresholds'] = playbook_thresholds

        return context_with_thresholds

    def get_all_for_playbook(self, playbook_id: str) -> Dict[str, Any]:
        """
        Get all thresholds for a playbook (playbook-specific + global).

        Args:
            playbook_id: Playbook ID

        Returns:
            Dict of all applicable thresholds
        """
        all_thresholds = {}

        # Start with global
        if 'global_thresholds' in self.thresholds:
            all_thresholds.update(self.thresholds['global_thresholds'])

        # Override with playbook-specific
        if playbook_id in self.thresholds:
            all_thresholds.update(self.thresholds[playbook_id])

        return all_thresholds
