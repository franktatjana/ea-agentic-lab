"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Network,
  Play,
  Trash2,
  AlertTriangle,
  Search,
  Users,
  BookOpen,
  FileText,
  ChevronDown,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StatusBadge, SeverityBadge } from "@/components/badges";
import { MetricCard } from "@/components/metric-card";
import { HelpPopover } from "@/components/help-popover";

const EXAMPLE_PROCESSES: Record<string, string> = {
  rfp_analysis:
    "When a new RFP is received, the SA Agent should analyze technical requirements, the AE Agent should assess commercial fit, and the CI Agent should provide competitive positioning.",
  health_check:
    "Monthly health check review process: CA Agent collects customer metrics, SA Agent reviews technical adoption, AE Agent assesses relationship health, and results are consolidated into health score update.",
  competitive_response:
    "When a competitive threat is detected by CI Agent, trigger SWOT analysis by SA Agent, prepare counter-positioning by AE Agent, and update battlecards.",
};

const MOCK_RESULTS = {
  rfp_analysis: {
    process: {
      name: "RFP Technical & Commercial Analysis",
      id: "PROC-2024-041",
      trigger: "New RFP received in CRM pipeline",
      owner: "SA Agent",
      steps: [
        "SA Agent: Analyze technical requirements and map to solution capabilities",
        "AE Agent: Assess commercial fit, pricing model, and deal qualification",
        "CI Agent: Provide competitive positioning and win/loss intelligence",
        "Consolidate: Merge outputs into unified RFP response brief",
      ],
    },
    conflicts: [
      {
        severity: "medium",
        description:
          "SA Agent and AE Agent both define 'solution fit score' with different calculation methods. SA uses technical feature coverage (0-100), AE uses commercial viability matrix (A-D).",
        resolution:
          "Standardize on composite score: 70% technical coverage + 30% commercial viability, normalized to 0-100 scale.",
      },
    ],
    gaps: [
      {
        severity: "high",
        description:
          "No defined handoff between CI Agent competitive analysis and SA Agent technical differentiation. Competitive insights may not inform technical response.",
      },
      {
        severity: "low",
        description:
          "Missing SLA definition for RFP response turnaround. No escalation path if analysis exceeds 48-hour window.",
      },
    ],
    artifacts: {
      agents: ["SA Agent", "AE Agent", "CI Agent"],
      playbooks: [
        "RFP Qualification Playbook",
        "Competitive Response Framework",
      ],
    },
  },
  health_check: {
    process: {
      name: "Monthly Customer Health Review",
      id: "PROC-2024-027",
      trigger: "Scheduled: first Monday of each month",
      owner: "CA Agent",
      steps: [
        "CA Agent: Collect usage metrics, support ticket trends, NPS scores",
        "SA Agent: Review technical adoption depth and feature utilization",
        "AE Agent: Assess relationship health, renewal risk, expansion signals",
        "Consolidate: Calculate composite health score and update customer record",
      ],
    },
    conflicts: [
      {
        severity: "high",
        description:
          "CA Agent and AE Agent use conflicting definitions of 'engagement score'. CA measures product usage frequency, AE measures executive meeting cadence.",
        resolution:
          "Create unified engagement model with two dimensions: product engagement (CA) and relationship engagement (AE), weighted by account tier.",
      },
    ],
    gaps: [
      {
        severity: "medium",
        description:
          "No feedback loop from health score updates back to individual agents. Agents cannot see how their inputs affected the final score.",
      },
    ],
    artifacts: {
      agents: ["CA Agent", "SA Agent", "AE Agent"],
      playbooks: [
        "Customer Health Scoring Playbook",
        "Renewal Risk Assessment",
      ],
    },
  },
  competitive_response: {
    process: {
      name: "Competitive Threat Response",
      id: "PROC-2024-033",
      trigger: "CI Agent detects competitive threat signal",
      owner: "CI Agent",
      steps: [
        "CI Agent: Validate threat signal and classify severity",
        "SA Agent: Perform SWOT analysis against detected competitor",
        "AE Agent: Prepare counter-positioning and customer talking points",
        "CI Agent: Update battlecards and distribute to field teams",
      ],
    },
    conflicts: [
      {
        severity: "low",
        description:
          "SA Agent SWOT template and CI Agent battlecard format have overlapping 'strengths' sections with different granularity levels.",
        resolution:
          "SA Agent SWOT feeds into CI Agent battlecard as source data. Battlecard maintains summarized view for field consumption.",
      },
    ],
    gaps: [
      {
        severity: "high",
        description:
          "No priority classification for threat severity. All competitive threats trigger the same full response workflow regardless of impact potential.",
      },
      {
        severity: "medium",
        description:
          "Missing validation step: no mechanism to confirm battlecard accuracy with SA Agent before distribution to field teams.",
      },
    ],
    artifacts: {
      agents: ["CI Agent", "SA Agent", "AE Agent"],
      playbooks: [
        "Competitive Intelligence Playbook",
        "Battlecard Management",
      ],
    },
  },
};

type ExampleKey = "rfp_analysis" | "health_check" | "competitive_response";
type MockResultKey = keyof typeof MOCK_RESULTS;

const REGISTRY_PROCESSES = [
  {
    name: "RFP Technical & Commercial Analysis",
    id: "PROC-2024-041",
    owner: "SA Agent",
    status: "active",
    mockKey: "rfp_analysis" as MockResultKey,
  },
  {
    name: "Monthly Customer Health Review",
    id: "PROC-2024-027",
    owner: "CA Agent",
    status: "active",
    mockKey: "health_check" as MockResultKey,
  },
  {
    name: "Competitive Threat Response",
    id: "PROC-2024-033",
    owner: "CI Agent",
    status: "active",
    mockKey: "competitive_response" as MockResultKey,
  },
  {
    name: "Quarterly Business Review Prep",
    id: "PROC-2024-038",
    owner: "AE Agent",
    status: "draft",
    mockKey: null,
  },
];

export default function OrchestrationPage() {
  const [selectedExample, setSelectedExample] = useState<string>("");
  const [processText, setProcessText] = useState("");
  const [inputFormat, setInputFormat] = useState("auto");
  const [analysisResult, setAnalysisResult] = useState<
    (typeof MOCK_RESULTS)[MockResultKey] | null
  >(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);

  function handleExampleChange(value: string) {
    setSelectedExample(value);
    if (value !== "custom") {
      setProcessText(EXAMPLE_PROCESSES[value] || "");
    } else {
      setProcessText("");
    }
    setAnalysisResult(null);
  }

  function handleClear() {
    setSelectedExample("");
    setProcessText("");
    setInputFormat("auto");
    setAnalysisResult(null);
  }

  function handleAnalyze() {
    if (!processText.trim()) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const resultKey =
        selectedExample && selectedExample !== "custom"
          ? (selectedExample as MockResultKey)
          : "rfp_analysis";
      setAnalysisResult(MOCK_RESULTS[resultKey]);
      setIsAnalyzing(false);
    }, 1200);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Network className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Process Orchestration</h1>
              <HelpPopover title="What is Process Orchestration?">
                Define how multiple agents collaborate on a workflow. The system
                parses your process definition, detects conflicts where agents
                overlap or contradict each other, identifies gaps in handoffs or
                coverage, and maps which playbooks and agents are involved.
              </HelpPopover>
            </div>
            <p className="text-muted-foreground mt-0.5">
              Parse, analyze, and validate multi-agent process definitions.
              Detect conflicts, identify gaps, and generate orchestration
              artifacts.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-3">
          <Link
            href="/docs?path=architecture/system/process-orchestration-overview.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <BookOpen className="h-3 w-3" />
            Overview &amp; Concepts
          </Link>
          <Link
            href="/docs?path=architecture/system/process-schema.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <FileText className="h-3 w-3" />
            Process Schema
          </Link>
          <Link
            href="/docs?path=architecture/system/conflict-rules.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <AlertTriangle className="h-3 w-3" />
            Conflict Rules
          </Link>
          <Link
            href="/docs?path=architecture/agents/orchestration-agent.md"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Network className="h-3 w-3" />
            Agent Architecture
          </Link>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Process Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Process Input
              <HelpPopover title="How to define a process">
                Select an example to explore a pre-built workflow, or choose
                &quot;Custom&quot; to write your own. Describe which agents are
                involved, what each one does, and how they hand off work.
                Supports natural language or YAML format.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">
                Example Process
              </label>
              <Select
                value={selectedExample}
                onValueChange={handleExampleChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an example process..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rfp_analysis">RFP Analysis</SelectItem>
                  <SelectItem value="health_check">
                    Health Check Review
                  </SelectItem>
                  <SelectItem value="competitive_response">
                    Competitive Response
                  </SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">
                Process Description
              </label>
              <Textarea
                value={processText}
                onChange={(e) => setProcessText(e.target.value)}
                placeholder="Describe the multi-agent process you want to analyze..."
                className="min-h-[200px] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">
                Input Format
              </label>
              <Select value={inputFormat} onValueChange={setInputFormat}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="natural">Natural language</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAnalyze}
                disabled={!processText.trim() || isAnalyzing}
                className="flex-1"
              >
                <Play className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Parse & Analyze"}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel: Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              Analysis Results
              <HelpPopover title="Understanding the analysis">
                After parsing, results are grouped into four areas. &quot;Parsed
                Process&quot; shows the structured workflow. &quot;Conflicts&quot;
                flags where agents overlap or contradict each other.
                &quot;Gaps&quot; highlights missing handoffs or undefined
                responsibilities. &quot;Artifacts&quot; lists the agents and
                playbooks involved.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!analysisResult && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-[340px] text-center">
                <Network className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Submit a process description to see analysis results
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Select an example or write your own process definition
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-[340px] text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">
                  Parsing process definition...
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Detecting conflicts, gaps, and generating artifacts
                </p>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <Accordion type="multiple" defaultValue={["process", "conflicts", "gaps", "artifacts"]}>
                <AccordionItem value="process">
                  <AccordionTrigger>Parsed Process</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name</span>
                          <p className="font-medium">
                            {analysisResult.process.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ID</span>
                          <p className="font-mono text-xs">
                            {analysisResult.process.id}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Trigger</span>
                          <p>{analysisResult.process.trigger}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Owner</span>
                          <p>{analysisResult.process.owner}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Steps
                        </p>
                        <ol className="space-y-1.5">
                          {analysisResult.process.steps.map((step, i) => (
                            <li
                              key={i}
                              className="text-sm flex items-start gap-2"
                            >
                              <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0">
                                {i + 1}.
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="conflicts">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      Conflicts Detected
                      <Badge variant="secondary" className="text-xs">
                        {analysisResult.conflicts.length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {analysisResult.conflicts.map((conflict, i) => (
                        <div
                          key={i}
                          className="rounded-md border p-3 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                            <SeverityBadge severity={conflict.severity} />
                          </div>
                          <p className="text-sm">{conflict.description}</p>
                          {conflict.resolution && (
                            <div className="text-sm bg-muted/30 rounded-md p-2">
                              <span className="text-muted-foreground text-xs font-medium">
                                Suggested resolution:
                              </span>
                              <p className="mt-0.5">{conflict.resolution}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="gaps">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      Gaps Identified
                      <Badge variant="secondary" className="text-xs">
                        {analysisResult.gaps.length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {analysisResult.gaps.map((gap, i) => (
                        <div
                          key={i}
                          className="rounded-md border p-3 space-y-2"
                        >
                          <SeverityBadge severity={gap.severity} />
                          <p className="text-sm">{gap.description}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="artifacts">
                  <AccordionTrigger>Created Artifacts</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                          <Users className="h-3.5 w-3.5" />
                          Agents Involved
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {analysisResult.artifacts.agents.map((agent) => (
                            <Badge key={agent} variant="outline" className="text-xs">
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                          <BookOpen className="h-3.5 w-3.5" />
                          Playbooks Referenced
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {analysisResult.artifacts.playbooks.map(
                            (playbook) => (
                              <Badge
                                key={playbook}
                                variant="secondary"
                                className="text-xs"
                              >
                                {playbook}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Process Registry */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Process Registry</h2>
            <HelpPopover title="About the registry">
              The registry tracks all orchestration processes that have been
              defined and validated. Active processes are in use by agents.
              Draft processes are still being refined before activation.
            </HelpPopover>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            All registered orchestration processes and their current status.
            {" "}
            <Link
              href="/docs?path=architecture/system/process-orchestration-overview.md"
              className="text-primary hover:underline"
            >
              Read the full documentation
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Processes" value={4} />
          <MetricCard label="Active" value={3} />
          <MetricCard label="Draft" value={1} />
          <MetricCard label="Conflicts" value={2} />
        </div>

        <div className="space-y-2">
          {REGISTRY_PROCESSES.map((proc) => {
            const details = proc.mockKey ? MOCK_RESULTS[proc.mockKey] : null;
            const isExpanded = expandedProcess === proc.id;

            return (
              <Card key={proc.id} className={isExpanded ? "border-primary/30" : ""}>
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() =>
                    setExpandedProcess(isExpanded ? null : proc.id)
                  }
                >
                  <div className="flex items-center gap-3">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{proc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground font-mono">
                          {proc.id}
                        </span>
                        {details && (
                          <>
                            <span className="text-muted-foreground/30">|</span>
                            <span className="text-xs text-muted-foreground">
                              {details.process.steps.length} steps
                            </span>
                            <span className="text-muted-foreground/30">|</span>
                            <span className="text-xs text-muted-foreground">
                              {details.artifacts.agents.length} agents
                            </span>
                            {details.conflicts.length > 0 && (
                              <>
                                <span className="text-muted-foreground/30">|</span>
                                <span className="text-xs text-yellow-400">
                                  {details.conflicts.length} conflict{details.conflicts.length !== 1 && "s"}
                                </span>
                              </>
                            )}
                            {details.gaps.length > 0 && (
                              <>
                                <span className="text-muted-foreground/30">|</span>
                                <span className="text-xs text-orange-400">
                                  {details.gaps.length} gap{details.gaps.length !== 1 && "s"}
                                </span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {proc.owner}
                    </span>
                    <StatusBadge status={proc.status} />
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {isExpanded && details && (
                  <CardContent className="pt-0 pb-4 px-4">
                    <Separator className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Trigger & Steps */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Trigger
                            </span>
                          </div>
                          <p className="text-sm">{details.process.trigger}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Workflow Steps
                          </p>
                          <ol className="space-y-1.5">
                            {details.process.steps.map((step, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0">
                                  {i + 1}.
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      {/* Agents, Playbooks, Conflicts, Gaps */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Agents Involved
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {details.artifacts.agents.map((agent) => (
                              <Badge key={agent} variant="outline" className="text-xs">
                                {agent}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Playbooks
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {details.artifacts.playbooks.map((pb) => (
                              <Badge key={pb} variant="secondary" className="text-xs">
                                {pb}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {details.conflicts.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-yellow-400 uppercase tracking-wide mb-1.5">
                              Conflicts ({details.conflicts.length})
                            </p>
                            {details.conflicts.map((c, i) => (
                              <div key={i} className="text-xs rounded-md border border-yellow-600/20 bg-yellow-600/5 p-2 mb-1.5">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                                  <SeverityBadge severity={c.severity} />
                                </div>
                                <p className="text-muted-foreground">{c.description}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {details.gaps.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-orange-400 uppercase tracking-wide mb-1.5">
                              Gaps ({details.gaps.length})
                            </p>
                            {details.gaps.map((g, i) => (
                              <div key={i} className="text-xs rounded-md border border-orange-600/20 bg-orange-600/5 p-2 mb-1.5">
                                <SeverityBadge severity={g.severity} />
                                <p className="text-muted-foreground mt-1">{g.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}

                {isExpanded && !details && (
                  <CardContent className="pt-0 pb-4 px-4">
                    <Separator className="mb-4" />
                    <p className="text-sm text-muted-foreground italic">
                      This process is in draft status. No analysis data available yet.
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
