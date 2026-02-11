"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { ChevronRight, ChevronDown, ExternalLink } from "lucide-react";
import "@xyflow/react/dist/style.css";

type MapNodeData = {
  label: string;
  subtitle?: string;
  href?: string;
  tier: "root" | "pillar" | "concept" | "lifecycle";
  color?: string;
  step?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  [key: string]: unknown;
};

type MapNode = Node<MapNodeData>;

// Parent → children relationship for expand/collapse
const CHILDREN_MAP: Record<string, string[]> = {
  root: ["people", "customers", "knowledge", "lc1", "lc2", "lc3", "lc4", "lc5", "lc6"],
  people: ["roles", "teams"],
  customers: ["archetypes", "blueprints", "tracks"],
  knowledge: ["playbooks", "canvases"],
};

// Layout constants
const CX = 450;
const PILLAR_Y = 130;
const CONCEPT_Y = 260;
const LIFECYCLE_Y = 410;

const initialNodes: MapNode[] = [
  {
    id: "root",
    type: "mapNode",
    position: { x: CX - 90, y: 10 },
    data: { label: "EA Agentic Lab", tier: "root", href: "/" },
  },
  {
    id: "people",
    type: "mapNode",
    position: { x: 60, y: PILLAR_Y },
    data: { label: "People + Agents", tier: "pillar", color: "blue", href: "/playbooks" },
  },
  {
    id: "customers",
    type: "mapNode",
    position: { x: CX - 90, y: PILLAR_Y },
    data: { label: "Customers + Blueprints", tier: "pillar", color: "purple", href: "/blueprints" },
  },
  {
    id: "knowledge",
    type: "mapNode",
    position: { x: 660, y: PILLAR_Y },
    data: { label: "Knowledge + Artifacts", tier: "pillar", color: "green", href: "/docs" },
  },
  {
    id: "roles",
    type: "mapNode",
    position: { x: 20, y: CONCEPT_Y },
    data: { label: "Agent Roles", tier: "concept", color: "blue", href: "/playbooks" },
  },
  {
    id: "teams",
    type: "mapNode",
    position: { x: 145, y: CONCEPT_Y },
    data: { label: "Teams", tier: "concept", color: "blue", href: "/playbooks" },
  },
  {
    id: "archetypes",
    type: "mapNode",
    position: { x: 270, y: CONCEPT_Y },
    data: { label: "Archetypes", tier: "concept", color: "purple", href: "/blueprints/archetypes" },
  },
  {
    id: "blueprints",
    type: "mapNode",
    position: { x: 395, y: CONCEPT_Y },
    data: { label: "Blueprints", tier: "concept", color: "purple", href: "/blueprints/reference" },
  },
  {
    id: "tracks",
    type: "mapNode",
    position: { x: 520, y: CONCEPT_Y },
    data: { label: "Tracks", tier: "concept", color: "purple", href: "/blueprints" },
  },
  {
    id: "playbooks",
    type: "mapNode",
    position: { x: 640, y: CONCEPT_Y },
    data: { label: "Playbooks", tier: "concept", color: "green", href: "/playbooks" },
  },
  {
    id: "canvases",
    type: "mapNode",
    position: { x: 745, y: CONCEPT_Y },
    data: { label: "Canvases", tier: "concept", color: "green" },
  },
  {
    id: "lc1",
    type: "mapNode",
    position: { x: 15, y: LIFECYCLE_Y },
    data: { label: "Classify", tier: "lifecycle", step: 1 },
  },
  {
    id: "lc2",
    type: "mapNode",
    position: { x: 155, y: LIFECYCLE_Y },
    data: { label: "Compose", tier: "lifecycle", step: 2, href: "/blueprints" },
  },
  {
    id: "lc3",
    type: "mapNode",
    position: { x: 295, y: LIFECYCLE_Y },
    data: { label: "Execute", tier: "lifecycle", step: 3, href: "/playbooks" },
  },
  {
    id: "lc4",
    type: "mapNode",
    position: { x: 435, y: LIFECYCLE_Y },
    data: { label: "Render", tier: "lifecycle", step: 4 },
  },
  {
    id: "lc5",
    type: "mapNode",
    position: { x: 575, y: LIFECYCLE_Y },
    data: { label: "Store", tier: "lifecycle", step: 5 },
  },
  {
    id: "lc6",
    type: "mapNode",
    position: { x: 715, y: LIFECYCLE_Y },
    data: { label: "Learn", tier: "lifecycle", step: 6 },
  },
];

const EDGE_STYLE = { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.5, opacity: 0.3 };
const LIFECYCLE_EDGE = { stroke: "hsl(var(--primary))", strokeWidth: 2, opacity: 0.4 };

const initialEdges: Edge[] = [
  { id: "r-p1", source: "root", target: "people", style: EDGE_STYLE },
  { id: "r-p2", source: "root", target: "customers", style: EDGE_STYLE },
  { id: "r-p3", source: "root", target: "knowledge", style: EDGE_STYLE },
  { id: "p-roles", source: "people", target: "roles", style: EDGE_STYLE },
  { id: "p-teams", source: "people", target: "teams", style: EDGE_STYLE },
  { id: "c-arch", source: "customers", target: "archetypes", style: EDGE_STYLE },
  { id: "c-bp", source: "customers", target: "blueprints", style: EDGE_STYLE },
  { id: "c-tracks", source: "customers", target: "tracks", style: EDGE_STYLE },
  { id: "k-pb", source: "knowledge", target: "playbooks", style: EDGE_STYLE },
  { id: "k-canvas", source: "knowledge", target: "canvases", style: EDGE_STYLE },
  { id: "lc-12", source: "lc1", target: "lc2", type: "straight", style: LIFECYCLE_EDGE },
  { id: "lc-23", source: "lc2", target: "lc3", type: "straight", style: LIFECYCLE_EDGE },
  { id: "lc-34", source: "lc3", target: "lc4", type: "straight", style: LIFECYCLE_EDGE },
  { id: "lc-45", source: "lc4", target: "lc5", type: "straight", style: LIFECYCLE_EDGE },
  { id: "lc-56", source: "lc5", target: "lc6", type: "straight", style: LIFECYCLE_EDGE },
];

const TIER_STYLES: Record<string, string> = {
  root: "px-5 py-2.5 text-sm font-bold bg-primary/10 border-primary/40 text-foreground",
  pillar: "px-4 py-2 text-xs font-semibold",
  concept: "px-3 py-1.5 text-[11px] font-medium",
  lifecycle: "px-3 py-1.5 text-[11px] font-medium bg-muted/40 border-muted-foreground/20",
};

const COLOR_BORDERS: Record<string, string> = {
  blue: "border-blue-500/40 bg-blue-600/10 text-blue-300",
  purple: "border-purple-500/40 bg-purple-600/10 text-purple-300",
  green: "border-green-500/40 bg-green-600/10 text-green-300",
};

function MapNodeComponent({ data }: NodeProps<MapNode>) {
  const tierStyle = TIER_STYLES[data.tier] || "";
  const colorStyle = data.color ? COLOR_BORDERS[data.color] || "" : "";
  const interactive = data.hasChildren || !!data.href;

  return (
    <div
      className={`
        rounded-lg border transition-all
        ${tierStyle} ${colorStyle}
        ${interactive ? "cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-primary/5" : "opacity-70"}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <div className="flex items-center gap-1.5">
        {data.step && (
          <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
            {data.step}
          </span>
        )}
        <span className="flex-1">{data.label}</span>
        {data.href && data.hasChildren && (
          <span
            data-nav="true"
            className="p-0.5 rounded hover:bg-white/20 transition-colors opacity-50 hover:opacity-100"
          >
            <ExternalLink className="w-3 h-3" />
          </span>
        )}
        {data.hasChildren && (
          data.isExpanded
            ? <ChevronDown className="w-3 h-3 opacity-50" />
            : <ChevronRight className="w-3 h-3 opacity-50" />
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
      {data.tier === "lifecycle" && (
        <>
          <Handle type="target" position={Position.Left} id="left" className="!bg-transparent !border-0 !w-0 !h-0" />
          <Handle type="source" position={Position.Right} id="right" className="!bg-transparent !border-0 !w-0 !h-0" />
        </>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  mapNode: MapNodeComponent,
};

function FitViewOnChange({ trigger }: { trigger: number }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 50);
    return () => clearTimeout(timer);
  }, [trigger, fitView]);

  return null;
}

export function FrameworkMap() {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [fitTrigger, setFitTrigger] = useState(0);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        const collapse = (id: string) => {
          next.delete(id);
          CHILDREN_MAP[id]?.forEach(collapse);
        };
        collapse(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
    setFitTrigger((n) => n + 1);
  }, []);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: MapNode) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-nav]")) {
        if (node.data.href) router.push(node.data.href);
      } else if (CHILDREN_MAP[node.id]) {
        toggleNode(node.id);
      } else if (node.data.href) {
        router.push(node.data.href);
      }
    },
    [router, toggleNode],
  );

  const visibleNodeIds = useMemo(() => {
    const visible = new Set<string>(["root"]);
    const reveal = (parentId: string) => {
      const children = CHILDREN_MAP[parentId];
      if (!children || !expandedIds.has(parentId)) return;
      for (const childId of children) {
        visible.add(childId);
        reveal(childId);
      }
    };
    reveal("root");
    return visible;
  }, [expandedIds]);

  const visibleNodes = useMemo(
    () =>
      initialNodes.map((node) => ({
        ...node,
        hidden: !visibleNodeIds.has(node.id),
        data: {
          ...node.data,
          hasChildren: !!CHILDREN_MAP[node.id],
          isExpanded: expandedIds.has(node.id),
        },
      })),
    [visibleNodeIds, expandedIds],
  );

  const visibleEdges = useMemo(
    () =>
      initialEdges.map((edge) => ({
        ...edge,
        hidden: !visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target),
      })),
    [visibleNodeIds],
  );

  return (
    <div className="w-full h-[500px] rounded-xl border border-border/50 bg-background/50">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <FitViewOnChange trigger={fitTrigger} />
      </ReactFlow>
    </div>
  );
}
