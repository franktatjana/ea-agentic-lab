"""
Playbook Loader - Load and validate playbook YAML files

Enforces standardized schema defined in PLAYBOOK_EXECUTION_SPECIFICATION.md
"""

from pathlib import Path
from typing import Dict, Any, List
import yaml


class PlaybookLoader:
    """Load and validate playbook YAML files."""

    # Required fields (fail if missing)
    REQUIRED_FIELDS = [
        'framework_name',
        'framework_source',
        'playbook_mode',
        'intended_agent_role',
        'primary_objective',
        'validation_inputs',
        'validation_outputs',
        'validation_checks',
        'framework_reference',
        'last_updated',
        'version',
        'status',
    ]

    # Mode-specific required fields
    VALIDATION_MODE_FIELDS = ['validation_criteria', 'gap_detection', 'validation_frequency']
    GENERATIVE_MODE_FIELDS = ['trigger_conditions', 'decision_logic']

    def __init__(self, playbook_dir: Path = None):
        """
        Initialize loader.

        Args:
            playbook_dir: Root directory containing playbooks
        """
        self.playbook_dir = playbook_dir or Path(__file__).parent.parent.parent / 'playbooks'

    def load(self, playbook_path: Path) -> Dict[str, Any]:
        """
        Load and validate playbook.

        Args:
            playbook_path: Path to playbook YAML file

        Returns:
            Parsed playbook as dict

        Raises:
            FileNotFoundError: If playbook file doesn't exist
            ValueError: If playbook schema validation fails
        """
        if not playbook_path.exists():
            raise FileNotFoundError(f"Playbook not found: {playbook_path}")

        # Load YAML
        with open(playbook_path, 'r') as f:
            playbook = yaml.safe_load(f)

        # Validate schema
        self._validate_schema(playbook, playbook_path)

        return playbook

    def _validate_schema(self, playbook: Dict[str, Any], path: Path):
        """
        Validate playbook against schema.

        Args:
            playbook: Parsed playbook dict
            path: Path to playbook (for error messages)

        Raises:
            ValueError: If schema validation fails
        """
        errors = []

        # Check required fields
        for field in self.REQUIRED_FIELDS:
            if field not in playbook:
                errors.append(f"Missing required field: {field}")

        # Check mode-specific fields
        mode = playbook.get('playbook_mode')
        if mode == 'VALIDATION':
            for field in self.VALIDATION_MODE_FIELDS:
                if field not in playbook:
                    errors.append(f"Missing validation mode field: {field}")
        elif mode == 'GENERATIVE':
            for field in self.GENERATIVE_MODE_FIELDS:
                if field not in playbook:
                    errors.append(f"Missing generative mode field: {field}")
        else:
            errors.append(f"Invalid playbook_mode: {mode} (must be VALIDATION or GENERATIVE)")

        # Validate metadata
        if 'last_updated' in playbook:
            # Basic date format check (YYYY-MM-DD)
            date_str = playbook['last_updated']
            if not isinstance(date_str, str) or len(date_str) != 10 or date_str.count('-') != 2:
                errors.append(f"Invalid date format: {date_str} (must be YYYY-MM-DD)")

        if 'version' in playbook:
            version = playbook['version']
            if not isinstance(version, str) or '.' not in version:
                errors.append(f"Invalid version format: {version} (must be X.Y)")

        # Raise if any errors
        if errors:
            error_msg = f"Playbook schema validation failed for {path.name}:\n"
            error_msg += "\n".join(f"  - {e}" for e in errors)
            raise ValueError(error_msg)

    def load_by_id(self, playbook_id: str) -> Dict[str, Any]:
        """
        Load playbook by ID (searches in playbook_dir).

        Args:
            playbook_id: Playbook ID (e.g., "PB_001", "PB_201")

        Returns:
            Parsed playbook as dict

        Raises:
            FileNotFoundError: If playbook not found
        """
        # Search in executable and validation directories
        search_paths = [
            self.playbook_dir / 'executable' / f'{playbook_id}_*.yaml',
            self.playbook_dir / 'validation' / f'{playbook_id}_*.yaml',
        ]

        for pattern in search_paths:
            matches = list(pattern.parent.glob(pattern.name))
            if matches:
                return self.load(matches[0])

        raise FileNotFoundError(f"Playbook {playbook_id} not found in {self.playbook_dir}")

    def list_playbooks(self) -> List[Dict[str, Any]]:
        """
        List all playbooks in playbook_dir.

        Returns:
            List of dicts with playbook metadata
        """
        playbooks = []

        for subdir in ['executable', 'validation']:
            dir_path = self.playbook_dir / subdir
            if not dir_path.exists():
                continue

            for yaml_file in dir_path.glob('*.yaml'):
                try:
                    playbook = self.load(yaml_file)
                    playbooks.append({
                        'id': yaml_file.stem,
                        'name': playbook['framework_name'],
                        'mode': playbook['playbook_mode'],
                        'agent': playbook['intended_agent_role'],
                        'path': str(yaml_file),
                    })
                except Exception as e:
                    # Skip invalid playbooks
                    print(f"Warning: Could not load {yaml_file}: {e}")

        return playbooks
