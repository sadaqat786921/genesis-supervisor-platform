import { useState } from 'react';
import { ClipboardCheck, AlertTriangle, Gauge, CheckCircle2, XCircle, Mail, Wrench, ArrowRight, MessageSquareReply, Phone } from 'lucide-react';
import { useStore, useLookups, money, landlordBudget, budgetTone } from '../store';
import { PLAN, nowStamp, type Comm } from '../data';
import { ActionCard, Avatar, Bar, Btn, Card, Chip, CommModal, CommsLog, DetailHead, KV, Kpi, Note, PageTabs, Reason, Tabs, Timeline, Empty, sortComms } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { HomeCard, adminName, approveJob, jobEvent, jobTone } from './shared';

export function Approvals() {
  const s = useStore();
  if (s.detail && s.jobs.some(j => j.id === s.detail)) return <ApprovalPage id={s.detail} />;
  return <ApprovalList />;
}

function BudgetBar({ used, add = 0, budget }: { used: number; add?: number; budget: number }) {
  const u = budget ? Math.min(100, used / budget * 100) : 0; const a = budget ? Math.min(100 - u, add / budget * 100) : 0;
  const after = budget ? (used + add) / budget * 100 : 0;
  return <div className="bbar"><i className={`u ${budgetTone(Math.round(after))}`} style={{ width: u + '%' }} />{add > 0 && <i className={`j ${budgetTone(Math.round(after))}`} style={{ width: a + '%' }} />}{[70, 90].map(m => <span key={m} className="mk" style={{ left: m + '%' }}><em>{m}%</em></span>)}</div>;
}

function ApprovalList() {
  const s = useStore(); const L = useLookups();
  const [tab, setTab] = useState<'queue' | 'budgets' | 'decided'>('queue');
  const queue = s.jobs.filter(j => j.status === 'Waiting approval');
  const decided = s.jobs.filter(j => j.managed && j.events.some(e => e.text.startsWith('Approved by Supervisor') || e.text.startsWith('Declined')));
  const props = s.properties.filter(p => p.managed && p.budget);
  return <>
    <PageHeader crumbs={crumbsFor('approvals', s.go)} title="Approvals & Budgets" />
    <div className="grid g4">
      <Kpi icon={<ClipboardCheck size={18} />} tone="warn" label="Waiting for you" value={queue.length} caption={money(queue.reduce((a, j) => a + j.price, 0)) + ' in total'} active={tab === 'queue'} onClick={() => setTab('queue')} />
      <Kpi icon={<MessageSquareReply size={18} />} tone="info" label="Landlord replied" value={queue.filter(j => sortComms(j.comms)[0]?.dir === 'in' || j.landlordOk).length} caption="read before deciding" onClick={() => setTab('queue')} />
      <Kpi icon={<AlertTriangle size={18} />} tone="err" label="Budgets over 90%" value={props.filter(p => p.used / p.budget >= .9).length} caption="properties · landlord told" active={tab === 'budgets'} onClick={() => setTab('budgets')} />
      <Kpi icon={<Gauge size={18} />} tone="ok" label="Budgets under 70%" value={props.filter(p => p.used / p.budget < .7).length} caption={`of ${props.length} properties`} onClick={() => setTab('budgets')} />
    </div>
    <Tabs value={tab} onChange={setTab} items={[{ id: 'queue', label: 'Waiting approval', count: queue.length }, { id: 'budgets', label: 'Repair budgets' }, { id: 'decided', label: 'Decided', count: decided.length }]} />
    {tab === 'queue' && <Card title="Jobs over the landlord's limit" sub="Click a job to see the budget, the quote and every message with the landlord. Then approve or decline.">
      {queue.length ? <div className="col" style={{ gap: 12 }}>{queue.map(j => { const p = L.prop(j.property)!; const ll = L.landlord(p.owner)!; const after = p.budget ? Math.round((p.used + j.price) / p.budget * 100) : 0; const last = sortComms(j.comms)[0]; return (
        <div key={j.id} className="apcard" role="button" tabIndex={0} onClick={() => s.go('approvals', j.id)}>
          <span className="tile t-warn" style={{ width: 44, height: 44 }}><Wrench size={20} /></span>
          <div className="stack grow" style={{ gap: 6 }}>
            <div className="flex wrap" style={{ gap: 8 }}><b style={{ fontSize: 14 }}>{j.title}</b><span className="caption">{p.address}</span>{j.landlordOk ? <Chip tone="ok">Landlord said yes</Chip> : last?.dir === 'in' ? <Chip tone="info">Landlord replied</Chip> : null}</div>
            <span className="caption">{ll.name} · {ll.plan}% plan · limit {money(PLAN[ll.plan].limit)} · {L.contractor(j.contractor)?.name ?? 'No contractor'} · reported {j.reported}</span>
            <div className="flex" style={{ gap: 10 }}><div style={{ width: 260 }}><BudgetBar used={p.used} add={j.price} budget={p.budget} /></div><span className="caption">Budget after: <b style={{ color: after >= 90 ? 'var(--err)' : after >= 70 ? 'var(--warn)' : 'var(--ok)' }}>{after}%</b></span></div>
          </div>
          <b style={{ fontSize: 20 }}>{money(j.price)}</b>
          <div className="flex" onClick={e => e.stopPropagation()}><Btn sm kind="outline" onClick={() => s.go('approvals', j.id)}>Open</Btn><Btn sm onClick={() => approveJob(s, j, L)}>Approve</Btn></div>
        </div>); })}</div> : <Empty icon={<CheckCircle2 size={22} />}>Nothing waiting. All caught up.</Empty>}
    </Card>}
    {tab === 'budgets' && <Card title="Yearly repair budgets" sub="Each property has its own budget. Alerts go to the landlord at 70%, 90% and 100%. A job is only taken off once.">
      <div className="tablewrap"><table className="t"><thead><tr><th>Property</th><th>Budget</th><th>Used</th><th>Left</th><th style={{ minWidth: 220 }}>Used so far</th><th>Alerts sent</th></tr></thead>
        {s.landlords.filter(l => landlordBudget(s, l.id).budget).map(l => { const b = landlordBudget(s, l.id); return <tbody key={l.id} className="grp">
          <tr className="grp-h" onClick={() => s.go('landlords', l.id)}><td><span className="cell"><Avatar name={l.name} /><span className="stack"><b className="strong">{l.name}</b><span className="caption">{l.plan}% plan · {b.props.length} {b.props.length > 1 ? 'properties' : 'property'}</span></span></span></td><td><b>{money(b.budget)}</b></td><td><b>{money(b.used)}</b></td><td><b>{money(b.left)}</b></td><td><div className="flex"><Bar value={b.pct} tone={budgetTone(b.pct)} /><b className="small">{b.pct}%</b></div></td><td><span className="caption">Total for landlord</span></td></tr>
          {b.props.map(p => { const pct = Math.round(p.used / p.budget * 100); return <tr key={p.id} onClick={() => s.go('properties', p.id)}><td style={{ paddingLeft: 64 }}><span className="cell"><div className="photo" style={{ width: 36, height: 28, flex: 'none', backgroundImage: `url(${p.photo})`, borderRadius: 6 }} />{p.address}</span></td><td>{money(p.budget)}</td><td>{money(p.used)}</td><td>{money(p.budget - p.used)}</td><td><div className="flex"><Bar value={pct} tone={budgetTone(pct)} /><b className="small">{pct}%</b></div></td><td><div className="flex wrap">{[70, 90, 100].map(a => <Chip key={a} tone={pct >= a ? (a === 70 ? 'warn' : 'err') : 'neutral'} dot={false}>{a}%</Chip>)}</div></td></tr>; })}
        </tbody>; })}
      </table></div></Card>}
    {tab === 'decided' && <Card title="Decided" sub="Jobs you approved or declined."><div className="divlist">{decided.map(j => { const e = [...j.events].reverse().find(x => x.text.startsWith('Approved by Supervisor') || x.text.startsWith('Declined')); return <button key={j.id} className="item click" onClick={() => s.go('approvals', j.id)}><span className={`tile ${j.status === 'Declined' ? 't-neutral' : 't-ok'}`}>{j.status === 'Declined' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}</span><div className="stack grow"><b>{j.title} · {money(j.price)}</b><span className="caption">{L.prop(j.property)?.address} · {e?.at}</span></div><Chip tone={jobTone(j.status)}>{j.status}</Chip></button>; })}{!decided.length && <Empty>Nothing decided yet.</Empty>}</div></Card>}
  </>;
}

function ApprovalPage({ id }: { id: string }) {
  const s = useStore(); const L = useLookups(); const j = s.jobs.find(x => x.id === id)!;
  const p = L.prop(j.property)!; const ll = L.landlord(p.owner); const limit = ll ? PLAN[ll.plan].limit : 0; const c = L.contractor(j.contractor);
  const [tab, setTab] = useState<'details' | 'comms'>('details'); const [m, setM] = useState<'' | 'decline' | 'email' | 'reply'>('');
  const waiting = j.status === 'Waiting approval';
  const usedNow = waiting ? p.used : p.used - (j.events.some(e => e.text.startsWith('Approved by Supervisor')) ? j.price : 0);
  const after = p.budget ? Math.round((usedNow + j.price) / p.budget * 100) : 0; const before = p.budget ? Math.round(usedNow / p.budget * 100) : 0;
  const hit = [100, 90, 70].find(t => before < t && after >= t);
  const lb = ll ? landlordBudget(s, ll.id) : undefined;
  const addComm = (cm: Comm, msg: string) => { s.setJobs(js => js.map(x => x.id === id ? { ...x, comms: [...x.comms, cm], landlordOk: msg.includes('said yes') ? true : x.landlordOk } : x)); s.log(msg, 'Approvals'); s.toast(msg); };
  const decided = !waiting;
  return <>
    <PageHeader crumbs={crumbsFor('approvals', s.go, j.title)} back={() => s.go('approvals')} title={`Approve ${j.title.toLowerCase()}?`}
      action={waiting && <div className="flex"><Btn kind="outline" icon={<XCircle size={16} />} onClick={() => setM('decline')}>Decline</Btn><Btn kind="outline" icon={<Mail size={16} />} onClick={() => setM('email')}>Email landlord</Btn><Btn icon={<CheckCircle2 size={16} />} onClick={() => approveJob(s, j, L)}>Approve {money(j.price)}</Btn></div>} />
    <DetailHead media={<span className="tile t-warn" style={{ width: 64, height: 64, borderRadius: 18 }}><Wrench size={28} /></span>} title={`${j.title} · ${money(j.price)}`}
      chips={<><Chip tone={jobTone(j.status)}>{j.status}</Chip>{j.landlordOk && <Chip tone="ok">Landlord said yes</Chip>}</>}
      meta={[['Home', p.address], ['Landlord', `${ll?.name} · ${ll?.plan}% plan`], ['Job limit', money(limit)], ['Over the limit by', money(Math.max(0, j.price - limit))]]} />
    <PageTabs value={tab} onChange={setTab} items={[{ id: 'details', label: 'Details and budget' }, { id: 'comms', label: 'Communication', count: j.comms.length }]} />
    <div className="dgrid">
      <div className="col">
        {tab === 'details' && <>
          <Card title="Budget impact" sub={`${p.address} has its own yearly repair budget of ${money(p.budget)}.`}>
            <div className="grid g4" style={{ gap: 12 }}>{[['Budget', money(p.budget)], ['Used before', `${money(usedNow)} · ${before}%`], ['This job', money(j.price)], ['Left after', money(p.budget - usedNow - j.price)]].map(([k, v]) => <div key={k} className="mt stack"><span className="caption">{k}</span><b>{v}</b></div>)}</div>
            <BudgetBar used={usedNow} add={j.price} budget={p.budget} />
            <div className="flex wrap" style={{ gap: 14 }}><span className="legend"><i className="lg-u" />Already used</span><span className="legend"><i className="lg-j" />This job</span><span className="legend"><i className="lg-f" />Left</span></div>
            {hit ? <Note tone={hit >= 90 ? 'err' : 'warn'}>Approving takes the budget from {before}% to {after}%. {ll?.name} gets the {hit}% alert email.</Note> : <Note tone="ok">Approving takes the budget from {before}% to {after}%. No new alert.</Note>}
            {lb && lb.props.length > 1 && <span className="caption">{ll?.name} has {lb.props.length} properties. All budgets together: {money(lb.used)} of {money(lb.budget)} used ({lb.pct}%).</span>}
          </Card>
          <Card title="The job"><p style={{ margin: 0, lineHeight: 1.6 }}>{j.note}</p><KV rows={[['Reported by', j.by], ['Reported', j.reported], ['Contractor', c ? `${c.name} · ★ ${c.rating}` : '—'], ['Quote', money(j.price)], ['Contractor cost', money(j.cost) + ' · staff only'], ['Office Admin', adminName(j.admin)]]} />
            <div className="photos">{['Problem', 'Close up', 'Quote page'].map((x, i) => <div key={x} className="ph" style={{ backgroundImage: `url(images/home${i + 1}.jpg)` }}><span>{x}</span></div>)}</div>
            <Btn kind="ghost" icon={<ArrowRight size={16} />} onClick={() => s.go('jobs', id)}>Open the full job</Btn></Card>
          <Card title="History"><Timeline items={[...j.events].reverse().map(e => ({ at: e.at, text: e.text, by: e.by }))} /></Card>
        </>}
        {tab === 'comms' && <Card title="Communication with the landlord" sub="Every email, call and reply until the landlord agrees. Saved with the date and time.">
          <div className="flex wrap"><Btn sm icon={<Mail size={14} />} onClick={() => setM('email')}>Email landlord</Btn><Btn sm kind="outline" icon={<MessageSquareReply size={14} />} onClick={() => setM('reply')}>Log landlord reply</Btn></div>
          <CommsLog items={j.comms} to={ll?.email} onAdd={c2 => addComm(c2, 'Saved')} emptyText="No messages with the landlord yet." /></Card>}
      </div>
      <div className="col">
        {waiting ? <ActionCard tone="warn" title="Your decision" text={`${money(j.price)} is ${money(j.price - limit)} over the ${money(limit)} limit.${j.landlordOk ? ' The landlord has said yes.' : ''}`}>
          <Btn block icon={<CheckCircle2 size={16} />} onClick={() => approveJob(s, j, L)}>Approve {money(j.price)}</Btn>
          <Btn block kind="outline" icon={<Mail size={16} />} onClick={() => setM('email')}>Email landlord first</Btn>
          <Btn block kind="ghost" icon={<XCircle size={16} />} onClick={() => setM('decline')}>Decline</Btn></ActionCard>
          : <ActionCard tone={j.status === 'Declined' ? 'neutral' : 'ok'} title="Decided" text={j.status === 'Declined' ? `Declined: ${j.declined}` : `Approved. The job is now ${j.status.toLowerCase()}.`}><Btn block kind="outline" icon={<ArrowRight size={16} />} onClick={() => s.go('jobs', id)}>Open job</Btn></ActionCard>}
        {ll && <Card title="Landlord"><div className="flex"><Avatar name={ll.name} size="md" /><div className="stack grow"><button className="link" style={{ textAlign: 'left' }} onClick={() => s.go('landlords', ll.id)}>{ll.name}</button><span className="caption">{ll.plan}% plan · {ll.phone}</span></div></div><div className="flex"><Btn sm kind="outline" icon={<Phone size={14} />} onClick={() => s.toast('Calling ' + ll.phone)}>Call</Btn><Btn sm kind="outline" icon={<Mail size={14} />} onClick={() => setM('email')}>Email</Btn></div></Card>}
        <Card title="Budgets for this landlord">{lb?.props.map(x => { const pc = Math.round(x.used / (x.budget || 1) * 100); return <div key={x.id} className="stack" style={{ gap: 5 }}><span className="flex between"><b className="small" style={{ color: 'var(--text-primary)' }}>{x.address}</b><span className="caption">{pc}%</span></span><Bar value={pc} tone={budgetTone(pc)} /></div>; })}</Card>
        <HomeCard id={j.property} />
      </div>
    </div>
    {m === 'decline' && <Reason danger title="Decline this job" sub="The Office Admin is told. The budget is not touched." cta="Decline" options={['Too expensive, get another quote', 'Landlord said no', 'Not urgent, wait', 'Landlord will fix it themselves']} onClose={() => setM('')} onDone={r => { jobEvent(s, id, `Declined by Supervisor: ${r}`, { status: 'Declined', declined: r }); s.log(`Declined ${j.title}: ${r}`, 'Approvals'); s.toast('Declined. The budget was not touched.'); setM(''); }} />}
    {m === 'email' && <CommModal mode="Email" to={ll?.email} presetSubject={`Repair approval needed · ${p.address}`} presetText={`Hello ${ll?.name.split(' ')[0]},\n\n${j.title} at ${p.address} needs a repair at ${money(j.price)}. This is over your ${money(limit)} job limit, so we need your OK before we book it.\n\nYour repair budget for this property will be ${after}% used after this job.\n\nThank you,\nSarah Khan, LSP`} onClose={() => setM('')} onSave={cm => { addComm(cm, `Emailed ${ll?.name} about ${j.title}`); setM(''); setTab('comms'); }} />}
    {m === 'reply' && <Reason title="Log the landlord's reply" sub="Saved in the communication tab with today's date and time." cta="Save reply" label="What did they say?" options={['Landlord said yes, go ahead', 'Landlord said no', 'Landlord wants more photos', 'Landlord wants a second quote']} onClose={() => setM('')} onDone={r => { addComm({ id: 'cm' + Date.now(), at: nowStamp(), by: ll?.name ?? 'Landlord', channel: 'Email', dir: 'in', subject: 'Reply from landlord', text: r }, r.includes('yes') ? `${ll?.name} said yes to ${j.title}` : `Saved reply from ${ll?.name}`); setM(''); setTab('comms'); }} />}
  </>;
}
