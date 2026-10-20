import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Users, Mail, User, KeyRound, UserCheck, Home, UserPlus, Briefcase, Wrench, ClipboardCheck,
  CircleCheck, ShieldCheck, PoundSterling, History, Lock, FileBarChart, PanelLeft, LogOut, Search, Bell, CalendarDays, ChevronRight, ArrowRight, Eye, EyeOff, ShieldAlert,
} from 'lucide-react';
import { useStore, useLookups, rentStatus, type Route } from './store';
import { Btn, Note } from './ui';

export const NAV: { group: string; items: { id: Route; label: string; icon: typeof Home }[] }[] = [
  { group: 'Overview', items: [{ id: 'today', label: 'Today', icon: LayoutDashboard }, { id: 'team', label: 'Team Work', icon: Users }, { id: 'enquiries', label: 'Enquiries', icon: Mail }] },
  { group: 'Homes & People', items: [{ id: 'landlords', label: 'Landlords', icon: User }, { id: 'lettings', label: 'Lettings', icon: KeyRound }, { id: 'tenants', label: 'Tenants', icon: UserCheck }, { id: 'properties', label: 'Properties', icon: Home }] },
  { group: 'Partners & Work', items: [{ id: 'signups', label: 'Sign-Ups', icon: UserPlus }, { id: 'agents', label: 'Letting Agents', icon: Briefcase }, { id: 'jobs', label: 'Contractors & Jobs', icon: Wrench }, { id: 'inspections', label: 'Inspections', icon: ClipboardCheck }] },
  { group: 'Checks & Money', items: [{ id: 'approvals', label: 'Approvals & Budgets', icon: CircleCheck }, { id: 'safety', label: 'Safety Checks', icon: ShieldCheck }, { id: 'rent', label: 'Rent & Invoices', icon: PoundSterling }] },
  { group: 'Records', items: [{ id: 'records', label: 'Records & History', icon: History }, { id: 'support', label: 'Support Access', icon: Lock }, { id: 'reports', label: 'Reports', icon: FileBarChart }] },
];
export const LABEL: Record<Route, string> = Object.fromEntries(NAV.flatMap(g => g.items.map(i => [i.id, i.label]))) as Record<Route, string>;
const GROUP: Record<Route, string> = Object.fromEntries(NAV.flatMap(g => g.items.map(i => [i.id, g.group]))) as Record<Route, string>;

export function useCounts() {
  const s = useStore();
  return {
    enquiries: s.enquiries.filter(e => e.status === 'New').length,
    tenants: s.tenants.filter(t => t.idDocs !== 'Approved').length,
    signups: s.signups.filter(x => x.status === 'Waiting').length,
    approvals: s.jobs.filter(j => j.status === 'Waiting approval').length,
    safety: s.safety.filter(c => c.status !== 'Valid').length,
    rentLate: s.rent.filter(r => rentStatus(r).tone === 'err').length,
  } as Partial<Record<Route | 'rentLate', number>>;
}

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { route, go } = useStore();
  const counts = useCounts();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className="sidebar" style={collapsed ? { width: 76 } : undefined} aria-label="Main menu">
      <div className="sb-logo">{!collapsed && <img src="images/logo.svg" alt="Landlord Service Plans" />}<button onClick={() => setCollapsed(c => !c)} aria-label="Collapse menu"><PanelLeft size={18} strokeWidth={1.8} /></button></div>
      <nav className="sb-nav">
        {NAV.map((g, gi) => <div key={g.group} className={gi > 0 ? 'sb-group' : undefined}>
          {g.items.map(it => { const Ic = it.icon; const n = counts[it.id]; return (
            <button key={it.id} className={`nav${route === it.id ? ' on' : ''}`} onClick={() => go(it.id)} title={it.label} aria-current={route === it.id ? 'page' : undefined}>
              <Ic size={20} strokeWidth={1.8} />{!collapsed && <span>{it.label}</span>}{!collapsed && !!n && <span className="count">{n}</span>}
            </button>); })}
        </div>)}
      </nav>
      <div className="sb-user"><img className="avatar md" src="images/sarah.jpg" alt="" />{!collapsed && <div className="stack"><b style={{ fontSize: 13 }}>Sarah Khan</b><span className="caption">Supervisor · LSP</span></div>}<button onClick={onLogout} aria-label="Log out" title="Log out"><LogOut size={18} strokeWidth={1.8} /></button></div>
    </aside>
  );
}

export function PageHeader({ title, sub, action, crumbs }: { title: ReactNode; sub?: ReactNode; action?: ReactNode; crumbs?: { label: string; onClick?: () => void }[] }) {
  const s = useStore();
  const L = useLookups();
  const [q, setQ] = useState('');
  const [pop, setPop] = useState<'' | 'bell' | 'cal'>('');
  const ref = useRef<HTMLDivElement>(null);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase(); if (t.length < 2) return [];
    const r: { label: string; sub: string; go: () => void }[] = [];
    s.landlords.filter(x => x.name.toLowerCase().includes(t)).forEach(x => r.push({ label: x.name, sub: 'Landlord · ' + x.plan + '% plan', go: () => s.go('landlords', x.id) }));
    s.tenants.filter(x => x.name.toLowerCase().includes(t)).forEach(x => r.push({ label: x.name, sub: 'Tenant · ' + (L.prop(x.property)?.address ?? ''), go: () => s.go('tenants', x.id) }));
    s.properties.filter(x => (x.address + ' ' + x.area).toLowerCase().includes(t)).forEach(x => r.push({ label: x.address, sub: (x.managed ? 'Managed' : 'Unmanaged') + ' · ' + x.area, go: () => s.go('properties', x.id) }));
    s.jobs.filter(x => x.title.toLowerCase().includes(t)).forEach(x => r.push({ label: x.title, sub: 'Job · ' + (L.prop(x.property)?.address ?? ''), go: () => s.go('jobs', x.id) }));
    s.contractors.filter(x => x.name.toLowerCase().includes(t)).forEach(x => r.push({ label: x.name, sub: 'Contractor · ' + x.trade, go: () => s.go('jobs') }));
    s.agents.filter(x => x.name.toLowerCase().includes(t)).forEach(x => r.push({ label: x.name, sub: 'Letting agent', go: () => s.go('agents', x.id) }));
    return r.slice(0, 8);
  }, [q, s, L]);
  const notes = [
    ...s.jobs.filter(j => j.urgent && j.status === 'New').map(j => ({ t: 'Emergency: ' + j.title, d: L.prop(j.property)?.address ?? '', r: 'jobs' as Route, id: j.id, tone: 'err' })),
    ...s.signups.filter(x => x.status === 'Waiting').map(x => ({ t: 'New sign-up: ' + x.name, d: x.kind, r: 'signups' as Route, id: x.id, tone: 'info' })),
    ...s.enquiries.filter(e => e.status === 'New').map(e => ({ t: 'New enquiry: ' + e.name, d: e.about, r: 'enquiries' as Route, id: e.id, tone: 'info' })),
    ...s.support.filter(x => x.status === 'Waiting').map(x => ({ t: 'Support access requested', d: x.from, r: 'support' as Route, id: x.id, tone: 'warn' })),
  ];
  const cal = [
    ...s.inspections.filter(i => i.status !== 'Locked').map(i => ({ d: i.date, t: i.kind + ' inspection', p: L.prop(i.property)?.address ?? '', r: 'inspections' as Route })),
    ...s.safety.filter(c => c.days < 31 && c.status !== 'Valid').map(c => ({ d: c.expires.replace(' 2026', ''), t: c.kind + ' ends', p: L.prop(c.property)?.address ?? '', r: 'safety' as Route })),
    ...s.applicants.filter(a => a.viewing && a.stage === 2).map(a => ({ d: a.viewing!.split(',')[0], t: 'Viewing · ' + a.name, p: L.prop(a.property)?.address ?? '', r: 'lettings' as Route })),
  ].slice(0, 7);
  return (
    <header className="header">
      <div className="grow">
        {crumbs && <div className="crumbs">{crumbs.map((c, i) => <span key={i} className="flex" style={{ gap: 6 }}>{i > 0 && <ChevronRight size={12} />}{c.onClick ? <button onClick={c.onClick}>{c.label}</button> : <span>{c.label}</span>}</span>)}</div>}
        <h1 className="h1">{title}</h1>
      </div>
      <div style={{ position: 'relative' }}>
        <label className="search"><Search size={18} strokeWidth={1.8} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search landlords, tenants, homes, jobs" aria-label="Search everything" /><span className="kbd">⌘K</span></label>
        {results.length > 0 && <div className="pop" style={{ left: 0, right: 'auto', width: 300 }}>{results.map((r, i) => <button key={i} className="item click" style={{ padding: '8px 10px' }} onClick={() => { setQ(''); r.go(); }}><div className="stack"><b style={{ fontSize: 12.5 }}>{r.label}</b><span className="caption">{r.sub}</span></div></button>)}</div>}
      </div>
      <div style={{ position: 'relative' }} ref={ref}>
        <div className="flex" style={{ gap: 12 }}>
          <button className="ibtn" onClick={() => setPop(p => p === 'bell' ? '' : 'bell')} aria-label="Alerts"><Bell size={20} strokeWidth={1.8} />{notes.length > 0 && <span className="dot" />}</button>
          <button className="ibtn" onClick={() => setPop(p => p === 'cal' ? '' : 'cal')} aria-label="Calendar"><CalendarDays size={20} strokeWidth={1.8} /></button>
        </div>
        {pop === 'bell' && <div className="pop"><div className="flex between" style={{ padding: '2px 4px 6px' }}><b className="h2">Alerts</b><span className="caption">{notes.length} new</span></div>
          {notes.map((n, i) => <button key={i} className="item click" style={{ padding: '8px 10px' }} onClick={() => { setPop(''); s.go(n.r, n.id); }}><span className={`tile t-${n.tone}`} style={{ width: 30, height: 30 }}><Bell size={15} /></span><div className="stack grow"><b style={{ fontSize: 12.5 }}>{n.t}</b><span className="caption">{n.d}</span></div><ArrowRight size={14} color="#98A2B3" /></button>)}
          {!notes.length && <div className="empty">You are all caught up.</div>}</div>}
        {pop === 'cal' && <div className="pop"><b className="h2" style={{ padding: '2px 4px 6px' }}>Coming up</b>
          {cal.map((c, i) => <button key={i} className="item click" style={{ padding: '8px 10px' }} onClick={() => { setPop(''); s.go(c.r); }}><span className="datetile t-info" style={{ width: 40, height: 42 }}><b style={{ fontSize: 14 }}>{c.d.split(' ')[0]}</b><span>{(c.d.split(' ')[1] || '').toUpperCase()}</span></span><div className="stack"><b style={{ fontSize: 12.5 }}>{c.t}</b><span className="caption">{c.p}</span></div></button>)}</div>}
      </div>
      {action}
    </header>
  );
}

export const crumbsFor = (r: Route, go: (r: Route) => void, extra?: string) => {
  const c: { label: string; onClick?: () => void }[] = [{ label: GROUP[r] }, { label: LABEL[r], onClick: extra ? () => go(r) : undefined }];
  if (extra) c.push({ label: extra });
  return c;
};

export function Login({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<'in' | 'code' | 'locked'>('in');
  const [email, setEmail] = useState('s.khan@lsp.co.uk');
  const [pw, setPw] = useState('••••••••••');
  const [show, setShow] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [wrong, setWrong] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const verify = () => {
    if (code.join('') === '123456') return onDone();
    const w = wrong + 1; setWrong(w); setCode(['', '', '', '', '', '']); refs.current[0]?.focus();
    if (w >= 5) setStep('locked');
  };
  return (
    <div className="login">
      <aside className="login-art">
        <img src="images/logo-white.svg" alt="Landlord Service Plans" style={{ width: 250 }} />
        <h2 style={{ fontSize: 38, lineHeight: 1.18, fontWeight: 800, letterSpacing: '-.02em', marginTop: 64, maxWidth: 460 }}>Every LSP home, <span style={{ color: '#8FD64A' }}>in one place.</span></h2>
        <p style={{ color: '#C3CDE4', fontSize: 15, lineHeight: 1.6, maxWidth: 440 }}>Rent, repairs, safety checks and lettings, looked after by one team on one platform.</p>
        <div className="photo" style={{ height: 236, marginTop: 36, backgroundImage: 'url(images/home3.jpg)', boxShadow: '0 24px 48px rgba(0,0,0,.35)' }} />
        <div className="flex" style={{ gap: 24, marginTop: 'auto', color: '#DCE3F2', fontWeight: 600 }}><span className="flex"><PoundSterling size={16} color="#8FD64A" />Rent tracked</span><span className="flex"><Wrench size={16} color="#8FD64A" />Repairs approved</span><span className="flex"><ShieldCheck size={16} color="#8FD64A" />Checks on time</span></div>
      </aside>
      <main className="login-form"><div>
        {step === 'in' && <form onSubmit={e => { e.preventDefault(); setStep('code'); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0 }}>Welcome back</h1>
          <p className="small" style={{ margin: 0, fontSize: 14 }}>Sign in to Genesis with your own email and password.</p>
          <label className="field"><span>Email</span><input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" /></label>
          <label className="field"><span>Password</span><div style={{ position: 'relative' }}><input className="input" value={pw} onChange={e => setPw(e.target.value)} type={show ? 'text' : 'password'} /><button type="button" onClick={() => setShow(v => !v)} aria-label="Show password" style={{ position: 'absolute', right: 10, top: 11, border: 0, background: 'none', color: '#667085' }}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          <Btn type="submit">Sign in <ArrowRight size={18} /></Btn>
          <Note>Your account is created by the Company Admin. No shared logins.</Note>
        </form>}
        {step === 'code' && <form onSubmit={e => { e.preventDefault(); verify(); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span className="tile lg t-brand"><ShieldCheck size={22} /></span>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Enter your security code</h1>
          <p className="small" style={{ margin: 0, fontSize: 14 }}>We sent a 6-digit code to your phone ending in <b style={{ color: '#0F1828' }}>4821</b>. For this demo, use <b style={{ color: '#0F1828' }}>123456</b>.</p>
          <div className="otp">{code.map((c, i) => <input key={i} ref={el => { refs.current[i] = el; }} inputMode="numeric" maxLength={1} value={c} aria-label={`Digit ${i + 1}`} autoFocus={i === 0}
            onChange={e => { const v = e.target.value.replace(/\D/g, ''); const n = [...code]; n[i] = v; setCode(n); if (v && i < 5) refs.current[i + 1]?.focus(); }}
            onKeyDown={e => { if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus(); }} />)}</div>
          {wrong > 0 && <Note tone="err">That code is not right. {5 - wrong} {5 - wrong === 1 ? 'try' : 'tries'} left before the account locks.</Note>}
          <Btn type="submit" disabled={code.join('').length < 6}>Verify and continue</Btn>
          <button type="button" className="btn ghost" onClick={() => setStep('in')}>Back to sign in</button>
        </form>}
        {step === 'locked' && <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span className="tile lg t-err"><ShieldAlert size={22} /></span>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Your account is locked</h1>
          <p className="small" style={{ margin: 0, fontSize: 14 }}>There were too many wrong security codes, so the account is locked to keep it safe. The Company Admin can unlock it.</p>
          <Btn onClick={() => { setStep('in'); setWrong(0); }}>Back to sign in</Btn>
        </div>}
      </div></main>
    </div>
  );
}
