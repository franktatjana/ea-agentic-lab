"""
Evidence Validator - Enforce evidence requirements

Validates that all output objects have evidence citations linking back to source data.
No unsourced claims allowed - this is the anti-hallucination safeguard.

Philosophy:
    "Humans decide. The system enforces discipline."
    Every claim in a playbook output MUST link back to source artifacts in InfoHub.
    This prevents agents from fabricating analysis or making unsupported claims.

Evidence Structure Required:
    {
        'source_artifact': 'infohub/ACME/SECURITY/meetings/2026-01-15.md',
        'date': '2026-01-15',
        'excerpt': 'Customer mentioned budget concerns...',
        'confidence': 'HIGH'  # HIGH | MEDIUM | LOW
    }

Fields Requiring Evidence:
    - SWOT: strengths, weaknesses, opportunities, threats
    - Analysis: decisions, recommendations, gaps
    - Risk outputs: risks

Validation Rules:
    1. Every item in evidence-required fields must have 'evidence' array
    2. Evidence array must be non-empty
    3. Each evidence object must have: source_artifact, date, excerpt
    4. Date must be YYYY-MM-DD format
    5. Confidence (if present) must be HIGH/MEDIUM/LOW
"""

from typing import Dict, Any, List


class EvidenceValidator:
    """Validate evidence requirements in playbook outputs."""

    # Fields that require evidence when non-empty
    EVIDENCE_REQUIRED_FIELDS = [
        'strengths', 'weaknesses', 'opportunities', 'threats',  # SWOT
        'opportunities', 'risks',  # Three Horizons
        'decisions', 'recommendations',  # Decisions
        'gaps',  # Validation outputs
    ]

    def __init__(self):
        """Initialize validator."""
        pass

    def validate(self, output: Dict[str, Any]) -> List[str]:
        """
        Validate output has evidence for all claims.

        Args:
            output: Playbook output dict

        Returns:
            List of validation errors (empty if valid)
        """
        errors = []

        # Check each evidence-required field
        for field in self.EVIDENCE_REQUIRED_FIELDS:
            if field in output and output[field]:
                # Field exists and is non-empty, check evidence
                field_errors = self._validate_field(field, output[field])
                errors.extend(field_errors)

        return errors

    def _validate_field(self, field_name: str, field_value: Any) -> List[str]:
        """
        Validate a specific field has evidence.

        Args:
            field_name: Name of field (for error messages)
            field_value: Value of field (list of dicts expected)

        Returns:
            List of validation errors
        """
        errors = []

        # Field value should be a list of objects
        if not isinstance(field_value, list):
            errors.append(f"{field_name}: Expected list of objects, got {type(field_value)}")
            return errors

        # Check each item in list
        for idx, item in enumerate(field_value):
            if not isinstance(item, dict):
                errors.append(f"{field_name}[{idx}]: Expected dict, got {type(item)}")
                continue

            # Check if evidence field exists
            if 'evidence' not in item:
                # Get description or name for better error message
                item_desc = item.get('description') or item.get('name') or item.get('title') or f"item {idx}"
                errors.append(f"{field_name}: '{item_desc}' lacks evidence field")
                continue

            # Check if evidence is non-empty
            evidence = item['evidence']
            if not evidence:
                item_desc = item.get('description') or item.get('name') or item.get('title') or f"item {idx}"
                errors.append(f"{field_name}: '{item_desc}' has empty evidence")
                continue

            # Validate evidence structure
            if not isinstance(evidence, list):
                item_desc = item.get('description') or item.get('name') or item.get('title') or f"item {idx}"
                errors.append(f"{field_name}: '{item_desc}' evidence must be a list")
                continue

            # Validate each evidence object
            for ev_idx, ev_obj in enumerate(evidence):
                ev_errors = self._validate_evidence_object(ev_obj, f"{field_name}[{idx}].evidence[{ev_idx}]")
                errors.extend(ev_errors)

        return errors

    def _validate_evidence_object(self, evidence: Any, path: str) -> List[str]:
        """
        Validate a single evidence object.

        Args:
            evidence: Evidence object (should be dict with required fields)
            path: Path for error messages

        Returns:
            List of validation errors
        """
        errors = []

        # Evidence must be a dict
        if not isinstance(evidence, dict):
            errors.append(f"{path}: Evidence must be dict, got {type(evidence)}")
            return errors

        # Required fields
        required_fields = ['source_artifact', 'date', 'excerpt']
        for field in required_fields:
            if field not in evidence:
                errors.append(f"{path}: Missing required field '{field}'")
            elif not evidence[field]:
                errors.append(f"{path}: Field '{field}' is empty")

        # Optional but recommended: confidence
        if 'confidence' in evidence:
            valid_confidences = ['HIGH', 'MEDIUM', 'LOW']
            if evidence['confidence'] not in valid_confidences:
                errors.append(f"{path}: Invalid confidence '{evidence['confidence']}' (must be HIGH|MEDIUM|LOW)")

        # Validate date format (basic check)
        if 'date' in evidence and evidence['date']:
            date_str = evidence['date']
            if not isinstance(date_str, str) or len(date_str) != 10 or date_str.count('-') != 2:
                errors.append(f"{path}: Invalid date format '{date_str}' (must be YYYY-MM-DD)")

        return errors

    def validate_or_raise(self, output: Dict[str, Any]):
        """
        Validate output and raise exception if invalid.

        Args:
            output: Playbook output dict

        Raises:
            ValueError: If validation fails
        """
        errors = self.validate(output)
        if errors:
            error_msg = "Evidence validation failed:\n"
            error_msg += "\n".join(f"  - {e}" for e in errors)
            raise ValueError(error_msg)
