import { useState } from 'react';
import { Plus, Bell, ArrowRightLeft, CheckCircle2, Repeat, Users, UserX, CircleCheck, Clock, Mail, Phone, Ban, RotateCcw, ArrowRight, Home } from 'lucide-react';
import { useStore, useLookups, type Route } from '../store';
import { parseDate, nowStamp, type Task } from '../data';
import { Avatar, Bar, Btn, Card, Chip, DetailHead, Field, Kpi, Modal, Note, PageTabs, Select, Stat, Tabs, Text, Timeline, When, ActionCard, Empty } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { adminName, firstName } from './shared';

const dueLabel = (d: string) => d === '15 Oct 2026' ? 'Today' : d.replace(' 2026', '');
const taskTone = (t: Task) => t.done ? 'ok' : t.late ? 'err' : 'info';
const taskLabel = (t: Task) => t.done ? 'Done' : t.late ? 'Late' : 'On track';

/* ================= TEAM WORK ================= */
export function TeamWork() {
  const s = useStore();
  if (s.detail && s.staff.some(a => a.id === s.detail)) return <AdminPage id={s.detail} />;
  return <TeamList />;
}

function TeamList() {
  const s = useStore();
  const [who, setWho] = useState('all');
  const [st, setSt] = useState<'open' | 'track' | 'late' | 'done'>('open');
  const [add, setAdd] = useState(false);
  const [assign, setAssign] = useState(false);
  const [move, setMove] = useState<string | null>(null);
  const admins = s.staff.filter(a => a.role === 'Office Admin');
  const active = admins.filter(a => a.active);
  const open = s.tasks.filter(t => !t.done);
  const list = s.tasks.filter(t => (who === 'all' || t.admin === who) && (st === 'open' ? !t.done : st === 'track' ? !t.done && !t.late : st === 'late' ? !t.done && t.late : t.done));
  return <>
    <PageHeader crumbs={crumbsFor('team', s.go)} title="Team Work"
      action={<div className="flex"><Btn kind="outline" icon={<ArrowRightLeft size={16} />} onClick={() => setAssign(true)}>Assign Office Admin</Btn><Btn icon={<Plus size={18} />} onClick={() => setAdd(true)}>Add task</Btn></div>} />
    <div className="grid g4">
      <Kpi icon={<Users size={18} />} tone="brand" label="Office Admins" value={active.length} caption={`${admins.length} accounts in total`} />
      <Kpi icon={<UserX size={18} />} tone="neutral" label="Disabled accounts" value={admins.length - active.length} caption="can't log in" onClick={() => { const d = admins.find(a => !a.active); if (d) s.go('team', d.id); }} />
      <Kpi icon={<CircleCheck size={18} />} tone="ok" label="Tasks on track" value={open.filter(t => !t.late).length} caption="open and not late" active={st === 'track'} onClick={() => setSt('track')} />
      <Kpi icon={<Clock size={18} />} tone="warn" label="Late tasks" value={open.filter(t => t.late).length} caption="need chasing" active={st === 'late'} onClick={() => setSt('late')} />
    </div>
    <div className="grid g5">{admins.map(a => { const t = open.filter(x => x.admin === a.id); const late = t.filter(x => x.late).length; return (
      <button key={a.id} className={`kpi admincard${a.active ? '' : ' off'}`} onClick={() => s.go('team', a.id)}>
        <div className="flex"><Avatar id={a.id} size="md" /><div className="stack grow"><b>{a.name}</b><span className="caption">{a.active ? `${s.properties.filter(p => p.admin === a.id).length} homes` : 'Account disabled'}</span></div></div>
        {a.active ? <>
          <div className="flex between"><span className="v">{t.length}<span className="caption"> open tasks</span></span>{late ? <Chip tone="warn">{late} late</Chip> : <Chip tone="ok">On track</Chip>}</div>
          <Bar value={t.length ? ((t.length - late) / t.length) * 100 : 100} tone={late ? 'warn' : 'ok'} />
        </> : <><Chip tone="neutral">Disabled</Chip><span className="caption">Since 30 Sep 2026</span></>}
        <span className="caption flex" style={{ color: 'var(--text-brand)', fontWeight: 700 }}>Open profile <ArrowRight size={13} /></span>
      </button>); })}</div>
    <Card title={who === 'all' ? 'All tasks' : `${adminName(who)}'s tasks`} sub="Click a task to open the item it is about. Send a reminder, move it, or mark it done."
      action={<div className="toolbar"><div style={{ width: 170 }}><Select value={who} onChange={setWho} options={[{ value: 'all', label: 'Everyone' }, ...active.map(a => ({ value: a.id, label: a.name }))]} /></div>
        <Tabs value={st} onChange={setSt} items={[{ id: 'open', label: 'Open', count: s.tasks.filter(t => !t.done && (who === 'all' || t.admin === who)).length }, { id: 'track', label: 'On track' }, { id: 'late', label: 'Late' }, { id: 'done', label: 'Done' }]} /></div>}>
      <TaskTable list={list} onMove={setMove} />
    </Card>
    {add && <AddTask onClose={() => setAdd(false)} />}
    {assign && <AssignOfficeAdmin onClose={() => setAssign(false)} />}
    {move && <MoveTask id={move} onClose={() => setMove(null)} />}
  </>;
}

function TaskTable({ list, onMove, hideAdmin }: { list: Task[]; onMove: (id: string) => void; hideAdmin?: boolean }) {
  const s = useStore();
  const sorted = [...list].sort((a, b) => Number(b.late) - Number(a.late) || parseDate(a.due).getTime() - parseDate(b.due).getTime());
  return <div className="tablewrap"><table className="t"><thead><tr><th>Task</th>{!hideAdmin && <th>Office Admin</th>}<th>Created</th><th>Due</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead><tbody>
    {sorted.map(t => <tr key={t.id} onClick={() => t.link && s.go(t.link.route as Route, t.link.id ?? null)} style={t.link ? undefined : { cursor: 'default' }}>
      <td><span className="stack"><b className="strong">{t.title}</b><span className="caption">{t.area}{t.link ? ' · click to open' : ''}</span></span></td>
      {!hideAdmin && <td><span className="cell"><Avatar id={t.admin} />{adminName(t.admin)}</span></td>}
      <td><When at={t.created} /></td><td><b>{dueLabel(t.due)}</b></td><td><Chip tone={taskTone(t)}>{taskLabel(t)}</Chip></td>
      <td onClick={e => e.stopPropagation()}>{!t.done && <div className="flex" style={{ justifyContent: 'flex-end' }}>
        <Btn sm kind="ghost" icon={<Bell size={14} />} onClick={() => { s.toast(`Reminder sent to ${adminName(t.admin)}`); s.log(`Sent reminder to ${adminName(t.admin)}: ${t.title}`, 'Team Work'); }}>Remind</Btn>
        <Btn sm kind="ghost" icon={<Repeat size={14} />} onClick={() => onMove(t.id)}>Move</Btn>
        <Btn sm kind="ghost" icon={<CheckCircle2 size={14} />} onClick={() => { s.setTasks(ts => ts.map(x => x.id === t.id ? { ...x, done: true } : x)); s.toast('Marked done'); s.log(`Marked done: ${t.title}`, 'Team Work'); }}>Done</Btn></div>}</td></tr>)}
  </tbody></table>{!list.length && <Empty icon={<CircleCheck size={22} />}>Nothing here. No task is forgotten.</Empty>}</div>;
}

function AddTask({ onClose, admin }: { onClose: () => void; admin?: string }) {
  const s = useStore(); const L = useLookups(); const [t, setT] = useState(''); const [a, setA] = useState(admin ?? 'et'); const [d, setD] = useState('2026-10-16'); const [area, setArea] = useState('General');
  return <Modal title="Add a task" sub="The Office Admin sees it in their list straight away." onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn disabled={!t} onClick={() => { const due = new Date(d); const label = `${due.getDate()} ${due.toLocaleString('en-GB', { month: 'short' })} ${due.getFullYear()}`; s.setTasks(ts => [{ id: 'K' + Date.now(), title: t, admin: a, due: label, late: false, done: false, created: nowStamp(), area }, ...ts]); s.log(`Added task for ${adminName(a)}: ${t}`, 'Team Work'); s.toast('Task added'); onClose(); }}>Add task</Btn></>}>
    <Field label="What needs doing"><Text value={t} onChange={setT} placeholder="e.g. Call the tenant at 5 Mill Lane" /></Field>
    <div className="grid g3"><Field label="Office Admin"><Select value={a} onChange={setA} options={L.admins.map(x => ({ value: x.id, label: x.name }))} /></Field><Field label="Due"><input className="input" type="date" value={d} onChange={e => setD(e.target.value)} /></Field><Field label="Area"><Select value={area} onChange={setArea} options={['General', 'Enquiries', 'Lettings', 'Tenants', 'Jobs', 'Inspections', 'Safety', 'Rent'].map(x => ({ value: x, label: x }))} /></Field></div>
  </Modal>;
}
function MoveTask({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const t = s.tasks.find(x => x.id === id)!; const [a, setA] = useState(L.admins.find(x => x.id !== t.admin)!.id);
  return <Modal title="Move task to another Office Admin" sub={t.title} onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn onClick={() => { s.setTasks(ts => ts.map(x => x.id === id ? { ...x, admin: a } : x)); s.log(`Moved "${t.title}" from ${adminName(t.admin)} to ${adminName(a)}`, 'Team Work'); s.toast(`Moved to ${adminName(a)}`); onClose(); }}>Move task</Btn></>}>
    <Field label="Move to"><Select value={a} onChange={setA} options={L.admins.filter(x => x.id !== t.admin).map(x => ({ value: x.id, label: x.name }))} /></Field>
  </Modal>;
}
function AssignOfficeAdmin({ onClose }: { onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const [kind, setKind] = useState<'landlord' | 'property'>('landlord'); const [item, setItem] = useState(s.landlords[0].id); const [a, setA] = useState('et');
  return <Modal title="Assign an Office Admin" sub="Each landlord and property has a named Office Admin, so everyone knows who to call." onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn onClick={() => { if (kind === 'landlord') s.setLandlords(ls => ls.map(l => l.id === item ? { ...l, admin: a } : l)); else s.setProperties(ps => ps.map(p => p.id === item ? { ...p, admin: a } : p)); s.log(`Assigned ${adminName(a)} to ${kind === 'landlord' ? L.landlord(item)?.name : L.prop(item)?.address}`, 'Team Work'); s.toast(`${adminName(a)} assigned`); onClose(); }}>Assign</Btn></>}>
    <Tabs value={kind} onChange={v => { setKind(v); setItem(v === 'landlord' ? s.landlords[0].id : s.properties[0].id); }} items={[{ id: 'landlord', label: 'Landlord' }, { id: 'property', label: 'Property' }]} />
    <Field label={kind === 'landlord' ? 'Landlord' : 'Property'}><Select value={item} onChange={setItem} options={(kind === 'landlord' ? s.landlords.map(l => ({ value: l.id, label: `${l.name} · now ${adminName(l.admin)}` })) : s.properties.map(p => ({ value: p.id, label: `${p.address} · now ${adminName(p.admin)}` })))} /></Field>
    <Field label="Office Admin"><Select value={a} onChange={setA} options={L.admins.map(x => ({ value: x.id, label: x.name }))} /></Field>
  </Modal>;
}

/* ================= OFFICE ADMIN PROFILE ================= */
function AdminPage({ id }: { id: string }) {
  const s = useStore(); const L = useLookups();
  const a = s.staff.find(x => x.id === id)!;
  const [tab, setTab] = useState<'tasks' | 'homes' | 'landlords' | 'activity'>('tasks');
  const [st, setSt] = useState<'open' | 'late' | 'done'>('open');
  const [add, setAdd] = useState(false); const [move, setMove] = useState<string | null>(null); const [dis, setDis] = useState(false); const [en, setEn] = useState(false);
  const tasks = s.tasks.filter(t => t.admin === id);
  const open = tasks.filter(t => !t.done), late = open.filter(t => t.late), done = tasks.filter(t => t.done);
  const homes = s.properties.filter(p => p.admin === id); const lls = s.landlords.filter(l => l.admin === id);
  const acts = s.activity.filter(x => x.who === a.name || x.what.includes(a.name));
  const onTime = tasks.length ? Math.round((tasks.length - late.length) / tasks.length * 100) : 100;
  return <>
    <PageHeader crumbs={crumbsFor('team', s.go, a.name)} back={() => s.go('team')} title={a.name}
      action={<div className="flex">{a.active ? <><Btn kind="outline" icon={<Ban size={16} />} onClick={() => setDis(true)}>Disable account</Btn><Btn icon={<Plus size={18} />} onClick={() => setAdd(true)}>Add task</Btn></> : <Btn icon={<RotateCcw size={16} />} onClick={() => setEn(true)}>Enable account</Btn>}</div>} />
    <DetailHead media={<Avatar id={id} size="xl" />} title={a.name}
      chips={<><Chip tone="brand" dot={false}>{a.role}</Chip>{a.active ? <Chip tone="ok">Active</Chip> : <Chip tone="neutral">Disabled</Chip>}</>}
      meta={[['Email', a.email], ['Phone', a.phone], ['Joined', a.joined], ['Homes looked after', String(homes.length)]]}
      aside={<div className="flex" style={{ gap: 8 }}><Btn sm kind="outline" icon={<Mail size={14} />} onClick={() => s.toast('Email opened to ' + a.email)}>Email</Btn><Btn sm kind="outline" icon={<Phone size={14} />} onClick={() => s.toast('Calling ' + a.phone)}>Call</Btn></div>} />
    {!a.active && <Note>{a.disabledReason} The account can't log in. Their history is kept.</Note>}
    <div className="grid g4"><Stat label="Open tasks" value={open.length} /><Stat label="Late tasks" value={late.length} tone={late.length ? 'warn' : 'ok'} /><Stat label="Done this month" value={done.length} tone="ok" /><Stat label="On time" value={onTime + '%'} sub="tasks not late" /></div>
    <div className="dgrid">
      <div className="col">
        <PageTabs value={tab} onChange={setTab} items={[{ id: 'tasks', label: 'Tasks', count: tasks.length }, { id: 'homes', label: 'Homes', count: homes.length }, { id: 'landlords', label: 'Landlords', count: lls.length }, { id: 'activity', label: 'Activity' }]} />
        {tab === 'tasks' && <Card title="Tasks" action={<Tabs value={st} onChange={setSt} items={[{ id: 'open', label: 'Open', count: open.length }, { id: 'late', label: 'Late', count: late.length }, { id: 'done', label: 'Done', count: done.length }]} />}>
          <TaskTable hideAdmin list={st === 'open' ? open : st === 'late' ? late : done} onMove={setMove} /></Card>}
        {tab === 'homes' && <Card title="Homes they look after">{homes.length ? <div className="grid g2">{homes.map(p => <button key={p.id} className="lrow click" onClick={() => s.go('properties', p.id)}><div className="photo" style={{ width: 64, height: 48, flex: 'none', backgroundImage: `url(${p.photo})` }} /><div className="stack grow"><b>{p.address}</b><span className="caption">{L.ownerName(p)} · {p.managed ? 'Managed' : 'Unmanaged'}</span></div><ArrowRight size={16} color="#98A2B3" /></button>)}</div> : <Empty icon={<Home size={22} />}>No homes. Use Assign Office Admin to give them homes.</Empty>}</Card>}
        {tab === 'landlords' && <Card title="Landlords they look after">{lls.length ? <div className="divlist">{lls.map(l => <button key={l.id} className="item click" onClick={() => s.go('landlords', l.id)}><Avatar name={l.name} /><div className="stack grow"><b>{l.name}</b><span className="caption">{l.plan}% plan · {s.properties.filter(p => p.owner === l.id).length} homes</span></div><ArrowRight size={16} color="#98A2B3" /></button>)}</div> : <Empty>No landlords.</Empty>}</Card>}
        {tab === 'activity' && <Card title="Activity">{acts.length ? <Timeline items={acts.map(x => ({ at: x.at, text: x.what, by: x.area }))} /> : <Empty>No activity yet.</Empty>}</Card>}
      </div>
      <div className="col">
        <ActionCard title="Workload" tone={late.length ? 'warn' : 'ok'} text={late.length ? `${late.length} task${late.length > 1 ? 's are' : ' is'} late. Send a reminder or move ${late.length > 1 ? 'them' : 'it'} to someone else.` : `${firstName(a.name)} is on track.`}>
          <Bar value={onTime} tone={late.length ? 'warn' : 'ok'} />
          {late.length > 0 && a.active && <Btn kind="outline" icon={<Bell size={16} />} onClick={() => { s.toast(`Reminder sent to ${a.name} for ${late.length} late tasks`); s.log(`Sent reminder to ${a.name} about ${late.length} late tasks`, 'Team Work'); }}>Remind about late tasks</Btn>}
        </ActionCard>
        <Card title="Recent activity">{acts.length ? <Timeline items={acts.slice(0, 5).map(x => ({ at: x.at, text: x.what }))} /> : <span className="caption">Nothing yet.</span>}</Card>
      </div>
    </div>
    {add && <AddTask admin={id} onClose={() => setAdd(false)} />}
    {move && <MoveTask id={move} onClose={() => setMove(null)} />}
    {dis && <DisableAdmin id={id} onClose={() => setDis(false)} />}
    {en && <Modal title={`Enable ${a.name}?`} sub="They can log in again with their own email and password." onClose={() => setEn(false)} footer={<><Btn kind="outline" onClick={() => setEn(false)}>Cancel</Btn><Btn onClick={() => { s.setStaff(ss => ss.map(x => x.id === id ? { ...x, active: true, disabledReason: undefined } : x)); s.log(`Enabled Office Admin account: ${a.name}`, 'Team Work'); s.toast(`${a.name} can log in again`); setEn(false); }}>Enable account</Btn></>}><Note>The Company Admin is told by email.</Note></Modal>}
  </>;
}

function DisableAdmin({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const a = s.staff.find(x => x.id === id)!;
  const others = L.admins.filter(x => x.id !== id);
  const [to, setTo] = useState(others[0].id); const [why, setWhy] = useState('Left LSP'); const [ok, setOk] = useState(false);
  const open = s.tasks.filter(t => t.admin === id && !t.done).length; const homes = s.properties.filter(p => p.admin === id).length;
  return <Modal title={`Disable ${a.name}?`} sub="They can't log in any more. Nothing they did is deleted." onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn kind="danger" disabled={!ok} onClick={() => {
      s.setStaff(ss => ss.map(x => x.id === id ? { ...x, active: false, disabledReason: `${why} on 15 Oct 2026. Their work moved to ${adminName(to)}.` } : x));
      s.setTasks(ts => ts.map(t => t.admin === id && !t.done ? { ...t, admin: to } : t));
      s.setProperties(ps => ps.map(p => p.admin === id ? { ...p, admin: to } : p));
      s.setLandlords(ls => ls.map(l => l.admin === id ? { ...l, admin: to } : l));
      s.log(`Disabled Office Admin account: ${a.name} (${why}). Work moved to ${adminName(to)}.`, 'Team Work'); s.toast(`${a.name} disabled. Work moved to ${adminName(to)}.`); onClose();
    }}>Disable account</Btn></>}>
    <Field label="Reason"><Select value={why} onChange={setWhy} options={['Left LSP', 'Long leave', 'Moved to another team', 'Security concern'].map(x => ({ value: x, label: x }))} /></Field>
    <Field label={`Move their ${open} open tasks and ${homes} homes to`}><Select value={to} onChange={setTo} options={others.map(x => ({ value: x.id, label: x.name }))} /></Field>
    <label className="check"><input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)} /> I understand {firstName(a.name)} will be logged out straight away</label>
  </Modal>;
}
