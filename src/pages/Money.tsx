import { useEffect, useState } from 'react';
import { PoundSterling, AlertTriangle, Bell, CheckCircle2, Receipt, Lock, Unlock, History, ShieldAlert, Clock, XCircle, FileSpreadsheet, FileText, Download, Eye } from 'lucide-react';
import { useStore, useLookups, money, rentStatus } from '../store';
import { RENT_CHART } from '../data';
import { Btn, Card, Chip, Drawer, Field, KV, Kpi, MiniSearch, Modal, Note, Reason, Select, Tabs } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { PaymentModal } from './shared';
import { InvoiceTable } from './Homes';

/* ================= RENT & INVOICES ================= */
export function Rent() {
  const s = useStore(); const L = useLookups(); const [tab, setTab] = useState<'rent' | 'invoices'>('rent'); const [f, setF] = useState<'all' | 'late' | 'part' | 'paid'>('all'); const [pay, setPay] = useState<string | null>(null); const [open, setOpen] = useState<string | null>(null); const [terms, setTerms] = useState(false);
  const rows = s.rent.filter(r => { const st = rentStatus(r).label; return f === 'all' || (f === 'late' ? st.includes('late') || st === 'Late' : f === 'part' ? st.startsWith('Part') : st === 'Paid'); });
  const owed = s.rent.filter(r => !r.due.includes('Nov')).reduce((a, r) => a + Math.max(0, r.amount - r.paid), 0);
  const late = s.rent.filter(r => rentStatus(r).tone === 'err');
  return <>
    <PageHeader crumbs={crumbsFor('rent', s.go)} title="Rent & Invoices" sub="Staff check the bank and record what arrived. Part payments carry forward. Reminders go out from Outlook."
      action={<Btn kind="outline" onClick={() => setTerms(true)}>Invoice terms</Btn>} />
    <div className="grid g4">
      <Kpi icon={<PoundSterling size={18} />} tone="ok" label="Collected this month" value={money(s.rent.reduce((a, r) => a + r.paid, 0))} caption={`of ${money(s.rent.reduce((a, r) => a + r.amount, 0))} due`} />
      <Kpi icon={<AlertTriangle size={18} />} tone="err" label="Late rent" value={late.length} caption={money(late.reduce((a, r) => a + r.amount - r.paid, 0)) + ' owed'} onClick={() => { setTab('rent'); setF('late'); }} />
      <Kpi icon={<Clock size={18} />} tone="warn" label="Still owed" value={money(owed)} caption="carries to next month" onClick={() => { setTab('rent'); setF('part'); }} />
      <Kpi icon={<Receipt size={18} />} tone="brand" label="Unpaid invoices" value={s.invoices.filter(i => i.paid < i.amount).length} caption={`${s.invoices.filter(i => i.overdue).length} overdue`} onClick={() => setTab('invoices')} />
    </div>
    <Tabs value={tab} onChange={setTab} items={[{ id: 'rent', label: 'Rent', count: s.rent.length }, { id: 'invoices', label: 'Invoices', count: s.invoices.length }]} />
    {tab === 'rent' ? <Card title="Rent this month" action={<Tabs value={f} onChange={setF} items={[{ id: 'all', label: 'All' }, { id: 'late', label: 'Late' }, { id: 'part', label: 'Part-paid' }, { id: 'paid', label: 'Paid' }]} />}>
      <div className="tablewrap"><table className="t"><thead><tr><th>Tenant</th><th>Home</th><th>Due</th><th>Rent</th><th>Paid</th><th>Still owed</th><th>Status</th><th></th></tr></thead><tbody>
        {rows.map(r => { const t = L.tenant(r.tenant); const st = rentStatus(r); const left = r.amount - r.paid; return <tr key={r.id} onClick={() => setOpen(r.id)}>
          <td className="strong">{t?.name}</td><td>{L.prop(t?.property)?.address}{t?.room ? ` · ${t.room}` : ''}</td><td>{r.due}</td><td>{money(r.amount)}</td><td>{money(r.paid)}</td><td>{left > 0 ? <b style={{ color: st.tone === 'err' ? 'var(--status-error-fg)' : undefined }}>{money(left)}</b> : '—'}</td><td><Chip tone={st.tone}>{st.label}</Chip></td>
          <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>{left > 0 && <div className="flex" style={{ justifyContent: 'flex-end' }}>{st.tone === 'err' && <Btn sm kind="ghost" icon={<Bell size={14} />} onClick={() => { s.setRent(rs => rs.map(x => x.id === r.id ? { ...x, reminders: x.reminders + 1 } : x)); s.log(`Sent ${r.paid ? 'part-paid' : 'late'} rent reminder to ${t?.name}`, 'Rent & Invoices'); s.toast(`Reminder sent to ${t?.name} from Outlook`); }}>Remind</Btn>}<Btn sm onClick={() => setPay(r.id)}>Record</Btn></div>}</td></tr>; })}
      </tbody></table>{!rows.length && <div className="empty">Nothing here.</div>}</div></Card>
      : <Card title="Invoices" sub="Landlord invoices are due straight away. Agent invoices have 30 days unless set otherwise."><InvoiceTable list={s.invoices} /></Card>}
    {pay && (() => { const r = s.rent.find(x => x.id === pay)!; const t = L.tenant(r.tenant); return <PaymentModal title={`Record rent from ${t?.name}`} owed={r.amount - r.paid} onClose={() => setPay(null)} onSave={(a, d, n) => { s.setRent(rs => rs.map(x => x.id === pay ? { ...x, paid: Math.min(x.amount, x.paid + a), history: [...x.history, { date: d, amount: a, note: n }] } : x)); const left = r.amount - r.paid - a; s.log(`Recorded ${money(a)} from ${t?.name}${left > 0 ? `. ${money(left)} still owed` : ''}`, 'Rent & Invoices'); s.toast(left > 0 ? `${money(a)} saved. ${money(left)} carries forward, reminder sent.` : `${money(a)} saved. Paid in full.`); setPay(null); }} />; })()}
    {open && <RentDrawer id={open} onClose={() => setOpen(null)} onPay={() => { setPay(open); }} />}
    {terms && <TermsModal onClose={() => setTerms(false)} />}
  </>;
}
function RentDrawer({ id, onClose, onPay }: { id: string; onClose: () => void; onPay: () => void }) {
  const s = useStore(); const L = useLookups(); const r = s.rent.find(x => x.id === id)!; const t = L.tenant(r.tenant); const st = rentStatus(r);
  return <Drawer title={t?.name ?? ''} sub={`${L.prop(t?.property)?.address} · rent due ${r.due}`} onClose={onClose} footer={r.paid < r.amount ? <Btn onClick={onPay}>Record payment</Btn> : <Btn kind="outline" onClick={onClose}>Close</Btn>}>
    <Card className="flat"><KV rows={[['Rent', money(r.amount)], ['Paid', money(r.paid)], ['Still owed', money(r.amount - r.paid)], ['Status', <Chip tone={st.tone}>{st.label}</Chip>], ['Reminders sent', String(r.reminders)]]} /></Card>
    {r.paid > 0 && r.paid < r.amount && <Note tone="warn">Part-paid. {money(r.amount - r.paid)} carries forward to next month's statement.</Note>}
    <Card className="flat" title="Payments"><div className="divlist">{r.history.length ? r.history.map((h, i) => <div key={i} className="item"><CheckCircle2 size={16} color="#3C7300" /><b className="grow">{money(h.amount)}</b><span className="caption">{h.date} · {h.note}</span></div>) : <div className="empty">No payments yet.</div>}</div></Card>
  </Drawer>;
}
function TermsModal({ onClose }: { onClose: () => void }) {
  const s = useStore(); const [ll, setLl] = useState('Straight away'); const [ag, setAg] = useState('30 days');
  return <Modal title="Invoice terms" sub="When invoices are due. Changes only apply to new invoices." onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn onClick={() => { s.log(`Changed invoice terms: landlords ${ll}, agents ${ag}`, 'Rent & Invoices'); s.toast('Terms saved for new invoices'); onClose(); }}>Save</Btn></>}>
    <Field label="Landlords"><Select value={ll} onChange={setLl} options={['Straight away', '7 days', '14 days', '30 days'].map(x => ({ value: x, label: x }))} /></Field>
    <Field label="Letting agents"><Select value={ag} onChange={setAg} options={['Straight away', '14 days', '30 days', '60 days'].map(x => ({ value: x, label: x }))} /></Field>
  </Modal>;
}

/* ================= RECORDS & HISTORY ================= */
export function Records() {
  const s = useStore(); const [tab, setTab] = useState<'activity' | 'locked'>('activity'); const [q, setQ] = useState(''); const [area, setArea] = useState('all'); const [unlock, setUnlock] = useState<string | null>(null); const [open, setOpen] = useState<string | null>(null);
  const areas = [...new Set(s.activity.map(a => a.area))];
  const acts = s.activity.filter(a => (area === 'all' || a.area === area) && (a.what + a.who).toLowerCase().includes(q.toLowerCase()));
  return <>
    <PageHeader crumbs={crumbsFor('records', s.go)} title="Records & History" sub="Everything anyone does is saved with who and when. Finished jobs and inspection reports are locked." />
    <Tabs value={tab} onChange={setTab} items={[{ id: 'activity', label: 'Activity log', count: s.activity.length }, { id: 'locked', label: 'Locked records', count: s.locked.length }]} />
    {tab === 'activity' ? <Card title="Activity log" action={<div className="toolbar"><MiniSearch value={q} onChange={setQ} placeholder="Search history" /><div style={{ width: 190 }}><Select value={area} onChange={setArea} options={[{ value: 'all', label: 'All areas' }, ...areas.map(a => ({ value: a, label: a }))]} /></div></div>}>
      <div className="divlist">{acts.map(a => <div key={a.id} className="item"><span className="tile t-neutral" style={{ width: 32, height: 32 }}><History size={15} /></span><div className="stack grow"><b>{a.what}</b><span className="caption">{a.who} · {a.area}</span></div><span className="caption">{a.when}</span></div>)}</div>
      {!acts.length && <div className="empty">Nothing found.</div>}</Card>
      : <Card title="Locked records" sub="Unlocking needs a reason. The old version is always kept.">
        <div className="divlist">{s.locked.map(r => <div key={r.id} className="item"><span className="tile t-brand" style={{ width: 32, height: 32 }}><Lock size={15} /></span><div className="stack grow"><b>{r.title}</b><span className="caption">{r.kind} · locked {r.locked} by {r.by}{r.versions.length ? ` · ${r.versions.length} earlier version${r.versions.length > 1 ? 's' : ''}` : ''}</span></div>
          <Btn sm kind="ghost" icon={<Eye size={14} />} onClick={() => setOpen(r.id)}>Versions</Btn><Btn sm kind="outline" icon={<Unlock size={14} />} onClick={() => setUnlock(r.id)}>Unlock</Btn></div>)}</div></Card>}
    {unlock && <Reason title="Unlock this record" sub="Say why. The current version is saved before anything changes." cta="Unlock" placeholder="e.g. Meter reading typed wrong" onClose={() => setUnlock(null)} onDone={r => { const rec = s.locked.find(x => x.id === unlock)!; s.setLocked(ls => ls.map(x => x.id === unlock ? { ...x, versions: [{ when: '15 Oct 2026', who: 'Sarah Khan', reason: r }, ...x.versions] } : x)); s.log(`Unlocked "${rec.title}": ${r}. Old version kept.`, 'Records & History'); s.toast('Unlocked. Old version saved. Locks again after the edit.'); setUnlock(null); }} />}
    {open && (() => { const r = s.locked.find(x => x.id === open)!; return <Drawer title={r.title} sub={`${r.kind} · locked ${r.locked}`} onClose={() => setOpen(null)}>
      <Card className="flat" title="Versions"><div className="divlist"><div className="item"><Chip tone="ok">Current</Chip><b className="grow">Locked by {r.by}</b><span className="caption">{r.locked}</span></div>{r.versions.map((v, i) => <div key={i} className="item"><Chip tone="neutral">v{r.versions.length - i}</Chip><div className="stack grow"><b>Unlocked by {v.who}</b><span className="caption">Reason: {v.reason}</span></div><span className="caption">{v.when}</span></div>)}</div>
        {!r.versions.length && <div className="caption">Never unlocked.</div>}</Card></Drawer>; })()}
  </>;
}

/* ================= SUPPORT ACCESS ================= */
export function Support() {
  const s = useStore(); const [allow, setAllow] = useState<string | null>(null); const [hours, setHours] = useState('2'); const [refuse, setRefuse] = useState<string | null>(null); const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick(x => x + 1), 1000); return () => clearInterval(t); }, []);
  const left = (u?: number) => { if (!u) return ''; const ms = u - Date.now(); if (ms <= 0) return 'ending'; const h = Math.floor(ms / 36e5), m = Math.floor(ms / 6e4) % 60, sec = Math.floor(ms / 1000) % 60; return `${h}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`; };
  return <>
    <PageHeader crumbs={crumbsFor('support', s.go)} title="Support Access" sub="The Genesis tech team can only look at your data if you allow it, for a set time. Everything they open is logged." />
    <Note>Only the Supervisor and Company Admin can allow access. You can stop it at any time.</Note>
    {s.support.map(r => <Card key={r.id} title={r.from} sub={`Asked ${r.asked}`} action={<Chip tone={r.status === 'Allowed' ? 'ok' : r.status === 'Waiting' ? 'warn' : r.status === 'Refused' ? 'err' : 'neutral'}>{r.status}</Chip>}>
      <p style={{ margin: 0, lineHeight: 1.6 }}>“{r.reason}”</p>
      {r.status === 'Allowed' && <div className="flex between" style={{ background: 'var(--status-success-bg)', borderRadius: 12, padding: '12px 16px' }}><span className="flex"><Clock size={16} /> Access ends in <b>{left(r.until)}</b></span><Btn sm kind="danger" icon={<XCircle size={14} />} onClick={() => { s.setSupport(ss => ss.map(x => x.id === r.id ? { ...x, status: 'Ended', looks: [...x.looks, 'Stopped by Sarah Khan'] } : x)); s.log(`Stopped support access for ${r.from}`, 'Support Access'); s.toast('Access stopped now'); }}>Stop now</Btn></div>}
      {r.status === 'Waiting' && <div className="flex"><Btn kind="outline" onClick={() => setRefuse(r.id)}>Refuse</Btn><Btn icon={<ShieldAlert size={16} />} onClick={() => setAllow(r.id)}>Allow for a set time</Btn></div>}
      {r.looks.length > 0 && <div className="stack" style={{ gap: 6 }}><b className="small">What they looked at</b>{r.looks.map((l, i) => <span key={i} className="caption">• {l}</span>)}</div>}
    </Card>)}
    {allow && <Modal title="Allow support access" sub="Access ends by itself when the time runs out." onClose={() => setAllow(null)} footer={<><Btn kind="outline" onClick={() => setAllow(null)}>Cancel</Btn><Btn onClick={() => { s.setSupport(ss => ss.map(x => x.id === allow ? { ...x, status: 'Allowed', until: Date.now() + +hours * 36e5, looks: ['Opened Rent & Invoices', 'Opened 5 Mill Lane rent records'] } : x)); s.log(`Allowed support access for ${hours} hour(s)`, 'Support Access'); s.toast(`Access allowed for ${hours} hour(s)`); setAllow(null); }}>Allow</Btn></>}>
      <Field label="For how long"><Select value={hours} onChange={setHours} options={[['1', '1 hour'], ['2', '2 hours'], ['4', '4 hours'], ['24', '24 hours']].map(([v, l]) => ({ value: v, label: l }))} /></Field>
    </Modal>}
    {refuse && <Reason danger title="Refuse access" cta="Refuse" onClose={() => setRefuse(null)} onDone={r => { s.setSupport(ss => ss.map(x => x.id === refuse ? { ...x, status: 'Refused', looks: ['Refused: ' + r] } : x)); s.log(`Refused support access: ${r}`, 'Support Access'); s.toast('Access refused'); setRefuse(null); }} />}
  </>;
}

/* ================= REPORTS ================= */
export function Reports() {
  const s = useStore(); const [range, setRange] = useState('This month');
  const reps = [
    { t: 'Rent collected', d: 'What came in, what is late, what carries forward', ic: PoundSterling },
    { t: 'Repairs and spend', d: 'Every job, contractor cost, price and margin', ic: Receipt },
    { t: 'Repair budgets', d: 'Each landlord’s yearly budget and alerts', ic: AlertTriangle },
    { t: 'Safety checks', d: 'What is in date, due and overdue', ic: ShieldAlert },
    { t: 'Lettings', d: 'Applicants at each step and time to let', ic: FileText },
    { t: 'Team work', d: 'Tasks done, open and late per Office Admin', ic: History },
  ];
  const max = Math.max(...RENT_CHART.map(r => r.v));
  return <>
    <PageHeader crumbs={crumbsFor('reports', s.go)} title="Reports" sub="Download any report as Excel or PDF." action={<div style={{ width: 170 }}><Select value={range} onChange={setRange} options={['This month', 'Last month', 'This quarter', 'This year'].map(x => ({ value: x, label: x }))} /></div>} />
    <Card title="Rent collected" sub="£ thousands per month"><div className="chartbars" style={{ height: 180 }}>{RENT_CHART.map((r, i) => <div key={r.m} className="stack" style={{ alignItems: 'center', flex: 1, gap: 6 }}><b className="caption">{r.v}</b><div style={{ width: '60%', height: `${(r.v / max) * 130}px`, borderRadius: 10, background: i === RENT_CHART.length - 1 ? 'var(--bg-brand)' : 'var(--chart-bar, #D6E0F5)' }} /><span className="caption">{r.m}</span></div>)}</div></Card>
    <div className="grid g3">{reps.map(r => <Card key={r.t} title={<span className="flex"><span className="tile t-brand" style={{ width: 32, height: 32 }}><r.ic size={15} /></span>{r.t}</span>} sub={r.d}>
      <div className="flex"><Btn sm kind="outline" icon={<FileSpreadsheet size={14} />} onClick={() => { s.toast(`${r.t} (${range}) downloaded as Excel`); s.log(`Downloaded ${r.t} report (Excel)`, 'Reports'); }}>Excel</Btn><Btn sm kind="outline" icon={<Download size={14} />} onClick={() => { s.toast(`${r.t} (${range}) downloaded as PDF`); s.log(`Downloaded ${r.t} report (PDF)`, 'Reports'); }}>PDF</Btn></div></Card>)}</div>
  </>;
}
