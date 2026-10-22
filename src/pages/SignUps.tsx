import { useState } from 'react';
import { UserPlus, Clock, CheckCircle2, XCircle, MessageSquareWarning, Eye, Check, X, ArrowRight, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import { nowStamp, type Comm, type SignUp } from '../data';
import { ActionCard, Avatar, Bar, Btn, Card, Chip, CommsLog, DetailHead, DocRow, KV, Kpi, Note, Reason, Tabs, When, Empty } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';

const tone = { Waiting: 'info', 'More info asked': 'warn', Approved: 'ok', Rejected: 'neutral' } as const;
const ready = (x: SignUp) => x.docs.filter(d => d.status === 'Verified').length;

export function SignUps() {
  const s = useStore();
  if (s.detail && s.signups.some(x => x.id === s.detail)) return <SignUpPage id={s.detail} />;
  return <SignUpList />;
}

function SignUpList() {
  const s = useStore(); const [tab, setTab] = useState<SignUp['status'] | 'all'>('Waiting');
  const list = s.signups.filter(x => tab === 'all' || x.status === tab);
  const n = (st: SignUp['status']) => s.signups.filter(x => x.status === st).length;
  return <>
    <PageHeader crumbs={crumbsFor('signups', s.go)} title="Sign-Ups" />
    <div className="grid g4">
      <Kpi icon={<Clock size={18} />} tone="info" label="Waiting for you" value={n('Waiting')} caption="check and decide" active={tab === 'Waiting'} onClick={() => setTab('Waiting')} />
      <Kpi icon={<MessageSquareWarning size={18} />} tone="warn" label="More info asked" value={n('More info asked')} caption="waiting for them" active={tab === 'More info asked'} onClick={() => setTab('More info asked')} />
      <Kpi icon={<CheckCircle2 size={18} />} tone="ok" label="Approved" value={n('Approved')} caption="can log in" active={tab === 'Approved'} onClick={() => setTab('Approved')} />
      <Kpi icon={<XCircle size={18} />} tone="neutral" label="Rejected" value={n('Rejected')} caption="reason saved" active={tab === 'Rejected'} onClick={() => setTab('Rejected')} />
    </div>
    <Card title="Applications" sub="Clients (letting agents) and contractors sign up on the website. Click one to check everything before they can log in."
      action={<Tabs value={tab} onChange={setTab} items={[...(['Waiting', 'More info asked', 'Approved', 'Rejected'] as const).map(x => ({ id: x, label: x, count: n(x) })), { id: 'all' as const, label: 'All' }]} />}>
      <div className="tablewrap"><table className="t"><thead><tr><th>Business</th><th>Type</th><th>Areas</th><th>Documents</th><th>Applied</th><th>Status</th><th /></tr></thead><tbody>
        {list.map(x => { const miss = x.docs.filter(d => ['Missing', 'Expired'].includes(d.status)).length; return <tr key={x.id} onClick={() => s.go('signups', x.id)}>
          <td><span className="cell"><Avatar name={x.name} /><span className="stack"><b className="strong">{x.name}</b><span className="caption">{x.contact}</span></span></span></td>
          <td><Chip tone={x.kind.startsWith('Client') ? 'brand' : 'info'} dot={false}>{x.kind}</Chip></td><td>{x.areas}</td>
          <td>{miss ? <Chip tone="warn">{miss} missing or expired</Chip> : <Chip tone="ok">{x.docs.length} uploaded</Chip>}</td><td><When at={x.applied} /></td>
          <td><Chip tone={tone[x.status]}>{x.status}</Chip></td><td><ArrowRight size={16} color="#98A2B3" /></td></tr>; })}
      </tbody></table>{!list.length && <Empty icon={<UserPlus size={22} />}>Nothing here.</Empty>}</div>
    </Card>
  </>;
}

function SignUpPage({ id }: { id: string }) {
  const s = useStore(); const x = s.signups.find(y => y.id === id)!;
  const [m, setM] = useState<'' | 'more' | 'reject' | `doc${number}`>('');
  const upd = (patch: Partial<SignUp>, msg: string, ...comms: Comm[]) => { s.setSignups(ss => ss.map(y => y.id === id ? { ...y, ...patch, comms: [...y.comms, ...comms] } : y)); s.log(msg, 'Sign-Ups'); s.toast(msg); };
  const mail = (subject: string, text: string): Comm => ({ id: 'cm' + Date.now(), at: nowStamp(), by: 'Sarah Khan', channel: 'Email', dir: 'out', subject, text });
  const total = x.docs.length; const ok = ready(x); const blocked = x.docs.filter(d => ['Missing', 'Expired', 'Rejected'].includes(d.status));
  const contractor = !x.kind.startsWith('Client');
  const decided = x.status === 'Approved' || x.status === 'Rejected';
  const approve = () => {
    let newId = '';
    if (!contractor) { newId = 'A' + (Date.now() % 1000); s.setClients(a => [...a, { id: newId, name: x.name, contact: x.contact, email: x.email, phone: x.phone, address: x.address, status: 'Active', joined: '15 Oct 2026', terms: '30 days' }]); }
    else { newId = 'C' + (Date.now() % 1000); s.setContractors(c => [...c, { id: newId, name: x.name, type: x.kind.includes('Inspector') ? 'Site Inspector' : 'Trade', trade: x.trades ?? 'Site Inspector', contact: x.contact, email: x.email, phone: x.phone, address: x.address, areas: x.areas, joined: '15 Oct 2026', status: 'Active', kyc: x.docs, rating: 5, pastJobs: 0, bills: [] }]); }
    upd({ status: 'Approved', note: newId }, `Approved ${x.name}. Login email sent.`, mail('Welcome to LSP · your Genesis login', 'Your application is approved. Use the link to set your password.'));
  };
  return <>
    <PageHeader crumbs={crumbsFor('signups', s.go, x.name)} back={() => s.go('signups')} title={x.name}
      action={!decided && <div className="flex"><Btn kind="outline" icon={<XCircle size={16} />} onClick={() => setM('reject')}>Reject</Btn><Btn kind="outline" icon={<Mail size={16} />} onClick={() => setM('more')}>Ask for more info</Btn><Btn icon={<CheckCircle2 size={16} />} disabled={ok < total} onClick={approve}>Approve</Btn></div>} />
    <DetailHead media={<Avatar name={x.name} size="xl" />} title={x.name} chips={<><Chip tone={contractor ? 'info' : 'brand'} dot={false}>{x.kind}</Chip><Chip tone={tone[x.status]}>{x.status}</Chip></>}
      meta={[['Contact', x.contact], ['Email', x.email], ['Phone', x.phone], ['Applied', x.applied]]}
      aside={<div className="flex" style={{ gap: 8 }}><Btn sm kind="outline" icon={<Phone size={14} />} onClick={() => s.toast('Calling ' + x.phone)}>Call</Btn></div>} />
    <div className="dgrid">
      <div className="col">
        <Card title="Requirements checklist" sub="Open each document, check it is real, in date and in their name. Then verify it." action={<Chip tone={ok === total ? 'ok' : 'info'}>{ok} of {total} verified</Chip>}>
          <Bar value={ok / total * 100} tone={ok === total ? 'ok' : 'brand'} />
          {x.docs.map((d, i) => <DocRow key={d.name} name={d.name} status={d.status} meta={d.status === 'Missing' ? 'Not uploaded' : `${d.file}${d.expires ? ' · ends ' + d.expires : ''}${d.note ? ' · ' + d.note : ''}`}>
            {d.file && <Btn sm kind="ghost" icon={<Eye size={14} />} onClick={() => s.toast('Opening ' + d.file)}>View</Btn>}
            {!decided && d.status === 'Uploaded' && <><Btn sm kind="success" icon={<Check size={14} />} onClick={() => upd({ docs: x.docs.map((z, k) => k === i ? { ...z, status: 'Verified' } : z) }, `Verified ${d.name} for ${x.name}`)}>Verify</Btn><Btn sm kind="ghost" icon={<X size={14} />} onClick={() => setM(`doc${i}`)}>Reject</Btn></>}
          </DocRow>)}
          {blocked.length > 0 && !decided && <Note tone="warn">Can't approve yet: {blocked.map(d => d.name).join(', ')}. Ask them for more information.</Note>}
        </Card>
        <Card title="Business details"><KV rows={[['Business', x.name], ['Company', x.company], ['Address', x.address], ['Areas covered', x.areas], ...(x.trades ? [['Trade', x.trades] as [string, string]] : []), ['Type', x.kind]]} /></Card>
        <Card title="Communication"><CommsLog items={x.comms} to={x.email} onAdd={!decided ? c => upd({}, `Saved ${c.channel.toLowerCase()} for ${x.name}`, c) : undefined} emptyText="No messages yet." /></Card>
      </div>
      <div className="col">
        {x.status === 'Approved' ? <ActionCard tone="ok" title="Approved" text={`${x.name} can log in now.`}><Btn block icon={<ArrowRight size={16} />} onClick={() => s.go(contractor ? 'contractors' : 'clients', x.note)}>Open {contractor ? 'contractor' : 'client'} record</Btn></ActionCard>
          : x.status === 'Rejected' ? <ActionCard tone="neutral" title="Rejected" text={x.note} />
            : ok === total ? <ActionCard tone="ok" text="Every document is verified. Approve them and the login email goes out."><Btn block icon={<CheckCircle2 size={16} />} onClick={approve}>Approve and send login</Btn></ActionCard>
              : <ActionCard text={blocked.length ? `${blocked.length} document${blocked.length > 1 ? 's are' : ' is'} missing, expired or rejected. Ask them to upload again.` : `Verify the ${total - ok} remaining document${total - ok > 1 ? 's' : ''} to approve.`}>
                {blocked.length > 0 && <Btn block icon={<Mail size={16} />} onClick={() => setM('more')}>Ask for more info</Btn>}
                <Btn block kind="outline" icon={<XCircle size={16} />} onClick={() => setM('reject')}>Reject application</Btn></ActionCard>}
        {x.status === 'More info asked' && x.note && <Note tone="warn">{x.note}</Note>}
        <Card title="What happens next"><div className="caption" style={{ lineHeight: 1.7 }}>1. You verify every document.<br />2. You approve. They get a login email.<br />3. {contractor ? 'They can be assigned jobs. Expired documents pause them automatically.' : 'They can request jobs for their homes and get quotes.'}</div></Card>
        <Card title="Security"><span className="flex small"><ShieldCheck size={16} color="var(--ok)" /> Email confirmed · phone confirmed</span></Card>
      </div>
    </div>
    {m === 'more' && <Reason title="Ask for more information" sub="They get an email and can upload again. The status changes to More info asked." cta="Send request" placeholder="e.g. Please upload your public liability insurance" onClose={() => setM('')} onDone={r => { upd({ status: 'More info asked', note: 'Asked: ' + r }, `Asked ${x.name} for more info`, mail('More information needed for your LSP sign-up', r)); setM(''); }} />}
    {m === 'reject' && <Reason danger title="Reject application" sub="They are told by email. The reason is saved in History." cta="Reject" options={['Documents not valid', 'Insurance not enough', 'Outside our areas', 'Not a fit for LSP', 'Failed checks']} onClose={() => setM('')} onDone={r => { upd({ status: 'Rejected', note: 'Rejected: ' + r }, `Rejected ${x.name}: ${r}`, mail('Your LSP sign-up', 'We are not able to approve your application. Reason: ' + r)); setM(''); }} />}
    {m.startsWith('doc') && (() => { const i = +m.slice(3); return <Reason danger title={`Reject ${x.docs[i].name}`} sub="Ask them to upload it again." cta="Reject document" options={['Not readable', 'Expired', 'Wrong name', 'Wrong document']} onClose={() => setM('')} onDone={r => { upd({ docs: x.docs.map((z, k) => k === i ? { ...z, status: 'Rejected', note: r } : z) }, `Rejected ${x.docs[i].name} for ${x.name}`); setM(''); }} />; })()}
  </>;
}
