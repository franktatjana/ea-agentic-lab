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

  composeBlueprint: (params: {
    archetype: string;
    domain: string;
    track: string;
    variant?: string;
  }) =>
    fetchApi<Record<string, unknown>>("/blueprints/compose", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  saveComposedBlueprint: (params: {
    blueprint: Record<string, unknown>;
    archetype: string;
    blueprint_id: string;
  }) =>
    fetchApi<{ status: string; path: string }>("/blueprints/compose/save", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  getPlaybookIndex: () =>
    fetchApi<Record<string, { name: string; team: string; category: string; objective: string }>>(
      "/blueprints/playbook-index",
    ),

  // Blueprint instance mutations
  updatePlaybookStatus: (
    realmId: string, nodeId: string, playbookId: string,
    status: string, notes?: string,
  ) =>
    fetchApi<{ status: string; changelog_entry: Record<string, string> }>(
      `/nodes/${realmId}/${nodeId}/blueprint/playbooks/${playbookId}/status`,
      { method: "PATCH", body: JSON.stringify({ status, notes }) },
    ),

  addBlueprintPlaybook: (
    realmId: string, nodeId: string,
    playbook: { playbook_id: string; name: string; phase: string; reason: string },
  ) =>
    fetchApi<{ status: string; changelog_entry: Record<string, string> }>(
      `/nodes/${realmId}/${nodeId}/blueprint/playbooks`,
      { method: "POST", body: JSON.stringify(playbook) },
    ),

  removeBlueprintPlaybook: (
    realmId: string, nodeId: string, playbookId: string, reason: string,
  ) =>
    fetchApi<{ status: string; changelog_entry: Record<string, string> }>(
      `/nodes/${realmId}/${nodeId}/blueprint/playbooks/${playbookId}`,
      { method: "DELETE", body: JSON.stringify({ reason }) },
    ),

  getBlueprintChangelog: (realmId: string, nodeId: string) =>
    fetchApi<Record<string, string>[]>(
      `/nodes/${realmId}/${nodeId}/blueprint/changelog`,
    ),

  // Knowledge Vault
  listKnowledge: (params?: {
    category?: string;
    domain?: string;
    archetype?: string;
    phase?: string;
    type?: string;
    confidence?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.domain) searchParams.set("domain", params.domain);
    if (params?.archetype) searchParams.set("archetype", params.archetype);
    if (params?.phase) searchParams.set("phase", params.phase);
    if (params?.type) searchParams.set("type", params.type);
    if (params?.confidence) searchParams.set("confidence", params.confidence);
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return fetchApi<import("@/types").KnowledgeItem[]>(
      `/knowledge${qs ? `?${qs}` : ""}`
    );
  },

  getKnowledgeItem: (id: string) =>
    fetchApi<import("@/types").KnowledgeItem>(`/knowledge/${id}`),

  getKnowledgeStats: () =>
    fetchApi<import("@/types").KnowledgeStats>("/knowledge/stats"),

  createKnowledgeItem: (data: Record<string, unknown>) =>
    fetchApi<import("@/types").KnowledgeItem>("/knowledge", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateKnowledgeItem: (id: string, data: Record<string, unknown>) =>
    fetchApi<import("@/types").KnowledgeItem>(`/knowledge/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteKnowledgeItem: (id: string) =>
    fetchApi<{ status: string }>(`/knowledge/${id}`, { method: "DELETE" }),

  listProposals: () =>
    fetchApi<import("@/types").KnowledgeProposal[]>("/knowledge/proposals"),

  approveProposal: (id: string, reviewerNotes: string = "") =>
    fetchApi<import("@/types").KnowledgeItem>(
      `/knowledge/proposals/${id}/approve`,
      { method: "POST", body: JSON.stringify({ reviewer_notes: reviewerNotes }) },
    ),

  rejectProposal: (id: string, reviewerNotes: string = "") =>
    fetchApi<{ status: string }>(
      `/knowledge/proposals/${id}/reject`,
      { method: "POST", body: JSON.stringify({ reviewer_notes: reviewerNotes }) },
    ),

  // Stance proposals
  getStanceProposals: (realmId: string, nodeId: string) =>
    fetchApi<Record<string, unknown>[]>(`/nodes/${realmId}/${nodeId}/stakeholders/proposals`),

  createStanceProposal: (realmId: string, nodeId: string, data: {
    stakeholder_id: string;
    proposed_stance: string;
    reason: string;
    proposed_by: string;
    source?: string;
  }) =>
    fetchApi<Record<string, unknown>>(`/nodes/${realmId}/${nodeId}/stakeholders/proposals`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approveStanceProposal: (realmId: string, nodeId: string, proposalId: string, notes: string = "") =>
    fetchApi<{ status: string }>(`/nodes/${realmId}/${nodeId}/stakeholders/proposals/${proposalId}/approve`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    }),

  rejectStanceProposal: (realmId: string, nodeId: string, proposalId: string, reason: string = "") =>
    fetchApi<{ status: string }>(`/nodes/${realmId}/${nodeId}/stakeholders/proposals/${proposalId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  // Vault signals (meetings, frameworks, journey, opportunities, agent work)
  getVault: (realmId: string, nodeId: string) =>
    fetchApi<Record<string, unknown>>(`/nodes/${realmId}/${nodeId}/vault`),

  // InfoHub endpoints
  getExternalInfoHub: (realmId: string, nodeId: string) =>
    fetchApi<Record<string, unknown>>(`/nodes/${realmId}/${nodeId}/external-infohub`),

  getInternalInfoHub: (realmId: string, nodeId: string) =>
    fetchApi<Record<string, unknown>>(`/nodes/${realmId}/${nodeId}/internal-infohub`),
};
