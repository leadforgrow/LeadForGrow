'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Download, ChevronRight, ArrowUpRight, ArrowDownRight, Users, Clock, TrendingUp, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  bg: '#F6F6F7',
  surface: '#FFFFFF',
  border: 'rgba(0,0,0,0.07)',
  borderMid: 'rgba(0,0,0,0.10)',
  text: '#0D0D0E',
  muted: '#6B6B70',
  faint: '#A8A8B0',
  indigo: '#4F46E5',
  indigoLight: '#EEF2FF',
  emerald: '#059669',
  emeraldLight: '#ECFDF5',
  amber: '#D97706',
  amberLight: '#FFFBEB',
  rose: '#DC2626',
  roseLight: '#FEF2F2',
  shadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
  shadowMd: '0 2px 4px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)',
  radius: 12,
  radiusLg: 16,
};

// ─── Custom Icons ─────────────────────────────────────────────────────────────
const CustomSVGIcons = {
  TotalLeads: ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill={color} fillOpacity="0.15" />
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="8" r="3" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 14V13C18 11.8954 18.8954 11 20 11H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  AvgResponse: ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 14H12L13 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  ),
  Converted: ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="14" width="4" height="7" rx="1" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
      <rect x="10" y="10" width="4" height="11" rx="1" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.5" />
      <rect x="17" y="4" width="4" height="17" rx="1" fill={color} stroke={color} strokeWidth="1.5" />
      <path d="M1 18L7 11L13 14L23 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Pending: ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" />
      <path d="M12 7V12L15 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill={color} fillOpacity="0.15" />
    </svg>
  )
};

const IconWrapper = ({ iconType, color, accent }) => {
  if (!iconType) return null;
  const Icon = CustomSVGIcons[iconType];
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: accent ? `${accent}10` : `${color}10`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 0 1px ${accent ? `${accent}15` : `${color}15`} inset`
    }}>
      {Icon && <Icon color={color} />}
    </div>
  );
};

// ─── KPI Hero Card ────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, unit = '', delta, deltaLabel, icon, color, accent }) => {
  const pos = delta >= 0;
  return (
    <div style={{
      background: T.surface, borderRadius: T.radiusLg, padding: '20px 22px',
      border: `1px solid ${T.border}`, boxShadow: T.shadow,
      display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 120, height: 120,
        background: `radial-gradient(ellipse at top right, ${accent || color}10 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T.muted, letterSpacing: '-0.01em' }}>{label}</span>
        <IconWrapper iconType={icon} color={color} accent={accent} />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 36, fontWeight: 750, letterSpacing: '-2px', color: T.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
          {unit && <span style={{ fontSize: 18, fontWeight: 500, color: T.faint, letterSpacing: '-0.5px' }}>{unit}</span>}
        </div>
        {delta !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600,
              color: pos ? T.emerald : T.rose,
              background: pos ? T.emeraldLight : T.roseLight,
              padding: '2px 7px', borderRadius: 6,
            }}>
              {pos ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {Math.abs(delta)}%
            </span>
            {deltaLabel && <span style={{ fontSize: 11, color: T.faint }}>{deltaLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Area Chart ───────────────────────────────────────────────────────────────
const AreaChart = ({ data = [] }) => {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  if (!data.length) return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.faint, fontSize: 13 }}>
      No trend data yet
    </div>
  );
  const W = 600, H = 160, PX = 2, PY = 12;
  const vals = data.map(d => d.leads || 0);
  const max = Math.max(...vals, 1);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const tx = (i) => PX + (i / (vals.length - 1 || 1)) * (W - PX * 2);
  const ty = (v) => H - PY - (v / max) * (H - PY * 2);
  const pts = vals.map((v, i) => `${tx(i)},${ty(v)}`).join(' ');
  const area = `${PX},${H} ${pts} ${W - PX},${H}`;
  const avgY = ty(avg);
  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible', display: 'block' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const xRel = ((e.clientX - rect.left) / rect.width) * W;
          const idx = Math.min(vals.length - 1, Math.max(0, Math.round((xRel / W) * (vals.length - 1))));
          setHover(idx);
        }}
        onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="acfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.indigo} stopOpacity="0.2" />
            <stop offset="60%" stopColor={T.indigo} stopOpacity="0.06" />
            <stop offset="100%" stopColor={T.indigo} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <line key={i} x1={PX} y1={PY + v * (H - PY * 2)} x2={W - PX} y2={PY + v * (H - PY * 2)}
            stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        ))}
        <line x1={PX} y1={avgY} x2={W - PX} y2={avgY}
          stroke={T.indigo} strokeWidth="1" strokeDasharray="3 5" strokeOpacity="0.35" />
        <polygon points={area} fill="url(#acfill)" />
        <polyline points={pts} fill="none" stroke={T.indigo} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
        {hover !== null && (() => {
          const x = tx(hover), y = ty(vals[hover]);
          return (<>
            <line x1={x} y1={PY} x2={x} y2={H} stroke={T.indigo} strokeWidth="1" strokeOpacity="0.2" />
            <circle cx={x} cy={y} r="4" fill={T.surface} stroke={T.indigo} strokeWidth="2" />
            <rect x={x - 28} y={y - 26} width={56} height={20} rx="5" fill={T.text} />
            <text x={x} y={y - 12} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="600">{vals[hover]} leads</text>
          </>);
        })()}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: T.faint, fontWeight: 500 }}>
        {data.length > 0 && <>
          <span>{new Date(data[0]._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <span style={{ color: T.indigo, fontSize: 9, fontWeight: 700, opacity: 0.6 }}>— avg</span>
          <span>{new Date(data[data.length - 1]._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </>}
      </div>
    </div>
  );
};

// ─── True SVG Funnel ─────────────────────────────────────────────────────────
const FunnelChart = ({ total = 1, contacted = 0, converted = 0 }) => {
  const steps = [
    { label: 'Acquired', val: total, pct: 100, color: T.indigo },
    { label: 'Contacted', val: contacted, pct: total ? Math.round((contacted / total) * 100) : 0, color: '#6366F1' },
    { label: 'Converted', val: converted, pct: total ? Math.round((converted / total) * 100) : 0, color: T.emerald },
  ];

  const W = 110, SH = 46, GAP = 2;
  const total_h = steps.length * SH + (steps.length - 1) * GAP;
  
  const wFrac = (pct) => 0.45 + (pct / 100) * 0.55; 
  const widths = [
    W, 
    W * wFrac(steps[1].pct), 
    W * wFrac(steps[2].pct), 
    W * wFrac(steps[2].pct) * 0.8 
  ];

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <svg width={W} height={total_h} style={{ flexShrink: 0, overflow: 'visible' }}>
        {steps.map((s, i) => {
          const yTop = i * (SH + GAP);
          const yBot = yTop + SH;
          const wT = widths[i];
          const wB = widths[i + 1];
          
          const xTL = (W - wT) / 2;
          const xTR = xTL + wT;
          const xBL = (W - wB) / 2;
          const xBR = xBL + wB;

          const pts = `${xTL},${yTop} ${xTR},${yTop} ${xBR},${yBot} ${xBL},${yBot}`;

          return (
            <g key={s.label}>
              <polygon points={pts} fill={s.color} opacity={0.9} />
              <text x={W / 2} y={yTop + SH / 2 + 4} textAnchor="middle"
                fontSize="14" fontWeight="700" fill="#fff" letterSpacing="-0.5px" style={{ pointerEvents: 'none' }}>
                {s.val.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, flex: 1 }}>
        {steps.map((s, i) => {
          const dropOff = i < steps.length - 1 && s.val > 0 ? Math.round(((s.val - steps[i+1].val) / s.val) * 100) : 0;
          return (
            <div key={s.label} style={{ height: SH, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: T.faint, marginTop: 2 }}>{s.pct}% of total</div>
              
              {i < steps.length - 1 && (
                <div style={{ position: 'absolute', top: SH + GAP/2 - 7, left: -14, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 10, height: 1, borderTop: `1px dashed ${T.borderMid}` }} />
                  <span style={{ fontSize: 10, color: T.faint, fontWeight: 600, background: T.surface, padding: '0 4px', lineHeight: 1 }}>
                    {dropOff}% drop
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Activity Matrix (Heatmap) ────────────────────────────────────────────────
const ActivityMatrix = ({ data = [] }) => {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const max = Math.max(...data.map(d => d.count || 0), 1);
  const cellW = 14, cellH = 12, gapX = 3, gapY = 3;
  const W = 24 * (cellW + gapX), H = 7 * (cellH + gapY);
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 380 }}>
        <div style={{ display: 'flex', gap: gapX, marginBottom: 6, paddingLeft: 28 }}>
          {[0, 4, 8, 12, 16, 20].map(h => (
            <div key={h} style={{ width: (cellW + gapX) * 4 - gapX, fontSize: 9, color: T.faint, fontWeight: 500 }}>{h}:00</div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: gapY }}>
          {DAYS.map((day, di) => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: gapX }}>
              <span style={{ width: 24, fontSize: 9, color: T.faint, fontWeight: 600, textAlign: 'right', paddingRight: 4 }}>{day.slice(0, 2)}</span>
              {Array.from({ length: 24 }, (_, h) => {
                const e = data.find(x => x._id?.hour === h && x._id?.day === di + 1);
                const alpha = e ? 0.1 + (e.count / max) * 0.9 : 0;
                return (
                  <div key={h} title={`${day} ${h}:00 — ${e?.count || 0} leads`}
                    style={{
                      width: cellW, height: cellH, borderRadius: 3, cursor: 'default',
                      background: alpha > 0 ? `rgba(79,70,229,${alpha.toFixed(2)})` : 'rgba(0,0,0,0.04)',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e2 => { e2.currentTarget.style.outline = `1.5px solid ${T.indigo}`; e2.currentTarget.style.outlineOffset = '1px'; }}
                    onMouseLeave={e2 => { e2.currentTarget.style.outline = 'none'; }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, paddingLeft: 28 }}>
          <span style={{ fontSize: 9, color: T.faint }}>Less</span>
          {[0.08, 0.25, 0.5, 0.75, 1].map((a, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: `rgba(79,70,229,${a})` }} />
          ))}
          <span style={{ fontSize: 9, color: T.faint }}>More</span>
        </div>
      </div>
    </div>
  );
};

// ─── Team Roster ──────────────────────────────────────────────────────────────
const TeamRoster = ({ data = [] }) => {
  const sorted = [...data].sort((a, b) => (b.conversionRate || 0) - (a.conversionRate || 0));
  if (!sorted.length) return <div style={{ padding: '24px 0', textAlign: 'center', color: T.faint, fontSize: 13 }}>No data yet</div>;
  const PALETTE_AV = ['#4F46E5', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {sorted.map((m, i) => {
        const rate = Math.round(m.conversionRate || 0);
        const avColor = PALETTE_AV[i % PALETTE_AV.length];
        const initials = (m.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 4px', borderBottom: `1px solid ${T.border}`,
            transition: 'background 0.12s', cursor: 'default',
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.bg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: avColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff', position: 'relative', flexShrink: 0,
              }}>
                {initials}
                {i === 0 && <div style={{ position: 'absolute', top: -2, right: -2, width: 9, height: 9, background: '#FBBF24', borderRadius: '50%', border: '1.5px solid #fff' }} />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{m.name || 'Team Member'}</div>
                <div style={{ fontSize: 11, color: T.faint, marginTop: 1 }}>
                  {m.total || 0} leads · {m.avgResponseTime ? `${Math.round(m.avgResponseTime / 3600000)}h` : '–'} avg resp
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 64 }}>
                <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(rate, 100)}%`, background: rate >= 15 ? T.emerald : T.indigo, borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 750, color: T.text, letterSpacing: '-0.5px', minWidth: 38, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{rate}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Source Row ───────────────────────────────────────────────────────────────
const SRCDOTS = { website: '#4F46E5', referral: '#7C3AED', ad: '#D97706', whatsapp: '#059669', phone: '#0891B2', email: '#DC2626' };
const SourceRow = ({ source, count, total }) => {
  const pct = total ? Math.round((count / total) * 100) : 0;
  const dot = SRCDOTS[source] || T.muted;
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: T.text, textTransform: 'capitalize' }}>{source}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '-0.3px' }}>{count}</span>
          <span style={{ fontSize: 10, color: T.faint, minWidth: 30, textAlign: 'right' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 3, background: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: dot, borderRadius: 3, transition: 'width 1s ease', opacity: 0.85 }} />
      </div>
    </div>
  );
};

// ─── Activity Feed Row ────────────────────────────────────────────────────────
const ActivityRow = ({ lead }) => {
  const st = lead.status || 'pending';
  const STATUS = {
    converted: { label: 'Converted', bg: T.emeraldLight, color: T.emerald },
    contacted: { label: 'Contacted', bg: T.indigoLight, color: T.indigo },
    pending: { label: 'Pending', bg: 'rgba(0,0,0,0.04)', color: T.muted },
    lost: { label: 'Lost', bg: T.roseLight, color: T.rose },
  };
  const s = STATUS[st] || STATUS.pending;
  const date = new Date(lead.convertedAt || lead.lastContactedAt || Date.now());
  const initials = (lead.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '36px 1fr auto auto',
      alignItems: 'center', gap: '0 12px',
      padding: '9px 16px', borderBottom: `1px solid ${T.border}`,
      transition: 'background 0.1s', cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.background = T.bg}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${(initials.charCodeAt(0) * 17) % 360},55%,55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{lead.name}</div>
        <div style={{ fontSize: 11, color: T.faint, marginTop: 1 }}>{lead.serviceInterest || 'General inquiry'}</div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>
      <div style={{ textAlign: 'right', minWidth: 56 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
        <div style={{ fontSize: 10, color: T.faint }}>{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
};

// ─── Section Shell ────────────────────────────────────────────────────────────
const Card = ({ children, style = {}, pad = '22px 24px' }) => (
  <div style={{
    background: T.surface, borderRadius: T.radiusLg,
    border: `1px solid ${T.border}`, boxShadow: T.shadow,
    overflow: 'hidden', ...style,
  }}>
    {pad ? <div style={{ padding: pad }}>{children}</div> : children}
  </div>
);

const SectionHead = ({ title, sub, right }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.2px' }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: T.faint, marginTop: 3 }}>{sub}</div>}
    </div>
    {right && <div>{right}</div>}
  </div>
);

// ─── Spark Generator (realistic-ish) ─────────────────────────────────────────
const mkSpark = (trend = 'up', n = 14) => {
  const pts = [];
  let v = 20 + Math.random() * 30;
  for (let i = 0; i < n; i++) {
    const drift = trend === 'up' ? 3 : trend === 'down' ? -2 : 0;
    v = Math.max(1, v + drift + (Math.random() - 0.45) * 10);
    pts.push(Math.round(v));
  }
  return pts;
};

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('30');
  const [stats, setStats] = useState({
    totalLeads: 0, avgResponseTimeHours: 0, converted: 0,
    lost: 0, notContactedCount: 0, conversionRate: 0,
    leadsBySource: [], recentLeads: [], dailyTrends: [],
    teamPerformance: [], hourlyHeatmap: [],
  });
  const [warmingEmail, setWarmingEmail] = useState('');
  const [warmingLoading, setWarmingLoading] = useState(false);

  useEffect(() => {
    const role = (localStorage.getItem('userRole') || 'member').toLowerCase();
    if (!role.includes('owner') && !role.includes('admin')) {
      router.push('/automation/leads'); return;
    }
  }, [router]);

  useEffect(() => { fetchReports(); }, [period]);

  const fetchReports = async () => {
    try {
      const uid = localStorage.getItem('userid');
      if (!uid) { toast.error('Login required'); router.push('/user/register'); return; }
      const r = await fetch(`/api/automation/reports?userId=${uid}&period=${period}`);
      const d = await r.json();
      if (!d.success) throw new Error(d.error);
      setStats(d.data);
    } catch { toast.error('Failed to load reports'); }
  };

  const handleWarmEmail = async () => {
    if (!warmingEmail) { toast.error('Enter an email'); return; }
    setWarmingLoading(true);
    try {
      const uid = localStorage.getItem('userid');
      const r = await fetch(`/api/automation/reports/warm-email?userId=${uid}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, targetEmail: warmingEmail }),
      });
      const d = await r.json();
      if (d.success) { toast.success(d.message); setWarmingEmail(''); }
      else toast.error(d.error || 'Failed');
    } catch { toast.error('Error'); }
    finally { setWarmingLoading(false); }
  };

  const contacted = stats.statsLeadsByStatus?.contacted || Math.max(0, stats.totalLeads - stats.notContactedCount);

  const liveTag = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600, color: T.emerald, background: T.emeraldLight, padding: '3px 9px', borderRadius: 20 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.emerald, display: 'inline-block', boxShadow: `0 0 0 3px ${T.emeraldLight}` }} />
      Live
    </span>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: '-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",system-ui,sans-serif', paddingBottom: 64 }}>
      <style>{`
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
        @keyframes spin{to{transform:rotate(360deg)}}
        button:hover{opacity:0.88}
        input:focus{outline:none;border-color:${T.indigo}!important;box-shadow:0 0 0 3px ${T.indigoLight}!important}
      `}</style>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 24px 0' }}>

        {/* ── Topbar ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 750, letterSpacing: '-0.6px', color: T.text, margin: 0, lineHeight: 1.2 }}>Analytics</h1>
            <p style={{ fontSize: 12, color: T.faint, margin: '5px 0 0', fontWeight: 400 }}>Pipeline performance · Conversion intelligence</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 3, gap: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              {['7', '30', '90'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                  background: period === p ? T.text : 'transparent',
                  color: period === p ? '#fff' : T.muted,
                }}>{p}d</button>
              ))}
            </div>
            <button onClick={() => window.print()} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
              fontSize: 12, fontWeight: 600, color: T.muted, cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}>
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        {/* ── KPI Row ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
          <KpiCard label="Total Leads" value={stats.totalLeads} delta={12} deltaLabel="vs last period" icon="TotalLeads" color={T.indigo} accent={T.indigo} />
          <KpiCard label="Avg Response" value={stats.avgResponseTimeHours} unit="h" delta={-4} deltaLabel="improved" icon="AvgResponse" color="#0891B2" accent="#0891B2" />
          <KpiCard label="Converted" value={stats.converted} delta={stats.conversionRate} deltaLabel="win rate" icon="Converted" color={T.emerald} accent={T.emerald} />
          <KpiCard label="Pending" value={stats.notContactedCount} icon="Pending" color={T.amber} accent={T.amber} deltaLabel={`${stats.lost} lost`} />
        </div>

        {/* ── Hero Chart + Funnel ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: 12, marginBottom: 12 }}>
          <Card>
            <SectionHead title="Lead Volume" sub={`Daily captures — last ${period} days`} right={liveTag} />
            <AreaChart data={stats.dailyTrends} />
          </Card>
          <Card>
            <SectionHead title="Conversion Funnel" sub="Pipeline stage flow" />
            <FunnelChart total={stats.totalLeads} contacted={contacted} converted={stats.converted} />
          </Card>
        </div>

        {/* ── Sources / Team / Heatmap row ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Card>
            <SectionHead title="Lead Sources" sub="Attribution breakdown" />
            {stats.leadsBySource.length
              ? stats.leadsBySource.map((s, i) => <SourceRow key={i} source={s.source} count={s.count} total={stats.totalLeads} />)
              : <div style={{ color: T.faint, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>No source data</div>}
          </Card>
          <Card>
            <SectionHead title="Team Performance" sub="Ranked by win rate" />
            <TeamRoster data={stats.teamPerformance} />
          </Card>
          <Card>
            <SectionHead title="Activity Matrix" sub="Lead density by hour &amp; day" />
            <ActivityMatrix data={stats.hourlyHeatmap} />
          </Card>
        </div>

        {/* ── Activity Feed + Utilities ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 284px', gap: 12 }}>
          {/* Activity feed */}
          <Card pad={null}>
            <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.2px' }}>Recent Activity</div>
                <div style={{ fontSize: 11, color: T.faint, marginTop: 3 }}>Live lead event stream</div>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: T.indigo, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: 8, transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = T.indigoLight}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                All leads <ChevronRight size={12} />
              </button>
            </div>
            {stats.recentLeads?.length
              ? stats.recentLeads.slice(0, 8).map(l => <ActivityRow key={l._id} lead={l} />)
              : <div style={{ padding: '32px 16px', textAlign: 'center', color: T.faint, fontSize: 13 }}>No recent activity</div>}
          </Card>

          {/* Utility column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Email Warmer */}
            <Card style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.2px', marginBottom: 6 }}>Email Reputation</div>
              <p style={{ fontSize: 12, color: T.faint, lineHeight: 1.65, margin: '0 0 16px' }}>
                Send a test to your personal inbox. Mark as "Not Spam" to warm your sending domain.
              </p>
              <input type="email" placeholder="you@gmail.com" value={warmingEmail}
                onChange={e => setWarmingEmail(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', fontSize: 12,
                  border: `1px solid ${T.borderMid}`, borderRadius: 9,
                  background: T.bg, color: T.text, marginBottom: 10, display: 'block',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }} />
              <button onClick={handleWarmEmail} disabled={warmingLoading} style={{
                width: '100%', padding: '9px 0', background: T.text, color: '#fff',
                border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 7, opacity: warmingLoading ? 0.55 : 1, transition: 'opacity 0.15s',
              }}>
                {warmingLoading
                  ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                  : <Send size={13} />}
                Send Warm Email
              </button>
            </Card>

            {/* Export */}
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.2px', marginBottom: 6 }}>Export</div>
              <p style={{ fontSize: 12, color: T.faint, lineHeight: 1.65, margin: '0 0 14px' }}>Download your pipeline data for further analysis.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button style={{ padding: '9px 0', background: T.text, color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Export CSV</button>
                <button onClick={() => window.print()} style={{ padding: '9px 0', background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Export PDF</button>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
