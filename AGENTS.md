# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

EA Agentic Lab is a single-product AI-assisted governance platform for enterprise account management. It has two required services (FastAPI backend + Next.js frontend) and no external dependencies (no database, no Redis, no LLM keys). All data is stored as YAML files on the filesystem in `vault/` and `domain/` directories.

### Running services

**FastAPI backend** (port 8000):
```
DEBUG=true python3 -m uvicorn application.src.api.main:app --reload --host 0.0.0.0 --port 8000
```
- `DEBUG=true` is required; without it, the app raises a `ValueError` for the default `secret_key` in production mode.
- Run from the repository root (`/workspace`).

**Next.js frontend** (port 3000):
```
cd application/frontend && npm run dev
```
- The frontend proxies `/api/*` requests to `http://localhost:8000` via `next.config.ts` rewrites. The backend must be running first.

### Lint, test, build

- **Lint (frontend):** `cd application/frontend && npx eslint .` — Pre-existing warnings/errors exist (13 errors, 34 warnings as of setup); all are in the existing codebase.
- **Tests (Python):** `DEBUG=true python3 -m pytest application/tests/ -v --ignore=application/tests/test_dll_evaluator.py --ignore=application/tests/test_playbook_integration.py --ignore=application/tests/test_evidence_validator.py --ignore=application/tests/test_threshold_manager.py` — 4 test files have a pre-existing `ImportError` due to a relative import issue in `knowledge_enricher.py` and must be excluded. The remaining ~1083 tests pass (4 pre-existing failures in domain wiring tests).
- **Build (frontend):** `cd application/frontend && npx next build`

### Gotchas

- Python is available as `python3` (not `python`) in the Cloud Agent environment.
- `pytest` and `httpx` are not listed in `requirements.txt` but are needed to run tests; the update script installs them.
- The 4 excluded test files all fail due to the same root cause: `application/src/core/playbook_engine/knowledge_enricher.py` uses `from ...api.services.knowledge_service import get_knowledge_service` which is a relative import beyond the top-level package when tests add `application/src` to `sys.path`. This is a known pre-existing issue.
