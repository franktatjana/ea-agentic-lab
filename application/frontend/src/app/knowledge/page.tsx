"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  ThumbsUp,
  ThumbsDown,
  X,
  Tag,
  Settings2,
  FileText,
  ExternalLink,
  Package,
  User,
  CalendarDays,
  ArrowLeft,
  Bot,
  Workflow,
  Info,
  BarChart3,
} from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MetricCard } from "@/components/metric-card";
import { HelpPopover } from "@/components/help-popover";
import type { KnowledgeItem, KnowledgeProposal, KnowledgeActivity } from "@/types";

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
  operations: Settings2,
  content: FileText,
  external: ExternalLink,
  asset: Package,
};

const CATEGORY_COLORS: Record<string, string> = {
  operations: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  content: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  external: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  asset: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  validated: "bg-green-500/10 text-green-400 border-green-500/30",
  reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  proposed: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
};

const TYPE_LABELS: Record<string, string> = {
  best_practice: "Best Practice",
  lesson_learned: "Lesson Learned",
  pattern: "Pattern",
  research: "Research",
  asset: "Asset",
};

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function KnowledgeCard({
  item,
  onSelect,
}: {
  item: KnowledgeItem;
  onSelect: (item: KnowledgeItem) => void;
}) {
  const CategoryIcon = CATEGORY_ICONS[item.category] || BookOpen;
  const preview = item.content
    .replace(/^#.*$/gm, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 150);

  return (
    <Card
      className="hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => onSelect(item)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <CardTitle className="text-base">{item.title}</CardTitle>
        </div>
        <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`text-[10px] ${CATEGORY_COLORS[item.category] || ""}`}
          >
            {formatLabel(item.category)}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] ${CONFIDENCE_COLORS[item.confidence] || ""}`}
          >
            {formatLabel(item.confidence)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {TYPE_LABELS[item.type] || formatLabel(item.type)}
          </span>
          {item.domain !== "general" && (
            <span className="text-xs text-muted-foreground">
              {formatLabel(item.domain)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {preview && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {preview}...
          </p>
        )}
        {item.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {item.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 4 && (
              <span className="text-[10px] text-muted-foreground">
                +{item.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={key++} className="text-foreground font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

const AGENT_ROLE_INFO: Record<string, { label: string; team: string; color: string }> = {
  solution_architect: { label: "Solution Architect", team: "Solution Architecture", color: "text-blue-400" },
  account_executive: { label: "Account Executive", team: "Account Management", color: "text-emerald-400" },
  customer_architect: { label: "Customer Architect", team: "Customer Architecture", color: "text-purple-400" },
  specialist: { label: "Domain Specialist", team: "Specialists", color: "text-amber-400" },
  poc_agent: { label: "POC Agent", team: "POC Execution", color: "text-cyan-400" },
  competitive_intelligence: { label: "CI Agent", team: "Competitive Intelligence", color: "text-red-400" },
  governance: { label: "Governance Agent", team: "Governance", color: "text-orange-400" },
  leadership: { label: "Senior Manager", team: "Leadership", color: "text-pink-400" },
  product_manager: { label: "Product Manager", team: "Product Management", color: "text-indigo-400" },
};

function getPhaseLabel(phase: string): string {
  const map: Record<string, string> = {
    pre_sales: "Pre-Sales (Classify, Blueprint, Execute)",
    implementation: "Implementation (Execute, Render)",
    post_sales: "Post-Sales (Store, Learn)",
    all: "All Lifecycle Phases",
  };
  return map[phase] || formatLabel(phase);
}

function getInjectionContext(item: KnowledgeItem): string {
  if (item.type === "best_practice") return "Injected as reference during playbook execution when domain and archetype match";
  if (item.type === "lesson_learned") return "Surfaced as cautionary context during similar engagement patterns";
  if (item.type === "pattern") return "Used by agents to recognize and classify engagement scenarios";
  if (item.type === "research") return "Provided as supporting evidence during analysis and recommendation tasks";
  if (item.type === "asset") return "Available as a reusable template or deliverable during artifact generation";
  return "Available to matching agents at runtime";
}

function KnowledgeIntelligence({ item }: { item: KnowledgeItem }) {
  const roles = item.relevance.map((r) => AGENT_ROLE_INFO[r] || { label: formatLabel(r), team: "Unknown", color: "text-muted-foreground" });

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/[0.02] px-4 py-3 space-y-2.5">
      <div className="flex items-center gap-1.5">
        <Bot className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold">Agent Intelligence</span>
        <span className="text-[10px] text-muted-foreground ml-1">{getInjectionContext(item)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
        {/* Agents */}
        {roles.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Agents:</span>
            {roles.map((role) => (
              <Badge key={role.label} variant="outline" className="text-[10px] h-[18px] gap-0.5 px-1.5">
                <Bot className={`h-2.5 w-2.5 ${role.color}`} />
                {role.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Phase */}
        <div className="flex items-center gap-1">
          <Workflow className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">{getPhaseLabel(item.phase)}</span>
        </div>

        {/* Match */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Match:</span>
          <span className="rounded bg-muted/50 px-1 py-px text-[10px]">{formatLabel(item.domain)}</span>
          <span className="rounded bg-muted/50 px-1 py-px text-[10px]">{formatLabel(item.archetype)}</span>
          <span className="rounded bg-muted/50 px-1 py-px text-[10px]">{formatLabel(item.confidence)}</span>
        </div>
      </div>
    </div>
  );
}

function KnowledgeDetail({
  item,
  onClose,
}: {
  item: KnowledgeItem;
  onClose: () => void;
}) {
  const CategoryIcon = CATEGORY_ICONS[item.category] || BookOpen;

  return (
    <div className="space-y-3">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to vault
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight">{item.title}</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[item.category] || ""}`}>
            <CategoryIcon className="h-3 w-3 mr-0.5" />
            {formatLabel(item.category)}
          </Badge>
          <Badge variant="outline" className={`text-[10px] ${CONFIDENCE_COLORS[item.confidence] || ""}`}>
            {formatLabel(item.confidence)}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {TYPE_LABELS[item.type] || formatLabel(item.type)}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {formatLabel(item.domain)}
          </Badge>
          {item.archetype !== "all" && (
            <Badge variant="outline" className="text-[10px]">{formatLabel(item.archetype)}</Badge>
          )}
          {item.phase !== "all" && (
            <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
              {formatLabel(item.phase)}
            </Badge>
          )}
        </div>
        {/* Inline metadata */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{item.source?.author || "N/A"}</span>
          <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />{item.source?.origin || "N/A"}</span>
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{item.created || "N/A"}</span>
          {item.updated && item.updated !== item.created && (
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />Updated {item.updated}</span>
          )}
        </div>
        {/* Tags inline */}
        {item.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] h-[18px] font-normal px-1.5">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Agent intelligence */}
      <KnowledgeIntelligence item={item} />

      {/* Article content */}
      <div className="rounded-lg border border-muted/50 px-5 py-4">
        {item.content.split("\n").map((line, i) => {
          if (line.startsWith("### "))
            return (
              <h3 key={i} className="text-sm font-semibold mt-3 mb-0.5 text-foreground">
                {line.slice(4)}
              </h3>
            );
          if (line.startsWith("## "))
            return (
              <h2 key={i} className="text-base font-semibold mt-4 mb-0.5 text-foreground border-b border-muted/30 pb-0.5">
                {line.slice(3)}
              </h2>
            );
          if (line.startsWith("# "))
            return (
              <h1 key={i} className="text-lg font-bold mt-4 mb-0.5 text-foreground">
                {line.slice(2)}
              </h1>
            );
          const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
          if (numberedMatch)
            return (
              <div key={i} className="flex items-baseline gap-2 ml-0.5">
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-[10px] font-semibold shrink-0 translate-y-[1px]">
                  {numberedMatch[1]}
                </span>
                <span className="text-sm text-muted-foreground leading-snug">
                  {renderInlineMarkdown(numberedMatch[2])}
                </span>
              </div>
            );
          if (line.startsWith("- "))
            return (
              <div key={i} className="flex items-baseline gap-1.5 ml-1">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0 translate-y-[-2px]" />
                <span className="text-sm text-muted-foreground leading-snug">
                  {renderInlineMarkdown(line.slice(2))}
                </span>
              </div>
            );
          if (line.trim() === "") return <div key={i} className="h-1" />;
          return (
            <p key={i} className="text-sm text-muted-foreground leading-snug m-0">
              {renderInlineMarkdown(line)}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function ProposalCard({
  proposal,
  onApprove,
  onReject,
}: {
  proposal: KnowledgeProposal;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const preview = proposal.content
    .replace(/^#.*$/gm, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 150);

  return (
    <Card className="border-yellow-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{proposal.title}</CardTitle>
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px]"
          >
            Pending Review
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <span className="text-xs">
            Proposed by: {formatLabel(proposal.proposed_by || "agent")}
          </span>
          <span className="text-xs text-muted-foreground">
            {proposal.proposal_date}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {preview && (
          <p className="text-sm text-muted-foreground">{preview}...</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px]">
            {formatLabel(proposal.category)}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {formatLabel(proposal.domain)}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {TYPE_LABELS[proposal.type] || formatLabel(proposal.type)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="text-green-400 hover:text-green-300 hover:border-green-500/50"
            onClick={() => onApprove(proposal.id)}
          >
            <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-400 hover:text-red-300 hover:border-red-500/50"
            onClick={() => onReject(proposal.id)}
          >
            <ThumbsDown className="h-3.5 w-3.5 mr-1.5" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("best_practice");
  const [category, setCategory] = useState("content");
  const [domain, setDomain] = useState("general");
  const [archetype, setArchetype] = useState("all");
  const [phase, setPhase] = useState("all");
  const [tagsInput, setTagsInput] = useState("");
  const [content, setContent] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createKnowledgeItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-stats"] });
      setTitle("");
      setContent("");
      setTagsInput("");
      onCreated();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({
      title,
      type,
      category,
      domain,
      archetype,
      phase,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      content,
      source: { type: "expert", origin: "Manual entry", author: "" },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short descriptive title"
          required
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Type</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="best_practice">Best Practice</SelectItem>
              <SelectItem value="lesson_learned">Lesson Learned</SelectItem>
              <SelectItem value="pattern">Pattern</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="asset">Asset</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="external">External</SelectItem>
              <SelectItem value="asset">Asset</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Domain</label>
          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="observability">Observability</SelectItem>
              <SelectItem value="search">Search</SelectItem>
              <SelectItem value="platform">Platform</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Archetype</label>
          <Select value={archetype} onValueChange={setArchetype}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="consolidation">Consolidation</SelectItem>
              <SelectItem value="greenfield">Greenfield</SelectItem>
              <SelectItem value="expansion">Expansion</SelectItem>
              <SelectItem value="migration">Migration</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Phase</label>
          <Select value={phase} onValueChange={setPhase}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pre_sales">Pre-Sales</SelectItem>
              <SelectItem value="implementation">Implementation</SelectItem>
              <SelectItem value="post_sales">Post-Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">
          Tags (comma-separated)
        </label>
        <Input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="siem, consolidation, quick-win"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Content (Markdown)</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write knowledge content in markdown..."
          rows={12}
          className="font-mono text-sm"
        />
      </div>

      <Button type="submit" disabled={createMutation.isPending || !title.trim()}>
        <Plus className="h-4 w-4 mr-1.5" />
        {createMutation.isPending ? "Creating..." : "Create Knowledge Item"}
      </Button>
    </form>
  );
}

const MATURITY_CONFIG: Record<string, { label: string; color: string }> = {
  seeding: { label: "Seeding", color: "text-yellow-400" },
  growing: { label: "Growing", color: "text-blue-400" },
  maturing: { label: "Maturing", color: "text-purple-400" },
  mature: { label: "Mature", color: "text-green-400" },
};

const DOMAIN_COLORS: Record<string, string> = {
  security: "bg-red-500/70",
  observability: "bg-blue-500/70",
  search: "bg-amber-500/70",
  platform: "bg-emerald-500/70",
  general: "bg-slate-400/70",
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  engagement: "Engagement",
  expert: "Expert",
  research: "Research",
  analyst_report: "Analyst Report",
};

function DistributionBar({
  data,
  colorMap,
  labelMap,
  total,
}: {
  data: Record<string, number>;
  colorMap: Record<string, string>;
  labelMap?: Record<string, string>;
  total: number;
}) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (total === 0) {
    return <div className="h-6 rounded bg-muted/30 flex items-center justify-center text-[10px] text-muted-foreground">No data</div>;
  }
  return (
    <div className="space-y-1.5">
      <div className="flex h-6 rounded overflow-hidden">
        {entries.map(([key, count]) => (
          <div
            key={key}
            className={`${colorMap[key] || "bg-muted"} transition-all`}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${labelMap?.[key] || formatLabel(key)}: ${count}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {entries.map(([key, count]) => (
          <div key={key} className="flex items-center gap-1.5 text-[11px]">
            <span className={`h-2 w-2 rounded-full ${colorMap[key] || "bg-muted"}`} />
            <span className="text-muted-foreground">{labelMap?.[key] || formatLabel(key)}</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityDashboard({
  activity,
  onSelectItem,
  items,
}: {
  activity: KnowledgeActivity | undefined;
  onSelectItem: (item: KnowledgeItem) => void;
  items: KnowledgeItem[];
}) {
  if (!activity) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading activity data...</p>
      </div>
    );
  }

  const maturity = MATURITY_CONFIG[activity.vault_maturity] || MATURITY_CONFIG.seeding;
  const maxDomainCount = Math.max(...activity.domain_coverage.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Vault Maturity"
          value={maturity.label}
          className={maturity.color}
        />
        <MetricCard label="Total Items" value={activity.total_items} />
        <MetricCard label="Curation Queue" value={activity.pending_proposals} />
        <MetricCard label="Rejected" value={activity.rejected_proposals} />
      </div>

      {/* Domain Coverage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Domain Coverage</CardTitle>
          <CardDescription className="text-xs">
            Knowledge items per domain. Gaps indicate areas where field experience has not yet been captured.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.domain_coverage.map((dc) => (
            <div key={dc.domain} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{formatLabel(dc.domain)}</span>
                <span className="text-muted-foreground">{dc.count} item{dc.count !== 1 ? "s" : ""}</span>
              </div>
              {dc.count > 0 ? (
                <div className="flex h-5 rounded overflow-hidden bg-muted/20">
                  <div
                    className={`${DOMAIN_COLORS[dc.domain] || "bg-muted"} transition-all rounded`}
                    style={{ width: `${(dc.count / maxDomainCount) * 100}%`, minWidth: "8px" }}
                  />
                </div>
              ) : (
                <div className="h-5 rounded bg-muted/10 flex items-center px-2">
                  <span className="text-[10px] text-muted-foreground/60">No items yet</span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Confidence Maturity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Confidence Maturity</CardTitle>
          <CardDescription className="text-xs">
            Distribution across confidence levels. A healthy vault has most items at reviewed or validated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DistributionBar
            data={activity.by_confidence}
            colorMap={{
              proposed: "bg-yellow-500/70",
              reviewed: "bg-blue-500/70",
              validated: "bg-green-500/70",
            }}
            total={activity.total_items}
          />
        </CardContent>
      </Card>

      {/* Distributions row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionBar
              data={activity.by_category}
              colorMap={{
                operations: "bg-blue-500/70",
                content: "bg-purple-500/70",
                external: "bg-amber-500/70",
                asset: "bg-emerald-500/70",
              }}
              total={activity.total_items}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">By Source Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionBar
              data={activity.by_source_type}
              colorMap={{
                engagement: "bg-cyan-500/70",
                expert: "bg-indigo-500/70",
                research: "bg-pink-500/70",
                analyst_report: "bg-orange-500/70",
              }}
              labelMap={SOURCE_TYPE_LABELS}
              total={activity.total_items}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Items</CardTitle>
          <CardDescription className="text-xs">
            Last items added to the vault.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activity.recent_items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No items in the vault yet.</p>
          ) : (
            <div className="space-y-1">
              {activity.recent_items.map((ri) => {
                const fullItem = items.find((i) => i.id === ri.id);
                return (
                  <div
                    key={ri.id}
                    className="flex items-center gap-3 rounded-md px-2.5 py-2 hover:bg-muted/50 transition-colors cursor-pointer text-sm"
                    onClick={() => fullItem && onSelectItem(fullItem)}
                  >
                    <span className="font-medium truncate flex-1 min-w-0">{ri.title}</span>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${CATEGORY_COLORS[ri.category] || ""}`}>
                      {formatLabel(ri.category)}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${CONFIDENCE_COLORS[ri.confidence] || ""}`}>
                      {formatLabel(ri.confidence)}
                    </Badge>
                    <span className="text-xs text-muted-foreground shrink-0">{ri.created}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function KnowledgeVaultPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [activeTab, setActiveTab] = useState("browse");

  const { data: items, isLoading } = useQuery({
    queryKey: ["knowledge"],
    queryFn: () => api.listKnowledge(),
  });

  const { data: stats } = useQuery({
    queryKey: ["knowledge-stats"],
    queryFn: () => api.getKnowledgeStats(),
  });

  const { data: proposals } = useQuery({
    queryKey: ["knowledge-proposals"],
    queryFn: () => api.listProposals(),
  });

  const { data: activity } = useQuery({
    queryKey: ["knowledge-activity"],
    queryFn: () => api.getKnowledgeActivity(),
    enabled: activeTab === "activity",
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.approveProposal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-stats"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-proposals"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.rejectProposal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-proposals"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-stats"] });
    },
  });

  const filtered = useMemo(() => {
    if (!items) return [];
    let result = items;
    if (categoryFilter !== "all") {
      result = result.filter((i) => i.category === categoryFilter);
    }
    if (domainFilter !== "all") {
      result = result.filter((i) => i.domain === domainFilter);
    }
    if (typeFilter !== "all") {
      result = result.filter((i) => i.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [items, categoryFilter, domainFilter, typeFilter, search]);

  const pendingProposals = useMemo(
    () => (proposals || []).filter((p) => p.proposal_status === "pending"),
    [proposals]
  );

  const hasActiveFilter =
    categoryFilter !== "all" || domainFilter !== "all" || typeFilter !== "all";

  function clearFilters() {
    setCategoryFilter("all");
    setDomainFilter("all");
    setTypeFilter("all");
    setSearch("");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading knowledge vault...</p>
      </div>
    );
  }

  if (selectedItem) {
    return (
      <div className="max-w-4xl mx-auto">
        <KnowledgeDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Knowledge Vault</h1>
          <HelpPopover title="What is the Knowledge Vault?">
            The Knowledge Vault is the system&apos;s institutional memory.
            It stores best practices, lessons learned, patterns, and external
            research that agents pull from at runtime. Knowledge is
            human-curated: you add items manually or review agent proposals.
            Agent personalities and playbooks are never auto-modified.
          </HelpPopover>
        </div>
        <p className="text-muted-foreground mt-1">
          Human-curated knowledge that makes every engagement smarter.
        </p>
      </div>

      {/* Three-vault explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-primary/20 bg-primary/[0.02] px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold">Knowledge Vault</span>
            <Badge variant="outline" className="text-[9px] h-4 ml-auto">This page</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Cross-account institutional memory. Best practices, lessons learned, and patterns
            validated across engagements. Agents pull from this at runtime during playbook
            execution. Human-curated: agents propose, humans approve.
          </p>
        </div>
        <div className="rounded-lg border border-muted/40 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold">External InfoHub</span>
            <Badge variant="outline" className="text-[9px] h-4 ml-auto text-muted-foreground">Per node</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Customer-facing knowledge for a specific engagement. Discovery findings,
            architecture assessments, POC results, canvases. Can be shared with the customer
            or handed off to new team members.
          </p>
        </div>
        <div className="rounded-lg border border-muted/40 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs font-semibold">Internal InfoHub</span>
            <Badge variant="outline" className="text-[9px] h-4 ml-auto text-muted-foreground">Per node</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Vendor-only intelligence for a specific engagement. Competitive context,
            stakeholder mapping, deal strategy, risk assessments. Never shared with customers.
            Agents update continuously.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Total Items"
          value={stats?.total_items ?? 0}
        />
        <MetricCard
          label="Validated"
          value={stats?.by_confidence?.validated ?? 0}
        />
        <MetricCard
          label="Domains"
          value={Object.keys(stats?.by_domain ?? {}).length}
        />
        <MetricCard
          label="Pending Review"
          value={stats?.pending_proposals ?? 0}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add New
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Review Queue
            {pendingProposals.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                {pendingProposals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="asset">Asset</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={domainFilter}
              onValueChange={setDomainFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="observability">Observability</SelectItem>
                <SelectItem value="search">Search</SelectItem>
                <SelectItem value="platform">Platform</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="best_practice">Best Practice</SelectItem>
                <SelectItem value="lesson_learned">Lesson Learned</SelectItem>
                <SelectItem value="pattern">Pattern</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="asset">Asset</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilter && (
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Filtered:</span>
              {categoryFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20"
                  onClick={() => setCategoryFilter("all")}
                >
                  {formatLabel(categoryFilter)}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {domainFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20"
                  onClick={() => setDomainFilter("all")}
                >
                  {formatLabel(domainFilter)}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {typeFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20"
                  onClick={() => setTypeFilter("all")}
                >
                  {TYPE_LABELS[typeFilter] || formatLabel(typeFilter)}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear all
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No knowledge items found</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {items?.length
                  ? "Try adjusting your search or filters."
                  : "Add your first knowledge item to get started."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((item) => (
                <KnowledgeCard
                  key={item.id}
                  item={item}
                  onSelect={setSelectedItem}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Knowledge Item</CardTitle>
              <CardDescription>
                Manually add a best practice, lesson learned, pattern, or
                external research to the Knowledge Vault.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateForm onCreated={() => setActiveTab("browse")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4 mt-4">
          {pendingProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No pending proposals</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Agent proposals will appear here for your review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onApprove={(id) => approveMutation.mutate(id)}
                  onReject={(id) => rejectMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6 mt-4">
          <ActivityDashboard activity={activity} onSelectItem={setSelectedItem} items={items || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
