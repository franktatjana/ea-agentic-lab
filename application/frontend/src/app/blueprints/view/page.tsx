"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  FileCode2,
  Layers,
  Clock,
  Zap,
  CheckCircle2,
  Target,
  Ban,
  Shield,
  LayoutGrid,
  AlertTriangle,
  Info,
  Wrench,
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { yaml as yamlLang } from "@codemirror/lang-yaml";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const TRACK_BADGE_COLORS: Record<string, string> = {
  poc: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  economy: "bg-green-600/20 text-green-400 border-green-600/30",
  premium: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  fast_track: "bg-orange-600/20 text-orange-400 border-orange-600/30",
};

const TRACK_BORDER: Record<string, string> = {
  poc: "border-l-blue-500",
  economy: "border-l-green-500",
  premium: "border-l-purple-500",
  fast_track: "border-l-orange-500",
};

const SEVERITY_STYLES: Record<string, { color: string; icon: typeof AlertTriangle }> = {
  error: { color: "text-red-400", icon: AlertTriangle },
  warning: { color: "text-yellow-400", icon: AlertTriangle },
};

interface CheckDefEntry {
  rule_id: string;
  name: string;
  assertion: string;
  severity: string;
  auto_fix_playbook?: string | null;
}

function ChecklistItemRow({ ruleId, checkDefs }: { ruleId: string; checkDefs?: Record<string, CheckDefEntry> }) {
  const def = checkDefs?.[ruleId];
  if (!def) {
    return (
      <li className="flex items-start gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span className="font-mono text-xs">{ruleId}</span>
      </li>
    );
  }

  const severity = SEVERITY_STYLES[def.severity];
  const SevIcon = severity?.icon || Info;
  const sevColor = severity?.color || "text-muted-foreground";

  return (
    <li className="flex items-start gap-2 text-sm">
      <SevIcon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${sevColor}`} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>{def.name}</span>
          <Badge variant="outline" className={`text-[10px] ${sevColor}`}>
            {def.severity}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">{def.assertion}</p>
        {def.auto_fix_playbook && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 flex items-center gap-1">
            <Wrench className="h-3 w-3" />
            Auto-fix: {def.auto_fix_playbook}
          </p>
        )}
      </div>
    </li>
  );
}

interface PlaybookEntry {
  playbook_id: string;
  name: string;
  phase?: string;
  sequence?: number;
  trigger?: string;
  notes?: string;
  config?: Record<string, unknown>;
}

interface MergedTrack {
  key: string;
  base: PlaybookEntry[];
  required: PlaybookEntry[];
  optional: PlaybookEntry[];
  blocked: string[];
  canvases: string[];
  canvasCustomAllowed: boolean;
  canvasTemplateOnly: boolean;
}

function mergeTracksData(
  playbooks: Record<string, Record<string, unknown>> | undefined,
  canvases: Record<string, Record<string, unknown>> | undefined,
): MergedTrack[] {
  if (!playbooks) return [];
  const allTracksData = playbooks.all_tracks as Record<string, unknown> | undefined;
  const base = (allTracksData?.required || []) as PlaybookEntry[];

  const trackKeys = Object.keys(playbooks).filter((k) => k !== "all_tracks");
  if (trackKeys.length === 0) return [];

  return trackKeys.map((key) => {
    const trackData = playbooks[key] as Record<string, unknown>;
    const canvasData = canvases?.[key] as Record<string, unknown> | undefined;
    return {
      key,
      base,
      required: (trackData?.required || []) as PlaybookEntry[],
      optional: (trackData?.optional || []) as PlaybookEntry[],
      blocked: (trackData?.blocked || []) as string[],
      canvases: Array.isArray(canvasData?.required) ? (canvasData.required as string[]) : [],
      canvasCustomAllowed: canvasData?.custom_allowed === true,
      canvasTemplateOnly: canvasData?.template_only === true,
    };
  });
}

function MergedTrackCard({ track }: { track: MergedTrack }) {
  const totalRequired = track.base.length + track.required.length;

  return (
    <Card className={`border-l-4 ${TRACK_BORDER[track.key] || "border-l-muted"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge className={`text-xs border ${TRACK_BADGE_COLORS[track.key] || "bg-muted text-muted-foreground"}`}>
            {formatLabel(track.key)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {totalRequired} required{track.optional.length > 0 ? `, ${track.optional.length} optional` : ""}
            {track.blocked.length > 0 ? `, ${track.blocked.length} blocked` : ""}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {track.base.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Base playbooks
              <span className="font-normal">(all tracks inherit these)</span>
            </p>
            <ul className="space-y-1">
              {track.base.map((pb, i) => (
                <li key={`base-${pb.playbook_id}-${i}`} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{pb.playbook_id}</span>
                    <span>{pb.name}</span>
                    {pb.phase && <Badge variant="outline" className="text-[10px]">{pb.phase}</Badge>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {track.required.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-400" />
              Track-specific required
            </p>
            <ul className="space-y-1">
              {track.required.map((pb, i) => (
                <li key={`req-${pb.playbook_id}-${i}`} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{pb.playbook_id}</span>
                      <span>{pb.name}</span>
                      {pb.phase && <Badge variant="outline" className="text-[10px]">{pb.phase}</Badge>}
                    </div>
                    {pb.notes && <p className="text-xs text-muted-foreground mt-0.5">{pb.notes}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {track.optional.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <Target className="h-3 w-3 text-blue-400" />
              Optional (trigger-based)
            </p>
            <ul className="space-y-1">
              {track.optional.map((pb, i) => (
                <li key={`opt-${pb.playbook_id}-${i}`} className="flex items-start gap-2 text-sm">
                  <Target className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{pb.playbook_id}</span>
                      <span>{pb.name}</span>
                    </div>
                    {pb.trigger && (
                      <p className="text-xs text-muted-foreground mt-0.5">Activates when: {pb.trigger}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {track.blocked.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <Ban className="h-3 w-3 text-red-400" />
              Blocked at this tier
            </p>
            <div className="flex flex-wrap gap-1">
              {track.blocked.map((id) => (
                <Badge key={String(id)} variant="outline" className="text-xs text-red-400 border-red-600/30">
                  {String(id)}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/70 mt-1">
              These playbooks are restricted to higher tiers due to resource and depth requirements.
            </p>
          </div>
        )}

        {track.canvases.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <LayoutGrid className="h-3 w-3" />
                Canvas requirements
              </p>
              <div className="flex flex-wrap gap-1">
                {track.canvases.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">{formatLabel(c)}</Badge>
                ))}
              </div>
              {track.canvasTemplateOnly && (
                <p className="text-xs text-muted-foreground/70 mt-1">Template-based only, no custom canvases at this tier.</p>
              )}
              {track.canvasCustomAllowed && (
                <p className="text-xs text-green-400/70 mt-1">Custom canvases allowed for deeper analysis.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BlueprintViewContent() {
  const searchParams = useSearchParams();
  const archetype = searchParams.get("archetype") || "";
  const id = searchParams.get("id") || "";

  const { data: blueprint, isLoading: bpLoading } = useQuery({
    queryKey: ["referenceBlueprint", archetype, id],
    queryFn: () => api.getReferenceBlueprint(archetype, id),
    enabled: !!archetype && !!id,
  });

  const { data: rawData, isLoading: rawLoading } = useQuery({
    queryKey: ["referenceBlueprintRaw", archetype, id],
    queryFn: () => api.getReferenceBlueprintRaw(archetype, id),
    enabled: !!archetype && !!id,
  });

  const { data: checkDefs } = useQuery({
    queryKey: ["checklistDefinitions"],
    queryFn: () => api.getChecklistDefinitions(),
  });

  const { data: archetypesData } = useQuery({
    queryKey: ["archetypes"],
    queryFn: () => api.getArchetypes(),
  });

  const { data: tracksData } = useQuery({
    queryKey: ["engagementTracks"],
    queryFn: () => api.getEngagementTracks(),
  });

  const meta = blueprint?.metadata as Record<string, unknown> | undefined;
  const playbooks = blueprint?.playbooks as Record<string, Record<string, unknown>> | undefined;
  const canvases = blueprint?.canvases as Record<string, Record<string, unknown>> | undefined;
  const checklists = blueprint?.checklists as Record<string, string[]> | undefined;
  const signals = blueprint?.expected_signals as Record<string, unknown>[] | undefined;
  const successCriteria = blueprint?.success_criteria as Record<string, string[]> | undefined;
  const timeline = blueprint?.timeline as Record<string, unknown> | undefined;

  const mergedTracks = useMemo(() => mergeTracksData(playbooks, canvases), [playbooks, canvases]);

  const summary = useMemo(() => {
    if (!blueprint) return null;
    const allPlaybookIds = new Set<string>();
    if (playbooks) {
      for (const trackData of Object.values(playbooks)) {
        const req = (trackData as Record<string, unknown>).required as PlaybookEntry[] | undefined;
        const opt = (trackData as Record<string, unknown>).optional as PlaybookEntry[] | undefined;
        if (Array.isArray(req)) req.forEach((p) => allPlaybookIds.add(p.playbook_id));
        if (Array.isArray(opt)) opt.forEach((p) => allPlaybookIds.add(p.playbook_id));
      }
    }
    const canvasIds = new Set<string>();
    if (canvases) {
      for (const trackData of Object.values(canvases)) {
        const req = (trackData as Record<string, unknown>).required;
        if (Array.isArray(req)) (req as string[]).forEach((c) => canvasIds.add(c));
      }
    }
    const phases: string[] = [];
    if (timeline) {
      for (const [key, val] of Object.entries(timeline)) {
        if (key.endsWith("_weeks") && typeof val === "number") {
          phases.push(`${formatLabel(key.replace("_weeks", ""))}: ${val}w`);
        }
      }
    }
    const totalWeeks = timeline
      ? Object.entries(timeline)
          .filter(([k, v]) => k.endsWith("_weeks") && typeof v === "number")
          .reduce((sum, [, v]) => sum + (v as number), 0)
      : 0;

    return {
      playbookCount: allPlaybookIds.size,
      canvasCount: canvasIds.size,
      signalCount: signals?.length || 0,
      checklistCount: checklists ? Object.values(checklists).flat().length : 0,
      trackCount: mergedTracks.length,
      phases,
      totalWeeks,
    };
  }, [blueprint, playbooks, canvases, signals, checklists, timeline, mergedTracks]);

  if (!archetype || !id) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <p className="text-muted-foreground">
          Missing archetype or id parameter. Please select a blueprint from the catalog.
        </p>
        <Link href="/blueprints">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const isLoading = bpLoading || rawLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading blueprint...</p>
      </div>
    );
  }

  const displayName = String(meta?.name || blueprint?.blueprint_id || id);
  const description = String(meta?.description || "");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/blueprints">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold truncate">{displayName}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge className={`text-xs border ${ARCHETYPE_COLORS[archetype] || "bg-muted text-muted-foreground"}`}>
              {formatLabel(archetype)}
            </Badge>
            <span className="text-sm font-mono text-muted-foreground">{id}</span>
          </div>
        </div>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      )}

      {/* Blueprint overview: why and how */}
      {(() => {
        const archetypeInfo = (archetypesData as Record<string, unknown>)?.archetypes as Record<string, Record<string, unknown>> | undefined;
        const thisArchetype = archetypeInfo?.[archetype];
        const archetypeSignals = thisArchetype?.signals as string[] | undefined;
        const archetypeComplexity = thisArchetype?.complexity as string | undefined;
        const archetypeDuration = thisArchetype?.typical_duration_weeks;
        const tracks = (tracksData as Record<string, unknown>)?.tracks as Record<string, Record<string, unknown>> | undefined;

        if (!thisArchetype && !tracks) return null;

        return (
          <Card className="border-blue-600/20 bg-blue-950/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-400" />
                Why this Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {thisArchetype && (
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    This blueprint governs <strong className="text-foreground">{formatLabel(archetype)}</strong> engagements,
                    where the goal is to {String(thisArchetype.description).toLowerCase()}.
                    {archetypeComplexity && (
                      <> Complexity is rated <strong className="text-foreground">{formatLabel(archetypeComplexity)}</strong></>
                    )}
                    {!!archetypeDuration && (
                      <>, with a typical timeline of <strong className="text-foreground">{String(archetypeDuration)} weeks</strong></>
                    )}
                    .
                  </p>
                  {archetypeSignals && archetypeSignals.length > 0 && (
                    <p className="text-muted-foreground mt-2">
                      Classification signals: {archetypeSignals.map((s) => formatLabel(String(s))).join(", ")}.
                      When these signals are detected in an engagement profile, the system assigns this archetype.
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="font-medium text-foreground mb-1">How playbooks are selected</p>
                <p className="text-muted-foreground leading-relaxed">
                  Playbook composition follows a layered model. A set of <strong className="text-foreground">base playbooks</strong> is
                  required for every engagement regardless of service tier, covering fundamentals like stakeholder
                  mapping and competitive analysis. On top of this base, each <strong className="text-foreground">engagement track</strong> (service tier)
                  adds track-specific required and optional playbooks that match the depth and SLA of that tier.
                </p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Required</strong>: automatically activated when the blueprint is instantiated for a node</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Optional</strong>: activated by a trigger condition (e.g., a signal or stakeholder event)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Ban className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Blocked</strong>: explicitly excluded at lower tiers due to resource or depth requirements</span>
                  </li>
                </ul>
              </div>

              {tracks && mergedTracks.length > 0 && (
                <div>
                  <p className="font-medium text-foreground mb-1">Tracks in this blueprint</p>
                  <div className="flex flex-wrap gap-2">
                    {mergedTracks.map((t) => {
                      const trackInfo = tracks[t.key] as Record<string, unknown> | undefined;
                      return (
                        <div key={t.key} className="flex items-center gap-1.5">
                          <Badge className={`text-xs border ${TRACK_BADGE_COLORS[t.key] || "bg-muted text-muted-foreground"}`}>
                            {formatLabel(t.key)}
                          </Badge>
                          {trackInfo && (
                            <span className="text-xs text-muted-foreground">
                              {String(trackInfo.description || "")}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Summary strip */}
      {summary && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <strong>{summary.playbookCount}</strong> unique playbooks across
                <strong>{summary.trackCount}</strong> tracks
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                <strong>{summary.canvasCount}</strong> canvas types
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <strong>{summary.signalCount}</strong> expected signals
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <strong>{summary.checklistCount}</strong> validation checks
              </span>
            </div>

            {summary.phases.length > 0 && (
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <div className="flex items-center gap-1 flex-wrap">
                  {summary.phases.map((phase, i) => (
                    <span key={phase} className="inline-flex items-center gap-1">
                      {i > 0 && <ArrowRight className="h-3 w-3" />}
                      <span>{phase}</span>
                    </span>
                  ))}
                  <ArrowRight className="h-3 w-3" />
                  <strong className="text-foreground">{summary.totalWeeks}w total</strong>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Merged track composition */}
      {mergedTracks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Track Composition
            <HelpPopover title="What is track composition?">
              Each track receives a different set of playbooks and canvases.
              Base playbooks are inherited by all tracks. Track-specific
              playbooks add depth at higher tiers. Some playbooks are
              explicitly blocked at lower tiers to match resource constraints.
            </HelpPopover>
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Each card shows the complete picture for a track: base playbooks inherited by all
            tracks, track-specific additions, optional trigger-based playbooks, and which
            playbooks are blocked at that tier.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mergedTracks.map((track) => (
              <MergedTrackCard key={track.key} track={track} />
            ))}
          </div>
        </div>
      )}

      {/* Checklists */}
      {checklists && Object.keys(checklists).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Validation Checklists
              <HelpPopover title="Phase gate validation">
                Each checklist defines mandatory conditions that must be met
                before an engagement can advance to the next phase. Agents
                evaluate these automatically and flag gaps.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(checklists).map(([phase, items]) => (
                <div key={phase}>
                  <p className="text-sm font-medium capitalize mb-1.5">{formatLabel(phase)}</p>
                  <ul className="space-y-2">
                    {Array.isArray(items) && items.map((item, i) => (
                      <ChecklistItemRow
                        key={i}
                        ruleId={String(item)}
                        checkDefs={checkDefs as Record<string, CheckDefEntry> | undefined}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signals & Success Criteria side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals && signals.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Expected Signals
                <HelpPopover title="Progress signals">
                  Time-bound indicators the blueprint expects during the
                  engagement. Agents monitor for these signals and escalate
                  when they are overdue, keeping the engagement on track.
                </HelpPopover>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {signals.map((sig, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{String(sig.name || sig.signal_id)}</p>
                      <p className="text-xs font-mono text-muted-foreground">{String(sig.signal_id || "")}</p>
                    </div>
                    {sig.expected_by_week != null && (
                      <Badge variant="outline" className="text-xs">
                        Week {String(sig.expected_by_week)}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {successCriteria && Object.keys(successCriteria).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Success Criteria
                <HelpPopover title="Phase completion criteria">
                  Measurable conditions that define success for each phase.
                  Agents evaluate these expressions against live data to
                  determine whether a phase is complete.
                </HelpPopover>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(successCriteria).map(([phase, items]) => (
                  <div key={phase}>
                    <p className="text-sm font-medium capitalize mb-1">{formatLabel(phase)}</p>
                    <ul className="space-y-1">
                      {Array.isArray(items) && items.map((item, i) => (
                        <li key={i} className="text-xs text-muted-foreground font-mono">{String(item)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Raw YAML */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCode2 className="h-4 w-4" />
            Blueprint Definition
            <HelpPopover title="Blueprint YAML">
              The raw YAML source that defines this reference blueprint. It
              contains the playbook composition rules per track, canvas
              requirements, validation checklists, expected signals, and
              success criteria.
            </HelpPopover>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <CodeMirror
              value={rawData?.content || ""}
              extensions={[yamlLang()]}
              theme="dark"
              height="auto"
              maxHeight="80vh"
              editable={false}
              readOnly={true}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLineGutter: false,
                highlightActiveLine: false,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BlueprintViewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading blueprint...</p>
        </div>
      }
    >
      <BlueprintViewContent />
    </Suspense>
  );
}
