"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Shield,
  Target,
  ClipboardList,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Linkedin,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MetricCard } from "@/components/metric-card";
import { HealthBar } from "@/components/health-bar";
import { StatusBadge, SeverityBadge } from "@/components/badges";
import { HelpPopover } from "@/components/help-popover";
import type { Node, HealthScore, RiskRegister, ActionTracker, Risk, Action } from "@/types";

function formatLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const ARCHETYPE_COLORS: Record<string, string> = {
  competitive_displacement: "bg-red-600/20 text-red-400 border-red-600/30",
  greenfield_adoption: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
  platform_consolidation: "bg-violet-600/20 text-violet-400 border-violet-600/30",
  compliance_driven: "bg-amber-600/20 text-amber-400 border-amber-600/30",
  technical_evaluation: "bg-cyan-600/20 text-cyan-400 border-cyan-600/30",
  retention_renewal: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  expansion: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  strategic_account: "bg-pink-600/20 text-pink-400 border-pink-600/30",
};

const DOMAIN_COLORS: Record<string, string> = {
  security: "bg-rose-600/20 text-rose-400 border-rose-600/30",
  search: "bg-sky-600/20 text-sky-400 border-sky-600/30",
  observability: "bg-teal-600/20 text-teal-400 border-teal-600/30",
  platform: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
};

const TRACK_COLORS: Record<string, string> = {
  poc: "bg-slate-600/20 text-slate-400 border-slate-600/30",
  economy: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30",
  premium: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  fast_track: "bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-600/30",
};

// -- Overview Tab --

function CommercialSection({ commercial }: { commercial: Record<string, unknown> }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Commercial
          <HelpPopover title="Commercial data">
            Deal-level commercial metrics for this node: opportunity ARR,
            win probability, sales stage, and upcoming milestones. Sourced
            from CRM and used by the AE Agent for forecasting.
          </HelpPopover>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {commercial.opportunity_arr != null && (
            <div>
              <p className="text-xs text-muted-foreground">Opportunity ARR</p>
              <p className="text-sm font-medium">{String(commercial.opportunity_arr)}</p>
            </div>
          )}
          {commercial.probability != null && (
            <div>
              <p className="text-xs text-muted-foreground">Probability</p>
              <p className="text-sm font-medium">{String(commercial.probability)}</p>
            </div>
          )}
          {commercial.stage != null && (
            <div>
              <p className="text-xs text-muted-foreground">Stage</p>
              <p className="text-sm font-medium">{String(commercial.stage)}</p>
            </div>
          )}
          {commercial.next_milestone != null && (
            <div>
              <p className="text-xs text-muted-foreground">Next Milestone</p>
              <p className="text-sm font-medium">{String(commercial.next_milestone)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StakeholderCard({ stakeholder }: { stakeholder: Record<string, unknown> }) {
  const stanceColors: Record<string, string> = {
    champion: "text-green-400",
    supporter: "text-blue-400",
    neutral: "text-yellow-400",
    blocker: "text-red-400",
    detractor: "text-red-400",
  };

  const stance = String(stakeholder.stance || stakeholder.sentiment || "").toLowerCase();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-sm">{String(stakeholder.name || "Unknown")}</p>
              {!!stakeholder.linkedin_url && (
                <a href={String(stakeholder.linkedin_url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            {!!stakeholder.title && (
              <p className="text-xs text-muted-foreground">{String(stakeholder.title)}</p>
            )}
          </div>
          {!!stakeholder.influence && (
            <Badge variant="outline" className="text-xs">
              {String(stakeholder.influence)}
            </Badge>
          )}
        </div>
        {stance && (
          <p className={`text-xs mt-2 capitalize ${stanceColors[stance] || "text-muted-foreground"}`}>
            {stance}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CompetitiveLandscape({ competitive }: { competitive: Record<string, unknown> }) {
  const incumbents = competitive.incumbents as Record<string, unknown>[] | string[] | undefined;
  const threats = competitive.threats as Record<string, unknown>[] | undefined;
  const hasIncumbents = incumbents && Array.isArray(incumbents) && incumbents.length > 0;
  const hasThreats = threats && Array.isArray(threats) && threats.length > 0;
  if (!hasIncumbents && !hasThreats) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Competitive Landscape
          <HelpPopover title="Competitive landscape">
            Incumbent vendors and potential threats in this engagement.
            Shows contract timelines, annual spend, and pain points that
            create displacement opportunities. Managed by the CI Agent.
          </HelpPopover>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasIncumbents && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incumbents.map((inc, i) => {
              if (typeof inc === "string") return <p key={i} className="text-sm">{inc}</p>;
              const obj = inc as Record<string, unknown>;
              const painPoints = obj.pain_points as string[] | undefined;
              return (
                <div key={i} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{String(obj.vendor || obj.name || "Unknown")}</p>
                      {!!obj.product && (
                        <p className="text-xs text-muted-foreground">{String(obj.product)}</p>
                      )}
                    </div>
                    {!!obj.relationship && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {String(obj.relationship)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    {!!obj.contract_end && <span>Contract ends: {String(obj.contract_end)}</span>}
                    {obj.annual_spend != null && (
                      <span>Spend: ${Number(obj.annual_spend).toLocaleString()}/yr</span>
                    )}
                  </div>
                  {painPoints && Array.isArray(painPoints) && painPoints.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {painPoints.map((p, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-yellow-400 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {hasThreats && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Potential Threats</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {threats.map((t, i) => {
                const obj = t as Record<string, unknown>;
                return (
                  <div key={i} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{String(obj.vendor || obj.name || "Unknown")}</p>
                        {!!obj.product && (
                          <p className="text-xs text-muted-foreground">{String(obj.product)}</p>
                        )}
                      </div>
                      {!!obj.threat_level && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {String(obj.threat_level)}
                        </Badge>
                      )}
                    </div>
                    {!!obj.notes && (
                      <p className="text-xs text-muted-foreground mt-2">{String(obj.notes)}</p>
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
}

function OverviewTab({ node, realmId, nodeId }: { node: Node; realmId: string; nodeId: string }) {
  const { data: valueData, isLoading: valueLoading } = useQuery({
    queryKey: ["value", realmId, nodeId],
    queryFn: () => api.getValue(realmId, nodeId),
  });

  return (
    <div className="space-y-6">
      {node.commercial && Object.keys(node.commercial).length > 0 && (
        <CommercialSection commercial={node.commercial} />
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Initiative
            <HelpPopover title="Initiative details">
              The purpose and timeline of this engagement node. Defines
              what this initiative aims to achieve and when it should be
              completed.
            </HelpPopover>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {node.purpose && (
              <div>
                <p className="text-xs text-muted-foreground">Purpose</p>
                <p className="text-sm">{node.purpose}</p>
              </div>
            )}
            {node.target_completion && (
              <div>
                <p className="text-xs text-muted-foreground">Target Completion</p>
                <p className="text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {node.target_completion}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {node.stakeholders && node.stakeholders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Key Stakeholders
            <HelpPopover title="Key stakeholders">
              Decision-makers and influencers involved in this node. Stance
              indicates their disposition (champion, supporter, neutral,
              blocker). Influence shows their decision-making power.
            </HelpPopover>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {node.stakeholders.map((s, i) => (
              <StakeholderCard key={i} stakeholder={s} />
            ))}
          </div>
        </div>
      )}

      {node.competitive && Object.keys(node.competitive).length > 0 && (
        <CompetitiveLandscape competitive={node.competitive} />
      )}

      {valueData && !valueLoading && (
        <ValueTrackerSection data={valueData} />
      )}
    </div>
  );
}

// -- Blueprint Tab --

function BlueprintTab({ realmId, nodeId }: { realmId: string; nodeId: string }) {
  const { data: blueprint, isLoading, error } = useQuery({
    queryKey: ["blueprint", realmId, nodeId],
    queryFn: () => api.getBlueprint(realmId, nodeId),
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading blueprint...</p>;
  if (error) return <p className="text-red-400 text-sm">Failed to load blueprint.</p>;
  if (!blueprint) return <p className="text-muted-foreground text-sm">No blueprint data.</p>;

  const playbooksObj = blueprint.playbooks as Record<string, unknown> | undefined;
  const playbookList = playbooksObj
    ? [
        ...((playbooksObj.required as Record<string, unknown>[]) || []),
        ...((playbooksObj.optional as Record<string, unknown>[]) || []),
      ]
    : (blueprint.playbook_progress as Record<string, unknown>[] | undefined);
  const checklists = blueprint.checklists as Record<string, unknown> | undefined;
  const successCriteria = (blueprint.success_criteria || blueprint.criteria) as Record<string, unknown> | undefined;
  const canvasesObj = blueprint.canvases as Record<string, unknown> | undefined;
  const canvasList = canvasesObj?.required as Record<string, unknown>[] | undefined;
  const signals = blueprint.expected_signals as Record<string, unknown>[] | undefined;
  const timeline = blueprint.timeline as Record<string, unknown> | undefined;
  const governance = blueprint.governance as Record<string, unknown> | undefined;
  const metadata = blueprint.metadata as Record<string, unknown> | undefined;
  const archetype = blueprint.archetype as string | undefined;
  const domain = blueprint.domain as string | undefined;
  const track = blueprint.track as string | undefined;
  const refBlueprint = metadata?.reference_blueprint as string | undefined;
  const hasContent = playbookList?.length || checklists || successCriteria || canvasList || signals || governance;

  return (
    <div className="space-y-6">
      {(archetype || domain || track) && (
        <div className="flex items-center gap-2 flex-wrap">
          {archetype && (
            <Badge className={`text-xs border ${ARCHETYPE_COLORS[archetype] || "bg-muted text-muted-foreground"}`}>
              {formatLabel(archetype)}
            </Badge>
          )}
          {domain && (
            <Badge className={`text-xs border ${DOMAIN_COLORS[domain] || "bg-muted text-muted-foreground"}`}>
              {formatLabel(domain)}
            </Badge>
          )}
          {track && (
            <Badge className={`text-xs border ${TRACK_COLORS[track] || "bg-muted text-muted-foreground"}`}>
              {formatLabel(track)}
            </Badge>
          )}
          {refBlueprint && (
            <Link href={`/blueprints/view?archetype=${archetype}&id=${refBlueprint}`}>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                Reference: {refBlueprint}
              </Badge>
            </Link>
          )}
          {!!metadata?.name && (
            <span className="text-xs text-muted-foreground ml-2">{String(metadata.name)}</span>
          )}
        </div>
      )}

      {playbookList && Array.isArray(playbookList) && playbookList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Playbook Progress
              <HelpPopover title="Playbook progress">
                Tracks which playbooks have been activated for this node and
                their current phase/status. Required playbooks come from the
                reference blueprint; optional ones trigger on conditions.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seq</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playbookList.map((pb, i) => (
                  <TableRow key={i}>
                    <TableCell>{String(pb.sequence ?? i + 1)}</TableCell>
                    <TableCell className="font-mono text-xs">{String(pb.id || pb.playbook_id || "-")}</TableCell>
                    <TableCell>{String(pb.name || pb.playbook_name || "-")}</TableCell>
                    <TableCell>{String(pb.phase || pb.trigger || "-")}</TableCell>
                    <TableCell>
                      {pb.status ? (
                        <StatusBadge status={String(pb.status)} />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {canvasList && Array.isArray(canvasList) && canvasList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Canvases
              <HelpPopover title="Required canvases">
                One-page visual artifacts rendered from InfoHub data. Each
                canvas type serves a specific audience and auto-updates when
                source data changes.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {canvasList.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{formatLabel(String(c.canvas_id || "Unknown"))}</p>
                    {!!c.location && (
                      <p className="text-xs text-muted-foreground mt-0.5">{String(c.location)}</p>
                    )}
                  </div>
                  {!!c.status && <StatusBadge status={String(c.status)} />}
                </div>
              ))}
            </div>
            {!!canvasesObj?.custom_allowed && (
              <p className="text-xs text-muted-foreground mt-3">Custom canvases allowed for this track.</p>
            )}
          </CardContent>
        </Card>
      )}

      {checklists && typeof checklists === "object" && Object.keys(checklists).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Checklists by Phase
              <HelpPopover title="Phase checklists">
                Mandatory tasks grouped by engagement phase. Each checklist
                item must be completed before advancing to the next phase.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple">
              {Object.entries(checklists).map(([phase, items]) => (
                <AccordionItem key={phase} value={phase}>
                  <AccordionTrigger className="capitalize">{phase.replace(/_/g, " ")}</AccordionTrigger>
                  <AccordionContent>
                    {Array.isArray(items) ? (
                      <ul className="space-y-1">
                        {items.map((item, i) => {
                          const obj = typeof item === "string" ? null : (item as Record<string, unknown>);
                          return (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="flex-1">
                                {typeof item === "string" ? item : String(obj?.name || obj?.task || obj?.description || JSON.stringify(item))}
                              </span>
                              {!!obj?.status && <StatusBadge status={String(obj.status)} />}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm">{JSON.stringify(items)}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {successCriteria && typeof successCriteria === "object" && Object.keys(successCriteria).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Success Criteria by Phase
              <HelpPopover title="Success criteria">
                Measurable outcomes that define success for each engagement
                phase. Used by agents to validate progress and determine
                when a phase is truly complete.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple">
              {Object.entries(successCriteria).map(([phase, criteria]) => (
                <AccordionItem key={phase} value={phase}>
                  <AccordionTrigger className="capitalize">{phase.replace(/_/g, " ")}</AccordionTrigger>
                  <AccordionContent>
                    {Array.isArray(criteria) ? (
                      <ul className="space-y-2">
                        {criteria.map((c, i) => {
                          const obj = typeof c === "string" ? null : (c as Record<string, unknown>);
                          return (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Target className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span>{typeof c === "string" ? c : String(obj?.criterion || obj?.description || JSON.stringify(c))}</span>
                                  {!!obj?.status && <StatusBadge status={String(obj.status)} />}
                                </div>
                                {obj?.value != null && (
                                  <p className="text-xs text-muted-foreground mt-0.5">Value: {String(obj.value)}</p>
                                )}
                                {!!obj?.notes && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{String(obj.notes)}</p>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm">{JSON.stringify(criteria)}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {signals && Array.isArray(signals) && signals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Expected Signals
              <HelpPopover title="Expected signals">
                Progress indicators the blueprint expects by specific weeks.
                Agents monitor for these signals and alert when they are
                overdue.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {signals.map((sig, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{String(sig.name || sig.signal_id || "Unknown")}</p>
                    {sig.expected_by_week != null && (
                      <p className="text-xs text-muted-foreground">Expected by week {String(sig.expected_by_week)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!!sig.signal_id && (
                      <span className="text-xs font-mono text-muted-foreground">{String(sig.signal_id)}</span>
                    )}
                    {!!sig.status && <StatusBadge status={String(sig.status)} />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(governance || timeline) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {governance && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Governance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
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
                      <dt className="text-muted-foreground">Executive review</dt>
                      <dd className="capitalize">{String(governance.executive_review)}</dd>
                    </div>
                  )}
                  {(governance.sla as Record<string, unknown>)?.response_time_hours != null && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">SLA response</dt>
                      <dd>{String((governance.sla as Record<string, unknown>).response_time_hours)}h</dd>
                    </div>
                  )}
                  {(governance.sla as Record<string, unknown>)?.escalation_threshold_days != null && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Escalation threshold</dt>
                      <dd>{String((governance.sla as Record<string, unknown>).escalation_threshold_days)} days</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}

          {timeline && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  {timeline.discovery_weeks != null && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Discovery</dt>
                      <dd>{String(timeline.discovery_weeks)} weeks</dd>
                    </div>
                  )}
                  {timeline.implementation_weeks != null && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Implementation</dt>
                      <dd>{String(timeline.implementation_weeks)} weeks</dd>
                    </div>
                  )}
                  {timeline.stabilization_weeks != null && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Stabilization</dt>
                      <dd>{String(timeline.stabilization_weeks)} weeks</dd>
                    </div>
                  )}
                  {!!timeline.target_completion && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Target completion</dt>
                      <dd>{String(timeline.target_completion)}</dd>
                    </div>
                  )}
                </dl>
                {!!timeline.notes && (
                  <p className="text-xs text-muted-foreground mt-3">{String(timeline.notes)}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!hasContent && (
        <p className="text-muted-foreground text-sm">No blueprint data available.</p>
      )}
    </div>
  );
}

// -- Health Tab --

const COMPONENT_LABELS: Record<string, string> = {
  product_adoption: "Product Adoption",
  engagement: "Engagement",
  relationship: "Relationship",
  commercial: "Commercial",
  risk_profile: "Risk Profile",
};

function HealthTab({ realmId, nodeId }: { realmId: string; nodeId: string }) {
  const { data: health, isLoading, error } = useQuery({
    queryKey: ["health", realmId, nodeId],
    queryFn: () => api.getHealth(realmId, nodeId),
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading health data...</p>;
  if (error) return <p className="text-red-400 text-sm">Failed to load health data.</p>;
  if (!health) return <p className="text-muted-foreground text-sm">No health data.</p>;

  const overallScore = health.health_score?.current ?? 0;
  const alerts = health.alerts?.active || [];
  const components = health.components || {};
  const improvementPlan = health.improvement_plan as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overall Health Score
            <HelpPopover title="Health score">
              A composite score (0-100) reflecting the overall health of this
              engagement. Calculated from weighted components like product
              adoption, stakeholder engagement, relationship strength,
              commercial progress, and risk profile.
            </HelpPopover>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HealthBar score={overallScore} />
          <div className="flex items-center gap-4 mt-3 text-sm">
            {health.health_score?.trend && (
              <span className="text-muted-foreground">
                Trend: <span className="capitalize">{health.health_score.trend}</span>
              </span>
            )}
            {health.health_score?.change != null && (
              <span className={health.health_score.change >= 0 ? "text-green-400" : "text-red-400"}>
                {health.health_score.change >= 0 ? "+" : ""}
                {health.health_score.change}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {Object.keys(components).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Component Breakdown
              <HelpPopover title="Health components">
                Individual dimensions that feed into the overall health score.
                Each component has its own score and weight. Low-scoring
                components indicate areas that need attention.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(components).map(([key, comp]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{COMPONENT_LABELS[key] || key.replace(/_/g, " ")}</span>
                  <span className="text-xs text-muted-foreground">
                    Weight: {(comp.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <HealthBar score={comp.score} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Active Alerts
              <HelpPopover title="Active alerts">
                Triggered warnings based on health score thresholds or
                significant changes. Each alert includes a recommended
                action to address the underlying issue.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <SeverityBadge severity={alert.severity} />
                  <div className="flex-1">
                    <p className="text-sm">{alert.alert}</p>
                    {alert.action && (
                      <p className="text-xs text-muted-foreground mt-1">{alert.action}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {improvementPlan && Object.keys(improvementPlan).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Improvement Plan
              <HelpPopover title="Improvement plan">
                A targeted plan to raise the health score. Includes a target
                score, target date, and prioritized actions with owners and
                expected impact on specific health components.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-6 text-sm">
              {!!improvementPlan.target_score && (
                <div>
                  <p className="text-xs text-muted-foreground">Target Score</p>
                  <p className="font-medium">{String(improvementPlan.target_score)}</p>
                </div>
              )}
              {!!improvementPlan.target_date && (
                <div>
                  <p className="text-xs text-muted-foreground">Target Date</p>
                  <p className="font-medium">{String(improvementPlan.target_date)}</p>
                </div>
              )}
            </div>
            {(() => {
              const actions = (improvementPlan.priority_actions || improvementPlan.actions || improvementPlan.items) as Record<string, unknown>[] | undefined;
              if (!actions || !Array.isArray(actions) || actions.length === 0) return null;
              return (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Priority Actions</p>
                  {actions.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-sm">
                      <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{String(item.action || item.description || item.title || `Action ${i + 1}`)}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                          {!!item.component && <span>{String(item.component)}</span>}
                          {!!item.impact && <span className="text-green-400">{String(item.impact)}</span>}
                          {!!item.owner && <span>{String(item.owner)}</span>}
                          {!!(item.due || item.due_date) && <span>Due: {String(item.due || item.due_date)}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// -- Risks & Actions Tab --

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

function RisksActionsTab({ realmId, nodeId }: { realmId: string; nodeId: string }) {
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  const { data: riskData, isLoading: risksLoading } = useQuery({
    queryKey: ["risks", realmId, nodeId],
    queryFn: () => api.getRisks(realmId, nodeId),
  });

  const { data: actionData, isLoading: actionsLoading } = useQuery({
    queryKey: ["actions", realmId, nodeId],
    queryFn: () => api.getActions(realmId, nodeId),
  });

  const isLoading = risksLoading || actionsLoading;

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading risks and actions...</p>;

  const riskSummary = riskData?.summary;
  const risks = riskData?.risks || [];
  const risksBySeverity = groupBy(risks, (r) => r.severity?.toLowerCase() || "unknown");
  const severityOrder = ["critical", "high", "medium", "low"];

  const actionSummary = actionData?.summary;
  const actions = actionData?.actions || [];
  const actionsByPriority = groupBy(actions, (a) => a.priority?.toLowerCase() || "unknown");
  const priorityOrder = ["p0_critical", "p1_high", "p2_medium", "p0", "p1", "p2", "critical", "high", "medium", "low"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Risk Register
          <HelpPopover title="Risk register">
            All identified risks for this node, grouped by severity. Each risk
            has an owner, category, probability, impact, and mitigation plan.
            Click &quot;Open&quot; to see full details and mitigation strategy.
          </HelpPopover>
        </h3>

        {riskSummary && (
          <div className="grid grid-cols-5 gap-2">
            <MetricCard label="Total" value={riskSummary.total} />
            <MetricCard label="Critical" value={riskSummary.critical} />
            <MetricCard label="High" value={riskSummary.high} />
            <MetricCard label="Medium" value={riskSummary.medium} />
            <MetricCard label="Low" value={riskSummary.low} />
          </div>
        )}

        {risks.length > 0 ? (
          <Accordion type="multiple">
            {severityOrder
              .filter((sev) => risksBySeverity[sev]?.length)
              .map((sev) => (
                <AccordionItem key={sev} value={sev}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={sev} />
                      <span className="text-sm">{risksBySeverity[sev].length} risks</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {risksBySeverity[sev].map((risk) => (
                        <div key={risk.risk_id} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium">{risk.title}</p>
                            <Button variant="outline" size="sm" onClick={() => setSelectedRisk(risk)}>
                              Open
                            </Button>
                          </div>
                          {risk.description && (
                            <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            {risk.category && <span>Category: {risk.category}</span>}
                            {risk.owner && <span>Owner: {risk.owner}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}

            {Object.keys(risksBySeverity)
              .filter((sev) => !severityOrder.includes(sev))
              .map((sev) => (
                <AccordionItem key={sev} value={sev}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={sev} />
                      <span className="text-sm">{risksBySeverity[sev].length} risks</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {risksBySeverity[sev].map((risk) => (
                        <div key={risk.risk_id} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium">{risk.title}</p>
                            <Button variant="outline" size="sm" onClick={() => setSelectedRisk(risk)}>
                              Open
                            </Button>
                          </div>
                          {risk.description && (
                            <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        ) : (
          <p className="text-muted-foreground text-sm">No risks recorded.</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Action Tracker
          <HelpPopover title="Action tracker">
            Concrete tasks assigned to resolve risks, improve health, or
            advance the engagement. Grouped by priority. Tracks owner, due
            date, and completion status. Overdue actions flag automatically.
          </HelpPopover>
        </h3>

        {actionSummary && (
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="Total" value={actionSummary.total_actions} />
            <MetricCard label="Completed" value={actionSummary.completed} />
            <MetricCard label="Overdue" value={actionSummary.overdue} />
          </div>
        )}

        {actions.length > 0 ? (
          <Accordion type="multiple">
            {priorityOrder
              .filter((pri) => actionsByPriority[pri]?.length)
              .map((pri) => (
                <AccordionItem key={pri} value={pri}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {pri.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-sm">{actionsByPriority[pri].length} actions</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {actionsByPriority[pri].map((action) => (
                        <div key={action.action_id} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium">{action.title}</p>
                            <StatusBadge status={action.status} />
                          </div>
                          {action.description && (
                            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            {action.owner && <span>Owner: {action.owner}</span>}
                            {action.due_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {action.due_date}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}

            {Object.keys(actionsByPriority)
              .filter((pri) => !priorityOrder.includes(pri))
              .map((pri) => (
                <AccordionItem key={pri} value={pri}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {pri.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-sm">{actionsByPriority[pri].length} actions</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {actionsByPriority[pri].map((action) => (
                        <div key={action.action_id} className="p-3 rounded-lg bg-muted/30">
                          <p className="text-sm font-medium">{action.title}</p>
                          {action.description && (
                            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        ) : (
          <p className="text-muted-foreground text-sm">No actions recorded.</p>
        )}
      </div>

      <Dialog open={!!selectedRisk} onOpenChange={(open) => !open && setSelectedRisk(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedRisk && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRisk.title}</DialogTitle>
                {selectedRisk.description && (
                  <DialogDescription>{selectedRisk.description}</DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs">Severity</p>
                    <SeverityBadge severity={selectedRisk.severity} />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <StatusBadge status={selectedRisk.status} />
                  </div>
                  {selectedRisk.category && (
                    <div>
                      <p className="text-muted-foreground text-xs">Category</p>
                      <p>{selectedRisk.category}</p>
                    </div>
                  )}
                  {selectedRisk.owner && (
                    <div>
                      <p className="text-muted-foreground text-xs">Owner</p>
                      <p>{selectedRisk.owner}</p>
                    </div>
                  )}
                  {selectedRisk.probability && (
                    <div>
                      <p className="text-muted-foreground text-xs">Probability</p>
                      <p>{selectedRisk.probability}</p>
                    </div>
                  )}
                  {selectedRisk.impact && (
                    <div>
                      <p className="text-muted-foreground text-xs">Impact</p>
                      <p>{selectedRisk.impact}</p>
                    </div>
                  )}
                </div>
                {selectedRisk.mitigation && Object.keys(selectedRisk.mitigation).length > 0 && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Mitigation</p>
                    <div className="rounded-md bg-muted/50 p-3 text-xs space-y-1">
                      {Object.entries(selectedRisk.mitigation).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                          {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter showCloseButton />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// -- Value Tracker --

const VALUE_STATUS_COLORS: Record<string, string> = {
  realized: "bg-green-600/20 text-green-400 border-green-600/30",
  in_validation: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  pending: "bg-blue-600/20 text-blue-400 border-blue-600/30",
};

function ValueItemCard({ item }: { item: Record<string, unknown> }) {
  const hypothesis = item.hypothesis as Record<string, unknown> | undefined;
  const outcome = item.outcome as Record<string, unknown> | undefined;
  const impact = item.business_impact as Record<string, unknown> | undefined;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{String(item.title || item.value_id || "Untitled")}</p>
            <div className="flex gap-2 mt-1">
              {!!item.category && (
                <Badge variant="outline" className="text-xs capitalize">
                  {String(item.category).replace(/_/g, " ")}
                </Badge>
              )}
              {!!item.product && (
                <span className="text-xs text-muted-foreground">{String(item.product)}</span>
              )}
            </div>
          </div>
          {!!item.status && (
            <Badge className={`text-xs ${VALUE_STATUS_COLORS[String(item.status)] || ""}`}>
              {String(item.status).replace(/_/g, " ")}
            </Badge>
          )}
        </div>

        {hypothesis && (
          <div className="text-sm space-y-1">
            {!!hypothesis.statement && <p className="text-muted-foreground">{String(hypothesis.statement)}</p>}
            <div className="flex gap-4 text-xs">
              {!!hypothesis.target && <span>Target: <strong>{String(hypothesis.target)}</strong></span>}
              {!!hypothesis.baseline && <span>Baseline: {String(hypothesis.baseline)}</span>}
            </div>
          </div>
        )}

        {outcome && (
          <div className="rounded bg-muted/30 p-2 text-sm space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Outcome</p>
            <div className="flex gap-4 text-xs">
              {!!outcome.actual && <span>Actual: <strong>{String(outcome.actual)}</strong></span>}
              {!!outcome.current_metric && <span>Current: {String(outcome.current_metric)}</span>}
            </div>
          </div>
        )}

        {!!(impact && impact.annual_value) && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-3.5 w-3.5 text-green-400" />
            <span className="font-medium">{String(impact.annual_value)}</span>
            <span className="text-xs text-muted-foreground">annual value</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ValueTrackerSection({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as Record<string, unknown> | undefined;
  const sections = ["realized", "in_validation", "pending"] as const;
  const sectionLabels: Record<string, string> = {
    realized: "Realized",
    in_validation: "In Validation",
    pending: "Pending",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Value Tracker
        <HelpPopover title="Value tracker">
          Tracks business value delivered through this engagement. Items
          progress from pending to in-validation to realized. Each includes
          a hypothesis, measurable outcome, and projected annual business
          impact.
        </HelpPopover>
      </h3>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {!!summary.realized_value_ytd && (
            <MetricCard label="Realized YTD" value={String(summary.realized_value_ytd)} />
          )}
          {!!summary.projected_value_annual && (
            <MetricCard label="Projected Annual" value={String(summary.projected_value_annual)} />
          )}
          <MetricCard label="Validated" value={Number(summary.validated || 0)} />
          <MetricCard label="In Validation" value={Number(summary.in_validation || 0)} />
        </div>
      )}

      {sections.map((section) => {
        const items = data[section] as Record<string, unknown>[] | undefined;
        if (!items || !Array.isArray(items) || items.length === 0) return null;
        return (
          <div key={section}>
            <p className="text-xs font-medium text-muted-foreground mb-2">{sectionLabels[section]}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item, i) => (
                <ValueItemCard key={String(item.value_id || i)} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -- Stakeholders Tab --

const STANCE_COLORS: Record<string, string> = {
  champion: "text-green-400",
  supporter: "text-blue-400",
  neutral: "text-yellow-400",
  blocker: "text-red-400",
  detractor: "text-red-400",
};

function StakeholdersTab({ realmId, nodeId }: { realmId: string; nodeId: string }) {
  const { data: stakeholderData, isLoading: stakeholdersLoading } = useQuery({
    queryKey: ["stakeholders", realmId, nodeId],
    queryFn: () => api.getStakeholders(realmId, nodeId),
  });

  if (stakeholdersLoading) return <p className="text-muted-foreground text-sm">Loading stakeholders...</p>;
  if (!stakeholderData) return <p className="text-muted-foreground text-sm">No stakeholder data.</p>;

  const allStakeholders = (stakeholderData.stakeholders || stakeholderData.contacts || []) as Record<string, unknown>[];
  const buyingCenter = stakeholderData.buying_center as Record<string, unknown> | undefined;
  const engagementGaps = (stakeholderData.engagement_gaps || stakeholderData.gaps) as unknown[] | undefined;

  const countByStance = (stance: string) =>
    allStakeholders.filter(
      (s) => String(s.stance || s.sentiment || "").toLowerCase() === stance
    ).length;

  const totalCount = allStakeholders.length;
  const championsCount = countByStance("champion");
  const supportersCount = countByStance("supporter");
  const neutralCount = countByStance("neutral");
  const blockersCount = countByStance("blocker") + countByStance("detractor");

  const buyingCenterRoles = [
    { key: "economic_buyer", label: "Economic Buyer", icon: DollarSign },
    { key: "technical_decision_maker", label: "Technical Decision Maker", icon: Zap },
    { key: "user_buyer", label: "User Buyer", icon: Users },
    { key: "champion", label: "Champion", icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-3">
        <MetricCard label="Total" value={totalCount} />
        <MetricCard label="Champions" value={championsCount} />
        <MetricCard label="Supporters" value={supportersCount} />
        <MetricCard label="Neutral" value={neutralCount} />
        <MetricCard label="Blockers" value={blockersCount} />
      </div>

      {buyingCenter && Object.keys(buyingCenter).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            Buying Center
            <HelpPopover title="Buying center">
              The key decision-making roles: Economic Buyer (budget authority),
              Technical Decision Maker (technical sign-off), User Buyer (end-user
              advocate), and Champion (internal sponsor). Mapping these roles is
              critical for deal progression.
            </HelpPopover>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {buyingCenterRoles.map(({ key, label, icon: Icon }) => {
              const person = buyingCenter[key] as Record<string, unknown> | string | undefined;
              if (!person) return null;
              return (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                    {typeof person === "string" ? (
                      <p className="text-sm font-medium">{person}</p>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium">{String(person.name || "TBD")}</p>
                          {!!person.linkedin_url && (
                            <a href={String(person.linkedin_url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                              <Linkedin className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        {!!person.title && (
                          <p className="text-xs text-muted-foreground">{String(person.title)}</p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {allStakeholders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            All Stakeholders
            <HelpPopover title="Stakeholder map">
              Complete list of stakeholders with their stance (champion,
              supporter, neutral, blocker) and priorities. Helps identify
              who to engage, who to convert, and where relationships need
              strengthening.
            </HelpPopover>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allStakeholders.map((s, i) => {
              const stance = String(s.stance || s.sentiment || "").toLowerCase();
              const priorities = s.priorities as string[] | undefined;
              return (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium">{String(s.name || "Unknown")}</p>
                          {!!s.linkedin_url && (
                            <a href={String(s.linkedin_url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                              <Linkedin className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        {!!s.title && (
                          <p className="text-xs text-muted-foreground">{String(s.title)}</p>
                        )}
                      </div>
                      {stance && (
                        <span className={`text-xs capitalize ${STANCE_COLORS[stance] || "text-muted-foreground"}`}>
                          {stance}
                        </span>
                      )}
                    </div>
                    {priorities && Array.isArray(priorities) && priorities.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {priorities.map((p, j) => (
                          <li key={j} className="text-xs text-muted-foreground">
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {engagementGaps && Array.isArray(engagementGaps) && engagementGaps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Engagement Gaps
              <HelpPopover title="Engagement gaps">
                Areas where stakeholder engagement is insufficient. These
                gaps represent risks: unengaged decision-makers, missing
                champion coverage, or departments without a relationship.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {engagementGaps.map((gap, i) => (
                <div key={i} className="flex items-start gap-2 text-sm p-2 rounded bg-muted/30">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                  {typeof gap === "string" ? gap : String((gap as Record<string, unknown>).description || (gap as Record<string, unknown>).gap || JSON.stringify(gap))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

// -- Main Page --

export default function NodeDetailPage() {
  const params = useParams();
  const realmId = params.realmId as string;
  const nodeId = params.nodeId as string;

  const {
    data: node,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["node", realmId, nodeId],
    queryFn: () => api.getNode(realmId, nodeId),
    enabled: !!realmId && !!nodeId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading node...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">Failed to load node: {error.message}</p>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Node not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{node.name || node.node_id}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {node.status && <StatusBadge status={node.status} />}
          {node.operating_mode && (
            <Badge variant="secondary" className="text-xs">
              {node.operating_mode}
            </Badge>
          )}
          {node.blueprint?.archetype && (
            <Badge className={`text-xs border ${ARCHETYPE_COLORS[node.blueprint.archetype] || "bg-muted text-muted-foreground"}`}>
              {formatLabel(node.blueprint.archetype)}
            </Badge>
          )}
          {node.blueprint?.domain && (
            <Badge className={`text-xs border ${DOMAIN_COLORS[node.blueprint.domain] || "bg-muted text-muted-foreground"}`}>
              {formatLabel(node.blueprint.domain)}
            </Badge>
          )}
          {node.blueprint?.track && (
            <Badge className={`text-xs border ${TRACK_COLORS[node.blueprint.track] || "bg-muted text-muted-foreground"}`}>
              {formatLabel(node.blueprint.track)}
            </Badge>
          )}
          {node.blueprint?.reference_blueprint && (
            <Link href={`/blueprints/view?archetype=${node.blueprint.archetype}&id=${node.blueprint.reference_blueprint}`}>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                {node.blueprint.reference_blueprint}
              </Badge>
            </Link>
          )}
          {node.created && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {node.created}
            </span>
          )}
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blueprint">Blueprint</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="risks-actions">Risks & Actions</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab node={node} realmId={realmId} nodeId={nodeId} />
        </TabsContent>

        <TabsContent value="blueprint" className="mt-4">
          <BlueprintTab realmId={realmId} nodeId={nodeId} />
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <HealthTab realmId={realmId} nodeId={nodeId} />
        </TabsContent>

        <TabsContent value="risks-actions" className="mt-4">
          <RisksActionsTab realmId={realmId} nodeId={nodeId} />
        </TabsContent>

        <TabsContent value="stakeholders" className="mt-4">
          <StakeholdersTab realmId={realmId} nodeId={nodeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
