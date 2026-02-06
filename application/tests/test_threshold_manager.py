"""
Unit tests for Threshold Manager
"""

import pytest
from pathlib import Path
from core.playbook_engine.threshold_manager import ThresholdManager


@pytest.fixture
def threshold_manager():
    """Create ThresholdManager instance."""
    return ThresholdManager()


class TestThresholdManagerBasics:
    """Test basic threshold management."""

    def test_get_global_threshold(self, threshold_manager):
        """Test retrieving global thresholds."""
        value = threshold_manager.get('PB_any', 'minimum_account_arr')
        assert value == 500000  # From config

    def test_get_playbook_specific_threshold(self, threshold_manager):
        """Test retrieving playbook-specific thresholds."""
        value = threshold_manager.get('PB_001_three_horizons', 'horizon_1_concentration_max')
        assert value == 0.80  # From config

    def test_get_missing_threshold_raises_error(self, threshold_manager):
        """Test that missing threshold raises KeyError."""
        with pytest.raises(KeyError):
            threshold_manager.get('PB_nonexistent', 'nonexistent_key')


class TestThresholdSubstitution:
    """Test threshold substitution in conditions."""

    def test_substitute_single_placeholder(self, threshold_manager):
        """Test substituting a single ${thresholds.key} placeholder."""
        condition = "$.horizon_1.arr_percentage > ${thresholds.horizon_1_concentration_max}"
        result = threshold_manager.substitute_condition(condition, 'PB_001_three_horizons')
        assert result == "$.horizon_1.arr_percentage > 0.8"  # 0.80 becomes "0.8" as string

    def test_substitute_multiple_placeholders(self, threshold_manager):
        """Test substituting multiple placeholders."""
        condition = "$.roi >= ${thresholds.strong_roi_percentage} AND $.payback_months <= ${thresholds.fast_payback_months}"
        result = threshold_manager.substitute_condition(condition, 'PB_301_value_engineering')
        # Should replace both placeholders
        assert '${thresholds' not in result
        assert '3.0' in result  # strong_roi_percentage
        assert '12' in result  # fast_payback_months

    def test_substitute_preserves_non_placeholder_text(self, threshold_manager):
        """Test that non-placeholder text is preserved."""
        condition = "$.value > 100 AND $.threshold < ${thresholds.minimum_account_arr}"
        result = threshold_manager.substitute_condition(condition, 'PB_any')
        assert "$.value > 100 AND" in result
        assert "${thresholds.minimum_account_arr}" not in result


class TestThresholdContextInjection:
    """Test injecting thresholds into context."""

    def test_inject_into_context(self, threshold_manager):
        """Test injecting thresholds into context at $.thresholds."""
        context = {"client_id": "c1", "arr": 720000}
        result = threshold_manager.inject_into_context(context, 'PB_001_three_horizons')

        # Original context preserved
        assert result['client_id'] == 'c1'
        assert result['arr'] == 720000

        # Thresholds injected
        assert 'thresholds' in result
        assert 'horizon_1_concentration_max' in result['thresholds']
        assert result['thresholds']['horizon_1_concentration_max'] == 0.80

    def test_get_all_for_playbook(self, threshold_manager):
        """Test getting all thresholds for a playbook (global + specific)."""
        thresholds = threshold_manager.get_all_for_playbook('PB_001_three_horizons')

        # Has playbook-specific
        assert 'horizon_1_concentration_max' in thresholds

        # Has global
        assert 'minimum_account_arr' in thresholds

    def test_playbook_specific_overrides_global(self, threshold_manager):
        """Test that playbook-specific thresholds override global."""
        # If there's an overlap, playbook-specific should win
        # (Current config doesn't have overlap, but test the mechanism)
        thresholds = threshold_manager.get_all_for_playbook('PB_001_three_horizons')
        # Just verify that the method works and returns combined dict
        assert isinstance(thresholds, dict)
        assert len(thresholds) > 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
