"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpPopover } from "@/components/help-popover";
import { TabHeader } from "./shared";

export function GrowthTab({ profile }: { profile: Record<string, unknown> }) {
  const growth = (profile.growth || profile.account_growth || profile.growth_strategy) as Record<string, unknown> | undefined;

  const rawObjectives = growth?.objectives || growth?.account_objectives || profile.account_objectives || profile.objectives;
  const objectives: Record<string, unknown>[] | string[] | undefined = (() => {
    if (!rawObjectives) return undefined;
    if (Array.isArray(rawObjectives)) return rawObjectives;
    if (typeof rawObjectives === "object") {
      const grouped = rawObjectives as Record<string, unknown>;
      return Object.entries(grouped).flatMap(([term, items]) =>
        Array.isArray(items)
          ? items.map((item: Record<string, unknown>) => ({
              ...item,
              term: term.replace(/_/g, " "),
            }))
          : []
      );
    }
    return undefined;
  })();

  const whitespace = (growth?.whitespace || growth?.whitespace_analysis || profile.whitespace || profile.whitespace_analysis) as Record<string, unknown> | string[] | undefined;

  return (
    <div className="space-y-6">
      <TabHeader pageSection="growth" />
      {objectives && Array.isArray(objectives) && objectives.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Account Objectives
              <HelpPopover title="Account objectives">
                Strategic goals for this account, such as expanding into new
                business units, increasing adoption, or renewing at a higher
                tier. These guide the AE Agent&apos;s account planning.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {objectives.map((obj, i) => {
                if (typeof obj === "string") {
                  return (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  );
                }
                const o = obj as Record<string, unknown>;
                return (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <span>{String(o.description || o.objective || JSON.stringify(o))}</span>
                      {!!(o.target || o.term) && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {!!o.target && String(o.target)}
                          {!!o.term && <> · {String(o.term)}</>}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {whitespace && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Whitespace Analysis
              <HelpPopover title="Whitespace analysis">
                Untapped expansion opportunities within this account: departments
                not yet engaged, use cases not deployed, or regions not covered.
                Dollar values represent estimated annual recurring revenue (ARR)
                potential if the opportunity is closed. Fit scores indicate how
                well the opportunity matches our product capabilities. Blockers
                show what needs to be resolved before pursuit.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(whitespace) ? (
              <ul className="space-y-2">
                {whitespace.map((item, i) => (
                  <li key={i} className="text-sm p-2 rounded bg-muted/30">
                    {typeof item === "string" ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-4">
                {Object.entries(whitespace).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs font-medium text-muted-foreground capitalize mb-1.5">{key.replace(/_/g, " ")}</p>
                    {Array.isArray(val) ? (
                      <ul className="space-y-1.5">
                        {(val as Record<string, unknown>[]).map((item, j) => (
                          <li key={j} className="text-sm p-2.5 rounded bg-muted/30 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{String(item.department || item.use_case || item.region || JSON.stringify(item))}</span>
                              {!!item.potential && (
                                <span className="text-xs font-medium text-green-400">
                                  ${Number(item.potential).toLocaleString()} <span className="text-muted-foreground font-normal">est. ARR</span>
                                </span>
                              )}
                            </div>
                            {!!(item.fit_score || item.blocker || item.status) && (
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {!!item.fit_score && <span>Fit: <span className={item.fit_score === "HIGH" ? "text-green-400" : item.fit_score === "MEDIUM" ? "text-yellow-400" : "text-muted-foreground"}>{String(item.fit_score)}</span></span>}
                                {!!item.status && <span>{String(item.status)}</span>}
                                {!!item.blocker && <span className="text-yellow-400/80">Blocker: {String(item.blocker)}</span>}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm">{typeof val === "string" ? val : JSON.stringify(val)}</p>
                    )}
                  </div>
                ))}
                {(() => {
                  const total = Object.values(whitespace).flat().reduce<number>((sum, item) => {
                    if (typeof item === "object" && item && "potential" in item) {
                      return sum + Number((item as Record<string, unknown>).potential || 0);
                    }
                    return sum;
                  }, 0);
                  return total > 0 ? (
                    <div className="pt-3 border-t border-border flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total expansion potential</span>
                      <span className="font-semibold text-green-400">${total.toLocaleString()} <span className="text-muted-foreground font-normal text-xs">est. ARR</span></span>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!objectives?.length && !whitespace && (
        <p className="text-muted-foreground text-sm">No growth data available.</p>
      )}
    </div>
  );
}
