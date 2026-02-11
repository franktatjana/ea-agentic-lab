"""
Tech Signal Map Service
Business logic for tech signal map operations

The Tech Signal Map is a decision-support artifact embedded into playbooks,
governance, and agent workflows. Inspired by multiple industry models including
technology radars, but adapted for decision governance and agent-based operations.
"""
import csv
import io
import json
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Optional

import yaml

from ..config import get_settings
from ..models.tech_radar_schemas import (
    HiringVelocityMetric,
    HiringVelocityReport,
    JobScanResult,
    JobSource,
    RadarChange,
    RadarDiff,
    RadarHighlights,
    RadarHistoryEntry,
    RadarMetadata,
    ScanStatus,
    SkillsGapAnalysis,
    SkillsGapItem,
    SkillsGapOpportunity,
    TechQuadrant,
    TechRadar,
    TechRadarExport,
    TechRing,
    Technology,
    TechnologyStats,
    TriggerScanRequest,
)
from .technology_classifier import TechnologyClassifier, get_technology_classifier


class TechRadarService:
    """Service for tech radar operations"""

    def __init__(
        self,
        infohub_path: Optional[Path] = None,
        classifier: Optional[TechnologyClassifier] = None,
    ):
        settings = get_settings()
        self.infohub_path = infohub_path or settings.infohub_path
        self.classifier = classifier or get_technology_classifier()
        self._active_scans: dict[str, JobScanResult] = {}

    def _get_tech_signal_map_path(self, realm_id: str) -> Path:
        """Get path to tech signal map directory for a realm"""
        return self.infohub_path / realm_id / "intelligence" / "tech_signal_map"

    def _get_current_map_path(self, realm_id: str) -> Path:
        """Get path to current signal map file"""
        return self._get_tech_signal_map_path(realm_id) / "current_map.yaml"

    def _get_history_path(self, realm_id: str) -> Path:
        """Get path to signal map history directory"""
        return self._get_tech_signal_map_path(realm_id) / "map_history"

    def realm_exists(self, realm_id: str) -> bool:
        """Check if a realm exists"""
        realm_path = self.infohub_path / realm_id
        return realm_path.exists() and realm_path.is_dir()

    def get_current_radar(self, realm_id: str) -> Optional[TechRadar]:
        """Get the current tech signal map for a realm"""
        radar_path = self._get_current_map_path(realm_id)

        if not radar_path.exists():
            return None

        try:
            with open(radar_path) as f:
                data = yaml.safe_load(f)

            return self._parse_radar_yaml(data, realm_id)
        except Exception as e:
            print(f"Error loading radar for {realm_id}: {e}")
            return None

    def _parse_radar_yaml(self, data: dict, realm_id: str) -> TechRadar:
        """Parse radar YAML into TechRadar model"""
        metadata = RadarMetadata(
            realm_id=realm_id,
            realm_name=data.get("metadata", {}).get("realm_name", realm_id),
            generated_at=datetime.fromisoformat(
                data.get("metadata", {}).get("generated_at", datetime.now().isoformat())
            ),
            scan_period_start=date.fromisoformat(
                data.get("metadata", {}).get("scan_period_start", str(date.today() - timedelta(days=30)))
            ),
            scan_period_end=date.fromisoformat(
                data.get("metadata", {}).get("scan_period_end", str(date.today()))
            ),
            jobs_scanned=data.get("metadata", {}).get("jobs_scanned", 0),
            sources_used=data.get("metadata", {}).get("sources_used", []),
            version=data.get("metadata", {}).get("version", "1.0"),
        )

        technologies = []
        for tech_data in data.get("technologies", []):
            stats_data = tech_data.get("stats", {})
            stats = TechnologyStats(
                total_mentions=stats_data.get("total_mentions", 0),
                required_count=stats_data.get("required_count", 0),
                nice_to_have_count=stats_data.get("nice_to_have_count", 0),
                avg_seniority_score=stats_data.get("avg_seniority_score", 0),
                trend_30d=stats_data.get("trend_30d"),
                trend_90d=stats_data.get("trend_90d"),
                first_seen=date.fromisoformat(stats_data["first_seen"]) if stats_data.get("first_seen") else None,
                last_seen=date.fromisoformat(stats_data["last_seen"]) if stats_data.get("last_seen") else None,
            )

            tech = Technology(
                name=tech_data.get("name", ""),
                canonical_name=tech_data.get("canonical_name", tech_data.get("name", "")),
                quadrant=TechQuadrant(tech_data.get("quadrant", "Tools")),
                ring=TechRing(tech_data.get("ring", "Assess")),
                is_new=tech_data.get("is_new", False),
                description=tech_data.get("description"),
                stats=stats,
                is_competitor=tech_data.get("is_competitor", False),
                competitor_to=tech_data.get("competitor_to"),
                our_offering_match=tech_data.get("our_offering_match"),
            )
            technologies.append(tech)

        # Parse highlights
        highlights_data = data.get("highlights", {})
        highlights = RadarHighlights(
            new_technologies=[t.get("name", t) if isinstance(t, dict) else t for t in highlights_data.get("new_technologies", [])],
            trending_up=highlights_data.get("trending_up", []),
            trending_down=highlights_data.get("trending_down", []),
            competitive_insights=highlights_data.get("competitive_insights", []),
        )

        # Parse skills gap
        skills_gap = None
        if "skills_gap" in data:
            sg_data = data["skills_gap"]
            skills_gap = SkillsGapAnalysis(
                opportunities=[
                    SkillsGapOpportunity(**opp) for opp in sg_data.get("opportunities", [])
                ],
                gaps=[
                    SkillsGapItem(**gap) for gap in sg_data.get("gaps", [])
                ],
            )

        # Calculate summaries
        quadrant_summary = {}
        ring_summary = {}
        for tech in technologies:
            quadrant_summary[tech.quadrant.value] = quadrant_summary.get(tech.quadrant.value, 0) + 1
            ring_summary[tech.ring.value] = ring_summary.get(tech.ring.value, 0) + 1

        return TechRadar(
            metadata=metadata,
            technologies=technologies,
            quadrant_summary=quadrant_summary,
            ring_summary=ring_summary,
            highlights=highlights,
            skills_gap=skills_gap,
        )

    def filter_radar(
        self,
        radar: TechRadar,
        quadrant: Optional[TechQuadrant] = None,
        ring: Optional[TechRing] = None,
    ) -> TechRadar:
        """Filter radar technologies by quadrant and/or ring"""
        filtered_techs = radar.technologies

        if quadrant:
            filtered_techs = [t for t in filtered_techs if t.quadrant == quadrant]
        if ring:
            filtered_techs = [t for t in filtered_techs if t.ring == ring]

        # Recalculate summaries
        quadrant_summary = {}
        ring_summary = {}
        for tech in filtered_techs:
            quadrant_summary[tech.quadrant.value] = quadrant_summary.get(tech.quadrant.value, 0) + 1
            ring_summary[tech.ring.value] = ring_summary.get(tech.ring.value, 0) + 1

        return TechRadar(
            metadata=radar.metadata,
            technologies=filtered_techs,
            quadrant_summary=quadrant_summary,
            ring_summary=ring_summary,
            highlights=radar.highlights,
            skills_gap=radar.skills_gap,
        )

    def strip_stats(self, radar: TechRadar) -> TechRadar:
        """Remove detailed stats from radar (lighter response)"""
        stripped_techs = []
        for tech in radar.technologies:
            stripped = Technology(
                name=tech.name,
                canonical_name=tech.canonical_name,
                quadrant=tech.quadrant,
                ring=tech.ring,
                is_new=tech.is_new,
                description=tech.description,
                stats=TechnologyStats(total_mentions=tech.stats.total_mentions),
            )
            stripped_techs.append(stripped)

        return TechRadar(
            metadata=radar.metadata,
            technologies=stripped_techs,
            quadrant_summary=radar.quadrant_summary,
            ring_summary=radar.ring_summary,
            highlights=radar.highlights,
        )

    def export_standard_format(self, radar: TechRadar, format: str = "csv") -> list[dict]:
        """Export signal map in standard format for visualization tools"""
        entries = []

        for tech in radar.technologies:
            entry = {
                "name": tech.name,
                "ring": tech.ring.value,
                "quadrant": tech.quadrant.value,
                "isNew": "TRUE" if tech.is_new else "FALSE",
                "description": tech.description or f"Mentioned in {tech.stats.total_mentions} job postings",
            }
            entries.append(entry)

        return entries

    def generate_export_file(self, radar: TechRadar, format: str = "csv") -> str:
        """Generate export file content as string"""
        entries = self.export_standard_format(radar, format)

        if format == "json":
            # JSON format - convert isNew to boolean
            json_entries = []
            for entry in entries:
                json_entry = entry.copy()
                json_entry["isNew"] = entry["isNew"] == "TRUE"
                json_entries.append(json_entry)
            return json.dumps(json_entries, indent=2)

        # CSV format
        output = io.StringIO()
        if entries:
            writer = csv.DictWriter(output, fieldnames=["name", "ring", "quadrant", "isNew", "description"])
            writer.writeheader()
            writer.writerows(entries)

        return output.getvalue()

    def get_last_scan_time(self, realm_id: str) -> Optional[datetime]:
        """Get the time of the last scan"""
        radar = self.get_current_radar(realm_id)
        if radar:
            return radar.metadata.generated_at
        return None

    def get_next_scan_time(self, realm_id: str) -> Optional[datetime]:
        """Get the estimated next scan time (weekly on Sundays 2am)"""
        now = datetime.now()
        days_until_sunday = (6 - now.weekday()) % 7
        if days_until_sunday == 0 and now.hour >= 2:
            days_until_sunday = 7
        next_sunday = now + timedelta(days=days_until_sunday)
        return next_sunday.replace(hour=2, minute=0, second=0, microsecond=0)

    def is_scan_in_progress(self, realm_id: str) -> bool:
        """Check if a scan is currently in progress"""
        for scan_id, scan in self._active_scans.items():
            if scan.realm_id == realm_id and scan.status in [ScanStatus.pending, ScanStatus.in_progress]:
                return True
        return False

    def create_scan_job(self, realm_id: str, request: TriggerScanRequest) -> str:
        """Create a new scan job"""
        scan_id = str(uuid.uuid4())[:8]

        scan = JobScanResult(
            scan_id=scan_id,
            realm_id=realm_id,
            started_at=datetime.now(),
            status=ScanStatus.pending,
            sources_scanned=[s.value for s in (request.sources or [JobSource.linkedin, JobSource.indeed])],
        )

        self._active_scans[scan_id] = scan
        return scan_id

    async def run_scan(self, scan_id: str, realm_id: str, request: TriggerScanRequest):
        """Run a job scan (async background task)"""
        scan = self._active_scans.get(scan_id)
        if not scan:
            return

        scan.status = ScanStatus.in_progress

        try:
            # This would call the job scanner service
            # For now, simulate a scan
            import asyncio
            await asyncio.sleep(2)  # Simulate work

            scan.status = ScanStatus.completed
            scan.completed_at = datetime.now()
            scan.jobs_found = 50  # Simulated
            scan.jobs_processed = 50
            scan.technologies_found = 25

        except Exception as e:
            scan.status = ScanStatus.failed
            scan.errors.append(str(e))
            scan.completed_at = datetime.now()

    def get_scan_status(self, realm_id: str, scan_id: str) -> Optional[JobScanResult]:
        """Get the status of a scan job"""
        scan = self._active_scans.get(scan_id)
        if scan and scan.realm_id == realm_id:
            return scan
        return None

    def get_radar_history(
        self, realm_id: str, limit: int = 10, offset: int = 0
    ) -> list[RadarHistoryEntry]:
        """Get historical radar entries"""
        history_path = self._get_history_path(realm_id)
        entries = []

        if not history_path.exists():
            return entries

        # Get all snapshot files
        snapshots = sorted(history_path.glob("*_radar.yaml"), reverse=True)

        for snapshot_path in snapshots[offset:offset + limit]:
            filename = snapshot_path.stem
            snapshot_date = filename.replace("_radar", "")

            try:
                with open(snapshot_path) as f:
                    data = yaml.safe_load(f)

                tech_count = len(data.get("technologies", []))
                new_count = len(data.get("highlights", {}).get("new_technologies", []))
                changes = data.get("change_log", [{}])[0].get("changes", [])[:3]

                entries.append(RadarHistoryEntry(
                    date=date.fromisoformat(snapshot_date),
                    technology_count=tech_count,
                    new_count=new_count,
                    notable_changes=changes,
                    snapshot_path=str(snapshot_path),
                ))
            except Exception as e:
                print(f"Error parsing snapshot {snapshot_path}: {e}")

        return entries

    def get_radar_snapshot(self, realm_id: str, snapshot_date: date) -> Optional[TechRadar]:
        """Get a specific historical radar snapshot"""
        history_path = self._get_history_path(realm_id)
        snapshot_path = history_path / f"{snapshot_date.isoformat()}_radar.yaml"

        if not snapshot_path.exists():
            return None

        try:
            with open(snapshot_path) as f:
                data = yaml.safe_load(f)
            return self._parse_radar_yaml(data, realm_id)
        except Exception:
            return None

    def get_radar_diff(
        self, realm_id: str, from_date: date, to_date: date
    ) -> Optional[RadarDiff]:
        """Get diff between two radar versions"""
        from_radar = self.get_radar_snapshot(realm_id, from_date)
        to_radar = self.get_radar_snapshot(realm_id, to_date)

        # If to_date is today, use current radar
        if to_date == date.today():
            to_radar = self.get_current_radar(realm_id)

        if not from_radar or not to_radar:
            return None

        from_techs = {t.canonical_name: t for t in from_radar.technologies}
        to_techs = {t.canonical_name: t for t in to_radar.technologies}

        changes = []

        # Find new technologies
        for name, tech in to_techs.items():
            if name not in from_techs:
                changes.append(RadarChange(
                    technology_name=name,
                    change_type="new",
                    new_ring=tech.ring,
                    new_quadrant=tech.quadrant,
                ))

        # Find removed technologies
        for name, tech in from_techs.items():
            if name not in to_techs:
                changes.append(RadarChange(
                    technology_name=name,
                    change_type="removed",
                    previous_ring=tech.ring,
                    previous_quadrant=tech.quadrant,
                ))

        # Find ring/quadrant changes
        for name in set(from_techs.keys()) & set(to_techs.keys()):
            from_tech = from_techs[name]
            to_tech = to_techs[name]

            if from_tech.ring != to_tech.ring:
                changes.append(RadarChange(
                    technology_name=name,
                    change_type="ring_change",
                    previous_ring=from_tech.ring,
                    new_ring=to_tech.ring,
                ))

            if from_tech.quadrant != to_tech.quadrant:
                changes.append(RadarChange(
                    technology_name=name,
                    change_type="quadrant_change",
                    previous_quadrant=from_tech.quadrant,
                    new_quadrant=to_tech.quadrant,
                ))

        added = len([c for c in changes if c.change_type == "new"])
        removed = len([c for c in changes if c.change_type == "removed"])
        ring_changes = len([c for c in changes if c.change_type == "ring_change"])

        return RadarDiff(
            realm_id=realm_id,
            from_date=from_date,
            to_date=to_date,
            changes=changes,
            technologies_added=added,
            technologies_removed=removed,
            ring_changes=ring_changes,
            summary=f"{added} added, {removed} removed, {ring_changes} ring changes",
        )

    def get_technology_details(self, realm_id: str, tech_name: str) -> Optional[Technology]:
        """Get detailed info about a specific technology"""
        radar = self.get_current_radar(realm_id)
        if not radar:
            return None

        for tech in radar.technologies:
            if tech.canonical_name.lower() == tech_name.lower() or tech.name.lower() == tech_name.lower():
                return tech

        return None

    def get_skills_gap_analysis(self, realm_id: str) -> Optional[SkillsGapAnalysis]:
        """Get skills gap analysis for a realm"""
        radar = self.get_current_radar(realm_id)
        if not radar:
            return None

        return radar.skills_gap

    def get_hiring_velocity(self, realm_id: str, days: int = 30) -> HiringVelocityReport:
        """Get hiring velocity metrics"""
        radar = self.get_current_radar(realm_id)

        if not radar:
            return HiringVelocityReport(
                realm_id=realm_id,
                period_days=days,
                total_jobs_current=0,
                total_jobs_previous=0,
                overall_change_percentage=0,
            )

        # Calculate metrics from radar data
        total_current = radar.metadata.jobs_scanned
        total_previous = int(total_current * 0.9)  # Simulated - would come from history

        by_quadrant = {}
        for quadrant in TechQuadrant:
            techs_in_quadrant = [t for t in radar.technologies if t.quadrant == quadrant]
            if techs_in_quadrant:
                current = sum(t.stats.total_mentions for t in techs_in_quadrant)
                previous = int(current * 0.85)
                change = ((current - previous) / previous * 100) if previous > 0 else 0
                avg_seniority = sum(t.stats.avg_seniority_score for t in techs_in_quadrant) / len(techs_in_quadrant)

                by_quadrant[quadrant.value] = HiringVelocityMetric(
                    name=quadrant.value,
                    current_period_jobs=current,
                    previous_period_jobs=previous,
                    change_percentage=change,
                    avg_seniority=avg_seniority,
                )

        # Top growing
        growing = sorted(
            [t for t in radar.technologies if t.stats.trend_30d and t.stats.trend_30d > 0],
            key=lambda t: t.stats.trend_30d or 0,
            reverse=True,
        )[:5]

        top_growing = [
            HiringVelocityMetric(
                name=t.name,
                current_period_jobs=t.stats.total_mentions,
                previous_period_jobs=int(t.stats.total_mentions / (1 + (t.stats.trend_30d or 0) / 100)),
                change_percentage=t.stats.trend_30d or 0,
                avg_seniority=t.stats.avg_seniority_score,
            )
            for t in growing
        ]

        # Top declining
        declining = sorted(
            [t for t in radar.technologies if t.stats.trend_30d and t.stats.trend_30d < 0],
            key=lambda t: t.stats.trend_30d or 0,
        )[:5]

        top_declining = [
            HiringVelocityMetric(
                name=t.name,
                current_period_jobs=t.stats.total_mentions,
                previous_period_jobs=int(t.stats.total_mentions / (1 + (t.stats.trend_30d or 0) / 100)),
                change_percentage=t.stats.trend_30d or 0,
                avg_seniority=t.stats.avg_seniority_score,
            )
            for t in declining
        ]

        return HiringVelocityReport(
            realm_id=realm_id,
            period_days=days,
            total_jobs_current=total_current,
            total_jobs_previous=total_previous,
            overall_change_percentage=((total_current - total_previous) / total_previous * 100) if total_previous > 0 else 0,
            by_quadrant=by_quadrant,
            top_growing_technologies=top_growing,
            top_declining_technologies=top_declining,
        )


# Singleton instance
_service_instance: Optional[TechRadarService] = None


def get_tech_radar_service() -> TechRadarService:
    """Get or create the tech radar service instance"""
    global _service_instance
    if _service_instance is None:
        _service_instance = TechRadarService()
    return _service_instance
