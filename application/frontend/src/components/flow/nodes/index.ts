import { AgentNode } from "./AgentNode";
import { FlowNode } from "./FlowNode";
import { ToolNode } from "./ToolNode";
import { VariantNode } from "./VariantNode";
import { PromptNode } from "./PromptNode";
import { SubAgentNode } from "./SubAgentNode";
import { OrchestratorNode } from "./OrchestratorNode";
import { OutputNode } from "./OutputNode";
import { DestinationNode } from "./DestinationNode";
import { SubAgentGroupNode } from "./SubAgentGroupNode";

export const nodeTypes = {
  agentNode: AgentNode,
  flowNode: FlowNode,
  toolNode: ToolNode,
  variantNode: VariantNode,
  promptNode: PromptNode,
  subAgentNode: SubAgentNode,
  orchestratorNode: OrchestratorNode,
  outputNode: OutputNode,
  destinationNode: DestinationNode,
  subAgentGroupNode: SubAgentGroupNode,
} as const;
