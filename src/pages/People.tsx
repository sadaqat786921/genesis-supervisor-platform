import type React from 'react';
import { useMemo, useState } from 'react';
import { Plus, Bell, ArrowRightLeft, CheckCircle2, Mail, Phone, ShieldCheck, KeyRound, ArrowRight, X, Home, FileSignature, Upload, CalendarDays, UserCheck, Send, Repeat } from 'lucide-react';
import { useStore, useLookups, money, rentStatus } from '../store';
import { ADMINS, LET_STAGES, PLAN, TEN_STEPS, type Applicant, type Enquiry, type Tenant } from '../data';
import { Avatar, Bar, Btn, Card, Chip, Drawer, Field, KV, Kpi, MiniSearch, Modal, Note, Reason, Select, Steps, Tabs, Text } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { AddPropertyModal, NewLandlordModal, adminName } from './shared';

/* ================= TEAM WORK ================= */
export function TeamWork() {
  const s = useStore();
  const [who, setWho] = useState<string>(s.detail && ADMINS.some(a => a.id === s.detail) ? s.detail : 'all');
  const [add, setAdd] = useState(false);
  const [assign, setAssign] = useState(false);
  const [move, setMove] = useState<string | null>(null);
  const list = s.tasks.filter(t => !t.done && (who === 'all' || t.admin === who));
  return <>
    <PageHeader crumbs={crumbsFor('team', s.go)} title="Team Work" sub="What each Office Admin is working on, what is due and what is late. Staff accounts are created by the Company Admin."
      action={<div className="flex"><Btn kind="outline" icon={<ArrowRightLeft size={16} />} onClick={() => setAssign(true)}>Assign Office Admin</Btn><Btn icon={<Plus size={18} />} onClick={() => setAdd(true)}>Add task</Btn></div>} />
    <div className="grid g4">{ADMINS.map(a => { const t = s.tasks.filter(x => x.admin === a.id && !x.done); const late = t.filter(x => x.late).length; return (
      <button key={a.id} className="kpi" style={who === a.id ? { borderColor: 'var(--border-brand)', boxShadow: '0 0 0 3px rgba(21,61,145,.08)' } : undefined} onClick={() => setWho(who === a.id ? 'all' : a.id)}>
        <div className="flex"><Avatar id={a.id} size="md" /><div className="stack grow"><b>{a.name}</b><span className="caption">Office Admin · {s.properties.filter(p => p.admin === a.id).length} homes</span></div></div>
        <div className="flex between"><span className="v">{t.length}<span className="caption"> tasks</span></span>{late ? <Chip tone="err">{late} late</Chip> : <Chip tone="ok">On track</Chip>}</div>
        <Bar value={(t.length / 5) * 100} tone={late ? 'err' : 'ok'} />
      </button>); })}</div>
    <Card title={who === 'all' ? 'All open tasks' : `${adminName(who)}'s tasks`} sub="Late tasks stand out in red. Send a reminder, or move the task to someone else." action={<Tabs value={who} onChange={setWho} items={[{ id: 'all', label: 'Everyone' }, ...ADMINS.map(a => ({ id: a.id, label: a.name.split(' ')[0] }))]} />}>
      <div className="tablewrap"><table className="t"><thead><tr><th>Task</th><th>Office Admin</th><th>Due</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead><tbody>
        {list.map(t => <tr key={t.id} style={{ cursor: 'default' }}><td className="strong">{t.title}</td><td><span className="cell"><Avatar id={t.admin} />{adminName(t.admin)}</span></td><td>{t.due}</td><td>{t.late ? <Chip tone="err">Late</Chip> : <Chip tone="info">Open</Chip>}</td>
          <td><div className="flex" style={{ justifyContent: 'flex-end' }}>
            <Btn sm kind="ghost" icon={<Bell size={14} />} onClick={() => { s.toast(`Reminder sent to ${adminName(t.admin)}`); s.log(`Sent reminder to ${adminName(t.admin)}: ${t.title}`, 'Team Work'); }}>Remind</Btn>
            <Btn sm kind="ghost" icon={<Repeat size={14} />} onClick={() => setMove(t.id)}>Move</Btn>
            <Btn sm kind="ghost" icon={<CheckCircle2 size={14} />} onClick={() => { s.setTasks(ts => ts.map(x => x.id === t.id ? { ...x, done: true } : x)); s.toast('Marked done'); s.log(`Marked done: ${t.title}`, 'Team Work'); }}>Done</Btn></div></td></tr>)}
      </tbody></table>{!list.length && <div className="empty">No open tasks. Nothing is forgotten.</div>}</div>
    </Card>
    {add && <AddTask onClose={() => setAdd(false)} />}
    {assign && <AssignAdmin onClose={() => setAssign(false)} />}
    {move && <MoveTask id={move} onClose={() => setMove(null)} />}
  </>;
}
function AddTask({ onClose }: { onClose: () => void }) {
  const s = useStore(); const [t, setT] = useState(''); const [a, setA] = useState('et'); const [d, setD] = useState('Today');
  return <Modal title="Add a task" onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn disabled={!t} onClick={() => { s.setTasks(ts => [{ id: 'K' + Date.now(), title: t, admin: a, due: d, late: false, done: false }, ...ts]); s.log(`Added task for ${adminName(a)}: ${t}`, 'Team Work'); s.toast('Task added'); onClose(); }}>Add task</Btn></>}>
    <Field label="What needs doing"><Text value={t} onChange={setT} placeholder="e.g. Call the tenant at 5 Mill Lane" /></Field>
    <div className="grid g2"><Field label="Office Admin"><Select value={a} onChange={setA} options={ADMINS.map(x => ({ value: x.id, label: x.name }))} /></Field><Field label="Due"><Select value={d} onChange={setD} options={['Today', 'Tomorrow', 'This week', 'Next week'].map(x => ({ value: x, label: x }))} /></Field></div>
  </Modal>;
}
function MoveTask({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const t = s.tasks.find(x => x.id === id)!; const [a, setA] = useState(ADMINS.find(x => x.id !== t.admin)!.id);
  return <Modal title="Move task to another Office Admin" sub={t.title} onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn onClick={() => { s.setTasks(ts => ts.map(x => x.id === id ? { ...x, admin: a } : x)); s.log(`Moved "${t.title}" from ${adminName(t.admin)} to ${adminName(a)}`, 'Team Work'); s.toast(`Moved to ${adminName(a)}`); onClose(); }}>Move task</Btn></>}>
    <Field label="Move to"><Select value={a} onChange={setA} options={ADMINS.filter(x => x.id !== t.admin).map(x => ({ value: x.id, label: x.name }))} /></Field>
  </Modal>;
}
function AssignAdmin({ onClose }: { onClose: () => void }) {
  const s = useStore(); const [kind, setKind] = useState<'landlord' | 'property'>('landlord'); const [item, setItem] = useState(s.landlords[0].id); const [a, setA] = useState('et');
  return <Modal title="Assign an Office Admin" sub="Each landlord, letting agent or property has a named Office Admin, so everyone knows who to call." onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn onClick={() => { if (kind === 'landlord') s.setLandlords(ls => ls.map(l => l.id === item ? { ...l, admin: a } : l)); else s.setProperties(ps => ps.map(p => p.id === item ? { ...p, admin: a } : p)); s.log(`Assigned ${adminName(a)} to ${kind} ${item}`, 'Team Work'); s.toast(`${adminName(a)} assigned`); onClose(); }}>Assign</Btn></>}>
    <Tabs value={kind} onChange={v => { setKind(v); setItem(v === 'landlord' ? s.landlords[0].id : s.properties[0].id); }} items={[{ id: 'landlord', label: 'Landlord' }, { id: 'property', label: 'Property' }]} />
    <Field label={kind === 'landlord' ? 'Landlord' : 'Property'}><Select value={item} onChange={setItem} options={(kind === 'landlord' ? s.landlords.map(l => ({ value: l.id, label: `${l.name} · now ${adminName(l.admin)}` })) : s.properties.map(p => ({ value: p.id, label: `${p.address} · now ${adminName(p.admin)}` })))} /></Field>
    <Field label="Office Admin"><Select value={a} onChange={setA} options={ADMINS.map(x => ({ value: x.id, label: x.name }))} /></Field>
  </Modal>;
}

/* ================= ENQUIRIES ================= */
export function Enquiries() {
  const s = useStore();
  const [tab, setTab] = useState<'all' | Enquiry['status']>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(s.detail);
  const list = s.enquiries.filter(e => (tab === 'all' || e.status === tab) && (e.name + e.about).toLowerCase().includes(q.toLowerCase()));
  const tone = { New: 'info', 'Passed on': 'brand', 'In Lettings': 'ok', Closed: 'neutral' } as const;
  return <>
    <PageHeader crumbs={crumbsFor('enquiries', s.go)} title="Enquiries" sub="Every website message lands here first. Pass landlords to an Office Admin; home seekers move to Lettings." />
    <Card title="Website messages" action={<div className="toolbar"><MiniSearch value={q} onChange={setQ} placeholder="Search enquiries" /><Tabs value={tab} onChange={setTab} items={[{ id: 'all', label: 'All', count: s.enquiries.length }, ...(['New', 'Passed on', 'In Lettings', 'Closed'] as const).map(x => ({ id: x, label: x, count: s.enquiries.filter(e => e.status === x).length }))]} /></div>}>
      <div className="tablewrap"><table className="t"><thead><tr><th>From</th><th>Who is it?</th><th>About</th><th>Received</th><th>Handled by</th><th>Status</th></tr></thead><tbody>
        {list.map(e => <tr key={e.id} onClick={() => setOpen(e.id)}><td><span className="cell"><Avatar name={e.name} /><span className="stack"><b className="strong">{e.name}</b><span className="caption">{e.email}</span></span></span></td><td><Chip tone={e.kind === 'Landlord' ? 'brand' : 'ok'} dot={false}>{e.kind}</Chip></td><td>{e.about}</td><td>{e.received}</td><td>{e.admin ? <span className="cell"><Avatar id={e.admin} />{adminName(e.admin)}</span> : <span className="muted">Not yet</span>}</td><td><Chip tone={tone[e.status]}>{e.status}</Chip></td></tr>)}
      </tbody></table>{!list.length && <div className="empty">No enquiries here.</div>}</div>
    </Card>
    {open && <EnquiryDrawer id={open} onClose={() => setOpen(null)} />}
  </>;
}
function EnquiryDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const e = s.enquiries.find(x => x.id === id); const [a, setA] = useState(e?.admin ?? 'et');
  if (!e) return null;
  const set = (patch: Partial<Enquiry>, msg: string) => { s.setEnquiries(es => es.map(x => x.id === id ? { ...x, ...patch } : x)); s.log(msg, 'Enquiries'); s.toast(msg); };
  return <Drawer title={e.name} sub={`${e.kind} · ${e.received}`} onClose={onClose}
    footer={e.status === 'Closed' ? <Btn kind="outline" onClick={onClose}>Close</Btn> : <>
      <Btn kind="outline" onClick={() => { set({ status: 'Closed' }, `Closed enquiry from ${e.name}`); onClose(); }}>Close enquiry</Btn>
      {e.kind === 'Home seeker' ? <Btn icon={<KeyRound size={16} />} disabled={e.status === 'In Lettings'} onClick={() => { s.setApplicants(ap => [{ id: 'AP' + Date.now(), name: e.name, email: e.email, phone: e.phone, property: s.properties.find(p => e.about.includes(p.address.split(' (')[0]))?.id ?? 'P4', stage: 0, source: 'Website', admin: a, applied: '15 Oct', household: '—', budget: 0, moveIn: '—' }, ...ap]); set({ status: 'In Lettings', admin: a }, `${e.name} moved to Lettings as a new applicant`); onClose(); s.go('lettings'); }}>Move to Lettings</Btn>
        : <Btn icon={<Send size={16} />} onClick={() => { set({ status: 'Passed on', admin: a }, `Passed enquiry from ${e.name} to ${adminName(a)}`); onClose(); }}>Pass to {adminName(a).split(' ')[0]}</Btn>}</>}>
    <Card className="flat" title="Message"><p style={{ margin: 0, lineHeight: 1.6, fontSize: 13.5 }}>“{e.message}”</p><div className="flex wrap"><Chip tone="ok" dot={false}><CheckCircle2 size={12} /> Consent given</Chip><Chip tone="ok" dot={false}><ShieldCheck size={12} /> Passed spam check</Chip></div></Card>
    <Card className="flat"><KV rows={[['Email', e.email], ['Phone', e.phone], ['About', e.about], ['Who is it?', e.kind === 'Landlord' ? 'A landlord wanting LSP to manage their home' : 'Someone looking for a home to rent']]} /></Card>
    {e.status !== 'Closed' && <Card className="flat" title="Who should follow up?" sub="The Office Admin sees it in their own list and contacts the person."><Select value={a} onChange={setA} options={ADMINS.map(x => ({ value: x.id, label: x.name }))} /></Card>}
    <Card className="flat" title="History"><div className="caption">Received from the website form · {e.received}{e.admin && <><br />Passed to {adminName(e.admin)}</>}</div></Card>
  </Drawer>;
}

/* ================= LANDLORDS ================= */
export function Landlords() {
  const s = useStore();
  const [q, setQ] = useState(''); const [plan, setPlan] = useState<'all' | '12' | '16' | '20'>('all'); const [add, setAdd] = useState(false);
  if (s.detail && s.landlords.some(l => l.id === s.detail)) return <LandlordPage id={s.detail} />;
  const list = s.landlords.filter(l => (plan === 'all' || String(l.plan) === plan) && (l.name + l.email).toLowerCase().includes(q.toLowerCase()));
  return <>
    <PageHeader crumbs={crumbsFor('landlords', s.go)} title="Landlords" sub="Every landlord, their plan and their homes. One landlord can have many homes." action={<Btn icon={<Plus size={18} />} onClick={() => setAdd(true)}>New landlord</Btn>} />
    <div className="grid g4">
      <Kpi icon={<UserCheck size={18} />} tone="brand" label="Landlords" value={s.landlords.length} caption={`${s.landlords.filter(l => l.status === 'Invite sent').length} invite waiting`} />
      {([12, 16, 20] as const).map((p, i) => <Kpi key={p} icon={<Home size={18} />} tone={(['info', 'ok', 'warn'] as const)[i]} label={`${p}% plan`} value={s.landlords.filter(l => l.plan === p).length} caption={`job limit ${money(PLAN[p].limit)}`} />)}
    </div>
    <Card title="All landlords" action={<div className="toolbar"><MiniSearch value={q} onChange={setQ} placeholder="Search name or email" /><Tabs value={plan} onChange={setPlan} items={[{ id: 'all', label: 'All plans' }, { id: '12', label: '12%' }, { id: '16', label: '16%' }, { id: '20', label: '20%' }]} /></div>}>
      <div className="tablewrap"><table className="t"><thead><tr><th>Landlord</th><th>Plan</th><th>Homes</th><th>Repair budget used</th><th>Office Admin</th><th>Login</th></tr></thead><tbody>
        {list.map(l => { const homes = s.properties.filter(p => p.managed && p.owner === l.id).length; const pct = l.budget ? Math.round(l.used / l.budget * 100) : 0; return (
          <tr key={l.id} onClick={() => s.go('landlords', l.id)}><td><span className="cell"><Avatar name={l.name} /><span className="stack"><b className="strong">{l.name}</b><span className="caption">{l.email}</span></span></span></td>
            <td><Chip tone="brand" dot={false}>{l.plan}% · limit {money(PLAN[l.plan].limit)}</Chip></td><td>{homes}</td>
            <td style={{ minWidth: 160 }}>{l.budget ? <div className="stack" style={{ gap: 6 }}><span className="caption">{money(l.used)} of {money(l.budget)} · {pct}%</span><Bar value={pct} tone={pct >= 90 ? 'err' : pct >= 70 ? 'warn' : 'ok'} /></div> : <span className="muted">Starts with agreement</span>}</td>
            <td><span className="cell"><Avatar id={l.admin} />{adminName(l.admin)}</span></td><td>{l.status === 'Active' ? <Chip tone="ok">Active</Chip> : <Chip tone="warn">Invite sent</Chip>}</td></tr>); })}
      </tbody></table></div>
    </Card>
    {add && <NewLandlordModal onClose={() => setAdd(false)} />}
  </>;
}
function LandlordPage({ id }: { id: string }) {
  const s = useStore(); const l = s.landlords.find(x => x.id === id)!; const [addP, setAddP] = useState(false); const [edit, setEdit] = useState(false);
  const homes = s.properties.filter(p => p.managed && p.owner === id);
  const pct = l.budget ? Math.round(l.used / l.budget * 100) : 0;
  return <>
    <PageHeader crumbs={crumbsFor('landlords', s.go, l.name)} title={l.name} sub={`${l.plan}% plan since ${l.start} · Office Admin ${adminName(l.admin)}`}
      action={<div className="flex">{l.status === 'Invite sent' && <Btn kind="outline" icon={<Mail size={16} />} onClick={() => { s.toast(`Login email sent again to ${l.email}`); s.log(`Resent login email to ${l.name}`, 'Landlords'); }}>Resend login email</Btn>}<Btn kind="outline" onClick={() => setEdit(true)}>Edit details</Btn><Btn icon={<Plus size={18} />} onClick={() => setAddP(true)}>Add property</Btn></div>} />
    <div className="row">
      <Card title="Contact and billing" style={{ flex: 1 }}><KV rows={[['Email', l.email], ['Phone', l.phone], ['Billing address', l.billing], ['Login', l.status === 'Active' ? <Chip tone="ok">Active · sees only their homes</Chip> : <Chip tone="warn">Waiting for them to set a password</Chip>], ['ID checks', 'Not needed for landlords']]} /></Card>
      <Card title="Plan and repair budget" style={{ flex: 1 }}>
        <div className="flex" style={{ gap: 16 }}><span className="metric">{l.plan}%</span><div className="stack"><b>Job limit {money(PLAN[l.plan].limit)}</b><span className="caption">Jobs above this come to you to approve</span></div></div>
        {l.budget ? <><div className="flex between"><span className="label">Yearly repair budget</span><b>{money(l.used)} of {money(l.budget)}</b></div><Bar value={pct} tone={pct >= 90 ? 'err' : pct >= 70 ? 'warn' : 'ok'} />{pct >= 70 && <Note tone={pct >= 90 ? 'err' : 'warn'}>{pct}% used. The landlord got the {pct >= 90 ? '90%' : '70%'} alert email.</Note>}</> : <Note>Budget starts when the agreement starts.</Note>}
      </Card>
    </div>
    <Card title={`Homes (${homes.length})`} sub="Saved as Managed. Shared houses list each room.">
      <div className="grid g3">{homes.map(p => <button key={p.id} className="kcard" onClick={() => s.go('properties', p.id)}><div className="photo" style={{ height: 120, backgroundImage: `url(${p.photo})` }} /><b>{p.address}</b><span className="caption">{p.area} · {p.type === 'HMO' ? `${p.rooms} rooms` : `${p.beds} bed ${p.type.toLowerCase()}`}</span><div className="flex between"><b style={{ color: 'var(--text-brand)' }}>{money(p.rent)} pcm</b><Chip tone={p.status === 'Let' ? 'ok' : 'warn'}>{p.status}</Chip></div></button>)}
        {!homes.length && <div className="empty">No homes yet. Add the landlord's first property.</div>}</div>
    </Card>
    <Card title="History"><div className="divlist">{s.activity.filter(a => a.what.includes(l.name)).concat([{ id: 'x', when: l.start, who: 'Sarah Khan', what: `Created account on the ${l.plan}% plan`, area: 'Landlords' }]).map(a => <div key={a.id} className="item"><span className="caption" style={{ width: 120 }}>{a.when}</span><b className="grow">{a.what}</b><span className="caption">{a.who}</span></div>)}</div></Card>
    {addP && <AddPropertyModal owner={id} managed onClose={() => setAddP(false)} />}
    {edit && <EditLandlord id={id} onClose={() => setEdit(false)} />}
  </>;
}
function EditLandlord({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const l = s.landlords.find(x => x.id === id)!; const [f, setF] = useState({ phone: l.phone, billing: l.billing, admin: l.admin });
  return <Modal title="Edit landlord details" sub="Changes are saved in History with who changed them." onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn onClick={() => { s.setLandlords(ls => ls.map(x => x.id === id ? { ...x, ...f } : x)); s.log(`Updated details for ${l.name}`, 'Landlords'); s.toast('Saved'); onClose(); }}>Save</Btn></>}>
    <Field label="Phone"><Text value={f.phone} onChange={v => setF({ ...f, phone: v })} /></Field><Field label="Billing address"><Text value={f.billing} onChange={v => setF({ ...f, billing: v })} /></Field>
    <Field label="Office Admin"><Select value={f.admin} onChange={v => setF({ ...f, admin: v })} options={ADMINS.map(a => ({ value: a.id, label: a.name }))} /></Field>
  </Modal>;
}

/* ================= LETTINGS ================= */
export function Lettings() {
  const s = useStore(); const L = useLookups(); const [open, setOpen] = useState<string | null>(null); const [home, setHome] = useState('all');
  const homes = [...new Set(s.applicants.map(a => a.property))];
  const live = s.applicants.filter(a => !a.rejected && (home === 'all' || a.property === home));
  return <>
    <PageHeader crumbs={crumbsFor('lettings', s.go)} title="Lettings" sub="Six steps from Rightmove to an approved tenant. Click a card to move it on." />
    <div className="toolbar"><Tabs value={home} onChange={setHome} items={[{ id: 'all', label: 'All homes', count: s.applicants.filter(a => !a.rejected).length }, ...homes.map(h => ({ id: h, label: L.prop(h)?.address.split(' (')[0] ?? h, count: s.applicants.filter(a => a.property === h && !a.rejected).length }))]} /><span className="caption">{s.applicants.filter(a => a.rejected).length} not going ahead (reasons saved)</span></div>
    <div className="kanban">{LET_STAGES.map((st, i) => <div className="lane" key={st}>
      <div className="flex between" style={{ padding: '2px 4px' }}><b>{i + 1}. {st}</b><span className="count">{live.filter(a => a.stage === i).length}</span></div>
      {live.filter(a => a.stage === i).map(a => <button key={a.id} className="kcard" onClick={() => setOpen(a.id)}>
        <div className="flex"><Avatar name={a.name} /><div className="stack grow"><b>{a.name}</b><span className="caption">{a.source} · applied {a.applied}</span></div></div>
        <span className="caption"><Home size={12} style={{ verticalAlign: -2 }} /> {L.prop(a.property)?.address.split(' (')[0]}{a.room ? ` · ${a.room}` : ''}</span>
        {a.viewing && i === 2 && <Chip tone="info" dot={false}><CalendarDays size={12} /> {a.viewing}</Chip>}
        {a.reference && <Chip tone={a.reference === 'Passed' ? 'ok' : a.reference === 'Failed' ? 'err' : 'warn'}>Referencing {a.reference.toLowerCase()}</Chip>}
      </button>)}
    </div>)}</div>
    {open && <ApplicantDrawer id={open} onClose={() => setOpen(null)} />}
  </>;
}
function ApplicantDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const a = s.applicants.find(x => x.id === id)!; const [rej, setRej] = useState(false); const [view, setView] = useState('2026-10-20T10:00'); const [fb, setFb] = useState(a.feedback ?? '');
  const p = L.prop(a.property);
  const upd = (patch: Partial<Applicant>, msg: string) => { s.setApplicants(as => as.map(x => x.id === id ? { ...x, ...patch } : x)); s.log(msg, 'Lettings'); s.toast(msg); };
  const actions: Record<number, React.ReactElement> = {
    0: <Btn onClick={() => upd({ stage: 1 }, `${a.name} moved to screening`)}>Start screening</Btn>,
    1: <Btn icon={<CheckCircle2 size={16} />} onClick={() => upd({ stage: 2 }, `${a.name} passed first screening`)}>Passed screening</Btn>,
    2: <Btn icon={<CheckCircle2 size={16} />} disabled={!a.viewing} onClick={() => upd({ stage: 3, feedback: fb || 'Viewing done' }, `${a.name} confirmed they want the home`)}>Viewing done · they want it</Btn>,
    3: <Btn icon={<Upload size={16} />} onClick={() => upd({ stage: 4, reference: 'Waiting' }, `${a.name} sent to the referencing firm`)}>Send to referencing</Btn>,
    4: <Btn icon={<CheckCircle2 size={16} />} onClick={() => upd({ stage: 5, reference: 'Passed' }, `Referencing passed for ${a.name}. Approved.`)}>Referencing passed · approve</Btn>,
    5: <Btn icon={<UserCheck size={16} />} disabled={s.tenants.some(t => t.name === a.name && t.property === a.property)} onClick={() => { s.setTenants(ts => [{ id: 'T' + Date.now(), name: a.name, email: a.email, phone: a.phone, property: a.property, room: a.room, rent: p?.type === 'HMO' ? 440 : p?.rent ?? 0, step: 2, idDocs: 'Waiting', start: a.moveIn + ' 2026', signed: { landlord: false, tenant: false } }, ...ts]); s.log(`Created tenant account for ${a.name} and sent the login email`, 'Tenants'); s.toast(`Tenant account created. Login email sent to ${a.email}`); onClose(); s.go('tenants'); }}>Create tenant account</Btn>,
  };
  return <Drawer title={a.name} sub={`${a.source} · ${p?.address}${a.room ? ' · ' + a.room : ''}`} onClose={onClose}
    footer={<>{a.stage < 5 && <Btn kind="danger" icon={<X size={16} />} onClick={() => setRej(true)}>Not going ahead</Btn>}{actions[a.stage]}</>}>
    <Card className="flat"><Steps items={['Found on Rightmove and applied', 'First screening', 'Viewing booked and done', 'Applicant confirms', 'Referencing (outside Genesis)', 'Approved by Supervisor']} at={a.stage} /></Card>
    <Card className="flat"><KV rows={[['Email', a.email], ['Phone', a.phone], ['Household', a.household], ['Budget', a.budget ? money(a.budget) + ' pcm' : '—'], ['Wants to move in', a.moveIn], ['Office Admin', adminName(a.admin)]]} /></Card>
    {a.stage === 2 && <Card className="flat" title="Viewing" sub="The date goes on the calendar. Reminders are sent.">
      <div className="grid g2"><Field label="Date and time"><input className="input" type="datetime-local" value={view} onChange={e => setView(e.target.value)} /></Field><div style={{ alignSelf: 'end' }}><Btn kind="outline" onClick={() => upd({ viewing: new Date(view).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }, `Viewing booked for ${a.name}`)}>{a.viewing ? 'Rebook' : 'Book viewing'}</Btn></div></div>
      {a.viewing && <Chip tone="info" dot={false}>Booked · {a.viewing}</Chip>}
      <Field label="Feedback after the viewing"><Text value={fb} onChange={setFb} placeholder="How did it go?" /></Field></Card>}
    {a.stage >= 4 && <Card className="flat" title="Referencing" sub="Done by the external firm. Upload the result here."><div className="doc"><FileSignature size={18} color="#153D91" /><div className="stack grow"><b>Referencing report</b><span className="caption">{a.reference === 'Passed' ? 'Uploaded · passed' : 'Waiting for the firm'}</span></div><Btn sm kind="outline" icon={<Upload size={14} />} onClick={() => s.toast('Result uploaded')}>Upload</Btn></div></Card>}
    {rej && <Reason title="Not going ahead" sub="The applicant is told by email. The home stays available." danger cta="Close application" onClose={() => setRej(false)} onDone={r => { upd({ rejected: r }, `${a.name} not going ahead: ${r}`); onClose(); }} />}
  </Drawer>;
}

/* ================= TENANTS ================= */
export function Tenants() {
  const s = useStore(); const L = useLookups(); const [tab, setTab] = useState<'all' | 'onboarding' | 'active' | 'id'>('all'); const [q, setQ] = useState(''); const [open, setOpen] = useState<string | null>(s.detail);
  const list = s.tenants.filter(t => (tab === 'all' || (tab === 'active' ? t.step >= 7 : tab === 'id' ? t.idDocs !== 'Approved' : t.step < 7)) && t.name.toLowerCase().includes(q.toLowerCase()));
  return <>
    <PageHeader crumbs={crumbsFor('tenants', s.go)} title="Tenants" sub="Tenants can't sign up by themselves. Accounts are made from approved applicants. Check ID, sign, pay and move in." />
    <div className="grid g4">
      <Kpi icon={<UserCheck size={18} />} tone="ok" label="Active tenants" value={s.tenants.filter(t => t.step >= 7).length} caption="living in LSP homes" />
      <Kpi icon={<ShieldCheck size={18} />} tone="brand" label="ID checks to review" value={s.tenants.filter(t => t.idDocs === 'Waiting').length} caption="you check every document" onClick={() => setTab('id')} />
      <Kpi icon={<FileSignature size={18} />} tone="warn" label="Waiting to sign" value={s.tenants.filter(t => t.step === 3).length} caption="agreement not finished" onClick={() => setTab('onboarding')} />
      <Kpi icon={<KeyRound size={18} />} tone="info" label="Moving in" value={s.tenants.filter(t => t.step >= 4 && t.step < 7).length} caption="money, deposit and keys" onClick={() => setTab('onboarding')} />
    </div>
    <Card title="All tenants" action={<div className="toolbar"><MiniSearch value={q} onChange={setQ} placeholder="Search tenants" /><Tabs value={tab} onChange={setTab} items={[{ id: 'all', label: 'All' }, { id: 'onboarding', label: 'Moving in' }, { id: 'id', label: 'ID checks' }, { id: 'active', label: 'Active' }]} /></div>}>
      <div className="tablewrap"><table className="t"><thead><tr><th>Tenant</th><th>Home</th><th>Rent</th><th>ID checks</th><th>Next step</th><th>Progress</th></tr></thead><tbody>
        {list.map(t => { const p = L.prop(t.property); const r = s.rent.find(x => x.tenant === t.id); return <tr key={t.id} onClick={() => setOpen(t.id)}>
          <td><span className="cell"><Avatar name={t.name} /><span className="stack"><b className="strong">{t.name}</b><span className="caption">{t.email}</span></span></span></td>
          <td>{p?.address}{t.room ? <span className="caption"> · {t.room}</span> : ''}</td><td>{money(t.rent)}{r && <div><Chip tone={rentStatus(r).tone}>{rentStatus(r).label}</Chip></div>}</td>
          <td><Chip tone={t.idDocs === 'Approved' ? 'ok' : t.idDocs === 'Waiting' ? 'info' : 'warn'}>{t.idDocs}</Chip></td>
          <td>{t.step >= 7 ? <span className="muted">Living there</span> : <b>{TEN_STEPS[t.step]}</b>}</td><td style={{ minWidth: 120 }}><Bar value={(t.step / 7) * 100} tone={t.step >= 7 ? 'ok' : 'brand'} /></td></tr>; })}
      </tbody></table></div>
    </Card>
    {open && <TenantDrawer id={open} onClose={() => setOpen(null)} />}
  </>;
}
function TenantDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const t = s.tenants.find(x => x.id === id); const [more, setMore] = useState(false); const [ref, setRef] = useState('');
  if (!t) return null;
  const p = L.prop(t.property);
  const upd = (patch: Partial<Tenant>, msg: string) => { s.setTenants(ts => ts.map(x => x.id === id ? { ...x, ...patch } : x)); s.log(msg, 'Tenants'); s.toast(msg); };
  const deposit = t.rent; // one month
  const docs = ['Passport or driving licence', 'Proof of address', 'Right to rent share code'];
  return <Drawer title={t.name} sub={`${p?.address}${t.room ? ' · ' + t.room : ''} · ${money(t.rent)} pcm`} onClose={onClose}>
    <Card className="flat"><Steps items={TEN_STEPS} at={t.step} /></Card>
    {t.step === 2 && <Card className="flat" title="ID checks" sub="The Supervisor checks every document.">
      {docs.map(d => <div key={d} className="doc"><ShieldCheck size={18} color="#153D91" /><b className="grow">{d}</b>{t.idDocs === 'More needed' && d.includes('Right') ? <Chip tone="warn">Missing</Chip> : <Btn sm kind="ghost" onClick={() => s.toast('Opening document')}>View</Btn>}</div>)}
      {t.idDocs === 'More needed' ? <Note tone="warn">Waiting for the tenant to upload again from their portal.</Note> :
        <div className="flex"><Btn kind="outline" onClick={() => setMore(true)}>More documents needed</Btn><Btn icon={<CheckCircle2 size={16} />} onClick={() => upd({ idDocs: 'Approved', step: 3 }, `Approved ID checks for ${t.name}. Agreement sent to sign.`)}>Approve ID checks</Btn></div>}
    </Card>}
    {t.step === 3 && <Card className="flat" title="Tenancy agreement" sub="Made from the template and sent to sign online. Not complete until everyone has signed.">
      {(['landlord', 'tenant'] as const).map(w => <div key={w} className="doc"><FileSignature size={18} color="#153D91" /><b className="grow">{w === 'landlord' ? L.landlord(p?.owner)?.name ?? 'Landlord' : t.name}</b>{t.signed[w] ? <Chip tone="ok">Signed</Chip> : <><Chip tone="warn">Not signed</Chip><Btn sm kind="ghost" onClick={() => s.toast('Reminder sent')}>Remind</Btn><Btn sm kind="outline" onClick={() => { const sg = { ...t.signed, [w]: true }; upd({ signed: sg, step: sg.landlord && sg.tenant ? 4 : 3 }, `${w === 'tenant' ? t.name : 'Landlord'} signed the agreement`); }}>Mark signed</Btn></>}</div>)}
    </Card>}
    {t.step === 4 && <Card className="flat" title="First month's rent and deposit" sub="Staff check the bank. Keys are not given until money is received.">
      <KV rows={[["First month's rent", money(t.rent)], ['Deposit (1 month)', money(deposit) + ' · legal limit 5 weeks'], ['Total due before move-in', <b>{money(t.rent + deposit)}</b>]]} />
      <div className="flex"><Btn kind="outline" icon={<Bell size={16} />} onClick={() => { s.toast('Reminder email sent from Outlook'); s.log(`Sent move-in payment reminder to ${t.name}`, 'Tenants'); }}>Send reminder</Btn><Btn icon={<CheckCircle2 size={16} />} onClick={() => upd({ step: 5 }, `Recorded first rent and deposit for ${t.name}`)}>Money received</Btn></div></Card>}
    {t.step === 5 && <Card className="flat" title="Deposit protection" sub="Registered on the scheme website outside Genesis. Save the reference and proof here.">
      <Field label="Scheme reference"><Text value={ref} onChange={setRef} placeholder="e.g. DPS-551204" /></Field>
      <Btn disabled={ref.length < 4} onClick={() => upd({ depositRef: ref, step: 6 }, `Saved deposit reference ${ref} for ${t.name}`)}>Save reference</Btn></Card>}
    {t.step === 6 && <Card className="flat" title="Move-in" sub="Tenancy dates go on the calendar. A Site Inspector is assigned.">
      <Btn icon={<CalendarDays size={16} />} onClick={() => { s.setInspections(is => [{ id: 'I' + Date.now(), kind: 'Move-in', property: t.property, room: t.room, date: t.start.replace(' 2026', ''), status: 'Not assigned', rooms: [], meters: {}, keys: 0 }, ...is]); upd({ step: 7 }, `Move-in inspection booked. ${t.name} is now Active.`); }}>Book move-in inspection and make Active</Btn></Card>}
    <Card className="flat"><KV rows={[['Email', t.email], ['Phone', t.phone], ['Start date', t.start], ['Deposit reference', t.depositRef ?? '—'], ['Landlord', L.landlord(p?.owner)?.name ?? '—']]} /><div className="flex"><Btn sm kind="outline" icon={<Mail size={14} />} onClick={() => s.toast('Email opened')}>Email</Btn><Btn sm kind="outline" icon={<Phone size={14} />} onClick={() => s.toast('Calling ' + t.phone)}>Call</Btn><Btn sm kind="ghost" icon={<ArrowRight size={14} />} onClick={() => { onClose(); s.go('properties', t.property); }}>Open home</Btn></div></Card>
    {more && <Reason title="Ask for more documents" sub="The tenant sees exactly what is missing and uploads again." cta="Send request" onClose={() => setMore(false)} placeholder="e.g. Right to rent share code is missing" onDone={r => { upd({ idDocs: 'More needed' }, `Asked ${t.name} for more documents: ${r}`); setMore(false); }} />}
  </Drawer>;
}
export const _unused = useMemo;
