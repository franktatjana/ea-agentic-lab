---
order: 6
---

# How to Test an Agent

This guide is for developers who want to verify that an agent behaves correctly before running it against real vault data or deploying it to a shared environment. Testing an agent means checking three things: that a single prompt produces the expected output shape, that a skill sequences prompts correctly, and that a runbook handles the full scenario end to end.

## Prerequisites

- Working local environment (see [run-demo.md](run-demo.md))
- A configured agent with at least one runbook (see [configure-agent.md](configure-agent.md))
- Sample vault data for the realm you are testing against
- Python virtual environment activated (`source application/venv/bin/activate`)

---

## Test a Single Prompt

The fastest way to verify agent logic is to run one prompt in isolation against a small, controlled input. This isolates the LLM instruction from the surrounding orchestration so you can confirm the prompt produces the right structure before wiring it into a skill or runbook.

```bash
# Run a single prompt against a fixture file
python application/scripts/run_prompt.py \
  --agent sa_agent \
  --prompt analyze_decision \
  --input tests/fixtures/sample_note.md \
  --verbose
```

Expected output: a YAML or markdown block matching the output contract defined in the agent's personality file. If the output is missing required fields (owner, source citation, severity) or contains invented data, the prompt needs tightening before it is safe to chain.

<!-- TODO: expand with working examples showing prompt runner flags and fixture format -->

---

## Test a Skill

A skill sequences multiple prompts and may call external tools. Testing a skill confirms that data flows correctly between prompt steps and that tool calls resolve without errors. Skills are defined in `domain/agents/{team}/skills/` and registered in `domain/catalogs/skill_catalog.yaml`.

```bash
# Run a single skill
python application/scripts/run_skill.py \
  --agent sa_agent \
  --skill technical_risk_assessment \
  --realm TEST_REALM \
  --verbose
```

Check that:
1. Each step in the skill produces output consumed by the next step
2. Tool calls return data in the expected schema
3. The final output matches the skill's declared output contract
4. No step produces a hallucinated value (check source citations)

<!-- TODO: expand with working examples showing skill runner and how to inspect inter-step data -->

---

## Test a Runbook

A runbook sequences skills into a scenario workflow. Testing a runbook exercises the full agent behavior for one trigger scenario. Use a dedicated test realm so runbook outputs do not mix with real vault data.

```bash
# Create a test realm with fixture data
cp -r tests/fixtures/TEST_REALM vault/TEST_REALM

# Run the runbook
python application/scripts/run_runbook.py \
  --agent rfp_agent \
  --runbook bid_decisions \
  --realm TEST_REALM \
  --verbose

# Inspect outputs
ls vault/TEST_REALM/MAIN/internal-infohub/
```

<!-- TODO: expand with working examples showing runbook runner and output inspection commands -->

---

## What Good Output Looks Like

Every agent output is governed by an output contract. The contract is defined in the agent's personality file under `output_formats` and in the definition file under `outputs.artifacts`. A passing test means the output satisfies these conditions:

- All required fields are present and non-empty
- Every factual claim has a source citation pointing to input data
- No field contains data not present in the input (hallucination)
- Severity or priority labels match the defined vocabulary (high, medium, low)
- Owner fields contain a real agent ID or human role, not a placeholder

For a reference of the output contract format, see the agent's `{agent}-definition.yaml` and the [output contract conventions](../../architecture/agents/agent-architecture.md).

<!-- TODO: expand with a worked example showing a passing and a failing output side by side -->

---

## Running the Test Suite

Automated tests for agent implementations live in `application/tests/agents/`. Run them with pytest before committing any agent changes.

```bash
cd ea-agentic-lab
source application/venv/bin/activate

# Run all agent tests
pytest application/tests/agents/ -v

# Run tests for a specific agent
pytest application/tests/agents/test_sa_agent.py -v
```

<!-- TODO: expand with CI integration notes and coverage expectations -->

---

## Validation Checklist

- [ ] Single prompt produces output matching the declared output contract
- [ ] Skill runs without step-to-step data loss
- [ ] Runbook completes without tool resolution errors
- [ ] No output field contains data absent from the input fixture
- [ ] All source citations resolve to the input file
- [ ] pytest suite passes with no new failures

---

## Related Documentation

- [How to Create a New Agent](create-agent.md)
- [How to Configure an Agent](configure-agent.md)
- [How to Debug an Agent](debug-agent.md)
- [Agent Architecture](../../architecture/agents/agent-architecture.md)
