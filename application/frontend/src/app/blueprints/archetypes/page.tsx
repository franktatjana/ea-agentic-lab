"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Zap,
  Layers,
  Shield,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HelpPopover } from "@/components/help-popover";

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const ARCHETYPE_COLORS: Record<string, string> = {
  competitive_displacement: "bg-red-600/20 text-red-400 border-red-600/30",
  greenfield_adoption: "bg-green-600/20 text-green-400 border-green-600/30",
  platform_consolidation: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  compliance_driven: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  technical_evaluation: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  retention_renewal: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  expansion: "bg-teal-600/20 text-teal-400 border-teal-600/30",
  strategic_account: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
};

const ARCHETYPE_BORDER: Record<string, string> = {
  competitive_displacement: "border-l-red-500",
  greenfield_adoption: "border-l-green-500",
  platform_consolidation: "border-l-purple-500",
  compliance_driven: "border-l-yellow-500",
  technical_evaluation: "border-l-blue-500",
  retention_renewal: "border-l-orange-500",
  expansion: "border-l-teal-500",
  strategic_account: "border-l-indigo-500",
};

const COMPLEXITY_COLORS: Record<string, string> = {
  low: "bg-green-600/20 text-green-400 border-green-600/30",
  medium: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  high: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  very_high: "bg-red-600/20 text-red-400 border-red-600/30",
};

interface ArchetypeData {
  name: string;
  description: string;
  signals: string[];
  reference_blueprints: { id: string; name: string; description: string; playbooks: string[] }[];
  typical_duration_weeks: number | string;
  complexity: string;
  minimum_track?: string;
  track_override?: string;
}

function ArchetypeCard({ archetypeKey, data }: { archetypeKey: string; data: ArchetypeData }) {
  return (
    <Card className={`border-l-4 ${ARCHETYPE_BORDER[archetypeKey] || "border-l-muted"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-xs border ${ARCHETYPE_COLORS[archetypeKey] || "bg-muted text-muted-foreground"}`}>
            {data.name}
          </Badge>
          <Badge variant="outline" className={`text-[10px] ${COMPLEXITY_COLORS[data.complexity] || ""}`}>
            {formatLabel(data.complexity)}
          </Badge>
          {data.typical_duration_weeks && (
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {String(data.typical_duration_weeks)} weeks
            </span>
          )}
        </div>
        <CardDescription className="mt-2 text-sm">
          {data.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Classification signals */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Classification Signals
          </p>
          <p className="text-xs text-muted-foreground mb-1.5">
            When these signals are detected in an engagement profile, the system assigns this archetype.
          </p>
          <div className="flex flex-wrap gap-1">
            {data.signals.map((s) => (
              <Badge key={s} variant="outline" className="text-[10px]">
                {formatLabel(s)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Constraints */}
        {(data.minimum_track || data.track_override) && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Constraints
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              {data.minimum_track && (
                <p>
                  Minimum track: <strong className="text-foreground">{formatLabel(data.minimum_track)}</strong>.
                  Lower tiers cannot be used for this archetype.
                </p>
              )}
              {data.track_override && (
                <p>
                  Track override: <strong className="text-foreground">{formatLabel(data.track_override)}</strong>.
                  This archetype always uses this track regardless of deal size.
                </p>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Reference blueprints */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Layers className="h-3 w-3" />
            Reference Blueprints ({data.reference_blueprints.length})
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Pre-built templates available for this archetype. Each defines a different level of depth and playbook composition.
          </p>
          <div className="space-y-2">
            {data.reference_blueprints.map((bp) => (
              <Link
                key={bp.id}
                href={`/blueprints/view?archetype=${encodeURIComponent(archetypeKey)}&id=${encodeURIComponent(bp.id)}`}
                className="block"
              >
                <div className="p-2.5 rounded-md border hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{bp.name}</span>
                      <span className="text-xs font-mono text-muted-foreground">{bp.id}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{bp.description}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {bp.playbooks.join(", ")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ArchetypesCatalogPage() {
  const { data: archetypesData, isLoading } = useQuery({
    queryKey: ["archetypes"],
    queryFn: () => api.getArchetypes(),
  });

  const { data: domainsRaw } = useQuery({
    queryKey: ["archetypes"],
    queryFn: () => api.getArchetypes(),
    select: (d) => (d as Record<string, unknown>)?.domains as Record<string, Record<string, unknown>> | undefined,
  });

  const archetypes = useMemo(() => {
    const raw = (archetypesData as Record<string, unknown>)?.archetypes as Record<string, ArchetypeData> | undefined;
    if (!raw) return [];
    return Object.entries(raw);
  }, [archetypesData]);

  const domains = useMemo(() => {
    if (!domainsRaw) return [];
    return Object.entries(domainsRaw);
  }, [domainsRaw]);

  const signalPatterns = useMemo(() => {
    const raw = (archetypesData as Record<string, unknown>)?.signal_patterns as Record<string, Record<string, unknown>> | undefined;
    return raw || {};
  }, [archetypesData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading archetypes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Archetype Catalog</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Engagement classification patterns. Each archetype defines why a customer is engaging, which signals identify it, and which blueprints govern it.
        </p>
      </div>

      {/* Classification model explanation */}
      <Card className="border-blue-600/20 bg-blue-950/10">
        <CardContent className="p-4 space-y-3 text-sm">
          <p className="font-medium text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-400" />
            Three-Dimensional Classification
            <HelpPopover title="How classification works">
              Every engagement is classified along three independent dimensions.
              The combination determines which blueprint is composed, which
              playbooks are loaded, and which evaluation criteria apply.
            </HelpPopover>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-md bg-muted/30">
              <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Archetype</p>
              <p className="text-xs text-muted-foreground">
                The engagement pattern: why is this customer engaging? Displacement, greenfield, compliance, evaluation, etc.
              </p>
            </div>
            <div className="p-3 rounded-md bg-muted/30">
              <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Domain</p>
              <p className="text-xs text-muted-foreground">
                The specialist area: security, search, observability, or multi-domain. Determines which specialist agent and evaluation criteria apply.
              </p>
            </div>
            <div className="p-3 rounded-md bg-muted/30">
              <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Track</p>
              <p className="text-xs text-muted-foreground">
                The service tier: POC, Economy, Premium, or Fast Track. Controls SLA, resources, playbook depth, and governance cadence.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archetype cards */}
      <div>
        <h2 className="text-lg font-semibold mb-1">
          Archetypes ({archetypes.length})
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Each archetype represents a distinct engagement pattern. The system detects classification signals from the engagement
          profile and assigns the matching archetype, which determines blueprint selection and playbook composition.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archetypes.map(([key, data]) => (
            <ArchetypeCard key={key} archetypeKey={key} data={data} />
          ))}
        </div>
      </div>

      {/* Domains */}
      {domains.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-1">
              Domains ({domains.length})
              <HelpPopover title="What are domains?">
                Domains are the specialist area dimension, orthogonal to archetype
                and track. A competitive displacement engagement in the security
                domain gets security-specific evaluation criteria and a security
                specialist agent, while the same archetype in the search domain
                gets search-specific criteria.
              </HelpPopover>
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Domains define specialist expertise areas. Each domain adds domain-specific playbooks, evaluation checklists,
              and specialist agent involvement on top of the archetype blueprint.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {domains.map(([key, domain]) => (
                <Card key={key}>
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm">{String(domain.name || formatLabel(key))}</p>
                    {!!domain.description && (
                      <p className="text-xs text-muted-foreground mt-1">{String(domain.description)}</p>
                    )}
                    {Array.isArray(domain.focus_areas) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(domain.focus_areas as string[]).map((area) => (
                          <Badge key={area} variant="outline" className="text-[10px]">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {!!domain.specialist_agent && (
                      <p className="text-[10px] text-muted-foreground/70 mt-2 font-mono">
                        Agent: {String(domain.specialist_agent)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Signal patterns */}
      {Object.keys(signalPatterns).length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-1">
              Signal Patterns
              <HelpPopover title="How signals work">
                Signals are conditions detected in an engagement profile. Each
                signal has indicator expressions and a weight. The system
                evaluates all signals and assigns the archetype with the
                strongest match.
              </HelpPopover>
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              The classification engine evaluates these signal patterns against each engagement profile.
              Higher-weight signals have more influence on the archetype assignment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(signalPatterns).map(([key, pattern]) => {
                const indicators = (pattern as Record<string, unknown>).indicators as string[] | undefined;
                const weight = (pattern as Record<string, unknown>).weight as number | undefined;
                return (
                  <div key={key} className="p-3 rounded-md border text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium">{formatLabel(key)}</span>
                      {weight != null && (
                        <Badge variant="outline" className="text-[10px]">
                          Weight: {weight}
                        </Badge>
                      )}
                    </div>
                    {Array.isArray(indicators) && (
                      <ul className="space-y-0.5">
                        {indicators.map((ind, i) => (
                          <li key={i} className="font-mono text-muted-foreground">{ind}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
