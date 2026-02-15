"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import {
  Users,
  Shield,
  Target,
  ClipboardList,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Linkedin,
  TrendingUp,
  UserCheck,
  Zap,
  MessageSquare,
  FileText,
  Newspaper,
  Bot,
  MapPin,
  Milestone,
  Lightbulb,
  BookOpen,
  Ban,
  Gauge,
  Globe,
  Lock,
  GitCommitVertical,
  Plus,
  Trash2,
  Search,
  History,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StatusBadge, SeverityBadge } from "@/components/badges";
import { HelpPopover } from "@/components/help-popover";
import { CanvasViewer } from "@/components/canvas-viewer";
import type { Node, HealthScore, RiskRegister, ActionTracker, Risk, Action } from "@/types";

function formatLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCurrency(value: number | string): string {
  if (typeof value === "string") {
    if (value.startsWith("$")) return value;
    const n = parseFloat(value.replace(/[^0-9.-]/g, ""));
    if (isNaN(n)) return value;
    return formatCurrency(n);
  }
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
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

const CADENCE_MEETING_KEYS = [
  "daily_standup", "weekly_review", "qbr", "technical_sync",
  "steering_committee", "poc_cadence",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
function CadenceView({ cadence }: { cadence: Record<string, unknown> }) {
  const overview = cadence.overview as Record<string, string> | undefined;
  const escalation = cadence.escalation as Record<string, unknown> | undefined;
  const calendar = cadence.calendar as Record<string, unknown[]> | undefined;

  const meetings = CADENCE_MEETING_KEYS
    .filter((key) => cadence[key])
    .map((key) => ({ key, data: cadence[key] as Record<string, unknown> }));

  return (
    <div className="space-y-4">
      {overview && (
        <div className="rounded-md border p-3 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="h-3.5 w-3.5" />
            <span className="font-medium">Current Mode:</span>
            <Badge variant="outline" className="text-xs">
              {formatLabel(String(overview.current_mode || ""))}
            </Badge>
          </div>
          {overview.reason && (
            <p className="text-xs text-muted-foreground">{overview.reason}</p>
          )}
          <div className="flex gap-4 text-xs text-muted-foreground">
            {overview.current_cadence && (
              <span>Active: {formatLabel(overview.current_cadence)}</span>
            )}
            {overview.return_to_standard && (
              <span>Return to standard: {overview.return_to_standard}</span>
            )}
          </div>
        </div>
      )}

      {meetings.length > 0 && (
        <Accordion type="multiple" className="w-full">
          {meetings.map(({ key, data }) => {
            const name = String(data.name || formatLabel(key));
            const freq = String(data.frequency || "");
            const dur = String(data.duration || "");
            const time = data.time ? String(data.time) : undefined;
            const day = data.day ? String(data.day) : undefined;
            const fmt = data.format ? String(data.format) : undefined;
            const purpose = data.purpose ? String(data.purpose) : undefined;
            const status = data.status ? String(data.status) : undefined;
            const attendees = data.attendees as Record<string, any> | undefined;
            const agenda = data.agenda as (Record<string, any> | string)[] | undefined;
            const schedule = data.schedule as Record<string, string> | undefined;
            const nextMeeting = data.next_meeting ? String(data.next_meeting) : undefined;
            const milestoneReviews = data.milestone_reviews as Record<string, any>[] | undefined;
            const weeklyPocReview = data.weekly_poc_review as Record<string, any> | undefined;

            return (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <span>{name}</span>
                    {freq && (
                      <Badge variant="outline" className="text-[10px] font-normal">{freq}</Badge>
                    )}
                    {status && (
                      <Badge variant="outline" className="text-[10px] font-normal text-yellow-400 border-yellow-600/30">
                        {formatLabel(status)}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {dur && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {dur}
                        </span>
                      )}
                      {day && time ? <span>{day} {time}</span> : time ? <span>{time}</span> : null}
                      {fmt && <span className="capitalize">{fmt}</span>}
                    </div>

                    {purpose && (
                      <p className="text-xs text-muted-foreground">{purpose}</p>
                    )}

                    {attendees && (
                      <div className="space-y-1">
                        {Object.entries(attendees).map(([group, members]) => (
                          <div key={group}>
                            <span className="text-xs font-medium text-muted-foreground capitalize">{group}: </span>
                            <span className="text-xs text-muted-foreground">
                              {Array.isArray(members) ? (members as string[]).join(", ") : String(members)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {agenda && agenda.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Agenda</p>
                        <div className="space-y-0.5">
                          {agenda.map((entry, i) => {
                            if (typeof entry === "string") {
                              return (
                                <div key={i} className="text-xs text-muted-foreground flex gap-2">
                                  <span className="text-muted-foreground/50">{i + 1}.</span>
                                  <span>{entry}</span>
                                </div>
                              );
                            }
                            return (
                              <div key={i} className="text-xs text-muted-foreground flex justify-between gap-2">
                                <span>
                                  <span className="text-muted-foreground/50">{i + 1}.</span>{" "}
                                  {String(entry.item || "")}
                                </span>
                                {entry.duration && (
                                  <span className="text-muted-foreground/50 whitespace-nowrap">
                                    {entry.duration} min
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(schedule || nextMeeting) && (
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {schedule?.last && <span>Last: {schedule.last}</span>}
                        {schedule?.next && <span>Next: {schedule.next}</span>}
                        {nextMeeting && <span>Next: {nextMeeting}</span>}
                      </div>
                    )}

                    {milestoneReviews && milestoneReviews.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Milestones</p>
                        <div className="space-y-1">
                          {milestoneReviews.map((ms, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Milestone className="h-3 w-3" />
                              <span className="font-medium">{String(ms.milestone || "")}</span>
                              <span>{String(ms.date || "")}</span>
                              {ms.attendees && (
                                <span className="text-muted-foreground/50">({String(ms.attendees)})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {weeklyPocReview && (
                      <div className="border-l-2 border-muted pl-3 space-y-1">
                        <p className="text-xs font-medium">Weekly POC Review</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          {weeklyPocReview.day && <span>{String(weeklyPocReview.day)}</span>}
                          {weeklyPocReview.time && <span>{String(weeklyPocReview.time)}</span>}
                          {weeklyPocReview.duration && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {String(weeklyPocReview.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {escalation && (
        <div className="rounded-md border p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
            Escalation
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            {!!escalation.current_escalation_level && (
              <span>Level: {formatLabel(String(escalation.current_escalation_level))}</span>
            )}
            {!!escalation.escalation_owner && (
              <span>Owner: {String(escalation.escalation_owner)}</span>
            )}
            {!!escalation.check_in_frequency && (
              <span>Check-in: {formatLabel(String(escalation.check_in_frequency))}</span>
            )}
          </div>
          {!!escalation.escalation_criteria && (
            <div className="space-y-1">
              {Object.entries(escalation.escalation_criteria as Record<string, string[]>).map(
                ([level, criteria]) => (
                  <div key={level}>
                    <span className="text-xs font-medium capitalize">{level}: </span>
                    <span className="text-xs text-muted-foreground">{criteria.join("; ")}</span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}

      {calendar && (
        <div className="space-y-2">
          {Object.entries(calendar).map(([period, events]) => (
            <div key={period}>
              <p className="text-xs font-medium text-muted-foreground mb-1">{formatLabel(period)}</p>
              <div className="space-y-0.5">
                {Array.isArray(events) &&
                  events.map((ev: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="font-mono">{String(ev.date || "")}</span>
                      {ev.time && <span>{String(ev.time)}</span>}
                      <span>{String(ev.event || "")}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function MarketIntelCard({ data, badge }: { data: Record<string, unknown>; badge?: string }) {
  const meta = data.metadata as Record<string, unknown> | undefined;
  const execSummary = data.executive_summary as string | undefined;
  const compMoves = data.competitive_moves as Record<string, unknown>[] | undefined;
  const mktSignals = data.market_signals as Record<string, unknown>[] | undefined;
  const analystInsights = data.analyst_insights as Record<string, unknown>[] | undefined;
  const talkingPts = data.talking_points as string[] | undefined;
  const risksSurfaced = data.risks_surfaced as Record<string, unknown>[] | undefined;
  const urgencyColor: Record<string, string> = {
    THIS_WEEK: "bg-red-600/20 text-red-400 border-red-600/30",
    IMMEDIATE: "bg-red-600/20 text-red-400 border-red-600/30",
    NEXT_REVIEW: "bg-amber-600/20 text-amber-400 border-amber-600/30",
    MONITOR: "bg-slate-600/20 text-slate-400 border-slate-600/30",
  };
  const severityColor: Record<string, string> = {
    high: "bg-red-600/20 text-red-400 border-red-600/30",
    critical: "bg-red-600/20 text-red-400 border-red-600/30",
    medium: "bg-amber-600/20 text-amber-400 border-amber-600/30",
    low: "bg-slate-600/20 text-slate-400 border-slate-600/30",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Newspaper className="h-4 w-4" />
          Market Intelligence
          {meta && (
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              {String(meta.period_start || "")} &ndash; {String(meta.period_end || "")} &middot; {String(meta.sources_scanned || 0)} sources
            </span>
          )}
          {badge && <Badge variant="outline" className="text-xs ml-auto">{badge}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {execSummary && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm whitespace-pre-line">{execSummary.trim()}</p>
          </div>
        )}

        {compMoves && compMoves.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Competitive Moves
            </p>
            <Accordion type="multiple">
              {compMoves.map((m, i) => (
                <AccordionItem key={i} value={`comp-${i}`}>
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="truncate">{String(m.competitor)}: {String(m.news || "").slice(0, 80)}{String(m.news || "").length > 80 ? "..." : ""}</span>
                      {!!m.urgency && (
                        <Badge className={`text-[10px] shrink-0 border ${urgencyColor[String(m.urgency)] || "bg-muted text-muted-foreground"}`}>
                          {String(m.urgency).replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p className="text-sm">{String(m.news)}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {!!m.date && <span>{String(m.date)}</span>}
                      {!!m.source && <span>Source: {String(m.source)}</span>}
                      {!!m.confidence && <span>Confidence: {String(m.confidence)}</span>}
                    </div>
                    {!!m.our_response && (
                      <div className="p-2 rounded bg-muted/30 mt-1">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Our Response</p>
                        <p className="text-sm whitespace-pre-line">{String(m.our_response).trim()}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {mktSignals && mktSignals.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Market Signals
            </p>
            <div className="space-y-2">
              {mktSignals.map((s, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium">{String(s.signal)}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    {!!s.date && <span>{String(s.date)}</span>}
                    {!!s.source && <span>Source: {String(s.source)}</span>}
                  </div>
                  {!!s.detail && <p className="text-xs text-muted-foreground mt-1">{String(s.detail)}</p>}
                  {!!s.implication_for_deal && (
                    <p className="text-sm mt-2 whitespace-pre-line">{String(s.implication_for_deal).trim()}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {analystInsights && analystInsights.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Analyst Insights
            </p>
            <div className="space-y-2">
              {analystInsights.map((a, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{String(a.analyst)}</p>
                    {!!a.date && <span className="text-xs text-muted-foreground">{String(a.date)}</span>}
                  </div>
                  {!!a.report && <p className="text-xs text-muted-foreground italic">{String(a.report)}</p>}
                  {!!a.key_finding && <p className="text-sm mt-1">{String(a.key_finding)}</p>}
                  {!!a.our_positioning && (
                    <p className="text-xs text-primary/80 mt-1">Positioning: {String(a.our_positioning)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {talkingPts && talkingPts.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Talking Points
            </p>
            <ul className="space-y-1.5">
              {talkingPts.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5 shrink-0">&bull;</span>
                  <span>{String(pt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {risksSurfaced && risksSurfaced.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Risks Surfaced
            </p>
            <div className="space-y-2">
              {risksSurfaced.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium flex-1">{String(r.risk)}</p>
                    {!!r.severity && (
                      <Badge className={`text-[10px] border ${severityColor[String(r.severity)] || "bg-muted text-muted-foreground"}`}>
                        {String(r.severity)}
                      </Badge>
                    )}
                  </div>
                  {!!r.current_threat && <p className="text-xs text-muted-foreground mt-1">Threat: {String(r.current_threat)}</p>}
                  {!!r.recommended_mitigation && <p className="text-xs mt-1">Mitigation: {String(r.recommended_mitigation)}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
  const ourDiff = competitive.our_differentiation as string[] | undefined;
  const riskFactors = competitive.risk_factors as string[] | undefined;
  const pocCriteria = competitive.poc_success_criteria as string[] | undefined;
  const hasIncumbents = incumbents && Array.isArray(incumbents) && incumbents.length > 0;
  const hasThreats = threats && Array.isArray(threats) && threats.length > 0;
  const hasContent = hasIncumbents || hasThreats || ourDiff?.length || riskFactors?.length;
  if (!hasContent) return null;

  const threatColorMap: Record<string, string> = {
    critical: "bg-red-600/20 text-red-400 border-red-600/30",
    high: "bg-orange-600/20 text-orange-400 border-orange-600/30",
    medium: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
    low: "bg-green-600/20 text-green-400 border-green-600/30",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Competitive Landscape
          <HelpPopover title="Competitive landscape">
            Incumbent vendors, active threats, and our positioning for this
            engagement. Threat levels (critical/high/medium/low) indicate
            urgency of competitive response. Risk factors show churn signals.
            Our differentiation highlights the key messages for the account team.
            Continuously updated by the CI Agent.
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
            <p className="text-xs font-medium text-muted-foreground mb-2">Active Threats</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {threats.map((t, i) => {
                const obj = t as Record<string, unknown>;
                const tl = String(obj.threat_level || "").toLowerCase();
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
                        <Badge className={`text-xs ${threatColorMap[tl] || ""}`}>
                          {tl.toUpperCase()}
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
        {ourDiff && ourDiff.length > 0 && (
          <div>
            <p className="text-xs font-medium text-green-400/80 mb-1.5 flex items-center gap-1">
              <Target className="h-3 w-3" /> Our Differentiation
            </p>
            <ul className="space-y-0.5">
              {ourDiff.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-green-400/60 shrink-0 mt-0.5" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
        {riskFactors && riskFactors.length > 0 && (
          <div>
            <p className="text-xs font-medium text-red-400/80 mb-1.5 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Risk Factors
            </p>
            <ul className="space-y-0.5">
              {riskFactors.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-red-400/60 shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
        {pocCriteria && pocCriteria.length > 0 && (
          <div>
            <p className="text-xs font-medium text-blue-400/80 mb-1.5 flex items-center gap-1">
              <ClipboardList className="h-3 w-3" /> POC Success Criteria
            </p>
            <ul className="space-y-0.5">
              {pocCriteria.map((c, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <Gauge className="h-3 w-3 text-blue-400/60 shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const THREAT_COLORS: Record<string, string> = {
  critical: "bg-red-600/20 text-red-400 border-red-600/30",
  high: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  medium: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  low: "bg-green-600/20 text-green-400 border-green-600/30",
};

function CompetitiveIntelligencePanel({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as Record<string, unknown> | undefined;
  const battlecard = data.battlecard as Record<string, unknown> | undefined;
  const winThemes = data.win_themes as Record<string, unknown> | undefined;
  const actions = data.actions as Record<string, unknown> | undefined;
  const history = data.history as Record<string, unknown> | undefined;

  const knownCompetitorKeys = ["summary", "battlecard", "win_themes", "actions", "history", "node_id", "last_updated", "updated_by", "update_reason", "change_log"];
  const competitorEntries = Object.entries(data).filter(
    ([key]) => !knownCompetitorKeys.includes(key) && typeof data[key] === "object" && data[key] !== null
  );

  const ourAdvantages = battlecard?.our_advantages as Record<string, unknown>[] | undefined;
  const theirAdvantages = battlecard?.their_advantages as Record<string, unknown>[] | undefined;
  const messagingDo = battlecard?.messaging_do as string[] | undefined;
  const messagingDont = battlecard?.messaging_dont as string[] | undefined;
  const monitoringActions = actions?.monitoring as Record<string, unknown>[] | undefined;
  const responseActions = actions?.responses as Record<string, unknown>[] | undefined;
  const wins = history?.wins as Record<string, unknown>[] | undefined;
  const losses = history?.losses as Record<string, unknown>[] | undefined;
  const lessons = history?.lessons as Record<string, unknown>[] | undefined;
  const primaryWinTheme = winThemes?.primary as Record<string, unknown> | undefined;
  const secondaryWinThemes = winThemes?.secondary as Record<string, unknown>[] | undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Competitive Intelligence
          <HelpPopover title="Competitive intelligence">
            Detailed competitive analysis managed by the CI Agent. Includes
            threat assessments, battlecard with positioning guidance, win themes,
            and active CI actions. Updated continuously from field intelligence,
            market monitoring, and knowledge vault insights.
          </HelpPopover>
          <Badge variant="outline" className="text-xs ml-auto">CI Agent</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {summary && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={THREAT_COLORS[String(summary.threat_level)] || "bg-muted text-muted-foreground"}>
                {String(summary.threat_level).toUpperCase()} THREAT
              </Badge>
              {!!summary.primary_competitor && (
                <span className="text-sm text-muted-foreground">vs. <span className="font-medium text-foreground">{String(summary.primary_competitor)}</span></span>
              )}
              {!!summary.win_probability && (
                <Badge variant="outline" className="text-xs ml-auto">Win prob: {String(summary.win_probability)}</Badge>
              )}
            </div>
            {!!summary.headline && (
              <p className="text-sm text-muted-foreground leading-relaxed">{String(summary.headline).trim()}</p>
            )}
            {!!summary.key_battleground && (
              <p className="text-xs text-muted-foreground">Battleground: <span className="text-foreground font-medium">{String(summary.key_battleground)}</span></p>
            )}
          </div>
        )}

        {competitorEntries.length > 0 && (
          <Accordion type="single" collapsible>
            {competitorEntries.map(([key, val]) => {
              const comp = val as Record<string, unknown>;
              const strengths = comp.strengths as string[] | undefined;
              const weaknesses = comp.weaknesses as string[] | undefined;
              const counterStrategy = comp.our_counter_strategy as Record<string, unknown>[] | undefined;
              const activity = comp.competitive_activity as Record<string, unknown>[] | undefined;
              const footprint = comp.current_footprint as Record<string, unknown> | undefined;
              const threatLevel = String(comp.threat_level || "");
              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{key.replace(/_/g, " ")}</span>
                      {threatLevel && (
                        <Badge className={`text-[10px] px-1.5 py-0 ${THREAT_COLORS[threatLevel] || ""}`}>
                          {threatLevel}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {footprint && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Current Footprint</p>
                        {Array.isArray(footprint.products) && (footprint.products as Record<string, unknown>[]).map((prod, i) => (
                          <div key={i} className="text-xs space-y-0.5 p-2 rounded bg-muted/20 mb-1">
                            {!!prod.product && <p className="font-medium">{String(prod.product)}</p>}
                            <div className="flex flex-wrap gap-x-3 text-muted-foreground">
                              {!!prod.coverage && <span>{String(prod.coverage)}</span>}
                              {!!prod.data_volume && <span>{String(prod.data_volume)}</span>}
                              {!!prod.annual_spend && <span>{String(prod.annual_spend)}</span>}
                              {!!prod.contract_remaining && <span>Contract: {String(prod.contract_remaining)}</span>}
                            </div>
                          </div>
                        ))}
                        {Array.isArray(footprint.key_facts) && (
                          <ul className="mt-2 space-y-0.5">
                            {(footprint.key_facts as string[]).map((fact, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <Lightbulb className="h-3 w-3 text-yellow-400 shrink-0 mt-0.5" />
                                {String(fact)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {activity && activity.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Recent Activity</p>
                        <div className="space-y-1.5">
                          {activity.map((a, i) => (
                            <div key={i} className="text-xs p-2 rounded bg-muted/20 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{String(a.intelligence || "")}</span>
                                {!!a.date && <span className="text-muted-foreground shrink-0 ml-2">{String(a.date)}</span>}
                              </div>
                              <div className="flex gap-3 text-muted-foreground">
                                {!!a.source && <span>Source: {String(a.source)}</span>}
                                {!!a.confidence && <span>Confidence: {String(a.confidence)}</span>}
                              </div>
                              {!!a.action_taken && <p className="text-green-400/80">Action: {String(a.action_taken)}</p>}
                              {!!a.threat_assessment && <p className="text-yellow-400/80">{String(a.threat_assessment)}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {strengths && strengths.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-red-400/80 mb-1">Their Strengths</p>
                          <ul className="space-y-0.5">
                            {strengths.map((s, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <AlertTriangle className="h-3 w-3 text-red-400/60 shrink-0 mt-0.5" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {weaknesses && weaknesses.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-green-400/80 mb-1">Their Weaknesses</p>
                          <ul className="space-y-0.5">
                            {weaknesses.map((w, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <Target className="h-3 w-3 text-green-400/60 shrink-0 mt-0.5" />
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {counterStrategy && counterStrategy.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Our Counter Strategy</p>
                        <div className="space-y-1.5">
                          {counterStrategy.map((cs, i) => (
                            <div key={i} className="text-xs p-2 rounded bg-muted/20">
                              <p className="font-medium">{String(cs.strategy || "")}</p>
                              <p className="text-muted-foreground">{String(cs.message || "")}</p>
                              {!!cs.evidence && <p className="text-green-400/80 mt-0.5">{String(cs.evidence)}</p>}
                              {!!cs.tactic && <p className="text-blue-400/80 mt-0.5">{String(cs.tactic)}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        {battlecard && (ourAdvantages || theirAdvantages) && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Battlecard</p>
            {ourAdvantages && ourAdvantages.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-400/80 mb-1.5">Our Advantages</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ourAdvantages.map((a, i) => (
                    <div key={i} className="text-xs p-2.5 rounded bg-green-600/5 border border-green-600/10 space-y-1">
                      <p className="font-medium">{String(a.advantage || "")}</p>
                      <p className="text-muted-foreground">{String(a.description || "")}</p>
                      {!!a.proof_point && <p className="text-green-400/80">Proof: {String(a.proof_point)}</p>}
                      {!!a.competitive_gap && <p className="text-yellow-400/80">Gap: {String(a.competitive_gap)}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {theirAdvantages && theirAdvantages.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-400/80 mb-1.5">Their Advantages & Our Counters</p>
                <div className="space-y-1.5">
                  {theirAdvantages.map((a, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-red-600/5 border border-red-600/10 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{String(a.advantage || "")}</p>
                        <p className="text-muted-foreground">{String(a.description || "")}</p>
                      </div>
                      {!!a.our_counter && (
                        <p className="text-green-400/80 shrink-0 text-right max-w-[50%]">{String(a.our_counter)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(messagingDo || messagingDont) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {messagingDo && messagingDo.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-400/80 mb-1.5 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Messaging Do</p>
                <ul className="space-y-0.5">
                  {messagingDo.map((m, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {messagingDont && messagingDont.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-400/80 mb-1.5 flex items-center gap-1"><Ban className="h-3 w-3" /> Messaging Don&apos;t</p>
                <ul className="space-y-0.5">
                  {messagingDont.map((m, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {winThemes && (primaryWinTheme || secondaryWinThemes) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Win Themes</p>
            {primaryWinTheme && (
              <div className="p-2.5 rounded bg-blue-600/5 border border-blue-600/10">
                <p className="text-xs font-medium">{String(primaryWinTheme.theme || "")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{String(primaryWinTheme.message || "").trim()}</p>
                {Array.isArray(primaryWinTheme.resonates_with) && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {(primaryWinTheme.resonates_with as string[]).map((name, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">{name}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
            {secondaryWinThemes && secondaryWinThemes.map((wt, i) => (
              <div key={i} className="p-2 rounded bg-muted/20 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{String(wt.theme || "")}</span>
                  {Array.isArray(wt.resonates_with) && (
                    <div className="flex gap-1">
                      {(wt.resonates_with as string[]).map((name, j) => (
                        <Badge key={j} variant="outline" className="text-[10px] px-1.5 py-0">{name}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground mt-0.5">{String(wt.message || "")}</p>
              </div>
            ))}
          </div>
        )}

        {actions && (monitoringActions || responseActions) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">CI Actions</p>
            {responseActions && responseActions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Response Actions</p>
                <div className="space-y-1">
                  {responseActions.map((a, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-muted/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${String(a.status) === "completed" ? "bg-green-400" : String(a.status) === "in_progress" ? "bg-yellow-400" : "bg-muted-foreground"}`} />
                        <span>{String(a.action || "")}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground shrink-0 ml-2">
                        {!!a.owner && <span>{String(a.owner)}</span>}
                        {!!a.due_date && <span>{String(a.due_date)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {monitoringActions && monitoringActions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Monitoring</p>
                <div className="space-y-1">
                  {monitoringActions.map((a, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-muted/20 flex items-center justify-between">
                      <span>{String(a.action || "")}</span>
                      <div className="flex items-center gap-3 text-muted-foreground shrink-0 ml-2">
                        {!!a.owner && <span>{String(a.owner)}</span>}
                        {!!a.frequency && <span>{String(a.frequency)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {history && (wins?.length || losses?.length || lessons?.length) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Competitive History</p>
            {wins && wins.length > 0 && wins.map((w, i) => (
              <div key={`w${i}`} className="text-xs p-2 rounded bg-green-600/5 border border-green-600/10">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-400">WIN vs. {String(w.competitor || "")}</span>
                  <span className="text-muted-foreground">{String(w.date || "")}</span>
                </div>
                {!!w.win_reason && <p className="text-muted-foreground mt-0.5">{String(w.win_reason)}</p>}
                {!!w.deal_size && <p className="text-muted-foreground">{String(w.deal_size)}</p>}
              </div>
            ))}
            {losses && losses.length > 0 && losses.map((l, i) => (
              <div key={`l${i}`} className="text-xs p-2 rounded bg-red-600/5 border border-red-600/10">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-red-400">{!!(l as Record<string, unknown>).competitor ? `LOSS vs. ${String((l as Record<string, unknown>).competitor)}` : String((l as Record<string, unknown>).event || "Event")}</span>
                  <span className="text-muted-foreground">{String((l as Record<string, unknown>).date || "")}</span>
                </div>
                {!!(l as Record<string, unknown>).loss_reason && <p className="text-muted-foreground mt-0.5">{String((l as Record<string, unknown>).loss_reason)}</p>}
                {!!(l as Record<string, unknown>).impact && <p className="text-muted-foreground mt-0.5">{String((l as Record<string, unknown>).impact)}</p>}
                {!!(l as Record<string, unknown>).lesson && <p className="text-yellow-400/80 mt-0.5">Lesson: {String((l as Record<string, unknown>).lesson)}</p>}
              </div>
            ))}
            {lessons && lessons.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Lessons Learned</p>
                {lessons.map((le, i) => (
                  <div key={i} className="text-xs p-2 rounded bg-muted/20 mb-1">
                    <p className="font-medium">{String(le.lesson || "")}</p>
                    <p className="text-muted-foreground">Applied: {String(le.application || "")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!!data.last_updated && (
          <p className="text-[10px] text-muted-foreground pt-2 border-t border-border">
            Last updated: {String(data.last_updated)} by {String(data.updated_by || "system")}
            {!!data.update_reason && <> &middot; {String(data.update_reason)}</>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function NarrativeBanner({
  background,
  purpose,
  businessCase,
  commercial,
}: {
  background?: string;
  purpose?: string;
  businessCase?: Record<string, unknown>;
  commercial?: Record<string, unknown>;
}) {
  const text = background || purpose;
  if (!text) return null;

  const hasHighlights = commercial?.opportunity_arr != null ||
    !!businessCase?.projected_savings || !!businessCase?.roi_target || !!businessCase?.payback_period;

  return (
    <Card className="bg-primary/5 border-primary/10">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <BookOpen className="h-4 w-4 text-primary/60 shrink-0 mt-0.5" />
          <div className="space-y-2 min-w-0">
            <p className="text-sm leading-relaxed whitespace-pre-line">{text}</p>
            {background && purpose && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Purpose:</span> {purpose}
              </p>
            )}
            {hasHighlights && (
              <div className="flex flex-wrap gap-x-5 gap-y-1 pt-2 border-t border-primary/10">
                {commercial?.opportunity_arr != null && (
                  <span className="text-xs">
                    <span className="text-muted-foreground">ARR:</span>{" "}
                    <span className="font-medium">{formatCurrency(Number(commercial.opportunity_arr))}</span>
                  </span>
                )}
                {!!businessCase?.projected_savings && (
                  <span className="text-xs">
                    <span className="text-muted-foreground">Savings:</span>{" "}
                    <span className="font-medium">{String(businessCase.projected_savings)}</span>
                  </span>
                )}
                {!!businessCase?.roi_target && (
                  <span className="text-xs">
                    <span className="text-muted-foreground">ROI:</span>{" "}
                    <span className="font-medium">{String(businessCase.roi_target)}</span>
                  </span>
                )}
                {!!businessCase?.payback_period && (
                  <span className="text-xs">
                    <span className="text-muted-foreground">Payback:</span>{" "}
                    <span className="font-medium">{String(businessCase.payback_period)}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KeyMetricsStrip({
  commercial,
  healthScore,
  businessCase,
  currentPhase,
  targetCompletion,
}: {
  commercial?: Record<string, unknown>;
  healthScore?: HealthScore;
  businessCase?: Record<string, unknown>;
  currentPhase?: string;
  targetCompletion?: string;
}) {
  const metrics: { label: string; value: string; color?: string; help: string }[] = [];

  if (commercial?.opportunity_arr != null) {
    const raw = Number(commercial.opportunity_arr);
    metrics.push({
      label: "Opportunity ARR",
      value: isNaN(raw) ? String(commercial.opportunity_arr) : formatCurrency(raw),
      help: "Annual recurring revenue potential for this engagement. Sourced from CRM data.",
    });
  }
  if (commercial?.probability != null) {
    metrics.push({
      label: "Probability",
      value: `${commercial.probability}%`,
      help: "Estimated win probability based on deal qualification and stage progression.",
    });
  }
  if (commercial?.stage != null) {
    metrics.push({
      label: "Stage",
      value: formatLabel(String(commercial.stage)),
      help: "Current sales stage in the pursuit lifecycle (e.g. qualification, proposal, negotiation).",
    });
  }
  if (healthScore?.health_score) {
    const hs = healthScore.health_score;
    const score = hs.current;
    const color = score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
    const trend = hs.trend === "improving" ? " +" : hs.trend === "declining" ? " -" : "";
    metrics.push({
      label: "Health",
      value: `${score}/100${trend}`,
      color,
      help: "Composite health score (0-100) combining engagement, delivery, risk, and commercial signals. +/- indicates trend direction.",
    });
  }
  if (businessCase?.projected_savings) {
    metrics.push({
      label: "Projected Savings",
      value: String(businessCase.projected_savings),
      help: "Estimated cost savings from the proposed solution, used in business case justification.",
    });
  }
  if (targetCompletion) {
    metrics.push({
      label: "Target Close",
      value: new Date(targetCompletion).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      help: "Target completion date for this engagement. Drives milestone planning and resource allocation.",
    });
  }
  if (currentPhase) {
    metrics.push({
      label: "Current Phase",
      value: currentPhase,
      help: "Active phase from the node's blueprint lifecycle (e.g. discovery, validation, execution).",
    });
  } else if (commercial?.next_milestone) {
    metrics.push({
      label: "Next Milestone",
      value: String(commercial.next_milestone),
      help: "Upcoming milestone event that requires preparation or action from the account team.",
    });
  }

  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {m.label}
            <HelpPopover title={m.label}>{m.help}</HelpPopover>
          </p>
          <p className={`text-lg font-bold mt-0.5 ${m.color || ""}`}>{m.value}</p>
        </div>
      ))}
    </div>
  );
}

function StrategicDriversSection({ drivers }: { drivers?: Record<string, unknown>[] }) {
  if (!drivers || drivers.length === 0) return null;

  const urgencyBorder: Record<string, string> = {
    critical: "border-l-red-500",
    high: "border-l-amber-500",
    medium: "border-l-yellow-500",
    low: "border-l-gray-500",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Strategic Drivers
          <HelpPopover title="Strategic drivers">
            The business imperatives behind this engagement. Each driver explains
            a specific reason this initiative exists, its urgency, and timeline.
            Sourced from discovery conversations and business case analysis.
          </HelpPopover>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {drivers.map((d, i) => {
          const urgency = String(d.urgency || "medium").toLowerCase();
          return (
            <div key={i} className={`border-l-2 ${urgencyBorder[urgency] || "border-l-gray-500"} pl-3 py-1`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{String(d.driver || "")}</span>
                <SeverityBadge severity={urgency} />
                {!!d.board_mandate && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Board Mandate</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{String(d.description || "")}</p>
              {!!(d.cost_justification || d.timeline) && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {!!d.cost_justification && <>{String(d.cost_justification)}</>}
                  {!!(d.cost_justification && d.timeline) && <> &middot; </>}
                  {!!d.timeline && <>Timeline: {String(d.timeline)}</>}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ExecutiveQuotesSection({ statements }: { statements?: Record<string, unknown>[] }) {
  if (!statements || statements.length === 0) return null;

  const visible = statements.slice(0, 4);

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Key Stakeholder Voices
        <HelpPopover title="Stakeholder voices">
          Direct quotes from key stakeholders captured during meetings and
          conversations. Each includes context and strategic implication
          for the engagement team.
        </HelpPopover>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visible.map((s, i) => (
          <div key={i} className="border-l-2 border-primary/30 pl-3 py-2">
            <p className="text-sm italic leading-relaxed">&ldquo;{String(s.quote || "")}&rdquo;</p>
            <p className="text-xs text-muted-foreground mt-1.5">
              {String(s.stakeholder || "")}
              {!!s.date && <> &middot; {String(s.date)}</>}
            </p>
            {!!s.implication && (
              <p className="text-xs text-primary/70 mt-1 flex items-start gap-1">
                <Lightbulb className="h-3 w-3 shrink-0 mt-0.5" />
                {String(s.implication)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineIndicator({
  phases,
  milestones,
}: {
  phases?: Record<string, unknown>[];
  milestones?: Record<string, unknown>[];
}) {
  if (!phases || phases.length === 0) return null;

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
      case "in_progress": return <Clock className="h-3.5 w-3.5 text-primary shrink-0" />;
      default: return <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "completed": return "text-emerald-400";
      case "in_progress": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  const formatDate = (d: unknown) => {
    if (!d) return "";
    const s = String(d);
    try {
      return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch { return s.slice(5); }
  };

  const upcoming = milestones?.filter(
    (m) => {
      const s = String(m.status || "").toLowerCase();
      return s === "pending" || s === "planned";
    }
  ).slice(0, 4);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GitCommitVertical className="h-4 w-4" />
          Engagement Timeline
          <HelpPopover title="Timeline & milestones">
            Engagement lifecycle phases and upcoming milestones. Blocking
            milestones require customer decisions before the engagement can
            progress. Phase status is updated automatically by governance agents.
          </HelpPopover>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          {phases.map((p, i) => {
            const status = String(p.status || "planned").toLowerCase();
            return (
              <div key={i} className="flex items-center gap-2.5">
                {statusIcon(status)}
                <span className={`text-xs font-medium flex-1 ${statusLabel(status)}`}>
                  {String(p.phase || "")}
                </span>
                <span className="text-[11px] text-muted-foreground/60 tabular-nums shrink-0">
                  {formatDate(p.start)} – {formatDate(p.end)}
                </span>
              </div>
            );
          })}
        </div>

        {upcoming && upcoming.length > 0 && (
          <div className="border-t border-border/50 pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Upcoming Milestones</p>
            <div className="space-y-2">
              {upcoming.map((m, i) => {
                const blocking = !!m.blocking;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    {blocking ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <Milestone className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${blocking ? "text-red-400" : ""}`}>
                          {String(m.milestone || "")}
                        </span>
                        {blocking && (
                          <Badge className="text-[10px] px-1 py-0 bg-red-600/20 text-red-400 border-red-600/30">
                            BLOCKING
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground/60">
                        {formatDate(m.date)}
                        {!!m.owner && <> &middot; {String(m.owner)}</>}
                      </p>
                    </div>
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

function BusinessCaseSection({ businessCase }: { businessCase?: Record<string, unknown> }) {
  if (!businessCase) return null;
  const entries: { label: string; value: string }[] = [];
  if (businessCase.current_spend) entries.push({ label: "Current Spend", value: String(businessCase.current_spend) });
  if (businessCase.proposed_spend) entries.push({ label: "Proposed Spend", value: String(businessCase.proposed_spend) });
  if (businessCase.projected_savings) entries.push({ label: "Projected Savings", value: String(businessCase.projected_savings) });
  if (businessCase.roi_target) entries.push({ label: "ROI Target", value: String(businessCase.roi_target) });
  if (businessCase.payback_period) entries.push({ label: "Payback", value: String(businessCase.payback_period) });
  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Business Case
          <HelpPopover title="Business case">
            Financial justification for this engagement, including current
            spend, proposed solution cost, and projected savings. Sourced
            from value engineering analysis and CRM data.
          </HelpPopover>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {entries.map((e) => (
          <div key={e.label} className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-muted-foreground">{e.label}</span>
            <span className="text-sm font-medium text-right">{e.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ScenarioTab({ node, realmId, nodeId }: { node: Node; realmId: string; nodeId: string }) {
  const { data: infoHub, isLoading } = useQuery<Record<string, any>>({
    queryKey: ["internal-infohub", realmId, nodeId],
    queryFn: () => api.getInternalInfoHub(realmId, nodeId),
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading scenario...</p>;

  const nodeOverview = (infoHub?.context as any)?.node_overview as Record<string, any> | undefined;
  const businessCtx = nodeOverview?.business_context as Record<string, any> | undefined;
  const timeline = nodeOverview?.timeline as Record<string, any> | undefined;
  const milestones = timeline?.key_milestones as Record<string, unknown>[] | undefined;
  const keyInsights = nodeOverview?.key_insights as Record<string, any> | undefined;
  const execStatements = keyInsights?.executive_statements as Record<string, unknown>[] | undefined;
  const lossInsights = keyInsights?.loss_insights as Record<string, unknown>[] | undefined;
  const commercial = node.commercial as Record<string, any> | undefined;
  const successCriteria = nodeOverview?.success_criteria as Record<string, any> | undefined;
  const businessCase = businessCtx?.business_case_summary as Record<string, unknown> | undefined;

  const isLost = String(commercial?.stage || "").toLowerCase().includes("lost") ||
                 String(node.status || "").toLowerCase() === "cancelled";

  const hasContent = businessCtx?.background || milestones?.length || execStatements?.length;
  if (!hasContent) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          No scenario data available yet. The engagement narrative will be assembled
          automatically as meetings, decisions, and agent analyses accumulate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Engagement Scenario
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          A narrative walkthrough of this engagement: what happened, the key decisions, and lessons
          learned. Use this to understand the full context before diving into detailed tabs.
        </p>
      </div>

      {/* The Story */}
      {!!businessCtx?.background && (
        <section className="space-y-2">
          <h3 className="text-base font-semibold">The Story</h3>
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-3">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {String(businessCtx.background)}
            </p>
            {(commercial?.opportunity_arr != null || !!businessCase?.projected_savings || !!businessCase?.roi_target || !!businessCase?.payback_period) && (
              <div className="flex flex-wrap gap-x-5 gap-y-1 pt-2 border-t border-primary/10">
                {commercial?.opportunity_arr != null && (
                  <span className="text-xs">
                    <span className="text-muted-foreground">ARR Opportunity:</span>{" "}
                    <span className="font-medium">{formatCurrency(Number(commercial.opportunity_arr))}</span>
                  </span>
                )}
                {!!businessCase?.projected_savings && (
                  <span className="text-xs">
                    <span className="text-muted-foreground">Projected Savings:</span>{" "}
                    <span className="font-medium">{String(businessCase.projected_savings)}</span>
                  </span>
                )}
                {!!businessCase?.roi_target && (
                  <span className="text-xs">
                    <span className="text-muted-foreground">ROI Target:</span>{" "}
                    <span className="font-medium">{String(businessCase.roi_target)}</span>
                  </span>
                )}
                {!!businessCase?.payback_period && (
                  <span className="text-xs">
                    <span className="text-muted-foreground">Payback:</span>{" "}
                    <span className="font-medium">{String(businessCase.payback_period)}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Deal Progression / Timeline */}
      {milestones && milestones.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold">Deal Progression</h3>
          <div className="relative pl-4 border-l-2 border-border space-y-3">
            {milestones.map((m, i) => {
              const isBlocking = !!m.blocking;
              const impactLevel = String(m.impact || "").toLowerCase();
              const isCritical = impactLevel === "critical" || isBlocking;
              const outcome = m.outcome ? String(m.outcome) : null;

              return (
                <div key={i} className="relative">
                  <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                    isCritical ? "bg-red-500 border-red-400" :
                    String(m.status) === "completed" ? "bg-emerald-500 border-emerald-400" :
                    "bg-muted border-border"
                  }`} />
                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm font-mono font-medium shrink-0 ${isCritical ? "text-red-400" : "text-muted-foreground"}`}>
                      {String(m.date || "")}
                    </span>
                    <span className={`text-sm ${isCritical ? "text-red-400 font-medium" : ""}`}>
                      {String(m.milestone || "")}
                    </span>
                  </div>
                  {outcome && (
                    <p className="text-xs text-muted-foreground mt-0.5 ml-[5.5rem]">{outcome}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Key Stakeholder Moments */}
      {execStatements && execStatements.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold">Key Moments</h3>
          <p className="text-sm text-muted-foreground">
            Direct stakeholder quotes that shaped the engagement trajectory.
          </p>
          <div className="space-y-3">
            {execStatements.map((s, i) => (
              <div key={i} className="border-l-2 border-primary/30 pl-3 py-1">
                <p className="text-sm italic">&ldquo;{String(s.quote || "")}&rdquo;</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{String(s.stakeholder || "")}</span>
                  {!!s.date && <>&middot; {String(s.date)}</>}
                  {!!s.context && <>&middot; {String(s.context)}</>}
                </div>
                {!!s.implication && (
                  <p className="text-xs text-primary/70 mt-1 flex items-start gap-1">
                    <Lightbulb className="h-3 w-3 shrink-0 mt-0.5" />
                    {String(s.implication)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* POC / Success Criteria */}
      {successCriteria?.poc_criteria && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold">Success Criteria</h3>
          {(() => {
            const techCriteria = successCriteria.poc_criteria.technical as Record<string, unknown>[] | undefined;
            const bizCriteria = successCriteria.poc_criteria.business as Record<string, unknown>[] | undefined;
            const allCriteria = [...(techCriteria || []), ...(bizCriteria || [])];
            if (allCriteria.length === 0) return null;

            const statusIcon = (status: string) => {
              switch (status) {
                case "met": return <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />;
                case "partially_met": return <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />;
                case "not_met": return <Ban className="h-3.5 w-3.5 text-red-400 shrink-0" />;
                default: return <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
              }
            };

            return (
              <div className="space-y-1.5">
                {allCriteria.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    {statusIcon(String(c.status || ""))}
                    <div className="min-w-0">
                      <span>{String(c.criterion || "")}</span>
                      {!!c.notes && (
                        <span className="text-xs text-muted-foreground ml-1">({String(c.notes)})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      )}

      {/* Outcome + Loss Analysis */}
      {isLost && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-red-400">Outcome: Deal Lost</h3>
          {!!commercial?.loss_reason && (
            <p className="text-sm">{String(commercial.loss_reason)}</p>
          )}
          {!!commercial?.competitor_won && (
            <p className="text-sm text-muted-foreground">
              Won by: <span className="text-foreground font-medium">{String(commercial.competitor_won)}</span>
            </p>
          )}
        </section>
      )}

      {/* Key Lessons */}
      {lossInsights && lossInsights.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold">Key Lessons</h3>
          <div className="space-y-2">
            {lossInsights.map((ins, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-3 text-sm">
                <p className="font-medium">{String(ins.insight || "")}</p>
                {!!ins.action && (
                  <p className="text-xs text-muted-foreground mt-1">Action: {String(ins.action)}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Strategic Drivers quick reference */}
      {businessCtx?.strategic_drivers && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold">Why This Mattered</h3>
          <div className="space-y-2">
            {(businessCtx.strategic_drivers as Record<string, unknown>[]).map((d, i) => (
              <div key={i} className="flex items-baseline gap-2 text-sm">
                <SeverityBadge severity={String(d.urgency || "medium").toLowerCase()} />
                <span className="font-medium">{String(d.driver || "")}</span>
                <span className="text-muted-foreground">{String(d.description || "")}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="border-t border-border pt-4 text-xs text-muted-foreground">
        This scenario is auto-assembled from meeting notes, agent analyses, and CRM data.
        For raw source material, see the Internal InfoHub tab.
      </div>
    </div>
  );
}

function OverviewTab({ node, realmId, nodeId }: { node: Node; realmId: string; nodeId: string }) {
  const { data: valueData, isLoading: valueLoading } = useQuery({
    queryKey: ["value", realmId, nodeId],
    queryFn: () => api.getValue(realmId, nodeId),
  });

  const { data: infoHub } = useQuery<Record<string, any>>({
    queryKey: ["internal-infohub", realmId, nodeId],
    queryFn: () => api.getInternalInfoHub(realmId, nodeId),
  });

  const { data: healthData } = useQuery<HealthScore>({
    queryKey: ["health", realmId, nodeId],
    queryFn: () => api.getHealth(realmId, nodeId),
  });

  const nodeOverview = (infoHub?.context as any)?.node_overview as Record<string, any> | undefined;
  const businessContext = nodeOverview?.business_context as Record<string, any> | undefined;
  const timelineData = nodeOverview?.timeline as Record<string, any> | undefined;
  const keyInsights = nodeOverview?.key_insights as Record<string, any> | undefined;
  const businessCase = businessContext?.business_case_summary as Record<string, unknown> | undefined;

  const phases = timelineData?.phases as Record<string, unknown>[] | undefined;
  const currentPhase = phases?.find(
    (p) => String(p.status || "").toLowerCase() === "in_progress"
  );

  const stakeholders = Array.isArray(node.stakeholders) ? node.stakeholders : [];
  const showMoreStakeholders = stakeholders.length > 4;
  const visibleStakeholders = stakeholders.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Row 1: Narrative + Strategic Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NarrativeBanner
          background={businessContext?.background ? String(businessContext.background) : undefined}
          purpose={node.purpose}
          businessCase={businessCase}
          commercial={node.commercial as Record<string, unknown> | undefined}
        />

        {businessContext?.strategic_drivers && (
          <StrategicDriversSection
            drivers={businessContext.strategic_drivers as Record<string, unknown>[]}
          />
        )}
      </div>

      {/* Row 2: Timeline + Business Case */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {timelineData && (
          <TimelineIndicator
            phases={phases}
            milestones={timelineData.key_milestones as Record<string, unknown>[] | undefined}
          />
        )}

        {businessCase && <BusinessCaseSection businessCase={businessCase} />}
      </div>

      {/* Row 3: Key Metrics */}
      <KeyMetricsStrip
        commercial={node.commercial as Record<string, unknown> | undefined}
        healthScore={healthData}
        businessCase={businessCase}
        currentPhase={currentPhase ? String(currentPhase.phase || "") : undefined}
        targetCompletion={node.target_completion as string | undefined}
      />

      {/* Remaining sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {keyInsights?.executive_statements && (
          <ExecutiveQuotesSection
            statements={keyInsights.executive_statements as Record<string, unknown>[]}
          />
        )}

        {node.competitive && Object.keys(node.competitive).length > 0 && (
          <CompetitiveLandscape competitive={node.competitive} />
        )}

        {visibleStakeholders.length > 0 && (
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
            <div className="grid grid-cols-2 gap-3">
              {visibleStakeholders.map((s, i) => (
                <StakeholderCard key={i} stakeholder={s} />
              ))}
            </div>
            {showMoreStakeholders && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing 4 of {stakeholders.length} stakeholders. See Stakeholders tab for full details.
              </p>
            )}
          </div>
        )}
      </div>

      {valueData && !valueLoading && (
        <ValueTrackerSection data={valueData} />
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// -- Blueprint Tab --

const PLAYBOOK_STATUSES = ["pending", "active", "in_progress", "completed", "skipped", "not_triggered"];

function BlueprintTab({ realmId, nodeId }: { realmId: string; nodeId: string }) {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addPhase, setAddPhase] = useState("discovery");
  const [addReason, setAddReason] = useState("");
  const [selectedAdd, setSelectedAdd] = useState<{ id: string; name: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [selectedCanvas, setSelectedCanvas] = useState<string | null>(null);

  const { data: blueprint, isLoading, error } = useQuery({
    queryKey: ["blueprint", realmId, nodeId],
    queryFn: () => api.getBlueprint(realmId, nodeId),
  });

  const { data: playbookIndex } = useQuery({
    queryKey: ["playbookIndex"],
    queryFn: () => api.getPlaybookIndex(),
  });

  const { data: changelog } = useQuery({
    queryKey: ["blueprintChangelog", realmId, nodeId],
    queryFn: () => api.getBlueprintChangelog(realmId, nodeId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["blueprint", realmId, nodeId] });
    queryClient.invalidateQueries({ queryKey: ["blueprintChangelog", realmId, nodeId] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ playbookId, status }: { playbookId: string; status: string }) =>
      api.updatePlaybookStatus(realmId, nodeId, playbookId, status),
    onSuccess: invalidate,
  });

  const addMutation = useMutation({
    mutationFn: (pb: { playbook_id: string; name: string; phase: string; reason: string }) =>
      api.addBlueprintPlaybook(realmId, nodeId, pb),
    onSuccess: () => { invalidate(); setShowAddDialog(false); setSelectedAdd(null); setAddReason(""); },
  });

  const removeMutation = useMutation({
    mutationFn: ({ playbookId, reason }: { playbookId: string; reason: string }) =>
      api.removeBlueprintPlaybook(realmId, nodeId, playbookId, reason),
    onSuccess: () => { invalidate(); setRemoveTarget(null); setRemoveReason(""); },
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
  const blockedPlaybooks = playbooksObj?.blocked as Record<string, unknown>[] | undefined;
  const templateOnly = canvasesObj?.template_only as boolean | undefined;
  const customAllowed = canvasesObj?.custom_allowed as boolean | undefined;
  const maxPlaybooks = governance?.max_playbooks as number | undefined;
  const durationLimit = timeline?.duration_limit_weeks as number | undefined;
  const hasContent = playbookList?.length || checklists || successCriteria || canvasList || signals || governance || track;

  const existingPbIds = new Set(
    (playbookList || []).map((pb) => String(pb.playbook_id || pb.id || "")).filter(Boolean),
  );
  const blockedPbIds = new Set(
    (blockedPlaybooks || []).map((pb) => String(pb.playbook_id || pb.id || "")).filter(Boolean),
  );
  const availablePlaybooks = playbookIndex
    ? Object.entries(playbookIndex)
        .filter(([id]) => !existingPbIds.has(id) && !blockedPbIds.has(id))
        .filter(([id, info]) => {
          if (!addSearch.trim()) return true;
          const q = addSearch.toLowerCase();
          return id.toLowerCase().includes(q) || info.name.toLowerCase().includes(q) || info.team.toLowerCase().includes(q);
        })
    : [];

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

      {track && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Track Policy: {formatLabel(track)}
              <HelpPopover title="Engagement track policy">
                Track policies define the guardrails for this engagement tier:
                playbook limits, blocked playbooks, canvas depth, and duration
                constraints. These are set by the track (not the archetype).
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold">{maxPlaybooks ? maxPlaybooks : "\u221E"}</p>
                <p className="text-xs text-muted-foreground">Max Playbooks</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold">{durationLimit ? `${durationLimit}w` : "\u2014"}</p>
                <p className="text-xs text-muted-foreground">Duration Limit</p>
              </div>
              {!!(governance?.sla) && (
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold">{String((governance.sla as Record<string, unknown>).response_time_hours)}h</p>
                  <p className="text-xs text-muted-foreground">Response SLA</p>
                </div>
              )}
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold">{templateOnly ? "Template" : customAllowed ? "Custom" : "Standard"}</p>
                <p className="text-xs text-muted-foreground">Canvas Depth</p>
              </div>
            </div>

            {blockedPlaybooks && blockedPlaybooks.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Ban className="h-3.5 w-3.5 text-red-400" />
                  Blocked Playbooks
                </p>
                <div className="space-y-1.5">
                  {blockedPlaybooks.map((pb, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-red-950/20 border border-red-900/20">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-red-400">{String(pb.playbook_id || pb.id || "-")}</span>
                        <span className="text-sm">{String(pb.name || "-")}</span>
                      </div>
                      {!!pb.reason && (
                        <span className="text-xs text-muted-foreground">{String(pb.reason)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
              <Button variant="outline" size="sm" className="ml-auto text-xs" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-3 w-3 mr-1" /> Add Playbook
              </Button>
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
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playbookList.map((pb, i) => {
                  const pbId = String(pb.id || pb.playbook_id || "");
                  return (
                    <TableRow key={i}>
                      <TableCell>{String(pb.sequence ?? i + 1)}</TableCell>
                      <TableCell className="font-mono text-xs">{pbId || "-"}</TableCell>
                      <TableCell>{String(pb.name || pb.playbook_name || "-")}</TableCell>
                      <TableCell>{String(pb.phase || pb.trigger || "-")}</TableCell>
                      <TableCell>
                        {pbId ? (
                          <Select
                            value={String(pb.status || "pending")}
                            onValueChange={(val) => statusMutation.mutate({ playbookId: pbId, status: val })}
                          >
                            <SelectTrigger className="h-7 w-[130px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PLAYBOOK_STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {formatLabel(s)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : pb.status ? (
                          <StatusBadge status={String(pb.status)} />
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {pbId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400"
                            onClick={() => setRemoveTarget({ id: pbId, name: String(pb.name || pbId) })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedCanvas(String(c.canvas_id || ""))}
                >
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

      {selectedCanvas && (
        <CanvasViewer
          realmId={realmId}
          nodeId={nodeId}
          canvasId={selectedCanvas}
          open={!!selectedCanvas}
          onOpenChange={(open) => { if (!open) setSelectedCanvas(null); }}
        />
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

      {changelog && changelog.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              Changelog
              <HelpPopover title="Blueprint changelog">
                Tracks how the engagement plan evolved: playbook additions,
                removals, and status changes over time.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...changelog].reverse().map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="font-mono text-muted-foreground whitespace-nowrap shrink-0">
                    {String(entry.timestamp || "").slice(0, 16).replace("T", " ")}
                  </span>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {formatLabel(String(entry.action || ""))}
                  </Badge>
                  <span className="text-muted-foreground">{String(entry.details || "")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!hasContent && (
        <p className="text-muted-foreground text-sm">No blueprint data available.</p>
      )}

      {/* Add Playbook Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add Playbook</DialogTitle>
            <DialogDescription>Select a playbook from the catalog to add to this engagement.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search playbooks..."
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-64 overflow-y-auto border rounded-md overflow-x-hidden">
              {availablePlaybooks.length === 0 && (
                <p className="text-xs text-muted-foreground p-3">No playbooks available.</p>
              )}
              {availablePlaybooks.map(([id, info]) => (
                <button
                  key={id}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 ${
                    selectedAdd?.id === id ? "bg-accent" : ""
                  }`}
                  onClick={() => setSelectedAdd({ id, name: info.name })}
                >
                  <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">{id}</span>
                  <span className="flex-1 truncate">{info.name}</span>
                  <span className="text-xs text-muted-foreground">{info.team}</span>
                </button>
              ))}
            </div>
            {selectedAdd && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select value={addPhase} onValueChange={setAddPhase}>
                    <SelectTrigger className="w-40 text-xs">
                      <SelectValue placeholder="Phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discovery">Discovery</SelectItem>
                      <SelectItem value="implementation">Implementation</SelectItem>
                      <SelectItem value="evaluation">Evaluation</SelectItem>
                      <SelectItem value="stabilization">Stabilization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Reason for adding (e.g. compliance gap identified)"
                  value={addReason}
                  onChange={(e) => setAddReason(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={!selectedAdd || !addReason.trim() || addMutation.isPending}
              onClick={() => {
                if (selectedAdd && addReason.trim()) {
                  addMutation.mutate({
                    playbook_id: selectedAdd.id,
                    name: selectedAdd.name,
                    phase: addPhase,
                    reason: addReason.trim(),
                  });
                }
              }}
            >
              {addMutation.isPending ? "Adding..." : "Add Playbook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Playbook Dialog */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Playbook</DialogTitle>
            <DialogDescription>
              {removeTarget?.id} ({removeTarget?.name}) will be moved to the blocked list.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Reason for removing"
            value={removeReason}
            onChange={(e) => setRemoveReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!removeReason.trim() || removeMutation.isPending}
              onClick={() => {
                if (removeTarget && removeReason.trim()) {
                  removeMutation.mutate({ playbookId: removeTarget.id, reason: removeReason.trim() });
                }
              }}
            >
              {removeMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {alerts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Active Alerts
                <HelpPopover title="Active alerts">
                  Triggered warnings based on health score thresholds or
                  significant changes. Each alert includes evidence and a
                  recommended action.
                </HelpPopover>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <SeverityBadge severity={alert.severity} />
                    <div className="flex-1">
                      <p className="text-sm">{String(alert.alert)}</p>
                      {alert.evidence && (
                        <p className="text-xs text-muted-foreground mt-1">{alert.evidence}</p>
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
                Priority Actions
                <HelpPopover title="Priority actions">
                  Prioritized actions with owners and expected impact on
                  specific health components to raise the health score.
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
  const priorityOrder = ["critical", "high", "medium", "low"];

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

function StakeholderDetailPanel({
  stakeholder,
  open,
  onOpenChange,
}: {
  stakeholder: Record<string, unknown> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!stakeholder) return null;

  const name = String(stakeholder.name || "Unknown");
  const title = String(stakeholder.title || "");
  const company = String(stakeholder.company || "");
  const location = String(stakeholder.location || "");
  const linkedinUrl = stakeholder.linkedin_url ? String(stakeholder.linkedin_url) : null;
  const stance = String(stakeholder.stance || stakeholder.sentiment || "").toLowerCase();

  const roleInDeal = stakeholder.role_in_deal as Record<string, unknown> | undefined;
  const relationship = stakeholder.relationship as Record<string, unknown> | undefined;
  const priorities = stakeholder.priorities as string[] | undefined;
  const concerns = stakeholder.concerns as string[] | undefined;
  const championValue = stakeholder.champion_value as string[] | undefined;
  const limitations = stakeholder.limitations as string[] | undefined;
  const techContext = stakeholder.technology_context as Record<string, unknown> | undefined;
  const conversionRisk = stakeholder.conversion_risk ? String(stakeholder.conversion_risk) : null;
  const strategy = stakeholder.strategy ? String(stakeholder.strategy) : null;
  const notes = stakeholder.notes ? String(stakeholder.notes) : null;
  const actionRequired = stakeholder.action_required ? String(stakeholder.action_required) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {name}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
          </SheetTitle>
          <SheetDescription asChild>
            <div className="flex items-center gap-2 flex-wrap">
              {title && <span>{title}</span>}
              {title && company && <span className="text-muted-foreground/40">·</span>}
              {company && <span className="text-muted-foreground/60">{company}</span>}
              {location && (
                <span className="flex items-center gap-1 text-muted-foreground/60">
                  <MapPin className="h-3 w-3" /> {location}
                </span>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-5">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {stance && (
              <Badge variant="outline" className={`text-xs capitalize ${STANCE_COLORS[stance] || ""}`}>
                {stance}
              </Badge>
            )}
            {!!roleInDeal?.type && (
              <Badge variant="outline" className="text-xs">
                {formatLabel(String(roleInDeal.type))}
              </Badge>
            )}
            {conversionRisk && (
              <Badge variant="outline" className={`text-xs capitalize ${
                conversionRisk === "critical" ? "text-red-400 border-red-600/30" :
                conversionRisk === "high" ? "text-orange-400 border-orange-600/30" :
                "text-yellow-400 border-yellow-600/30"
              }`}>
                {conversionRisk} risk
              </Badge>
            )}
          </div>

          {/* Role in Deal */}
          {roleInDeal && !!(roleInDeal.influence || roleInDeal.authority || roleInDeal.engagement_priority) && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Role in Deal
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {!!roleInDeal.influence && (
                  <div>
                    <p className="text-muted-foreground text-xs">Influence</p>
                    <p className="capitalize">{String(roleInDeal.influence)}</p>
                  </div>
                )}
                {!!roleInDeal.authority && (
                  <div>
                    <p className="text-muted-foreground text-xs">Authority</p>
                    <p className="capitalize">{formatLabel(String(roleInDeal.authority))}</p>
                  </div>
                )}
                {!!roleInDeal.engagement_priority && (
                  <div>
                    <p className="text-muted-foreground text-xs">Engagement Priority</p>
                    <p className="capitalize">{String(roleInDeal.engagement_priority)}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Relationship */}
          {relationship && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Relationship
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {!!relationship.status && (
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="capitalize">{formatLabel(String(relationship.status))}</p>
                  </div>
                )}
                {!!relationship.owner && (
                  <div>
                    <p className="text-muted-foreground text-xs">Owner</p>
                    <p>{String(relationship.owner)}</p>
                  </div>
                )}
                {!!relationship.sentiment && (
                  <div>
                    <p className="text-muted-foreground text-xs">Sentiment</p>
                    <p className="capitalize">{formatLabel(String(relationship.sentiment))}</p>
                  </div>
                )}
                {!!relationship.last_engagement && (
                  <div>
                    <p className="text-muted-foreground text-xs">Last Engagement</p>
                    <p>{String(relationship.last_engagement)}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Technology Context */}
          {techContext && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Technology Context
              </h4>
              <div className="space-y-1.5 text-sm">
                {!!techContext.platform_familiarity && (
                  <p><span className="text-muted-foreground text-xs">Platform Familiarity: </span>{String(techContext.platform_familiarity)}</p>
                )}
                {!!techContext.legacysiem_experience && (
                  <p><span className="text-muted-foreground text-xs">LegacySIEM: </span>{String(techContext.legacysiem_experience)}</p>
                )}
                {!!techContext.key_quote && (
                  <blockquote className="border-l-2 border-primary/50 pl-3 mt-2 italic text-sm text-muted-foreground">
                    &ldquo;{String(techContext.key_quote)}&rdquo;
                  </blockquote>
                )}
              </div>
            </section>
          )}

          {/* Priorities */}
          {priorities && priorities.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" /> Priorities
              </h4>
              <ul className="space-y-1">
                {priorities.map((p, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {String(p)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Concerns */}
          {concerns && concerns.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" /> Concerns
              </h4>
              <ul className="space-y-1">
                {concerns.map((c, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-400/60 shrink-0" />
                    {String(c)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Champion Value */}
          {championValue && championValue.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-400" /> Champion Value
              </h4>
              <ul className="space-y-1">
                {championValue.map((v, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                    {v}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Limitations */}
          {limitations && limitations.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" /> Limitations
              </h4>
              <ul className="space-y-1">
                {limitations.map((l, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400/60 shrink-0" />
                    {l}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Strategy */}
          {strategy && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Strategy
              </h4>
              <p className="text-sm text-muted-foreground">{strategy}</p>
            </section>
          )}

          {/* Notes */}
          {notes && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Notes
              </h4>
              <p className="text-sm text-muted-foreground">{notes}</p>
            </section>
          )}

          {/* Action Required */}
          {actionRequired && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Action Required
              </h4>
              <p className="text-sm text-amber-400/90 p-2 rounded bg-amber-950/20 border border-amber-600/20">
                {actionRequired}
              </p>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StakeholdersTab({ realmId, nodeId }: { realmId: string; nodeId: string }) {
  const queryClient = useQueryClient();
  const { data: stakeholderData, isLoading: stakeholdersLoading } = useQuery({
    queryKey: ["stakeholders", realmId, nodeId],
    queryFn: () => api.getStakeholders(realmId, nodeId),
  });

  const { data: proposals } = useQuery({
    queryKey: ["stanceProposals", realmId, nodeId],
    queryFn: () => api.getStanceProposals(realmId, nodeId),
  });

  const approveMutation = useMutation({
    mutationFn: ({ proposalId, notes }: { proposalId: string; notes: string }) =>
      api.approveStanceProposal(realmId, nodeId, proposalId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakeholders", realmId, nodeId] });
      queryClient.invalidateQueries({ queryKey: ["stanceProposals", realmId, nodeId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ proposalId, reason }: { proposalId: string; reason: string }) =>
      api.rejectStanceProposal(realmId, nodeId, proposalId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stanceProposals", realmId, nodeId] });
    },
  });

  const [selectedStakeholder, setSelectedStakeholder] = useState<Record<string, unknown> | null>(null);
  const [stanceFilter, setStanceFilter] = useState<string | null>(null);

  if (stakeholdersLoading) return <p className="text-muted-foreground text-sm">Loading stakeholders...</p>;
  if (!stakeholderData) return <p className="text-muted-foreground text-sm">No stakeholder data.</p>;

  const allStakeholders = (stakeholderData.stakeholders || stakeholderData.contacts || []) as Record<string, unknown>[];
  const buyingCenter = stakeholderData.buying_center as Record<string, unknown> | undefined;
  const engagementGaps = (stakeholderData.engagement_gaps || stakeholderData.gaps) as unknown[] | undefined;
  const pendingProposals = (proposals || []) as Record<string, unknown>[];

  const countByStance = (stance: string) =>
    allStakeholders.filter(
      (s) => String(s.stance || s.sentiment || "").toLowerCase() === stance
    ).length;

  const totalCount = allStakeholders.length;
  const championsCount = countByStance("champion");
  const supportersCount = countByStance("supporter");
  const neutralCount = countByStance("neutral");
  const blockersCount = countByStance("blocker") + countByStance("detractor");

  const filteredStakeholders = stanceFilter
    ? allStakeholders.filter((s) => {
        const stance = String(s.stance || s.sentiment || "").toLowerCase();
        if (stanceFilter === "blocker") return stance === "blocker" || stance === "detractor";
        return stance === stanceFilter;
      })
    : allStakeholders;

  const buyingCenterRoles = [
    { key: "economic_buyer", label: "Economic Buyer", icon: DollarSign },
    { key: "technical_decision_maker", label: "Technical Decision Maker", icon: Zap },
    { key: "user_buyer", label: "User Buyer", icon: Users },
    { key: "champion", label: "Champion", icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-3">
        <MetricCard label="Total" value={totalCount} onClick={() => setStanceFilter(null)} active={stanceFilter === null} />
        <MetricCard label="Champions" value={championsCount} onClick={() => setStanceFilter(stanceFilter === "champion" ? null : "champion")} active={stanceFilter === "champion"} />
        <MetricCard label="Supporters" value={supportersCount} onClick={() => setStanceFilter(stanceFilter === "supporter" ? null : "supporter")} active={stanceFilter === "supporter"} />
        <MetricCard label="Neutral" value={neutralCount} onClick={() => setStanceFilter(stanceFilter === "neutral" ? null : "neutral")} active={stanceFilter === "neutral"} />
        <MetricCard label="Blockers" value={blockersCount} onClick={() => setStanceFilter(stanceFilter === "blocker" ? null : "blocker")} active={stanceFilter === "blocker"} />
      </div>

      {pendingProposals.length > 0 && (
        <Card className="border-amber-600/30 bg-amber-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4 text-amber-400" />
              Pending Stance Changes
              <Badge variant="outline" className="ml-1 text-amber-400 border-amber-600/50">
                {pendingProposals.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingProposals.map((p) => {
                const id = String(p.proposal_id || "");
                const currentStance = String(p.current_stance || "unset");
                const proposedStance = String(p.proposed_stance || "");
                return (
                  <div key={id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{String(p.stakeholder_name || "Unknown")}</span>
                        <span className={`text-xs capitalize ${STANCE_COLORS[currentStance] || "text-muted-foreground"}`}>
                          {currentStance}
                        </span>
                        <span className="text-muted-foreground">&rarr;</span>
                        <span className={`text-xs capitalize font-medium ${STANCE_COLORS[proposedStance] || "text-muted-foreground"}`}>
                          {proposedStance}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{String(p.reason || "")}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        Proposed by {String(p.proposed_by || "agent")} on {String(p.proposed_date || "")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-green-400 border-green-600/50 hover:bg-green-950/30"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate({ proposalId: id, notes: "" })}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-red-400 border-red-600/50 hover:bg-red-950/30"
                        disabled={rejectMutation.isPending}
                        onClick={() => rejectMutation.mutate({ proposalId: id, reason: "" })}
                      >
                        <Ban className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                <Card
                  key={key}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => {
                    if (typeof person === "string") return;
                    const name = String(person.name || "");
                    const match = allStakeholders.find((s) => String(s.name || "") === name);
                    setSelectedStakeholder(match || (person as Record<string, unknown>));
                  }}
                >
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
                            <a href={String(person.linkedin_url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
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
            {stanceFilter && (
              <Badge
                variant="outline"
                className="text-xs cursor-pointer hover:bg-accent capitalize"
                onClick={() => setStanceFilter(null)}
              >
                {stanceFilter} ×
              </Badge>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStakeholders.map((s, i) => {
              const stance = String(s.stance || s.sentiment || "").toLowerCase();
              const priorities = s.priorities as string[] | undefined;
              return (
                <Card key={i} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedStakeholder(s)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium">{String(s.name || "Unknown")}</p>
                          {!!s.linkedin_url && (
                            <a href={String(s.linkedin_url)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
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

      <StakeholderDetailPanel
        stakeholder={selectedStakeholder}
        open={!!selectedStakeholder}
        onOpenChange={(open) => { if (!open) setSelectedStakeholder(null); }}
      />
    </div>
  );
}

// -- Markdown prose wrapper for vault content --

const PROSE_CLASSES = "prose prose-invert prose-sm max-w-none prose-headings:scroll-mt-4 prose-a:text-blue-400 prose-code:text-orange-300 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-border prose-table:text-sm prose-th:text-left";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VaultMarkdown({ content }: { content: string }) {
  return (
    <article className={PROSE_CLASSES}>
      <Markdown remarkPlugins={[remarkFrontmatter, remarkGfm]}>{content}</Markdown>
    </article>
  );
}

// -- Signals Tab --

function SignalsTab({ realmId, nodeId }: { realmId: string; nodeId: string }) {
  const { data: vault, isLoading } = useQuery({
    queryKey: ["vault", realmId, nodeId],
    queryFn: () => api.getVault(realmId, nodeId),
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading signals...</p>;
  if (!vault) return <p className="text-muted-foreground text-sm">No signal data.</p>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meetings = (vault.meetings as any[]) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldNotes = (vault.field_notes as any[]) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const marketIntel = vault.market_intelligence as Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentWork = (vault.agent_work as any[]) || [];

  const totalSignals = meetings.length + fieldNotes.length + agentWork.length + (marketIntel ? 1 : 0);
  if (totalSignals === 0) return <p className="text-muted-foreground text-sm">No signals captured yet.</p>;

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Meetings" value={meetings.length} />
        <MetricCard label="Field Notes" value={fieldNotes.length} />
        <MetricCard label="Agent Analyses" value={agentWork.length} />
        <MetricCard label="Market Intel" value={marketIntel ? "Available" : "None"} />
      </div>

      {/* Meetings */}
      {meetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Meeting Notes
              <HelpPopover title="Meeting notes">
                Captured meeting notes from external client meetings and internal deal reviews.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {meetings.map((m, i) => (
                <AccordionItem key={i} value={`meeting-${i}`}>
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2 text-left">
                      <Badge variant={m.type === "external" ? "default" : "secondary"} className="text-xs shrink-0">
                        {m.type}
                      </Badge>
                      <span className="truncate">{m.filename.replace(/\.md$/, "").replace(/[-_]/g, " ")}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <VaultMarkdown content={m.content} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Field Notes */}
      {fieldNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Field Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {fieldNotes.map((note, i) => (
                <AccordionItem key={i} value={`note-${i}`}>
                  <AccordionTrigger className="text-sm">
                    {note.filename.replace(/\.md$/, "").replace(/[-_]/g, " ")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <VaultMarkdown content={note.content} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Market Intelligence */}
      {marketIntel && <MarketIntelCard data={marketIntel} />}

      {/* Agent Work */}
      {agentWork.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-4 w-4" />
              Agent Analysis
              <HelpPopover title="Agent analysis">
                Scratchpads and working notes from AI agents analyzing this engagement.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {agentWork.map((work: any, i: number) => (
                <AccordionItem key={i} value={`agent-${i}`}>
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      {work.agent_id && <Badge variant="outline" className="text-xs">{work.agent_id}</Badge>}
                      <span>{work._filename?.replace(/\.yaml$/, "").replace(/[-_]/g, " ") || `Analysis ${i + 1}`}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    {work.observations && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Observations</p>
                        <ul className="text-sm space-y-1">
                          {(Array.isArray(work.observations) ? work.observations : [work.observations]).map((obs: string, j: number) => (
                            <li key={j} className="flex items-start gap-2"><CheckCircle2 className="h-3 w-3 mt-1 text-green-400 shrink-0" />{typeof obs === "string" ? obs : JSON.stringify(obs)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {work.hypotheses && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Hypotheses</p>
                        <ul className="text-sm space-y-1">
                          {(Array.isArray(work.hypotheses) ? work.hypotheses : [work.hypotheses]).map((h: string, j: number) => (
                            <li key={j} className="flex items-start gap-2"><Lightbulb className="h-3 w-3 mt-1 text-yellow-400 shrink-0" />{typeof h === "string" ? h : JSON.stringify(h)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {work.conclusions && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Conclusions</p>
                        <ul className="text-sm space-y-1">
                          {(Array.isArray(work.conclusions) ? work.conclusions : [work.conclusions]).map((c: string, j: number) => (
                            <li key={j} className="flex items-start gap-2"><Target className="h-3 w-3 mt-1 text-blue-400 shrink-0" />{typeof c === "string" ? c : JSON.stringify(c)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {work.open_questions && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Open Questions</p>
                        <ul className="text-sm space-y-1">
                          {(Array.isArray(work.open_questions) ? work.open_questions : [work.open_questions]).map((q: string, j: number) => (
                            <li key={j} className="flex items-start gap-2"><AlertTriangle className="h-3 w-3 mt-1 text-orange-400 shrink-0" />{typeof q === "string" ? q : JSON.stringify(q)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Fallback for unknown structure */}
                    {!work.observations && !work.hypotheses && !work.conclusions && (
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(work, null, 2)}</pre>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// -- Journey Tab --

function JourneyTab({ realmId, nodeId }: { realmId: string; nodeId: string }) {
  const { data: vault, isLoading } = useQuery({
    queryKey: ["vault", realmId, nodeId],
    queryFn: () => api.getVault(realmId, nodeId),
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading journey...</p>;
  if (!vault) return <p className="text-muted-foreground text-sm">No journey data.</p>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const journey = vault.journey as Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opportunities = (vault.opportunities as any[]) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const frameworks = (vault.frameworks as any[]) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cadence = vault.operating_cadence as Record<string, any> | null;

  const hasContent = journey || opportunities.length > 0 || frameworks.length > 0 || cadence;
  if (!hasContent) return <p className="text-muted-foreground text-sm">No journey data captured yet.</p>;

  const stages = journey?.overview?.stage_progression || [];
  const currentStage = journey?.overview?.current_stage;
  const healthIndicators = journey?.overview?.health_indicators;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const criticalMoments = journey?.critical_moments as Record<string, any> | undefined;
  const stakeholderJourneys = journey?.stakeholder_journeys as Record<string, Record<string, unknown>> | undefined;

  const STAGE_COLORS: Record<string, string> = {
    completed: "bg-green-600/20 text-green-400 border-green-600/30",
    in_progress: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    upcoming: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
    future: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30",
  };

  return (
    <div className="space-y-6">
      {/* Stage Progression */}
      {stages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Stage Progression
              {currentStage && <Badge variant="outline" className="text-xs ml-2">Current: {currentStage}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {stages.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-muted-foreground text-xs mx-1">&rarr;</span>}
                  <Badge className={`text-xs border ${STAGE_COLORS[s.status] || STAGE_COLORS.future}`}>
                    {s.stage}
                    {s.completed_date && <span className="ml-1 opacity-70">({s.completed_date})</span>}
                  </Badge>
                </div>
              ))}
            </div>
            {healthIndicators && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(healthIndicators).map(([key, val]) => (
                  <div key={key} className="p-2 rounded bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">{formatLabel(key)}</p>
                    <p className="text-sm font-medium">{String(val)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stakeholder Journeys */}
      {stakeholderJourneys && Object.keys(stakeholderJourneys).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Stakeholder Journeys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(stakeholderJourneys).map(([key, sj]) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sjData = sj as Record<string, any>;
                return (
                  <AccordionItem key={key} value={`sj-${key}`}>
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatLabel(key)}</span>
                        {sjData.persona && <span className="text-xs text-muted-foreground">({sjData.persona})</span>}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      {sjData.current_mindset && (
                        <p className="text-sm"><span className="text-muted-foreground">Mindset:</span> {sjData.current_mindset}</p>
                      )}
                      {sjData.journey_arc && Array.isArray(sjData.journey_arc) && (
                        <div className="space-y-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {sjData.journey_arc.map((arc: any, i: number) => (
                            <div key={i} className="p-2 rounded bg-muted/20 text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">{arc.phase}</Badge>
                                {arc.date && <span className="text-xs text-muted-foreground">{arc.date}</span>}
                              </div>
                              {arc.mindset && <p className="text-xs">{arc.mindset}</p>}
                              {arc.key_moment && <p className="text-xs text-blue-400">{arc.key_moment}</p>}
                              {arc.quote && <p className="text-xs italic text-muted-foreground">&ldquo;{arc.quote}&rdquo;</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Critical Moments */}
      {criticalMoments && (criticalMoments.past?.length > 0 || criticalMoments.upcoming?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Milestone className="h-4 w-4" />
              Critical Moments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalMoments.past?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Past</p>
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {criticalMoments.past.map((m: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded bg-muted/20 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{m.moment || m.title}</p>
                        {m.date && <p className="text-xs text-muted-foreground">{m.date}</p>}
                        {m.impact && <p className="text-xs">{m.impact}</p>}
                        {m.outcome && <p className="text-xs text-green-400">{m.outcome}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {criticalMoments.upcoming?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Upcoming</p>
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {criticalMoments.upcoming.map((m: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded bg-muted/20 text-sm">
                      <Clock className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{m.moment || m.title}</p>
                        {m.date && <p className="text-xs text-muted-foreground">{m.date}</p>}
                        {m.success_indicator && <p className="text-xs text-green-400">Success: {m.success_indicator}</p>}
                        {m.risk_indicator && <p className="text-xs text-red-400">Risk: {m.risk_indicator}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Opportunities / POC */}
      {opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Opportunities & POC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {opportunities.map((opp: any, i: number) => (
                <AccordionItem key={i} value={`opp-${i}`}>
                  <AccordionTrigger className="text-sm">
                    {opp.title || opp.opportunity_name || opp._filename?.replace(/\.yaml$/, "").replace(/[-_]/g, " ") || `Opportunity ${i + 1}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/20 p-3 rounded">{JSON.stringify(opp, null, 2)}</pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Framework Analysis */}
      {frameworks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Framework Analysis
              <HelpPopover title="Framework outputs">
                Strategic analysis outputs from playbooks: SWOT, Three Horizons, Value Engineering, and more.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {frameworks.map((fw: any, i: number) => (
                <AccordionItem key={i} value={`fw-${i}`}>
                  <AccordionTrigger className="text-sm">{fw.title || fw.filename}</AccordionTrigger>
                  <AccordionContent>
                    <VaultMarkdown content={fw.content} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Operating Cadence */}
      {cadence && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Operating Cadence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CadenceView cadence={cadence as Record<string, unknown>} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// -- External InfoHub (Customer Facing) Tab --

function ExternalInfoHubTab({ realmId, nodeId }: { realmId: string; nodeId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, error } = useQuery<Record<string, any>>({
    queryKey: ["external-infohub", realmId, nodeId],
    queryFn: () => api.getExternalInfoHub(realmId, nodeId),
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading Customer Facing InfoHub...</p>;
  if (error) return <p className="text-red-400 text-sm">Failed to load InfoHub data.</p>;
  if (!data) return <p className="text-muted-foreground text-sm">No InfoHub data.</p>;

  const context = data.context as Record<string, unknown> | undefined;
  const nodeOverview = context?.node_overview as Record<string, unknown> | undefined;
  const stakeholderMap = context?.stakeholder_map as Record<string, unknown> | undefined;
  const engagementHistory = context?.engagement_history as string | undefined;
  const architecture = data.architecture as Record<string, unknown> | undefined;
  const adrs = (architecture?.adrs || []) as { filename: string; title: string; content: string }[];
  const decisions = data.decisions as Record<string, unknown> | undefined;
  const decisionList = (decisions?.decisions || []) as Record<string, unknown>[];
  const journey = data.journey as Record<string, unknown> | undefined;
  const touchpoints = journey?.touchpoints as Record<string, unknown> | undefined;
  const touchpointList = (touchpoints?.touchpoints || []) as Record<string, unknown>[];
  const value = data.value as Record<string, unknown> | undefined;
  const opportunities = (data.opportunities || []) as Record<string, unknown>[];
  const overview = data.overview as string | undefined;
  const accountTeamData = data.account_team as Record<string, unknown> | undefined;
  const accountTeam = (accountTeamData?.account_team || []) as Record<string, unknown>[];
  const escalation = accountTeamData?.escalation as Record<string, unknown> | undefined;
  const timelineData = data.engagement_timeline as Record<string, unknown> | undefined;
  const timelinePhases = (timelineData?.phases || []) as Record<string, unknown>[];
  const timelineMilestones = (timelineData?.upcoming_milestones || timelineData?.key_milestones || []) as Record<string, unknown>[];
  const timelineSummary = timelineData?.engagement_summary as Record<string, unknown> | undefined;
  const successData = data.success_criteria as Record<string, unknown> | undefined;

  const hasContent = overview || nodeOverview || stakeholderMap || engagementHistory || adrs.length > 0 || decisionList.length > 0 || touchpointList.length > 0 || value || opportunities.length > 0 || accountTeam.length > 0 || timelinePhases.length > 0 || successData;
  if (!hasContent) return <p className="text-muted-foreground text-sm">No customer-facing InfoHub content yet.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Globe className="h-4 w-4 text-blue-400" />
        Customer-shareable content managed by SA, AE, VE, and Delivery agents.
      </div>

      {/* Account Team */}
      {accountTeam.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Your Account Team
              <HelpPopover title="Account team">
                Your dedicated team for this engagement. Contact any member
                directly for questions related to their area of responsibility.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {accountTeam.map((member, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{String(member.name || "")}</p>
                      <p className="text-xs text-muted-foreground">{String(member.role || "")}</p>
                    </div>
                  </div>
                  {!!member.responsibility && (
                    <p className="text-xs text-muted-foreground mt-1.5">{String(member.responsibility)}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                    {!!member.email && (
                      <a href={`mailto:${String(member.email)}`} className="text-primary/70 hover:text-primary transition-colors">
                        {String(member.email)}
                      </a>
                    )}
                    {!!member.phone && (
                      <span className="text-muted-foreground">{String(member.phone)}</span>
                    )}
                  </div>
                  {!!member.availability && (
                    <p className="text-[11px] text-muted-foreground/60 mt-1">{String(member.availability)}</p>
                  )}
                </div>
              ))}
            </div>
            {escalation && (
              <div className="border-t border-border pt-3 space-y-1 text-xs">
                <p className="font-medium text-muted-foreground">Escalation</p>
                {!!escalation.executive_sponsor && (
                  <p>Executive Sponsor: <span className="text-foreground">{String(escalation.executive_sponsor)}</span></p>
                )}
                {!!escalation.support_portal && (
                  <p>Support Portal: <span className="text-foreground">{String(escalation.support_portal)}</span></p>
                )}
                {!!escalation.emergency_hotline && (
                  <p>Emergency: <span className="text-foreground">{String(escalation.emergency_hotline)}</span></p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Engagement Timeline */}
      {timelinePhases.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GitCommitVertical className="h-4 w-4" />
              Engagement Timeline
              <HelpPopover title="Engagement timeline">
                The agreed phases and milestones for this engagement. Each phase
                includes specific deliverables. Milestones marked as requiring
                a decision need your input to proceed.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timelineSummary && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {!!timelineSummary.current_phase && (
                  <div>
                    <span className="text-xs text-muted-foreground">Current Phase</span>
                    <p className="font-medium">{String(timelineSummary.current_phase)}</p>
                  </div>
                )}
                {!!timelineSummary.start_date && (
                  <div>
                    <span className="text-xs text-muted-foreground">Started</span>
                    <p className="font-medium">{String(timelineSummary.start_date)}</p>
                  </div>
                )}
                {!!(timelineSummary.target_completion || timelineSummary.close_date) && (
                  <div>
                    <span className="text-xs text-muted-foreground">Target</span>
                    <p className="font-medium">{String(timelineSummary.target_completion || timelineSummary.close_date)}</p>
                  </div>
                )}
                {!!timelineSummary.outcome && (
                  <div>
                    <span className="text-xs text-muted-foreground">Outcome</span>
                    <p className="font-medium">{String(timelineSummary.outcome)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Phase stepper */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {timelinePhases.map((p, i) => {
                const status = String(p.status || "planned").toLowerCase();
                const phaseColor = status === "completed" ? "bg-emerald-600/20 border-emerald-600/40 text-emerald-400"
                  : status === "in_progress" ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-muted/30 border-border text-muted-foreground";
                const deliverables = (p.deliverables || []) as string[];
                return (
                  <div key={i} className={`flex-1 min-w-[120px] rounded-md border px-3 py-2 ${phaseColor}`}>
                    <p className="text-xs font-medium">{String(p.phase || "")}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">
                      {!!p.start && String(p.start).slice(5)}
                      {!!p.end && <> - {String(p.end).slice(5)}</>}
                    </p>
                    {status === "in_progress" && (
                      <p className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider">Active</p>
                    )}
                    {deliverables.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {deliverables.slice(0, 3).map((d, j) => (
                          <p key={j} className="text-[10px] opacity-60 truncate">{d}</p>
                        ))}
                        {deliverables.length > 3 && (
                          <p className="text-[10px] opacity-40">+{deliverables.length - 3} more</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Milestones */}
            {timelineMilestones.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Milestones</p>
                <div className="space-y-1.5">
                  {timelineMilestones.map((m, i) => {
                    const needsDecision = !!m.requires_decision;
                    const mStatus = String(m.status || "").toLowerCase();
                    const isCompleted = mStatus === "completed";
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {isCompleted ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        ) : needsDecision ? (
                          <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                        ) : (
                          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-medium text-muted-foreground shrink-0">{String(m.date || "")}</span>
                        <span className={isCompleted ? "text-muted-foreground" : ""}>{String(m.milestone || "")}</span>
                        {!!m.owner && <span className="text-muted-foreground/60">({String(m.owner)})</span>}
                        {needsDecision && !isCompleted && (
                          <Badge className="text-[10px] px-1 py-0 bg-amber-600/20 text-amber-400 border-amber-600/30">
                            DECISION NEEDED
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {overview && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Overview
              <Badge variant="outline" className="text-xs ml-auto">SA Agent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VaultMarkdown content={overview} />
          </CardContent>
        </Card>
      )}

      {/* Success Criteria */}
      {successData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Success Criteria
              <HelpPopover title="Success criteria">
                Jointly agreed criteria for evaluating this engagement. Technical
                criteria validate platform capabilities, business criteria confirm
                organizational fit and ROI.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!!successData.poc_scope && (
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                {(() => {
                  const scope = successData.poc_scope as Record<string, unknown>;
                  return Object.entries(scope).map(([key, val]) => (
                    <div key={key}>
                      <span className="font-medium">{formatLabel(key)}:</span> {String(val)}
                    </div>
                  ));
                })()}
              </div>
            )}
            {(() => {
              const techCriteria = (successData.technical_criteria || []) as Record<string, unknown>[];
              const bizCriteria = (successData.business_criteria || []) as Record<string, unknown>[];
              const dealReqs = (successData.deal_requirements || []) as string[];

              const statusIcon = (status: string) => {
                switch (status) {
                  case "met": return <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />;
                  case "partially_met": return <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />;
                  case "not_met": return <Ban className="h-3.5 w-3.5 text-red-400 shrink-0" />;
                  default: return <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
                }
              };

              return (
                <>
                  {techCriteria.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Technical Criteria</p>
                      <div className="space-y-1.5">
                        {techCriteria.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            {statusIcon(String(c.status || "pending"))}
                            <div className="min-w-0">
                              <span>{String(c.criterion || "")}</span>
                              {!!c.validation_method && (
                                <span className="text-xs text-muted-foreground ml-1">({String(c.validation_method)})</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {bizCriteria.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Business Criteria</p>
                      <div className="space-y-1.5">
                        {bizCriteria.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            {statusIcon(String(c.status || "pending"))}
                            <div className="min-w-0">
                              <span>{String(c.criterion || "")}</span>
                              {!!c.validation_method && (
                                <span className="text-xs text-muted-foreground ml-1">({String(c.validation_method)})</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {dealReqs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Deal Requirements</p>
                      <ul className="space-y-1">
                        {dealReqs.map((r, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <Target className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {nodeOverview && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Business & Technical Context
              <Badge variant="outline" className="text-xs ml-auto">RFP Agent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const biz = nodeOverview.business_context as Record<string, unknown> | undefined;
              const tech = nodeOverview.technical_context as Record<string, unknown> | undefined;
              return (
                <>
                  {biz && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Business Context</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(biz).map(([key, val]) => (
                          <div key={key} className="p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground">{formatLabel(key)}</p>
                            <p className="text-sm">{Array.isArray(val) ? val.join(", ") : String(val)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {tech && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Technical Context</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(tech).map(([key, val]) => (
                          <div key={key} className="p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground">{formatLabel(key)}</p>
                            <p className="text-sm">{typeof val === "object" ? JSON.stringify(val, null, 2) : String(val)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {engagementHistory && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Engagement History
              <Badge variant="outline" className="text-xs ml-auto">Delivery Agent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VaultMarkdown content={engagementHistory} />
          </CardContent>
        </Card>
      )}

      {adrs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Architecture Decision Records
              <Badge variant="outline" className="text-xs ml-auto">SA Agent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {adrs.map((adr, i) => (
                <AccordionItem key={i} value={`adr-${i}`}>
                  <AccordionTrigger className="text-sm">{adr.title || adr.filename}</AccordionTrigger>
                  <AccordionContent>
                    <VaultMarkdown content={adr.content} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {decisionList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GitCommitVertical className="h-4 w-4" />
              Decision Tracking
              <Badge className="text-xs ml-1">{decisionList.length}</Badge>
              <Badge variant="outline" className="text-xs ml-auto">Decision Registrar</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisionList.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{String(d.decision_id || d.id || "-")}</TableCell>
                    <TableCell className="text-sm">{String(d.description || d.title || "-")}</TableCell>
                    <TableCell><StatusBadge status={String(d.status || "unknown")} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{String(d.date || "-")}</TableCell>
                    <TableCell className="text-xs">{String(d.owner || "-")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {touchpointList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Touchpoint Log
              <Badge className="text-xs ml-1">{touchpointList.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {touchpointList.map((tp, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{String(tp.event || tp.title || "Touchpoint")}</p>
                      {!!tp.type && <Badge variant="outline" className="text-xs">{String(tp.type)}</Badge>}
                    </div>
                    {!!tp.outcome && <p className="text-xs text-muted-foreground mt-1">{String(tp.outcome)}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{String(tp.date || "")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stakeholderMap && (() => {
        const contacts = (stakeholderMap.stakeholders || stakeholderMap.contacts || []) as Record<string, unknown>[];
        if (contacts.length === 0) return null;
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Customer Stakeholder Map
                <Badge className="text-xs ml-1">{contacts.length}</Badge>
                <Badge variant="outline" className="text-xs ml-auto">AE Agent</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {contacts.map((s, i) => (
                  <StakeholderCard key={i} stakeholder={s} />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {value && (() => {
        const summary = value.summary as Record<string, unknown> | undefined;
        const items = (value.value_items || value.realized || []) as Record<string, unknown>[];
        if (!summary && items.length === 0) return null;
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Value Tracker
                <Badge variant="outline" className="text-xs ml-auto">VE Agent</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(summary).map(([key, val]) => (
                    <div key={key} className="p-2 rounded bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">{formatLabel(key)}</p>
                      <p className="text-sm font-medium">{String(val)}</p>
                    </div>
                  ))}
                </div>
              )}
              {items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item, i) => (
                    <ValueItemCard key={i} item={item} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {opportunities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Opportunities & POC
              <Badge className="text-xs ml-1">{opportunities.length}</Badge>
              <Badge variant="outline" className="text-xs ml-auto">AE Agent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {opportunities.map((opp, i) => (
                <AccordionItem key={i} value={`opp-${i}`}>
                  <AccordionTrigger className="text-sm">
                    {String(opp.title || opp.opportunity_name || opp._filename || `Opportunity ${i + 1}`).replace(/\.yaml$/, "").replace(/[-_]/g, " ")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/20 p-3 rounded">{JSON.stringify(opp, null, 2)}</pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// -- Internal InfoHub (Vendor Only) Tab --

function InternalInfoHubTab({ realmId, nodeId }: { realmId: string; nodeId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, error } = useQuery<Record<string, any>>({
    queryKey: ["internal-infohub", realmId, nodeId],
    queryFn: () => api.getInternalInfoHub(realmId, nodeId),
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading Internal InfoHub...</p>;
  if (error) return <p className="text-red-400 text-sm">Failed to load InfoHub data.</p>;
  if (!data) return <p className="text-muted-foreground text-sm">No InfoHub data.</p>;

  const risks = data.risks as Record<string, unknown> | undefined;
  const riskList = (risks?.risks || []) as Record<string, unknown>[];
  const stakeholders = (data.stakeholders || []) as Record<string, unknown>[];
  const competitive = data.competitive as Record<string, unknown> | undefined;
  const governance = data.governance as Record<string, unknown> | undefined;
  const healthScore = governance?.health_score as Record<string, unknown> | undefined;
  const cadence = governance?.operating_cadence as Record<string, unknown> | undefined;
  const frameworks = (data.frameworks || []) as { filename: string; title: string; content: string }[];
  const actions = data.actions as Record<string, unknown> | undefined;
  const actionList = (actions?.actions || []) as Record<string, unknown>[];
  const decisions = (Array.isArray(data.decisions) ? data.decisions : (data.decisions as Record<string, unknown>)?.decisions || []) as Record<string, unknown>[];
  const marketIntel = data.market_intelligence as Record<string, unknown> | undefined;
  const agentWork = (data.agent_work || []) as Record<string, unknown>[];

  const hasContent = riskList.length > 0 || stakeholders.length > 0 || competitive || healthScore || frameworks.length > 0 || actionList.length > 0 || decisions.length > 0 || marketIntel || agentWork.length > 0;
  if (!hasContent) return <p className="text-muted-foreground text-sm">No internal InfoHub content yet.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4 text-rose-400" />
        Vendor-internal operational content. Never share with customers.
      </div>

      {healthScore && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Engagement Health
              <HelpPopover title="How Health Is Evaluated">
                Health is a composite score (0-100) calculated by the CA Agent using
                weighted components: Product Adoption (25%), Engagement (20%),
                Relationship (20%), Commercial (20%), and Risk Profile (15%).
                Scores are classified as Healthy (80+), At-Risk (60-79), or
                Critical (&lt;60). Recalculated weekly or on significant events
                like executive meetings, risk changes, or milestone completions.
              </HelpPopover>
              <Badge variant="outline" className="text-xs ml-auto">Governance Agents</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const hs = healthScore.health_score as Record<string, unknown> | undefined;
              const score = (hs?.current ?? healthScore.overall_score) as number | undefined;
              const trend = hs?.trend as string | undefined;
              const change = hs?.change as number | undefined;
              const status = hs?.status as string | undefined;
              const components = healthScore.components as Record<string, Record<string, unknown>> | undefined;
              const alerts = (healthScore.alerts as Record<string, unknown>)?.active as Record<string, unknown>[] | undefined;
              const review = healthScore.review as Record<string, unknown> | undefined;
              const improvementPlan = healthScore.improvement_plan as Record<string, unknown> | undefined;

              const statusColor = status === "healthy"
                ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30"
                : status === "critical"
                  ? "bg-red-600/20 text-red-400 border-red-600/30"
                  : "bg-amber-600/20 text-amber-400 border-amber-600/30";

              const trendIcon = trend === "improving" ? "arrow_upward" : trend === "declining" ? "arrow_downward" : "horizontal_rule";

              return (
                <>
                  {/* Overall score with status and trend */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      {score != null && <HealthBar score={score} />}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {status && (
                        <Badge variant="outline" className={`text-xs capitalize ${statusColor}`}>
                          {status.replace(/_/g, " ")}
                        </Badge>
                      )}
                      {change != null && (
                        <span className={`text-xs font-medium ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {change >= 0 ? "+" : ""}{change}
                        </span>
                      )}
                      {trend && (
                        <span className="text-xs text-muted-foreground capitalize">{trend}</span>
                      )}
                    </div>
                  </div>

                  {/* Component breakdown */}
                  {components && Object.keys(components).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Score is a weighted average of five dimensions. Each measures a different
                        aspect of engagement quality: from technical adoption to commercial momentum.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                        {Object.entries(components).map(([key, comp]) => {
                          const compScore = comp.score as number;
                          const compWeight = comp.weight as number;
                          const compStatus = comp.status as string | undefined;
                          const compTrend = comp.trend as string | undefined;
                          const bg = compStatus === "healthy"
                            ? "border-emerald-600/30 bg-emerald-950/20"
                            : compStatus === "critical"
                              ? "border-red-600/30 bg-red-950/20"
                              : "border-amber-600/30 bg-amber-950/20";
                          return (
                            <div key={key} className={`p-2.5 rounded-lg border ${bg} text-center`}>
                              <p className="text-[11px] text-muted-foreground">
                                {COMPONENT_LABELS[key] || formatLabel(key)}
                              </p>
                              <p className="text-lg font-bold mt-0.5">{compScore}</p>
                              <div className="flex items-center justify-center gap-1 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">
                                  {(compWeight * 100).toFixed(0)}% weight
                                </span>
                                {compTrend && (
                                  <span className={`text-[10px] ${compTrend === "improving" ? "text-emerald-400" : compTrend === "declining" ? "text-red-400" : "text-muted-foreground"}`}>
                                    {compTrend === "improving" ? "\u2191" : compTrend === "declining" ? "\u2193" : "\u2192"}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Active alerts */}
                  {alerts && alerts.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">Active Alerts</p>
                      {alerts.map((alert, i) => {
                        const severity = String(alert.severity || "info");
                        const color = severity === "critical"
                          ? "border-l-red-500 bg-red-950/20"
                          : severity === "warning"
                            ? "border-l-amber-500 bg-amber-950/20"
                            : "border-l-blue-500 bg-blue-950/20";
                        return (
                          <div key={i} className={`border-l-2 ${color} p-2 rounded-r text-xs`}>
                            <span className="font-medium">{String(alert.alert)}</span>
                            {!!alert.action && (
                              <span className="text-muted-foreground ml-1">
                                &middot; {String(alert.action)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Improvement plan summary */}
                  {improvementPlan && (
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span>
                        Target: <span className="text-foreground font-medium">{String(improvementPlan.target_score)}</span>
                        {!!improvementPlan.target_date && <> by {String(improvementPlan.target_date)}</>}
                      </span>
                      {!!improvementPlan.priority_actions && (
                        <span>
                          {(improvementPlan.priority_actions as unknown[]).length} priority actions
                        </span>
                      )}
                    </div>
                  )}

                  {/* Review schedule */}
                  {review && (
                    <div className="text-xs text-muted-foreground">
                      Next review: {String(review.next_calculation || "N/A")} &middot; Frequency: {String(review.frequency || "N/A")} &middot; Owner: {String(review.owner || "N/A")}
                    </div>
                  )}

                  {/* Calculation explanation */}
                  <div className="border-t border-border/50 pt-3 mt-1">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Calculated by the CA Agent using the PB-401 Customer Health Score playbook
                      (Gainsight best practices). Formula: weighted sum of component scores.
                      Thresholds: Healthy (80+), At-Risk (60-79), Critical (&lt;60).
                      Triggers: weekly schedule, QBR preparation, usage drops, escalations,
                      sponsor changes, or renewal approaching.
                    </p>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {riskList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Register
              <Badge className="text-xs ml-1">{riskList.length}</Badge>
              <Badge variant="outline" className="text-xs ml-auto">Risk Radar Agent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {riskList.map((risk, i) => {
                const severity = String(risk.severity || "medium").toLowerCase();
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <SeverityBadge severity={severity} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{String(risk.risk_id || "")}</span>
                        <p className="text-sm font-medium">{String(risk.title || "")}</p>
                      </div>
                      {!!risk.description && <p className="text-xs text-muted-foreground mt-1">{String(risk.description)}</p>}
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        {!!risk.owner && <span>Owner: {String(risk.owner)}</span>}
                        {!!risk.status && <StatusBadge status={String(risk.status)} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {actionList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Action Tracker
              <Badge className="text-xs ml-1">{actionList.length}</Badge>
              <Badge variant="outline" className="text-xs ml-auto">Task Shepherd</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionList.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{String(a.action_id || a.id || "-")}</TableCell>
                    <TableCell className="text-sm">{String(a.title || a.description || "-")}</TableCell>
                    <TableCell className="text-xs">{String(a.owner || a.assignee || "-")}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{String(a.due_date || a.due || "-")}</TableCell>
                    <TableCell>{a.priority ? <Badge variant="outline" className="text-xs">{String(a.priority)}</Badge> : "-"}</TableCell>
                    <TableCell><StatusBadge status={String(a.status || "unknown")} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {decisions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GitCommitVertical className="h-4 w-4" />
              Decision Tracking
              <Badge className="text-xs ml-1">{decisions.length}</Badge>
              <Badge variant="outline" className="text-xs ml-auto">Decision Registrar</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {decisions.map((d, i) => (
                <AccordionItem key={i} value={`dec-${i}`}>
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{String(d.decision_id || d.id || "")}</span>
                      <span>{String(d.description || d.title || `Decision ${i + 1}`)}</span>
                      {!!d.status && <StatusBadge status={String(d.status)} />}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      {!!d.context && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Context</p>
                          <p>{typeof d.context === "object" ? JSON.stringify(d.context) : String(d.context)}</p>
                        </div>
                      )}
                      {!!d.rationale && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Rationale</p>
                          <p>{String(d.rationale)}</p>
                        </div>
                      )}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {!!d.owner && <span>Owner: {String(d.owner)}</span>}
                        {!!d.date && <span>Date: {String(d.date)}</span>}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {stakeholders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Internal Stakeholder Profiles
              <Badge className="text-xs ml-1">{stakeholders.length}</Badge>
              <Badge variant="outline" className="text-xs ml-auto">AE Agent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {stakeholders.map((s, i) => {
                const name = String(s.name || s._filename || `Stakeholder ${i + 1}`).replace(/\.yaml$/, "").replace(/[-_]/g, " ");
                return (
                  <AccordionItem key={i} value={`sh-${i}`}>
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{name}</span>
                        {!!s.title && <span className="text-xs text-muted-foreground">{String(s.title)}</span>}
                        {!!s.stance && <Badge variant="outline" className="text-xs capitalize">{String(s.stance)}</Badge>}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/20 p-3 rounded">{JSON.stringify(s, null, 2)}</pre>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {competitive && <CompetitiveIntelligencePanel data={competitive} />}

      {frameworks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Framework Analysis
              <Badge className="text-xs ml-1">{frameworks.length}</Badge>
              <Badge variant="outline" className="text-xs ml-auto">Strategic Playbooks</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {frameworks.map((fw, i) => (
                <AccordionItem key={i} value={`fw-${i}`}>
                  <AccordionTrigger className="text-sm">{fw.title || fw.filename}</AccordionTrigger>
                  <AccordionContent>
                    <VaultMarkdown content={fw.content} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {marketIntel && <MarketIntelCard data={marketIntel} />}

      {cadence && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Operating Cadence
              <Badge variant="outline" className="text-xs ml-auto">Governance Agents</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CadenceView cadence={cadence as Record<string, unknown>} />
          </CardContent>
        </Card>
      )}

      {agentWork.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agent Scratchpads
              <Badge className="text-xs ml-1">{agentWork.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {agentWork.map((work, i) => (
                <AccordionItem key={i} value={`aw-${i}`}>
                  <AccordionTrigger className="text-sm">
                    {String(work._filename || `Scratchpad ${i + 1}`).replace(/\.yaml$/, "").replace(/[-_]/g, " ")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/20 p-3 rounded">{JSON.stringify(work, null, 2)}</pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
          <TabsTrigger value="external-infohub">
            <Globe className="h-3.5 w-3.5 mr-1 text-blue-400" />
            Customer InfoHub
          </TabsTrigger>
          <TabsTrigger value="internal-infohub">
            <Lock className="h-3.5 w-3.5 mr-1 text-rose-400" />
            Internal InfoHub
          </TabsTrigger>
          <TabsTrigger value="blueprint">Blueprint</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="risks-actions">Risks & Actions</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
          <TabsTrigger value="scenario">
            <BookOpen className="h-3.5 w-3.5 mr-1 text-violet-400" />
            Scenario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab node={node} realmId={realmId} nodeId={nodeId} />
        </TabsContent>

        <TabsContent value="external-infohub" className="mt-4">
          <ExternalInfoHubTab realmId={realmId} nodeId={nodeId} />
        </TabsContent>

        <TabsContent value="internal-infohub" className="mt-4">
          <InternalInfoHubTab realmId={realmId} nodeId={nodeId} />
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

        <TabsContent value="signals" className="mt-4">
          <SignalsTab realmId={realmId} nodeId={nodeId} />
        </TabsContent>

        <TabsContent value="journey" className="mt-4">
          <JourneyTab realmId={realmId} nodeId={nodeId} />
        </TabsContent>

        <TabsContent value="scenario" className="mt-4">
          <ScenarioTab node={node} realmId={realmId} nodeId={nodeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
