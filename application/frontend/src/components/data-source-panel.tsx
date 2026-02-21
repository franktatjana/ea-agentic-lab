"use client";

import { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Info,
  Bot,
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileInput,
  FileOutput,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { DataSourceEntry } from "@/types";

const DataSourceContext = createContext<{
  openSection: string | null;
  setOpenSection: (section: string | null) => void;
}>({ openSection: null, setOpenSection: () => {} });

export function DataSourceProvider({ children }: { children: React.ReactNode }) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <DataSourceContext.Provider value={{ openSection, setOpenSection }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function DataSourceTrigger({ pageSection }: { pageSection: string }) {
  const { openSection, setOpenSection } = useContext(DataSourceContext);
  const isActive = openSection === pageSection;

  return (
    <button
      onClick={() => setOpenSection(isActive ? null : pageSection)}
      className={cn(
        "inline-flex items-center gap-1 text-xs transition-colors border rounded-md px-2 py-1",
        isActive
          ? "text-foreground border-border bg-muted"
          : "text-muted-foreground/70 hover:text-foreground border-transparent hover:border-border"
      )}
      title="View data sources"
    >
      <Info className="h-3.5 w-3.5" />
      <span>Sources</span>
    </button>
  );
}

function formatInputLabel(input: Record<string, string> | string): string {
  if (typeof input === "string") return input;
  return input.artifact || input.description || JSON.stringify(input);
}

function SourceCard({ source }: { source: DataSourceEntry }) {
  const isManual = source.source_type === "manual";
  const agent = source.agent;
  const playbook = source.playbook;

  return (
    <Card className="border-border/60">
      <CardContent className="p-4 space-y-3">
        {source.section_label && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {source.section_label}
          </p>
        )}

        {agent && (
          <div className="flex items-start gap-2.5">
            <Bot className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{agent.purpose}</p>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs">
                  {agent.agent_id}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {agent.team}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {playbook && (
          <>
            <Separator className="my-1" />
            <div className="flex items-start gap-2.5">
              <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium">{playbook.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {playbook.playbook_id}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {playbook.objective}
                </p>
                {playbook.frequency && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{playbook.frequency}</span>
                  </div>
                )}
              </div>
            </div>

            <Accordion type="single" collapsible>
              {playbook.inputs && playbook.inputs.length > 0 && (
                <AccordionItem value="inputs" className="border-b-0">
                  <AccordionTrigger className="py-2 text-xs text-muted-foreground hover:no-underline">
                    <span className="flex items-center gap-1.5">
                      <FileInput className="h-3 w-3" />
                      Inputs ({playbook.inputs.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <ul className="space-y-1">
                      {playbook.inputs.map((input, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                          {formatInputLabel(input)}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {playbook.outputs && Object.keys(playbook.outputs).length > 0 && (
                <AccordionItem value="outputs" className="border-b-0">
                  <AccordionTrigger className="py-2 text-xs text-muted-foreground hover:no-underline">
                    <span className="flex items-center gap-1.5">
                      <FileOutput className="h-3 w-3" />
                      Output
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {"format" in playbook.outputs && (
                        <p>Format: {String(playbook.outputs.format)}</p>
                      )}
                      {"path" in playbook.outputs && (
                        <p className="font-mono text-[10px]">{String(playbook.outputs.path)}</p>
                      )}
                      {Array.isArray(playbook.outputs.sections) && (
                        <ul className="space-y-0.5 mt-1">
                          {(playbook.outputs.sections as string[]).map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {playbook.validation_checks && (
                (() => {
                  const checks = [
                    ...(playbook.validation_checks.post_execution || []),
                    ...(playbook.validation_checks.output_quality || []),
                  ];
                  if (checks.length === 0) return null;
                  return (
                    <AccordionItem value="validation" className="border-b-0">
                      <AccordionTrigger className="py-2 text-xs text-muted-foreground hover:no-underline">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3" />
                          Validation ({checks.length})
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <ul className="space-y-1">
                          {checks.map((check, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-green-500/60" />
                              {typeof check === "string" ? check : String(check)}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })()
              )}
            </Accordion>
          </>
        )}

        {isManual && !playbook && (
          <>
            {agent && <Separator className="my-1" />}
            <p className="text-xs text-muted-foreground italic">
              {source.description || "Manual entry, no automated playbook"}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function DataSourcePanel() {
  const { openSection, setOpenSection } = useContext(DataSourceContext);
  const isOpen = openSection !== null;

  const { data, isLoading } = useQuery({
    queryKey: ["dataSource", openSection],
    queryFn: () => api.getDataSources(openSection!),
    enabled: isOpen,
  });

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-[420px] bg-background border-l shadow-xl flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-base font-semibold">Data Sources</h2>
          {data && (
            <p className="text-sm text-muted-foreground">{data.label}</p>
          )}
        </div>
        <button
          onClick={() => setOpenSection(null)}
          className="rounded-xs opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : data?.sources.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No data source mapping defined for this section.
          </p>
        ) : (
          data?.sources.map((source, i) => (
            <SourceCard key={i} source={source} />
          ))
        )}
      </div>
    </div>
  );
}
