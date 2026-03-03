import type { Node, Edge } from "@xyflow/react";
import type { AgentDefinition } from "@/types";

const NODE_W = 210;
const AGENT_H = 180;
const FLOW_GAP = 240;
const ROW_GAP = 160;
const SIDE_GAP = 60;
const PROMPT_GAP = 90;

const ACCENT = "#8b5cf6";
const EDGE_COLOR = "#525252";

function centerRow(count: number, gap: number, y: number): { x: number; y: number }[] {
  const totalWidth = (count - 1) * gap;
  const startX = -totalWidth / 2;
  return Array.from({ length: count }, (_, i) => ({ x: startX + i * gap, y }));
}

export function buildFlowGraph(
  def: AgentDefinition,
  expandedFlowId: string | null,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ext = (def as any)["x-ea-agent"] as Record<string, unknown> | undefined;
  const promptRegistry = ext?.prompt_registry as Record<string, Record<string, unknown>> | undefined;

  const flows = def.flows ?? [];
  const tools = def.tools ?? [];
  const variants = def.specialized_agents ?? [];

  // Agent node centered
  nodes.push({
    id: def.id,
    type: "agentNode",
    position: { x: -NODE_W / 2, y: -AGENT_H / 2 },
    data: {
      name: def.name,
      description: def.description,
      modelId: (def.llm_configuration as Record<string, unknown>)?.model_id ?? null,
      humanInTheLoop: def.human_in_the_loop,
    },
  });

  // Flows spread horizontally below agent
  const flowY = AGENT_H / 2 + ROW_GAP;
  const flowPositions = centerRow(flows.length, FLOW_GAP, flowY);
  flows.forEach((flow, i) => {
    const pos = flowPositions[i];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flowExt = ((flow as any)["x-ea-agent"] ?? {}) as Record<string, unknown>;
    const steps = (flowExt.workflow_shorthand ?? []) as Array<Record<string, unknown>>;
    const isExpanded = expandedFlowId === flow.id;

    nodes.push({
      id: flow.id,
      type: "flowNode",
      position: pos,
      data: {
        name: flow.name,
        description: flow.description,
        stepCount: steps.length,
        isExpanded,
        isDimmed: expandedFlowId !== null && !isExpanded,
      },
    });

    edges.push({
      id: `${def.id}->${flow.id}`,
      source: def.id,
      sourceHandle: "prompts",
      target: flow.id,
      type: "smoothstep",
      style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
    });

    // Expanded: prompt chain below this flow
    if (isExpanded && steps.length > 0) {
      steps.forEach((step, si) => {
        const promptKey = String(step.prompt ?? "");
        const promptId = `${flow.id}__prompt__${promptKey}__${step.step}`;
        const registry = promptRegistry?.[promptKey];

        nodes.push({
          id: promptId,
          type: "promptNode",
          position: {
            x: pos.x + 10,
            y: pos.y + 80 + si * PROMPT_GAP,
          },
          data: {
            promptKey,
            stepNumber: step.step,
            description: registry?.description ?? step.description ?? "",
            input: step.input ?? "",
            isFirst: si === 0,
            isLast: si === steps.length - 1,
          },
        });

        const prevSteps = steps as Array<Record<string, unknown>>;
        const sourceId =
          si === 0
            ? flow.id
            : `${flow.id}__prompt__${prevSteps[si - 1].prompt}__${prevSteps[si - 1].step}`;
        edges.push({
          id: `${sourceId}->${promptId}`,
          source: sourceId,
          target: promptId,
          type: "straight",
          style: { stroke: ACCENT, strokeWidth: 2 },
          animated: true,
        });
      });
    }
  });

  // Tools flanking left of agent
  const toolStackHeight = (tools.length - 1) * SIDE_GAP;
  const toolStartY = -toolStackHeight / 2;
  const toolX = -NODE_W / 2 - FLOW_GAP;

  tools.forEach((tool, i) => {
    nodes.push({
      id: tool.id,
      type: "toolNode",
      position: { x: toolX, y: toolStartY + i * SIDE_GAP },
      data: {
        name: tool.name,
        description: tool.description ?? "",
      },
    });

    edges.push({
      id: `${def.id}->${tool.id}`,
      source: def.id,
      sourceHandle: "tools",
      target: tool.id,
      type: "smoothstep",
      style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
    });
  });

  // Variants flanking right of agent
  const variantStackHeight = (variants.length - 1) * SIDE_GAP;
  const variantStartY = -variantStackHeight / 2;
  const variantX = NODE_W / 2 + FLOW_GAP - 60;

  variants.forEach((variant: Record<string, unknown>, i: number) => {
    const variantId = String(variant.id ?? `variant-${i}`);
    nodes.push({
      id: variantId,
      type: "variantNode",
      position: { x: variantX, y: variantStartY + i * SIDE_GAP },
      data: {
        name: String(variant.name ?? ""),
        description: String(variant.description ?? ""),
      },
    });

    edges.push({
      id: `${def.id}->${variantId}`,
      source: def.id,
      sourceHandle: "variants",
      target: variantId,
      type: "smoothstep",
      style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
    });
  });

  return { nodes, edges };
}
