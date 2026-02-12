import Link from "next/link";
import {
  ArrowRight,
  Shuffle,
  Target,
  AlertTriangle,
  BrainCog,
  Users,
  LayoutTemplate,
  Database,
  Search,
  Map,
  Play,
  Presentation,
  Archive,
  TrendingUp,
  Crosshair,
  Shield,
  UserCheck,
  BarChart3,
  Package,
  Swords,
  Bot,
  BookOpen,
  Frame,
  Repeat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


const PROBLEMS = [
  {
    icon: Shuffle,
    title: "Governance Entropy",
    description:
      "Critical information scattered across emails, meetings, and memories. No single source of truth.",
  },
  {
    icon: Target,
    title: "Inconsistent Execution",
    description:
      "Best practices exist but aren't systematically applied. Every deal starts from scratch.",
  },
  {
    icon: AlertTriangle,
    title: "Reactive Risk Management",
    description:
      "Risks surface too late in the engagement lifecycle. By the time you see them, damage is done.",
  },
  {
    icon: BrainCog,
    title: "Knowledge Loss",
    description:
      "Expertise leaves with people, not documented in systems. Tribal knowledge evaporates on every departure.",
  },
];

const PILLARS = [
  {
    icon: Users,
    title: "People + Agents",
    description:
      "Specialists, AEs, SAs, and CAs paired with AI agents, each with role-specific, customizable playbooks. Every team member gets an agent team configured for their accounts, domains, and engagement patterns.",
  },
  {
    icon: LayoutTemplate,
    title: "Customers + Blueprints",
    description:
      "Customers classified into archetypes. Each gets a blueprint filled with strategic and operational playbooks. Classification drives automation: the right blueprint, right playbooks, right evaluation criteria.",
  },
  {
    icon: Database,
    title: "Knowledge + Artifacts",
    description:
      "Tribal knowledge digitized and compounding over time: best practices, evaluation criteria, lessons from every engagement. Artifacts are the customer-facing proof: canvases, assessments, and deliverables with full provenance.",
  },
];

const LIFECYCLE = [
  {
    step: 1,
    icon: Search,
    title: "Classify",
    description:
      "Engagement type (displacement, greenfield, consolidation), domain (security, search, observability), and engagement tier (POC, economy, premium)",
  },
  {
    step: 2,
    icon: Map,
    title: "Compose Blueprint",
    description:
      "A reference blueprint is selected and composed for the engagement: track-specific playbooks, canvases, checklists, and success criteria assembled from reusable building blocks",
  },
  {
    step: 3,
    icon: Play,
    title: "Execute Playbooks",
    description:
      "Strategic playbooks apply frameworks, specialist playbooks bring deep evaluation, operational playbooks handle governance",
  },
  {
    step: 4,
    icon: Presentation,
    title: "Render Canvases",
    description:
      "Structured data turned into visual one-page artifacts for stakeholder communication",
  },
  {
    step: 5,
    icon: Archive,
    title: "Store in Vault",
    description:
      "The system's institutional memory: validated best practices and customer engagement artifacts",
  },
  {
    step: 6,
    icon: TrendingUp,
    title: "Learn from Outcomes",
    description:
      "Deal results feed back into evaluation criteria. Every future engagement benefits from the ones before it",
  },
];

const PERSONAS = [
  {
    icon: Crosshair,
    role: "Account Executives",
    value:
      "Deal governance, stakeholder tracking, competitive intelligence, executive-ready canvases",
  },
  {
    icon: Shield,
    role: "Solutions Architects",
    value:
      "Structured discovery playbooks, architecture assessment, POC execution with permanent documentation",
  },
  {
    icon: UserCheck,
    role: "Customer Success",
    value:
      "Health scoring, risk monitoring, renewal tracking with portfolio visibility",
  },
  {
    icon: BarChart3,
    role: "Sales Leadership",
    value:
      "Cross-engagement visibility, risk indicators, winning pattern analysis",
  },
  {
    icon: Package,
    role: "Product Managers",
    value:
      "Field feedback aggregated across engagements, feature requests, competitive gaps",
  },
  {
    icon: Swords,
    role: "Competitive Intelligence",
    value:
      "Structured win/loss data, competitor positioning, displacement playbook effectiveness",
  },
];

const DIFFERENTIATORS = [
  {
    title: "Machine-readable first, human-readable on demand",
    description:
      "Agents validate, gap-scan, and cross-reference everything. Canvases render visual one-page artifacts for stakeholders when needed.",
  },
  {
    title: "Personalizable agent teams",
    description:
      "Each person gets their own agent team configured for their accounts, domains, and engagement patterns. The system adapts to how you work.",
  },
  {
    title: "Customer-facing knowledge as a deliverable",
    description:
      "Every engagement produces a structured InfoHub with full provenance that can be shared with the customer or handed off to new team members.",
  },
  {
    title: "Proactive governance, not passive dashboards",
    description:
      "Agents continuously scan for gaps, flag overdue actions, detect stale artifacts, and nudge before problems surface.",
  },
  {
    title: "Classification-driven automation",
    description:
      "Recognizing the engagement type automatically selects the right blueprint, loads playbooks, assigns evaluation criteria, and defines success.",
  },
  {
    title: "A self-learning system",
    description:
      "Win/loss correlation adjusts checklist weights. Best practices surface automatically. The hundredth deal benefits from the ninety-nine before it.",
  },
];

const STATS = [
  { icon: Bot, value: "31", label: "AI Agents" },
  { icon: BookOpen, value: "72", label: "Playbooks" },
  { icon: Frame, value: "8", label: "Canvas Types" },
  { icon: Repeat, value: "6-Step", label: "Lifecycle" },
];

export default function LandingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-16">
      {/* Hero */}
      <section className="pt-8 space-y-4">
        <Badge variant="secondary" className="text-xs">
          Multi-Agent Governance Platform
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">EA Agentic Lab</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Structure where there was chaos. Enterprise pre-sales and post-sales
          engagements powered by AI agents that enforce discipline without
          replacing human judgment.
        </p>
        <p className="text-muted-foreground max-w-2xl">
          Combines pattern recognition for engagement types, reusable blueprints
          that encode best practices, and AI agents that make governance
          unavoidable. Humans decide. The system enforces discipline.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button size="lg">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg">
              Browse Documentation
            </Button>
          </Link>
        </div>
      </section>

      <Separator />

      {/* The Problem */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">The Problem</h2>
        <p className="text-muted-foreground max-w-2xl">
          Engagements fail not because teams lack talent, but because they lack
          structure. Discovery calls miss critical questions. POC results live in
          someone's head. When an SA leaves, their account knowledge leaves with
          them.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {PROBLEMS.map((p) => (
            <Card key={p.title}>
              <CardContent className="p-4 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <p.icon className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{p.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {p.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Three Pillars */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Three Conceptual Pillars</h2>
        <p className="text-muted-foreground max-w-2xl">
          The framework rests on three foundations that work together: people
          amplified by agents, customers understood through blueprints, and
          knowledge preserved as reusable artifacts.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {PILLARS.map((p) => (
            <Card key={p.title} className="border-primary/20">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{p.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* How It Works */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">How It Works</h2>
        <p className="text-muted-foreground max-w-2xl">
          Every engagement follows a six-step lifecycle from classification
          through learning. Agents operate within human-defined constraints:
          they have agency within their scope, but humans make decisions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {LIFECYCLE.map((s) => (
            <Card key={s.step}>
              <CardContent className="p-4 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {s.step}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold text-sm">{s.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {s.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Key Numbers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">At a Glance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <s.icon className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Who This Is For */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Who This Is For</h2>
        <p className="text-muted-foreground max-w-2xl">
          Every role in the enterprise account lifecycle gets targeted value.
          Agents augment each persona with the right playbooks, frameworks, and
          governance for their specific responsibilities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {PERSONAS.map((p) => (
            <div
              key={p.role}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <p.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{p.role}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Differentiators */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">What Makes This Different</h2>
        <p className="text-muted-foreground max-w-2xl">
          Not another CRM overlay or passive dashboard. EA Agentic Lab is built
          from the ground up as an active governance system where agents
          continuously enforce structure.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {DIFFERENTIATORS.map((d) => (
            <Card key={d.title}>
              <CardContent className="p-4">
                <p className="text-sm font-semibold">{d.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {d.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="text-center space-y-4 py-4">
        <h2 className="text-2xl font-bold">Ready to explore?</h2>
        <p className="text-muted-foreground">
          Jump into the dashboard to see your realms and nodes, or browse the
          documentation to dive deeper into the architecture.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg">
              Browse Documentation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
