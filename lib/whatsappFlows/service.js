import FlowNode from '@/models/automation/FlowNode';
import FlowVariable from '@/models/automation/FlowVariable';
import FlowVersion from '@/models/automation/FlowVersion';
import { DEFAULT_SYSTEM_VARIABLES } from '@/lib/whatsappFlows/constants';

export async function loadFlowGraph(flowId, businessId) {
  const nodes = await FlowNode.find({ flowId, businessId }).lean();
  return nodes.map((n) => ({
    id: n.nodeKey,
    type: n.type,
    position: n.position || { x: 0, y: 0 },
    data: n.data || {},
  }));
}

export async function saveFlowGraph({ flowId, businessId, nodes = [], edges = [], userId }) {
  const incomingKeys = new Set(nodes.map((n) => n.id));

  // Upsert nodes
  for (const node of nodes) {
    await FlowNode.findOneAndUpdate(
      { flowId, businessId, nodeKey: node.id },
      {
        $set: {
          type: node.type,
          position: node.position || { x: 0, y: 0 },
          data: node.data || {},
        },
        $setOnInsert: { businessId, flowId, nodeKey: node.id },
      },
      { upsert: true }
    );
  }

  // Remove deleted nodes
  await FlowNode.deleteMany({
    flowId,
    businessId,
    nodeKey: { $nin: [...incomingKeys] },
  });

  return { nodeCount: nodes.length, edgeCount: edges.length, updatedBy: userId };
}

export async function createVersionSnapshot({ flow, nodes, edges, userId, published = false, note = '' }) {
  const version = (flow.version || 1);
  await FlowVersion.findOneAndUpdate(
    { flowId: flow._id, version },
    {
      $set: {
        businessId: flow.businessId,
        name: flow.name,
        snapshot: {
          nodes,
          edges,
          triggerType: flow.triggerType,
          triggerConfig: flow.triggerConfig,
        },
        note,
        createdBy: userId,
        published,
      },
    },
    { upsert: true, new: true }
  );
  return version;
}

export async function ensureDefaultVariables(businessId, flowId = null) {
  for (const v of DEFAULT_SYSTEM_VARIABLES) {
    await FlowVariable.findOneAndUpdate(
      { businessId, flowId, key: v.key },
      {
        $setOnInsert: {
          businessId,
          flowId,
          key: v.key,
          label: v.label,
          source: v.source,
          defaultValue: '',
        },
      },
      { upsert: true }
    );
  }
}

export function serializeFlowExport(flow, nodes, edges, variables = []) {
  return {
    format: 'leadforgrow-whatsapp-flow',
    version: 1,
    exportedAt: new Date().toISOString(),
    flow: {
      name: flow.name,
      description: flow.description,
      triggerType: flow.triggerType,
      triggerConfig: flow.triggerConfig,
      tags: flow.tags,
    },
    nodes,
    edges,
    variables: variables.map((v) => ({
      key: v.key,
      label: v.label,
      defaultValue: v.defaultValue,
      source: v.source,
    })),
  };
}
