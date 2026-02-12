"""
EA Agentic Lab API
FastAPI backend for iOS companion app
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import nodes, health, risks, actions, decisions, profile, widgets, tech_radar, playbooks, blueprints, docs, vault, knowledge

settings = get_settings()
settings.validate_production()

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="REST API for EA Agentic Lab iOS companion app",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
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
app.include_router(playbooks.router, prefix=settings.api_prefix, tags=["Playbooks"])
app.include_router(blueprints.router, prefix=settings.api_prefix, tags=["Blueprints"])
app.include_router(docs.router, prefix=settings.api_prefix, tags=["Documentation"])
app.include_router(vault.router, prefix=settings.api_prefix, tags=["Vault"])
app.include_router(knowledge.router, prefix=settings.api_prefix, tags=["Knowledge"])


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
