"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown, Plus } from "lucide-react";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { CreateNodeRequest } from "@/types";

function toNodeId(name: string): string {
  return name
    .toUpperCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
    .slice(0, 50);
}

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  realmId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateNodeDialog({ realmId, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [nodeIdEdited, setNodeIdEdited] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [archetype, setArchetype] = useState("");
  const [domain, setDomain] = useState("");
  const [track, setTrack] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [operatingMode, setOperatingMode] = useState("pre_sales");
  const [targetCompletion, setTargetCompletion] = useState("");
  const [opportunityArr, setOpportunityArr] = useState("");
  const [probability, setProbability] = useState("");
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  // Auto-generate node_id from name
  useEffect(() => {
    if (!nodeIdEdited) {
      setNodeId(toNodeId(name));
    }
  }, [name, nodeIdEdited]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setName("");
      setNodeId("");
      setNodeIdEdited(false);
      setPurpose("");
      setArchetype("");
      setDomain("");
      setTrack("");
      setShowOptional(false);
      setOperatingMode("pre_sales");
      setTargetCompletion("");
      setOpportunityArr("");
      setProbability("");
      setError("");
      setWarnings([]);
    }
  }, [open]);

  const { data: archetypesData } = useQuery({
    queryKey: ["archetypes"],
    queryFn: () => api.getArchetypes(),
    enabled: open,
  });

  const { data: tracksData } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => api.getEngagementTracks(),
    enabled: open,
  });

  const archetypes = useMemo(
    () => (archetypesData?.archetypes ?? {}) as Record<string, Record<string, unknown>>,
    [archetypesData],
  );

  const domains = useMemo(
    () => (archetypesData?.domains ?? {}) as Record<string, Record<string, unknown>>,
    [archetypesData],
  );

  const trackOptions = useMemo(
    () => (tracksData?.tracks ?? {}) as Record<string, Record<string, unknown>>,
    [tracksData],
  );

  const selectedArchetype = archetype ? archetypes[archetype] : null;

  const canSubmit = name.trim() && nodeId.length >= 3 && archetype && domain && track;

  const createMutation = useMutation({
    mutationFn: (data: CreateNodeRequest) => api.createNode(realmId, data),
    onSuccess: (data) => {
      setWarnings(data.warnings || []);
      queryClient.invalidateQueries({ queryKey: ["nodes", realmId] });
      if (!data.warnings?.length) {
        onOpenChange(false);
      }
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = () => {
    setError("");
    setWarnings([]);

    const data: CreateNodeRequest = {
      node_id: nodeId,
      name: name.trim(),
      archetype,
      domain,
      track,
      operating_mode: operatingMode,
    };
    if (purpose.trim()) data.purpose = purpose.trim();
    if (targetCompletion) data.target_completion = targetCompletion;
    if (opportunityArr) data.opportunity_arr = parseInt(opportunityArr, 10);
    if (probability) data.probability = parseInt(probability, 10);

    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Node in {realmId.replace(/_/g, " ")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Node Identity */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Node Identity
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                placeholder="e.g. Security Platform Consolidation"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Node ID</Label>
              <Input
                placeholder="SECURITY_CONSOLIDATION"
                value={nodeId}
                onChange={(e) => {
                  setNodeId(e.target.value.toUpperCase());
                  setNodeIdEdited(true);
                }}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                SCREAMING_SNAKE_CASE, 3-50 characters
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Purpose (optional)</Label>
              <Input
                placeholder="Brief description of this engagement"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
          </div>

          {/* Blueprint Classification */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Blueprint Classification
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Archetype</Label>
                <Select value={archetype} onValueChange={setArchetype}>
                  <SelectTrigger>
                    <SelectValue placeholder="Engagement type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(archetypes).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {String(val.name || formatLabel(key))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Domain</Label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Technical focus..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(domains).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {String(val.name || formatLabel(key))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Track</Label>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger>
                  <SelectValue placeholder="Delivery track..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(trackOptions).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {String(val.name || formatLabel(key))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedArchetype && !!(selectedArchetype.minimum_track || selectedArchetype.track_override) && (
              <div className="flex flex-wrap gap-2">
                {!!selectedArchetype.minimum_track && (
                  <Badge variant="outline" className="text-[10px]">
                    Min track: {formatLabel(String(selectedArchetype.minimum_track))}
                  </Badge>
                )}
                {!!selectedArchetype.track_override && (
                  <Badge variant="outline" className="text-[10px] border-yellow-600/30 text-yellow-400">
                    Forces: {formatLabel(String(selectedArchetype.track_override))}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Optional Fields */}
          <div>
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={`h-3 w-3 transition-transform ${showOptional ? "rotate-0" : "-rotate-90"}`}
              />
              Optional fields
            </button>

            {showOptional && (
              <div className="space-y-3 mt-3 pl-4 border-l border-muted">
                <div className="space-y-1.5">
                  <Label className="text-xs">Operating Mode</Label>
                  <Select value={operatingMode} onValueChange={setOperatingMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre_sales">Pre-Sales</SelectItem>
                      <SelectItem value="implementation">Implementation</SelectItem>
                      <SelectItem value="post_sales">Post-Sales</SelectItem>
                      <SelectItem value="renewal">Renewal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Target Completion</Label>
                  <Input
                    type="date"
                    value={targetCompletion}
                    onChange={(e) => setTargetCompletion(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Opportunity ARR</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 800000"
                      value={opportunityArr}
                      onChange={(e) => setOpportunityArr(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Probability %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0-100"
                      value={probability}
                      onChange={(e) => setProbability(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Errors and Warnings */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          {warnings.length > 0 && (
            <div className="space-y-1">
              {warnings.map((w, i) => (
                <p key={i} className="text-xs text-yellow-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {w}
                </p>
              ))}
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)} className="mt-2">
                Close
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Node"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
