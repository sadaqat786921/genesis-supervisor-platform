import { useState } from 'react';
import { Plus, Home, Building2, CheckCircle2, ShieldCheck, FileText, Mail, Send, Wrench, Receipt, X, ArrowRight } from 'lucide-react';
import { useStore, useLookups, money, rentStatus } from '../store';
import { ADMINS, type Job, type SignUp } from '../data';
import { Avatar, Btn, Card, Chip, Drawer, Field, KV, Kpi, MiniSearch, Modal, Note, Reason, Select, Tabs, Text } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { AddPropertyModal, adminName } from './shared';

/* ================= PROPERTIES ================= */
export function Properties() {
  const s = useStore(); const L = useLookups();
  const [tab, setTab] = useState<'managed' | 'unmanaged'>('managed'); const [q, setQ] = useState(''); const [add, setAdd] = useState<'' | 'pick' | 'form'>(''); const [owner, setOwner] = useState('');
  if (s.detail && s.properties.some(p => p.id === s.detail)) return <PropertyPage id={s.detail} />;
  const list = s.properties.filter(p => p.managed === (tab === 'managed') && (p.address + p.area + L.ownerName(p)).toLowerCase().includes(q.toLowerCase()));
  return <>
    <PageHeader crumbs={crumbsFor('properties', s.go)} title="Properties" sub="Managed homes belong to landlords on a plan. Unmanaged homes belong to letting agents and get contractor services only."
      action={<Btn icon={<Plus size={18} />} onClick={() => { setOwner(tab === 'managed' ? s.landlords[0].id : s.agents[0].id); setAdd('pick'); }}>Add property</Btn>} />
    <div className="grid g4">
      <Kpi icon={<Home size={18} />} tone="brand" label="Managed homes" value={s.properties.filter(p => p.managed).length} caption="tenants, rent and safety" onClick={() => setTab('managed')} />
      <Kpi icon={<Building2 size={18} />} tone="info" label="Unmanaged homes" value={s.properties.filter(p => !p.managed).length} caption="for letting agents" onClick={() => setTab('unmanaged')} />
      <Kpi icon={<CheckCircle2 size={18} />} tone="ok" label="Let" value={s.properties.filter(p => p.managed && p.status === 'Let').length} caption="fully occupied" />
      <Kpi icon={<ArrowRight size={18} />} tone="warn" label="Ready to let" value={s.properties.filter(p => p.managed && p.status !== 'Let').length} caption="vacant or rooms free" onClick={() => s.go('lettings')} />
    </div>
    <Card title={tab === 'managed' ? 'Managed homes' : 'Unmanaged homes'} action={<div className="toolbar"><MiniSearch value={q} onChange={setQ} placeholder="Search address or owner" /><Tabs value={tab} onChange={setTab} items={[{ id: 'managed', label: 'Managed' }, { id: 'unmanaged', label: 'Unmanaged' }]} /></div>}>
      <div className="grid g3">{list.map(p => { const jobs = s.jobs.filter(j => j.property === p.id && j.status !== 'Approved').length; const warn = s.safety.filter(c => c.property === p.id && c.status !== 'Valid').length; return (
        <button key={p.id} className="kcard" onClick={() => s.go('properties', p.id)}>
          <div className="photo" style={{ height: 130, backgroundImage: `url(${p.photo})` }} />
          <div className="flex between"><b>{p.address}</b>{p.managed ? <Chip tone={p.status === 'Let' ? 'ok' : 'warn'}>{p.status}</Chip> : <Chip tone="info" dot={false}>Unmanaged</Chip>}</div>
          <span className="caption">{p.area} · {p.type === 'HMO' ? `Shared house · ${p.rooms} rooms` : `${p.beds} bed ${p.type.toLowerCase()}`}</span>
          <div className="flex between"><span className="cell small"><Avatar name={L.ownerName(p)} />{L.ownerName(p)}</span>{p.managed && <b style={{ color: 'var(--text-brand)' }}>{money(p.rent)}</b>}</div>
          <div className="flex wrap">{jobs > 0 && <Chip tone="info" dot={false}><Wrench size={12} /> {jobs} open job{jobs > 1 ? 's' : ''}</Chip>}{warn > 0 && <Chip tone="warn" dot={false}><ShieldCheck size={12} /> {warn} safety</Chip>}</div>
        </button>); })}</div>
      {!list.length && <div className="empty">No homes match.</div>}
    </Card>
    {add === 'pick' && <Modal title="Who owns this home?" sub={tab === 'managed' ? 'Managed homes belong to a landlord.' : 'Unmanaged homes belong to a letting agent.'} onClose={() => setAdd('')} footer={<><Btn kind="outline" onClick={() => setAdd('')}>Cancel</Btn><Btn onClick={() => setAdd('form')}>Continue</Btn></>}>
      <Field label={tab === 'managed' ? 'Landlord' : 'Letting agent'}><Select value={owner} onChange={setOwner} options={(tab === 'managed' ? s.landlords : s.agents).map(o => ({ value: o.id, label: o.name }))} /></Field>
    </Modal>}
    {add === 'form' && <AddPropertyModal owner={owner} managed={tab === 'managed'} onClose={() => setAdd('')} />}
  </>;
}
function PropertyPage({ id }: { id: string }) {
  const s = useStore(); const L = useLookups(); const p = s.properties.find(x => x.id === id)!; const [tab, setTab] = useState<'overview' | 'jobs' | 'safety' | 'inspections'>('overview');
  const tenants = s.tenants.filter(t => t.property === id); const jobs = s.jobs.filter(j => j.property === id); const certs = s.safety.filter(c => c.property === id); const insp = s.inspections.filter(i => i.property === id);
  return <>
    <PageHeader crumbs={crumbsFor('properties', s.go, p.address)} title={p.address} sub={`${p.area} · ${p.managed ? 'Managed' : 'Unmanaged'} · Office Admin ${adminName(p.admin)}`}
      action={<div className="flex"><Btn kind="outline" icon={<Wrench size={16} />} onClick={() => s.go('jobs')}>New job</Btn>{p.managed && p.status !== 'Let' && <Btn icon={<ArrowRight size={16} />} onClick={() => { s.toast('Listed on Rightmove'); s.log(`Marked ${p.address} ready to let and listed on Rightmove`, 'Properties'); }}>List on Rightmove</Btn>}</div>} />
    <div className="row">
      <div className="photo" style={{ flex: 1.2, minHeight: 240, borderRadius: 22, backgroundImage: `url(${p.photo})` }} />
      <Card title="Details" style={{ flex: 1 }}><KV rows={[['Owner', <button className="link" onClick={() => p.managed ? s.go('landlords', p.owner) : s.go('agents', p.owner)}>{L.ownerName(p)}</button>], ['Type', p.type === 'HMO' ? `Shared house (HMO) · ${p.rooms} rooms` : `${p.beds} bed ${p.type.toLowerCase()}`], ['Status', p.managed ? <Chip tone={p.status === 'Let' ? 'ok' : 'warn'}>{p.status}</Chip> : <Chip tone="info">Contractor services only</Chip>], ...(p.managed ? [['Rent', money(p.rent) + ' pcm'] as [string, string]] : []), ['Office Admin', adminName(p.admin)]]} /></Card>
    </div>
    <Tabs value={tab} onChange={setTab} items={[{ id: 'overview', label: p.managed ? 'Tenants' : 'Overview' }, { id: 'jobs', label: 'Jobs', count: jobs.length }, ...(p.managed ? [{ id: 'safety' as const, label: 'Safety checks', count: certs.length }, { id: 'inspections' as const, label: 'Inspections', count: insp.length }] : [])]} />
    {tab === 'overview' && (p.managed ? <Card title={p.type === 'HMO' ? 'Rooms' : 'Tenants'}>{p.type === 'HMO' ? <div className="grid g3">{Array.from({ length: p.rooms ?? 0 }, (_, i) => { const t = tenants.find(x => x.room === `Room ${i + 1}`); return <div key={i} className="kcard" style={{ cursor: 'default' }}><b>Room {i + 1}</b>{t ? <><span className="cell small"><Avatar name={t.name} />{t.name}</span><span className="caption">{money(t.rent)} pcm</span></> : <><span className="caption">Empty</span><Chip tone="warn">Ready to let</Chip></>}</div>; })}</div>
      : tenants.length ? <div className="divlist">{tenants.map(t => { const r = s.rent.find(x => x.tenant === t.id); return <button key={t.id} className="item click" onClick={() => s.go('tenants', t.id)}><Avatar name={t.name} /><div className="stack grow"><b>{t.name}</b><span className="caption">Since {t.start}</span></div>{r && <Chip tone={rentStatus(r).tone}>{rentStatus(r).label}</Chip>}</button>; })}</div> : <div className="empty">No tenant yet. This home is in Lettings.</div>}</Card>
      : <Card><Note>Unmanaged: the letting agent handles tenants and rent. LSP only sends contractors, quotes and invoices the agent.</Note></Card>)}
    {tab === 'jobs' && <Card>{jobs.length ? <div className="divlist">{jobs.map(j => <button key={j.id} className="item click" onClick={() => s.go('jobs', j.id)}><span className="tile t-info"><Wrench size={16} /></span><div className="stack grow"><b>{j.title}</b><span className="caption">Reported {j.reported} · {j.by}</span></div><b>{money(j.price)}</b><Chip tone={j.status === 'Approved' ? 'ok' : j.status === 'Waiting approval' ? 'warn' : 'info'}>{j.status}</Chip></button>)}</div> : <div className="empty">No jobs at this home.</div>}</Card>}
    {tab === 'safety' && <Card>{certs.length ? <div className="divlist">{certs.map(c => <button key={c.id} className="item click" onClick={() => s.go('safety', c.id)}><span className="tile t-warn"><ShieldCheck size={16} /></span><div className="stack grow"><b>{c.kind}</b><span className="caption">Expires {c.expires}</span></div><Chip tone={c.status === 'Valid' ? 'ok' : c.status === 'Overdue' ? 'err' : 'warn'}>{c.status}</Chip></button>)}</div> : <div className="empty">No certificates saved yet.</div>}</Card>}
    {tab === 'inspections' && <Card>{insp.length ? <div className="divlist">{insp.map(i => <button key={i.id} className="item click" onClick={() => s.go('inspections', i.id)}><span className="tile t-brand"><FileText size={16} /></span><div className="stack grow"><b>{i.kind}{i.room ? ' · ' + i.room : ''}</b><span className="caption">{i.date}</span></div><Chip tone={i.status === 'Locked' ? 'neutral' : 'info'}>{i.status}</Chip></button>)}</div> : <div className="empty">No inspections yet.</div>}</Card>}
  </>;
}

/* ================= SIGN-UPS ================= */
export function SignUps() {
  const s = useStore(); const [tab, setTab] = useState<'Waiting' | 'More info asked' | 'Approved' | 'Rejected'>('Waiting'); const [open, setOpen] = useState<string | null>(s.detail);
  const list = s.signups.filter(x => x.status === tab);
  return <>
    <PageHeader crumbs={crumbsFor('signups', s.go)} title="Sign-Ups" sub="Letting agents and contractors sign up on the website. You check their documents before they can log in." />
    <Card title="Applications" action={<Tabs value={tab} onChange={setTab} items={(['Waiting', 'More info asked', 'Approved', 'Rejected'] as const).map(x => ({ id: x, label: x, count: s.signups.filter(y => y.status === x).length }))} />}>
      <div className="tablewrap"><table className="t"><thead><tr><th>Business</th><th>Type</th><th>Areas</th><th>Documents</th><th>Applied</th></tr></thead><tbody>
        {list.map(x => { const miss = x.docs.filter(d => d.status !== 'Uploaded').length; return <tr key={x.id} onClick={() => setOpen(x.id)}><td><span className="cell"><Avatar name={x.name} /><span className="stack"><b className="strong">{x.name}</b><span className="caption">{x.contact}</span></span></span></td><td><Chip tone={x.kind === 'Letting agent' ? 'brand' : 'info'} dot={false}>{x.kind}</Chip></td><td>{x.areas}</td><td>{miss ? <Chip tone="warn">{miss} missing</Chip> : <Chip tone="ok">All uploaded</Chip>}</td><td>{x.applied}</td></tr>; })}
      </tbody></table>{!list.length && <div className="empty">Nothing here.</div>}</div>
    </Card>
    {open && <SignUpDrawer id={open} onClose={() => setOpen(null)} />}
  </>;
}
function SignUpDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const x = s.signups.find(y => y.id === id)!; const [mode, setMode] = useState<'' | 'more' | 'reject'>('');
  const upd = (patch: Partial<SignUp>, msg: string) => { s.setSignups(ss => ss.map(y => y.id === id ? { ...y, ...patch } : y)); s.log(msg, 'Sign-Ups'); s.toast(msg); };
  const approve = () => {
    if (x.kind === 'Letting agent') s.setAgents(a => [...a, { id: 'A' + Date.now() % 1000, name: x.name, contact: x.contact, email: x.email, phone: x.phone, status: 'Approved' }]);
    else s.setContractors(c => [...c, { id: 'C' + Date.now() % 1000, name: x.name, type: x.kind.includes('Inspector') ? 'Site Inspector' : 'Trade', trade: x.trades ?? 'Site Inspector', contact: x.contact, phone: x.phone, certs: x.docs, paused: false, rating: 5, jobs: 0 }]);
    upd({ status: 'Approved' }, `Approved ${x.name}. Login email sent.`); onClose();
  };
  const miss = x.docs.filter(d => d.status !== 'Uploaded');
  return <Drawer title={x.name} sub={`${x.kind} · applied ${x.applied}`} onClose={onClose}
    footer={x.status === 'Waiting' || x.status === 'More info asked' ? <><Btn kind="danger" icon={<X size={16} />} onClick={() => setMode('reject')}>Reject</Btn><Btn kind="outline" onClick={() => setMode('more')}>Ask for more info</Btn><Btn icon={<CheckCircle2 size={16} />} disabled={miss.length > 0} title={miss.length ? 'All documents must be uploaded first' : ''} onClick={approve}>Approve</Btn></> : <Btn kind="outline" onClick={onClose}>Close</Btn>}>
    <Card className="flat"><KV rows={[['Contact', x.contact], ['Email', x.email], ['Phone', x.phone], ['Areas covered', x.areas], ...(x.trades ? [['Trade', x.trades] as [string, string]] : [])]} /></Card>
    <Card className="flat" title="Documents" sub="Open each one and check it is real and in date.">
      {x.docs.map(d => <div key={d.name} className="doc"><FileText size={18} color="#153D91" /><div className="stack grow"><b>{d.name}</b>{d.expires && <span className="caption">Expires {d.expires}</span>}</div>{d.status === 'Uploaded' ? <><Chip tone="ok">Uploaded</Chip><Btn sm kind="ghost" onClick={() => s.toast('Opening ' + d.name)}>View</Btn></> : <Chip tone={d.status === 'Expired' ? 'err' : 'warn'}>{d.status}</Chip>}</div>)}
      {miss.length > 0 && <Note tone="warn">Can't approve yet: {miss.map(d => d.name).join(', ')} {miss.length > 1 ? 'are' : 'is'} missing. Ask for more info.</Note>}
    </Card>
    {x.note && <Note>{x.note}</Note>}
    {mode === 'more' && <Reason title="Ask for more information" sub="They get an email and can upload again." cta="Send request" placeholder="e.g. Please upload your public liability insurance" onClose={() => setMode('')} onDone={r => { upd({ status: 'More info asked', note: 'Asked: ' + r }, `Asked ${x.name} for more info`); setMode(''); }} />}
    {mode === 'reject' && <Reason danger title="Reject application" sub="They are told by email. The reason is saved in History." cta="Reject" onClose={() => setMode('')} onDone={r => { upd({ status: 'Rejected', note: 'Rejected: ' + r }, `Rejected ${x.name}`); onClose(); }} />}
  </Drawer>;
}

/* ================= LETTING AGENTS ================= */
export function Agents() {
  const s = useStore(); const L = useLookups(); const [tab, setTab] = useState<'requests' | 'agents' | 'invoices'>('requests'); const [quote, setQuote] = useState<string | null>(null);
  const agent = s.detail ? s.agents.find(a => a.id === s.detail) : undefined;
  const reqs = s.jobs.filter(j => !j.managed && (!agent || L.prop(j.property)?.owner === agent.id));
  const invs = s.invoices.filter(i => i.toKind === 'Agent' && (!agent || i.to === agent.id));
  return <>
    <PageHeader crumbs={crumbsFor('agents', s.go, agent?.name)} title={agent ? agent.name : 'Letting Agents'} sub={agent ? `${agent.contact} · ${agent.email} · ${agent.phone}` : 'Agents ask for repairs on their unmanaged homes. Send a quote, do the work, then invoice them.'}
      action={agent && <Btn kind="outline" onClick={() => s.go('agents')}>All agents</Btn>} />
    <div className="grid g4">
      <Kpi icon={<Building2 size={18} />} tone="brand" label="Approved agents" value={s.agents.length} caption="can log in" onClick={() => setTab('agents')} />
      <Kpi icon={<Wrench size={18} />} tone="info" label="New requests" value={reqs.filter(j => j.status === 'New').length} caption="need a quote" onClick={() => setTab('requests')} />
      <Kpi icon={<Send size={18} />} tone="warn" label="Quotes waiting" value={reqs.filter(j => j.status === 'Quote sent').length} caption="agent to accept" onClick={() => setTab('requests')} />
      <Kpi icon={<Receipt size={18} />} tone="err" label="Unpaid invoices" value={money(invs.reduce((a, i) => a + i.amount - i.paid, 0))} caption={`${invs.filter(i => i.overdue).length} overdue`} onClick={() => setTab('invoices')} />
    </div>
    <Card action={<Tabs value={tab} onChange={setTab} items={[{ id: 'requests', label: 'Job requests', count: reqs.length }, { id: 'agents', label: 'Agents', count: s.agents.length }, { id: 'invoices', label: 'Invoices', count: invs.length }]} />} title={tab === 'requests' ? 'Job requests' : tab === 'agents' ? 'Approved agents' : 'Invoices to agents'}>
      {tab === 'requests' && <div className="tablewrap"><table className="t"><thead><tr><th>Job</th><th>Home</th><th>Agent</th><th>Contractor cost</th><th>Price to agent</th><th>Margin</th><th>Status</th><th></th></tr></thead><tbody>
        {reqs.map(j => <tr key={j.id} style={{ cursor: 'default' }}><td className="strong">{j.title}</td><td>{L.prop(j.property)?.address}</td><td>{L.ownerName(L.prop(j.property))}</td><td>{j.cost ? money(j.cost) : '—'}</td><td>{j.price ? <b>{money(j.price)}</b> : '—'}</td><td>{j.price ? <Chip tone="ok" dot={false}>{money(j.price - j.cost)}</Chip> : '—'}</td><td><Chip tone={j.status === 'Approved' ? 'ok' : j.status === 'New' ? 'info' : 'warn'}>{j.status === 'Approved' ? 'Done · invoiced' : j.status}</Chip></td>
          <td style={{ textAlign: 'right' }}>{j.status === 'New' ? <Btn sm onClick={() => setQuote(j.id)}>Send quote</Btn> : j.status === 'Quote sent' ? <Btn sm kind="outline" onClick={() => { s.setJobs(js => js.map(x => x.id === j.id ? { ...x, status: 'Assigned' } : x)); s.log(`${L.ownerName(L.prop(j.property))} accepted quote for ${j.title}`, 'Letting Agents'); s.toast('Quote accepted. Contractor assigned.'); }}>Mark accepted</Btn> : <Btn sm kind="ghost" onClick={() => s.go('jobs', j.id)}>Open job</Btn>}</td></tr>)}
      </tbody></table>{!reqs.length && <div className="empty">No requests.</div>}</div>}
      {tab === 'agents' && <div className="grid g3">{s.agents.map(a => <button key={a.id} className="kcard" onClick={() => s.go('agents', a.id)}><div className="flex"><Avatar name={a.name} size="md" /><div className="stack grow"><b>{a.name}</b><span className="caption">{a.contact}</span></div><Chip tone="ok">Approved</Chip></div><span className="caption"><Mail size={12} style={{ verticalAlign: -2 }} /> {a.email}</span><div className="flex between"><span className="small">{s.properties.filter(p => p.owner === a.id).length} homes</span><span className="small">{s.jobs.filter(j => L.prop(j.property)?.owner === a.id).length} jobs</span></div></button>)}</div>}
      {tab === 'invoices' && <InvoiceTable list={invs} />}
    </Card>
    {quote && <QuoteModal id={quote} onClose={() => setQuote(null)} />}
  </>;
}
function QuoteModal({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const j = s.jobs.find(x => x.id === id) as Job; const [c, setC] = useState(j.contractor ?? 'C4'); const [cost, setCost] = useState('120'); const [price, setPrice] = useState('180');
  const m = (+price || 0) - (+cost || 0);
  return <Modal title="Send quote to agent" sub={`${j.title} · ${L.prop(j.property)?.address}`} onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn icon={<Send size={16} />} disabled={m < 0 || !+price} onClick={() => { s.setJobs(js => js.map(x => x.id === id ? { ...x, contractor: c, cost: +cost, price: +price, status: 'Quote sent' } : x)); s.log(`Sent quote ${money(+price)} to ${L.ownerName(L.prop(j.property))} for ${j.title}`, 'Letting Agents'); s.toast('Quote sent to the agent'); onClose(); }}>Send quote</Btn></>}>
    <Field label="Contractor"><Select value={c} onChange={setC} options={s.contractors.filter(x => x.type === 'Trade').map(x => ({ value: x.id, label: `${x.name} · ${x.trade}${x.paused ? ' (paused)' : ''}`, disabled: x.paused }))} /></Field>
    <div className="grid g2"><Field label="Contractor's cost (£) · only staff see this"><Text value={cost} onChange={setCost} /></Field><Field label="Price to agent (£)"><Text value={price} onChange={setPrice} /></Field></div>
    {m >= 0 ? <Note tone="ok">LSP margin {money(m)}. The agent only sees the price.</Note> : <Note tone="err">The price is lower than the cost.</Note>}
  </Modal>;
}
export function InvoiceTable({ list }: { list: ReturnType<typeof useStore>['invoices'] }) {
  const s = useStore(); const L = useLookups();
  const name = (i: typeof list[number]) => i.toKind === 'Agent' ? L.agent(i.to)?.name : L.landlord(i.to)?.name;
  return <div className="tablewrap"><table className="t"><thead><tr><th>Invoice</th><th>To</th><th>Amount</th><th>Paid</th><th>Terms</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>
    {list.map(i => { const left = i.amount - i.paid; return <tr key={i.id} style={{ cursor: 'default' }}><td className="strong">{i.id}</td><td>{name(i)}<div className="caption">{i.toKind}</div></td><td>{money(i.amount)}</td><td>{money(i.paid)}</td><td>{i.terms}</td><td>{i.due}</td>
      <td>{left <= 0 ? <Chip tone="ok">Paid</Chip> : i.overdue ? <Chip tone="err">Overdue · {money(left)}</Chip> : i.paid ? <Chip tone="warn">Part-paid</Chip> : <Chip tone="info">Sent</Chip>}</td>
      <td style={{ textAlign: 'right' }}>{left > 0 && <div className="flex" style={{ justifyContent: 'flex-end' }}><Btn sm kind="ghost" onClick={() => { s.toast(`Reminder sent to ${name(i)}`); s.log(`Sent invoice reminder ${i.id} to ${name(i)}`, 'Rent & Invoices'); }}>Remind</Btn><Btn sm kind="outline" onClick={() => { s.setInvoices(is => is.map(x => x.id === i.id ? { ...x, paid: x.amount, overdue: false } : x)); s.log(`Recorded payment for ${i.id} (${money(left)})`, 'Rent & Invoices'); s.toast(`${i.id} marked paid`); }}>Mark paid</Btn></div>}</td></tr>; })}
  </tbody></table>{!list.length && <div className="empty">No invoices.</div>}</div>;
}
export const _a = ADMINS;
