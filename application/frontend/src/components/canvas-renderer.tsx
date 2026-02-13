"use client";

import { Badge } from "@/components/ui/badge";
import type { CanvasData, CanvasSection } from "@/types";

// -- Utility --

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// -- Section Header --

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-muted/50">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary">
        {label}
      </h3>
    </div>
  );
}

// -- Format: Narrative --

function NarrativeSection({ data }: { data: Record<string, unknown> }) {
  const summary = String(data.summary || "");
  const objective = String(data.objective || "");
  const initiativeType = String(data.initiative_type || "");

  return (
    <div className="px-4 py-3 space-y-3">
      {initiativeType && (
        <Badge variant="outline" className="text-[10px]">
          {initiativeType}
        </Badge>
      )}
      {summary && (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {summary}
        </p>
      )}
      {objective && (
        <div className="rounded-md bg-primary/5 border border-primary/10 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase text-primary mb-1">
            Objective
          </p>
          <p className="text-sm text-foreground">{objective}</p>
        </div>
      )}
    </div>
  );
}

// -- Format: Structured (key-value pairs) --

function StructuredSection({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );
  if (entries.length === 0) return <EmptySection />;

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-2 gap-3">
        {entries.map(([key, value]) => (
          <div key={key}>
            <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-0.5">
              {formatLabel(key)}
            </p>
            <p className="text-sm text-foreground">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Format: Two Column --

function TwoColumnSection({ data }: { data: Record<string, unknown> }) {
  const leftLabel = String(data.left_label || "In Scope");
  const rightLabel = String(data.right_label || "Out of Scope");
  const leftItems = (data.left_items as string[]) || [];
  const rightItems = (data.right_items as string[]) || [];

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <p className="text-[11px] font-bold uppercase mb-2 pb-1.5 border-b-2 border-green-500 text-green-400">
            {leftLabel}
          </p>
          <div className="space-y-1.5">
            {leftItems.map((item, i) => (
              <div
                key={i}
                className="text-xs px-2.5 py-1.5 rounded bg-green-500/5 text-green-300 border border-green-500/10"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase mb-2 pb-1.5 border-b-2 border-amber-500 text-amber-400">
            {rightLabel}
          </p>
          <div className="space-y-1.5">
            {rightItems.map((item, i) => (
              <div
                key={i}
                className="text-xs px-2.5 py-1.5 rounded bg-amber-500/5 text-amber-300 border border-amber-500/10"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Format: Timeline --

interface TimelineItem {
  date?: string;
  title?: string;
  type?: string;
  owner?: string;
  status?: string;
  blocking?: boolean;
}

function TimelineSection({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as TimelineItem[]) || [];
  if (items.length === 0) return <EmptySection />;

  const dotColor: Record<string, string> = {
    milestone: "bg-green-500",
    deadline: "bg-red-500",
    gate: "bg-amber-500",
    phase: "bg-blue-500",
  };

  const typeStyle: Record<string, string> = {
    milestone: "bg-green-500/10 text-green-400",
    deadline: "bg-red-500/10 text-red-400",
    gate: "bg-amber-500/10 text-amber-400",
    phase: "bg-blue-500/10 text-blue-400",
    implemented: "bg-green-500/10 text-green-400",
    superseded: "bg-muted text-muted-foreground",
  };

  return (
    <div className="px-4 py-3">
      <div className="relative pl-5">
        <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-muted/60" />
        {items.map((item, i) => (
          <div key={i} className="relative mb-3 last:mb-0">
            <div
              className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full ${
                dotColor[item.type || ""] || "bg-primary"
              }`}
            />
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[10px] font-semibold text-muted-foreground min-w-[72px]">
                {item.date}
              </span>
              <span className="text-xs text-foreground">{item.title}</span>
              {item.type && (
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                    typeStyle[item.type] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.type}
                </span>
              )}
              {item.blocking && (
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold">
                  Blocking
                </span>
              )}
            </div>
            {item.owner && (
              <p className="text-[10px] text-muted-foreground ml-[80px]">
                {item.owner}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Format: Categorized --

interface CategorizedItem {
  category?: string;
  text?: string;
}

function CategorizedSection({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as CategorizedItem[]) || [];
  if (items.length === 0) return <EmptySection />;

  const grouped: Record<string, string[]> = {};
  for (const item of items) {
    const cat = item.category || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item.text || "");
  }

  return (
    <div className="px-4 py-3 space-y-3">
      {Object.entries(grouped).map(([category, texts]) => (
        <div key={category}>
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">
            {category}
          </p>
          <div className="space-y-1">
            {texts.map((text, i) => (
              <div
                key={i}
                className="text-xs px-2.5 py-1.5 bg-amber-500/5 border-l-2 border-amber-500 rounded-r"
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// -- Format: List with Status --

interface StatusItem {
  text?: string;
  status?: string;
  detail?: string;
}

const STATUS_COLORS: Record<string, string> = {
  validated: "bg-green-500/10 text-green-400 border-green-500/30",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  "at-risk": "bg-red-500/10 text-red-400 border-red-500/30",
  blocking: "bg-red-500/10 text-red-400 border-red-500/30",
  open: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

function ListWithStatusSection({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as StatusItem[]) || [];
  if (items.length === 0) return <EmptySection />;

  return (
    <div className="px-4 py-3 space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md bg-muted/20"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground">{item.text}</p>
            {item.detail && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {item.detail}
              </p>
            )}
          </div>
          {item.status && (
            <Badge
              variant="outline"
              className={`text-[9px] shrink-0 ${
                STATUS_COLORS[item.status] || ""
              }`}
            >
              {formatLabel(item.status)}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

// -- Format: Outcome Based --

interface OutcomeItem {
  outcome?: string;
  measure?: string;
  owner?: string;
}

function OutcomeSection({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as OutcomeItem[]) || [];
  if (items.length === 0) return <EmptySection />;

  return (
    <div className="px-4 py-3 space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="px-3 py-2.5 rounded-md bg-green-500/5 border border-green-500/10"
        >
          <p className="text-xs font-semibold text-green-300">
            {item.outcome}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {item.measure && (
              <p className="text-[10px] text-green-400/70">{item.measure}</p>
            )}
            {item.owner && (
              <p className="text-[10px] text-muted-foreground">{item.owner}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// -- Format: Decision Cards --

interface DecisionCard {
  id?: string;
  title?: string;
  category?: string;
  status?: string;
  date?: string;
  decision_maker?: string;
  rationale?: string | string[];
  implications?: string[];
}

const DECISION_STATUS: Record<string, string> = {
  approved: "bg-green-500/10 text-green-400 border-green-500/30",
  implemented: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  pending_approval: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  superseded: "bg-muted text-muted-foreground border-muted",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
};

const CATEGORY_COLORS: Record<string, string> = {
  strategic: "bg-purple-500/10 text-purple-400",
  technical: "bg-blue-500/10 text-blue-400",
  commercial: "bg-emerald-500/10 text-emerald-400",
  competitive: "bg-red-500/10 text-red-400",
  stakeholder: "bg-amber-500/10 text-amber-400",
  resource: "bg-cyan-500/10 text-cyan-400",
  customer: "bg-pink-500/10 text-pink-400",
};

function DecisionCardsSection({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as DecisionCard[]) || [];
  if (items.length === 0) return <EmptySection />;

  return (
    <div className="px-4 py-3 space-y-2.5">
      {items.map((d, i) => (
        <div
          key={i}
          className="rounded-lg border border-muted/50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">
                {d.id}
              </span>
              <span className="text-xs font-semibold text-foreground">
                {d.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {d.category && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded ${
                    CATEGORY_COLORS[d.category] || "bg-muted"
                  }`}
                >
                  {formatLabel(d.category)}
                </span>
              )}
              {d.status && (
                <Badge
                  variant="outline"
                  className={`text-[9px] ${
                    DECISION_STATUS[d.status] || ""
                  }`}
                >
                  {formatLabel(d.status)}
                </Badge>
              )}
            </div>
          </div>
          <div className="px-3 py-2 space-y-1.5">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              {d.date && <span>{d.date}</span>}
              {d.decision_maker && <span>{d.decision_maker}</span>}
            </div>
            {d.rationale && (
              <div className="text-[11px] text-muted-foreground">
                {typeof d.rationale === "string" ? (
                  <p>{d.rationale}</p>
                ) : (
                  <ul className="list-disc list-inside space-y-0.5">
                    {(d.rationale as string[]).map((r, j) => (
                      <li key={j}>{r.replace(/^-\s*/, "")}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {d.implications && d.implications.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {d.implications.map((imp, j) => (
                  <span
                    key={j}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground"
                  >
                    {imp}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// -- Format: Table --

interface TableRow {
  id?: string;
  title?: string;
  category?: string;
  severity?: string;
  probability?: string;
  impact?: string;
  status?: string;
  owner?: string;
  mitigation_strategy?: string;
  mitigation_progress?: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  low: "bg-green-500/10 text-green-400 border-green-500/30",
};

function TableSection({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as TableRow[]) || [];
  if (items.length === 0) return <EmptySection />;

  return (
    <div className="px-4 py-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-muted/50">
            <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase text-muted-foreground">
              Risk
            </th>
            <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase text-muted-foreground">
              Category
            </th>
            <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase text-muted-foreground">
              Severity
            </th>
            <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase text-muted-foreground">
              Status
            </th>
            <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase text-muted-foreground">
              Mitigation
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, i) => (
            <tr key={i} className="border-b border-muted/20 last:border-0">
              <td className="py-2 px-2">
                <p className="font-medium text-foreground">{row.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {row.id}
                </p>
              </td>
              <td className="py-2 px-2 text-muted-foreground">
                {formatLabel(row.category || "")}
              </td>
              <td className="py-2 px-2">
                <Badge
                  variant="outline"
                  className={`text-[9px] ${
                    SEVERITY_COLORS[row.severity || ""] || ""
                  }`}
                >
                  {formatLabel(row.severity || "")}
                </Badge>
              </td>
              <td className="py-2 px-2 text-muted-foreground">
                {formatLabel(row.status || "")}
              </td>
              <td className="py-2 px-2">
                <p className="text-muted-foreground text-[10px] max-w-[200px] truncate">
                  {row.mitigation_strategy}
                </p>
                {row.mitigation_progress !== undefined && (
                  <div className="w-full bg-muted/30 rounded-full h-1 mt-1">
                    <div
                      className="bg-primary h-1 rounded-full"
                      style={{
                        width: `${Math.min(100, row.mitigation_progress)}%`,
                      }}
                    />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -- Format: Stakeholder Cards --

interface StakeholderCard {
  name?: string;
  title?: string;
  stance?: string;
  role_type?: string;
  influence?: string;
}

const STANCE_COLORS: Record<string, string> = {
  champion: "bg-green-500/10 text-green-400 border-green-500/30",
  supporter: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  neutral: "bg-muted text-muted-foreground border-muted",
  skeptic: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  blocker: "bg-red-500/10 text-red-400 border-red-500/30",
};

function StakeholderCardsSection({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as StakeholderCard[]) || [];
  if (items.length === 0) return <EmptySection />;

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-2 gap-2">
        {items.map((s, i) => (
          <div
            key={i}
            className="rounded-lg border border-muted/50 px-3 py-2.5"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-foreground">
                {s.name}
              </span>
              {s.stance && (
                <Badge
                  variant="outline"
                  className={`text-[9px] ${
                    STANCE_COLORS[s.stance] || ""
                  }`}
                >
                  {formatLabel(s.stance)}
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">{s.title}</p>
            <div className="flex items-center gap-2 mt-1">
              {s.role_type && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/5 text-primary">
                  {formatLabel(s.role_type)}
                </span>
              )}
              {s.influence && (
                <span className="text-[9px] text-muted-foreground">
                  {formatLabel(s.influence)} influence
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Empty / Default fallback --

function EmptySection() {
  return (
    <div className="px-4 py-6 text-center">
      <p className="text-xs text-muted-foreground">No data available</p>
    </div>
  );
}

function DefaultSection({ section }: { section: CanvasSection }) {
  return (
    <div className="px-4 py-3">
      <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap overflow-hidden">
        {JSON.stringify(section.data, null, 2)}
      </pre>
    </div>
  );
}

// -- Section Dispatcher --

function CanvasSectionContent({ section }: { section: CanvasSection }) {
  switch (section.format) {
    case "narrative":
      return <NarrativeSection data={section.data} />;
    case "structured":
      return <StructuredSection data={section.data} />;
    case "two_column":
      return <TwoColumnSection data={section.data} />;
    case "timeline":
      return <TimelineSection data={section.data} />;
    case "categorized":
      return <CategorizedSection data={section.data} />;
    case "list_with_status":
      return <ListWithStatusSection data={section.data} />;
    case "outcome_based":
      return <OutcomeSection data={section.data} />;
    case "decision_cards":
      return <DecisionCardsSection data={section.data} />;
    case "table":
      return <TableSection data={section.data} />;
    case "stakeholder_cards":
      return <StakeholderCardsSection data={section.data} />;
    default:
      return <DefaultSection section={section} />;
  }
}

// -- Main Canvas Renderer --

export function CanvasRenderer({ data }: { data: CanvasData }) {
  const layout = data.layout;
  const rows = (layout?.rows as Array<{ sections: string[]; height?: string }>) || [];
  const footerDef = layout?.footer as { sections?: string[]; style?: string } | undefined;
  const footerSections = (footerDef?.sections || [])
    .map((id: string) => data.sections.find((s) => s.id === id))
    .filter(Boolean) as CanvasSection[];

  return (
    <div className="space-y-0 rounded-lg border border-muted/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-950 to-indigo-900 text-white">
        <div>
          <h2 className="text-lg font-semibold">{data.name}</h2>
          <p className="text-xs text-white/70 mt-0.5">{data.description}</p>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <div className="text-right">
            <p className="text-[10px] uppercase text-white/50">Account</p>
            <p className="font-medium">{data.metadata.realm_name}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase text-white/50">Engagement</p>
            <p className="font-medium">{data.metadata.node_name}</p>
          </div>
          {data.metadata.stage && (
            <div className="px-3 py-1 rounded bg-white/15 text-[11px] font-semibold">
              {formatLabel(data.metadata.stage)}
            </div>
          )}
        </div>
      </div>

      {/* Layout-driven sections */}
      {rows.length > 0 ? (
        rows.map((row, ri) => {
          const rowSections = row.sections
            .map((id) => data.sections.find((s) => s.id === id))
            .filter(Boolean) as CanvasSection[];
          if (rowSections.length === 0) return null;

          return (
            <div
              key={ri}
              className={`grid border-b border-muted/30 last:border-b-0 ${
                rowSections.length === 2 ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {rowSections.map((section, si) => (
                <div
                  key={section.id}
                  className={
                    si < rowSections.length - 1 ? "border-r border-muted/30" : ""
                  }
                >
                  <SectionHeader label={section.label} />
                  <CanvasSectionContent section={section} />
                </div>
              ))}
            </div>
          );
        })
      ) : (
        /* Fallback: render all sections sequentially */
        data.sections.map((section) => (
          <div key={section.id} className="border-b border-muted/30 last:border-b-0">
            <SectionHeader label={section.label} />
            <CanvasSectionContent section={section} />
          </div>
        ))
      )}

      {/* Footer sections (from layout.footer) */}
      {footerSections.length > 0 && (
        <div
          className={`grid border-t border-muted/30 ${
            footerSections.length === 2 ? "grid-cols-2" : "grid-cols-1"
          } ${footerDef?.style === "highlighted" ? "bg-muted/5" : ""}`}
        >
          {footerSections.map((section, si) => (
            <div
              key={section.id}
              className={
                si < footerSections.length - 1
                  ? "border-r border-muted/30"
                  : ""
              }
            >
              <SectionHeader label={section.label} />
              <CanvasSectionContent section={section} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
