"""
Unit tests for DLL (Decision Logic Language) Evaluator
"""

import pytest
import json
from pathlib import Path
from core.playbook_engine.dll_evaluator import DLLEvaluator


@pytest.fixture
def evaluator():
    """Create DLL evaluator instance."""
    return DLLEvaluator()


@pytest.fixture
def context_minimal():
    """Load minimal test context."""
    fixtures_dir = Path(__file__).parent / 'fixtures'
    with open(fixtures_dir / 'context_minimal.json') as f:
        return json.load(f)


@pytest.fixture
def context_realistic():
    """Load realistic test context."""
    fixtures_dir = Path(__file__).parent / 'fixtures'
    with open(fixtures_dir / 'context_realistic.json') as f:
        return json.load(f)


class TestDLLEvaluatorBasics:
    """Test basic DLL evaluation."""

    def test_exists_check_true(self, evaluator, context_minimal):
        """Test EXISTS check returns true when path exists."""
        result = evaluator.evaluate("$.swot.strengths EXISTS", context_minimal)
        assert result is True

    def test_exists_check_false(self, evaluator, context_minimal):
        """Test EXISTS check returns false when path missing."""
        result = evaluator.evaluate("$.swot.nonexistent EXISTS", context_minimal)
        assert result is False

    def test_not_exists_check(self, evaluator, context_minimal):
        """Test NOT EXISTS check."""
        result = evaluator.evaluate("$.swot.nonexistent NOT EXISTS", context_minimal)
        assert result is True

    def test_comparison_greater_than(self, evaluator, context_minimal):
        """Test > comparison."""
        result = evaluator.evaluate("$.swot.strengths.count > 0", context_minimal)
        assert result is True

        result = evaluator.evaluate("$.swot.threats.count > 0", context_minimal)
        assert result is False

    def test_comparison_greater_equal(self, evaluator, context_minimal):
        """Test >= comparison."""
        result = evaluator.evaluate("$.swot.strengths.count >= 1", context_minimal)
        assert result is True

    def test_comparison_less_than(self, evaluator, context_realistic):
        """Test < comparison."""
        result = evaluator.evaluate("$.swot.threats.count < 3", context_realistic)
        assert result is True

    def test_comparison_equal(self, evaluator, context_minimal):
        """Test == comparison."""
        result = evaluator.evaluate("$.swot.strengths.count == 1", context_minimal)
        assert result is True

        result = evaluator.evaluate("$.swot.strengths.count == 0", context_minimal)
        assert result is False

    def test_comparison_not_equal(self, evaluator, context_minimal):
        """Test != comparison."""
        result = evaluator.evaluate("$.swot.threats.count != 0", context_minimal)
        assert result is False

        result = evaluator.evaluate("$.swot.strengths.count != 0", context_minimal)
        assert result is True


class TestDLLEvaluatorJSONPath:
    """Test JSONPath query evaluation."""

    def test_jsonpath_length(self, evaluator, context_realistic):
        """Test .length pseudo-property."""
        # Count high-severity risks
        result = evaluator.evaluate("$.risks[?(@.severity=='HIGH')].length > 0", context_realistic)
        assert result is True

        # Count risks that don't exist
        result = evaluator.evaluate("$.risks[?(@.severity=='CRITICAL')].length > 0", context_realistic)
        assert result is False

    def test_jsonpath_nested_access(self, evaluator, context_realistic):
        """Test nested property access."""
        result = evaluator.evaluate("$.account_overview.arr > 500000", context_realistic)
        assert result is True

    def test_jsonpath_array_filter(self, evaluator, context_realistic):
        """Test array filtering in JSONPath."""
        # Filter SWOT items by category
        result = evaluator.evaluate("$.swot.strengths.items[?(@.category=='technical')].length > 0", context_realistic)
        assert result is True


class TestDLLEvaluatorBoolean:
    """Test boolean operators (AND, OR)."""

    def test_and_operator(self, evaluator, context_realistic):
        """Test AND operator."""
        # Both conditions true
        result = evaluator.evaluate(
            "$.swot.strengths.count > 0 AND $.swot.weaknesses.count > 0",
            context_realistic
        )
        assert result is True

        # One condition false
        result = evaluator.evaluate(
            "$.swot.strengths.count > 10 AND $.swot.weaknesses.count > 0",
            context_realistic
        )
        assert result is False

    def test_or_operator(self, evaluator, context_realistic):
        """Test OR operator."""
        # At least one true
        result = evaluator.evaluate(
            "$.swot.strengths.count > 10 OR $.swot.weaknesses.count > 0",
            context_realistic
        )
        assert result is True

        # Both false
        result = evaluator.evaluate(
            "$.swot.strengths.count > 10 OR $.swot.threats.count > 10",
            context_realistic
        )
        assert result is False


class TestDLLEvaluatorEdgeCases:
    """Test edge cases and error handling."""

    def test_missing_path_returns_false(self, evaluator, context_minimal):
        """Test that missing paths in comparisons return false."""
        result = evaluator.evaluate("$.nonexistent.path > 0", context_minimal)
        assert result is False

    def test_invalid_syntax_raises_error(self, evaluator, context_minimal):
        """Test that invalid syntax raises ValueError."""
        with pytest.raises(ValueError):
            evaluator.evaluate("invalid condition", context_minimal)

    def test_literal_value_parsing(self, evaluator, context_realistic):
        """Test parsing of literal values (numbers, strings, booleans)."""
        # Float comparison
        result = evaluator.evaluate("$.account_overview.arr > 500000.5", context_realistic)
        assert result is True

        # String comparison (if we had string fields)
        # Boolean comparison (if we had boolean fields)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
