import { useState } from 'react';
import { Search, Check, Mail, Home } from 'lucide-react';
import { useStore, useLookups, money, staff } from '../store';
import { ADMINS, PLAN, type Job, type Plan, type Property } from '../data';
import { Btn, Chip, Field, Modal, Note, Select, Steps, Text, Avatar } from '../ui';

type S = ReturnType<typeof useStore>;
type LK = ReturnType<typeof useLookups>;

/** Approve a job: cost comes off the landlord's repair budget once, even if clicked twice. */
export function approveJob(s: S, j: Job, L: LK) {
  if (j.status !== 'Waiting approval') { s.toast('Already approved. Nothing was taken twice.'); return; }
  const p = L.prop(j.property);
  s.setJobs(js => js.map(x => x.id === j.id ? { ...x, status: x.contractor ? 'Assigned' : 'New' } : x));
  if (p?.managed) s.setLandlords(ls => ls.map(l => l.id === p.owner ? { ...l, used: l.used + j.price } : l));
  s.log(`Approved ${j.title} at ${p?.address} (${money(j.price)})`, 'Approvals & Budgets');
  s.toast(`${j.title} approved. ${money(j.price)} taken from the repair budget once.`);
}

export function NewLandlordModal({ onClose }: { onClose: () => void }) {
  const s = useStore();
  const [step, setStep] = useState(0);
  const [q, setQ] = useState('');
  const [f, setF] = useState({ name: '', email: '', phone: '', billing: '', admin: 'et' });
  const [plan, setPlan] = useState<Plan>(16);
  const [start, setStart] = useState('2026-11-01');
  const matches = q.trim().length > 1 ? s.landlords.filter(l => (l.name + l.email).toLowerCase().includes(q.toLowerCase())) : [];
  const steps = ['Check they are new', 'Landlord details', 'Choose the plan', 'Send login email'];
  const create = () => {
    const id = 'L' + (s.landlords.length + 1) + Date.now() % 100;
    s.setLandlords(ls => [{ id, ...f, plan, start: new Date(start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), status: 'Invite sent', budget: 0, used: 0 }, ...ls]);
    s.log(`Created landlord ${f.name} on the ${plan}% plan and sent the login email`, 'Landlords');
    s.toast(`Login email sent to ${f.email}`);
    onClose(); s.go('landlords', id);
  };
  const ok1 = f.name && /@/.test(f.email) && f.phone && f.billing;
  return <Modal wide title="New landlord" sub="Only the Supervisor creates landlord accounts. Landlords do not need ID checks." onClose={onClose}
    footer={<>{step > 0 && <Btn kind="outline" onClick={() => setStep(step - 1)}>Back</Btn>}
      {step < 3 && <Btn disabled={(step === 1 && !ok1)} onClick={() => setStep(step + 1)}>{step === 0 ? 'They are new, continue' : 'Continue'}</Btn>}
      {step === 3 && <Btn icon={<Mail size={16} />} onClick={create}>Create and send login email</Btn>}</>}>
    <div className="flex" style={{ gap: 6 }}>{steps.map((t, i) => <span key={t} className={`chip ${i < step ? 'ok' : i === step ? 'brand' : 'neutral'}`}>{i + 1}. {t}</span>)}</div>
    {step === 0 && <><Field label="Search by name or email first, so there are no double records"><label className="minisearch" style={{ width: '100%', height: 42 }}><Search size={16} /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. Okafor or m.okafor@mail.co.uk" /></label></Field>
      {matches.length > 0 ? <><Note tone="warn">This landlord may already exist. Open their record instead of creating a new one.</Note>{matches.map(m => <button key={m.id} className="lrow click" onClick={() => { onClose(); s.go('landlords', m.id); }}><Avatar name={m.name} /><div className="stack grow"><b>{m.name}</b><span className="caption">{m.email} · {m.plan}% plan</span></div><Chip tone="brand">Open</Chip></button>)}</>
        : q.length > 1 ? <Note tone="ok">No match found. You can create this landlord.</Note> : <Note>Type at least two letters.</Note>}</>}
    {step === 1 && <div className="grid g2">
      <Field label="Full name"><Text value={f.name} onChange={v => setF({ ...f, name: v })} placeholder="Paul Bennett" /></Field>
      <Field label="Email (used for login)"><Text value={f.email} onChange={v => setF({ ...f, email: v })} placeholder="paul@mail.co.uk" /></Field>
      <Field label="Phone"><Text value={f.phone} onChange={v => setF({ ...f, phone: v })} placeholder="07700 900000" /></Field>
      <Field label="Office Admin in charge"><Select value={f.admin} onChange={v => setF({ ...f, admin: v })} options={ADMINS.map(a => ({ value: a.id, label: a.name }))} /></Field>
      <div style={{ gridColumn: '1/-1' }}><Field label="Billing address"><Text value={f.billing} onChange={v => setF({ ...f, billing: v })} placeholder="House, street, town, postcode" /></Field></div>
    </div>}
    {step === 2 && <><div className="grid g3">{([12, 16, 20] as Plan[]).map(p => <button key={p} className={`choice${plan === p ? ' on' : ''}`} onClick={() => setPlan(p)}><b style={{ fontSize: 20 }}>{p}%</b><span className="small">Job limit {money(PLAN[p].limit)}</span><span className="caption">Repairs above this come to you to approve.</span></button>)}</div>
      <Field label="Agreement start date"><input className="input" type="date" value={start} onChange={e => setStart(e.target.value)} /></Field>
      <Note>The plan sets the job limit and the yearly repair budget (up to 25% of fees). New rules only apply from a date.</Note></>}
    {step === 3 && <><Note tone="ok">Ready. The login email goes from LSP's Outlook. {f.name.split(' ')[0] || 'The landlord'} sets their own password and sees only their own homes.</Note>
      <div className="card flat" style={{ background: 'var(--bg-subtle)' }}><b>To: {f.email}</b><span className="small">Subject: Your Genesis landlord login</span><p style={{ margin: 0, lineHeight: 1.6 }}>Hello {f.name.split(' ')[0]},<br />Your Landlord Service Plans account is ready on the {plan}% plan from {new Date(start).toLocaleDateString('en-GB')}. Use the secure link below to set your password. The link expires in 48 hours.</p><span className="btn primary sm" style={{ alignSelf: 'flex-start' }}>Set my password</span></div></>}
  </Modal>;
}

export function AddPropertyModal({ owner, managed, onClose }: { owner: string; managed: boolean; onClose: () => void }) {
  const s = useStore();
  const [f, setF] = useState({ address: '', area: '', type: 'House' as Property['type'], beds: '3', rooms: '5', rent: '', admin: 'et' });
  const ok = f.address && f.area && (!managed || f.rent);
  return <Modal title={managed ? "Add the landlord's property" : 'Add unmanaged property'} sub={managed ? 'Saved as Managed. Shared houses (HMO) list each room.' : 'Unmanaged: contractor services only. No tenants, rent or safety plan.'} onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn icon={<Home size={16} />} disabled={!ok} onClick={() => {
      const id = 'P' + Date.now() % 10000;
      s.setProperties(ps => [{ id, address: f.address, area: f.area, type: f.type, beds: +f.beds, rooms: f.type === 'HMO' ? +f.rooms : undefined, managed, owner, rent: +f.rent || 0, status: 'Vacant', admin: f.admin, photo: 'images/home1.jpg' }, ...ps]);
      s.log(`Added ${managed ? 'managed' : 'unmanaged'} property ${f.address}`, 'Properties'); s.toast('Property added'); onClose();
    }}>Add property</Btn></>}>
    <div className="grid g2">
      <Field label="Address"><Text value={f.address} onChange={v => setF({ ...f, address: v })} placeholder="12 Oak Street" /></Field>
      <Field label="Town and postcode"><Text value={f.area} onChange={v => setF({ ...f, area: v })} placeholder="Leeds LS6" /></Field>
      <Field label="Type"><Select value={f.type} onChange={v => setF({ ...f, type: v as Property['type'] })} options={['House', 'Flat', 'HMO'].map(x => ({ value: x, label: x === 'HMO' ? 'Shared house (HMO)' : x }))} /></Field>
      {f.type === 'HMO' ? <Field label="Rooms to let"><Text value={f.rooms} onChange={v => setF({ ...f, rooms: v })} /></Field> : <Field label="Bedrooms"><Text value={f.beds} onChange={v => setF({ ...f, beds: v })} /></Field>}
      {managed && <Field label="Monthly rent (£)"><Text value={f.rent} onChange={v => setF({ ...f, rent: v })} placeholder="1150" /></Field>}
      <Field label="Office Admin"><Select value={f.admin} onChange={v => setF({ ...f, admin: v })} options={ADMINS.map(a => ({ value: a.id, label: a.name }))} /></Field>
    </div>
  </Modal>;
}

export function PaymentModal({ title, owed, onClose, onSave }: { title: string; owed: number; onClose: () => void; onSave: (amount: number, date: string, note: string) => void }) {
  const [a, setA] = useState(String(owed));
  const [d, setD] = useState('2026-10-15');
  const [n, setN] = useState('Bank transfer');
  const v = parseFloat(a) || 0;
  return <Modal title={title} sub="Check the bank first, then record what arrived. Part payments are allowed." onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn icon={<Check size={16} />} disabled={v <= 0} onClick={() => onSave(v, new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), n)}>Record payment</Btn></>}>
    <div className="grid g2"><Field label="Amount received (£)"><Text value={a} onChange={setA} /></Field><Field label="Date in the bank"><input className="input" type="date" value={d} onChange={e => setD(e.target.value)} /></Field></div>
    <Field label="Note"><Text value={n} onChange={setN} /></Field>
    {v > 0 && v < owed && <Note tone="warn">{money(owed - v)} will still be owed. It carries forward and a reminder email goes out.</Note>}
    {v >= owed && <Note tone="ok">This pays it in full.</Note>}
  </Modal>;
}

export function AssignContractorModal({ title, onClose, onPick, inspector }: { title: string; onClose: () => void; onPick: (id: string) => void; inspector?: boolean }) {
  const s = useStore();
  const [pick, setPick] = useState('');
  const list = s.contractors.filter(c => inspector ? c.type === 'Site Inspector' : c.type === 'Trade');
  return <Modal title={title} sub="Only approved contractors with certificates in date can be chosen." onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn disabled={!pick} onClick={() => onPick(pick)}>Assign</Btn></>}>
    <div className="col" style={{ gap: 8 }}>{list.map(c => { const bad = c.paused || c.certs.some(x => x.status !== 'Uploaded'); return (
      <button key={c.id} disabled={bad} className={`choice${pick === c.id ? ' on' : ''}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: bad ? .6 : 1, cursor: bad ? 'not-allowed' : 'pointer' }} onClick={() => setPick(c.id)}>
        <Avatar name={c.name} /><div className="stack grow"><b>{c.name}</b><span className="caption">{c.trade} · {c.jobs} jobs · ★ {c.rating}</span></div>
        {bad ? <Chip tone="err">Paused · certificate expired</Chip> : <Chip tone="ok">Certificates in date</Chip>}
      </button>); })}</div>
  </Modal>;
}

export const adminName = (id?: string) => staff(id)?.name ?? '—';
export { Steps };
