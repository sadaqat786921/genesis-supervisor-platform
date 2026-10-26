import { useState } from 'react';
import { Mail, UserCheck, UserPlus, TriangleAlert, Home, MessageCircle, CircleCheck, Wrench, Lock, ArrowRight, TrendingUp, Plus, CalendarDays, Clock, UserX, Send } from 'lucide-react';
import { useStore, useLookups, money, rentStatus, staff, type Route } from '../store';
import { ADMINS, PLAN, RENT_CHART, daysFrom, nowStamp } from '../data';
import { Avatar, Bar, Btn, Card, Chip, Drawer, IBtn, KV, Kpi, Note, Tabs, Select } from '../ui';
import { PageHeader } from '../Shell';
import { approveJob, NewLandlordModal } from './shared';

export default function Today() {
  const s = useStore();
  const L = useLookups();
  const [tab, setTab] = useState<'all' | 'overdue' | 'waiting' | 'owner'>('all');
  const [open, setOpen] = useState<null | { t: string; d: string; owner?: string; next: string; due: string; r: Route; id?: string }>(null);
  const [newLL, setNewLL] = useState(false);
  const waiting = s.jobs.filter(j => j.status === 'Waiting approval');
  const late = s.rent.filter(r => rentStatus(r).tone === 'err');
  const lateSum = late.reduce((a, r) => a + r.amount - r.paid, 0);
  const tasksBy = (id: string) => s.tasks.filter(t => t.admin === id && !t.done);

  const attention = [
    ...s.jobs.filter(j => j.urgent && j.status === 'New').map(j => ({ kind: 'overdue', t: 'Emergency: ' + j.title, d: L.prop(j.property)?.address ?? '', owner: j.admin, next: 'Assign a contractor now', due: 'Today', r: 'jobs' as Route, id: j.id, tone: 'err' as const })),
    ...waiting.map(j => ({ kind: 'waiting', t: `${j.title} · ${money(j.price)}`, d: (L.prop(j.property)?.address ?? '') + ' · over the limit', owner: j.admin, next: 'Approve or ask the landlord', due: j.reported.split(',')[0].replace(' 2026', ''), r: 'approvals' as Route, id: j.id, tone: 'warn' as const })),
    ...s.requests.filter(q => q.status === 'Waiting').map(q => ({ kind: 'waiting', t: `${q.kind} · ${q.title.split(': ').slice(-1)[0]}`, d: `Asked by ${staff(q.from)?.name} · ${q.about}`, owner: q.from, next: q.kind === 'New landlord' ? 'Create the landlord account' : 'Approve or decline the request', due: q.at.split(',')[0].replace(' 2026', ''), r: 'approvals' as Route, id: q.id, tone: 'warn' as const })),
    ...s.applicants.filter(a => a.stage === 4 && !a.rejected).map(a => ({ kind: 'waiting', t: `Ready for your review · ${a.name}`, d: L.prop(a.property)?.address ?? '', owner: a.admin, next: 'Approve and book move-in', due: 'Today', r: 'lettings' as Route, id: a.id, tone: 'info' as const })),
    ...late.map(r => { const t = L.tenant(r.tenant); return { kind: 'overdue', t: `Rent late · ${money(r.amount - r.paid)}`, d: (t?.name ?? '') + ', ' + (L.prop(t?.property)?.address ?? ''), owner: L.prop(t?.property)?.admin, next: 'Send a reminder or call', due: r.due.replace(' 2026', ''), r: 'rent' as Route, id: r.id, tone: 'err' as const }; }),
    ...s.safety.filter(c => c.status === 'Overdue' || c.status === 'Missing').map(c => ({ kind: 'overdue', t: `${c.kind} ${c.status === 'Missing' ? 'missing' : 'overdue'}`, d: L.prop(c.property)?.address ?? '', owner: L.prop(c.property)?.admin, next: c.status === 'Missing' ? 'Upload the certificate' : 'Book a qualified contractor', due: c.status === 'Missing' ? 'Now' : c.expires.replace(' 2026', ''), r: 'safety' as Route, id: c.id, tone: 'err' as const })),
    ...s.inspections.filter(i => i.status === 'Not assigned').map(i => ({ kind: 'owner', t: `${i.kind} inspection has no inspector`, d: L.prop(i.property)?.address ?? '', owner: undefined, next: 'Assign a Site Inspector', due: i.date.replace(' 2026', ''), r: 'inspections' as Route, id: i.id, tone: 'warn' as const })),
    ...s.applicants.filter(a => !a.admin && !a.rejected).map(a => ({ kind: 'owner', t: `New applicant · ${a.name}`, d: L.prop(a.property)?.address ?? '', owner: undefined, next: 'Assign an Office Admin', due: 'Today', r: 'lettings' as Route, id: a.id, tone: 'info' as const })),
    ...s.enquiries.filter(e => e.stage === 'New').map(e => ({ kind: 'owner', t: `New enquiry · ${e.name}`, d: e.about, owner: undefined, next: 'Assign an Office Admin', due: 'Today', r: 'enquiries' as Route, id: e.id, tone: 'info' as const })),
    ...s.signups.filter(x => x.status === 'Waiting').map(x => ({ kind: 'waiting', t: `Sign-up waiting · ${x.name}`, d: x.kind, owner: undefined, next: 'Check documents, approve or refuse', due: x.applied.split(',')[0].replace(' 2026', ''), r: 'signups' as Route, id: x.id, tone: 'info' as const })),
  ];
  const coming = [
    ...s.inspections.filter(i => i.status !== 'Locked' && daysFrom(i.date) >= 0).map(i => ({ d: i.date, t: `${i.kind} · ${i.time}`, p: L.prop(i.property)?.address ?? '', r: 'inspections' as Route, id: i.id, c: 't-info' })),
    ...s.applicants.filter(a => a.stage === 5 && a.moveInAt).map(a => ({ d: a.moveInAt!.split(',')[0], t: 'Move-in · ' + a.name, p: L.prop(a.property)?.address ?? '', r: 'lettings' as Route, id: a.id, c: 't-ok' })),
    ...s.safety.filter(c => c.days >= 0 && c.days <= 30).map(c => ({ d: c.expires, t: c.kind + ' ends', p: L.prop(c.property)?.address ?? '', r: 'safety' as Route, id: c.id, c: 't-warn' })),
  ].sort((a, b) => daysFrom(a.d) - daysFrom(b.d)).slice(0, 4);
  const shown = attention.filter(a => tab === 'all' || a.kind === tab);
  const noOwner = attention.filter(a => !a.owner).length;
  const max = Math.max(...RENT_CHART.map(r => r.v));

  return (
    <>
      <PageHeader title="Good morning, Sarah" action={<Btn icon={<Plus size={18} />} onClick={() => setNewLL(true)}>New landlord</Btn>} />
      <div className="row">
        <div className="hero grow">
          <div className="col grow" style={{ gap: 14 }}>
            <span className="chip-dark" style={{ alignSelf: 'flex-start' }}>Portfolio health · October</span>
            <div className="flex" style={{ alignItems: 'flex-end', gap: 10 }}><span className="big">92%</span><span className="chip accent nodot" style={{ marginBottom: 12 }}><TrendingUp size={13} /> +3% vs Sep</span></div>
            <p style={{ margin: 0, color: '#C3CDE4', fontSize: 13, fontWeight: 500, maxWidth: 420 }}>of homes are fully on track: rent paid, checks in date and no repairs waiting.</p>
            <div className="flex" style={{ gap: 12 }}>{[['152', 'Managed homes'], ['94%', 'Rent collected'], ['87%', 'Jobs on time']].map(([v, l]) => <div className="mtile" key={l}><b>{v}</b><span>{l}</span></div>)}</div>
          </div>
          <div className="gring"><svg viewBox="0 0 176 176"><circle cx="88" cy="88" r="80" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="14" /><circle cx="88" cy="88" r="80" fill="none" stroke="#5BAF00" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 80 * 0.92} 999`} transform="rotate(-90 88 88)" /></svg>
            <div className="stack" style={{ alignItems: 'center' }}><Home size={22} color="#5BAF00" /><b style={{ fontSize: 13 }}>169 of 184</b><span style={{ fontSize: 10.5, color: '#AEBBDA' }}>homes on track</span></div></div>
        </div>
        <Card title="Needs your decision" action={<Chip tone="warn">{waiting.length + s.requests.filter(q => q.status === 'Waiting').length} waiting</Chip>} style={{ width: 400, flex: 'none' }}>
          {waiting.slice(0, 3).map(j => { const p = L.prop(j.property); const ll = L.landlord(p?.owner); return (
            <div className="lrow" key={j.id}>
              <span className="tile t-white" style={{ width: 36, height: 36 }}>{j.title.includes('Roof') ? <Home size={18} /> : j.title.includes('lock') ? <Lock size={18} /> : <Wrench size={18} />}</span>
              <button className="stack grow" style={{ border: 0, background: 'none', textAlign: 'left', padding: 0 }} onClick={() => s.go('approvals', j.id)}><span className="flex" style={{ gap: 6 }}><b>{j.title}</b><b style={{ color: 'var(--warn)' }}>{money(j.price)}</b></span><span className="caption">{p?.address.split(',')[0]} · limit {money(ll ? PLAN[ll.plan].limit : 0)}</span></button>
              <IBtn sm icon={<MessageCircle size={16} />} label="Ask the landlord" onClick={() => { s.toast(`Quote sent to ${ll?.name} to approve`); s.log(`Asked ${ll?.name} to approve ${j.title} (${money(j.price)})`, 'Approvals & Budgets'); }} />
              <IBtn sm kind="success" icon={<CircleCheck size={18} />} label="Approve" onClick={() => approveJob(s, j, L)} />
            </div>); })}
          {s.requests.filter(q => q.status === 'Waiting').slice(0, Math.max(0, 3 - Math.min(3, waiting.length))).map(q => <div className="lrow" key={q.id}>
            <span className="tile t-white" style={{ width: 36, height: 36 }}><Send size={18} /></span>
            <button className="stack grow" style={{ border: 0, background: 'none', textAlign: 'left', padding: 0, minWidth: 0 }} onClick={() => s.go('approvals', q.id)}><b className="ellip">{q.title}</b><span className="caption">From {staff(q.from)?.name} · {q.kind}</span></button>
            <IBtn sm icon={<ArrowRight size={16} />} label="Open request" onClick={() => s.go('approvals', q.id)} />
          </div>)}
          {!waiting.length && !s.requests.some(q => q.status === 'Waiting') && <Note tone="ok">Nothing waiting. Every decision is made.</Note>}
          {waiting.length + s.requests.filter(q => q.status === 'Waiting').length > 3 && <button className="btn ghost sm" onClick={() => s.go('approvals')}>See all {waiting.length + s.requests.filter(q => q.status === 'Waiting').length}</button>}
        </Card>
      </div>
      <div className="grid g4">
        <Kpi icon={<Mail size={18} />} tone="info" label="Enquiries" value={s.enquiries.filter(e => e.stage === 'New').length} caption="new today" spark="M0 18 L13 15 L26 17 L40 9 L53 11 L66 5 L80 3" onClick={() => s.go('enquiries')} />
        <Kpi icon={<UserCheck size={18} />} tone="brand" label="Lettings to check" value={s.applicants.filter(a => !a.rejected && (a.stage === 4 || (a.stage === 2 && a.kyc.every(d => d.status !== 'Missing') && a.kyc.some(d => d.status === 'Uploaded')))).length} caption="KYC and your reviews" spark="M0 6 L13 10 L26 8 L40 14 L53 12 L66 17 L80 15" onClick={() => s.go('lettings')} />
        <Kpi icon={<UserPlus size={18} />} tone="ok" label="Sign-ups waiting" value={s.signups.filter(x => x.status === 'Waiting').length} caption={`${s.signups.filter(x => x.status === 'Waiting' && !x.kind.startsWith('Client')).length} contractors · ${s.signups.filter(x => x.status === 'Waiting' && x.kind.startsWith('Client')).length} client`} spark="M0 18 L13 18 L26 12 L40 14 L53 8 L66 10 L80 5" onClick={() => s.go('signups')} />
        <Kpi icon={<TriangleAlert size={18} />} tone="err" label="Late rent" value={money(lateSum)} caption={`${late.length} tenants`} spark="M0 15 L13 13 L26 17 L40 9 L53 11 L66 5 L80 7" onClick={() => s.go('rent')} />
      </div>
      <div className="row">
        <Card title="Rent collected" sub="Last 6 months" className="grow" action={<Tabs value="6m" onChange={() => s.toast('Showing the last 6 months')} items={[{ id: '6m', label: '6M' }, { id: '1y', label: '1Y' }, { id: 'all', label: 'All' }]} />}>
          <div className="flex" style={{ gap: 10 }}><span className="metric">£48,250</span><Chip tone="ok">+1.9%</Chip></div>
          <div className="chartbars">{RENT_CHART.map((r, i) => <div key={r.m} className={i === 5 ? 'on' : ''}>{i === 5 && <Chip tone="neutral" dot={false}>£{r.v}K</Chip>}<i style={{ height: `${((r.v - 30) / (max - 30)) * 85}%` }} /><span className="caption" style={i === 5 ? { color: 'var(--text-brand)', fontWeight: 700 } : undefined}>{r.m}</span></div>)}</div>
        </Card>
        <Card title="Team Work" action={<span className="caption" style={{ fontWeight: 600 }}>{s.tasks.filter(t => !t.done).length} tasks</span>} style={{ width: 320, flex: 'none' }}>
          {ADMINS.map(a => { const t = tasksBy(a.id); const lateN = t.filter(x => x.late).length; return (
            <button key={a.id} className="item click" style={{ padding: '4px 0' }} onClick={() => s.go('team', a.id)}><Avatar id={a.id} /><div className="stack grow" style={{ gap: 6 }}><span className="flex between"><b>{a.name}</b><span className="caption-strong" style={{ color: lateN ? 'var(--warn)' : 'var(--ok)' }}>{lateN ? `${lateN} late` : 'On track'}</span></span><Bar value={t.length ? ((t.length - lateN) / t.length) * 100 : 100} tone={lateN ? 'warn' : 'ok'} /></div></button>); })}
          <div className="grow" />
          {noOwner > 0 && <button className="alertbar" onClick={() => setTab('owner')}><TriangleAlert size={18} /><span className="grow">{noOwner} items have no one assigned</span><ArrowRight size={16} /></button>}
        </Card>
        <Card title="Coming up" action={<CalendarDays size={18} color="#667085" />} style={{ width: 300, flex: 'none' }}>
          {coming.map(c => { const [d, m] = c.d.split(' '); return (
            <button key={c.t + c.d} className="item click" style={{ padding: 0 }} onClick={() => s.go(c.r, c.id)}><span className={`datetile ${c.c}`}><b>{d}</b><span>{m.toUpperCase()}</span></span><div className="stack"><b>{c.t}</b><span className="caption">{c.p}</span></div></button>); })}
          <div className="grow" />
          <Btn kind="outline" sm onClick={() => s.go('inspections')}>Open full calendar</Btn>
        </Card>
      </div>
      <Card title="Attention list" sub="Anything late, waiting for a decision, stuck, or with no one looking after it. Start here every morning."
        action={<Tabs value={tab} onChange={setTab} items={[{ id: 'all', label: 'All', count: attention.length }, { id: 'overdue', label: 'Overdue', count: attention.filter(a => a.kind === 'overdue').length }, { id: 'waiting', label: 'Waiting', count: attention.filter(a => a.kind === 'waiting').length }, { id: 'owner', label: 'No one assigned', count: noOwner }]} />}>
        <div className="divlist">{shown.map((a, i) => (
          <button key={i} className="item click" onClick={() => setOpen(a)}>
            <span className={`tile t-${a.tone}`}>{a.kind === 'overdue' ? <Clock size={17} /> : a.kind === 'owner' ? <UserX size={17} /> : <TriangleAlert size={17} />}</span>
            <div className="stack grow"><b>{a.t}</b><span className="caption">{a.d}</span></div>
            <span className="caption" style={{ width: 200 }}>{a.next}</span>
            {a.owner ? <span className="flex" style={{ width: 150 }}><Avatar id={a.owner} /><span className="caption" style={{ fontWeight: 600 }}>{staff(a.owner)?.name}</span></span> : <span style={{ width: 150 }}><Chip tone="warn">No owner</Chip></span>}
            <Chip tone={a.tone === 'info' ? 'info' : a.tone}>{a.due}</Chip>
          </button>))}</div>
      </Card>
      {open && <AttentionDrawer a={open} onClose={() => setOpen(null)} />}
      {newLL && <NewLandlordModal onClose={() => setNewLL(false)} />}
    </>
  );
}

function AttentionDrawer({ a, onClose }: { a: { t: string; d: string; owner?: string; next: string; due: string; r: Route; id?: string }; onClose: () => void }) {
  const s = useStore();
  const [owner, setOwner] = useState(a.owner ?? '');
  return <Drawer title={a.t} sub={a.d} onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Close</Btn><Btn onClick={() => { onClose(); s.go(a.r, a.id); }} icon={<ArrowRight size={16} />}>Open item</Btn></>}>
    <Card className="flat"><KV rows={[['What it is', a.t], ['Where', a.d], ['Due', a.due], ['Next step', a.next], ['Person in charge', a.owner ? staff(a.owner)?.name : <Chip tone="warn">No one assigned</Chip>]]} /></Card>
    <Card className="flat" title="Give it to an Office Admin" sub="They see it straight away in their own list.">
      <Select value={owner} onChange={setOwner} options={[{ value: '', label: 'Choose an Office Admin' }, ...ADMINS.map(x => ({ value: x.id, label: x.name }))]} />
      <Btn kind="outline" disabled={!owner || owner === a.owner} onClick={() => { s.setTasks(t => [{ id: 'K' + Date.now(), title: a.t + ' · ' + a.d, admin: owner, due: '15 Oct 2026', late: false, done: false, created: nowStamp(), area: 'General', link: { route: a.r, id: a.id } }, ...t]); s.log(`Gave "${a.t}" to ${staff(owner)?.name}`, 'Team Work'); s.toast(`Given to ${staff(owner)?.name}`); onClose(); }}>Assign</Btn>
    </Card>
  </Drawer>;
}
