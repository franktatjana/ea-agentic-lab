"""
EA Agentic Lab - Customer Journey Map UI
Dynamically loads content from actual playbooks and InfoHub
"""

import streamlit as st
from pathlib import Path
import yaml
import sys
import glob
import json

# Add application/src to path for imports
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT / "application" / "src"))

# Import orchestration components
try:
    from core.orchestration import OrchestrationAgent, ProcessParser, ConflictDetector
    ORCHESTRATION_AVAILABLE = True
except ImportError:
    ORCHESTRATION_AVAILABLE = False

# Page config
st.set_page_config(
    page_title="EA Agentic Lab - Journey Map",
    page_icon="🗺️",
    layout="wide",
    initial_sidebar_state="collapsed"
)


# ============================================================================
# DATA LOADING FROM BACKEND
# ============================================================================

def load_all_playbooks() -> list:
    """Load all playbooks from the playbooks/executable directory"""
    playbooks = []
    playbook_dir = PROJECT_ROOT / "playbooks" / "executable"

    if playbook_dir.exists():
        for yaml_file in playbook_dir.glob("*.yaml"):
            # Skip backup files
            if "backup" in yaml_file.name.lower() or "old" in yaml_file.name.lower():
                continue
            try:
                with open(yaml_file, 'r') as f:
                    data = yaml.safe_load(f)
                    if data:
                        # Extract playbook ID from filename (e.g., PB_001 from PB_001_three_horizons.yaml)
                        pb_id = yaml_file.stem.split('_')[0] + '_' + yaml_file.stem.split('_')[1]
                        data['_id'] = pb_id
                        data['_filename'] = yaml_file.name
                        data['_path'] = str(yaml_file)
                        playbooks.append(data)
            except Exception as e:
                st.warning(f"Could not load {yaml_file.name}: {e}")

    return playbooks


def load_infohub_nodes() -> list:
    """Load available nodes from InfoHub (realm/node structure)"""
    infohub_path = PROJECT_ROOT / "examples" / "infohub"
    nodes = []
    if infohub_path.exists():
        # Look for realm/node structure
        for realm_dir in infohub_path.iterdir():
            if realm_dir.is_dir() and not realm_dir.name.startswith('.'):
                for node_dir in realm_dir.iterdir():
                    if node_dir.is_dir() and (node_dir / "node_profile.yaml").exists():
                        nodes.append(f"{realm_dir.name}/{node_dir.name}")
    return nodes if nodes else ["ACME/SECURITY_CONSOLIDATION"]


def load_infohub_clients() -> list:
    """Load available clients from InfoHub (backward compatible wrapper)"""
    return load_infohub_nodes()


def load_node_profile(node_path: str) -> dict:
    """Load node profile for a realm/node path"""
    profile_path = PROJECT_ROOT / "examples" / "infohub" / node_path / "node_profile.yaml"
    if profile_path.exists():
        with open(profile_path, 'r') as f:
            return yaml.safe_load(f)
    return {}


def load_account_profile(client_id: str) -> dict:
    """Load account/node profile (backward compatible wrapper)"""
    return load_node_profile(client_id)


def load_client_meetings(client_id: str) -> list:
    """Load meeting notes for a client"""
    meetings = []
    meetings_path = PROJECT_ROOT / "examples" / "infohub" / client_id / "meetings"

    if meetings_path.exists():
        for meeting_file in meetings_path.rglob("*.md"):
            try:
                with open(meeting_file, 'r') as f:
                    content = f.read()
                    meetings.append({
                        'filename': meeting_file.name,
                        'path': str(meeting_file),
                        'content': content[:1000],  # First 1000 chars
                        'type': 'internal' if 'internal' in str(meeting_file) else 'external'
                    })
            except:
                pass

    return meetings


def load_client_risks(client_id: str) -> list:
    """Load risks for a client"""
    risks = []
    risks_path = PROJECT_ROOT / "examples" / "infohub" / client_id / "risks"

    if risks_path.exists():
        for risk_file in risks_path.glob("*.yaml"):
            try:
                with open(risk_file, 'r') as f:
                    data = yaml.safe_load(f)
                    if data:
                        data['_filename'] = risk_file.name
                        risks.append(data)
            except:
                pass

        for risk_file in risks_path.glob("*.md"):
            try:
                with open(risk_file, 'r') as f:
                    content = f.read()
                    risks.append({
                        '_filename': risk_file.name,
                        'content': content[:500]
                    })
            except:
                pass

    return risks


def load_client_decisions(client_id: str) -> list:
    """Load decisions for a client"""
    decisions = []
    decisions_path = PROJECT_ROOT / "examples" / "infohub" / client_id / "decisions"

    if decisions_path.exists():
        for dec_file in decisions_path.glob("*.md"):
            try:
                with open(dec_file, 'r') as f:
                    content = f.read()
                    decisions.append({
                        'filename': dec_file.name,
                        'content': content[:500]
                    })
            except:
                pass

    return decisions


def load_action_tracker(client_id: str) -> dict:
    """Load action tracker for a client"""
    tracker_path = PROJECT_ROOT / "examples" / "infohub" / client_id / "actions" / "action_tracker.yaml"
    if tracker_path.exists():
        with open(tracker_path, 'r') as f:
            return yaml.safe_load(f)
    return {}


def load_operating_cadence(client_id: str) -> dict:
    """Load operating cadence for a client"""
    cadence_path = PROJECT_ROOT / "examples" / "infohub" / client_id / "governance" / "operating_cadence.yaml"
    if cadence_path.exists():
        with open(cadence_path, 'r') as f:
            return yaml.safe_load(f)
    return {}


def load_health_score(client_id: str) -> dict:
    """Load health score for a client"""
    health_path = PROJECT_ROOT / "examples" / "infohub" / client_id / "governance" / "health_score.yaml"
    if health_path.exists():
        with open(health_path, 'r') as f:
            return yaml.safe_load(f)
    return {}


def get_role_from_playbook(playbook: dict) -> str:
    """Extract role from playbook intended_agent_role"""
    role = playbook.get('intended_agent_role', '').lower()
    if 'ae' in role or 'account executive' in role:
        return 'ae'
    elif 'sa' in role or 'solution architect' in role:
        return 'sa'
    elif 'ca' in role or 'customer' in role:
        return 'ca'
    elif 'ci' in role or 'competitive' in role:
        return 'ci'
    return 'other'


def get_stage_from_triggers(playbook: dict) -> str:
    """Infer stage from trigger conditions"""
    triggers = playbook.get('trigger_conditions', {})
    all_triggers = str(triggers).lower()

    if 'discovery' in all_triggers or 'initial' in all_triggers or 'first' in all_triggers:
        return 'discovery'
    elif 'business case' in all_triggers or 'cfo' in all_triggers or 'pricing' in all_triggers:
        return 'proposal'
    elif 'poc' in all_triggers or 'pilot' in all_triggers or 'proof' in all_triggers:
        return 'pilot_poc'
    elif 'implementation' in all_triggers or 'deployment' in all_triggers:
        return 'implementation'
    elif 'planning' in all_triggers or 'strategy' in all_triggers:
        return 'solution_design'
    else:
        return 'ongoing'  # Playbooks that run throughout


# ============================================================================
# CUSTOM CSS
# ============================================================================

def inject_custom_css():
    st.markdown("""
    <style>
        .main .block-container {
            padding-top: 1rem;
            max-width: 100%;
        }

        .playbook-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 0.75rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .role-badge {
            display: inline-block;
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 600;
            margin-right: 0.5rem;
        }

        .role-ae { background: #e3f2fd; color: #1565c0; }
        .role-sa { background: #f3e5f5; color: #7b1fa2; }
        .role-ca { background: #e8f5e9; color: #2e7d32; }
        .role-ci { background: #fff3e0; color: #ef6c00; }
        .role-other { background: #f5f5f5; color: #616161; }

        .trigger-chip {
            display: inline-block;
            background: #e8f4fd;
            color: #1976d2;
            border: 1px solid #bbdefb;
            border-radius: 16px;
            padding: 0.2rem 0.6rem;
            font-size: 0.7rem;
            margin: 0.2rem;
        }

        .input-chip {
            display: inline-block;
            background: #fff8e1;
            color: #f57c00;
            border: 1px solid #ffe0b2;
            border-radius: 16px;
            padding: 0.2rem 0.6rem;
            font-size: 0.7rem;
            margin: 0.2rem;
        }

        .output-chip {
            display: inline-block;
            background: #e8f5e9;
            color: #388e3c;
            border: 1px solid #c8e6c9;
            border-radius: 16px;
            padding: 0.2rem 0.6rem;
            font-size: 0.7rem;
            margin: 0.2rem;
        }

        .section-header {
            font-size: 0.85rem;
            font-weight: 600;
            color: #555;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
        }

        .question-item {
            background: #fafafa;
            border-left: 3px solid #2196f3;
            padding: 0.5rem 1rem;
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
        }

        .decision-rule {
            background: #fff8e1;
            border-left: 3px solid #ffc107;
            padding: 0.5rem 1rem;
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
        }
    </style>
    """, unsafe_allow_html=True)


# ============================================================================
# UI COMPONENTS
# ============================================================================

ROLE_INFO = {
    'ae': {'name': 'Account Executive', 'icon': '💼', 'color': 'role-ae'},
    'sa': {'name': 'Solution Architect', 'icon': '🏗️', 'color': 'role-sa'},
    'ca': {'name': 'Customer Architect', 'icon': '🤝', 'color': 'role-ca'},
    'ci': {'name': 'Competitive Intel', 'icon': '🔍', 'color': 'role-ci'},
    'other': {'name': 'Other', 'icon': '📋', 'color': 'role-other'},
}

STAGE_INFO = {
    'discovery': {'name': 'Discovery', 'icon': '🔎', 'order': 1},
    'solution_design': {'name': 'Solution Design', 'icon': '📐', 'order': 2},
    'pilot_poc': {'name': 'Pilot / PoC', 'icon': '🧪', 'order': 3},
    'proposal': {'name': 'Proposal', 'icon': '📝', 'order': 4},
    'implementation': {'name': 'Implementation', 'icon': '🚀', 'order': 5},
    'ongoing': {'name': 'Ongoing', 'icon': '🔄', 'order': 6},
}


def render_playbook_card(playbook: dict, show_details: bool = False):
    """Render a playbook card"""
    role = get_role_from_playbook(playbook)
    role_info = ROLE_INFO.get(role, ROLE_INFO['other'])

    with st.container(border=True):
        # Header with role badge
        col1, col2 = st.columns([3, 1])
        with col1:
            st.markdown(f"**{playbook.get('framework_name', 'Unknown Playbook')}**")
        with col2:
            st.markdown(f"<span class='role-badge {role_info['color']}'>{role_info['icon']} {role_info['name']}</span>",
                       unsafe_allow_html=True)

        # ID and source
        st.caption(f"**{playbook.get('_id', '')}** · Source: {playbook.get('framework_source', 'N/A')}")

        # Objective
        st.write(playbook.get('primary_objective', 'No objective defined')[:200] + "..."
                if len(playbook.get('primary_objective', '')) > 200
                else playbook.get('primary_objective', 'No objective defined'))

        # Click to expand
        if st.button(f"View Details", key=f"btn_{playbook.get('_id', 'unknown')}"):
            st.session_state.selected_playbook = playbook
            st.rerun()


def render_playbook_flyout(playbook: dict):
    """Render detailed flyout for a playbook"""
    role = get_role_from_playbook(playbook)
    role_info = ROLE_INFO.get(role, ROLE_INFO['other'])

    # Close button
    if st.button("✕ Close", key="close_flyout"):
        st.session_state.selected_playbook = None
        st.rerun()

    st.markdown(f"## {playbook.get('framework_name', 'Unknown')}")
    st.markdown(f"<span class='role-badge {role_info['color']}'>{role_info['icon']} {role_info['name']}</span>",
               unsafe_allow_html=True)
    st.caption(f"**{playbook.get('_id', '')}** · {playbook.get('framework_source', 'N/A')}")

    st.markdown("---")

    # Objective
    st.markdown("### 🎯 Objective")
    st.write(playbook.get('primary_objective', 'Not defined'))

    # Secondary agents
    secondary = playbook.get('secondary_agents', [])
    if secondary:
        st.markdown("**Collaborates with:**")
        for agent in secondary:
            st.markdown(f"- {agent}")

    st.markdown("---")

    # When NOT to use
    when_not = playbook.get('when_not_to_use', [])
    if when_not:
        st.markdown("### ⚠️ When NOT to Use")
        for item in when_not:
            st.warning(item)

    st.markdown("---")

    # Trigger conditions
    st.markdown("### ⚡ Trigger Conditions")
    triggers = playbook.get('trigger_conditions', {})

    auto_triggers = triggers.get('automatic', [])
    if auto_triggers:
        st.markdown("**Automatic:**")
        for trigger in auto_triggers:
            st.markdown(f"<span class='trigger-chip'>🔄 {trigger}</span>", unsafe_allow_html=True)

    manual_triggers = triggers.get('manual', [])
    if manual_triggers:
        st.markdown("**Manual:**")
        for trigger in manual_triggers:
            st.markdown(f"<span class='trigger-chip'>👆 {trigger}</span>", unsafe_allow_html=True)

    st.markdown("---")

    # Required inputs
    st.markdown("### 📥 Required Inputs")
    inputs = playbook.get('required_inputs', {})

    mandatory = inputs.get('mandatory', [])
    if mandatory:
        st.markdown("**Mandatory:**")
        for inp in mandatory:
            if isinstance(inp, dict):
                st.markdown(f"<span class='input-chip'>📄 {inp.get('artifact', str(inp))}</span>", unsafe_allow_html=True)
            else:
                st.markdown(f"<span class='input-chip'>📄 {inp}</span>", unsafe_allow_html=True)

    optional = inputs.get('optional', [])
    if optional:
        st.markdown("**Optional:**")
        for inp in optional[:5]:  # Limit to 5
            if isinstance(inp, dict):
                st.markdown(f"<span class='input-chip'>📄 {inp.get('artifact', str(inp))}</span>", unsafe_allow_html=True)

    st.markdown("---")

    # Key questions
    st.markdown("### ❓ Key Questions to Extract")
    questions = playbook.get('key_questions', {})
    for category, q_list in questions.items():
        st.markdown(f"**{category.replace('_', ' ').title()}:**")
        if isinstance(q_list, list):
            for q in q_list[:5]:  # Limit to 5
                st.markdown(f"<div class='question-item'>{q}</div>", unsafe_allow_html=True)

    st.markdown("---")

    # Decision logic
    st.markdown("### 🔀 Decision Logic")
    decision_logic = playbook.get('decision_logic', {})
    rules = decision_logic.get('rules', [])
    if rules:
        for rule in rules[:3]:  # Show first 3 rules
            condition = rule.get('condition', 'No condition')
            output_type = rule.get('output_type', 'Unknown')
            st.markdown(f"<div class='decision-rule'><b>IF:</b> {condition}<br/><b>THEN:</b> Create {output_type}</div>",
                       unsafe_allow_html=True)
    else:
        st.info("No decision rules defined")

    st.markdown("---")

    # Expected outputs
    st.markdown("### 📤 Expected Outputs")
    outputs = playbook.get('expected_outputs', playbook.get('validation_outputs', {}))

    primary = outputs.get('primary_artifact', {})
    if primary:
        path = primary.get('path', 'Not specified')
        st.markdown(f"<span class='output-chip'>📁 {path}</span>", unsafe_allow_html=True)

        sections = primary.get('sections', [])
        if sections:
            st.markdown("**Sections:**")
            for section in sections[:8]:
                st.write(f"- {section}")

    # Execution metadata
    st.markdown("---")
    st.markdown("### ⚙️ Execution Info")
    col1, col2 = st.columns(2)
    with col1:
        st.write(f"**Estimated Time:** {playbook.get('estimated_execution_time', 'N/A')}")
        st.write(f"**Frequency:** {playbook.get('frequency', 'N/A')}")
    with col2:
        st.write(f"**Human Review:** {'Yes' if playbook.get('human_review_required') else 'No'}")
        st.write(f"**Status:** {playbook.get('status', 'N/A')}")


def render_infohub_context(client_id: str, account: dict):
    """Render InfoHub context panel"""
    st.markdown("### 📊 InfoHub Data")

    # Account overview
    if account:
        st.markdown("#### Account Profile")
        commercial = account.get('commercial', {})

        col1, col2 = st.columns(2)
        with col1:
            st.metric("ARR", f"${commercial.get('arr', 0):,}")
        with col2:
            st.metric("Health", f"{commercial.get('health_score', 'N/A')}")

        st.write(f"**Tier:** {account.get('tier', 'N/A')}")
        st.write(f"**Industry:** {account.get('industry', 'N/A')}")

        # Solutions
        solutions = account.get('solutions', [])
        if solutions:
            st.markdown("**Solutions:**")
            for s in solutions[:3]:
                if isinstance(s, dict):
                    st.write(f"- {s.get('solution', s)}")
                else:
                    st.write(f"- {s}")

    # Meetings
    st.markdown("---")
    meetings = load_client_meetings(client_id)
    if meetings:
        with st.expander(f"📅 Meetings ({len(meetings)})"):
            for m in meetings[:5]:
                st.write(f"- {m['filename']}")

    # Risks
    risks = load_client_risks(client_id)
    if risks:
        with st.expander(f"⚠️ Risks ({len(risks)})"):
            for r in risks[:5]:
                st.write(f"- {r.get('_filename', 'Unknown')}")

    # Decisions
    decisions = load_client_decisions(client_id)
    if decisions:
        with st.expander(f"✅ Decisions ({len(decisions)})"):
            for d in decisions[:5]:
                st.write(f"- {d.get('filename', 'Unknown')}")


# ============================================================================
# MAIN APP
# ============================================================================

def render_action_tracker_view(client_id: str):
    """Render the action tracker / progress view"""
    tracker = load_action_tracker(client_id)
    cadence = load_operating_cadence(client_id)
    health = load_health_score(client_id)

    if not tracker:
        st.info("No action tracker found for this client")
        return

    # Summary metrics
    summary = tracker.get('summary', {})

    st.markdown("### 📊 Action Summary")
    col1, col2, col3, col4, col5 = st.columns(5)

    with col1:
        st.metric("Total Actions", summary.get('total_actions', 0))
    with col2:
        st.metric("🔴 Critical", summary.get('critical', 0))
    with col3:
        st.metric("🟠 High", summary.get('high', 0))
    with col4:
        st.metric("✅ Completed", summary.get('completed', 0))
    with col5:
        st.metric("⚠️ Overdue", summary.get('overdue', 0))

    # Status alert
    status = summary.get('status', '')
    if 'CRITICAL' in status:
        st.error(f"🚨 {status}")
    elif 'WARNING' in status:
        st.warning(f"⚠️ {status}")

    st.markdown("---")

    # Action list by priority
    actions = tracker.get('actions', [])

    # Critical Actions
    p0_actions = [a for a in actions if a.get('priority') == 'critical']
    if p0_actions:
        st.markdown("### 🔴 Critical Actions (Due within 48 hours)")
        for action in p0_actions:
            with st.container(border=True):
                col1, col2, col3 = st.columns([3, 1, 1])
                with col1:
                    st.markdown(f"**{action.get('title', 'Untitled')}**")
                    st.caption(action.get('description', '')[:100])
                with col2:
                    status = action.get('status', 'unknown')
                    if status == 'completed':
                        st.success("✅ Done")
                    elif status == 'in_progress':
                        st.warning("🔄 In Progress")
                    else:
                        st.error("⏳ Not Started")
                with col3:
                    st.write(f"**Owner:** {action.get('owner', 'TBD')}")
                    st.write(f"**Due:** {action.get('due_date', 'TBD')}")

                # Linked items
                risks = action.get('linked_risks', [])
                if risks:
                    st.caption(f"🔗 Linked risks: {', '.join(risks)}")

    # High Actions
    p1_actions = [a for a in actions if a.get('priority') == 'high']
    if p1_actions:
        with st.expander(f"🟠 High Priority Actions ({len(p1_actions)})", expanded=False):
            for action in p1_actions:
                status_icon = "✅" if action.get('status') == 'completed' else "🔄" if action.get('status') == 'in_progress' else "⏳"
                st.markdown(f"{status_icon} **{action.get('title')}** - {action.get('owner', 'TBD')} (Due: {action.get('due_date', 'TBD')})")

    # Medium Actions
    p2_actions = [a for a in actions if a.get('priority') == 'medium']
    if p2_actions:
        with st.expander(f"🟡 Medium Priority Actions ({len(p2_actions)})", expanded=False):
            for action in p2_actions:
                status_icon = "✅" if action.get('status') == 'completed' else "🔄" if action.get('status') == 'in_progress' else "⏳"
                st.markdown(f"{status_icon} **{action.get('title')}** - {action.get('owner', 'TBD')} (Due: {action.get('due_date', 'TBD')})")

    # Completed Actions
    completed = [a for a in actions if a.get('status') == 'completed']
    if completed:
        with st.expander(f"✅ Completed Actions ({len(completed)})", expanded=False):
            for action in completed:
                st.markdown(f"✅ ~~{action.get('title')}~~ - Completed: {action.get('completed_date', 'N/A')}")

    st.markdown("---")

    # Operating Cadence
    if cadence:
        st.markdown("### 📅 Operating Cadence")

        overview = cadence.get('overview', {})
        if overview:
            mode = overview.get('current_mode', 'standard')
            if mode == 'accelerated':
                st.warning(f"⚡ **Accelerated Mode** - {overview.get('reason', '')}")
            st.write(f"Current cadence: **{overview.get('current_cadence', 'N/A')}**")

        # Upcoming calendar
        calendar = cadence.get('calendar', {})
        this_week = calendar.get('this_week', [])
        if this_week:
            st.markdown("**This Week:**")
            for event in this_week[:5]:
                st.markdown(f"- 📆 **{event.get('date')}** {event.get('time', '')}: {event.get('event', '')}")

        # POC Milestones
        poc = cadence.get('poc_cadence', {})
        milestones = poc.get('milestone_reviews', [])
        if milestones:
            st.markdown("**POC Milestones:**")
            for m in milestones:
                st.markdown(f"- 🎯 **{m.get('milestone')}** - {m.get('date')}")


def main():
    # Initialize session state
    if 'selected_playbook' not in st.session_state:
        st.session_state.selected_playbook = None
    if 'selected_role' not in st.session_state:
        st.session_state.selected_role = 'all'
    if 'view_mode' not in st.session_state:
        st.session_state.view_mode = 'by_role'
    if 'active_tab' not in st.session_state:
        st.session_state.active_tab = 'playbooks'

    inject_custom_css()

    # Load actual data from backend
    playbooks = load_all_playbooks()
    clients = load_infohub_clients()

    # Header
    header_col1, header_col2 = st.columns([3, 1])

    with header_col1:
        st.markdown("## 🗺️ EA Agentic Lab")

    with header_col2:
        selected_client = st.selectbox("Client", clients, label_visibility="collapsed")
        account = load_account_profile(selected_client)

    # Main tabs
    tab1, tab2, tab3, tab4 = st.tabs(["📋 Playbooks", "✅ Progress Tracker", "📊 Dashboard", "🎯 Orchestration"])

    with tab1:
        st.caption(f"Loaded {len(playbooks)} playbooks from backend")
        render_playbooks_tab(playbooks, selected_client, account)

    with tab2:
        render_action_tracker_view(selected_client)

    with tab3:
        render_dashboard_tab(selected_client, account)

    with tab4:
        render_orchestration_tab()


def render_dashboard_tab(client_id: str, account: dict):
    """Render dashboard overview"""
    tracker = load_action_tracker(client_id)
    health = load_health_score(client_id)

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("### 📈 Account Health")
        if account:
            commercial = account.get('commercial', {})
            st.metric("ARR", f"${commercial.get('arr', 0):,}")
            st.metric("Health Score", f"{commercial.get('health_score', 'N/A')}/100")
            st.write(f"**Tier:** {account.get('tier', 'N/A')}")
            st.write(f"**Industry:** {account.get('industry', 'N/A')}")

        # Solutions
        solutions = account.get('solutions', [])
        if solutions:
            st.markdown("**Deployed Solutions:**")
            for s in solutions[:5]:
                if isinstance(s, dict):
                    st.write(f"- {s.get('solution', s)} ({s.get('use_case', '')})")

    with col2:
        st.markdown("### 📋 Action Summary")
        if tracker:
            summary = tracker.get('summary', {})

            # Progress bar
            total = summary.get('total_actions', 1)
            completed = summary.get('completed', 0)
            progress = completed / total if total > 0 else 0

            st.progress(progress, text=f"{completed}/{total} actions completed")

            # Quick stats
            st.write(f"🔴 **Critical:** {summary.get('critical', 0)}")
            st.write(f"🟠 **High:** {summary.get('high', 0)}")
            st.write(f"⚠️ **Overdue:** {summary.get('overdue', 0)}")

    # Risks and Decisions
    st.markdown("---")
    col1, col2 = st.columns(2)

    with col1:
        risks = load_client_risks(client_id)
        st.markdown(f"### ⚠️ Risks ({len(risks)})")
        for r in risks[:5]:
            st.write(f"- {r.get('_filename', 'Unknown')}")

    with col2:
        decisions = load_client_decisions(client_id)
        st.markdown(f"### ✅ Decisions ({len(decisions)})")
        for d in decisions[:5]:
            st.write(f"- {d.get('filename', 'Unknown')}")


def render_orchestration_tab():
    """Render the orchestration agent tab"""
    if not ORCHESTRATION_AVAILABLE:
        st.error("Orchestration module not available. Check core/orchestration/ installation.")
        return

    st.markdown("### 🎯 Process Orchestration")
    st.caption("Describe processes in natural language. The system parses, validates, and creates agents/playbooks.")

    # Initialize session state for orchestration
    if 'orch_process_input' not in st.session_state:
        st.session_state.orch_process_input = ""
    if 'orch_result' not in st.session_state:
        st.session_state.orch_result = None
    if 'orch_processes' not in st.session_state:
        st.session_state.orch_processes = []

    # Two columns: Input and Results
    input_col, result_col = st.columns([1, 1])

    with input_col:
        st.markdown("#### Describe Your Process")

        # Example templates
        example = st.selectbox(
            "Start from example (optional)",
            [
                "-- Select an example --",
                "RFP Analysis: When we receive an RFP, the SA should analyze requirements within 5 days",
                "Health Check: When customer health score drops below 50, CA should schedule a rescue call",
                "Competitive Response: When a competitor is identified, CI should produce analysis within 48 hours",
                "Custom (enter below)"
            ],
            key="orch_example"
        )

        # Pre-fill if example selected
        default_text = ""
        if example and example != "-- Select an example --" and example != "Custom (enter below)":
            default_text = example

        # Process input area
        process_input = st.text_area(
            "Process Description",
            value=default_text if default_text else st.session_state.orch_process_input,
            height=200,
            placeholder="Describe your process in natural language...\n\nExample:\nWhen we receive an RFP, the SA should analyze the technical requirements and create an architecture proposal within 5 days. If there's a security section, loop in InfoSec for review.",
            key="orch_input_area"
        )

        # Input format hint
        input_format = st.radio(
            "Input format",
            ["Auto-detect", "Natural language", "YAML", "Table"],
            horizontal=True,
            key="orch_format"
        )

        # Parse button
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🔍 Parse & Analyze", type="primary", use_container_width=True):
                if process_input.strip():
                    with st.spinner("Parsing process..."):
                        try:
                            orchestrator = OrchestrationAgent()
                            format_map = {
                                "Auto-detect": "auto",
                                "Natural language": "text",
                                "YAML": "yaml",
                                "Table": "table"
                            }
                            result = orchestrator.process_input(
                                process_input,
                                input_format=format_map.get(input_format, "auto")
                            )
                            st.session_state.orch_result = result
                            st.session_state.orch_process_input = process_input
                        except Exception as e:
                            st.error(f"Error parsing: {str(e)}")
                else:
                    st.warning("Please enter a process description")

        with col2:
            if st.button("🗑️ Clear", use_container_width=True):
                st.session_state.orch_result = None
                st.session_state.orch_process_input = ""
                st.rerun()

    with result_col:
        st.markdown("#### Analysis Results")

        result = st.session_state.orch_result

        if result is None:
            st.info("Enter a process description and click 'Parse & Analyze' to see results")
        else:
            # Success/failure indicator
            if result.success:
                st.success(f"✅ {result.message}")
            else:
                st.error(f"❌ {result.message}")

            # Process definition
            if result.process_definition:
                with st.expander("📄 Parsed Process Definition", expanded=True):
                    proc = result.process_definition

                    st.markdown(f"**Process ID:** `{proc.get('process_id', 'N/A')}`")
                    st.markdown(f"**Name:** {proc.get('name', 'N/A')}")

                    # Trigger
                    trigger = proc.get('trigger', {})
                    st.markdown(f"**Trigger:** `{trigger.get('event', 'manual')}`")

                    # Owner
                    owner = proc.get('ownership', {}).get('primary_owner', {}).get('agent', 'Unknown')
                    st.markdown(f"**Owner:** {owner}")

                    # Steps
                    steps = proc.get('steps', [])
                    if steps:
                        st.markdown("**Steps:**")
                        for step in steps:
                            st.markdown(f"- {step.get('step_id', '?')}: {step.get('name', 'Unnamed')}")

                    # Show full YAML
                    if st.checkbox("Show full YAML", key="show_yaml"):
                        st.code(yaml.dump(proc, default_flow_style=False), language="yaml")

            # Conflicts
            if result.conflicts:
                with st.expander(f"⚠️ Conflicts Detected ({len(result.conflicts)})", expanded=True):
                    for conflict in result.conflicts:
                        severity = conflict.get('severity', 'unknown')
                        severity_colors = {
                            'critical': '🔴',
                            'high': '🟠',
                            'medium': '🟡',
                            'low': '🟢',
                            'info': '🔵'
                        }
                        icon = severity_colors.get(severity, '⚪')

                        st.markdown(f"{icon} **{conflict.get('type', 'Unknown')}** ({severity})")
                        st.caption(conflict.get('description', ''))

                        # Resolution options
                        if conflict.get('resolutions'):
                            st.markdown("**Resolution options:**")
                            for res in conflict.get('resolutions', []):
                                st.markdown(f"  - {res.get('option')}: {res.get('description')}")

            # Gaps
            if result.gaps:
                with st.expander(f"📋 Gaps Identified ({len(result.gaps)})", expanded=False):
                    for gap in result.gaps:
                        st.markdown(f"- **{gap.get('event', 'Unknown')}**: {gap.get('description', '')}")

            # Created artifacts
            if result.agents_created or result.playbooks_created:
                with st.expander("🆕 Created Artifacts", expanded=False):
                    if result.agents_created:
                        st.markdown("**Agents:**")
                        for agent in result.agents_created:
                            st.markdown(f"- {agent}")
                    if result.playbooks_created:
                        st.markdown("**Playbooks:**")
                        for pb in result.playbooks_created:
                            st.markdown(f"- {pb}")

            # Human decision required
            if result.requires_human_decision:
                st.warning("⚡ Human decision required before proceeding")

                if result.blocking_conflicts:
                    st.error("🚫 Blocking conflicts must be resolved first")

    # Divider
    st.markdown("---")

    # Process Registry section
    st.markdown("### 📚 Process Registry")

    reg_col1, reg_col2 = st.columns([2, 1])

    with reg_col1:
        # Load existing processes
        try:
            orchestrator = OrchestrationAgent()
            processes = orchestrator.get_all_processes()

            if processes:
                st.markdown(f"**{len(processes)} processes registered**")

                for proc in processes[:10]:
                    with st.container(border=True):
                        col1, col2, col3 = st.columns([3, 1, 1])
                        with col1:
                            st.markdown(f"**{proc.get('name', 'Unnamed')}**")
                            st.caption(f"ID: {proc.get('process_id')} | Owner: {proc.get('ownership', {}).get('primary_owner', {}).get('agent', 'N/A')}")
                        with col2:
                            status = proc.get('status', 'unknown')
                            status_colors = {'active': 'green', 'draft': 'orange', 'deprecated': 'red'}
                            st.markdown(f":{status_colors.get(status, 'gray')}[{status}]")
                        with col3:
                            st.markdown(f"v{proc.get('version', 1)}")
            else:
                st.info("No processes registered yet. Create one above!")

        except Exception as e:
            st.warning(f"Could not load process registry: {str(e)}")

    with reg_col2:
        st.markdown("#### Quick Stats")

        try:
            registry_path = PROJECT_ROOT / "process_registry" / "registry.yaml"
            if registry_path.exists():
                with open(registry_path, 'r') as f:
                    registry = yaml.safe_load(f)

                stats = registry.get('stats', {})
                st.metric("Total Processes", stats.get('total_processes', 0))
                st.metric("Active", stats.get('active_processes', 0))
                st.metric("Conflicts", stats.get('unresolved_conflicts', 0))

                # Gaps
                gaps = registry.get('gaps', [])
                if gaps:
                    st.markdown("**Gaps:**")
                    for gap in gaps[:3]:
                        st.caption(f"• {gap.get('event', 'Unknown')}")
        except Exception:
            st.info("Registry stats not available")


def render_playbooks_tab(playbooks: list, selected_client: str, account: dict):
    """Render playbooks tab content"""
    # View mode selector
    view_mode = st.selectbox("View", ["By Role", "By Stage", "All"], label_visibility="collapsed", key="view_selector")
    st.session_state.view_mode = view_mode.lower().replace(' ', '_')

    st.markdown("---")

    # Main layout
    if st.session_state.selected_playbook:
        # Show flyout view
        flyout_col, context_col = st.columns([2, 1])

        with flyout_col:
            render_playbook_flyout(st.session_state.selected_playbook)

        with context_col:
            render_infohub_context(selected_client, account)
    else:
        # Show card grid
        filter_col, main_col, context_col = st.columns([1, 3, 1])

        with filter_col:
            st.markdown("### Filters")

            # Role filter
            st.markdown("**By Role:**")
            if st.button("🌐 All Roles", use_container_width=True,
                        type="primary" if st.session_state.selected_role == 'all' else "secondary"):
                st.session_state.selected_role = 'all'
                st.rerun()

            for role_id, role_info in ROLE_INFO.items():
                if role_id != 'other':
                    if st.button(f"{role_info['icon']} {role_info['name']}",
                                use_container_width=True,
                                type="primary" if st.session_state.selected_role == role_id else "secondary",
                                key=f"role_{role_id}"):
                        st.session_state.selected_role = role_id
                        st.rerun()

        with main_col:
            st.markdown("### Playbooks")

            # Filter playbooks
            if st.session_state.selected_role == 'all':
                filtered_playbooks = playbooks
            else:
                filtered_playbooks = [p for p in playbooks if get_role_from_playbook(p) == st.session_state.selected_role]

            if not filtered_playbooks:
                st.info("No playbooks found for selected filter")
            else:
                # Organize by view mode
                if st.session_state.view_mode == 'by_role':
                    # Group by role
                    for role_id, role_info in ROLE_INFO.items():
                        role_playbooks = [p for p in filtered_playbooks if get_role_from_playbook(p) == role_id]
                        if role_playbooks:
                            st.markdown(f"#### {role_info['icon']} {role_info['name']}")
                            cols = st.columns(2)
                            for i, pb in enumerate(role_playbooks):
                                with cols[i % 2]:
                                    render_playbook_card(pb)

                elif st.session_state.view_mode == 'by_stage':
                    # Group by inferred stage
                    for stage_id, stage_info in sorted(STAGE_INFO.items(), key=lambda x: x[1]['order']):
                        stage_playbooks = [p for p in filtered_playbooks if get_stage_from_triggers(p) == stage_id]
                        if stage_playbooks:
                            st.markdown(f"#### {stage_info['icon']} {stage_info['name']}")
                            cols = st.columns(2)
                            for i, pb in enumerate(stage_playbooks):
                                with cols[i % 2]:
                                    render_playbook_card(pb)

                else:  # all
                    cols = st.columns(2)
                    for i, pb in enumerate(filtered_playbooks):
                        with cols[i % 2]:
                            render_playbook_card(pb)

        with context_col:
            render_infohub_context(selected_client, account)


if __name__ == "__main__":
    main()
