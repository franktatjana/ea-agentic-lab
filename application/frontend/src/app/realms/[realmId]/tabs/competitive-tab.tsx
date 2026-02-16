"use client";

import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpPopover } from "@/components/help-popover";

export function CompetitiveTab({ profile }: { profile: Record<string, unknown> }) {
  const competitive = (profile.competitive || profile.competitive_landscape) as Record<string, unknown> | undefined;
  const competitors = (competitive?.competitors || competitive?.primary_competitors || profile.competitors) as Record<string, unknown>[] | string[] | undefined;
  const differentiation = (competitive?.differentiation || competitive?.differentiation_points || profile.differentiation) as string[] | Record<string, unknown>[] | undefined;

  return (
    <div className="space-y-6">
      {competitors && Array.isArray(competitors) && competitors.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Competitors
              <HelpPopover title="Competitor analysis">
                Known competitors in this account, their strengths,
                weaknesses, and threat levels. The CI Agent uses this to
                generate battlecards and counter-positioning strategies.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {competitors.map((comp, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  {typeof comp === "string" ? (
                    <p className="text-sm">{comp}</p>
                  ) : (
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium">{String((comp as Record<string, unknown>).name || (comp as Record<string, unknown>).competitor || `Competitor ${i + 1}`)}</p>
                      {!!((comp as Record<string, unknown>).strengths || (comp as Record<string, unknown>).our_differentiation) && (
                        <p className="text-xs text-muted-foreground">
                          Strengths: {String((comp as Record<string, unknown>).strengths || (comp as Record<string, unknown>).our_differentiation)}
                        </p>
                      )}
                      {!!((comp as Record<string, unknown>).weaknesses || (comp as Record<string, unknown>).displacement_strategy) && (
                        <p className="text-xs text-muted-foreground">
                          Strategy: {String((comp as Record<string, unknown>).weaknesses || (comp as Record<string, unknown>).displacement_strategy)}
                        </p>
                      )}
                      {!!(comp as Record<string, unknown>).threat_level && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {String((comp as Record<string, unknown>).threat_level)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {differentiation && Array.isArray(differentiation) && differentiation.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Differentiation Points
              <HelpPopover title="Differentiation">
                Key areas where your solution stands out against competitors
                in this account. The SA Agent uses these to frame technical
                discussions and proof-of-value demonstrations.
              </HelpPopover>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {differentiation.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{typeof point === "string" ? point : String((point as Record<string, unknown>).description || JSON.stringify(point))}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {!competitors?.length && !differentiation?.length && (
        <p className="text-muted-foreground text-sm">No competitive data available.</p>
      )}
    </div>
  );
}
