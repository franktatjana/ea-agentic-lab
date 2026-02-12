# Agent Proposals

This directory contains knowledge items proposed by agents during engagement processing. Each proposal requires human review before entering the main Knowledge Vault.

## Workflow

1. Agent processes an engagement and identifies a reusable insight
2. Agent emits a `knowledge_proposal` signal with the proposed content
3. System writes the proposal as a YAML file in this directory
4. Human reviews in the Knowledge Vault UI (Review Queue tab)
5. Approved items move to the appropriate category directory with `confidence: reviewed`
6. Rejected items are marked with reason and kept here for audit trail
