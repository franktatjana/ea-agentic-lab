"""
Tech Radar Pydantic Models
For job posting analysis and technology trend tracking
"""
from datetime import date, datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


# ==============================================================================
# ENUMS
# ==============================================================================


class TechQuadrant(str, Enum):
    techniques = "Techniques"
    tools = "Tools"
    platforms = "Platforms"
    languages_frameworks = "Languages & Frameworks"


class TechRing(str, Enum):
    adopt = "Adopt"
    trial = "Trial"
    assess = "Assess"
    hold = "Hold"


class JobRequirementLevel(str, Enum):
    required = "required"
    nice_to_have = "nice_to_have"
    mentioned = "mentioned"


class SeniorityLevel(str, Enum):
    entry = "entry"
    mid = "mid"
    senior = "senior"
    lead = "lead"
    principal = "principal"
    executive = "executive"


class ScanStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"


class JobSource(str, Enum):
    linkedin = "linkedin"
    indeed = "indeed"
    company_careers = "company_careers"
    glassdoor = "glassdoor"
    manual = "manual"


# ==============================================================================
# TECHNOLOGY MODELS
# ==============================================================================


class TechnologyMention(BaseModel):
    """Single mention of a technology in a job posting"""
    job_id: str
    job_title: str
    job_url: Optional[str] = None
    source: JobSource
    requirement_level: JobRequirementLevel
    seniority_level: SeniorityLevel
    context_snippet: Optional[str] = None
    posted_date: Optional[date] = None
    scanned_at: datetime


class TechnologyStats(BaseModel):
    """Aggregated statistics for a technology"""
    total_mentions: int = 0
    required_count: int = 0
    nice_to_have_count: int = 0
    mentioned_count: int = 0
    avg_seniority_score: float = 0.0  # 1-6 scale (entry=1, executive=6)
    trend_30d: Optional[float] = None  # Percentage change
    trend_90d: Optional[float] = None
    first_seen: Optional[date] = None
    last_seen: Optional[date] = None


class Technology(BaseModel):
    """A technology entry on the radar"""
    name: str
    canonical_name: str  # Normalized name (e.g., "React.js" -> "React")
    quadrant: TechQuadrant
    ring: TechRing
    is_new: bool = False  # New this scan period
    description: Optional[str] = None
    stats: TechnologyStats = TechnologyStats()
    auto_assigned: bool = True  # False if manually overridden
    override_reason: Optional[str] = None
    related_technologies: list[str] = []
    our_offering_match: Optional[str] = None  # Maps to our product if applicable
    is_competitor: bool = False  # Flag for competitive intelligence
    competitor_to: Optional[str] = None  # Which of our products it competes with

    class Config:
        populate_by_name = True


# ==============================================================================
# RADAR MODELS
# ==============================================================================


class RadarMetadata(BaseModel):
    """Metadata for a radar snapshot"""
    realm_id: str
    realm_name: Optional[str] = None
    generated_at: datetime
    scan_period_start: date
    scan_period_end: date
    jobs_scanned: int = 0
    sources_used: list[str] = []
    version: str = "1.0"


class RadarHighlights(BaseModel):
    """Highlights and changes for a radar"""
    new_technologies: list[str] = []
    trending_up: list[dict[str, Any]] = []  # [{name, change_pct}]
    trending_down: list[dict[str, Any]] = []
    competitive_insights: list[str] = []


class SkillsGapOpportunity(BaseModel):
    """Opportunity identified from skills gap analysis"""
    technology: str
    our_offering: str
    alignment: str  # strong, moderate, weak
    mention_count: int
    notes: Optional[str] = None


class SkillsGapItem(BaseModel):
    """Gap where we don't have an offering"""
    technology: str
    mention_count: int
    note: Optional[str] = None


class SkillsGapAnalysis(BaseModel):
    """Skills gap analysis comparing customer tech to our offerings"""
    opportunities: list[SkillsGapOpportunity] = []
    gaps: list[SkillsGapItem] = []


class TechRadar(BaseModel):
    """Complete tech radar for a realm"""
    metadata: RadarMetadata
    technologies: list[Technology] = []

    # Summary counts
    quadrant_summary: dict[str, int] = {}  # quadrant -> count
    ring_summary: dict[str, int] = {}  # ring -> count

    # Highlights
    highlights: RadarHighlights = RadarHighlights()

    # Skills gap analysis
    skills_gap: Optional[SkillsGapAnalysis] = None

    class Config:
        populate_by_name = True


class RadarChange(BaseModel):
    """Represents a change between radar versions"""
    technology_name: str
    change_type: str  # "new", "ring_change", "quadrant_change", "removed"
    previous_ring: Optional[TechRing] = None
    new_ring: Optional[TechRing] = None
    previous_quadrant: Optional[TechQuadrant] = None
    new_quadrant: Optional[TechQuadrant] = None
    change_reason: Optional[str] = None


class RadarDiff(BaseModel):
    """Diff between two radar versions"""
    realm_id: str
    from_date: date
    to_date: date
    changes: list[RadarChange] = []
    summary: str = ""
    technologies_added: int = 0
    technologies_removed: int = 0
    ring_changes: int = 0


# ==============================================================================
# JOB SCAN MODELS
# ==============================================================================


class JobPosting(BaseModel):
    """A scanned job posting"""
    job_id: str
    title: str
    company: str
    location: Optional[str] = None
    url: str
    source: JobSource
    posted_date: Optional[date] = None
    scanned_at: datetime
    raw_description: Optional[str] = None
    description_hash: Optional[str] = None  # For deduplication
    technologies_extracted: list[str] = []
    seniority_level: SeniorityLevel = SeniorityLevel.mid
    department: Optional[str] = None


class JobScanResult(BaseModel):
    """Results from a job scan run"""
    scan_id: str
    realm_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: ScanStatus = ScanStatus.pending
    jobs_found: int = 0
    jobs_processed: int = 0
    jobs_skipped: int = 0  # Duplicates
    technologies_found: int = 0
    new_technologies: int = 0
    errors: list[str] = []
    sources_scanned: list[str] = []


# ==============================================================================
# API REQUEST/RESPONSE MODELS
# ==============================================================================


class TechRadarResponse(BaseModel):
    """API response for current radar"""
    radar: TechRadar
    last_scan: Optional[datetime] = None
    next_scan: Optional[datetime] = None


class TechRadarExportEntry(BaseModel):
    """Single entry in BYOR export format"""
    name: str
    ring: str
    quadrant: str
    isNew: bool = Field(alias="is_new")
    description: str

    class Config:
        populate_by_name = True


class TechRadarExport(BaseModel):
    """BYOR-compatible export format"""
    entries: list[dict[str, Any]]  # name, ring, quadrant, isNew, description
    export_format: str
    generated_at: datetime
    realm_id: str


class TriggerScanRequest(BaseModel):
    """Request to trigger a manual scan"""
    sources: Optional[list[JobSource]] = None  # Override default sources
    days_back: int = Field(default=30, ge=1, le=90)
    force_rescan: bool = False  # Rescan even if recently scanned


class TriggerScanResponse(BaseModel):
    """Response from triggering a scan"""
    scan_id: str
    status: ScanStatus
    message: str
    estimated_duration_minutes: Optional[int] = None


class RadarHistoryEntry(BaseModel):
    """Entry in radar history"""
    date: date
    technology_count: int
    new_count: int = 0
    notable_changes: list[str] = []
    snapshot_path: str


# ==============================================================================
# HIRING VELOCITY MODELS
# ==============================================================================


class HiringVelocityMetric(BaseModel):
    """Hiring velocity for a technology or overall"""
    name: str
    current_period_jobs: int
    previous_period_jobs: int
    change_percentage: float
    avg_seniority: float


class HiringVelocityReport(BaseModel):
    """Complete hiring velocity report"""
    realm_id: str
    period_days: int
    total_jobs_current: int
    total_jobs_previous: int
    overall_change_percentage: float
    by_quadrant: dict[str, HiringVelocityMetric] = {}
    top_growing_technologies: list[HiringVelocityMetric] = []
    top_declining_technologies: list[HiringVelocityMetric] = []
    seniority_distribution: dict[str, int] = {}  # seniority -> count


# ==============================================================================
# TECHNOLOGY CATALOG MODELS
# ==============================================================================


class TechnologyPattern(BaseModel):
    """Pattern definition for technology detection"""
    pattern: str  # Regex pattern
    canonical: str  # Canonical name
    quadrant: TechQuadrant
    is_competitor: bool = False
    competitor_to: Optional[str] = None
    aliases: list[str] = []


class TechnologyTaxonomy(BaseModel):
    """Complete technology taxonomy for classification"""
    version: str
    last_updated: date
    languages: list[TechnologyPattern] = []
    frameworks: list[TechnologyPattern] = []
    platforms: list[TechnologyPattern] = []
    tools: list[TechnologyPattern] = []
    techniques: list[TechnologyPattern] = []
    competitors: list[TechnologyPattern] = []


# ==============================================================================
# JOB SOURCE CONFIGURATION
# ==============================================================================


class JobSourceConfig(BaseModel):
    """Configuration for a job source"""
    source: JobSource
    enabled: bool = True
    api_key_env: Optional[str] = None  # Environment variable name
    rate_limit_per_hour: int = 100
    requires_auth: bool = False
    base_url: Optional[str] = None


class JobSourcesConfig(BaseModel):
    """Configuration for all job sources"""
    sources: list[JobSourceConfig] = []
    default_days_back: int = 30
    max_jobs_per_source: int = 500
    excluded_terms: list[str] = []  # e.g., "staffing agency"
