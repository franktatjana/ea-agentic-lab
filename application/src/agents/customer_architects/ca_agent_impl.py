"""
Customer Architect Agent Implementation
Tracks customer-side architecture changes and adoption health

Purpose: Track customer-side architecture changes and ensure alignment with {vendor} designs

Architecture:
    1. Inherits from BaseAgent (core/agent_framework/base_agent.py)
    2. Loads configuration from YAML (domain/agents/customer_architects/agents/ca_agent.yaml)
    3. Implements process() method as the main entry point
    4. Extracts signals from inputs (meeting notes, architecture docs, reviews)
    5. Generates outputs (architecture context, risk alerts, adoption metrics)
    6. Identifies escalations based on design mismatches and integration risks

Key Features:
    - Architecture change detection with impact assessment
    - Integration risk identification and tracking
    - Design mismatch detection between customer and {vendor} designs
    - Customer adoption health monitoring
    - Voice of Customer (VoC) signal extraction
    - Customer Success Plan (CSP) context tracking

Integration Points:
    - Reads: Meeting notes, architecture documents, design reviews
    - Writes: Architecture context, integration risk alerts, adoption dashboards
    - Escalates to: SA/PM on critical design mismatches or integration risks
    - Collaborates with: SA Agent (defers technical assessment, provides context)

Usage:
    agent = CAAgent(config_path)
    result = agent.process({
        'meeting_notes': [note1, note2, ...],
        'architecture_docs': [doc1, doc2, ...],
        'design_reviews': [review1, ...]
    })
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from core.agent_framework.base_agent import BaseAgent, AgentConfig, load_agent_config
from typing import Dict, List, Any, Optional
import re
from datetime import datetime
from collections import defaultdict
from enum import Enum


class SignalType(Enum):
    """Types of signals detected by CA Agent"""
    ARCHITECTURE_CHANGE = "architecture_change"
    INTEGRATION_RISK = "integration_risk"
    DESIGN_MISMATCH = "design_mismatch"
    ADOPTION_SIGNAL = "adoption_signal"
    VOC_FEEDBACK = "voc_feedback"
    JOURNEY_FRICTION = "journey_friction"


class AdoptionLevel(Enum):
    """Customer adoption health levels"""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    AT_RISK = "AT_RISK"


class CAAgent(BaseAgent):
    """
    Customer Architect Agent

    Monitors customer-side architecture and adoption health:
    - Architecture changes and design shifts
    - Integration risks with {vendor} platform
    - Design mismatches requiring SA alignment
    - Adoption health and blockers
    - Voice of Customer feedback
    - Customer journey friction points
    """

    def __init__(self, config_path: Path):
        config = load_agent_config(config_path)
        super().__init__(config)

        # Load signal detection patterns from personality
        self._init_detection_patterns()

        # Customer tracking structures
        self.customers = defaultdict(lambda: {
            'architecture': {
                'infrastructure': [],
                'integrations': [],
                'dependencies': [],
                'changes': []
            },
            'adoption': {
                'level': None,
                'features_adopted': set(),
                'features_underutilized': set(),
                'blockers': [],
                'trend': 'stable'
            },
            'health': {
                'score': None,
                'technical_health': None,
                'adoption_health': None,
                'relationship_signals': [],
                'risk_indicators': []
            },
            'voc': {
                'nps_score': None,
                'csat_scores': [],
                'feedback': [],
                'sentiment': 'neutral'
            },
            'csp': {
                'phase': None,
                'milestones': [],
                'value_delivered': [],
                'next_actions': []
            },
            'last_activity': None,
            'stakeholders': set()
        })

        # Global tracking
        self.architecture_changes = []
        self.integration_risks = []
        self.design_mismatches = []
        self.voc_signals = []
        self.journey_friction_points = []

    def _init_detection_patterns(self):
        """Initialize signal detection patterns from personality config"""
        # Architecture change patterns
        self.architecture_patterns = [
            r'customer redesign',
            r'architecture shift',
            r'platform migration',
            r'infrastructure change',
            r'technology swap',
            r'moving to (.+)',
            r'migrating from (.+) to (.+)',
            r'redesigning (.+)',
            r'new (.+) platform',
            r'replacing (.+)'
        ]

        # Integration risk patterns
        self.integration_risk_patterns = [
            r'incompatibility',
            r'integration challenge',
            r'API mismatch',
            r'version conflict',
            r'deprecated endpoint',
            r'breaking change',
            r'compatibility issue',
            r'integration (failing|broken|blocked)',
            r'cannot connect',
            r'authentication (failed|issue|problem)'
        ]

        # Design mismatch patterns
        self.design_mismatch_patterns = [
            r'customer expects (.+) but (we|{vendor}) designed (.+)',
            r'assumption mismatch',
            r'different understanding',
            r'misaligned on (.+)',
            r'they thought (.+) but (.+)',
            r'miscommunication about (.+)',
            r'gap between (.+) and (.+)'
        ]

        # Adoption signal patterns
        self.adoption_patterns = {
            'positive': [
                r'actively using',
                r'fully adopted',
                r'expanded usage',
                r'new use case',
                r'increased adoption',
                r'rolled out to (.+) teams'
            ],
            'negative': [
                r'not using',
                r'underutilized',
                r'adoption blocked',
                r'struggling with',
                r'haven\'t deployed',
                r'reduced usage',
                r'churn risk'
            ]
        }

        # VoC patterns
        self.voc_patterns = {
            'positive': [
                r'happy with',
                r'pleased',
                r'great experience',
                r'love the (.+)',
                r'exceeded expectations',
                r'recommend'
            ],
            'negative': [
                r'frustrated',
                r'disappointed',
                r'not satisfied',
                r'expected better',
                r'considering alternatives',
                r'complaint'
            ]
        }

    def process(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main processing: extract intelligence from customer touchpoints

        Args:
            inputs: {
                'meeting_notes': List of meeting note dicts,
                'architecture_docs': List of architecture document dicts,
                'design_reviews': List of design review dicts,
                'support_tickets': Optional list of support tickets,
                'survey_responses': Optional list of survey responses
            }

        Returns:
            {
                'outputs': Generated artifacts (profiles, reports),
                'risks': Identified integration risks,
                'actions': Required actions,
                'escalations': Critical issues for SA/PM
            }
        """
        start_time = datetime.now()

        # Process each input type
        for note in inputs.get('meeting_notes', []):
            self._process_meeting_note(note)

        for doc in inputs.get('architecture_docs', []):
            self._process_architecture_doc(doc)

        for review in inputs.get('design_reviews', []):
            self._process_design_review(review)

        for ticket in inputs.get('support_tickets', []):
            self._process_support_ticket(ticket)

        for survey in inputs.get('survey_responses', []):
            self._process_survey_response(survey)

        # Generate outputs
        outputs = self._generate_outputs()

        # Identify escalations
        escalations = self._identify_escalations()

        result = {
            'outputs': outputs,
            'risks': self.integration_risks,
            'actions': self._extract_actions(),
            'escalations': escalations
        }

        # Log execution
        duration = (datetime.now() - start_time).total_seconds()
        self.log_execution(inputs, result, duration)

        return result

    def _process_meeting_note(self, note: Dict[str, Any]):
        """Process a meeting note for architecture and adoption signals"""
        content = note.get('content', '')
        date = note.get('date')
        customer_id = note.get('customer_id') or note.get('account_name')
        participants = note.get('participants', [])

        if not customer_id:
            # Try to extract customer from tags
            tags = note.get('tags', [])
            customers = [t.replace('client/', '').replace('customer/', '')
                        for t in tags if t.startswith(('client/', 'customer/'))]
            if customers:
                customer_id = customers[0]

        if not customer_id:
            return

        # Update customer tracking
        self.customers[customer_id]['last_activity'] = date
        self.customers[customer_id]['stakeholders'].update(participants)

        # Extract signals
        signals = self.extract_signals(content)

        for signal in signals:
            signal['customer_id'] = customer_id
            signal['date'] = date
            signal['source'] = 'meeting_notes'

            if signal['type'] == SignalType.ARCHITECTURE_CHANGE.value:
                self.architecture_changes.append(signal)
                self.customers[customer_id]['architecture']['changes'].append(signal)

            elif signal['type'] == SignalType.INTEGRATION_RISK.value:
                self.integration_risks.append(signal)

            elif signal['type'] == SignalType.DESIGN_MISMATCH.value:
                self.design_mismatches.append(signal)

            elif signal['type'] == SignalType.ADOPTION_SIGNAL.value:
                self._update_adoption_health(customer_id, signal)

            elif signal['type'] == SignalType.VOC_FEEDBACK.value:
                self.voc_signals.append(signal)
                self.customers[customer_id]['voc']['feedback'].append(signal)

    def _process_architecture_doc(self, doc: Dict[str, Any]):
        """Process architecture documentation"""
        content = doc.get('content', '')
        customer_id = doc.get('customer_id')
        doc_type = doc.get('doc_type', 'architecture')

        if not customer_id:
            return

        # Extract infrastructure and integration details
        self._extract_architecture_details(customer_id, content)

        # Check for change indicators
        signals = self.extract_signals(content)
        for signal in signals:
            signal['customer_id'] = customer_id
            signal['source'] = 'architecture_doc'

            if signal['type'] == SignalType.ARCHITECTURE_CHANGE.value:
                self.architecture_changes.append(signal)

            elif signal['type'] == SignalType.INTEGRATION_RISK.value:
                self.integration_risks.append(signal)

    def _process_design_review(self, review: Dict[str, Any]):
        """Process design review notes"""
        content = review.get('content', '')
        customer_id = review.get('customer_id')
        review_type = review.get('review_type', 'design')

        if not customer_id:
            return

        # Focus on mismatch detection
        signals = self.extract_signals(content)
        for signal in signals:
            signal['customer_id'] = customer_id
            signal['source'] = 'design_review'

            if signal['type'] == SignalType.DESIGN_MISMATCH.value:
                self.design_mismatches.append(signal)
                # Design mismatches often imply integration risk
                self.integration_risks.append({
                    'type': SignalType.INTEGRATION_RISK.value,
                    'content': f"Design mismatch may cause integration issues: {signal['content']}",
                    'severity': signal['severity'],
                    'customer_id': customer_id,
                    'source': 'design_review'
                })

    def _process_support_ticket(self, ticket: Dict[str, Any]):
        """Process support ticket for VoC and journey friction"""
        content = ticket.get('description', '') + ' ' + ticket.get('resolution', '')
        customer_id = ticket.get('customer_id')
        priority = ticket.get('priority', 'medium')

        if not customer_id:
            return

        # Check for integration issues
        signals = self.extract_signals(content)
        for signal in signals:
            signal['customer_id'] = customer_id
            signal['source'] = 'support_ticket'

            if signal['type'] == SignalType.INTEGRATION_RISK.value:
                self.integration_risks.append(signal)

            elif signal['type'] == SignalType.VOC_FEEDBACK.value:
                self.voc_signals.append(signal)

        # Track as journey friction if high priority
        if priority.lower() in ['high', 'critical', 'urgent']:
            self.journey_friction_points.append({
                'customer_id': customer_id,
                'type': 'support_escalation',
                'description': ticket.get('summary', content[:100]),
                'priority': priority,
                'source': 'support_ticket'
            })

    def _process_survey_response(self, survey: Dict[str, Any]):
        """Process survey response for VoC metrics"""
        customer_id = survey.get('customer_id')
        survey_type = survey.get('survey_type', 'general')

        if not customer_id:
            return

        # Update VoC metrics
        if survey_type == 'nps':
            score = survey.get('score')
            if score is not None:
                self.customers[customer_id]['voc']['nps_score'] = score

        elif survey_type == 'csat':
            score = survey.get('score')
            if score is not None:
                self.customers[customer_id]['voc']['csat_scores'].append({
                    'score': score,
                    'date': survey.get('date'),
                    'context': survey.get('context')
                })

        # Extract verbatim feedback
        verbatim = survey.get('verbatim', '')
        if verbatim:
            signals = self.extract_signals(verbatim)
            for signal in signals:
                signal['customer_id'] = customer_id
                signal['source'] = 'survey'
                self.voc_signals.append(signal)

    def _extract_architecture_details(self, customer_id: str, content: str):
        """Extract infrastructure and integration details from content"""
        # Infrastructure patterns
        infra_patterns = [
            (r'running on (AWS|Azure|GCP|on-prem|on-premises)', 'cloud_platform'),
            (r'using (Kubernetes|k8s|Docker|ECS|EKS|AKS|GKE)', 'container_platform'),
            (r'(Linux|Windows|RHEL|Ubuntu|CentOS)', 'os'),
        ]

        for pattern, category in infra_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                self.customers[customer_id]['architecture']['infrastructure'].append({
                    'category': category,
                    'value': match
                })

        # Integration patterns
        integration_patterns = [
            r'integrat(es|ed|ion) with (.+)',
            r'connected to (.+)',
            r'pulling data from (.+)',
            r'sending data to (.+)'
        ]

        for pattern in integration_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                integration = match.group(0)
                self.customers[customer_id]['architecture']['integrations'].append(integration)

    def _update_adoption_health(self, customer_id: str, signal: Dict):
        """Update customer adoption health based on signal"""
        adoption = self.customers[customer_id]['adoption']

        if signal.get('sentiment') == 'positive':
            if adoption['level'] in [None, AdoptionLevel.LOW.value, AdoptionLevel.AT_RISK.value]:
                adoption['level'] = AdoptionLevel.MEDIUM.value
            elif adoption['level'] == AdoptionLevel.MEDIUM.value:
                adoption['level'] = AdoptionLevel.HIGH.value
            adoption['trend'] = 'improving'

        elif signal.get('sentiment') == 'negative':
            if adoption['level'] in [None, AdoptionLevel.HIGH.value]:
                adoption['level'] = AdoptionLevel.MEDIUM.value
            elif adoption['level'] == AdoptionLevel.MEDIUM.value:
                adoption['level'] = AdoptionLevel.LOW.value
            elif adoption['level'] == AdoptionLevel.LOW.value:
                adoption['level'] = AdoptionLevel.AT_RISK.value
            adoption['trend'] = 'declining'

            # Track blocker
            adoption['blockers'].append({
                'description': signal['content'],
                'date': signal.get('date'),
                'source': signal.get('source')
            })

    def extract_signals(self, content: str) -> List[Dict]:
        """
        Extract relevant signals from content using pattern matching.

        Detects:
        - Architecture changes (platform migrations, redesigns)
        - Integration risks (compatibility issues, API mismatches)
        - Design mismatches (expectation gaps)
        - Adoption signals (usage patterns, blockers)
        - VoC feedback (satisfaction, complaints)

        Returns list of signal dictionaries with:
            - type: signal type from SignalType enum
            - content: signal content
            - severity: importance level (HIGH, MEDIUM, LOW)
            - sentiment: positive, negative, or neutral
            - source: populated by caller
        """
        signals = []

        # Architecture change detection
        for pattern in self.architecture_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                signals.append({
                    'type': SignalType.ARCHITECTURE_CHANGE.value,
                    'content': match.group(0),
                    'severity': 'MEDIUM',
                    'sentiment': 'neutral'
                })

        # Integration risk detection
        for pattern in self.integration_risk_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                signals.append({
                    'type': SignalType.INTEGRATION_RISK.value,
                    'content': match.group(0),
                    'severity': 'HIGH',
                    'sentiment': 'negative'
                })

        # Design mismatch detection
        for pattern in self.design_mismatch_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                signals.append({
                    'type': SignalType.DESIGN_MISMATCH.value,
                    'content': match.group(0),
                    'severity': 'HIGH',
                    'sentiment': 'negative'
                })

        # Adoption signal detection
        for pattern in self.adoption_patterns['positive']:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                signals.append({
                    'type': SignalType.ADOPTION_SIGNAL.value,
                    'content': match.group(0),
                    'severity': 'INFO',
                    'sentiment': 'positive'
                })

        for pattern in self.adoption_patterns['negative']:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                signals.append({
                    'type': SignalType.ADOPTION_SIGNAL.value,
                    'content': match.group(0),
                    'severity': 'MEDIUM',
                    'sentiment': 'negative'
                })

        # VoC feedback detection
        for pattern in self.voc_patterns['positive']:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                signals.append({
                    'type': SignalType.VOC_FEEDBACK.value,
                    'content': match.group(0),
                    'severity': 'INFO',
                    'sentiment': 'positive'
                })

        for pattern in self.voc_patterns['negative']:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                signals.append({
                    'type': SignalType.VOC_FEEDBACK.value,
                    'content': match.group(0),
                    'severity': 'HIGH',
                    'sentiment': 'negative'
                })

        return signals

    def _generate_outputs(self) -> Dict[str, Any]:
        """Generate output artifacts"""
        return {
            'customer_profiles': self._generate_customer_profiles(),
            'architecture_context': self._generate_architecture_context(),
            'adoption_dashboard': self._generate_adoption_dashboard(),
            'integration_risk_register': self.integration_risks,
            'design_mismatch_report': self.design_mismatches,
            'voc_summary': self._generate_voc_summary(),
            'dashboard_data': self._generate_dashboard_data()
        }

    def _generate_customer_profiles(self) -> Dict[str, Dict]:
        """Generate architecture and adoption profiles for each customer"""
        profiles = {}

        for customer_id, data in self.customers.items():
            profiles[customer_id] = {
                'customer_id': customer_id,
                'last_activity': data['last_activity'],
                'stakeholders': list(data['stakeholders']),
                'architecture_summary': {
                    'infrastructure': data['architecture']['infrastructure'],
                    'integrations': list(set(data['architecture']['integrations'])),
                    'recent_changes': data['architecture']['changes'][-5:]
                },
                'adoption': {
                    'level': data['adoption']['level'],
                    'trend': data['adoption']['trend'],
                    'blockers': data['adoption']['blockers'][-3:]
                },
                'health': {
                    'nps_score': data['voc']['nps_score'],
                    'avg_csat': self._calculate_avg_csat(data['voc']['csat_scores']),
                    'sentiment': data['voc']['sentiment']
                }
            }

        return profiles

    def _generate_architecture_context(self) -> Dict[str, Any]:
        """Generate architecture context summary for SA Agent"""
        return {
            'total_customers': len(self.customers),
            'recent_changes': self.architecture_changes[-10:],
            'customers_with_changes': len(set(c['customer_id'] for c in self.architecture_changes)),
            'common_platforms': self._get_common_platforms(),
            'integration_landscape': self._get_integration_summary()
        }

    def _generate_adoption_dashboard(self) -> Dict[str, Any]:
        """Generate adoption health dashboard"""
        adoption_levels = defaultdict(list)
        for customer_id, data in self.customers.items():
            level = data['adoption']['level'] or 'unknown'
            adoption_levels[level].append(customer_id)

        return {
            'by_level': dict(adoption_levels),
            'high_adoption': len(adoption_levels.get(AdoptionLevel.HIGH.value, [])),
            'medium_adoption': len(adoption_levels.get(AdoptionLevel.MEDIUM.value, [])),
            'low_adoption': len(adoption_levels.get(AdoptionLevel.LOW.value, [])),
            'at_risk': len(adoption_levels.get(AdoptionLevel.AT_RISK.value, [])),
            'total_blockers': sum(len(d['adoption']['blockers']) for d in self.customers.values()),
            'trending_down': [cid for cid, d in self.customers.items()
                            if d['adoption']['trend'] == 'declining']
        }

    def _generate_voc_summary(self) -> Dict[str, Any]:
        """Generate Voice of Customer summary"""
        positive_signals = [s for s in self.voc_signals if s.get('sentiment') == 'positive']
        negative_signals = [s for s in self.voc_signals if s.get('sentiment') == 'negative']

        nps_scores = [d['voc']['nps_score'] for d in self.customers.values()
                     if d['voc']['nps_score'] is not None]

        return {
            'total_feedback': len(self.voc_signals),
            'positive_signals': len(positive_signals),
            'negative_signals': len(negative_signals),
            'avg_nps': sum(nps_scores) / len(nps_scores) if nps_scores else None,
            'customers_with_negative_feedback': list(set(
                s['customer_id'] for s in negative_signals
            )),
            'recent_negative': negative_signals[-5:],
            'recent_positive': positive_signals[-5:]
        }

    def _generate_dashboard_data(self) -> Dict:
        """Generate dashboard summary data"""
        return {
            'timestamp': datetime.now().isoformat(),
            'total_customers': len(self.customers),
            'architecture_changes': len(self.architecture_changes),
            'integration_risks': len(self.integration_risks),
            'design_mismatches': len(self.design_mismatches),
            'voc_signals': len(self.voc_signals),
            'customers_at_risk': len([c for c, d in self.customers.items()
                                     if d['adoption']['level'] == AdoptionLevel.AT_RISK.value]),
            'high_severity_risks': len([r for r in self.integration_risks
                                        if r.get('severity') == 'HIGH'])
        }

    def _calculate_avg_csat(self, csat_scores: List[Dict]) -> Optional[float]:
        """Calculate average CSAT score"""
        if not csat_scores:
            return None
        scores = [s['score'] for s in csat_scores if s.get('score') is not None]
        return sum(scores) / len(scores) if scores else None

    def _get_common_platforms(self) -> Dict[str, int]:
        """Get common infrastructure platforms across customers"""
        platforms = defaultdict(int)
        for data in self.customers.values():
            for infra in data['architecture']['infrastructure']:
                if infra.get('category') == 'cloud_platform':
                    platforms[infra['value']] += 1
        return dict(platforms)

    def _get_integration_summary(self) -> Dict[str, int]:
        """Get summary of integration patterns"""
        integrations = defaultdict(int)
        for data in self.customers.values():
            for integration in data['architecture']['integrations']:
                integrations[integration] += 1
        return dict(sorted(integrations.items(), key=lambda x: x[1], reverse=True)[:10])

    def _extract_actions(self) -> List[Dict]:
        """Extract action items from processed data"""
        actions = []

        # Actions for design mismatches
        for mismatch in self.design_mismatches:
            actions.append({
                'type': 'alignment_meeting',
                'description': f"Schedule alignment meeting with SA for {mismatch.get('customer_id')}: {mismatch['content']}",
                'priority': 'HIGH',
                'owner': 'CA/SA'
            })

        # Actions for at-risk customers
        for customer_id, data in self.customers.items():
            if data['adoption']['level'] == AdoptionLevel.AT_RISK.value:
                actions.append({
                    'type': 'intervention',
                    'description': f"Plan intervention for at-risk customer {customer_id}",
                    'priority': 'HIGH',
                    'owner': 'CSM'
                })

        return actions

    def _identify_escalations(self) -> List[Dict]:
        """
        Identify issues that need escalation to SA/PM.

        Escalation triggers:
        - Critical design mismatch -> Immediate SA escalation
        - HIGH severity integration risk -> 4 hour SLA
        - Customer with multiple integration risks -> Risk review meeting
        - At-risk adoption with declining trend -> Leadership alert
        """
        escalations = []

        # Escalate design mismatches
        for mismatch in self.design_mismatches:
            escalations.append({
                'type': 'design_mismatch',
                'severity': 'HIGH',
                'description': f"Design mismatch for {mismatch.get('customer_id')}: {mismatch['content']}",
                'recommended_action': 'Schedule SA alignment session',
                'escalation_to': 'SA'
            })

        # Escalate high-severity integration risks
        for risk in self.integration_risks:
            if risk.get('severity') == 'HIGH':
                escalations.append({
                    'type': 'integration_risk',
                    'severity': 'HIGH',
                    'description': f"Integration risk for {risk.get('customer_id')}: {risk['content']}",
                    'recommended_action': 'Review with SA/Technical team',
                    'escalation_to': 'SA'
                })

        # Escalate customers with multiple risks
        customer_risk_counts = defaultdict(int)
        for risk in self.integration_risks:
            customer_risk_counts[risk.get('customer_id')] += 1

        for customer_id, count in customer_risk_counts.items():
            if count >= 3:
                escalations.append({
                    'type': 'multiple_risks',
                    'severity': 'MEDIUM',
                    'description': f"Customer {customer_id} has {count} integration risks",
                    'recommended_action': 'Schedule risk review meeting',
                    'escalation_to': 'PM'
                })

        # Escalate at-risk customers
        for customer_id, data in self.customers.items():
            if (data['adoption']['level'] == AdoptionLevel.AT_RISK.value and
                data['adoption']['trend'] == 'declining'):
                escalations.append({
                    'type': 'adoption_at_risk',
                    'severity': 'HIGH',
                    'description': f"Customer {customer_id} at-risk with declining adoption",
                    'recommended_action': 'Urgent intervention planning',
                    'escalation_to': 'Leadership'
                })

        return escalations


if __name__ == "__main__":
    # Test the agent
    config_path = Path(__file__).parent.parent.parent.parent.parent / "domain" / "agents" / "customer_architects" / "agents" / "ca_agent.yaml"
    agent = CAAgent(config_path)

    print(f"✓ CA Agent initialized: {agent.agent_id}")
    print(f"  Purpose: {agent.config.purpose}")
    print(f"  Team: {agent.config.team}")
    print(f"  Escalates to: {agent.config.escalation_to}")
