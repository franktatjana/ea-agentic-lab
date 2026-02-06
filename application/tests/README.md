# Test Suite

Unit and integration tests for the playbook execution engine.

## Running Tests

```bash
# From application/ directory with venv activated
source venv/bin/activate

# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_dll_evaluator.py -v

# Run with coverage
python -m pytest tests/ --cov=src/core/playbook_engine
```

## Test Structure

```text
tests/
├── conftest.py                    # Pytest configuration (path setup)
├── fixtures/                      # Test data
│   ├── context_minimal.json       # Minimal test context
│   └── context_realistic.json     # Realistic SWOT context
│
├── test_dll_evaluator.py          # DLL evaluation tests (16 tests)
├── test_threshold_manager.py      # Threshold management tests (9 tests)
├── test_evidence_validator.py     # Evidence validation tests (8 tests)
├── test_playbook_integration.py   # End-to-end integration tests (16 tests)
└── test_governance_orchestrator.py # Workflow orchestration tests (19 tests)
```

## Test Coverage

| Component | Tests | Coverage |
|-----------|-------|----------|
| DLL Evaluator | 16 | JSONPath, comparisons, AND/OR, EXISTS, edge cases |
| Threshold Manager | 9 | Global/playbook thresholds, substitution, injection |
| Evidence Validator | 8 | Evidence requirements, validation, error reporting |
| Playbook Integration | 16 | End-to-end execution, outputs, contracts |
| Governance Orchestrator | 19 | Workflows, dependencies, audit trail |
| **Total** | **68** | **All passing** |

## Fixtures

### context_minimal.json

Minimal test data for quick unit tests.

### context_realistic.json

Realistic pharmaceutical company data with:

- Complete SWOT (strengths, weaknesses, opportunities, threats)
- Evidence citations
- Risk objects
- Account overview data
