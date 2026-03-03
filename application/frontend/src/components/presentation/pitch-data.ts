export interface PitchPresentationData {
  title: string;
  subtitle: string;
  tagline: string;
  author: string;
  linkedin_url: string;
  concept_framing: string;

  problems: Array<{
    title: string;
    description: string;
  }>;

  pillars: Array<{
    title: string;
    description: string;
    color: string;
  }>;

  lifecycle: Array<{
    step: number;
    title: string;
    description: string;
  }>;

  personas: Array<{
    role: string;
    value: string;
  }>;

  differentiators: Array<{
    title: string;
    description: string;
  }>;

  stats: Array<{
    label: string;
    value: number;
    detail: string;
    color: string;
  }>;

  about_me: {
    name: string;
    role: string;
    description: string;
    github_url: string;
    linkedin_url: string;
  };

  what_next: Array<{
    title: string;
    description: string;
  }>;
}

export const PITCH_SAMPLE_DATA: PitchPresentationData = {
  title: "EA Agentic Lab",
  subtitle: "Multi-Agent Governance Platform",
  tagline:
    "Structure where there was chaos. Enterprise engagements powered by AI agents that enforce discipline without replacing human judgment.",
  author: "Tatjana Frank",
  linkedin_url: "https://www.linkedin.com/in/tatjana-frank/",
  concept_framing:
    "A concept showcase building a foundation for future AI, vendor, and framework independent implementation. All data is fictional.",

  problems: [
    {
      title: "Governance Entropy",
      description:
        "Critical information scattered across emails, meetings, and memories. No single source of truth.",
    },
    {
      title: "Inconsistent Execution",
      description:
        "Best practices exist but aren't systematically applied. Every deal starts from scratch.",
    },
    {
      title: "Reactive Risk Management",
      description:
        "Risks surface too late in the lifecycle. By the time you see them, damage is done.",
    },
    {
      title: "Knowledge Loss",
      description:
        "Expertise leaves with people, not documented in systems. Tribal knowledge evaporates on every departure.",
    },
  ],

  pillars: [
    {
      title: "People + Agents",
      description:
        "Specialists paired with AI agents, each with role-specific playbooks configured for their accounts and domains.",
      color: "amber",
    },
    {
      title: "Customers + Blueprints",
      description:
        "Customers classified into archetypes. Classification drives the right blueprint, playbooks, and evaluation criteria.",
      color: "purple",
    },
    {
      title: "Knowledge + Artifacts",
      description:
        "Tribal knowledge digitized and compounding. Canvases, assessments, and deliverables with full provenance.",
      color: "teal",
    },
  ],

  lifecycle: [
    {
      step: 1,
      title: "Classify",
      description:
        "Engagement type, domain, and tier recognized automatically",
    },
    {
      step: 2,
      title: "Compose Blueprint",
      description:
        "Reference blueprint selected and composed with track-specific playbooks and success criteria",
    },
    {
      step: 3,
      title: "Execute Playbooks",
      description:
        "Strategic, specialist, and operational playbooks applied in parallel",
    },
    {
      step: 4,
      title: "Render Canvases",
      description:
        "Structured data turned into visual one-page artifacts for stakeholders",
    },
    {
      step: 5,
      title: "Store in Vault",
      description:
        "Validated best practices and engagement artifacts preserved as institutional memory",
    },
    {
      step: 6,
      title: "Learn from Outcomes",
      description:
        "Deal results feed back into evaluation criteria. Every future engagement benefits from the ones before it",
    },
  ],

  personas: [
    {
      role: "Account Executives",
      value:
        "Never walk into a meeting unprepared. Deal state, stakeholder map, and competitive position always current.",
    },
    {
      role: "Solutions Architects",
      value:
        "Every discovery follows a proven structure. POC results documented permanently, not lost in handoffs.",
    },
    {
      role: "Customer Success",
      value:
        "Portfolio health visible at a glance. Risks flagged before they become escalations.",
    },
    {
      role: "Sales Leadership",
      value:
        "See across all engagements. Spot winning patterns and risk indicators early.",
    },
    {
      role: "Product Managers",
      value:
        "Field feedback aggregated automatically. Feature requests and competitive gaps surfaced from real engagements.",
    },
    {
      role: "Competitive Intelligence",
      value:
        "Win/loss data structured and searchable. Displacement playbook effectiveness measured, not guessed.",
    },
  ],

  differentiators: [
    {
      title: "Machine-readable first, human-readable on demand",
      description:
        "Agents validate and cross-reference everything. Canvases render visual artifacts for stakeholders when needed.",
    },
    {
      title: "Personalizable agent teams",
      description:
        "Each person gets their own agent team configured for their accounts, domains, and engagement patterns.",
    },
    {
      title: "Proactive governance, not passive dashboards",
      description:
        "Agents continuously scan for gaps, flag overdue actions, and nudge before problems surface.",
    },
    {
      title: "A self-learning system",
      description:
        "Win/loss correlation adjusts checklist weights. The hundredth deal benefits from the ninety-nine before it.",
    },
  ],

  stats: [
    { label: "AI Agents", value: 33, detail: "Role-specific, customizable per person", color: "text-amber-400" },
    { label: "Playbooks", value: 40, detail: "Strategic, specialist, and operational", color: "text-blue-400" },
    { label: "Canvas Types", value: 11, detail: "Visual one-page decision artifacts", color: "text-teal-400" },
    { label: "Reference Blueprints", value: 8, detail: "Engagement-type-specific templates", color: "text-purple-400" },
    { label: "Technology Domains", value: 5, detail: "Security, observability, search, platform, general", color: "text-green-400" },
    { label: "Engagement Archetypes", value: 8, detail: "From POC to enterprise displacement", color: "text-orange-400" },
  ],

  about_me: {
    name: "Tatjana Frank",
    role: "Enterprise Architecture & AI Governance",
    description:
      "This is a working demo of a concept framework for agentic enterprise governance. It combines multi-agent orchestration with structured playbook execution to enforce governance discipline without replacing human judgment. All companies, scenarios, and data are fictional.",
    github_url: "https://github.com/franktatjana",
    linkedin_url: "https://www.linkedin.com/in/tatjana-frank/",
  },

  what_next: [
    {
      title: "Vendor & Framework Independent",
      description:
        "The architecture is designed to work with any AI provider, any CRM, any infrastructure. No lock-in by design.",
    },
    {
      title: "Open Framework Foundation",
      description:
        "Building toward a reusable governance framework that organizations can adapt to their own engagement models.",
    },
    {
      title: "Production Roadmap",
      description:
        "From concept showcase to production-ready platform, integrating real data sources, APIs, and enterprise identity.",
    },
    {
      title: "Feedback & Collaboration",
      description:
        "Looking for feedback from practitioners who live the problems this framework addresses.",
    },
  ],
};
