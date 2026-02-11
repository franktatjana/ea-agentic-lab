# Data Directory Guide

The `data/` directory contains **node-specific runtime data** generated when the application runs. It is gitignored and should not be committed to version control.

## Purpose

When the EA Agentic Lab application executes, it generates:
- **State data**: Process registry, versions, audit trails, and conflict records
- **Run data**: Execution outputs, logs, and results from playbook runs

This data is specific to each running instance (node) and is not shared across environments.

## Structure

### Target Structure (with node isolation)

```
data/
├── .gitignore                    # Ignores all runtime data
│
└── {node_id}/                    # One directory per node instance
    │
    ├── state/                    # Runtime process state
    │   ├── registry.yaml         # Main process registry
    │   ├── processes/            # Current process definitions
    │   ├── versions/             # Process version history
    │   │   └── process/          # Versioned process snapshots
    │   ├── audit/                # Audit trails for governance
    │   └── conflicts/            # Recorded process conflicts
    │
    └── runs/                     # Execution outputs
        └── {run_id}/             # One directory per execution run
            ├── output.yaml       # Run results
            ├── logs/             # Execution logs
            └── artifacts/        # Generated artifacts
```

### Current Structure (pre-node isolation)

Until node isolation is implemented, data is stored directly:

```
data/
├── .gitignore
├── state/                        # Runtime process state (shared)
└── runs/                         # Execution outputs (shared)
```

## Node Identification

Each node is identified by a unique `{node_id}`. This allows:
- Multiple instances to run on the same machine without conflicts
- Clear separation of data between environments (dev, staging, prod)
- Easy cleanup by removing the node directory

## What Gets Generated

| Directory | Content | When Created |
|-----------|---------|--------------|
| `state/registry.yaml` | Active process definitions | On first process registration |
| `state/processes/` | Current process snapshots | When processes are defined |
| `state/versions/` | Historical versions | On process updates |
| `state/audit/` | Governance audit logs | On governed operations |
| `state/conflicts/` | Detected conflicts | When conflicts are identified |
| `runs/{run_id}/` | Execution outputs | On each playbook execution |

## Cleanup

To reset a node's state:
```bash
rm -rf data/{node_id}
```

To reset all runtime data:
```bash
rm -rf data/*/
```

## Backup Considerations

If you need to preserve runtime state:
- Back up the entire `data/{node_id}/` directory
- State can be restored by copying back to the same path
- Run outputs in `runs/` can be archived separately if needed
