---
order: 7
---

# How to Debug an Agent

This guide is for developers investigating unexpected agent behavior in the EA Agentic Lab. When an agent produces wrong output, misses signals, or fails silently, the cause is usually one of a small set of failure modes. This guide covers how to identify which mode you are in, how to read agent logs, and how to inspect the context the agent received.

## Prerequisites

- A running agent that has already produced output (or failed to)
- Access to the vault directory for the realm being debugged
- Python virtual environment activated (`source application/venv/bin/activate`)

---

## Common Failure Modes

### Hallucination

The agent produces a claim that has no basis in the input data. Common symptoms: an owner field names someone not mentioned in any meeting note, a risk is described in more detail than the source provides, or a source citation points to a file that does not exist.

Causes: the prompt lacks explicit anti-hallucination instructions, the knowledge base is empty so the LLM fills gaps from training data, or the input fixture does not contain enough signal for the agent to work with.

First check: compare the output field against the raw input. If the value does not appear verbatim or by direct inference in the source, it is a hallucination.

<!-- TODO: expand with working examples showing hallucination detection commands -->

### Wrong Skill Triggered

The agent selects a skill or runbook step that does not match the input context. This typically happens when signal detection patterns overlap between two skills, or when the trigger condition in the runbook definition is too broad.

First check: inspect the signal match log (see [Reading Agent Logs](#reading-agent-logs)) and find which pattern fired. Then compare the pattern regex against the input content in `--verbose` mode.

```bash
python application/scripts/run_sa_agent.py \
  --realm ACME_CORP \
  --verbose \
  2>&1 | grep "signal_match"
```

<!-- TODO: expand with working examples showing pattern debug output -->

### Tool Timeout

An external tool call (CRM read, InfoHub write, Slack notify) does not return within the expected window. The agent either hangs, produces partial output, or logs a timeout error and continues without the tool result.

First check: look for `TOOL_TIMEOUT` or `connection refused` in the agent log. Then verify the tool endpoint is reachable and that credentials in `.env` are valid.

```bash
# Check tool connectivity
python application/scripts/check_tools.py --agent rfp_agent

# Review tool error in log
grep "TOOL_TIMEOUT\|connection refused" data/{realm}/logs/{agent}.log
```

<!-- TODO: expand with working examples showing tool health check output and retry config -->

### No Output Produced

The agent runs without error but writes nothing to the vault. This usually means the input contained no signals matching the agent's detection patterns, or the required input files were missing or malformatted.

First check: confirm that `vault/{realm}/{node}/raw/meetings/` contains files with valid YAML frontmatter including the `tags` field. Then run with `--verbose` to see which files the agent loaded and which patterns it evaluated.

```bash
ls vault/{realm}/{node}/raw/meetings/
python application/scripts/run_sa_agent.py --realm {realm} --verbose
```

<!-- TODO: expand with working examples showing frontmatter requirements and verbose output format -->

---

## Reading Agent Logs

Agent logs are written to `data/{realm}/logs/{agent_name}.log`. Each run appends to the log with a timestamp header. Log lines follow a structured format:

```text
[2026-03-12T09:14:22] INFO  sa_agent  realm=ACME_CORP  node=MAIN  event=run_start
[2026-03-12T09:14:23] INFO  sa_agent  event=file_loaded  file=2026-01-15_technical_deep_dive.md
[2026-03-12T09:14:23] DEBUG sa_agent  event=signal_match  pattern=decision  priority=high  content="DECISION: Use centralized agent"
[2026-03-12T09:14:24] INFO  sa_agent  event=output_written  artifact=risk_register  path=vault/ACME_CORP/MAIN/internal-infohub/risks/risk_register.yaml
[2026-03-12T09:14:24] INFO  sa_agent  event=run_complete  duration_ms=1842  signals_matched=3  outputs_written=2
```

Key events to look for:

| Event | What It Tells You |
|-------|------------------|
| `file_loaded` | Which input files the agent processed |
| `signal_match` | Which patterns fired and on what content |
| `tool_call` | Which external tools were invoked |
| `tool_timeout` | A tool call that did not return in time |
| `output_written` | Which artifacts were saved and where |
| `run_complete` | Summary counts for the run |

<!-- TODO: expand with working examples showing how to filter log output by event type -->

---

## Inspecting Agent Context

Context is what the agent receives before it runs: the input data, the loaded knowledge, and the resolved configuration. Inspecting context tells you whether the agent had what it needed before any inference happened.

```bash
# Dump the context the agent built before running
python application/scripts/run_sa_agent.py \
  --realm ACME_CORP \
  --dry-run \
  --dump-context \
  > /tmp/agent_context.yaml

# Review what was loaded
cat /tmp/agent_context.yaml
```

Check the context dump for:
- `inputs.files`: list of meeting note files loaded (should be non-empty)
- `knowledge`: knowledge files loaded and their content summaries
- `config.signal_patterns`: the patterns the agent will try to match
- `config.escalation_triggers`: the conditions that would fire escalation

If a knowledge file shows as loaded but empty, the file exists but has no content. If a signal pattern is absent, check that the agent YAML includes it.

<!-- TODO: expand with working examples showing full context dump format and common gaps -->

---

## Debugging Checklist

Work through these steps in order to narrow down the cause:

- [ ] Run with `--verbose` and confirm which files were loaded
- [ ] Check `data/{realm}/logs/{agent}.log` for `TOOL_TIMEOUT` or error events
- [ ] Confirm input files have valid YAML frontmatter with `tags` field
- [ ] Run `--dry-run --dump-context` and verify knowledge files are populated
- [ ] Check signal patterns cover the content you expect the agent to detect
- [ ] Compare output fields against input source to rule out hallucination
- [ ] If a tool failed, verify `.env` credentials and run `check_tools.py`

---

## Related Documentation

- [How to Run an Agent](run-agent.md)
- [How to Test an Agent](test-agent.md)
- [How to Configure an Agent](configure-agent.md)
- [Agent Architecture](../../architecture/agents/agent-architecture.md)
