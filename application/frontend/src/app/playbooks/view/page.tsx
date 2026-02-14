"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  FileCode2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users2,
  Clock,
  CalendarClock,
  Zap,
  AlertTriangle,
  StickyNote,
  ListChecks,
  Footprints,
  ExternalLink,
  ChevronDown,
  Activity,
  CircleDot,
  Tag,
  Microscope,
  Gauge,
  UserCheck,
  ShieldCheck,
  Eye,
  BookOpen,
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { yaml } from "@codemirror/lang-yaml";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getModeInfo } from "@/components/badges";
import { HelpPopover } from "@/components/help-popover";
import type { Playbook } from "@/types";

// ---------------------------------------------------------------------------
// Helpers: normalize data extraction across all playbook formats
// ---------------------------------------------------------------------------

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Get the mode string from any format */
function getMode(pb: Playbook): string | undefined {
  return pb.playbook_mode || pb.steckbrief?.mode;
}

/** Get primary objective / description */
function getObjective(pb: Playbook): string | undefined {
  return (
    pb.primary_objective ||
    pb.steckbrief?.one_liner ||
    pb.metadata?.description
  );
}

/** Get the owner agent role */
function getOwner(pb: Playbook): string | undefined {
  return (
    pb.intended_agent_role ||
    pb.steckbrief?.owner_agent ||
    (pb.raci?.responsible?.role
      ? pb.raci.responsible.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : undefined)
  );
}

/** Get collaborating agents */
function getCollaborators(pb: Playbook): string[] {
  if (pb.secondary_agents?.length) return pb.secondary_agents;
  if (pb.steckbrief?.supporting_agents?.length) return pb.steckbrief.supporting_agents;
  if (pb.raci) {
    const agents: string[] = [];
    if (pb.raci.accountable?.role) agents.push(formatLabel(pb.raci.accountable.role));
    pb.raci.consulted?.forEach((c) => { if (c.role) agents.push(formatLabel(c.role)); });
    pb.raci.informed?.forEach((c) => { if (c.role) agents.push(formatLabel(c.role)); });
    return agents;
  }
  return [];
}

/** Get anti-patterns / when not to use */
function getAntiPatterns(pb: Playbook): string[] {
  return pb.when_not_to_use || pb.steckbrief?.anti_patterns || [];
}

/** Sort file paths (containing / or ending in .ext) to the bottom */
const isFilePath = (s: string) => /[/\\]/.test(s) || /\.\w{1,4}$/.test(s);
const stripVaultPrefix = (s: string) => s.replace(/^\{realm\}\/\{node\}\//i, "");
function sortPathsLast(items: string[]): string[] {
  return [...items].sort((a, b) => Number(isFilePath(a)) - Number(isFilePath(b)));
}

/** Extract input items from any format */
function getInputItems(pb: Playbook): string[] {
  let items: string[] = [];
  const ri = pb.required_inputs || pb.validation_inputs;
  if (ri?.mandatory) {
    items = ri.mandatory
      .map((item) => (typeof item === "string" ? item : item.description || item.artifact || ""))
      .filter(Boolean)
      .map(stripVaultPrefix);
  } else if (pb.inputs?.required) {
    items = pb.inputs.required.map((item) => item.name || "").filter(Boolean);
  } else if (pb.steckbrief?.key_inputs) {
    items = pb.steckbrief.key_inputs;
  }
  return sortPathsLast(items);
}

function getOptionalInputItems(pb: Playbook): string[] {
  let items: string[] = [];
  const ri = pb.required_inputs || pb.validation_inputs;
  if (ri?.optional) {
    items = ri.optional
      .map((item) => (typeof item === "string" ? item : item.use || item.description || item.artifact || ""))
      .filter(Boolean)
      .map(stripVaultPrefix);
  } else if (pb.inputs?.optional) {
    items = pb.inputs.optional.map((item) => item.name || "").filter(Boolean);
  }
  return sortPathsLast(items);
}

function extractTriggerLabel(t: Record<string, unknown> | string): string {
  if (typeof t === "string") return t;
  for (const key of ["description", "condition", "event", "name"]) {
    const val = (t as Record<string, unknown>)[key];
    if (typeof val === "string" && val) return val;
  }
  const strings = Object.values(t).filter((v): v is string => typeof v === "string" && v.length > 0);
  return strings.join(", ") || JSON.stringify(t);
}

/** Get trigger sections from any format */
function getTriggerSections(pb: Playbook) {
  const tc = pb.trigger_conditions;
  if (tc) {
    const sections: { label: string; items: string[] }[] = [];
    if (tc.automatic?.length)
      sections.push({ label: "Automatic", items: tc.automatic.map(extractTriggerLabel) });
    if (tc.manual?.length)
      sections.push({ label: "Manual", items: tc.manual.map(extractTriggerLabel) });
    if (tc.conditional?.length)
      sections.push({ label: "Conditional", items: tc.conditional.map(extractTriggerLabel) });
    return sections.length > 0 ? sections : null;
  }
  // Specialist format: flat triggers array
  if (pb.triggers?.length) {
    return [{
      label: "Events",
      items: pb.triggers.map(extractTriggerLabel),
    }];
  }
  // Steckbrief summary
  if (pb.steckbrief?.triggers_summary?.length) {
    return [{
      label: "Triggers",
      items: pb.steckbrief.triggers_summary,
    }];
  }
  return null;
}

/** Get output items from any format */
function getOutputItems(pb: Playbook): string[] {
  const outputs = pb.expected_outputs;
  if (outputs) {
    const items: string[] = [];
    if (outputs.primary_artifact) items.push("Primary artifact");
    if (outputs.risk_objects) items.push("Risk objects");
    if (outputs.decision_objects) items.push("Decisions");
    if (outputs.initiative_objects) items.push("Initiatives");
    if (outputs.notifications) items.push("Notifications");
    return items;
  }
  // Specialist format
  if (pb.outputs) {
    const sections = (pb.outputs as Record<string, unknown>).sections;
    if (Array.isArray(sections)) return sections.map(String);
    return ["Output artifact"];
  }
  if (pb.steckbrief?.key_outputs) {
    return pb.steckbrief.key_outputs.map((item: unknown) =>
      typeof item === "string" ? item : (item as Record<string, string>).artifact || String(item)
    );
  }
  return [];
}

/** Human review: from field or RACI */
function getHumanReview(pb: Playbook): boolean | undefined {
  if (pb.human_review_required != null) return pb.human_review_required;
  if (pb.raci?.accountable?.human_required != null) return pb.raci.accountable.human_required;
  return undefined;
}

/** Get category for display */
function getCategory(pb: Playbook): string | undefined {
  return pb.steckbrief?.category || pb.metadata?.category;
}

/** Get complexity */
function getComplexity(pb: Playbook): string | undefined {
  return pb.steckbrief?.complexity;
}

/** Get framework origin/source */
function getFrameworkSource(pb: Playbook): string | undefined {
  return pb.framework_source || pb.steckbrief?.framework_origin;
}

/** Get steps from specialist playbooks */
function getSteps(pb: Playbook): { name: string; id?: string }[] {
  if (!pb.steps?.length) return [];
  return pb.steps.map((s) => ({
    name: String(s.name || s.step_id || ""),
    id: s.step_id ? String(s.step_id) : undefined,
  })).filter((s) => s.name);
}

/** Get discovery framework topics */
function getDiscoveryTopics(pb: Playbook): string[] {
  if (!pb.discovery_framework) return [];
  return Object.keys(pb.discovery_framework).map(formatLabel);
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Expand/collapse toggle for detail cards
// ---------------------------------------------------------------------------
function ExpandToggle({ count, expanded, onToggle }: { count: number; expanded: boolean; onToggle: () => void }) {
  if (count <= 0) return null;
  return (
    <button
      onClick={onToggle}
      className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
    >
      <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
      {expanded ? "Show less" : `${count} more`}
    </button>
  );
}

// ---------------------------------------------------------------------------
// PlaybookSummary: works for all playbook formats
// ---------------------------------------------------------------------------
function PlaybookSummary({ playbook, objective, owner, specialty }: {
  playbook: Playbook | undefined;
  objective?: string;
  owner?: string;
  specialty?: string;
}) {
  if (!playbook) return null;

  const mode = getMode(playbook);
  const inputs = getInputItems(playbook);
  const optionalInputs = getOptionalInputItems(playbook);
  const outputs = getOutputItems(playbook);
  const triggerSections = getTriggerSections(playbook);
  const collaborators = getCollaborators(playbook);
  const antiPatterns = getAntiPatterns(playbook);
  const humanReview = getHumanReview(playbook);
  const category = getCategory(playbook);
  const complexity = getComplexity(playbook);
  const frameworkSource = getFrameworkSource(playbook);
  const steps = getSteps(playbook);
  const discoveryTopics = getDiscoveryTopics(playbook);

  const [expandTriggers, setExpandTriggers] = useState(false);
  const [expandInputs, setExpandInputs] = useState(false);
  const [expandOutputs, setExpandOutputs] = useState(false);
  const [expandCollaborators, setExpandCollaborators] = useState(false);
  const [expandAntiPatterns, setExpandAntiPatterns] = useState(false);
  const [expandSteps, setExpandSteps] = useState(false);

  const hasMetaBar =
    playbook.estimated_execution_time || playbook.frequency ||
    humanReview != null || playbook.notes || category || complexity || frameworkSource;
  const hasDetails =
    triggerSections || inputs.length > 0 || outputs.length > 0 ||
    owner || collaborators.length > 0 || antiPatterns.length > 0 ||
    steps.length > 0 || discoveryTopics.length > 0;

  const hasBadges = !!(mode || playbook?.status || specialty);
  if (!hasMetaBar && !hasDetails && !objective && !hasBadges) return null;

  return (
    <div className="space-y-4">
      {/* Top bar: key facts */}
      {(hasMetaBar || objective || hasBadges) && (
        <Card>
          <CardContent className="p-5 space-y-4">
            {/* Description */}
            {objective && (
              <p className="text-sm leading-relaxed">
                {objective}
              </p>
            )}

            {/* Metadata grid */}
            {(hasBadges || hasMetaBar) && (
              <>
                <div className="border-t border-border" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                  {mode && (
                    <div>
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><Activity className="h-3 w-3" />Mode</p>
                      <p className="font-medium">{getModeInfo(mode).label}</p>
                    </div>
                  )}
                  {playbook?.status && (
                    <div>
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><CircleDot className="h-3 w-3" />Status</p>
                      <p className={`font-medium ${playbook.status === "production_ready" ? "text-green-400" : ""}`}>
                        {formatLabel(playbook.status)}
                      </p>
                    </div>
                  )}
                  {category && (
                    <div>
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><Tag className="h-3 w-3" />Category</p>
                      <p className="font-medium">{formatLabel(category)}</p>
                    </div>
                  )}
                  {specialty && (
                    <div>
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><Microscope className="h-3 w-3" />Specialty</p>
                      <p className="font-medium">{formatLabel(specialty)}</p>
                    </div>
                  )}
                  {complexity && (
                    <div>
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><Gauge className="h-3 w-3" />Complexity</p>
                      <p className="font-medium">{formatLabel(complexity)}</p>
                    </div>
                  )}
                  {humanReview != null && (
                    <div>
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><UserCheck className="h-3 w-3" />Human-in-the-Loop</p>
                      <p className={humanReview ? "font-medium text-amber-400" : "text-muted-foreground"}>
                        {humanReview ? "Yes" : "No"}
                      </p>
                    </div>
                  )}
                  {humanReview && playbook.raci?.accountable?.role && (
                    <div>
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><ShieldCheck className="h-3 w-3" />Accountable</p>
                      <p className="font-medium">{formatLabel(playbook.raci.accountable.role)}</p>
                    </div>
                  )}
                  {humanReview && outputs.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><Eye className="h-3 w-3" />Reviews</p>
                      <p className="font-medium">{outputs.join(", ")}</p>
                    </div>
                  )}
                  {playbook.estimated_execution_time && (
                    <div>
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><Clock className="h-3 w-3" />Execution Time</p>
                      <p>{playbook.estimated_execution_time}</p>
                    </div>
                  )}
                  {playbook.frequency && (
                    <div>
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><CalendarClock className="h-3 w-3" />Frequency</p>
                      <p>{playbook.frequency}</p>
                    </div>
                  )}
                  {frameworkSource && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><BookOpen className="h-3 w-3" />Conceptual Framework</p>
                      <p className="font-medium">{frameworkSource}</p>
                      {playbook.notes && (
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{playbook.notes}</p>
                      )}
                    </div>
                  )}
                  {!frameworkSource && playbook.notes && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground/70 mb-0.5 flex items-center gap-1"><StickyNote className="h-3 w-3" />Why It Matters</p>
                      <p className="text-sm text-muted-foreground">{playbook.notes}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail cards: always 6 boxes in 3x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 1. Trigger Conditions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold">Trigger Conditions</h3>
              </div>
              {triggerSections ? (
                <>
                  <div className="space-y-2">
                    {triggerSections.map((section) => {
                      const preview = section.items.slice(0, 1);
                      const rest = section.items.slice(1);
                      return (
                        <div key={section.label}>
                          <p className="text-xs font-medium text-amber-400/80 uppercase tracking-wide mb-0.5">
                            {section.label}
                          </p>
                          <ul className="space-y-0.5">
                            {preview.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground leading-snug">{item}</li>
                            ))}
                            {expandTriggers && rest.map((item, i) => (
                              <li key={`r-${i}`} className="text-sm text-muted-foreground leading-snug">{item}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                  {(() => {
                    const total = triggerSections.reduce((s, sec) => s + Math.max(0, sec.items.length - 1), 0);
                    return <ExpandToggle count={total} expanded={expandTriggers} onToggle={() => setExpandTriggers(v => !v)} />;
                  })()}
                </>
              ) : (
                <p className="text-sm text-muted-foreground/50">Not defined</p>
              )}
            </CardContent>
          </Card>

          {/* 2. Inputs */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownToLine className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold">Inputs</h3>
              </div>
              {inputs.length > 0 ? (
                <>
                  <ul className="space-y-0.5">
                    {inputs.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                  {optionalInputs.length > 0 && (
                    <>
                      {expandInputs && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide mb-0.5">Optional</p>
                          <ul className="space-y-0.5">
                            {optionalInputs.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground">{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <ExpandToggle
                        count={optionalInputs.length}
                        expanded={expandInputs}
                        onToggle={() => setExpandInputs(v => !v)}
                      />
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground/50">Not defined</p>
              )}
            </CardContent>
          </Card>

          {/* 3. Outputs */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpFromLine className="h-4 w-4 text-green-400" />
                <h3 className="text-sm font-semibold">Outputs</h3>
              </div>
              {outputs.length > 0 ? (
                <>
                  <ul className="space-y-0.5">
                    {(expandOutputs ? outputs : outputs.slice(0, 3)).map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                  <ExpandToggle count={outputs.length - 3} expanded={expandOutputs} onToggle={() => setExpandOutputs(v => !v)} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground/50">Not defined</p>
              )}
            </CardContent>
          </Card>

          {/* 4. Owner & Collaborators */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users2 className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-semibold">Owner & Collaborators</h3>
              </div>
              {(owner || collaborators.length > 0) ? (
                <>
                  {owner && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-purple-400/80 uppercase tracking-wide mb-0.5">Owner</p>
                      <p className="text-sm text-muted-foreground">{formatLabel(owner)}</p>
                    </div>
                  )}
                  {collaborators.length > 0 && (
                    <div>
                      {owner && <p className="text-xs font-medium text-purple-400/80 uppercase tracking-wide mb-0.5">Collaborators</p>}
                      <ul className="space-y-0.5">
                        {(expandCollaborators ? collaborators : collaborators.slice(0, 3)).map((agent) => (
                          <li key={agent} className="text-sm text-muted-foreground">{agent}</li>
                        ))}
                      </ul>
                      <ExpandToggle count={collaborators.length - 3} expanded={expandCollaborators} onToggle={() => setExpandCollaborators(v => !v)} />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground/50">Not defined</p>
              )}
            </CardContent>
          </Card>

          {/* 5. When Not to Use */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <h3 className="text-sm font-semibold">When Not to Use</h3>
              </div>
              {antiPatterns.length > 0 ? (
                <>
                  <ul className="space-y-0.5">
                    {(expandAntiPatterns ? antiPatterns : antiPatterns.slice(0, 2)).map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground leading-snug">{item}</li>
                    ))}
                  </ul>
                  <ExpandToggle count={antiPatterns.length - 2} expanded={expandAntiPatterns} onToggle={() => setExpandAntiPatterns(v => !v)} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground/50">Not defined</p>
              )}
            </CardContent>
          </Card>

          {/* 6. Execution Steps or Discovery Areas */}
          <Card>
            <CardContent className="p-4">
              {steps.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Footprints className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold">Execution Steps</h3>
                  </div>
                  <ol className="space-y-1">
                    {(expandSteps ? steps : steps.slice(0, 3)).map((step, i) => (
                      <li key={step.id || i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-600/20 text-cyan-400 text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step.name}</span>
                      </li>
                    ))}
                  </ol>
                  <ExpandToggle count={steps.length - 3} expanded={expandSteps} onToggle={() => setExpandSteps(v => !v)} />
                </>
              ) : discoveryTopics.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <ListChecks className="h-4 w-4 text-teal-400" />
                    <h3 className="text-sm font-semibold">Discovery Areas</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {discoveryTopics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs font-normal">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Footprints className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold">Execution Steps</h3>
                  </div>
                  <p className="text-sm text-muted-foreground/50">Not defined</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main viewer
// ---------------------------------------------------------------------------
function PlaybookViewerContent() {
  const searchParams = useSearchParams();
  const team = searchParams.get("team") || "";
  const file = searchParams.get("file") || "";

  const { data: playbook, isLoading: playbookLoading } = useQuery({
    queryKey: ["playbook", team, file],
    queryFn: () => api.getPlaybook(team, file),
    enabled: !!team && !!file,
  });

  const { data: rawData, isLoading: rawLoading } = useQuery({
    queryKey: ["playbookRaw", team, file],
    queryFn: () => api.getPlaybookRaw(team, file),
    enabled: !!team && !!file,
  });

  if (!team || !file) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <p className="text-muted-foreground">
          Missing team or file parameter. Please select a playbook from the catalog.
        </p>
        <Link href="/playbooks">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const isLoading = playbookLoading || rawLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading playbook...</p>
      </div>
    );
  }

  const displayName =
    playbook?.framework_name || playbook?.name || playbook?.steckbrief?.name || playbook?._id || file;
  const objective = playbook ? getObjective(playbook) : undefined;
  const owner = playbook ? getOwner(playbook) : undefined;
  const specialty = playbook?.metadata?.specialty;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold truncate min-w-0 flex-1">{displayName}</h1>
        <Link href={`/docs?path=architecture/playbooks/playbook-framework`}>
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <ExternalLink className="h-3 w-3" />
            Docs
          </Button>
        </Link>
      </div>

      {/* Playbook summary panel */}
      <PlaybookSummary
        playbook={playbook}
        objective={objective}
        owner={owner}
        specialty={specialty}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCode2 className="h-4 w-4" />
            Playbook Definition
            <HelpPopover title="Playbook YAML">
              The raw YAML source that defines this playbook. It contains the
              agent role, trigger conditions, execution phases, success criteria,
              and all step-by-step instructions agents follow during execution.
            </HelpPopover>
          </CardTitle>
          <p className="text-xs text-muted-foreground/60">
            {team} / {file}
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <CodeMirror
              value={rawData?.content || ""}
              extensions={[yaml()]}
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

export default function PlaybookViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading playbook...</p>
        </div>
      }
    >
      <PlaybookViewerContent />
    </Suspense>
  );
}
