"use client";

import { AlertTriangle, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KnowledgePresentationData } from "./knowledge-data";
import type { Slide } from "./presentation-shell";

function SlideHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-8"><h2 className="text-3xl font-bold">{title}</h2>{subtitle && <p className="text-lg text-muted-foreground mt-1">{subtitle}</p>}</div>;
}

const confidenceColors: Record<string, string> = { Validated: "bg-green-500/15 text-green-400", Reviewed: "bg-blue-500/15 text-blue-400", Proposed: "bg-yellow-500/15 text-yellow-400" };
const domainBarColors: Record<string, string> = { rose: "bg-rose-500", sky: "bg-sky-500", slate: "bg-slate-500", emerald: "bg-emerald-500", amber: "bg-amber-500" };
const maturityColors: Record<string, string> = { Seeding: "text-yellow-400", Growing: "text-blue-400", Maturing: "text-green-400", Mature: "text-emerald-400" };

export function buildKnowledgeSlides(data: KnowledgePresentationData): Slide[] {
  const maxDomain = Math.max(...data.domain_coverage.map(d => d.count));
  const validatedPct = Math.round(data.stats.validated / data.stats.total_items * 100);

  return [
    // 1. Cover
    { id: "cover", title: "Cover", content: (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">Knowledge Review</span>
        </div>
        <h1 className="text-5xl font-bold mb-3">{data.title}</h1>
        <p className="text-xl text-muted-foreground mb-8">{data.date}</p>
        <div className="grid grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold">{data.stats.total_items}</p><p className="text-xs text-muted-foreground uppercase">Total Items</p></div>
          <div><p className="text-4xl font-bold text-green-400">{data.stats.validated}</p><p className="text-xs text-muted-foreground uppercase">Validated</p></div>
          <div><p className="text-4xl font-bold">{data.domain_coverage.length}</p><p className="text-xs text-muted-foreground uppercase">Domains</p></div>
          <div><p className={cn("text-4xl font-bold", maturityColors[data.maturity])}>{data.maturity}</p><p className="text-xs text-muted-foreground uppercase">Maturity</p></div>
        </div>
      </div>
    )},

    // 2. Domain Coverage
    { id: "domain-coverage", title: "Domain Coverage", content: (
      <div>
        <SlideHeader title="Domain Coverage" subtitle="Knowledge distribution across technology domains" />
        <div className="space-y-4">
          {data.domain_coverage.map((d, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="w-28 text-sm font-medium text-right shrink-0">{d.domain}</span>
              <div className="flex-1 h-8 rounded bg-muted overflow-hidden">
                <div className={cn("h-full rounded", domainBarColors[d.color])} style={{ width: `${(d.count / maxDomain) * 100}%` }} />
              </div>
              <span className="w-10 text-sm font-bold text-right shrink-0">{d.count}</span>
            </div>
          ))}
        </div>
        {data.gaps.length > 0 && (
          <div className="mt-6 border rounded-xl p-4">
            <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground mb-2">Coverage Gaps</p>
            <div className="space-y-1">
              {data.gaps.slice(0, 3).map((g, i) => (
                <div key={i} className="flex items-start gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" /><span className="text-muted-foreground">{g}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>
    )},

    // 3. Quality & Confidence
    { id: "quality", title: "Quality", content: (
      <div>
        <SlideHeader title="Quality & Confidence" subtitle={`${validatedPct}% of knowledge is validated`} />
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border rounded-xl p-5 text-center border-green-500/30 bg-green-500/5">
            <p className="text-4xl font-bold text-green-400">{data.stats.validated}</p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Validated</p>
          </div>
          <div className="border rounded-xl p-5 text-center border-blue-500/30 bg-blue-500/5">
            <p className="text-4xl font-bold text-blue-400">{data.stats.reviewed}</p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Reviewed</p>
          </div>
          <div className="border rounded-xl p-5 text-center border-yellow-500/30 bg-yellow-500/5">
            <p className="text-4xl font-bold text-yellow-400">{data.stats.proposed}</p>
            <p className="text-xs text-muted-foreground uppercase mt-1">Proposed</p>
          </div>
        </div>
        <div className="h-6 rounded-full overflow-hidden flex mb-2">
          <div className="bg-green-500" style={{ width: `${(data.stats.validated / data.stats.total_items) * 100}%` }} />
          <div className="bg-blue-500" style={{ width: `${(data.stats.reviewed / data.stats.total_items) * 100}%` }} />
          <div className="bg-yellow-500" style={{ width: `${(data.stats.proposed / data.stats.total_items) * 100}%` }} />
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground justify-center">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> Validated</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Reviewed</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500" /> Proposed</span>
        </div>
      </div>
    )},

    // 4. By Type & Source
    { id: "distribution", title: "Distribution", content: (
      <div>
        <SlideHeader title="Knowledge Distribution" subtitle="By type and source channel" />
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">By Type</h3>
            <div className="space-y-3">
              {data.by_type.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-right shrink-0">{t.type}</span>
                  <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
                    <div className="h-full rounded bg-primary" style={{ width: `${(t.count / data.stats.total_items) * 100}%` }} />
                  </div>
                  <span className="w-8 text-sm font-bold text-right shrink-0">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">By Source</h3>
            <div className="space-y-3">
              {data.by_source.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-right shrink-0">{s.source}</span>
                  <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
                    <div className="h-full rounded bg-primary/70" style={{ width: `${(s.count / data.stats.total_items) * 100}%` }} />
                  </div>
                  <span className="w-8 text-sm font-bold text-right shrink-0">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )},

    // 5. Highlights
    { id: "highlights", title: "Highlights", content: (
      <div>
        <SlideHeader title="Knowledge Highlights" subtitle="Key validated assets" />
        <div className="space-y-4">
          {data.highlights.map((h, i) => (
            <div key={i} className="border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                <p className="text-lg font-semibold">{h.title}</p>
                <span className="px-2 py-0.5 rounded bg-muted text-xs">{h.type}</span>
                <span className="px-2 py-0.5 rounded bg-muted text-xs">{h.domain}</span>
              </div>
              <p className="text-sm text-muted-foreground ml-7">{h.summary}</p>
            </div>
          ))}
        </div>
      </div>
    )},

    // 6. Recent & Gaps
    { id: "recent", title: "Recent Additions", content: (
      <div>
        <SlideHeader title="Recent Additions & Gaps" />
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Items</h3>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {data.recent_items.map((item, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-3 py-2 font-medium">{item.title}</td>
                      <td className="px-3 py-2"><span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", confidenceColors[item.confidence])}>{item.confidence}</span></td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">{item.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Identified Gaps</h3>
            <div className="space-y-3">
              {data.gaps.map((g, i) => (
                <div key={i} className="flex items-start gap-2 text-sm border rounded-lg p-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <span>{g}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
              <p className="text-sm font-medium">Pending Review: {data.stats.pending_review} items</p>
              <p className="text-sm text-muted-foreground mt-1">Vault maturity: {data.maturity}</p>
            </div>
          </div>
        </div>
      </div>
    )},
  ];
}
