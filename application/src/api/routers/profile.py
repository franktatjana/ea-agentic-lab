"""
User Profile API Router
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends

from ..models.schemas import (
    UserProfile,
    UserProfileUpdate,
    UserPreferences,
    NotificationPreferences,
)
from ..services.yaml_loader import get_yaml_loader, YAMLLoader

router = APIRouter()


# For demo purposes, use a simple user ID
# In production, this would come from authentication
DEMO_USER_ID = "demo_user"


@router.get("/profile", response_model=UserProfile)
async def get_profile(
    user_id: str = DEMO_USER_ID,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get current user profile"""
    profile = loader.get_user_profile(user_id)
    if not profile:
        # Create default profile if it doesn't exist
        profile = UserProfile(
            user_id=user_id,
            email=f"{user_id}@example.com",
            display_name="Demo User",
            created_at=datetime.now(),
        )
        loader.save_user_profile(profile)
    return profile


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    update: UserProfileUpdate,
    user_id: str = DEMO_USER_ID,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Update user profile"""
    profile = loader.get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Update fields
    if update.display_name is not None:
        profile.display_name = update.display_name
    if update.preferences is not None:
        profile.preferences = update.preferences
    if update.notifications is not None:
        profile.notifications = update.notifications
    if update.followed_agents is not None:
        profile.followed_agents = update.followed_agents
    if update.followed_nodes is not None:
        profile.followed_nodes = update.followed_nodes

    profile.last_seen = datetime.now()
    loader.save_user_profile(profile)
    return profile


@router.put("/profile/preferences", response_model=UserPreferences)
async def update_preferences(
    preferences: UserPreferences,
    user_id: str = DEMO_USER_ID,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Update user preferences"""
    profile = loader.get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.preferences = preferences
    profile.last_seen = datetime.now()
    loader.save_user_profile(profile)
    return profile


@router.put("/profile/notifications", response_model=NotificationPreferences)
async def update_notification_preferences(
    notifications: NotificationPreferences,
    user_id: str = DEMO_USER_ID,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Update notification preferences"""
    profile = loader.get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.notifications = notifications
    profile.last_seen = datetime.now()
    loader.save_user_profile(profile)
    return notifications


@router.post("/profile/followed-agents/{agent_id}")
async def follow_agent(
    agent_id: str,
    user_id: str = DEMO_USER_ID,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Follow an agent for notifications"""
    profile = loader.get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if agent_id not in profile.followed_agents:
        profile.followed_agents.append(agent_id)
        loader.save_user_profile(profile)

    return {"status": "ok", "followed_agents": profile.followed_agents}


@router.delete("/profile/followed-agents/{agent_id}")
async def unfollow_agent(
    agent_id: str,
    user_id: str = DEMO_USER_ID,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Unfollow an agent"""
    profile = loader.get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if agent_id in profile.followed_agents:
        profile.followed_agents.remove(agent_id)
        loader.save_user_profile(profile)

    return {"status": "ok", "followed_agents": profile.followed_agents}


@router.post("/profile/followed-nodes/{node_id:path}")
async def follow_node(
    node_id: str,
    user_id: str = DEMO_USER_ID,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Follow a node for notifications (node_id format: realm_id/node_id)"""
    profile = loader.get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if node_id not in profile.followed_nodes:
        profile.followed_nodes.append(node_id)
        loader.save_user_profile(profile)

    return {"status": "ok", "followed_nodes": profile.followed_nodes}


@router.delete("/profile/followed-nodes/{node_id:path}")
async def unfollow_node(
    node_id: str,
    user_id: str = DEMO_USER_ID,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Unfollow a node"""
    profile = loader.get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if node_id in profile.followed_nodes:
        profile.followed_nodes.remove(node_id)
        loader.save_user_profile(profile)

    return {"status": "ok", "followed_nodes": profile.followed_nodes}
