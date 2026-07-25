'use client';

import { DEFAULT_SYSTEM_VARIABLES } from '@/lib/whatsappFlows/constants';

function Field({ label, children }) {
  return (
    <label className="block mb-3.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  'w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition';

export default function NodeEditor({ node, onChange, onDelete, variables = [] }) {
  const vars = variables.length ? variables : DEFAULT_SYSTEM_VARIABLES;

  if (!node) {
    return (
      <aside className="w-72 shrink-0 flex flex-col rounded-2xl bg-white/90 backdrop-blur border border-slate-200 shadow-sm overflow-hidden hidden lg:flex">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Node settings</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Select a node on the canvas</p>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Variables</p>
          <div className="flex flex-wrap gap-1.5">
            {vars.map((v) => (
              <code
                key={v.key}
                className="text-[10px] px-2 py-1 rounded-lg bg-slate-50 text-emerald-700 border border-slate-200"
              >
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

  function insertVar(key) {
    const field =
      data.text != null ? 'text' : data.body != null ? 'body' : data.prompt != null ? 'prompt' : 'text';
    set(field, `${data[field] || ''}{{${key}}}`);
  }

  return (
    <aside className="w-72 shrink-0 flex flex-col rounded-2xl bg-white/90 backdrop-blur border border-slate-200 shadow-sm overflow-hidden hidden lg:flex">
      <div className="px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Node settings</h3>
          <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
            {data.label || node.type}
          </p>
          <p className="text-[11px] text-slate-400 truncate">{node.type}</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors shrink-0"
        >
          Delete
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Field label="Label">
          <input className={inputClass} value={data.label || ''} onChange={(e) => set('label', e.target.value)} />
        </Field>

        {(node.type === 'action_send_text' || node.type === 'action_ai_response') && (
          <Field label={node.type === 'action_ai_response' ? 'Prompt' : 'Message'}>
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
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  onClick={() =>
                    set('buttons', [
                      ...(data.buttons || []),
                      { id: `btn_${(data.buttons || []).length + 1}`, title: 'Option' },
                    ])
                  }
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
            <input
              type="number"
              className={inputClass}
              value={data.delaySeconds || 60}
              onChange={(e) => set('delaySeconds', Number(e.target.value))}
            />
          </Field>
        )}

        {node.type === 'trigger_keyword' && (
          <Field label="Keywords (comma-separated)">
            <input
              className={inputClass}
              value={(data.keywords || []).join(', ')}
              onChange={(e) =>
                set(
                  'keywords',
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
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
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={Boolean(data.markConverted)}
              onChange={(e) => set('markConverted', e.target.checked)}
            />
            Mark as conversion
          </label>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Insert variable</p>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_SYSTEM_VARIABLES.map((v) => (
              <button
                key={v.key}
                type="button"
                className="text-[10px] px-2 py-1 rounded-lg bg-slate-50 text-emerald-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                onClick={() => insertVar(v.key)}
              >
                {`{{${v.key}}}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
