const API_BASE = "/api/v1";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return res.json();
}

// Realms & Nodes
export const api = {
  listRealms: () => fetchApi<import("@/types").Realm[]>("/realms"),

  getRealm: (realmId: string) =>
    fetchApi<import("@/types").Realm>(`/realms/${realmId}`),

  getRealmProfile: (realmId: string) =>
    fetchApi<Record<string, unknown>>(`/realms/${realmId}/profile`),

  listNodes: (realmId: string) =>
    fetchApi<import("@/types").NodeSummary[]>(`/realms/${realmId}/nodes`),

  getNode: (realmId: string, nodeId: string) =>
    fetchApi<import("@/types").Node>(`/nodes/${realmId}/${nodeId}`),

  getBlueprint: (realmId: string, nodeId: string) =>
    fetchApi<Record<string, unknown>>(`/nodes/${realmId}/${nodeId}/blueprint`),

  getHealth: (realmId: string, nodeId: string) =>
    fetchApi<import("@/types").HealthScore>(`/nodes/${realmId}/${nodeId}/health`),

  getRisks: (realmId: string, nodeId: string) =>
    fetchApi<import("@/types").RiskRegister>(`/nodes/${realmId}/${nodeId}/risks`),

  getActions: (realmId: string, nodeId: string) =>
    fetchApi<import("@/types").ActionTracker>(`/nodes/${realmId}/${nodeId}/actions`),

  getStakeholders: (realmId: string, nodeId: string) =>
    fetchApi<Record<string, unknown>>(`/nodes/${realmId}/${nodeId}/stakeholders`),

  getValue: (realmId: string, nodeId: string) =>
    fetchApi<Record<string, unknown>>(`/nodes/${realmId}/${nodeId}/value`),

  // Documentation - browse and read markdown files from docs/ directory
  getDocsTree: () => // Returns hierarchical tree of all doc files for sidebar navigation
    fetchApi<import("@/types").DocTreeEntry[]>("/docs/tree"),

  getDocContent: (docPath: string) => // Fetch raw markdown by relative path (e.g. "architecture/agents/agent-architecture.md")
    fetchApi<import("@/types").DocContent>(`/docs/${docPath}`),

  // Playbooks
  listPlaybooks: (params?: {
    role?: string;
    status?: string;
    team?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set("role", params.role);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.team) searchParams.set("team", params.team);
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return fetchApi<import("@/types").Playbook[]>(
      `/playbooks${qs ? `?${qs}` : ""}`
    );
  },

  getPlaybook: (team: string, filename: string) =>
    fetchApi<import("@/types").Playbook>(`/playbooks/${team}/${filename}`),

  getPlaybookRaw: (team: string, filename: string) =>
    fetchApi<{ content: string }>(`/playbooks/${team}/${filename}/raw`),

  // Blueprints
  getArchetypes: () =>
    fetchApi<Record<string, unknown>>("/blueprints/archetypes"),

  getEngagementTracks: () =>
    fetchApi<Record<string, unknown>>("/blueprints/tracks"),

  getChecklistDefinitions: () =>
    fetchApi<Record<string, Record<string, unknown>>>("/blueprints/checklists"),

  listReferenceBlueprints: (archetype?: string) => {
    const qs = archetype ? `?archetype=${encodeURIComponent(archetype)}` : "";
    return fetchApi<Record<string, unknown>[]>(`/blueprints/reference${qs}`);
  },

  getReferenceBlueprint: (archetype: string, id: string) =>
    fetchApi<Record<string, unknown>>(`/blueprints/reference/${archetype}/${id}`),

  getReferenceBlueprintRaw: (archetype: string, id: string) =>
    fetchApi<{ content: string }>(`/blueprints/reference/${archetype}/${id}/raw`),
};
