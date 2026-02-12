"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Clock,
  Save,
  ChevronRight,
  Search,
  Gauge,
  Shield,
  Sparkles,
  Info,
  Zap,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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

const TRACK_COLORS: Record<string, string> = {
  poc: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  economy: "bg-green-600/20 text-green-400 border-green-600/30",
  premium: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  fast_track: "bg-orange-600/20 text-orange-400 border-orange-600/30",
};

const COMPLEXITY_COLORS: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  very_high: "text-red-400",
};

interface PlaybookInfo {
  name: string;
  team: string;
  category: string;
  objective: string;
}

interface CompositionResult {
  blueprint: Record<string, unknown>;
  warnings: string[];
  summary: {
    required_playbooks: number;
    optional_domain_playbooks: number;
    blocked_playbooks: number;
    canvases: number;
    total_weeks: number;
  };
  playbook_index: Record<string, PlaybookInfo>;
  selected_playbook_ids: string[];
  blocked_playbook_ids: string[];
}

export function BlueprintComposer({ onSaved }: { onSaved?: () => void }) {
  const queryClient = useQueryClient();
  const [archetype, setArchetype] = useState("");
  const [domain, setDomain] = useState("");
  const [track, setTrack] = useState("");
  const [variant, setVariant] = useState("");
  const [result, setResult] = useState<CompositionResult | null>(null);
  const [selectedPbs, setSelectedPbs] = useState<Set<string>>(new Set());
  const [pbSearch, setPbSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: archetypesData } = useQuery({
    queryKey: ["archetypes"],
    queryFn: () => api.getArchetypes(),
  });

  const { data: tracksData } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => api.getEngagementTracks(),
  });

  const archetypes = useMemo(() => {
    return (archetypesData?.archetypes ?? {}) as Record<string, Record<string, unknown>>;
  }, [archetypesData]);

  const domains = useMemo(() => {
    return (archetypesData?.domains ?? {}) as Record<string, Record<string, unknown>>;
  }, [archetypesData]);

  const trackOptions = useMemo(() => {
    return ((tracksData?.tracks ?? {}) as Record<string, Record<string, unknown>>);
  }, [tracksData]);

  const variants = useMemo(() => {
    if (!archetype || !archetypes[archetype]) return [];
    return (archetypes[archetype].reference_blueprints ?? []) as { id: string; name: string; description: string; playbooks: string[] }[];
  }, [archetype, archetypes]);

  const canCompose = archetype && domain && track;
  const selectedArchetype = archetype ? archetypes[archetype] : null;
  const selectedDomain = domain ? domains[domain] : null;
  const selectedTrack = track ? trackOptions[track] : null;

  const groupedPlaybooks = useMemo(() => {
    if (!result?.playbook_index) return {};
    const groups: Record<string, { id: string; info: PlaybookInfo }[]> = {};
    const q = pbSearch.toLowerCase();
    for (const [id, info] of Object.entries(result.playbook_index)) {
      if (teamFilter !== "all" && info.team !== teamFilter) continue;
      if (q && !id.toLowerCase().includes(q) && !info.name.toLowerCase().includes(q) && !info.objective.toLowerCase().includes(q)) continue;
      const team = info.team || "other";
      if (!groups[team]) groups[team] = [];
      groups[team].push({ id, info });
    }
    for (const arr of Object.values(groups)) {
      arr.sort((a, b) => a.id.localeCompare(b.id));
    }
    return groups;
  }, [result?.playbook_index, pbSearch, teamFilter]);

  const teamKeys = useMemo(() => {
    if (!result?.playbook_index) return [];
    const teams = new Set<string>();
    for (const info of Object.values(result.playbook_index)) {
      teams.add(info.team || "other");
    }
    return Array.from(teams).sort();
  }, [result?.playbook_index]);

  const blockedSet = useMemo(() => new Set(result?.blocked_playbook_ids ?? []), [result]);

  const composeMutation = useMutation({
    mutationFn: () =>
      api.composeBlueprint({ archetype, domain, track, variant: variant || undefined }),
    onSuccess: (data) => {
      const res = data as unknown as CompositionResult;
      setResult(res);
      setSelectedPbs(new Set(res.selected_playbook_ids));
      setError("");
      setSaved(false);
    },
    onError: (err: Error) => { setError(err.message); setResult(null); },
  });

  const togglePlaybook = useCallback((pbId: string) => {
    setSelectedPbs((prev) => {
      const next = new Set(prev);
      if (next.has(pbId)) next.delete(pbId);
      else next.add(pbId);
      return next;
    });
    setSaved(false);
  }, []);

  const finalBlueprint = useMemo(() => {
    if (!result) return null;
    const bp = result.blueprint as Record<string, unknown>;
    const pbIndex = result.playbook_index;
    const entries = Array.from(selectedPbs)
      .filter((id) => pbIndex[id])
      .sort()
      .map((id, i) => ({
        playbook_id: id,
        name: pbIndex[id].name,
        phase: "discovery",
        sequence: i + 1,
      }));
    return {
      ...bp,
      playbooks: {
        all_tracks: { required: entries },
        [track]: { required: [], optional: [], blocked: Array.from(blockedSet) },
      },
    };
  }, [result, selectedPbs, track, blockedSet]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!finalBlueprint || !result) throw new Error("No composition to save");
      const classification = (result.blueprint as Record<string, unknown>).classification as Record<string, string>;
      const bpId = (result.blueprint as Record<string, unknown>).blueprint_id as string;
      return api.saveComposedBlueprint({
        blueprint: finalBlueprint,
        archetype: classification.archetype,
        blueprint_id: bpId,
      });
    },
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["referenceBlueprints"] });
      onSaved?.();
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleCompose = useCallback(() => {
    if (canCompose) composeMutation.mutate();
  }, [canCompose, composeMutation]);

  const handleReset = useCallback(() => {
    setArchetype(""); setDomain(""); setTrack(""); setVariant("");
    setResult(null); setSelectedPbs(new Set()); setError(""); setSaved(false);
    setPbSearch(""); setTeamFilter("all");
  }, []);

  const classification = result?.blueprint
    ? (result.blueprint as Record<string, unknown>).classification as Record<string, string>
    : null;
  const timeline = result?.blueprint
    ? (result.blueprint as Record<string, unknown>).timeline as Record<string, number>
    : null;
  const canvases = result?.blueprint
    ? (result.blueprint as Record<string, unknown>).canvases as Record<string, Record<string, unknown>>
    : null;

  const stepsComplete = [!!archetype, !!domain, !!track].filter(Boolean).length;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Blueprint Composer
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Assemble a tailored engagement blueprint by selecting an archetype, domain, and delivery track. The composer layers playbook policies, canvas rules, and governance constraints automatically.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Step 1: Engagement Pattern */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
              archetype && domain ? "bg-green-600/20 text-green-400" : "bg-muted text-muted-foreground"
            }`}>1</span>
            <span className="text-sm font-medium">Engagement Pattern</span>
            <span className="text-xs text-muted-foreground">What type of engagement and which technical domain?</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Archetype</Label>
              <Select value={archetype} onValueChange={(v) => { setArchetype(v); setVariant(""); setResult(null); }}>
                <SelectTrigger><SelectValue placeholder="Choose engagement type..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(archetypes).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{String(val.name || formatLabel(key))}</span>
                        {!!val.complexity && (
                          <span className={`text-[10px] ${COMPLEXITY_COLORS[String(val.complexity)] || "text-muted-foreground"}`}>
                            {formatLabel(String(val.complexity))}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Domain</Label>
              <Select value={domain} onValueChange={(v) => { setDomain(v); setResult(null); }}>
                <SelectTrigger><SelectValue placeholder="Choose technical focus..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(domains).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{String(val.name || formatLabel(key))}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Archetype context panel */}
          {selectedArchetype && (
            <div className="ml-7 p-3 rounded-md bg-muted/30 border border-muted/50 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {String(selectedArchetype.description || "No description available.")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {!!selectedArchetype.complexity && (
                  <span className={`flex items-center gap-1 ${COMPLEXITY_COLORS[String(selectedArchetype.complexity)] || "text-muted-foreground"}`}>
                    <Gauge className="h-3 w-3" />
                    {formatLabel(String(selectedArchetype.complexity))} complexity
                  </span>
                )}
                {!!selectedArchetype.typical_duration_weeks && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    ~{String(selectedArchetype.typical_duration_weeks)} weeks typical
                  </span>
                )}
                {!!selectedArchetype.minimum_track && (
                  <Badge variant="outline" className="text-[10px] h-5">
                    Min track: {formatLabel(String(selectedArchetype.minimum_track))}
                  </Badge>
                )}
                {!!selectedArchetype.track_override && (
                  <Badge variant="outline" className="text-[10px] h-5 border-yellow-600/30 text-yellow-400">
                    Forces: {formatLabel(String(selectedArchetype.track_override))}
                  </Badge>
                )}
              </div>
              {!!selectedArchetype.signals && (
                <div className="flex flex-wrap gap-1.5">
                  {(selectedArchetype.signals as string[]).map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                      {formatLabel(s)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Domain context panel */}
          {selectedDomain && (selectedDomain.focus_areas as string[] | undefined)?.length && (
            <div className="ml-7 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground mr-1">Domain focus:</span>
              {(selectedDomain.focus_areas as string[]).map((f) => (
                <Badge key={f} variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                  {f}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Delivery Model */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
              track ? "bg-green-600/20 text-green-400" : "bg-muted text-muted-foreground"
            }`}>2</span>
            <span className="text-sm font-medium">Delivery Model</span>
            <span className="text-xs text-muted-foreground">How much governance and which blueprint variant?</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Track</Label>
              <Select value={track} onValueChange={(v) => { setTrack(v); setResult(null); }}>
                <SelectTrigger><SelectValue placeholder="Choose delivery track..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(trackOptions).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{String(val.name || formatLabel(key))}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Variant</Label>
              <Select value={variant || "_default"} onValueChange={(v) => { setVariant(v === "_default" ? "" : v); setResult(null); }} disabled={!archetype}>
                <SelectTrigger><SelectValue placeholder={archetype ? "Auto" : "Select archetype first"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_default">Auto (most comprehensive)</SelectItem>
                  {variants.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <div className="flex flex-col">
                        <span>{v.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Track constraints panel */}
          {selectedTrack && (
            <div className="ml-7 p-3 rounded-md bg-muted/30 border border-muted/50 space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {String(selectedTrack.description || "No description available.")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {(() => {
                  const policy = selectedTrack.playbook_policy as Record<string, unknown> | undefined;
                  const canvas = selectedTrack.canvas_policy as Record<string, unknown> | undefined;
                  const sla = selectedTrack.sla as Record<string, unknown> | undefined;
                  const dur = selectedTrack.duration_limit_weeks;
                  const blocked = (policy?.blocked as string[] | undefined) ?? [];
                  return (
                    <>
                      {!!(policy?.max_playbooks) && (
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          Max {String(policy.max_playbooks)} playbooks
                        </span>
                      )}
                      {!!dur && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {String(dur)} week limit
                        </span>
                      )}
                      {!!(sla?.response_time_hours) && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {String(sla.response_time_hours)}h SLA
                        </span>
                      )}
                      {!!(canvas?.depth) && (
                        <span className="flex items-center gap-1">
                          <Gauge className="h-3 w-3" />
                          Canvas: {formatLabel(String(canvas.depth))}
                        </span>
                      )}
                      {blocked.length > 0 && (
                        <span className="flex items-center gap-1 text-red-400/70">
                          <Ban className="h-3 w-3" />
                          {blocked.length} blocked
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Compose */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
              result ? "bg-green-600/20 text-green-400" : "bg-muted text-muted-foreground"
            }`}>3</span>
            <span className="text-sm font-medium">Compose</span>
            {!canCompose && (
              <span className="text-xs text-muted-foreground">
                Select archetype, domain, and track to continue
              </span>
            )}
          </div>

          <div className="pl-7 flex items-center gap-3">
            <Button
              onClick={handleCompose}
              disabled={!canCompose || composeMutation.isPending}
              size="sm"
              className="min-w-[140px]"
            >
              {composeMutation.isPending ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                  Composing...
                </>
              ) : (
                <>
                  Compose Blueprint
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </>
              )}
            </Button>
            {result && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
            {canCompose && !result && (
              <span className="text-xs text-muted-foreground">
                {stepsComplete}/3 selections made
              </span>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-400 pl-7">{error}</p>}

        {/* Composition Results */}
        {result && (
          <>
            <Separator />

            {result.warnings.length > 0 && (
              <div className="space-y-1">
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-yellow-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 shrink-0" />{w}
                  </p>
                ))}
              </div>
            )}

            {/* Summary strip */}
            {classification && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`border ${ARCHETYPE_COLORS[classification.archetype] || "bg-muted"}`}>
                  {formatLabel(classification.archetype)}
                </Badge>
                <Badge className={`border ${TRACK_COLORS[classification.track] || "bg-muted"}`}>
                  {formatLabel(classification.track)}
                </Badge>
                <Badge variant="outline">{formatLabel(classification.domain)}</Badge>
                {timeline && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{(timeline.discovery_weeks || 0) + (timeline.implementation_weeks || 0) + (timeline.stabilization_weeks || 0)} weeks
                  </span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {selectedPbs.size} playbooks selected
                </span>
              </div>
            )}

            {/* Playbook picker */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">Playbooks</h4>
                <span className="text-xs text-muted-foreground">Toggle playbooks to include in this blueprint</span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter by ID, name, or objective..."
                    value={pbSearch}
                    onChange={(e) => setPbSearch(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="w-[160px] h-8 text-xs">
                    <SelectValue placeholder="All teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teamKeys.map((t) => (
                      <SelectItem key={t} value={t}>{formatLabel(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-3 border rounded-md p-3">
                {Object.entries(groupedPlaybooks).map(([team, pbs]) => (
                  <div key={team}>
                    <p className="text-xs font-medium text-muted-foreground mb-1">{formatLabel(team)}</p>
                    <div className="space-y-0.5">
                      {pbs.map(({ id, info }) => {
                        const isSelected = selectedPbs.has(id);
                        const isBlocked = blockedSet.has(id);
                        return (
                          <button
                            key={id}
                            onClick={() => !isBlocked && togglePlaybook(id)}
                            disabled={isBlocked}
                            className={`w-full flex items-center gap-2 text-xs px-2 py-1.5 rounded transition-colors text-left ${
                              isBlocked
                                ? "opacity-40 cursor-not-allowed"
                                : isSelected
                                  ? "bg-primary/10 hover:bg-primary/15"
                                  : "hover:bg-muted/50"
                            }`}
                          >
                            {isBlocked ? (
                              <Ban className="h-3 w-3 text-red-400 shrink-0" />
                            ) : isSelected ? (
                              <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
                            ) : (
                              <div className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />
                            )}
                            <span className="font-mono text-muted-foreground w-20 shrink-0">{id}</span>
                            <span className="truncate">{info.name}</span>
                            {info.objective && (
                              <span className="text-muted-foreground/60 truncate ml-auto text-[10px] max-w-[200px]">
                                {info.objective}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {Object.keys(groupedPlaybooks).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No playbooks match your filter.</p>
                )}
              </div>
            </div>

            {/* Canvases */}
            {canvases && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Canvases</h4>
                {Object.entries(canvases).map(([, cv]) => (
                  <div key={track} className="flex flex-wrap gap-1.5 pl-3">
                    {(((cv as Record<string, unknown>).required ?? []) as string[]).map((c) => (
                      <Badge key={c} variant="outline" className="text-xs">{formatLabel(c)}</Badge>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Timeline */}
            {timeline && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 rounded bg-muted/30">
                  <p className="text-muted-foreground">Discovery</p>
                  <p className="font-medium">{timeline.discovery_weeks}w</p>
                </div>
                <div className="text-center p-2 rounded bg-muted/30">
                  <p className="text-muted-foreground">Implementation</p>
                  <p className="font-medium">{timeline.implementation_weeks}w</p>
                </div>
                <div className="text-center p-2 rounded bg-muted/30">
                  <p className="text-muted-foreground">Stabilization</p>
                  <p className="font-medium">{timeline.stabilization_weeks}w</p>
                </div>
              </div>
            )}

            {/* Save */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || saved || selectedPbs.size === 0}
              >
                <Save className="h-3 w-3 mr-1" />
                {saved ? "Saved" : saveMutation.isPending ? "Saving..." : "Save Blueprint"}
              </Button>
              {saved && <p className="text-xs text-green-400">Blueprint saved to reference library.</p>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
