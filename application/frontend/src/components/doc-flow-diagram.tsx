"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeProps,
  type NodeTypes,
  Handle,
  Position,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type FlowNodeData = {
  label: string;
  description?: string;
  color?: string;
  [key: string]: unknown;
};

type FlowNode = Node<FlowNodeData>;

/**
 * Compact schema for authoring in markdown code fences:
 * {
 *   "nodes": [{ "id": "a", "label": "Agent A", "x": 0, "y": 0, "description": "...", "color": "blue" }],
 *   "edges": [{ "from": "a", "to": "b", "label": "sends signal" }]
 * }
 */
type DiagramDef = {
  nodes: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    description?: string;
    color?: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
  height?: number;
};

const COLOR_STYLES: Record<string, string> = {
  blue: "border-blue-500/50 bg-blue-600/10 text-blue-300",
  purple: "border-purple-500/50 bg-purple-600/10 text-purple-300",
  green: "border-green-500/50 bg-green-600/10 text-green-300",
  red: "border-red-500/50 bg-red-600/10 text-red-300",
  yellow: "border-yellow-500/50 bg-yellow-600/10 text-yellow-300",
  default: "border-border bg-card text-foreground",
};

function DocFlowNode({ data }: NodeProps<FlowNode>) {
  const colorClass = COLOR_STYLES[data.color || "default"] || COLOR_STYLES.default;

  return (
    <div className={`rounded-lg border px-4 py-2 text-sm ${colorClass}`}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-transparent !border-0 !w-0 !h-0" />
      <div className="font-medium">{data.label}</div>
      {data.description && (
        <div className="text-xs opacity-70 mt-0.5">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  docFlow: DocFlowNode,
};

const EDGE_STYLE = { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.5, opacity: 0.5 };

function FlowInner({ definition }: { definition: string }) {
  const { nodes, edges, height } = useMemo(() => {
    try {
      const def: DiagramDef = JSON.parse(definition);

      const rfNodes: FlowNode[] = (def.nodes || []).map((n) => ({
        id: n.id,
        type: "docFlow",
        position: { x: n.x, y: n.y },
        data: {
          label: n.label,
          description: n.description,
          color: n.color,
        },
      }));

      const rfEdges: Edge[] = (def.edges || []).map((e, i) => ({
        id: `e-${i}`,
        source: e.from,
        target: e.to,
        label: e.label,
        style: EDGE_STYLE,
        labelStyle: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
      }));

      return { nodes: rfNodes, edges: rfEdges, height: def.height || 400 };
    } catch {
      return { nodes: [], edges: [], height: 400 };
    }
  }, [definition]);

  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-4 my-4">
        <p className="text-yellow-400 text-xs mb-2">Invalid React Flow diagram JSON</p>
        <pre className="text-sm overflow-x-auto">
          <code>{definition}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl border border-border/50 bg-background/50" style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.5}
        maxZoom={1.5}
      />
    </div>
  );
}

export function DocFlowDiagram({ definition }: { definition: string }) {
  return (
    <ReactFlowProvider>
      <FlowInner definition={definition} />
    </ReactFlowProvider>
  );
}
