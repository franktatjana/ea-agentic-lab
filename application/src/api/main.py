"""
EA Agentic Lab API
FastAPI backend for iOS companion app
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import nodes, health, risks, actions, decisions, profile, widgets, tech_radar

settings = get_settings()

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="REST API for EA Agentic Lab iOS companion app",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(nodes.router, prefix=settings.api_prefix, tags=["Nodes"])
app.include_router(health.router, prefix=settings.api_prefix, tags=["Health"])
app.include_router(risks.router, prefix=settings.api_prefix, tags=["Risks"])
app.include_router(actions.router, prefix=settings.api_prefix, tags=["Actions"])
app.include_router(decisions.router, prefix=settings.api_prefix, tags=["Decisions"])
app.include_router(profile.router, prefix=settings.api_prefix, tags=["Profile"])
app.include_router(widgets.router, prefix=settings.api_prefix, tags=["Widgets"])
app.include_router(tech_radar.router, prefix=settings.api_prefix, tags=["Tech Radar"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.api_title,
        "version": settings.api_version,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
