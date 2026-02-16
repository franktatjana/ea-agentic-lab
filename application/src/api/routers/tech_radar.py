"""
Technology Scout API Router
Endpoints for technology intelligence based on job posting data

The Technology Scout is a decision-support artifact embedded into playbooks,
governance, and agent workflows. Inspired by multiple industry models including
technology radars, but adapted for decision governance and agent-based operations.
"""
from datetime import date
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query, Response
from fastapi.responses import StreamingResponse
import io

from ..models.tech_radar_schemas import (
    TechRadar,
    TechRadarResponse,
    TechRadarExport,
    TriggerScanRequest,
    TriggerScanResponse,
    RadarHistoryEntry,
    RadarDiff,
    SkillsGapAnalysis,
    HiringVelocityReport,
    ScanStatus,
)
from ..services.tech_radar_service import TechRadarService


router = APIRouter()


def get_tech_radar_service() -> TechRadarService:
    """Dependency for TechRadarService"""
    return TechRadarService()


# ==============================================================================
# CURRENT RADAR
# ==============================================================================


@router.get("/realms/{realm_id}/tech-signal-map", response_model=TechRadarResponse)
async def get_tech_radar(
    realm_id: str,
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    Get the current tech signal map for a realm.

    Returns the latest technology radar generated from job posting analysis,
    including all technologies organized by quadrant and ring.
    """
    radar = service.get_current_radar(realm_id)
    if not radar:
        raise HTTPException(
            status_code=404,
            detail=f"Technology Scout not found for realm {realm_id}"
        )

    return TechRadarResponse(
        radar=radar,
        last_scan=radar.metadata.generated_at,
        next_scan=None,  # Would be populated from scheduler
    )


@router.get("/realms/{realm_id}/tech-signal-map/technologies")
async def list_technologies(
    realm_id: str,
    quadrant: Optional[str] = Query(None, description="Filter by quadrant"),
    ring: Optional[str] = Query(None, description="Filter by ring"),
    is_new: Optional[bool] = Query(None, description="Filter new technologies"),
    is_competitor: Optional[bool] = Query(None, description="Filter competitor technologies"),
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    List technologies with optional filtering.

    Useful for getting a subset of the radar data.
    """
    radar = service.get_current_radar(realm_id)
    if not radar:
        raise HTTPException(
            status_code=404,
            detail=f"Technology Scout not found for realm {realm_id}"
        )

    technologies = radar.technologies

    # Apply filters
    if quadrant:
        technologies = [t for t in technologies if t.quadrant.value == quadrant]
    if ring:
        technologies = [t for t in technologies if t.ring.value == ring]
    if is_new is not None:
        technologies = [t for t in technologies if t.is_new == is_new]
    if is_competitor is not None:
        technologies = [t for t in technologies if t.is_competitor == is_competitor]

    return {
        "realm_id": realm_id,
        "count": len(technologies),
        "technologies": technologies,
    }


# ==============================================================================
# EXPORT (BYOR FORMAT)
# ==============================================================================


@router.get("/realms/{realm_id}/tech-signal-map/export", response_model=TechRadarExport)
async def export_tech_radar(
    realm_id: str,
    format: str = Query("json", enum=["json", "csv"], description="Export format"),
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    Export the tech signal map in standard format.

    Formats:
    - json: JSON array of technology entries
    - csv: CSV file for visualization tools

    Each entry contains: name, ring, quadrant, isNew, description
    """
    radar = service.get_current_radar(realm_id)
    if not radar:
        raise HTTPException(
            status_code=404,
            detail=f"Technology Scout not found for realm {realm_id}"
        )

    entries = service.export_standard_format(radar, format)

    return TechRadarExport(
        entries=entries,
        export_format=format,
        generated_at=radar.metadata.generated_at,
        realm_id=realm_id,
    )


@router.get("/realms/{realm_id}/tech-signal-map/export/file")
async def download_tech_radar(
    realm_id: str,
    format: str = Query("csv", enum=["json", "csv"], description="Export format"),
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    Download the tech signal map as a file.

    Returns a downloadable CSV or JSON file for use with
    visualization tools or integration with other systems.
    """
    radar = service.get_current_radar(realm_id)
    if not radar:
        raise HTTPException(
            status_code=404,
            detail=f"Technology Scout not found for realm {realm_id}"
        )

    content = service.generate_export_file(radar, format)

    media_type = "text/csv" if format == "csv" else "application/json"
    filename = f"{realm_id.lower()}_technology_scout.{format}"

    return StreamingResponse(
        io.StringIO(content),
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


# ==============================================================================
# SCANNING
# ==============================================================================


@router.post("/realms/{realm_id}/tech-signal-map/scan", response_model=TriggerScanResponse)
async def trigger_scan(
    realm_id: str,
    request: TriggerScanRequest = TriggerScanRequest(),
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    Trigger a manual job posting scan for the realm.

    This will:
    1. Fetch job postings from configured sources (LinkedIn, Indeed, careers pages)
    2. Extract technologies using NLP/pattern matching
    3. Update the tech signal map based on findings
    4. Emit SIG_TECH_004 (job_scan_completed) signal

    Note: Scans are rate-limited. Use force_rescan=true to override recent scan check.
    """
    # Check if realm exists
    radar = service.get_current_radar(realm_id)
    if not radar:
        # For new realms, we'd create an empty radar first
        pass

    # In production, this would queue an async job
    # For now, return a placeholder response
    import uuid
    scan_id = str(uuid.uuid4())

    return TriggerScanResponse(
        scan_id=scan_id,
        status=ScanStatus.pending,
        message=f"Scan queued for realm {realm_id}. Sources: {request.sources or 'all'}",
        estimated_duration_minutes=5,
    )


@router.get("/realms/{realm_id}/tech-signal-map/scan/{scan_id}")
async def get_scan_status(
    realm_id: str,
    scan_id: str,
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    Get the status of a running or completed scan.
    """
    # In production, this would query scan status from job queue
    return {
        "scan_id": scan_id,
        "realm_id": realm_id,
        "status": "pending",
        "message": "Scan status tracking not yet implemented",
    }


# ==============================================================================
# HISTORY & DIFF
# ==============================================================================


@router.get("/realms/{realm_id}/tech-signal-map/history", response_model=list[RadarHistoryEntry])
async def get_radar_history(
    realm_id: str,
    limit: int = Query(10, ge=1, le=100, description="Max entries to return"),
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    Get the history of radar snapshots for a realm.

    Returns a list of historical radar entries with summary info.
    """
    history = service.get_radar_history(realm_id, limit)
    return history


@router.get("/realms/{realm_id}/tech-signal-map/diff", response_model=RadarDiff)
async def get_radar_diff(
    realm_id: str,
    from_date: date = Query(..., description="Start date for comparison"),
    to_date: date = Query(..., description="End date for comparison"),
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    Compare two radar versions to see changes.

    Shows:
    - New technologies added
    - Technologies removed
    - Ring changes (e.g., Trial -> Adopt)
    - Quadrant changes
    """
    diff = service.get_radar_diff(realm_id, from_date, to_date)
    if not diff:
        raise HTTPException(
            status_code=404,
            detail=f"Could not generate diff for {realm_id} between {from_date} and {to_date}"
        )
    return diff


# ==============================================================================
# ANALYSIS
# ==============================================================================


@router.get("/realms/{realm_id}/tech-signal-map/skills-gap", response_model=SkillsGapAnalysis)
async def get_skills_gap(
    realm_id: str,
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    Get skills gap analysis comparing customer tech stack to our offerings.

    Returns:
    - Opportunities: Technologies where our products align well
    - Gaps: Technologies we don't cover (partner opportunities)

    This is useful for:
    - Solution Architects: Finding upsell opportunities
    - Account Teams: Understanding customer technology direction
    - Competitive Intelligence: Tracking competitor tool adoption
    """
    analysis = service.get_skills_gap_analysis(realm_id)
    if not analysis:
        raise HTTPException(
            status_code=404,
            detail=f"Skills gap analysis not available for realm {realm_id}"
        )
    return analysis


@router.get("/realms/{realm_id}/tech-signal-map/hiring-velocity", response_model=HiringVelocityReport)
async def get_hiring_velocity(
    realm_id: str,
    days: int = Query(30, ge=7, le=90, description="Period in days"),
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    Get hiring velocity metrics for the realm.

    Shows:
    - Total job posting volume and trends
    - Technology-specific hiring trends
    - Seniority distribution (are they hiring decision-makers?)
    - Top growing and declining technologies

    High hiring velocity + senior roles = active investment signals.
    """
    report = service.get_hiring_velocity(realm_id, days)
    return report


@router.get("/realms/{realm_id}/tech-signal-map/competitive")
async def get_competitive_insights(
    realm_id: str,
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    Get competitive intelligence insights.

    Returns:
    - Competitor tool mentions (LegacySIEM, ObservabilityVendorA, etc.)
    - Trend direction (declining = displacement opportunity)
    - Technologies where our products directly compete
    """
    radar = service.get_current_radar(realm_id)
    if not radar:
        raise HTTPException(
            status_code=404,
            detail=f"Technology Scout not found for realm {realm_id}"
        )

    # Extract competitor technologies
    competitors = [t for t in radar.technologies if t.is_competitor]

    insights = []
    for comp in competitors:
        trend = comp.stats.trend_30d or 0
        insight = {
            "technology": comp.name,
            "competes_with": comp.competitor_to,
            "mentions": comp.stats.total_mentions,
            "trend_30d": trend,
            "opportunity": "displacement" if trend < -10 else "competitive" if trend < 10 else "growing",
        }
        insights.append(insight)

    return {
        "realm_id": realm_id,
        "competitor_count": len(competitors),
        "insights": insights,
        "summary": radar.highlights.competitive_insights if radar.highlights else [],
    }


# ==============================================================================
# SUMMARY / HIGHLIGHTS
# ==============================================================================


@router.get("/realms/{realm_id}/tech-signal-map/highlights")
async def get_radar_highlights(
    realm_id: str,
    service: TechRadarService = Depends(get_tech_radar_service),
):
    """
    Get key highlights from the current radar.

    Quick summary of:
    - New technologies this period
    - Top trending up/down
    - Competitive insights
    - Key recommendations
    """
    radar = service.get_current_radar(realm_id)
    if not radar:
        raise HTTPException(
            status_code=404,
            detail=f"Technology Scout not found for realm {realm_id}"
        )

    return {
        "realm_id": realm_id,
        "period": {
            "start": radar.metadata.scan_period_start,
            "end": radar.metadata.scan_period_end,
        },
        "jobs_scanned": radar.metadata.jobs_scanned,
        "technology_count": len(radar.technologies),
        "quadrant_summary": radar.quadrant_summary,
        "ring_summary": radar.ring_summary,
        "highlights": radar.highlights,
    }
