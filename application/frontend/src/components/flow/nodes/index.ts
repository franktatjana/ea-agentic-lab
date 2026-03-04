import { AgentNode } from "./AgentNode";
import { FlowNode } from "./FlowNode";
import { ToolNode } from "./ToolNode";
import { VariantNode } from "./VariantNode";
import { PromptNode } from "./PromptNode";
import { SubAgentNode } from "./SubAgentNode";
import { OrchestratorNode } from "./OrchestratorNode";

export const nodeTypes = {
  agentNode: AgentNode,
  flowNode: FlowNode,
  toolNode: ToolNode,
  variantNode: VariantNode,
  promptNode: PromptNode,
  subAgentNode: SubAgentNode,
  orchestratorNode: OrchestratorNode,
} as const;
