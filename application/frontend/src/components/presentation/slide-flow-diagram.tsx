"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Controls,
  useReactFlow,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  type NodeTypes,
  Handle,
  Position,
  ReactFlowProvider,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Maximize2, X } from "lucide-react";

// ── Node data types ──

type SlideFlowNodeData = {
  label: string;
  subtitle?: string;
  badge?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  animDelay?: number;
  detail?: React.ReactNode;
  [key: string]: unknown;
};

type SlideFlowGroupData = {
  label: string;
  color?: string;
  animDelay?: number;
  [key: string]: unknown;
};

type SlideFlowDetailData = {
  content: React.ReactNode;
  color?: string;
  [key: string]: unknown;
};

type FlowNode = Node<SlideFlowNodeData>;
type GroupNode = Node<SlideFlowGroupData>;
type DetailNode = Node<SlideFlowDetailData>;

// ── Color palette (border + bg only, text handled explicitly) ──

const NODE_STYLES: Record<string, string> = {
  blue: "border-blue-400 bg-blue-500/20",
  teal: "border-teal-400 bg-teal-500/20",
  green: "border-green-400 bg-green-500/20",
  red: "border-red-400 bg-red-500/20",
  yellow: "border-yellow-400 bg-yellow-500/20",
  purple: "border-purple-400 bg-purple-500/20",
  cyan: "border-cyan-400 bg-cyan-500/20",
  orange: "border-orange-400 bg-orange-500/20",
  primary: "border-primary bg-primary/15",
  muted: "border-border bg-muted/60",
  default: "border-border bg-card/90",
};

const GROUP_COLORS: Record<string, string> = {
  blue: "border-blue-500/30 bg-blue-500/[0.03]",
  teal: "border-teal-500/30 bg-teal-500/[0.03]",
  green: "border-green-500/30 bg-green-500/[0.03]",
  default: "border-border/30 bg-muted/[0.03]",
};

const EDGE_COLORS: Record<string, string> = {
  blue: "hsl(217, 91%, 60%)",
  teal: "hsl(168, 76%, 42%)",
  green: "hsl(142, 71%, 45%)",
  red: "hsl(0, 72%, 51%)",
  yellow: "hsl(48, 96%, 53%)",
  purple: "hsl(271, 91%, 65%)",
  default: "hsl(var(--muted-foreground))",
};

// ── Node components ──

const HANDLE_STYLE = "!bg-transparent !border-0 !w-0 !h-0";

function SlideFlowNodeComponent({ data }: NodeProps<FlowNode>) {
  const styleClass = NODE_STYLES[data.color || "default"] || NODE_STYLES.default;
  const hasDetail = !!data.detail;
  const sizeClass =
    data.size === "lg" ? "px-10 py-6" :
    data.size === "sm" ? "px-7 py-4" :
    "px-8 py-5";
  const labelClass =
    data.size === "lg" ? "text-2xl" :
    data.size === "sm" ? "text-lg" :
    "text-xl";

  return (
    <div
      className={`rounded-xl border-2 backdrop-blur-sm ${sizeClass} ${styleClass} slide-flow-node ${hasDetail ? "cursor-pointer hover:brightness-125 transition-[filter]" : ""}`}
      style={{ animationDelay: `${data.animDelay || 0}ms` }}
    >
      <Handle type="target" position={Position.Top} className={HANDLE_STYLE} />
      <Handle type="target" position={Position.Left} id="left" className={HANDLE_STYLE} />
      <div className={`font-semibold ${labelClass} whitespace-nowrap text-foreground`}>{data.label}</div>
      {data.subtitle && (
        <div className="text-sm text-muted-foreground mt-1 whitespace-nowrap">{data.subtitle}</div>
      )}
      {data.badge && (
        <div className="mt-2 inline-block px-2.5 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
          {data.badge}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className={HANDLE_STYLE} />
      <Handle type="source" position={Position.Right} id="right" className={HANDLE_STYLE} />
    </div>
  );
}

function SlideFlowGroupComponent({ data }: NodeProps<GroupNode>) {
  const colorClass = GROUP_COLORS[data.color || "default"] || GROUP_COLORS.default;

  return (
    <div
      className={`rounded-xl border-2 border-dashed px-6 pt-3 pb-4 ${colorClass} slide-flow-node`}
      style={{ animationDelay: `${data.animDelay || 0}ms` }}
    >
      <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{data.label}</div>
    </div>
  );
}

function SlideFlowDetailComponent({ data }: NodeProps<DetailNode>) {
  const styleClass = NODE_STYLES[data.color || "default"] || NODE_STYLES.default;

  return (
    <div className={`rounded-xl border-2 backdrop-blur-sm p-6 w-[340px] ${styleClass} slide-flow-node`}>
      <Handle type="target" position={Position.Left} id="left" className={HANDLE_STYLE} />
      <div className="text-foreground">{data.content}</div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  slideFlow: SlideFlowNodeComponent,
  slideFlowGroup: SlideFlowGroupComponent,
  slideFlowDetail: SlideFlowDetailComponent,
};

// ── Edge builder ──

export function buildEdge(
  id: string,
  source: string,
  target: string,
  label?: string,
  color?: string,
  opts?: Partial<Edge>,
): Edge {
  const edgeColor = EDGE_COLORS[color || "default"] || EDGE_COLORS.default;
  return {
    id,
    source,
    target,
    label,
    animated: true,
    style: { stroke: edgeColor, strokeWidth: 2, opacity: 0.8 },
    labelStyle: { fill: "hsl(var(--foreground))", fontSize: 13, fontWeight: 500 },
    labelBgStyle: { fill: "hsl(var(--background))", fillOpacity: 0.9 },
    labelBgPadding: [8, 4] as [number, number],
    labelBgBorderRadius: 6,
    markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor, width: 18, height: 18 },
    ...opts,
  };
}

// ── Node builder ──

export function buildNode(
  id: string,
  label: string,
  x: number,
  y: number,
  opts?: {
    subtitle?: string;
    badge?: string;
    color?: string;
    size?: "sm" | "md" | "lg";
    animIndex?: number;
    type?: string;
    detail?: React.ReactNode;
  },
): Node {
  return {
    id,
    type: opts?.type || "slideFlow",
    position: { x, y },
    data: {
      label,
      subtitle: opts?.subtitle,
      badge: opts?.badge,
      color: opts?.color || "default",
      size: opts?.size || "md",
      animDelay: (opts?.animIndex ?? 0) * 100,
      detail: opts?.detail,
    },
  };
}

// ── Shared CSS ──

const FLOW_CSS = `
  @keyframes slideFlowNodeIn {
    from { opacity: 0; transform: scale(0.85) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .slide-flow-node {
    animation: slideFlowNodeIn 400ms ease-out both;
  }
  .react-flow__edge {
    animation: slideFlowEdgeIn 600ms ease-out both;
    animation-delay: 300ms;
  }
  @keyframes slideFlowEdgeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .react-flow__edge.animated path {
    stroke-dasharray: 5;
    animation: dashdraw 0.5s linear infinite;
  }
  @keyframes dashdraw {
    to { stroke-dashoffset: -10; }
  }
  .react-flow__background { display: none; }
  .react-flow__controls {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    overflow: hidden;
  }
  .react-flow__controls-button {
    background: transparent !important;
    border-bottom: 1px solid hsl(var(--border)) !important;
    width: 32px !important;
    height: 32px !important;
  }
  .react-flow__controls-button:hover {
    background: hsl(var(--muted)) !important;
  }
  .react-flow__controls-button svg {
    fill: hsl(var(--foreground)) !important;
  }
  .react-flow__controls-button:last-child {
    border-bottom: none !important;
  }
`;

// ── FitView on node changes ──

function FitViewOnChange({ deps }: { deps: unknown }) {
  const { fitView } = useReactFlow();
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    const t = setTimeout(() => fitView({ padding: 0.15, duration: 300, minZoom: 0.6 }), 50);
    return () => clearTimeout(t);
  }, [deps, fitView]);

  return null;
}

// ── Static flow renderer (compact preview) ──

function StaticFlowRenderer({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.05, duration: 400, minZoom: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        preventScrolling
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.02}
        maxZoom={2}
      />
      <style>{FLOW_CSS}</style>
    </>
  );
}

// ── Interactive flow renderer (expanded, draggable) ──

function InteractiveFlowRenderer({
  initialNodes,
  initialEdges,
  onNodeClick,
  fitViewDep,
}: {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodeClick?: (nodeId: string) => void;
  fitViewDep?: unknown;
}) {
  const [flowNodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, duration: 400, minZoom: 0.6 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        zoomOnDoubleClick
        preventScrolling={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={3}
        onNodeClick={onNodeClick ? (_, node) => onNodeClick(node.id) : undefined}
      >
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
      {fitViewDep !== undefined && <FitViewOnChange deps={fitViewDep} />}
      <style>{FLOW_CSS}</style>
    </>
  );
}

// ── Main component ──

export function SlideFlowDiagram({
  nodes,
  edges,
  height = 200,
}: {
  nodes: Node[];
  edges: Edge[];
  height?: number;
}) {
  const stableNodes = useMemo(() => nodes, [nodes]);
  const stableEdges = useMemo(() => edges, [edges]);
  const [expanded, setExpanded] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { displayNodes, displayEdges } = useMemo(() => {
    if (!selectedNodeId) return { displayNodes: stableNodes, displayEdges: stableEdges };

    const sourceNode = stableNodes.find((n) => n.id === selectedNodeId);
    if (!sourceNode) return { displayNodes: stableNodes, displayEdges: stableEdges };

    const detail = (sourceNode.data as SlideFlowNodeData)?.detail;
    if (!detail) return { displayNodes: stableNodes, displayEdges: stableEdges };

    const color = (sourceNode.data as SlideFlowNodeData)?.color || "default";
    const detailNode: Node = {
      id: "__detail__",
      type: "slideFlowDetail",
      position: { x: sourceNode.position.x + 350, y: sourceNode.position.y - 30 },
      data: { content: detail, color },
    };

    const detailEdge: Edge = {
      id: "__detail-edge__",
      source: selectedNodeId,
      target: "__detail__",
      sourceHandle: "right",
      targetHandle: "left",
      style: { stroke: EDGE_COLORS[color] || EDGE_COLORS.default, strokeWidth: 2, opacity: 0.5 },
    };

    return {
      displayNodes: [...stableNodes, detailNode],
      displayEdges: [...stableEdges, detailEdge],
    };
  }, [selectedNodeId, stableNodes, stableEdges]);

  const close = useCallback(() => {
    setExpanded(false);
    setSelectedNodeId(null);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (nodeId === "__detail__") return;
    const node = stableNodes.find((n) => n.id === nodeId);
    const detail = (node?.data as SlideFlowNodeData)?.detail;
    if (detail) {
      setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
    }
  }, [stableNodes]);

  useEffect(() => {
    if (!expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (selectedNodeId) {
          setSelectedNodeId(null);
        } else {
          close();
        }
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [expanded, close, selectedNodeId]);

  return (
    <>
      {/* Compact preview */}
      <div
        className="rounded-xl border border-border/30 bg-background/30 overflow-hidden cursor-pointer group relative"
        style={{ height }}
        onClick={() => setExpanded(true)}
      >
        <ReactFlowProvider>
          <StaticFlowRenderer nodes={stableNodes} edges={stableEdges} />
        </ReactFlowProvider>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-[2px]">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/80 border border-border/50 text-sm font-medium text-muted-foreground">
            <Maximize2 className="h-4 w-4" />
            Click to expand
          </div>
        </div>
      </div>

      {/* Expanded overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200"
          onClick={close}
        >
          <div className="flex-1 p-8 relative" onClick={(e) => e.stopPropagation()}>
            <ReactFlowProvider>
              <div className="w-full h-full rounded-xl border border-border/30 bg-background/30 overflow-hidden relative">
                <InteractiveFlowRenderer
                  initialNodes={displayNodes}
                  initialEdges={displayEdges}
                  onNodeClick={handleNodeClick}
                  fitViewDep={selectedNodeId}
                />
              </div>
            </ReactFlowProvider>
          </div>
          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-center text-xs text-muted-foreground/50 pb-4">
            {stableNodes.some((n) => (n.data as SlideFlowNodeData)?.detail)
              ? "Click a node for details / Scroll to zoom / Drag to pan"
              : "Scroll to zoom / Drag to pan / Escape to close"}
          </p>
        </div>
      )}
    </>
  );
}
