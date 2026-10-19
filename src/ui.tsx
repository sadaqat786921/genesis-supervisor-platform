import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { X, Search, Check, Info, AlertTriangle } from 'lucide-react';
import type { Tone } from './data';
import { staff, useStore } from './store';

export const I = { s: 18, w: 1.8 };

export function Chip({ tone = 'neutral', children, dot = true }: { tone?: Tone | 'accent'; children: ReactNode; dot?: boolean }) {
  return <span className={`chip ${tone}${dot ? '' : ' nodot'}`}>{children}</span>;
}
export function Count({ n }: { n: number | string }) { return <span className="count">{n}</span>; }

type BtnKind = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success';
export function Btn({ kind = 'primary', sm, icon, children, onClick, disabled, type = 'button', title }: { kind?: BtnKind; sm?: boolean; icon?: ReactNode; children?: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; title?: string }) {
  return <button type={type} title={title} className={`btn ${kind === "outline" ? "line" : kind}${sm ? ' sm' : ''}`} onClick={onClick} disabled={disabled}>{icon}{children}</button>;
}
export function IBtn({ icon, onClick, sm, kind, dot, label }: { icon: ReactNode; onClick?: () => void; sm?: boolean; kind?: 'success' | 'danger'; dot?: boolean; label: string }) {
  return <button className={`ibtn${sm ? ' sm' : ''}${kind ? ' ' + kind : ''}`} onClick={onClick} aria-label={label} title={label}>{icon}{dot && <span className="dot" />}</button>;
}

export function Card({ title, sub, action, children, className = '', style }: { title?: ReactNode; sub?: ReactNode; action?: ReactNode; children?: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <section className={`card ${className}`} style={style}>
      {(title || action) && <div className="card-h"><div className="grow">{title && <h2 className="h2">{title}</h2>}{sub && <div className="small">{sub}</div>}</div>{action}</div>}
      {children}
    </section>
  );
}

export function Avatar({ id, name, size = '', photo }: { id?: string; name?: string; size?: '' | 'md' | 'lg'; photo?: string }) {
  const s = staff(id);
  const n = name ?? s?.name ?? '?';
  const p = photo ?? s?.photo;
  const ini = n.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const colors = ['#153D91', '#099FFD', '#3C7300', '#B54708', '#0B6FB8', '#001649'];
  const c = s?.color ?? colors[n.length % colors.length];
  return p ? <img className={`avatar ${size}`} src={p} alt="" /> : <span className={`avatar ${size}`} style={{ background: c }}>{ini}</span>;
}

export function Bar({ value, tone = 'ok' }: { value: number; tone?: 'ok' | 'err' | 'warn' | 'brand' }) {
  return <div className={`bar ${tone}`}><i style={{ width: Math.max(0, Math.min(100, value)) + '%' }} /></div>;
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: any) => void; items: { id: T; label: string; count?: number }[] }) {
  return <div className="tabs" role="tablist">{items.map(i => <button key={i.id} role="tab" aria-selected={value === i.id} className={value === i.id ? 'on' : ''} onClick={() => onChange(i.id)}>{i.label}{i.count != null && <span className="count">{i.count}</span>}</button>)}</div>;
}

export function MiniSearch({ value, onChange, placeholder = 'Search' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="minisearch"><Search size={16} strokeWidth={1.8} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>;
}

export function Drawer({ title, sub, onClose, children, footer, icon }: { title: ReactNode; sub?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; icon?: ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="scrim" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-label={typeof title === 'string' ? title : 'Details'}>
        <div className="drawer-h">{icon}<div className="grow"><h2 className="h2" style={{ fontSize: 18 }}>{title}</h2>{sub && <div className="small" style={{ marginTop: 4 }}>{sub}</div>}</div><IBtn sm icon={<X size={16} />} onClick={onClose} label="Close" /></div>
        <div className="drawer-b">{children}</div>
        {footer && <div className="drawer-f">{footer}</div>}
      </aside>
    </div>
  );
}

export function Modal({ title, sub, onClose, children, footer, wide }: { title: string; sub?: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="modal-scrim" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-label={title}>
        <div className="flex" style={{ alignItems: 'flex-start' }}><div className="grow"><h2 className="h2" style={{ fontSize: 18 }}>{title}</h2>{sub && <div className="small" style={{ marginTop: 4 }}>{sub}</div>}</div><IBtn sm icon={<X size={16} />} onClick={onClose} label="Close" /></div>
        {children}
        {footer && <div className="flex" style={{ justifyContent: 'flex-end', marginTop: 4, flexWrap: 'wrap' }}>{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
export function Text({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input className="input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}
export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string; disabled?: boolean }[] }) {
  return <select className="input" value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}</select>;
}

export function KV({ rows }: { rows: [string, ReactNode][] }) {
  return <dl className="kv">{rows.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>;
}
export function Note({ tone, children }: { tone?: 'warn' | 'err' | 'ok'; children: ReactNode }) {
  const ic = tone === 'err' || tone === 'warn' ? <AlertTriangle size={16} /> : tone === 'ok' ? <Check size={16} /> : <Info size={16} />;
  return <div className={`note${tone ? ' ' + tone : ''}`}>{ic}<span>{children}</span></div>;
}
export function Steps({ items, at }: { items: readonly string[]; at: number }) {
  return <div className="steps">{items.map((s, i) => <div key={s} className={`step${i < at ? ' done' : i === at ? ' now' : ''}`}><span className="dotn">{i < at ? <Check size={14} /> : i + 1}</span><div style={{ paddingTop: 5, fontWeight: i === at ? 700 : 600, color: i > at ? 'var(--text-tertiary)' : undefined }}>{s}</div></div>)}</div>;
}
export function Empty({ children }: { children: ReactNode }) { return <div className="empty">{children}</div>; }

export function Toasts() {
  const { toasts } = useStore();
  return <div className="toasts" aria-live="polite">{toasts.map(t => <div key={t.id} className="toast"><Check size={16} />{t.msg}</div>)}</div>;
}

export function Reason({ title, sub, cta = 'Confirm', danger, onClose, onDone, placeholder = 'Type the reason. It is saved in History.' }: { title: string; sub?: string; cta?: string; danger?: boolean; onClose: () => void; onDone: (reason: string) => void; placeholder?: string }) {
  const [r, setR] = useState('');
  return <Modal title={title} sub={sub} onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn kind={danger ? 'danger' : 'primary'} disabled={!r.trim()} onClick={() => onDone(r.trim())}>{cta}</Btn></>}>
    <Field label="Reason"><textarea className="input" value={r} onChange={e => setR(e.target.value)} placeholder={placeholder} /></Field>
  </Modal>;
}

export function Kpi({ icon, tone, label, value, caption, onClick, spark }: { icon: ReactNode; tone: 'info' | 'brand' | 'ok' | 'err' | 'warn'; label: string; value: ReactNode; caption: ReactNode; onClick?: () => void; spark?: string }) {
  const color = { info: '#0B6FB8', brand: '#153D91', ok: '#3C7300', err: '#C8102E', warn: '#B54708' }[tone];
  const Tag = onClick ? 'button' : 'div';
  return <Tag className="kpi" onClick={onClick}>
    <div className="flex" style={{ gap: 10 }}><span className={`tile t-${tone}`}>{icon}</span><span className="label grow">{label}</span>{onClick && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="1.8" strokeLinecap="round"><path d="M7 17 17 7M8 7h9v9" /></svg>}</div>
    <div className="flex" style={{ alignItems: 'flex-end' }}><div className="stack grow"><span className="v">{value}</span><span className="caption">{caption}</span></div>
      {spark && <svg width="80" height="22" viewBox="0 0 80 22" fill="none"><path d={spark} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}</div>
  </Tag>;
}
