'use client';

import { DEFAULT_SYSTEM_VARIABLES } from '@/lib/whatsappFlows/constants';

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30';

export default function NodeEditor({ node, onChange, onDelete, variables = [] }) {
  if (!node) {
    return (
      <aside className="w-72 shrink-0 border-l border-white/10 bg-slate-950/80 p-4 hidden lg:block">
        <p className="text-sm text-slate-500">Select a node to edit its settings.</p>
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Variables</h4>
          <div className="flex flex-wrap gap-1.5">
            {(variables.length ? variables : DEFAULT_SYSTEM_VARIABLES).map((v) => (
              <code key={v.key} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-emerald-300 border border-white/10">
                {`{{${v.key}}}`}
              </code>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  const data = node.data || {};

  function set(key, value) {
    onChange({ ...data, [key]: value });
  }

  return (
    <aside className="w-72 shrink-0 border-l border-white/10 bg-slate-950/90 overflow-y-auto p-4 hidden lg:block">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <div className="text-[10px] uppercase text-slate-500 tracking-wider">Node</div>
          <div className="text-sm font-semibold text-white">{data.label || node.type}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{node.type}</div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-rose-400 hover:text-rose-300"
        >
          Delete
        </button>
      </div>

      <Field label="Label">
        <input className={inputClass} value={data.label || ''} onChange={(e) => set('label', e.target.value)} />
      </Field>

      {(node.type === 'action_send_text' || node.type === 'action_ai_response') && (
        <Field label="Message / Prompt">
          <textarea
            rows={4}
            className={inputClass}
            value={data.text || data.prompt || ''}
            onChange={(e) => set(node.type === 'action_ai_response' ? 'prompt' : 'text', e.target.value)}
            placeholder="Hi {{customer_name}}…"
          />
        </Field>
      )}

      {node.type === 'action_send_template' && (
        <>
          <Field label="Template name">
            <input className={inputClass} value={data.templateName || ''} onChange={(e) => set('templateName', e.target.value)} />
          </Field>
          <Field label="Language">
            <input className={inputClass} value={data.language || 'en'} onChange={(e) => set('language', e.target.value)} />
          </Field>
        </>
      )}

      {node.type === 'action_send_buttons' && (
        <>
          <Field label="Body">
            <textarea rows={3} className={inputClass} value={data.body || ''} onChange={(e) => set('body', e.target.value)} />
          </Field>
          <Field label="Buttons (max 3)">
            {(data.buttons || []).slice(0, 3).map((btn, i) => (
              <input
                key={i}
                className={`${inputClass} mb-1.5`}
                value={btn.title || ''}
                onChange={(e) => {
                  const buttons = [...(data.buttons || [])];
                  buttons[i] = { ...buttons[i], id: buttons[i]?.id || `btn_${i + 1}`, title: e.target.value };
                  set('buttons', buttons);
                }}
                placeholder={`Button ${i + 1}`}
              />
            ))}
            {(data.buttons || []).length < 3 && (
              <button
                type="button"
                className="text-xs text-emerald-400"
                onClick={() => set('buttons', [...(data.buttons || []), { id: `btn_${(data.buttons || []).length + 1}`, title: 'Option' }])}
              >
                + Add button
              </button>
            )}
          </Field>
        </>
      )}

      {node.type === 'action_send_list' && (
        <>
          <Field label="Body">
            <textarea rows={3} className={inputClass} value={data.body || ''} onChange={(e) => set('body', e.target.value)} />
          </Field>
          <Field label="Button text">
            <input className={inputClass} value={data.buttonText || ''} onChange={(e) => set('buttonText', e.target.value)} />
          </Field>
        </>
      )}

      {['action_send_image', 'action_send_video', 'action_send_document', 'action_send_audio'].includes(node.type) && (
        <>
          <Field label="Media URL">
            <input className={inputClass} value={data.mediaUrl || ''} onChange={(e) => set('mediaUrl', e.target.value)} />
          </Field>
          <Field label="Caption">
            <input className={inputClass} value={data.caption || ''} onChange={(e) => set('caption', e.target.value)} />
          </Field>
        </>
      )}

      {node.type === 'action_delay' && (
        <Field label="Delay (seconds)">
          <input type="number" className={inputClass} value={data.delaySeconds || 60} onChange={(e) => set('delaySeconds', Number(e.target.value))} />
        </Field>
      )}

      {node.type === 'trigger_keyword' && (
        <Field label="Keywords (comma-separated)">
          <input
            className={inputClass}
            value={(data.keywords || []).join(', ')}
            onChange={(e) => set('keywords', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
        </Field>
      )}

      {node.type === 'logic_wait_reply' && (
        <Field label="Save reply as">
          <input className={inputClass} value={data.saveAs || 'last_reply'} onChange={(e) => set('saveAs', e.target.value)} />
        </Field>
      )}

      {node.type === 'logic_save_variable' && (
        <>
          <Field label="Variable key">
            <input className={inputClass} value={data.key || ''} onChange={(e) => set('key', e.target.value)} />
          </Field>
          <Field label="Value">
            <input className={inputClass} value={data.value || ''} onChange={(e) => set('value', e.target.value)} placeholder="{{last_reply}}" />
          </Field>
        </>
      )}

      {node.type === 'logic_if_else' && (
        <>
          <Field label="Variable">
            <input className={inputClass} value={data.variable || ''} onChange={(e) => set('variable', e.target.value)} />
          </Field>
          <Field label="Operator">
            <select className={inputClass} value={data.operator || 'contains'} onChange={(e) => set('operator', e.target.value)}>
              <option value="contains">contains</option>
              <option value="equals">equals</option>
              <option value="not_equals">not equals</option>
              <option value="exists">exists</option>
            </select>
          </Field>
          <Field label="Value">
            <input className={inputClass} value={data.value || ''} onChange={(e) => set('value', e.target.value)} />
          </Field>
        </>
      )}

      {node.type === 'logic_goto' && (
        <Field label="Target node id">
          <input className={inputClass} value={data.targetNodeKey || ''} onChange={(e) => set('targetNodeKey', e.target.value)} />
        </Field>
      )}

      {['action_add_tag', 'action_remove_tag'].includes(node.type) && (
        <Field label="Tag">
          <input className={inputClass} value={data.tag || ''} onChange={(e) => set('tag', e.target.value)} />
        </Field>
      )}

      {['action_http', 'action_webhook'].includes(node.type) && (
        <>
          <Field label="URL">
            <input className={inputClass} value={data.url || ''} onChange={(e) => set('url', e.target.value)} />
          </Field>
          <Field label="Method">
            <select className={inputClass} value={data.method || 'POST'} onChange={(e) => set('method', e.target.value)}>
              <option>POST</option>
              <option>GET</option>
              <option>PUT</option>
            </select>
          </Field>
          <Field label="Body JSON">
            <textarea rows={3} className={inputClass} value={data.body || '{}'} onChange={(e) => set('body', e.target.value)} />
          </Field>
        </>
      )}

      {node.type === 'action_end' && (
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={Boolean(data.markConverted)} onChange={(e) => set('markConverted', e.target.checked)} />
          Mark as conversion
        </label>
      )}

      <div className="mt-6 pt-4 border-t border-white/10">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Insert variable</h4>
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_SYSTEM_VARIABLES.map((v) => (
            <button
              key={v.key}
              type="button"
              className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-emerald-300 border border-white/10 hover:bg-white/10"
              onClick={() => {
                const field = data.text != null ? 'text' : data.body != null ? 'body' : data.prompt != null ? 'prompt' : 'text';
                set(field, `${data[field] || ''}{{${v.key}}}`);
              }}
            >
              {`{{${v.key}}}`}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
