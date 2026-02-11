"use client";

import { Suspense } from "react";
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
  Info,
  Zap,
  ShieldCheck,
  AlertTriangle,
  StickyNote,
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { yaml } from "@codemirror/lang-yaml";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge, StatusBadge, ModeBadge, getModeInfo } from "@/components/badges";
import { HelpPopover } from "@/components/help-popover";
import type { Playbook } from "@/types";

function getInputItems(playbook: Playbook | undefined): string[] {
  if (!playbook?.required_inputs?.mandatory) return [];
  return playbook.required_inputs.mandatory
    .map((item) => (typeof item === "string" ? item : item.artifact || ""))
    .filter(Boolean);
}

function getOptionalInputItems(playbook: Playbook | undefined): string[] {
  if (!playbook?.required_inputs?.optional) return [];
  return playbook.required_inputs.optional
    .map((item) => (typeof item === "string" ? item : item.artifact || ""))
    .filter(Boolean);
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

function getTriggerSections(playbook: Playbook | undefined) {
  const tc = playbook?.trigger_conditions;
  if (!tc) return null;

  const sections: { label: string; items: string[] }[] = [];
  if (tc.automatic?.length) {
    sections.push({
      label: "Automatic",
      items: tc.automatic.map(extractTriggerLabel),
    });
  }
  if (tc.manual?.length) {
    sections.push({ label: "Manual", items: tc.manual.map(extractTriggerLabel) });
  }
  if (tc.conditional?.length) {
    sections.push({ label: "Conditional", items: tc.conditional.map(extractTriggerLabel) });
  }
  return sections.length > 0 ? sections : null;
}

function getOutputItems(playbook: Playbook | undefined): string[] {
  const outputs = playbook?.expected_outputs;
  if (!outputs) return [];
  const items: string[] = [];
  if (outputs.primary_artifact) items.push("Primary artifact");
  if (outputs.risk_objects) items.push("Risk objects");
  if (outputs.decision_objects) items.push("Decisions");
  if (outputs.initiative_objects) items.push("Initiatives");
  if (outputs.notifications) items.push("Notifications");
  return items;
}

function PlaybookSummary({ playbook }: { playbook: Playbook | undefined }) {
  if (!playbook) return null;

  const modeInfo = playbook.playbook_mode
    ? getModeInfo(playbook.playbook_mode)
    : null;
  const inputs = getInputItems(playbook);
  const optionalInputs = getOptionalInputItems(playbook);
  const outputs = getOutputItems(playbook);
  const triggerSections = getTriggerSections(playbook);

  const hasMetaBar =
    modeInfo || playbook.estimated_execution_time || playbook.frequency ||
    playbook.human_review_required != null;
  const hasDetails =
    triggerSections || inputs.length > 0 || outputs.length > 0 ||
    playbook.secondary_agents?.length || playbook.when_not_to_use?.length;

  if (!hasMetaBar && !hasDetails) return null;

  return (
    <div className="space-y-4">
      {/* Top bar: key facts at a glance */}
      {hasMetaBar && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {modeInfo && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mode</p>
                    <p className="text-sm font-medium">{modeInfo.label}</p>
                  </div>
                </div>
              )}
              {playbook.estimated_execution_time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Execution Time</p>
                    <p className="text-sm font-medium">{playbook.estimated_execution_time}</p>
                  </div>
                </div>
              )}
              {playbook.frequency && (
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Frequency</p>
                    <p className="text-sm font-medium">{playbook.frequency}</p>
                  </div>
                </div>
              )}
              {playbook.human_review_required != null && (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Human Review</p>
                    <p className="text-sm font-medium">{playbook.human_review_required ? "Required" : "Not required"}</p>
                  </div>
                </div>
              )}
              {playbook.notes && (
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm">{playbook.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail cards: 3-column grid for readable lists */}
      {hasDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {triggerSections && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Trigger Conditions</h3>
                </div>
                <div className="space-y-3">
                  {triggerSections.map((section) => (
                    <div key={section.label}>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        {section.label}
                      </p>
                      <ul className="space-y-1">
                        {section.items.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground leading-snug">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <div className="space-y-4">
                {inputs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Inputs</h3>
                    </div>
                    <ul className="space-y-1">
                      {inputs.map((item) => (
                        <li key={item} className="text-sm text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                    {optionalInputs.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Optional</p>
                        <ul className="space-y-1">
                          {optionalInputs.map((item) => (
                            <li key={item} className="text-sm text-muted-foreground">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {outputs.length > 0 && (
                  <div className={inputs.length > 0 ? "pt-3 border-t border-border" : ""}>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Outputs</h3>
                    </div>
                    <ul className="space-y-1">
                      {outputs.map((item) => (
                        <li key={item} className="text-sm text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="space-y-4">
                {playbook.secondary_agents && playbook.secondary_agents.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users2 className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Collaborators</h3>
                    </div>
                    <ul className="space-y-1">
                      {playbook.secondary_agents.map((agent) => (
                        <li key={agent} className="text-sm text-muted-foreground">{agent}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {playbook.when_not_to_use && playbook.when_not_to_use.length > 0 && (
                  <div className={playbook.secondary_agents?.length ? "pt-3 border-t border-border" : ""}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">When Not to Use</h3>
                    </div>
                    <ul className="space-y-1">
                      {playbook.when_not_to_use.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground leading-snug">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

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
    playbook?.framework_name || playbook?.name || playbook?._id || file;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/playbooks">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold truncate">{displayName}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {playbook?.intended_agent_role && (
              <RoleBadge role={playbook.intended_agent_role} />
            )}
            {playbook?.playbook_mode && (
              <ModeBadge mode={playbook.playbook_mode} />
            )}
            {playbook?.status && <StatusBadge status={playbook.status} />}
            <span className="text-sm text-muted-foreground">
              {team} / {file}
            </span>
          </div>
        </div>
      </div>

      {playbook?.primary_objective && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {playbook.primary_objective}
        </p>
      )}

      {/* Playbook summary panel */}
      <PlaybookSummary playbook={playbook} />

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
