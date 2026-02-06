"""
Technology Classifier Service
Extracts and classifies technologies from job descriptions
"""
import re
from datetime import date
from pathlib import Path
from typing import Optional

import yaml

from ..models.tech_radar_schemas import (
    JobRequirementLevel,
    SeniorityLevel,
    TechQuadrant,
    TechRing,
    Technology,
    TechnologyStats,
    TechnologyPattern,
)


class TechnologyClassifier:
    """Extracts and classifies technologies from text"""

    def __init__(self, config_path: Optional[Path] = None):
        self.config_path = config_path or Path("config/tech_radar_config.yaml")
        self._load_config()

    def _load_config(self):
        """Load technology patterns and configuration"""
        if self.config_path.exists():
            with open(self.config_path) as f:
                self.config = yaml.safe_load(f)
        else:
            self.config = self._get_default_config()

        self._compile_patterns()

    def _get_default_config(self) -> dict:
        """Fallback configuration if file not found"""
        return {
            "technology_patterns": {
                "languages": [],
                "frameworks": [],
                "platforms": [],
                "tools": [],
                "techniques": [],
                "competitors": [],
            },
            "ring_rules": {
                "adopt": {"min_mentions": 20, "min_required_ratio": 0.7},
                "trial": {"min_mentions": 10, "min_required_ratio": 0.5},
                "assess": {"min_mentions": 3},
                "hold": {"negative_trend_threshold": -20},
            },
            "seniority_scoring": {
                "weights": {
                    "entry": 1.0,
                    "mid": 2.0,
                    "senior": 3.0,
                    "lead": 4.0,
                    "principal": 5.0,
                    "executive": 6.0,
                },
                "patterns": {},
            },
            "requirement_patterns": {
                "required": ["must have", "required", "essential"],
                "nice_to_have": ["nice to have", "preferred", "bonus"],
            },
        }

    def _compile_patterns(self):
        """Compile regex patterns for efficient matching"""
        self.tech_patterns: list[tuple[re.Pattern, str, TechQuadrant, bool, Optional[str]]] = []

        patterns = self.config.get("technology_patterns", {})

        for category in ["languages", "frameworks", "platforms", "tools", "techniques", "competitors"]:
            for item in patterns.get(category, []):
                try:
                    compiled = re.compile(item["pattern"], re.IGNORECASE)
                    quadrant = TechQuadrant(item.get("quadrant", "Tools"))
                    is_competitor = item.get("is_competitor", False)
                    competitor_to = item.get("competitor_to")
                    self.tech_patterns.append(
                        (compiled, item["canonical"], quadrant, is_competitor, competitor_to)
                    )
                except (re.error, KeyError) as e:
                    print(f"Warning: Invalid pattern in {category}: {e}")

        # Compile seniority patterns
        self.seniority_patterns: dict[SeniorityLevel, list[re.Pattern]] = {}
        seniority_config = self.config.get("seniority_scoring", {}).get("patterns", {})

        for level_name, patterns_list in seniority_config.items():
            try:
                level = SeniorityLevel(level_name)
                self.seniority_patterns[level] = [
                    re.compile(p, re.IGNORECASE) for p in patterns_list
                ]
            except (ValueError, re.error):
                pass

        # Compile requirement patterns
        req_config = self.config.get("requirement_patterns", {})
        self.required_patterns = [
            re.compile(p, re.IGNORECASE) for p in req_config.get("required", [])
        ]
        self.nice_to_have_patterns = [
            re.compile(p, re.IGNORECASE) for p in req_config.get("nice_to_have", [])
        ]

    def extract_technologies(self, text: str) -> list[dict]:
        """
        Extract technologies from text (job description)

        Returns list of dicts with:
        - canonical_name: Normalized technology name
        - quadrant: TechQuadrant
        - is_competitor: bool
        - competitor_to: Optional[str]
        - context_snippet: Surrounding text
        """
        results = []
        seen = set()

        for pattern, canonical, quadrant, is_competitor, competitor_to in self.tech_patterns:
            for match in pattern.finditer(text):
                if canonical.lower() in seen:
                    continue
                seen.add(canonical.lower())

                # Get context snippet (100 chars around match)
                start = max(0, match.start() - 50)
                end = min(len(text), match.end() + 50)
                snippet = text[start:end].strip()

                results.append({
                    "canonical_name": canonical,
                    "quadrant": quadrant,
                    "is_competitor": is_competitor,
                    "competitor_to": competitor_to,
                    "context_snippet": snippet,
                })

        return results

    def detect_seniority(self, job_title: str) -> SeniorityLevel:
        """Detect seniority level from job title"""
        job_title_lower = job_title.lower()

        # Check patterns in order of specificity (most senior first)
        for level in [
            SeniorityLevel.executive,
            SeniorityLevel.principal,
            SeniorityLevel.lead,
            SeniorityLevel.senior,
            SeniorityLevel.mid,
            SeniorityLevel.entry,
        ]:
            patterns = self.seniority_patterns.get(level, [])
            for pattern in patterns:
                if pattern.search(job_title_lower):
                    return level

        # Default to mid-level
        return SeniorityLevel.mid

    def detect_requirement_level(
        self, tech_name: str, context: str
    ) -> JobRequirementLevel:
        """
        Detect if technology is required or nice-to-have based on context
        """
        context_lower = context.lower()

        # Check for required patterns near the technology mention
        for pattern in self.required_patterns:
            if pattern.search(context_lower):
                return JobRequirementLevel.required

        # Check for nice-to-have patterns
        for pattern in self.nice_to_have_patterns:
            if pattern.search(context_lower):
                return JobRequirementLevel.nice_to_have

        # Default to mentioned (neither required nor nice-to-have explicitly)
        return JobRequirementLevel.mentioned

    def get_seniority_score(self, level: SeniorityLevel) -> float:
        """Get numeric score for seniority level"""
        weights = self.config.get("seniority_scoring", {}).get("weights", {})
        return weights.get(level.value, 2.0)

    def assign_ring(
        self,
        stats: TechnologyStats,
        is_new: bool = False,
        manual_override: Optional[TechRing] = None,
    ) -> TechRing:
        """
        Assign ring based on statistics and rules

        Logic:
        - ADOPT: required_count >= 20 AND required_ratio >= 0.7
        - TRIAL: required_count >= 10 AND required_ratio >= 0.5
        - ASSESS: total_mentions >= 3 (or is_new)
        - HOLD: trend_30d < -20%
        """
        if manual_override:
            return manual_override

        rules = self.config.get("ring_rules", {})

        # Check for Hold first (declining technology)
        hold_threshold = rules.get("hold", {}).get("negative_trend_threshold", -20)
        if stats.trend_30d is not None and stats.trend_30d < hold_threshold:
            return TechRing.hold

        # Calculate required ratio
        if stats.total_mentions > 0:
            required_ratio = stats.required_count / stats.total_mentions
        else:
            required_ratio = 0

        # Check Adopt
        adopt_rules = rules.get("adopt", {})
        if (
            stats.required_count >= adopt_rules.get("min_mentions", 20)
            and required_ratio >= adopt_rules.get("min_required_ratio", 0.7)
        ):
            return TechRing.adopt

        # Check Trial
        trial_rules = rules.get("trial", {})
        if (
            stats.required_count >= trial_rules.get("min_mentions", 10)
            and required_ratio >= trial_rules.get("min_required_ratio", 0.5)
        ):
            return TechRing.trial

        # Check Assess (or new technology)
        assess_rules = rules.get("assess", {})
        if is_new or stats.total_mentions >= assess_rules.get("min_mentions", 3):
            return TechRing.assess

        # Default to Assess for anything with mentions
        if stats.total_mentions > 0:
            return TechRing.assess

        return TechRing.hold

    def create_technology(
        self,
        canonical_name: str,
        quadrant: TechQuadrant,
        stats: TechnologyStats,
        is_new: bool = False,
        is_competitor: bool = False,
        competitor_to: Optional[str] = None,
        our_offering_match: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Technology:
        """Create a Technology object with calculated ring"""
        ring = self.assign_ring(stats, is_new=is_new)

        return Technology(
            name=canonical_name,
            canonical_name=canonical_name,
            quadrant=quadrant,
            ring=ring,
            is_new=is_new,
            description=description,
            stats=stats,
            is_competitor=is_competitor,
            competitor_to=competitor_to,
            our_offering_match=our_offering_match,
        )

    def calculate_trend(
        self,
        current_count: int,
        previous_count: int,
    ) -> Optional[float]:
        """Calculate percentage trend between two periods"""
        if previous_count == 0:
            return None if current_count == 0 else 100.0
        return ((current_count - previous_count) / previous_count) * 100

    def get_platform_offering_match(self, tech_name: str) -> Optional[str]:
        """Check if technology matches one of our offerings"""
        offerings = self.config.get("platform_offerings", {})

        tech_lower = tech_name.lower()

        for offering_key, offering_data in offerings.items():
            related = offering_data.get("related_technologies", [])
            displaces = offering_data.get("displaces", [])

            # Check if tech is related to our offering
            for related_tech in related:
                if related_tech.lower() in tech_lower or tech_lower in related_tech.lower():
                    return offering_data.get("name")

            # Check if tech is a competitor we displace
            for displaced in displaces:
                if displaced.lower() in tech_lower or tech_lower in displaced.lower():
                    return f"{offering_data.get('name')} (displacement opportunity)"

        return None


# Singleton instance for dependency injection
_classifier_instance: Optional[TechnologyClassifier] = None


def get_technology_classifier() -> TechnologyClassifier:
    """Get or create the technology classifier instance"""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = TechnologyClassifier()
    return _classifier_instance
