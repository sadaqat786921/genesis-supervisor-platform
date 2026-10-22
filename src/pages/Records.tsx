import { useEffect, useState } from 'react';
import { History, Lock, LockOpen, Eye, Download, Clock, XCircle, ShieldAlert, CalendarDays, Users } from 'lucide-react';
import { useStore } from '../store';
import { TODAY_LABEL, nowStamp, parseDate } from '../data';
import { Avatar, Btn, Card, Chip, Drawer, Field, Kpi, MiniSearch, Modal, Note, Reason, Select, Tabs, Timeline, Empty } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';

/* ================= RECORDS & HISTORY ================= */
export function Records() {
  const s = useStore(); const [tab, setTab] = useState<'activity' | 'locked'>('activity'); const [q, setQ] = useState(''); const [area, setArea] = useState('all'); const [who, setWho] = useState('all'); const [day, setDay] = useState('all');
  const [unlock, setUnlock] = useState<string | null>(null); const [open, setOpen] = useState<string | null>(null);
  const A = [...s.activity].sort((a, b) => parseDate(b.at).getTime() - parseDate(a.at).getTime());
  const areas = [...new Set(A.map(a => a.area))]; const people = [...new Set(A.map(a => a.who))];
  const acts = A.filter(a => (area === 'all' || a.area === area) && (who === 'all' || a.who === who) && (day === 'all' || (day === 'today' ? a.at.startsWith(TODAY_LABEL) : !a.at.startsWith(TODAY_LABEL))) && (a.what + a.who).toLowerCase().includes(q.toLowerCase()));
  const days = [...new Set(acts.map(a => a.at.split(', ')[0]))];
  return <>
    <PageHeader crumbs={crumbsFor('records', s.go)} title="Records & History" action={<Btn kind="outline" icon={<Download size={16} />} onClick={() => { s.toast('History downloaded as Excel'); s.log('Downloaded the activity log', 'Records'); }}>Download history</Btn>} />
    <div className="grid g4">
      <Kpi icon={<CalendarDays size={18} />} tone="brand" label="Actions today" value={A.filter(a => a.at.startsWith(TODAY_LABEL)).length} caption={TODAY_LABEL} active={day === 'today'} onClick={() => { setTab('activity'); setDay('today'); }} />
      <Kpi icon={<History size={18} />} tone="info" label="All actions" value={A.length} caption="kept forever" active={day === 'all' && tab === 'activity'} onClick={() => { setTab('activity'); setDay('all'); }} />
      <Kpi icon={<Users size={18} />} tone="neutral" label="People" value={people.length} caption="staff, tenants and partners" />
      <Kpi icon={<Lock size={18} />} tone="ok" label="Locked records" value={s.locked.length} caption="reports and finished jobs" active={tab === 'locked'} onClick={() => setTab('locked')} />
    </div>
    <Tabs value={tab} onChange={setTab} items={[{ id: 'activity', label: 'Audit history', count: s.activity.length }, { id: 'locked', label: 'Locked records', count: s.locked.length }]} />
    {tab === 'activity' ? <Card title="Audit history" sub="Everything anyone does is saved with the date, time and who did it."
      action={<div className="toolbar"><MiniSearch value={q} onChange={setQ} placeholder="Search history" /><div style={{ width: 150 }}><Select value={day} onChange={setDay} options={[{ value: 'all', label: 'Any day' }, { value: 'today', label: 'Today' }, { value: 'earlier', label: 'Earlier' }]} /></div><div style={{ width: 170 }}><Select value={area} onChange={setArea} options={[{ value: 'all', label: 'All areas' }, ...areas.map(a => ({ value: a, label: a }))]} /></div><div style={{ width: 170 }}><Select value={who} onChange={setWho} options={[{ value: 'all', label: 'Anyone' }, ...people.map(a => ({ value: a, label: a }))]} /></div></div>}>
      <div className="tablewrap"><table className="t"><thead><tr><th style={{ width: 130 }}>Date</th><th style={{ width: 80 }}>Time</th><th>What happened</th><th>Who</th><th>Area</th></tr></thead>
        {days.map(d => <tbody key={d}>
          <tr className="dayrow"><td colSpan={5}>{d === TODAY_LABEL ? `Today · ${d}` : d === '14 Oct 2026' ? `Yesterday · ${d}` : d}</td></tr>
          {acts.filter(a => a.at.startsWith(d + ',')).map(a => <tr key={a.id} style={{ cursor: 'default' }}><td>{d}</td><td><b>{a.at.split(', ')[1]}</b></td><td className="strong">{a.what}</td><td><span className="cell"><Avatar name={a.who} />{a.who}</span></td><td><Chip tone="neutral" dot={false}>{a.area}</Chip></td></tr>)}
        </tbody>)}
      </table>{!acts.length && <Empty icon={<History size={22} />}>Nothing found.</Empty>}</div></Card>
      : <Card title="Locked records" sub="Finished jobs and inspection reports can't be changed. Unlocking needs a reason, and the old version is always kept.">
        <div className="tablewrap"><table className="t"><thead><tr><th>Record</th><th>Type</th><th>Locked on</th><th>Locked by</th><th>Earlier versions</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead><tbody>
          {s.locked.map(r => <tr key={r.id} onClick={() => setOpen(r.id)}><td><span className="cell"><span className="tile t-ok" style={{ width: 32, height: 32 }}><Lock size={15} /></span><b className="strong">{r.title}</b></span></td><td>{r.kind}</td><td>{r.locked}</td><td>{r.by}</td><td>{r.versions.length ? <Chip tone="info">{r.versions.length} kept</Chip> : <span className="muted">None</span>}</td>
            <td onClick={e => e.stopPropagation()}><div className="flex" style={{ justifyContent: 'flex-end' }}><Btn sm kind="ghost" icon={<Eye size={14} />} onClick={() => setOpen(r.id)}>Versions</Btn><Btn sm kind="outline" icon={<LockOpen size={14} />} onClick={() => setUnlock(r.id)}>Unlock</Btn></div></td></tr>)}
        </tbody></table></div></Card>}
    {unlock && <Reason title="Unlock this record" sub="Say why. The current version is saved before anything changes." cta="Unlock" placeholder="e.g. Meter reading typed wrong" onClose={() => setUnlock(null)} onDone={r => { const rec = s.locked.find(x => x.id === unlock)!; s.setLocked(ls => ls.map(x => x.id === unlock ? { ...x, versions: [{ when: nowStamp(), who: 'Sarah Khan', reason: r }, ...x.versions] } : x)); s.log(`Unlocked "${rec.title}": ${r}. Old version kept.`, 'Records'); s.toast('Unlocked. Old version saved. It locks again after the edit.'); setUnlock(null); }} />}
    {open && (() => { const r = s.locked.find(x => x.id === open)!; return <Drawer title={r.title} sub={`${r.kind} · locked ${r.locked}`} onClose={() => setOpen(null)} footer={<Btn kind="outline" icon={<LockOpen size={16} />} onClick={() => { setOpen(null); setUnlock(r.id); }}>Unlock with a reason</Btn>}>
      <Card className="flat" title="Versions"><Timeline items={[{ at: r.locked, text: `Current version · locked by ${r.by}`, tone: 'ok' as const }, ...r.versions.map((v, i) => ({ at: v.when, text: `Version ${r.versions.length - i} · unlocked by ${v.who}: ${v.reason}` }))]} /></Card>
      {!r.versions.length && <Note>Never unlocked.</Note>}</Drawer>; })()}
  </>;
}

/* ================= SUPPORT ACCESS ================= */
export function Support() {
  const s = useStore(); const [allow, setAllow] = useState<string | null>(null); const [hours, setHours] = useState('2'); const [refuse, setRefuse] = useState<string | null>(null); const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick(x => x + 1), 1000); return () => clearInterval(t); }, []);
  const left = (u?: number) => { if (!u) return ''; const ms = u - Date.now(); if (ms <= 0) return 'ending'; const h = Math.floor(ms / 36e5), m = Math.floor(ms / 6e4) % 60, sec = Math.floor(ms / 1000) % 60; return `${h}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`; };
  return <>
    <PageHeader crumbs={crumbsFor('support', s.go)} title="Support Access" />
    <Note>The Genesis tech team can only look at your data if you allow it, for a set time. Only the Supervisor and Company Admin can allow access. Everything they open is logged with the date and time.</Note>
    {s.support.map(r => <Card key={r.id} title={r.from} sub={`Asked ${r.asked}`} action={<Chip tone={r.status === 'Allowed' ? 'ok' : r.status === 'Waiting' ? 'warn' : r.status === 'Refused' ? 'err' : 'neutral'}>{r.status}</Chip>}>
      <p style={{ margin: 0, lineHeight: 1.6 }}>“{r.reason}”</p>
      {r.status === 'Allowed' && <div className="flex between" style={{ background: 'var(--ok-bg)', borderRadius: 12, padding: '12px 16px' }}><span className="flex"><Clock size={16} /> Access ends in <b>{left(r.until)}</b></span><Btn sm kind="danger" icon={<XCircle size={14} />} onClick={() => { s.setSupport(ss => ss.map(x => x.id === r.id ? { ...x, status: 'Ended', looks: [...x.looks, `${nowStamp()} · Stopped by Sarah Khan`] } : x)); s.log(`Stopped support access for ${r.from}`, 'Support Access'); s.toast('Access stopped now'); }}>Stop now</Btn></div>}
      {r.status === 'Waiting' && <div className="flex"><Btn kind="outline" onClick={() => setRefuse(r.id)}>Refuse</Btn><Btn icon={<ShieldAlert size={16} />} onClick={() => setAllow(r.id)}>Allow for a set time</Btn></div>}
      {r.looks.length > 0 && <div className="stack" style={{ gap: 6 }}><b className="small">What they looked at</b><Timeline items={r.looks.map(l => { const [at, ...rest] = l.split(' · '); return { at, text: rest.join(' · ') || at }; })} /></div>}
    </Card>)}
    {allow && <Modal title="Allow support access" sub="Access ends by itself when the time runs out." onClose={() => setAllow(null)} footer={<><Btn kind="outline" onClick={() => setAllow(null)}>Cancel</Btn><Btn onClick={() => { s.setSupport(ss => ss.map(x => x.id === allow ? { ...x, status: 'Allowed', until: Date.now() + +hours * 36e5, looks: [`${nowStamp()} · Access allowed for ${hours} hour(s)`, `${nowStamp()} · Opened Rent & Invoices`] } : x)); s.log(`Allowed support access for ${hours} hour(s)`, 'Support Access'); s.toast(`Access allowed for ${hours} hour(s)`); setAllow(null); }}>Allow</Btn></>}>
      <Field label="For how long"><Select value={hours} onChange={setHours} options={[['1', '1 hour'], ['2', '2 hours'], ['4', '4 hours'], ['24', '24 hours']].map(([v, l]) => ({ value: v, label: l }))} /></Field>
    </Modal>}
    {refuse && <Reason danger title="Refuse access" cta="Refuse" onClose={() => setRefuse(null)} onDone={r => { s.setSupport(ss => ss.map(x => x.id === refuse ? { ...x, status: 'Refused', looks: [`${nowStamp()} · Refused: ${r}`] } : x)); s.log(`Refused support access: ${r}`, 'Support Access'); s.toast('Access refused'); setRefuse(null); }} />}
  </>;
}
