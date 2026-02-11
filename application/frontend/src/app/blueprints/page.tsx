"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Layers,
  Grid3X3,
  BookOpen,
  ArrowRight,
  Shield,
  Users2,
  Gauge,
  ArrowRightLeft,
  Ban,
  CheckCircle2,
  Timer,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HelpPopover } from "@/components/help-popover";

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const TRACK_COLORS: Record<string, string> = {
  poc: "border-blue-600/40",
  economy: "border-green-600/40",
  premium: "border-purple-600/40",
  fast_track: "border-orange-600/40",
};

const TRACK_BADGE_COLORS: Record<string, string> = {
  poc: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  economy: "bg-green-600/20 text-green-400 border-green-600/30",
  premium: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  fast_track: "bg-orange-600/20 text-orange-400 border-orange-600/30",
};

function TrackCard({ trackKey, track }: { trackKey: string; track: Record<string, unknown> }) {
  const sla = track.sla as Record<string, unknown> | undefined;
  const resources = track.resources as Record<string, unknown> | undefined;
  const playbookPolicy = track.playbook_policy as Record<string, unknown> | undefined;
  const canvasPolicy = track.canvas_policy as Record<string, unknown> | undefined;
  const governance = track.governance as Record<string, unknown> | undefined;

  return (
    <Card className={`${TRACK_COLORS[trackKey] || ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge className={`text-xs border ${TRACK_BADGE_COLORS[trackKey] || "bg-muted text-muted-foreground"}`}>
            {String(track.name || formatLabel(trackKey))}
          </Badge>
          {!!track.duration_limit_weeks && (
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {String(track.duration_limit_weeks)}w limit
            </span>
          )}
        </div>
        <CardDescription className="text-xs mt-1">{String(track.description || "")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {sla && (
          <div>
            <p className="font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <Shield className="h-3 w-3" />SLA
            </p>
            <dl className="space-y-0.5">
              {sla.response_time_hours != null && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Response time</dt>
                  <dd>{String(sla.response_time_hours)}h</dd>
                </div>
              )}
              {sla.escalation_threshold_days != null && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Escalation after</dt>
                  <dd>{String(sla.escalation_threshold_days)} days</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {resources && (
          <div>
            <p className="font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <Users2 className="h-3 w-3" />Resources
            </p>
            <dl className="space-y-0.5">
              {!!resources.sa_allocation && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">SA allocation</dt>
                  <dd className="capitalize">{String(resources.sa_allocation)}</dd>
                </div>
              )}
              {resources.max_concurrent_pocs != null && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Max concurrent</dt>
                  <dd>{String(resources.max_concurrent_pocs)} POCs</dd>
                </div>
              )}
              {resources.max_concurrent_nodes != null && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Max concurrent</dt>
                  <dd>{String(resources.max_concurrent_nodes)} nodes</dd>
                </div>
              )}
              {!!resources.priority && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Priority</dt>
                  <dd className="capitalize">{String(resources.priority)}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {playbookPolicy && (
          <div>
            <p className="font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />Playbook Policy
            </p>
            <dl className="space-y-0.5">
              {!!playbookPolicy.max_playbooks && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Max playbooks</dt>
                  <dd>{String(playbookPolicy.max_playbooks)}</dd>
                </div>
              )}
              {!!playbookPolicy.parallel_execution && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Parallel exec</dt>
                  <dd className="text-orange-400">Enabled</dd>
                </div>
              )}
            </dl>
            {Array.isArray(playbookPolicy.required) && (playbookPolicy.required as string[]).length > 0 && (
              <div className="mt-1">
                <p className="text-muted-foreground/70 mb-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />Required
                </p>
                <div className="flex flex-wrap gap-1">
                  {(playbookPolicy.required as string[]).map((id) => (
                    <Badge key={id} variant="outline" className="text-[10px]">{id}</Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(playbookPolicy.blocked) && (playbookPolicy.blocked as string[]).length > 0 && (
              <div className="mt-1">
                <p className="text-muted-foreground/70 mb-0.5 flex items-center gap-1">
                  <Ban className="h-3 w-3 text-red-400" />Blocked
                </p>
                <div className="flex flex-wrap gap-1">
                  {(playbookPolicy.blocked as string[]).map((id) => (
                    <Badge key={id} variant="outline" className="text-[10px] text-red-400 border-red-600/30">{id}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {canvasPolicy && (
          <div>
            <p className="font-medium text-muted-foreground uppercase tracking-wide mb-1">Canvas depth</p>
            <span className="capitalize">{String(canvasPolicy.depth || "")}</span>
            {canvasPolicy.template_only === true && (
              <span className="text-muted-foreground ml-1">(template only)</span>
            )}
            {canvasPolicy.custom_allowed === true && (
              <span className="text-green-400 ml-1">(custom allowed)</span>
            )}
          </div>
        )}

        {governance && (
          <div>
            <p className="font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <Gauge className="h-3 w-3" />Governance
            </p>
            <dl className="space-y-0.5">
              {!!governance.gap_scan_frequency && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Gap scan</dt>
                  <dd className="capitalize">{String(governance.gap_scan_frequency)}</dd>
                </div>
              )}
              {!!governance.health_check_frequency && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Health check</dt>
                  <dd className="capitalize">{String(governance.health_check_frequency)}</dd>
                </div>
              )}
              {!!governance.executive_review && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Exec review</dt>
                  <dd className="capitalize">{String(governance.executive_review)}</dd>
                </div>
              )}
              {governance.daily_standup === "required" && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Daily standup</dt>
                  <dd className="text-orange-400">Required</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SelectionRulesSection({ rules }: { rules: Record<string, unknown>[] }) {
  return (
    <div className="space-y-1.5">
      {rules.map((rule, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="font-mono text-muted-foreground flex-1">{String(rule.condition || "")}</span>
          <Zap className="h-3 w-3 text-muted-foreground shrink-0" />
          <Badge variant="outline" className="text-[10px]">
            {formatLabel(String(rule.default_track || rule.override_track || ""))}
          </Badge>
          {Array.isArray(rule.flags) && (rule.flags as string[]).map((f) => (
            <Badge key={f} variant="outline" className="text-[10px] text-yellow-400 border-yellow-600/30">
              {formatLabel(f)}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
}

function TransitionsSection({ transitions }: { transitions: Record<string, Record<string, unknown>> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(transitions).map(([key, trans]) => (
        <div key={key} className="text-xs p-3 rounded-lg bg-muted/30">
          <p className="font-medium mb-1 flex items-center gap-1">
            <ArrowRightLeft className="h-3 w-3" />
            {formatLabel(key)}
          </p>
          {Array.isArray(trans.triggers) && (
            <ul className="space-y-0.5 text-muted-foreground">
              {(trans.triggers as string[]).map((t, i) => (
                <li key={i} className="font-mono">{t}</li>
              ))}
            </ul>
          )}
          <p className="mt-1 text-muted-foreground">
            Approval: {trans.approval_required ? (
              <span className="text-yellow-400">required ({String(trans.approver || "manager")})</span>
            ) : (
              <span className="text-green-400">automatic</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function BlueprintHubPage() {
  const { data: blueprints } = useQuery({
    queryKey: ["referenceBlueprints"],
    queryFn: () => api.listReferenceBlueprints(),
  });

  const { data: archetypesData } = useQuery({
    queryKey: ["archetypes"],
    queryFn: () => api.getArchetypes(),
  });

  const { data: tracksData } = useQuery({
    queryKey: ["engagementTracks"],
    queryFn: () => api.getEngagementTracks(),
  });

  const { data: playbooks } = useQuery({
    queryKey: ["playbooks"],
    queryFn: () => api.listPlaybooks(),
  });

  const archetypeCount = useMemo(() => {
    const archetypes = archetypesData?.archetypes as Record<string, unknown> | undefined;
    return archetypes ? Object.keys(archetypes).length : 0;
  }, [archetypesData]);

  const NAV_CARDS = [
    {
      href: "/blueprints/reference",
      icon: Layers,
      title: "Blueprints",
      count: blueprints?.length ?? 0,
      description: "Composable templates that define playbook composition, canvases, checklists, and governance per engagement archetype and track.",
      color: "text-purple-400",
      bg: "bg-purple-600/10",
      border: "border-purple-600/20 hover:border-purple-500/40",
    },
    {
      href: "/blueprints/archetypes",
      icon: Grid3X3,
      title: "Archetypes",
      count: archetypeCount,
      description: "Engagement classification patterns. Each archetype defines why a customer is engaging, which signals identify it, and which blueprints govern it.",
      color: "text-blue-400",
      bg: "bg-blue-600/10",
      border: "border-blue-600/20 hover:border-blue-500/40",
    },
    {
      href: "/playbooks",
      icon: BookOpen,
      title: "Playbooks",
      count: playbooks?.length ?? 0,
      description: "Reusable execution units that encode best practices, frameworks, and specialist knowledge. Playbooks are the building blocks of every blueprint.",
      color: "text-green-400",
      bg: "bg-green-600/10",
      border: "border-green-600/20 hover:border-green-500/40",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Blueprints &amp; Composition</h1>
          <HelpPopover title="What are Blueprints?">
            Reference blueprints are composable templates that define which
            playbooks, canvases, checklists, and governance rules apply to a
            given engagement archetype. Each blueprint varies by track (POC,
            Economy, Premium, Fast Track) to match the engagement&apos;s service
            tier.
          </HelpPopover>
        </div>
        <p className="text-muted-foreground mt-1">
          Engagement composition starts here: archetypes classify the pattern, blueprints assemble the playbooks, and tracks control depth and governance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {NAV_CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="block">
            <Card className={`${card.border} ${card.bg} transition-colors h-full`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                    <span className="font-semibold">{card.title}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mb-2">{card.count}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!!tracksData?.tracks && (
        <>
          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold">Engagement Tracks</h2>
              <HelpPopover title="What are Tracks?">
                Tracks are service tiers that control the depth, SLA, and
                resource allocation of every engagement. Each blueprint
                composes different playbooks per track, so an Economy
                engagement gets templated outputs while Premium gets full
                custom analysis. Track selection is driven by deal size,
                urgency, and engagement type.
              </HelpPopover>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tracks determine why certain playbooks are required, blocked, or optional for a given
              engagement. They control SLA commitments, resource allocation, governance cadence,
              and canvas depth.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(tracksData.tracks as Record<string, Record<string, unknown>>).map(([key, track]) => (
                <TrackCard key={key} trackKey={key} track={track} />
              ))}
            </div>

            {Array.isArray(tracksData.selection_rules) && (tracksData.selection_rules as Record<string, unknown>[]).length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  Track Selection Rules
                  <HelpPopover title="Selection rules">
                    When a new engagement is created, these rules determine
                    which track is assigned based on deal size, timeline, and
                    engagement type. Override rules take precedence over
                    defaults.
                  </HelpPopover>
                </h3>
                <Card>
                  <CardContent className="p-4">
                    <SelectionRulesSection rules={tracksData.selection_rules as Record<string, unknown>[]} />
                  </CardContent>
                </Card>
              </div>
            )}

            {!!tracksData.transitions && typeof tracksData.transitions === "object" && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  Track Transitions
                  <HelpPopover title="Upgrade/downgrade policies">
                    Tracks can change during an engagement. Economy-to-Premium
                    upgrades happen automatically when triggers fire. Downgrades
                    require approval to prevent accidental de-scoping.
                  </HelpPopover>
                </h3>
                <TransitionsSection transitions={tracksData.transitions as Record<string, Record<string, unknown>>} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
