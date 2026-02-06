#!/bin/bash
# Demo Reset Script for EA Agentic Lab
# Restores sample data to InfoHub for demonstration purposes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INFOHUB_DIR="$PROJECT_ROOT/infohub"
SAMPLE_DATA_DIR="$SCRIPT_DIR"

echo "=================================="
echo "EA Agentic Lab - Demo Reset"
echo "=================================="
echo ""

# Confirm before proceeding
read -p "This will reset InfoHub data. Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Step 1: Cleaning existing demo data..."
rm -rf "$INFOHUB_DIR/ACME_CORP" 2>/dev/null || true
rm -rf "$INFOHUB_DIR/GLOBEX" 2>/dev/null || true
rm -rf "$INFOHUB_DIR/INITECH" 2>/dev/null || true
echo "  ✓ Cleaned existing data"

echo ""
echo "Step 2: Creating InfoHub structure..."
mkdir -p "$INFOHUB_DIR"

# Function to setup a realm
setup_realm() {
    local realm=$1
    local scenario=$2

    echo "  Setting up $realm ($scenario)..."

    # Copy sample data
    cp -r "$SAMPLE_DATA_DIR/$realm" "$INFOHUB_DIR/"

    # Create standard InfoHub structure
    mkdir -p "$INFOHUB_DIR/$realm/MAIN/"{context,risks,decisions,actions,frameworks,stakeholders,governance}

    # Create node profile
    cat > "$INFOHUB_DIR/$realm/MAIN/node_profile.yaml" << EOF
# Node Profile - Auto-generated for demo
realm_id: $realm
node_id: MAIN
scenario: $scenario
created: $(date -Iseconds)
status: active

description: |
  Demo realm for $scenario scenario.
  Generated from sample data.

health_score: null  # To be calculated by agents
EOF

    echo "    ✓ $realm ready"
}

# Setup each realm
setup_realm "ACME_CORP" "Full lifecycle - Pre-sales to POC"
setup_realm "GLOBEX" "At-risk account - Churn prevention"
setup_realm "INITECH" "New opportunity - Competitive evaluation"

echo ""
echo "Step 3: Verifying setup..."
for realm in ACME_CORP GLOBEX INITECH; do
    if [ -d "$INFOHUB_DIR/$realm" ]; then
        file_count=$(find "$INFOHUB_DIR/$realm" -name "*.md" -o -name "*.yaml" | wc -l)
        echo "  ✓ $realm: $file_count files"
    else
        echo "  ✗ $realm: MISSING"
        exit 1
    fi
done

echo ""
echo "=================================="
echo "Demo Reset Complete!"
echo "=================================="
echo ""
echo "Sample data loaded:"
echo "  - ACME_CORP: Full lifecycle (healthy account, expansion opportunity)"
echo "  - GLOBEX: At-risk (churn risk, competitive threat)"
echo "  - INITECH: New opportunity (POC evaluation, competitive)"
echo ""
echo "Next steps:"
echo "  1. Run agents to process the data:"
echo "     python application/scripts/run_sa_agent.py"
echo "     python application/scripts/run_ca_agent.py"
echo ""
echo "  2. Review outputs in vault/infohub/{realm}/MAIN/"
echo ""
echo "  3. Check generated artifacts:"
echo "     - risks/risk_register.yaml"
echo "     - decisions/decision_log.yaml"
echo "     - actions/action_tracker.yaml"
echo "     - context/account_profile.md"
echo ""
