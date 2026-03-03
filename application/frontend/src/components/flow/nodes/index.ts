import { AgentNode } from "./AgentNode";
import { FlowNode } from "./FlowNode";
import { ToolNode } from "./ToolNode";
import { VariantNode } from "./VariantNode";
import { PromptNode } from "./PromptNode";

export const nodeTypes = {
  agentNode: AgentNode,
  flowNode: FlowNode,
  toolNode: ToolNode,
  variantNode: VariantNode,
  promptNode: PromptNode,
} as const;
