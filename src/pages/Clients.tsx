import { useState } from 'react';
import { Building2, Wrench, Send, Receipt, Mail, Phone, Plus, ArrowRight, Home } from 'lucide-react';
import { useStore, useLookups, money } from '../store';
import { Avatar, Btn, Card, Chip, DetailHead, KV, Kpi, MiniSearch, PageTabs, Stat, Tabs, Timeline, Empty, When } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { AddPropertyModal, DONE_JOB, jobTone, nextJobAction, adminName } from './shared';
import { InvoiceTable, JobTable } from './tables';
import { JobPage } from './Jobs';

export function Clients() {
  const s = useStore();
  if (s.detail && s.jobs.some(j => j.id === s.detail)) return <JobPage id={s.detail} ctx="clients" />;
  if (s.detail && s.clients.some(c => c.id === s.detail)) return <ClientPage id={s.detail} />;
  return <ClientList />;
}

function ClientList() {
  const s = useStore(); const L = useLookups();
  const [tab, setTab] = useState<'requests' | 'clients' | 'invoices'>('requests'); const [f, setF] = useState<'open' | 'all'>('open'); const [q, setQ] = useState('');
  const reqs = s.jobs.filter(j => !j.managed && (f === 'all' || !DONE_JOB.includes(j.status)) && (j.title + (L.prop(j.property)?.address ?? '') + L.ownerName(L.prop(j.property))).toLowerCase().includes(q.toLowerCase()));
  const all = s.jobs.filter(j => !j.managed);
  const invs = s.invoices.filter(i => i.toKind === 'Client');
  return <>
    <PageHeader crumbs={crumbsFor('clients', s.go)} title="Clients" />
    <div className="grid g4">
      <Kpi icon={<Building2 size={18} />} tone="brand" label="Active clients" value={s.clients.filter(c => c.status === 'Active').length} caption="letting agents who can log in" active={tab === 'clients'} onClick={() => setTab('clients')} />
      <Kpi icon={<Wrench size={18} />} tone="info" label="New job requests" value={all.filter(j => j.status === 'New').length} caption="need a quote" active={tab === 'requests'} onClick={() => { setTab('requests'); setF('open'); }} />
      <Kpi icon={<Send size={18} />} tone="warn" label="Quotes waiting" value={all.filter(j => j.status === 'Quote sent').length} caption="client to accept" onClick={() => { setTab('requests'); setF('open'); }} />
      <Kpi icon={<Receipt size={18} />} tone="err" label="Unpaid invoices" value={money(invs.reduce((a, i) => a + i.amount - i.paid, 0))} caption={`${invs.filter(i => i.overdue).length} overdue`} active={tab === 'invoices'} onClick={() => setTab('invoices')} />
    </div>
    <Tabs value={tab} onChange={setTab} items={[{ id: 'requests', label: 'Job requests', count: all.filter(j => !DONE_JOB.includes(j.status)).length }, { id: 'clients', label: 'Clients', count: s.clients.length }, { id: 'invoices', label: 'Invoices', count: invs.length }]} />
    {tab === 'requests' && <Card title="Job requests" sub="Clients ask for repairs at their homes. Click a request to quote, assign, check the photos and invoice."
      action={<div className="toolbar"><MiniSearch value={q} onChange={setQ} placeholder="Search requests" /><Tabs value={f} onChange={setF} items={[{ id: 'open', label: 'Open' }, { id: 'all', label: 'All' }]} /></div>}>
      <div className="tablewrap"><table className="t"><thead><tr><th>Request</th><th>Home</th><th>Client</th><th>Requested</th><th>Price to client</th><th>Status</th><th>Next step</th></tr></thead><tbody>
        {reqs.map(j => { const p = L.prop(j.property); return <tr key={j.id} onClick={() => s.go('clients', j.id)}>
          <td><span className="cell"><span className="tile t-info" style={{ width: 32, height: 32 }}><Wrench size={15} /></span><b className="strong">{j.title}</b></span></td>
          <td>{p?.address}</td><td><span className="cell"><Avatar name={L.ownerName(p)} />{L.ownerName(p)}</span></td><td><When at={j.reported} /></td>
          <td>{j.price ? <b>{money(j.price)}</b> : <span className="muted">Not quoted</span>}</td><td><Chip tone={jobTone(j.status)}>{j.status}</Chip></td>
          <td><span className="flex caption" style={{ fontWeight: 700, color: 'var(--text-brand)' }}>{nextJobAction(j)} <ArrowRight size={13} /></span></td></tr>; })}
      </tbody></table>{!reqs.length && <Empty icon={<Wrench size={22} />}>No requests.</Empty>}</div></Card>}
    {tab === 'clients' && <Card title="Clients" sub="Letting agents approved through Sign-Ups."><div className="grid g3">{s.clients.map(c => { const homes = s.properties.filter(p => p.owner === c.id); const open = s.jobs.filter(j => homes.some(h => h.id === j.property) && !DONE_JOB.includes(j.status)).length; return <button key={c.id} className="kcard" onClick={() => s.go('clients', c.id)}>
      <div className="flex"><Avatar name={c.name} size="md" /><div className="stack grow"><b>{c.name}</b><span className="caption">{c.contact}</span></div><Chip tone="ok">{c.status}</Chip></div>
      <span className="caption"><Mail size={12} style={{ verticalAlign: -2 }} /> {c.email}</span>
      <div className="flex between"><span className="small">{homes.length} homes</span><span className="small">{open} open jobs</span><span className="small">{c.terms}</span></div></button>; })}</div></Card>}
    {tab === 'invoices' && <Card title="Invoices to clients" sub="Client invoices have the client's own payment terms."><InvoiceTable list={invs} /></Card>}
  </>;
}

function ClientPage({ id }: { id: string }) {
  const s = useStore(); const c = s.clients.find(x => x.id === id)!;
  const [tab, setTab] = useState<'requests' | 'homes' | 'invoices' | 'history'>('requests'); const [add, setAdd] = useState(false);
  const homes = s.properties.filter(p => p.owner === id); const jobs = s.jobs.filter(j => homes.some(h => h.id === j.property));
  const invs = s.invoices.filter(i => i.toKind === 'Client' && i.to === id);
  const owed = invs.reduce((a, i) => a + i.amount - i.paid, 0);
  const acts = s.activity.filter(a => a.what.includes(c.name) || homes.some(h => a.what.includes(h.address)));
  return <>
    <PageHeader crumbs={crumbsFor('clients', s.go, c.name)} back={() => s.go('clients')} title={c.name} action={<Btn icon={<Plus size={18} />} onClick={() => setAdd(true)}>Add home</Btn>} />
    <DetailHead media={<Avatar name={c.name} size="xl" />} title={c.name} chips={<><Chip tone="ok">{c.status}</Chip><Chip tone="neutral" dot={false}>Client · letting agent</Chip></>}
      meta={[['Contact', c.contact], ['Email', c.email], ['Phone', c.phone], ['Client since', c.joined]]}
      aside={<div className="flex" style={{ gap: 8 }}><Btn sm kind="outline" icon={<Phone size={14} />} onClick={() => s.toast('Calling ' + c.phone)}>Call</Btn><Btn sm kind="outline" icon={<Mail size={14} />} onClick={() => s.toast('Email opened to ' + c.email)}>Email</Btn></div>} />
    <div className="grid g4"><Stat label="Homes" value={homes.length} /><Stat label="Open requests" value={jobs.filter(j => !DONE_JOB.includes(j.status)).length} tone="info" /><Stat label="Unpaid" value={money(owed)} tone={owed ? 'warn' : 'ok'} sub={`${invs.filter(i => i.overdue).length} overdue`} /><Stat label="Payment terms" value={c.terms} /></div>
    <PageTabs value={tab} onChange={setTab} items={[{ id: 'requests', label: 'Job requests', count: jobs.length }, { id: 'homes', label: 'Homes', count: homes.length }, { id: 'invoices', label: 'Invoices', count: invs.length }, { id: 'history', label: 'History' }]} />
    {tab === 'requests' && <Card title="Job requests"><JobTable list={jobs} route="clients" /></Card>}
    {tab === 'homes' && <Card title="Homes" sub="Unmanaged. The client looks after tenants and rent."><div className="grid g3">{homes.map(p => <button key={p.id} className="kcard" onClick={() => s.go('properties', p.id)}><div className="photo" style={{ height: 120, backgroundImage: `url(${p.photo})` }} /><b>{p.address}</b><span className="caption">{p.area} · Office Admin {adminName(p.admin)}</span></button>)}{!homes.length && <Empty icon={<Home size={22} />}>No homes yet.</Empty>}</div></Card>}
    {tab === 'invoices' && <Card title="Invoices"><InvoiceTable list={invs} /></Card>}
    {tab === 'history' && <Card title="History"><KV rows={[['Address', c.address], ['Joined', c.joined]]} />{acts.length ? <Timeline items={acts.map(a => ({ at: a.at, text: a.what, by: a.who }))} /> : <span className="caption">No activity yet.</span>}</Card>}
    {add && <AddPropertyModal owner={id} managed={false} onClose={() => setAdd(false)} />}
  </>;
}
