import { useState } from 'react';
import { Plus, Wrench, CheckCircle2, AlertTriangle, Image as ImageIcon, Lock, Undo2, UserPlus, ShieldCheck, ClipboardCheck, CalendarDays, Gauge, KeyRound, PauseCircle, PlayCircle, MessageSquare } from 'lucide-react';
import { useStore, useLookups, money } from '../store';
import { JOB_STATUS, PLAN, type Job, type JobStatus, type Inspection, type SafetyCert } from '../data';
import { Avatar, Bar, Btn, Card, Chip, Drawer, Field, KV, Kpi, MiniSearch, Modal, Note, Reason, Select, Steps, Tabs, Text } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { AssignContractorModal, adminName, approveJob } from './shared';

const jobTone = (st: JobStatus) => ({ New: 'info', 'Quote sent': 'brand', 'Waiting approval': 'warn', Assigned: 'info', 'In progress': 'info', 'Proof uploaded': 'brand', 'Sent back': 'err', Approved: 'ok' } as const)[st];

/* ================= CONTRACTORS & JOBS ================= */
export function Jobs() {
  const s = useStore(); const L = useLookups();
  const [tab, setTab] = useState<'jobs' | 'contractors'>('jobs'); const [f, setF] = useState<'open' | 'proof' | 'urgent' | 'done'>('open'); const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(s.detail && s.jobs.some(j => j.id === s.detail) ? s.detail : null); const [add, setAdd] = useState(false);
  const list = s.jobs.filter(j => (f === 'open' ? j.status !== 'Approved' : f === 'proof' ? j.status === 'Proof uploaded' : f === 'urgent' ? j.urgent && j.status !== 'Approved' : j.status === 'Approved') && (j.title + (L.prop(j.property)?.address ?? '')).toLowerCase().includes(q.toLowerCase()));
  return <>
    <PageHeader crumbs={crumbsFor('jobs', s.go)} title="Contractors & Jobs" sub="Every repair from report to invoice. Assign a contractor, check the photo proof, approve, and the invoice goes out."
      action={<Btn icon={<Plus size={18} />} onClick={() => setAdd(true)}>New job</Btn>} />
    <div className="grid g4">
      <Kpi icon={<AlertTriangle size={18} />} tone="err" label="Emergencies" value={s.jobs.filter(j => j.urgent && j.status !== 'Approved').length} caption="act today" onClick={() => { setTab('jobs'); setF('urgent'); }} />
      <Kpi icon={<Wrench size={18} />} tone="info" label="Open jobs" value={s.jobs.filter(j => j.status !== 'Approved').length} caption="all stages" onClick={() => { setTab('jobs'); setF('open'); }} />
      <Kpi icon={<ImageIcon size={18} />} tone="brand" label="Proof to check" value={s.jobs.filter(j => j.status === 'Proof uploaded').length} caption="photos uploaded" onClick={() => { setTab('jobs'); setF('proof'); }} />
      <Kpi icon={<PauseCircle size={18} />} tone="warn" label="Contractors paused" value={s.contractors.filter(c => c.paused).length} caption="certificate expired" onClick={() => setTab('contractors')} />
    </div>
    <Tabs value={tab} onChange={setTab} items={[{ id: 'jobs', label: 'Jobs', count: s.jobs.length }, { id: 'contractors', label: 'Contractors', count: s.contractors.length }]} />
    {tab === 'jobs' ? <Card title="Jobs" action={<div className="toolbar"><MiniSearch value={q} onChange={setQ} placeholder="Search jobs" /><Tabs value={f} onChange={setF} items={[{ id: 'open', label: 'Open' }, { id: 'urgent', label: 'Emergency' }, { id: 'proof', label: 'Proof to check' }, { id: 'done', label: 'Finished' }]} /></div>}>
      <div className="tablewrap"><table className="t"><thead><tr><th>Job</th><th>Home</th><th>Contractor</th><th>Price</th><th>Reported</th><th>Status</th></tr></thead><tbody>
        {list.map(j => { const c = L.contractor(j.contractor); return <tr key={j.id} onClick={() => setOpen(j.id)}>
          <td><span className="cell"><span className={`tile ${j.urgent ? 't-err' : 't-info'}`} style={{ width: 32, height: 32 }}><Wrench size={15} /></span><span className="stack"><b className="strong">{j.title}</b><span className="caption">{j.by}</span></span></span></td>
          <td>{L.prop(j.property)?.address}<div className="caption">{j.managed ? 'Managed' : 'Unmanaged'}</div></td>
          <td>{c ? <span className="cell"><Avatar name={c.name} />{c.name}</span> : <Chip tone="err">No one yet</Chip>}</td><td>{j.price ? money(j.price) : '—'}</td><td>{j.reported}</td><td><Chip tone={jobTone(j.status)}>{j.status}</Chip></td></tr>; })}
      </tbody></table>{!list.length && <div className="empty">No jobs here.</div>}</div></Card>
      : <Contractors />}
    {open && <JobDrawer id={open} onClose={() => setOpen(null)} />}
    {add && <NewJob onClose={() => setAdd(false)} />}
  </>;
}
function Contractors() {
  const s = useStore();
  return <Card title="Approved contractors" sub="Contractors with an expired certificate are paused and can't get new jobs until they upload a new one.">
    <div className="grid g3">{s.contractors.map(c => <div key={c.id} className="kcard" style={{ cursor: 'default' }}>
      <div className="flex"><Avatar name={c.name} size="md" /><div className="stack grow"><b>{c.name}</b><span className="caption">{c.trade} · {c.contact}</span></div>{c.paused ? <Chip tone="err">Paused</Chip> : <Chip tone="ok">Active</Chip>}</div>
      {c.certs.map(d => <div key={d.name} className="flex between small"><span>{d.name}</span><Chip tone={d.status === 'Uploaded' ? 'ok' : 'err'} dot={false}>{d.status === 'Uploaded' ? `to ${d.expires ?? '—'}` : 'Expired'}</Chip></div>)}
      <div className="flex between"><span className="small">★ {c.rating} · {c.jobs} jobs</span>
        {c.paused ? <Btn sm kind="outline" icon={<PlayCircle size={14} />} onClick={() => { s.setContractors(cs => cs.map(x => x.id === c.id ? { ...x, paused: false, certs: x.certs.map(d => ({ ...d, status: 'Uploaded' as const, expires: '30 Sep 2027' })) } : x)); s.log(`New certificate checked. ${c.name} un-paused`, 'Contractors & Jobs'); s.toast(`${c.name} can get jobs again`); }}>New cert checked</Btn>
          : <Btn sm kind="ghost" icon={<PauseCircle size={14} />} onClick={() => { s.setContractors(cs => cs.map(x => x.id === c.id ? { ...x, paused: true } : x)); s.log(`Paused ${c.name}`, 'Contractors & Jobs'); s.toast(`${c.name} paused`); }}>Pause</Btn>}</div>
    </div>)}</div>
  </Card>;
}
function NewJob({ onClose }: { onClose: () => void }) {
  const s = useStore(); const [f, setF] = useState({ title: '', property: 'P1', urgent: false, note: '' });
  return <Modal title="New job" sub="Log a repair reported by phone or email." onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn disabled={!f.title} onClick={() => { const p = s.properties.find(x => x.id === f.property)!; s.setJobs(js => [{ id: 'J' + Date.now() % 10000, title: f.title, property: f.property, managed: p.managed, cost: 0, price: 0, status: 'New', urgent: f.urgent, reported: 'Today', by: 'Supervisor', admin: p.admin, note: f.note }, ...js]); s.log(`Logged job: ${f.title} at ${p.address}`, 'Contractors & Jobs'); s.toast('Job created'); onClose(); }}>Create job</Btn></>}>
    <Field label="What is wrong"><Text value={f.title} onChange={v => setF({ ...f, title: v })} placeholder="e.g. Kitchen tap leaking" /></Field>
    <Field label="Home"><Select value={f.property} onChange={v => setF({ ...f, property: v })} options={s.properties.map(p => ({ value: p.id, label: `${p.address}${p.managed ? '' : ' (unmanaged)'}` }))} /></Field>
    <Field label="Details"><textarea className="input" value={f.note} onChange={e => setF({ ...f, note: e.target.value })} /></Field>
    <label className="flex small" style={{ cursor: 'pointer' }}><input type="checkbox" checked={f.urgent} onChange={e => setF({ ...f, urgent: e.target.checked })} /> Emergency (no heating, no water, unsafe)</label>
  </Modal>;
}
function JobDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const j = s.jobs.find(x => x.id === id); const [assign, setAssign] = useState(false); const [back, setBack] = useState(false); const [price, setPrice] = useState('');
  if (!j) return null;
  const p = L.prop(j.property); const ll = p?.managed ? L.landlord(p.owner) : undefined; const limit = ll ? PLAN[ll.plan].limit : 0;
  const upd = (patch: Partial<Job>, msg: string, area = 'Contractors & Jobs') => { s.setJobs(js => js.map(x => x.id === id ? { ...x, ...patch } : x)); s.log(msg, area); s.toast(msg); };
  const finish = () => {
    upd({ status: 'Approved' }, `Approved finished work: ${j.title}. Invoice sent.`);
    const to = p?.managed ? p.owner : p?.owner ?? '';
    s.setInvoices(is => [{ id: 'INV-' + (1045 + is.length), to, toKind: p?.managed ? 'Landlord' : 'Agent', job: j.id, amount: j.price, paid: 0, terms: p?.managed ? 'Straight away' : '30 days', issued: '15 Oct', due: p?.managed ? '15 Oct' : '14 Nov', overdue: false }, ...is]);
    s.setLocked(ls => [{ id: 'LR' + Date.now(), kind: 'Finished job', title: `${j.title} · ${p?.address}`, locked: '15 Oct 2026', by: 'Sarah Khan', versions: [] }, ...ls]);
  };
  const flow: JobStatus[] = ['New', 'Assigned', 'In progress', 'Proof uploaded', 'Approved'];
  const at = Math.max(0, flow.indexOf(j.status === 'Waiting approval' || j.status === 'Quote sent' ? 'New' : j.status === 'Sent back' ? 'In progress' : j.status));
  return <Drawer title={j.title} sub={`${p?.address} · ${j.managed ? 'Managed' : 'Unmanaged'} · reported ${j.reported}`} onClose={onClose}
    footer={<>
      {(j.status === 'New' || j.status === 'Sent back') && !j.contractor && <Btn icon={<UserPlus size={16} />} onClick={() => setAssign(true)}>Assign contractor</Btn>}
      {j.status === 'Waiting approval' && <Btn icon={<CheckCircle2 size={16} />} onClick={() => approveJob(s, j, L)}>Approve {money(j.price)}</Btn>}
      {j.status === 'Assigned' && <Btn onClick={() => upd({ status: 'In progress' }, `${L.contractor(j.contractor)?.name} started ${j.title}`)}>Mark started</Btn>}
      {(j.status === 'In progress' || j.status === 'Sent back') && j.contractor && <Btn onClick={() => upd({ status: 'Proof uploaded', proof: ['Before', 'After', 'Receipt'] }, `Photo proof uploaded for ${j.title}`)}>Contractor uploaded proof</Btn>}
      {j.status === 'Proof uploaded' && <><Btn kind="outline" icon={<Undo2 size={16} />} onClick={() => setBack(true)}>Send back</Btn><Btn kind="success" icon={<CheckCircle2 size={16} />} onClick={finish}>Approve and send invoice</Btn></>}
      {j.status === 'Approved' && <Btn kind="outline" onClick={() => s.go('records')}>See locked record</Btn>}
    </>}>
    {j.urgent && j.status !== 'Approved' && <Note tone="err">Emergency. Assign someone today and call the tenant back.</Note>}
    <Card className="flat"><Steps items={['Reported', 'Contractor assigned', 'Work in progress', 'Photo proof uploaded', 'Approved and invoiced']} at={j.status === 'Approved' ? 5 : at} /></Card>
    <Card className="flat"><KV rows={[['Reported by', j.by], ['Details', j.note ?? '—'], ['Contractor', L.contractor(j.contractor)?.name ?? '—'], ['Contractor cost', j.cost ? money(j.cost) + ' · staff only' : '—'], ['Price', j.price ? money(j.price) : '—'], ['Office Admin', adminName(j.admin)], ...(ll ? [['Landlord job limit', `${money(limit)} (${ll.plan}% plan)`] as [string, string]] : [])]} /></Card>
    {j.status === 'New' && j.managed && <Card className="flat" title="Price the job" sub="Above the landlord's job limit it needs your approval first.">
      <div className="grid g2"><Field label="Price (£)"><Text value={price} onChange={setPrice} placeholder="e.g. 180" /></Field><div style={{ alignSelf: 'end' }}><Btn kind="outline" disabled={!+price} onClick={() => { const v = +price; if (v > limit) upd({ price: v, cost: Math.round(v * .8), status: 'Waiting approval' }, `${j.title} (${money(v)}) is over the ${money(limit)} limit. Sent for approval.`, 'Approvals & Budgets'); else { upd({ price: v, cost: Math.round(v * .8) }, `${j.title} priced at ${money(v)}. Under the limit, no approval needed.`); } }}>Save price</Btn></div></div>
      {+price > limit && <Note tone="warn">{money(+price)} is over the {money(limit)} limit. It will go to Approvals.</Note>}</Card>}
    {j.proof && <Card className="flat" title="Photo proof"><div className="photos">{j.proof.map((x, i) => <div key={x} className="ph" style={{ backgroundImage: `url(images/home${(i % 3) + 1}.jpg)` }}><span>{x}</span></div>)}</div></Card>}
    {j.contractor && j.status !== 'Approved' && <Btn kind="ghost" sm icon={<UserPlus size={14} />} onClick={() => setAssign(true)}>Change contractor</Btn>}
    {assign && <AssignContractorModal title="Assign a contractor" onClose={() => setAssign(false)} onPick={c => { upd({ contractor: c, status: j.status === 'New' || j.status === 'Sent back' ? (j.price > limit && j.managed ? 'Waiting approval' : 'Assigned') : j.status }, `Assigned ${L.contractor(c)?.name} to ${j.title}`); setAssign(false); }} />}
    {back && <Reason title="Send back to contractor" sub="They see your note and must fix it and upload again." cta="Send back" placeholder="e.g. After photo doesn't show the finished wall" onClose={() => setBack(false)} onDone={r => { upd({ status: 'Sent back', note: 'Sent back: ' + r }, `Sent back ${j.title}: ${r}`); setBack(false); }} />}
  </Drawer>;
}

/* ================= INSPECTIONS ================= */
export function Inspections() {
  const s = useStore(); const L = useLookups(); const [tab, setTab] = useState<'all' | Inspection['status']>('all'); const [open, setOpen] = useState<string | null>(s.detail && s.inspections.some(i => i.id === s.detail) ? s.detail : null); const [add, setAdd] = useState(false);
  const list = s.inspections.filter(i => tab === 'all' || i.status === tab);
  const tone = { 'Not assigned': 'err', Booked: 'info', 'Report uploaded': 'warn', 'Sent back': 'err', Locked: 'neutral' } as const;
  return <>
    <PageHeader crumbs={crumbsFor('inspections', s.go)} title="Inspections" sub="Move-in, routine and move-out checks. A Site Inspector visits, uploads photos and readings, and you review and lock the report."
      action={<Btn icon={<Plus size={18} />} onClick={() => setAdd(true)}>Book inspection</Btn>} />
    <div className="grid g4">
      <Kpi icon={<UserPlus size={18} />} tone="err" label="No inspector yet" value={s.inspections.filter(i => i.status === 'Not assigned').length} caption="assign someone" onClick={() => setTab('Not assigned')} />
      <Kpi icon={<CalendarDays size={18} />} tone="info" label="Booked" value={s.inspections.filter(i => i.status === 'Booked').length} caption="on the calendar" onClick={() => setTab('Booked')} />
      <Kpi icon={<ClipboardCheck size={18} />} tone="warn" label="Reports to review" value={s.inspections.filter(i => i.status === 'Report uploaded').length} caption="check and lock" onClick={() => setTab('Report uploaded')} />
      <Kpi icon={<Lock size={18} />} tone="brand" label="Locked" value={s.inspections.filter(i => i.status === 'Locked').length} caption="can't be changed" onClick={() => setTab('Locked')} />
    </div>
    <Card title="Inspections" action={<Tabs value={tab} onChange={setTab} items={[{ id: 'all', label: 'All' }, ...(['Not assigned', 'Booked', 'Report uploaded', 'Locked'] as const).map(x => ({ id: x, label: x }))]} />}>
      <div className="tablewrap"><table className="t"><thead><tr><th>Type</th><th>Home</th><th>Date</th><th>Site Inspector</th><th>Status</th></tr></thead><tbody>
        {list.map(i => <tr key={i.id} onClick={() => setOpen(i.id)}><td className="strong">{i.kind}</td><td>{L.prop(i.property)?.address}{i.room ? ` · ${i.room}` : ''}</td><td>{i.date}</td><td>{i.inspector ? <span className="cell"><Avatar name={L.contractor(i.inspector)?.name} />{L.contractor(i.inspector)?.name}</span> : <span className="muted">Not assigned</span>}</td><td><Chip tone={tone[i.status]}>{i.status}</Chip></td></tr>)}
      </tbody></table>{!list.length && <div className="empty">Nothing here.</div>}</div>
    </Card>
    {open && <InspectionDrawer id={open} onClose={() => setOpen(null)} />}
    {add && <BookInspection onClose={() => setAdd(false)} />}
  </>;
}
function BookInspection({ onClose }: { onClose: () => void }) {
  const s = useStore(); const [f, setF] = useState({ kind: 'Routine' as Inspection['kind'], property: 'P1', date: '2026-10-28' });
  return <Modal title="Book an inspection" onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn onClick={() => { s.setInspections(is => [{ id: 'I' + Date.now() % 10000, kind: f.kind, property: f.property, date: new Date(f.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), status: 'Not assigned', rooms: [], meters: {}, keys: 0 }, ...is]); s.log(`Booked ${f.kind.toLowerCase()} inspection`, 'Inspections'); s.toast('Inspection booked. Now assign a Site Inspector.'); onClose(); }}>Book</Btn></>}>
    <div className="grid g2"><Field label="Type"><Select value={f.kind} onChange={v => setF({ ...f, kind: v as Inspection['kind'] })} options={['Move-in', 'Routine', 'Move-out'].map(x => ({ value: x, label: x }))} /></Field><Field label="Date"><input className="input" type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field></div>
    <Field label="Home"><Select value={f.property} onChange={v => setF({ ...f, property: v })} options={s.properties.filter(p => p.managed).map(p => ({ value: p.id, label: p.address }))} /></Field>
  </Modal>;
}
function InspectionDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const i = s.inspections.find(x => x.id === id); const [assign, setAssign] = useState(false); const [back, setBack] = useState(false);
  if (!i) return null;
  const p = L.prop(i.property);
  const upd = (patch: Partial<Inspection>, msg: string) => { s.setInspections(is => is.map(x => x.id === id ? { ...x, ...patch } : x)); s.log(msg, 'Inspections'); s.toast(msg); };
  const lock = () => { upd({ status: 'Locked' }, `Locked ${i.kind.toLowerCase()} report for ${p?.address}`); s.setLocked(ls => [{ id: 'LR' + Date.now(), kind: 'Inspection report', title: `${i.kind} · ${p?.address}${i.room ? ' ' + i.room : ''}`, locked: '15 Oct 2026', by: 'Sarah Khan', versions: [] }, ...ls]); };
  const followUp = (room: string, note: string) => { s.setJobs(js => [{ id: 'J' + Date.now() % 10000, title: `${note} (${room})`, property: i.property, managed: true, cost: 0, price: 0, status: 'New', reported: 'Today', by: 'Inspection', admin: p?.admin ?? 'et' }, ...js]); s.log(`Created follow-up job from inspection: ${note}`, 'Contractors & Jobs'); s.toast('Follow-up job created'); };
  return <Drawer title={`${i.kind} inspection`} sub={`${p?.address}${i.room ? ' · ' + i.room : ''} · ${i.date}`} onClose={onClose}
    footer={<>{i.status === 'Not assigned' && <Btn icon={<UserPlus size={16} />} onClick={() => setAssign(true)}>Assign Site Inspector</Btn>}
      {i.status === 'Booked' && <Btn onClick={() => upd({ status: 'Report uploaded', rooms: [{ name: 'Living room', photos: 5, note: 'Good' }, { name: 'Kitchen', photos: 4, note: 'Good' }, { name: 'Bathroom', photos: 3, note: 'Sealant worn', diff: true }], meters: { gas: '04412', electric: '18877', water: '00931' }, keys: 3 }, 'Site Inspector uploaded the report')}>Inspector uploaded report</Btn>}
      {i.status === 'Report uploaded' && <><Btn kind="outline" icon={<Undo2 size={16} />} onClick={() => setBack(true)}>Send back</Btn><Btn icon={<Lock size={16} />} onClick={lock}>Approve and lock</Btn></>}
      {i.status === 'Locked' && <Btn kind="outline" onClick={() => s.go('records')}>Open in Records</Btn>}</>}>
    <Card className="flat"><Steps items={['Inspection booked', 'Site Inspector assigned', 'Report, photos and readings uploaded', 'Checked and locked by Supervisor']} at={i.status === 'Not assigned' ? 1 : i.status === 'Booked' ? 2 : i.status === 'Locked' ? 4 : 3} /></Card>
    <Card className="flat"><KV rows={[['Site Inspector', L.contractor(i.inspector)?.name ?? '—'], ['Tenant', s.tenants.find(t => t.property === i.property && (!i.room || t.room === i.room))?.name ?? '—'], ['Landlord', L.landlord(p?.owner)?.name ?? '—']]} /></Card>
    {i.rooms.length > 0 && <Card className="flat" title="Room by room" sub={i.kind === 'Move-out' ? 'Compared with the move-in report. Differences are marked.' : 'Photos and notes for each room.'}>
      <div className="divlist">{i.rooms.map(r => <div key={r.name} className="item"><span className={`tile ${r.diff ? 't-warn' : 't-ok'}`} style={{ width: 32, height: 32 }}><ImageIcon size={15} /></span><div className="stack grow"><b>{r.name}</b><span className="caption">{r.photos} photos · {r.note}</span></div>{r.diff && <><Chip tone="warn">Changed</Chip>{i.status !== 'Locked' && <Btn sm kind="ghost" icon={<Wrench size={14} />} onClick={() => followUp(r.name, r.note)}>Make job</Btn>}</>}</div>)}</div>
      <div className="photos">{[1, 2, 3, 1].map((n, k) => <div key={k} className="ph" style={{ backgroundImage: `url(images/home${n}.jpg)` }} />)}</div></Card>}
    {i.rooms.length > 0 && <Card className="flat" title="Meters and keys"><div className="grid g4">{(['gas', 'electric', 'water'] as const).map(m => <div key={m} className="mt stack"><span className="caption"><Gauge size={12} /> {m}</span><b>{i.meters[m] ?? '—'}</b></div>)}<div className="stack"><span className="caption"><KeyRound size={12} /> keys</span><b>{i.keys}</b></div></div></Card>}
    {i.status === 'Locked' && <Note>Locked. To change it, unlock in Records & History with a reason. The old version is kept.</Note>}
    {assign && <AssignContractorModal inspector title="Assign a Site Inspector" onClose={() => setAssign(false)} onPick={c => { upd({ inspector: c, status: 'Booked' }, `Assigned ${L.contractor(c)?.name} to the ${i.kind.toLowerCase()} inspection`); setAssign(false); }} />}
    {back && <Reason title="Send report back" sub="The Site Inspector fixes it and uploads again." cta="Send back" placeholder="e.g. Missing photos of the bathroom" onClose={() => setBack(false)} onDone={r => { upd({ status: 'Booked' }, `Sent report back: ${r}`); setBack(false); }} />}
  </Drawer>;
}

/* ================= APPROVALS & BUDGETS ================= */
export function Approvals() {
  const s = useStore(); const L = useLookups(); const [tab, setTab] = useState<'queue' | 'budgets'>('queue'); const [ask, setAsk] = useState<string | null>(null); const [rej, setRej] = useState<string | null>(null);
  const queue = s.jobs.filter(j => j.status === 'Waiting approval');
  return <>
    <PageHeader crumbs={crumbsFor('approvals', s.go)} title="Approvals & Budgets" sub="Jobs above the landlord's job limit wait here. Approving takes the cost off the yearly repair budget, once." />
    <div className="grid g4">
      <Kpi icon={<ClipboardCheck size={18} />} tone="warn" label="Waiting for you" value={queue.length} caption={money(queue.reduce((a, j) => a + j.price, 0)) + ' in total'} onClick={() => setTab('queue')} />
      <Kpi icon={<AlertTriangle size={18} />} tone="err" label="Budgets over 90%" value={s.landlords.filter(l => l.budget && l.used / l.budget >= .9).length} caption="landlord told" onClick={() => setTab('budgets')} />
      <Kpi icon={<Gauge size={18} />} tone="info" label="Budgets over 70%" value={s.landlords.filter(l => l.budget && l.used / l.budget >= .7 && l.used / l.budget < .9).length} caption="first alert sent" onClick={() => setTab('budgets')} />
      <Kpi icon={<CheckCircle2 size={18} />} tone="ok" label="Approved this month" value={s.jobs.filter(j => j.status === 'Approved' && j.managed).length} caption="taken once each" />
    </div>
    <Tabs value={tab} onChange={setTab} items={[{ id: 'queue', label: 'Waiting approval', count: queue.length }, { id: 'budgets', label: 'Repair budgets' }]} />
    {tab === 'queue' ? <Card title="Jobs over the limit">{queue.length ? <div className="divlist">{queue.map(j => { const p = L.prop(j.property); const ll = L.landlord(p?.owner); const left = ll ? ll.budget - ll.used : 0; return (
      <div key={j.id} className="item" style={{ alignItems: 'flex-start' }}><span className="tile t-warn"><Wrench size={16} /></span>
        <div className="stack grow"><b>{j.title} · {p?.address}</b><span className="caption">{ll?.name} · {ll?.plan}% plan · limit {money(ll ? PLAN[ll.plan].limit : 0)} · {L.contractor(j.contractor)?.name}</span><span className="small">{j.note}</span>
          {ll && <span className="caption">Budget left after this: <b style={{ color: left - j.price < 0 ? 'var(--status-error-fg)' : undefined }}>{money(left - j.price)}</b></span>}</div>
        <b style={{ fontSize: 18 }}>{money(j.price)}</b>
        <div className="flex"><Btn sm kind="ghost" icon={<MessageSquare size={14} />} onClick={() => setAsk(j.id)}>Ask landlord</Btn><Btn sm kind="outline" onClick={() => setRej(j.id)}>Decline</Btn><Btn sm onClick={() => approveJob(s, j, L)}>Approve</Btn></div></div>); })}</div> : <div className="empty">Nothing waiting. All caught up.</div>}</Card>
      : <Card title="Yearly repair budgets" sub="Alerts go to the landlord at 70%, 90% and 100%. Each job is taken off once, even if approved twice.">
        <div className="tablewrap"><table className="t"><thead><tr><th>Landlord</th><th>Plan</th><th>Budget</th><th>Used</th><th>Left</th><th style={{ minWidth: 200 }}>Progress</th><th>Alerts sent</th></tr></thead><tbody>
          {s.landlords.filter(l => l.budget).map(l => { const pct = Math.round(l.used / l.budget * 100); return <tr key={l.id} onClick={() => s.go('landlords', l.id)}><td className="strong">{l.name}</td><td>{l.plan}%</td><td>{money(l.budget)}</td><td>{money(l.used)}</td><td>{money(l.budget - l.used)}</td><td><div className="flex"><Bar value={pct} tone={pct >= 90 ? 'err' : pct >= 70 ? 'warn' : 'ok'} /><b className="small">{pct}%</b></div></td><td><div className="flex wrap">{[70, 90, 100].map(a => <Chip key={a} tone={pct >= a ? (a === 70 ? 'warn' : 'err') : 'neutral'} dot={false}>{a}%</Chip>)}</div></td></tr>; })}
        </tbody></table></div></Card>}
    {ask && <Reason title="Ask the landlord" sub="They get an email and can reply from their portal." cta="Send" placeholder="e.g. The roof needs a full repair at £680. Are you happy to go ahead?" onClose={() => setAsk(null)} onDone={r => { s.log(`Asked landlord about ${s.jobs.find(j => j.id === ask)?.title}: ${r}`, 'Approvals & Budgets'); s.toast('Question sent to the landlord'); setAsk(null); }} />}
    {rej && <Reason danger title="Decline this job" sub="The Office Admin is told. The budget is not touched." cta="Decline" onClose={() => setRej(null)} onDone={r => { s.setJobs(js => js.map(j => j.id === rej ? { ...j, status: 'New', note: 'Declined: ' + r } : j)); s.log(`Declined job: ${r}`, 'Approvals & Budgets'); s.toast('Declined'); setRej(null); }} />}
  </>;
}

/* ================= SAFETY CHECKS ================= */
export function Safety() {
  const s = useStore(); const L = useLookups(); const [tab, setTab] = useState<'action' | 'all'>('action'); const [open, setOpen] = useState<string | null>(s.detail && s.safety.some(c => c.id === s.detail) ? s.detail : null);
  const list = s.safety.filter(c => tab === 'all' || c.status !== 'Valid').sort((a, b) => a.days - b.days);
  const tone = (c: SafetyCert) => c.status === 'Valid' ? 'ok' : c.status === 'Overdue' ? 'err' : c.status === 'Booked' ? 'info' : c.status === 'Proof to check' ? 'brand' : 'warn';
  return <>
    <PageHeader crumbs={crumbsFor('safety', s.go)} title="Safety Checks" sub="Gas, electrical, energy, fire alarms and HMO licences. Reminders start 60 days before expiry." />
    <div className="grid g4">
      <Kpi icon={<AlertTriangle size={18} />} tone="err" label="Overdue" value={s.safety.filter(c => c.status === 'Overdue').length} caption="legal risk, act now" />
      <Kpi icon={<CalendarDays size={18} />} tone="warn" label="Due in 30 days" value={s.safety.filter(c => c.status === 'Due soon').length} caption="book a contractor" />
      <Kpi icon={<ShieldCheck size={18} />} tone="brand" label="Proof to check" value={s.safety.filter(c => c.status === 'Proof to check').length} caption="certificate uploaded" />
      <Kpi icon={<CheckCircle2 size={18} />} tone="ok" label="In date" value={s.safety.filter(c => c.status === 'Valid').length} caption="no action" />
    </div>
    <Card title="Certificates" action={<Tabs value={tab} onChange={setTab} items={[{ id: 'action', label: 'Needs action', count: s.safety.filter(c => c.status !== 'Valid').length }, { id: 'all', label: 'All' }]} />}>
      <div className="tablewrap"><table className="t"><thead><tr><th>Check</th><th>Home</th><th>Expires</th><th>Days left</th><th>Contractor</th><th>Status</th></tr></thead><tbody>
        {list.map(c => <tr key={c.id} onClick={() => setOpen(c.id)}><td className="strong">{c.kind}</td><td>{L.prop(c.property)?.address}</td><td>{c.expires}</td><td><b style={{ color: c.days < 0 ? 'var(--status-error-fg)' : c.days <= 30 ? 'var(--status-warning-fg)' : undefined }}>{c.days < 0 ? `${-c.days} days over` : `${c.days} days`}</b></td><td>{L.contractor(c.contractor)?.name ?? <span className="muted">—</span>}</td><td><Chip tone={tone(c)}>{c.status}</Chip></td></tr>)}
      </tbody></table></div>
    </Card>
    {open && <SafetyDrawer id={open} onClose={() => setOpen(null)} />}
  </>;
}
function SafetyDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const c = s.safety.find(x => x.id === id); const [assign, setAssign] = useState(false); const [next, setNext] = useState('2027-10-15'); const [fault, setFault] = useState(false);
  if (!c) return null;
  const p = L.prop(c.property);
  const upd = (patch: Partial<SafetyCert>, msg: string) => { s.setSafety(cs => cs.map(x => x.id === id ? { ...x, ...patch } : x)); s.log(msg, 'Safety Checks'); s.toast(msg); };
  return <Drawer title={c.kind} sub={`${p?.address} · expires ${c.expires}`} onClose={onClose}
    footer={<>{(c.status === 'Due soon' || c.status === 'Overdue') && <Btn icon={<UserPlus size={16} />} onClick={() => setAssign(true)}>Book contractor</Btn>}
      {c.status === 'Booked' && <Btn onClick={() => upd({ status: 'Proof to check' }, `Certificate uploaded for ${c.kind} at ${p?.address}`)}>Contractor uploaded certificate</Btn>}
      {c.status === 'Proof to check' && <><Btn kind="outline" icon={<AlertTriangle size={16} />} onClick={() => setFault(true)}>Fault found</Btn><Btn kind="success" icon={<CheckCircle2 size={16} />} onClick={() => { const d = new Date(next); upd({ status: 'Valid', expires: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), days: Math.round((d.getTime() - new Date('2026-10-15').getTime()) / 864e5) }, `${c.kind} marked complete at ${p?.address}. Next due ${d.toLocaleDateString('en-GB')}`); onClose(); }}>Mark complete</Btn></>}</>}>
    {c.status === 'Overdue' && <Note tone="err">This home is not legally covered. Book a contractor today.</Note>}
    <Card className="flat"><Steps items={['Reminder sent (60 days before)', 'Contractor booked', 'Certificate uploaded', 'Checked and complete']} at={c.status === 'Valid' ? 4 : c.status === 'Proof to check' ? 3 : c.status === 'Booked' ? 2 : 1} /></Card>
    <Card className="flat"><KV rows={[['Home', p?.address ?? ''], ['Landlord', L.landlord(p?.owner)?.name ?? '—'], ['Expires', c.expires], ['Contractor', L.contractor(c.contractor)?.name ?? '—'], ['Status', <Chip tone={c.status === 'Valid' ? 'ok' : c.status === 'Overdue' ? 'err' : 'warn'}>{c.status}</Chip>]]} /></Card>
    {c.status === 'Proof to check' && <Card className="flat" title="Uploaded certificate"><div className="doc"><ShieldCheck size={18} color="#153D91" /><b className="grow">{c.kind} certificate.pdf</b><Btn sm kind="ghost" onClick={() => s.toast('Opening certificate')}>View</Btn></div><Field label="Next due date"><input className="input" type="date" value={next} onChange={e => setNext(e.target.value)} /></Field></Card>}
    {assign && <AssignContractorModal title="Book a contractor" onClose={() => setAssign(false)} onPick={x => { upd({ contractor: x, status: 'Booked' }, `Booked ${L.contractor(x)?.name} for ${c.kind} at ${p?.address}`); setAssign(false); }} />}
    {fault && <Reason danger title="Fault found" sub="A repair job is made straight away for this home." cta="Create repair job" placeholder="e.g. Boiler flue not sealed" onClose={() => setFault(false)} onDone={r => { s.setJobs(js => [{ id: 'J' + Date.now() % 10000, title: `${c.kind} fault: ${r}`, property: c.property, managed: true, cost: 0, price: 0, status: 'New', urgent: true, reported: 'Today', by: 'Safety check', admin: p?.admin ?? 'et' }, ...js]); upd({ status: 'Due soon' }, `Fault found on ${c.kind}. Repair job created.`); setFault(false); onClose(); }} />}
  </Drawer>;
}
export const _w = JOB_STATUS;
