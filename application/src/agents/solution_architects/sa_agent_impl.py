"""
Solution Architect Agent Implementation
First working agent in the EA Agentic Lab system

Purpose: Maintain technical integrity & risk visibility

This is the REFERENCE IMPLEMENTATION for how agents should work in the system.
Other agents should follow this pattern:

Architecture:
    1. Inherit from BaseAgent (core/agent_framework/base_agent.py)
    2. Load configuration from YAML (teams/{team}/agents/{agent}_agent.yaml)
    3. Implement process() method as the main entry point
    4. Extract signals from inputs (daily notes, meetings, etc.)
    5. Generate outputs (client profiles, risk registers, etc.)
    6. Identify escalations based on severity thresholds

Key Features Demonstrated:
    - Client tracking with technology associations
    - Signal extraction using regex patterns (risks, decisions)
    - Technology matrix generation
    - Escalation identification based on risk count/severity

Integration Points:
    - Reads: Daily operation notes from InfoHub
    - Writes: Client profiles, technology matrix, risk register
    - Escalates to: Senior Manager (HIGH risks, multiple risks per client)

Usage:
    agent = SAAgent(config_path)
    result = agent.process({'daily_notes': [note1, note2, ...]})
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# AgentConfig is used internally by load_agent_config, keeping import for clarity
from core.agent_framework.base_agent import BaseAgent, AgentConfig, load_agent_config
from typing import Dict, List, Any
import re
from datetime import datetime
from collections import defaultdict


class SAAgent(BaseAgent):
    """
    Solution Architect Agent

    Monitors daily operation notes and extracts:
    - Technical decisions
    - Architecture patterns
    - Technology usage per client
    - Technical risks
    - Specialist triggers
    """

    def __init__(self, config_path: Path):
        config = load_agent_config(config_path)
        super().__init__(config)

        # Initialize tracking structures for aggregating data across notes
        # Using defaultdict for automatic initialization of new clients
        self.clients = defaultdict(lambda: {
            'technologies': set(),      # Tech stack used by this client
            'decisions': [],            # Technical decisions made
            'risks': [],                # Identified risks
            'last_activity': None,      # Most recent note date
            'people': set()             # Key contacts mentioned
        })
        self.technologies = defaultdict(list)  # Reverse index: tech -> [clients using it]
        self.decisions = []  # Global decision list (across all clients)
        self.risks = []      # Global risk list (for dashboard/escalation)

    def process(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main processing: extract intelligence from daily notes

        Args:
            inputs: {
                'daily_notes': List of note file paths or content dicts
            }

        Returns:
            {
                'outputs': Generated artifacts (profiles, reports),
                'risks': Identified risks,
                'actions': Required actions,
                'escalations': Critical issues
            }
        """
        start_time = datetime.now()

        daily_notes = inputs.get('daily_notes', [])

        # Process each note
        for note in daily_notes:
            self._process_note(note)

        # Generate outputs
        outputs = self._generate_outputs()

        # Identify escalations
        escalations = self._identify_escalations()

        result = {
            'outputs': outputs,
            'risks': self.risks,
            'actions': self._extract_actions(),
            'escalations': escalations
        }

        # Log execution
        duration = (datetime.now() - start_time).total_seconds()
        self.log_execution(inputs, result, duration)

        return result

    def _process_note(self, note: Dict[str, Any]):
        """Process a single daily note"""
        content = note.get('content', '')
        date = note.get('date')
        tags = note.get('tags', [])

        # Extract clients from tags
        clients = [tag.replace('client/', '') for tag in tags if tag.startswith('client/')]

        # Extract technologies from tags
        technologies = [tag for tag in tags if self._is_technology_tag(tag)]

        # Extract people from tags
        people = [tag.replace('person/', '') for tag in tags if tag.startswith('person/')]

        # For each client mentioned, update their profile
        for client in clients:
            self.clients[client]['last_activity'] = date
            self.clients[client]['technologies'].update(technologies)
            self.clients[client]['people'].update(people)

            # Extract decisions and risks for this client
            decisions = self.extract_decisions(content, client)
            self.clients[client]['decisions'].extend(decisions)

            risks = self.extract_risks(content, client)
            self.clients[client]['risks'].extend(risks)
            self.risks.extend(risks)

        # Track technology usage
        for tech in technologies:
            for client in clients:
                if client not in self.technologies[tech]:
                    self.technologies[tech].append(client)

    def _is_technology_tag(self, tag: str) -> bool:
        """Determine if a tag represents a technology"""
        tech_indicators = [
            'vendor-product', 'visualization', 'pipeline', 'kafka', 'neo4j',
            'qdrant', 'vector-search', 'nlp', 'observability',
            'monitoring', 'serverless', 'cloud', 'kubernetes'
        ]
        return any(indicator in tag.lower() for indicator in tech_indicators)

    def extract_signals(self, content: str) -> List[Dict]:
        """
        Extract technical signals from content using regex patterns.

        This is a simple keyword-based extraction. In production, this could be
        enhanced with:
        - LLM-based extraction for better context understanding
        - Named entity recognition for technology mentions
        - Sentiment analysis for risk severity estimation

        Currently extracts two signal types:
        - 'risk': Matches risk/concern/issue/blocked/challenge keywords
        - 'decision': Matches decided/decision/agreed/chosen keywords
        """
        signals = []

        # Technical risk patterns - look for keywords followed by description
        # Example matches: "risk: deployment timeline too aggressive"
        risk_patterns = [
            r'risk[:\s]+(.+)',
            r'concern[:\s]+(.+)',
            r'issue[:\s]+(.+)',
            r'blocked[:\s]+(.+)',
            r'challenge[:\s]+(.+)'
        ]

        for pattern in risk_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                signals.append({
                    'type': 'risk',
                    'content': match.group(1).strip(),
                    'severity': 'MEDIUM',
                    'source': 'daily_notes'
                })

        # Decision patterns
        decision_patterns = [
            r'decided[:\s]+(.+)',
            r'decision[:\s]+(.+)',
            r'agreed[:\s]+(.+)',
            r'chosen[:\s]+(.+)'
        ]

        for pattern in decision_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                signals.append({
                    'type': 'decision',
                    'content': match.group(1).strip(),
                    'severity': 'INFO',
                    'source': 'daily_notes'
                })

        return signals

    def extract_decisions(self, content: str, client: str) -> List[Dict]:
        """Extract technical decisions from content"""
        signals = self.extract_signals(content)
        decisions = [s for s in signals if s['type'] == 'decision']

        return [{
            'client': client,
            'decision': d['content'],
            'date': datetime.now().isoformat(),
            'source': d['source']
        } for d in decisions]

    def extract_risks(self, content: str, client: str) -> List[Dict]:
        """Extract technical risks from content"""
        signals = self.extract_signals(content)
        risks = [s for s in signals if s['type'] == 'risk']

        return [{
            'client': client,
            'risk': r['content'],
            'severity': r['severity'],
            'date': datetime.now().isoformat(),
            'source': r['source']
        } for r in risks]

    def _generate_outputs(self) -> Dict[str, Any]:
        """Generate output artifacts"""
        return {
            'client_profiles': self._generate_client_profiles(),
            'technology_matrix': self._generate_tech_matrix(),
            'dashboard_data': self._generate_dashboard_data(),
            'risk_register': self.risks
        }

    def _generate_client_profiles(self) -> Dict[str, Dict]:
        """Generate technical profiles for each client"""
        profiles = {}

        for client_id, data in self.clients.items():
            profiles[client_id] = {
                'client_id': client_id,
                'technologies': list(data['technologies']),
                'last_activity': data['last_activity'],
                'key_people': list(data['people']),
                'technical_decisions': len(data['decisions']),
                'open_risks': len(data['risks']),
                'recent_decisions': data['decisions'][-5:] if data['decisions'] else [],
                'active_risks': data['risks']
            }

        return profiles

    def _generate_tech_matrix(self) -> Dict[str, List[str]]:
        """Generate technology usage matrix"""
        return dict(self.technologies)

    def _generate_dashboard_data(self) -> Dict:
        """Generate dashboard summary data"""
        return {
            'total_clients': len(self.clients),
            'total_technologies': len(self.technologies),
            'total_risks': len(self.risks),
            'total_decisions': sum(len(c['decisions']) for c in self.clients.values()),
            'clients_with_risks': len([c for c in self.clients.values() if c['risks']]),
            'most_used_technologies': sorted(
                self.technologies.items(),
                key=lambda x: len(x[1]),
                reverse=True
            )[:10]
        }

    def _extract_actions(self) -> List[Dict]:
        """
        Extract action items from notes.

        TODO: Implement action item extraction
        Should look for patterns like:
        - "Action: {description}" or "TODO: {description}"
        - "Need to {action}" or "Should {action}"
        - Bullets starting with action verbs (review, create, schedule, etc.)

        Each action should include: description, owner (if mentioned), due date (if mentioned)
        """
        return []

    def _identify_escalations(self) -> List[Dict]:
        """
        Identify issues that need escalation to Senior Manager.

        Escalation triggers (per agent-responsibilities.md):
        - HIGH severity technical risk -> 4 hour SLA
        - Client with >= 3 open risks -> Schedule risk review meeting

        This implements the SA Agent's escalation path defined in the
        agent responsibility matrix.
        """
        escalations = []

        # Escalate high-severity risks (per threshold: HIGH -> immediate escalation)
        for risk in self.risks:
            if risk.get('severity') == 'HIGH':
                escalations.append({
                    'type': 'high_risk',
                    'severity': 'HIGH',
                    'description': f"High-severity risk for {risk['client']}: {risk['risk']}",
                    'recommended_action': 'Review with PM/Leadership'
                })

        # Escalate clients with many open risks
        for client_id, data in self.clients.items():
            if len(data['risks']) >= 3:
                escalations.append({
                    'type': 'multiple_risks',
                    'severity': 'MEDIUM',
                    'description': f"Client {client_id} has {len(data['risks'])} open risks",
                    'recommended_action': 'Schedule risk review meeting'
                })

        return escalations


if __name__ == "__main__":
    # Test the agent
    config_path = Path(__file__).parent / "agents" / "sa_agent.yaml"
    agent = SAAgent(config_path)

    print(f"✓ SA Agent initialized: {agent.agent_id}")
    print(f"  Purpose: {agent.config.purpose}")
    print(f"  Escalates to: {agent.config.escalation_to}")
