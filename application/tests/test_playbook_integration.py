"""
Integration Tests - End-to-End Playbook Execution

Tests the complete vertical slice:
1. Load playbook (SWOT v2)
2. Load thresholds
3. Evaluate decision logic
4. Generate outputs
5. Validate evidence
6. Write files to disk following output contract
"""

import pytest
import json
from pathlib import Path
import shutil

from core.playbook_engine import PlaybookExecutor


@pytest.fixture
def project_root():
    """Get project root directory (ea-agentic-lab/)."""
    return Path(__file__).parent.parent.parent


@pytest.fixture
def playbooks_dir(project_root):
    """Get playbooks directory."""
    return project_root / 'domain' / 'playbooks'


@pytest.fixture
def thresholds_config(project_root):
    """Get thresholds config path."""
    return project_root / 'domain' / 'config' / 'playbook_thresholds.yaml'


@pytest.fixture
def runs_dir(project_root, tmp_path):
    """Get temporary runs directory for tests."""
    # Use pytest's tmp_path for isolation
    return tmp_path / 'runs'


@pytest.fixture
def executor(playbooks_dir, thresholds_config, runs_dir):
    """Create PlaybookExecutor instance."""
    return PlaybookExecutor(
        playbooks_dir=playbooks_dir,
        thresholds_config=thresholds_config,
        runs_dir=runs_dir
    )


@pytest.fixture
def context_realistic(project_root):
    """Load realistic C4 context."""
    fixtures_dir = project_root / 'application' / 'tests' / 'fixtures'
    with open(fixtures_dir / 'context_realistic.json') as f:
        return json.load(f)


class TestSWOTPlaybookIntegration:
    """Test SWOT playbook execution end-to-end."""

    def test_swot_execution_completes_successfully(self, executor, context_realistic):
        """Test that SWOT playbook executes without errors."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        assert result['status'] == 'completed'
        assert result['run_id'].endswith('_PB_201_c4')
        assert result['duration_seconds'] > 0

    def test_swot_fires_expected_rules(self, executor, context_realistic):
        """Test that SWOT playbook fires expected decision logic rules."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        # Should fire at least one rule with realistic C4 context
        assert len(result['fired_rules']) > 0

        # Check rule structure
        for rule in result['fired_rules']:
            assert 'rule_id' in rule
            assert 'condition' in rule
            assert 'result' in rule
            assert rule['result'] is True

    def test_swot_generates_outputs(self, executor, context_realistic):
        """Test that SWOT playbook generates output objects."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        # Should generate at least one output
        assert len(result['outputs']) > 0

        # Check output structure
        for output in result['outputs']:
            assert 'type' in output
            assert 'path' in output
            assert 'content' in output
            assert output['type'] in ['decision', 'risk', 'initiative', 'analysis']

    def test_swot_validates_evidence(self, executor, context_realistic):
        """Test that evidence validation passes for generated outputs."""
        # Should not raise ValueError from evidence validation
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        assert result['status'] == 'completed'

    def test_swot_writes_run_directory(self, executor, context_realistic, runs_dir):
        """Test that run directory is created with expected structure."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        run_dir = Path(result['run_dir'])
        assert run_dir.exists()
        assert run_dir.parent == runs_dir

    def test_swot_writes_metadata_file(self, executor, context_realistic):
        """Test that metadata.yaml is created with correct structure."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        run_dir = Path(result['run_dir'])
        metadata_path = run_dir / 'metadata.yaml'
        assert metadata_path.exists()

        # Verify metadata structure (basic checks)
        import yaml
        with open(metadata_path) as f:
            metadata = yaml.safe_load(f)

        assert metadata['run_id'] == result['run_id']
        assert metadata['playbook_id'] == 'PB_201'
        assert metadata['client_id'] == 'c4'
        assert metadata['status'] == 'completed'
        assert 'thresholds_used' in metadata
        assert 'outputs_generated' in metadata

    def test_swot_writes_trace_file(self, executor, context_realistic):
        """Test that trace.json is created with execution steps."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        run_dir = Path(result['run_dir'])
        trace_path = run_dir / 'trace.json'
        assert trace_path.exists()

        with open(trace_path) as f:
            trace = json.load(f)

        assert trace['run_id'] == result['run_id']
        assert 'execution_steps' in trace
        assert len(trace['execution_steps']) > 0
        assert 'execution_summary' in trace

        # Verify execution summary
        summary = trace['execution_summary']
        assert summary['status'] == 'completed'
        assert 'start_time' in summary
        assert 'end_time' in summary
        assert 'duration_seconds' in summary

    def test_swot_writes_report_file(self, executor, context_realistic):
        """Test that report.md is created."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        run_dir = Path(result['run_dir'])
        report_path = run_dir / 'report.md'
        assert report_path.exists()

        report_content = report_path.read_text()
        assert '# Playbook Run Report' in report_content
        assert result['run_id'] in report_content
        assert 'SWOT Analysis' in report_content

    def test_swot_writes_output_files(self, executor, context_realistic):
        """Test that output objects are written to disk."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        run_dir = Path(result['run_dir'])

        # Check that output files exist
        for output in result['outputs']:
            output_path = run_dir / output['path']
            assert output_path.exists()
            assert output_path.stat().st_size > 0

    def test_swot_output_directory_structure(self, executor, context_realistic):
        """Test that outputs/ directory has correct structure."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        run_dir = Path(result['run_dir'])
        outputs_dir = run_dir / 'outputs'
        assert outputs_dir.exists()

        # Check subdirectories based on output types
        output_types = set(o['type'] for o in result['outputs'])
        for output_type in output_types:
            type_dir = outputs_dir / f"{output_type}s"
            assert type_dir.exists()


class TestOutputContractCompliance:
    """Test that outputs comply with OUTPUT_CONTRACT.md specification."""

    def test_run_id_format(self, executor, context_realistic):
        """Test that run_id follows specified format."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        run_id = result['run_id']

        # Format: YYYY-MM-DD_HHMMSS_PB_XXX_client_id
        parts = run_id.split('_')
        assert len(parts) >= 4
        assert parts[2] == 'PB'
        assert parts[3] == '201'
        assert parts[4] == 'c4'

        # Date part should be valid
        date_part = parts[0]
        assert len(date_part) == 10  # YYYY-MM-DD
        assert date_part.count('-') == 2

        # Time part should be valid
        time_part = parts[1]
        assert len(time_part) == 6  # HHMMSS

    def test_run_directory_contains_required_files(self, executor, context_realistic):
        """Test that run directory contains all required files per contract."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        run_dir = Path(result['run_dir'])

        # Required files per OUTPUT_CONTRACT.md
        required_files = [
            'metadata.yaml',
            'trace.json',
            'report.md'
        ]

        for filename in required_files:
            assert (run_dir / filename).exists(), f"Missing required file: {filename}"

    def test_metadata_has_required_fields(self, executor, context_realistic):
        """Test that metadata.yaml has all required fields."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        run_dir = Path(result['run_dir'])
        metadata_path = run_dir / 'metadata.yaml'

        import yaml
        with open(metadata_path) as f:
            metadata = yaml.safe_load(f)

        # Required fields per OUTPUT_CONTRACT.md
        required_fields = [
            'run_id',
            'playbook_id',
            'playbook_name',
            'playbook_version',
            'client_id',
            'agent_role',
            'execution_timestamp',
            'execution_duration_seconds',
            'thresholds_used',
            'outputs_generated',
            'status',
            'errors',
            'warnings'
        ]

        for field in required_fields:
            assert field in metadata, f"Missing required field in metadata: {field}"

    def test_trace_has_required_structure(self, executor, context_realistic):
        """Test that trace.json has required structure."""
        result = executor.execute(
            playbook_id='PB_201',
            context=context_realistic,
            client_id='c4'
        )

        run_dir = Path(result['run_dir'])
        trace_path = run_dir / 'trace.json'

        with open(trace_path) as f:
            trace = json.load(f)

        # Required top-level fields
        assert 'run_id' in trace
        assert 'execution_steps' in trace
        assert 'execution_summary' in trace

        # Verify execution_steps structure
        for step in trace['execution_steps']:
            assert 'timestamp' in step
            assert 'step' in step
            assert 'status' in step
            assert 'details' in step

        # Verify execution_summary structure
        summary = trace['execution_summary']
        assert 'start_time' in summary
        assert 'end_time' in summary
        assert 'duration_seconds' in summary
        assert 'status' in summary


class TestErrorHandling:
    """Test error handling and failed runs."""

    def test_invalid_playbook_id_raises_error(self, executor, context_realistic):
        """Test that invalid playbook ID raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError):
            executor.execute(
                playbook_id='PB_999',
                context=context_realistic,
                client_id='c4'
            )

    def test_missing_context_data_handles_gracefully(self, executor):
        """Test execution with minimal/missing context data."""
        minimal_context = {
            'client_id': 'c4',
            'swot': {
                'strengths': {'count': 0, 'items': []},
                'weaknesses': {'count': 0, 'items': []},
                'opportunities': {'count': 0, 'items': []},
                'threats': {'count': 0, 'items': []}
            }
        }

        # Should complete but fire no rules
        result = executor.execute(
            playbook_id='PB_201',
            context=minimal_context,
            client_id='c4'
        )

        assert result['status'] == 'completed'
        assert len(result['fired_rules']) == 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
