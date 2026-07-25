'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { getNodeMeta, NODE_COLORS } from '@/lib/whatsappFlows/constants';

function FlowNodeCard({ data, selected, type }) {
  const meta = getNodeMeta(type);
  const cat = meta.category || data?.category || 'action';
  const colors = NODE_COLORS[cat] || NODE_COLORS.action;

  return (
    <div
      className={`min-w-[180px] max-w-[240px] rounded-xl border ${colors.border} ${colors.bg} shadow-lg backdrop-blur-sm ${
        selected ? 'ring-2 ring-white/40' : ''
      }`}
    >
      {!String(type).startsWith('trigger_') && (
        <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-slate-300 !border-slate-700" />
      )}

      <div className="px-3 py-2.5">
        <div className={`text-[10px] uppercase tracking-wider font-semibold ${colors.text} mb-0.5`}>
          {cat}
        </div>
        <div className="text-sm font-semibold text-white leading-snug">
          {data?.label || meta.label}
        </div>
        {data?.text || data?.body || data?.templateName ? (
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
            {data.text || data.body || data.templateName}
          </p>
        ) : null}
      </div>

      {type === 'logic_if_else' ? (
        <>
          <Handle type="source" position={Position.Right} id="true" style={{ top: '35%' }} className="!w-2.5 !h-2.5 !bg-emerald-400 !border-emerald-700" />
          <Handle type="source" position={Position.Right} id="false" style={{ top: '65%' }} className="!w-2.5 !h-2.5 !bg-rose-400 !border-rose-700" />
        </>
      ) : type === 'action_end' ? null : (
        <Handle type="source" position={Position.Right} id="default" className="!w-2.5 !h-2.5 !bg-slate-300 !border-slate-700" />
      )}
    </div>
  );
}

export const flowNodeTypes = {
  trigger_incoming_message: memo((p) => <FlowNodeCard {...p} type="trigger_incoming_message" />),
  trigger_keyword: memo((p) => <FlowNodeCard {...p} type="trigger_keyword" />),
  trigger_contact_created: memo((p) => <FlowNodeCard {...p} type="trigger_contact_created" />),
  trigger_lead_created: memo((p) => <FlowNodeCard {...p} type="trigger_lead_created" />),
  trigger_manual: memo((p) => <FlowNodeCard {...p} type="trigger_manual" />),
  trigger_webhook: memo((p) => <FlowNodeCard {...p} type="trigger_webhook" />),
  action_send_template: memo((p) => <FlowNodeCard {...p} type="action_send_template" />),
  action_send_text: memo((p) => <FlowNodeCard {...p} type="action_send_text" />),
  action_send_image: memo((p) => <FlowNodeCard {...p} type="action_send_image" />),
  action_send_video: memo((p) => <FlowNodeCard {...p} type="action_send_video" />),
  action_send_document: memo((p) => <FlowNodeCard {...p} type="action_send_document" />),
  action_send_audio: memo((p) => <FlowNodeCard {...p} type="action_send_audio" />),
  action_send_buttons: memo((p) => <FlowNodeCard {...p} type="action_send_buttons" />),
  action_send_list: memo((p) => <FlowNodeCard {...p} type="action_send_list" />),
  action_delay: memo((p) => <FlowNodeCard {...p} type="action_delay" />),
  action_assign: memo((p) => <FlowNodeCard {...p} type="action_assign" />),
  action_add_tag: memo((p) => <FlowNodeCard {...p} type="action_add_tag" />),
  action_remove_tag: memo((p) => <FlowNodeCard {...p} type="action_remove_tag" />),
  action_update_contact: memo((p) => <FlowNodeCard {...p} type="action_update_contact" />),
  action_create_lead: memo((p) => <FlowNodeCard {...p} type="action_create_lead" />),
  action_update_lead: memo((p) => <FlowNodeCard {...p} type="action_update_lead" />),
  action_http: memo((p) => <FlowNodeCard {...p} type="action_http" />),
  action_webhook: memo((p) => <FlowNodeCard {...p} type="action_webhook" />),
  action_ai_response: memo((p) => <FlowNodeCard {...p} type="action_ai_response" />),
  action_end: memo((p) => <FlowNodeCard {...p} type="action_end" />),
  logic_wait_reply: memo((p) => <FlowNodeCard {...p} type="logic_wait_reply" />),
  logic_if_else: memo((p) => <FlowNodeCard {...p} type="logic_if_else" />),
  logic_switch: memo((p) => <FlowNodeCard {...p} type="logic_switch" />),
  logic_goto: memo((p) => <FlowNodeCard {...p} type="logic_goto" />),
  logic_save_variable: memo((p) => <FlowNodeCard {...p} type="logic_save_variable" />),
};
