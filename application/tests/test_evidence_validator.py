"""
Unit tests for Evidence Validator
"""

import pytest
from core.playbook_engine.evidence_validator import EvidenceValidator


@pytest.fixture
def validator():
    """Create EvidenceValidator instance."""
    return EvidenceValidator()


class TestEvidenceValidatorBasics:
    """Test basic evidence validation."""

    def test_valid_swot_with_evidence(self, validator):
        """Test valid SWOT output with proper evidence."""
        output = {
            "strengths": [
                {
                    "description": "Strong CTO relationship",
                    "evidence": [
                        {
                            "source_artifact": "daily_notes/2025-12-15.md",
                            "date": "2025-12-15",
                            "excerpt": "Monthly sync with CTO",
                            "confidence": "HIGH"
                        }
                    ]
                }
            ]
        }

        errors = validator.validate(output)
        assert len(errors) == 0

    def test_missing_evidence_field(self, validator):
        """Test that missing evidence field is caught."""
        output = {
            "strengths": [
                {
                    "description": "Strong relationship"
                    # Missing evidence field
                }
            ]
        }

        errors = validator.validate(output)
        assert len(errors) > 0
        assert "lacks evidence field" in errors[0]

    def test_empty_evidence_list(self, validator):
        """Test that empty evidence list is caught."""
        output = {
            "strengths": [
                {
                    "description": "Strong relationship",
                    "evidence": []  # Empty
                }
            ]
        }

        errors = validator.validate(output)
        assert len(errors) > 0
        assert "empty evidence" in errors[0].lower()

    def test_multiple_items_validated(self, validator):
        """Test that all items in list are validated."""
        output = {
            "strengths": [
                {
                    "description": "Item 1",
                    "evidence": [{"source_artifact": "a.md", "date": "2025-12-01", "excerpt": "text"}]
                },
                {
                    "description": "Item 2"
                    # Missing evidence
                }
            ]
        }

        errors = validator.validate(output)
        assert len(errors) == 1
        assert "Item 2" in errors[0]


class TestEvidenceObjectValidation:
    """Test evidence object structure validation."""

    def test_valid_evidence_object(self, validator):
        """Test valid evidence object structure."""
        output = {
            "opportunities": [
                {
                    "name": "GenAI search",
                    "evidence": [
                        {
                            "source_artifact": "InfoHub/clients/c4/notes.md",
                            "date": "2025-12-15",
                            "excerpt": "Customer interested in GenAI",
                            "confidence": "MEDIUM"
                        }
                    ]
                }
            ]
        }

        errors = validator.validate(output)
        assert len(errors) == 0

    def test_missing_required_evidence_fields(self, validator):
        """Test that missing required fields in evidence are caught."""
        output = {
            "weaknesses": [
                {
                    "description": "Performance issues",
                    "evidence": [
                        {
                            "source_artifact": "notes.md"
                            # Missing date and excerpt
                        }
                    ]
                }
            ]
        }

        errors = validator.validate(output)
        assert len(errors) >= 2  # Missing date and excerpt
        assert any("date" in e.lower() for e in errors)
        assert any("excerpt" in e.lower() for e in errors)

    def test_invalid_confidence_value(self, validator):
        """Test that invalid confidence values are caught."""
        output = {
            "threats": [
                {
                    "description": "Competitive threat",
                    "evidence": [
                        {
                            "source_artifact": "notes.md",
                            "date": "2025-12-15",
                            "excerpt": "Competitor mentioned",
                            "confidence": "VERY_HIGH"  # Invalid
                        }
                    ]
                }
            ]
        }

        errors = validator.validate(output)
        assert len(errors) > 0
        assert "confidence" in errors[0].lower()

    def test_invalid_date_format(self, validator):
        """Test that invalid date formats are caught."""
        output = {
            "risks": [
                {
                    "description": "Budget risk",
                    "evidence": [
                        {
                            "source_artifact": "notes.md",
                            "date": "12/15/2025",  # Wrong format
                            "excerpt": "Budget freeze"
                        }
                    ]
                }
            ]
        }

        errors = validator.validate(output)
        assert len(errors) > 0
        assert "date format" in errors[0].lower()


class TestValidateOrRaise:
    """Test validate_or_raise method."""

    def test_valid_output_does_not_raise(self, validator):
        """Test that valid output doesn't raise exception."""
        output = {
            "gaps": [
                {
                    "description": "Missing H2 opportunities",
                    "evidence": [
                        {
                            "source_artifact": "InfoHub/strategy/analysis.md",
                            "date": "2025-12-15",
                            "excerpt": "No expansion opportunities documented"
                        }
                    ]
                }
            ]
        }

        # Should not raise
        validator.validate_or_raise(output)

    def test_invalid_output_raises_valueerror(self, validator):
        """Test that invalid output raises ValueError."""
        output = {
            "decisions": [
                {
                    "title": "Adopt defensive strategy"
                    # Missing evidence
                }
            ]
        }

        with pytest.raises(ValueError) as exc_info:
            validator.validate_or_raise(output)

        assert "evidence validation failed" in str(exc_info.value).lower()


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
