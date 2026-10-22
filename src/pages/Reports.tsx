import { useState, type ReactNode } from 'react';
import { PoundSterling, Home, Wrench, ShieldCheck, KeyRound, Wallet, FileSpreadsheet, Download, Eye, Users, FileText } from 'lucide-react';
import { useStore, useLookups, money, rentStatus, landlordBudget } from '../store';
import { JOBS_CHART, LET_STAGES, RENT_CHART, SPEND_CHART, CERT_KINDS } from '../data';
import { Avatar, Bar, Btn, Card, Chip, Kpi, Modal, Select, Tabs } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { certTone } from './tables';

type Rep = { id: string; t: string; d: string; ic: typeof PoundSterling; cols: string[]; rows: () => (string | number)[][] };

export function Reports() {
  const s = useStore(); const L = useLookups(); const [range, setRange] = useState('Last 6 months'); const [view, setView] = useState<string | null>(null); const [rentMode, setRentMode] = useState<'chart' | 'table'>('chart');
  const R = s.rent; const paid = R.reduce((a, r) => a + r.paid, 0), due = R.reduce((a, r) => a + r.amount, 0);
  const managed = s.properties.filter(p => p.managed);
  const units = managed.reduce((a, p) => a + (p.type === 'HMO' ? p.rooms ?? 1 : 1), 0);
  const let_ = s.tenants.filter(t => t.status !== 'Moved out').length;
  const onTime = Math.round(JOBS_CHART.reduce((a, x) => a + x.done, 0) / JOBS_CHART.reduce((a, x) => a + x.done + x.late, 0) * 100);
  const comp = Math.round(s.safety.filter(c => c.status === 'Valid').length / s.safety.length * 100);
  const live = s.applicants.filter(a => !a.rejected);
  const maxR = Math.max(...RENT_CHART.map(r => r.due)); const maxJ = Math.max(...JOBS_CHART.map(r => r.done + r.late)); const maxS = Math.max(...SPEND_CHART.map(r => r.v));
  const cats = [...new Set(s.jobs.map(j => j.category))].map(c => ({ c, v: s.jobs.filter(j => j.category === c).reduce((a, j) => a + j.price, 0), n: s.jobs.filter(j => j.category === c).length })).sort((a, b) => b.v - a.v);
  const maxC = Math.max(...cats.map(c => c.v), 1);
  const admins = L.admins.map(a => { const t = s.tasks.filter(x => x.admin === a.id); const late = t.filter(x => !x.done && x.late).length; return { a, open: t.filter(x => !x.done).length, late, done: t.filter(x => x.done).length, homes: s.properties.filter(p => p.admin === a.id).length, pct: t.length ? Math.round((t.length - late) / t.length * 100) : 100 }; });

  const reps: Rep[] = [
    { id: 'rent', t: 'Rent collected', d: 'Every tenant, what was due, what came in and what is late.', ic: PoundSterling, cols: ['Tenant', 'Home', 'Due', 'Rent', 'Paid', 'Status'], rows: () => R.map(r => { const t = L.tenant(r.tenant); return [t?.name ?? '', L.prop(t?.property)?.address ?? '', r.due, money(r.amount), money(r.paid), rentStatus(r).label]; }) },
    { id: 'payouts', t: 'Landlord statements', d: 'Rent in, LSP fee, repairs and what each landlord is paid.', ic: Wallet, cols: ['Landlord', 'Plan', 'Homes', 'Budget used'], rows: () => s.landlords.map(l => { const b = landlordBudget(s, l.id); return [l.name, l.plan + '%', b.props.length, b.budget ? `${b.pct}%` : '—']; }) },
    { id: 'jobs', t: 'Repairs and spend', d: 'Every job, contractor, price and margin.', ic: Wrench, cols: ['Job', 'Home', 'Contractor', 'Price', 'Margin', 'Status'], rows: () => s.jobs.map(j => [j.title, L.prop(j.property)?.address ?? '', L.contractor(j.contractor)?.name ?? '—', j.price ? money(j.price) : '—', j.price ? money(j.price - j.cost) : '—', j.status]) },
    { id: 'budgets', t: 'Repair budgets', d: 'Each property’s yearly budget and the alerts sent.', ic: Wallet, cols: ['Property', 'Landlord', 'Budget', 'Used', 'Used %'], rows: () => managed.filter(p => p.budget).map(p => [p.address, L.ownerName(p), money(p.budget), money(p.used), Math.round(p.used / p.budget * 100) + '%']) },
    { id: 'safety', t: 'Safety and compliance', d: 'Every certificate: done, ends, status.', ic: ShieldCheck, cols: ['Home', 'Certificate', 'Done', 'Ends', 'Status'], rows: () => s.safety.map(c => [L.prop(c.property)?.address ?? '', c.kind, c.issued ?? '—', c.issued ? c.expires : '—', c.status]) },
    { id: 'lettings', t: 'Lettings', d: 'Applicants at each step and who looks after them.', ic: KeyRound, cols: ['Applicant', 'Home', 'Step', 'Office Admin', 'Applied'], rows: () => s.applicants.map(a => [a.name, L.prop(a.property)?.address ?? '', a.rejected ? 'Not going ahead' : LET_STAGES[a.stage], L.admins.find(x => x.id === a.admin)?.name ?? '—', a.applied]) },
    { id: 'tenants', t: 'Tenants', d: 'Live, moving out and moved out tenants with tenancy dates.', ic: Users, cols: ['Tenant', 'Home', 'Start', 'End', 'Status'], rows: () => s.tenants.map(t => [t.name, L.prop(t.property)?.address ?? '', t.start, t.end, t.status]) },
    { id: 'team', t: 'Team work', d: 'Tasks done, open and late for each Office Admin.', ic: Users, cols: ['Office Admin', 'Homes', 'Open', 'Late', 'Done', 'On time'], rows: () => admins.map(x => [x.a.name, x.homes, x.open, x.late, x.done, x.pct + '%']) },
    { id: 'audit', t: 'Audit history', d: 'Everything that happened, with date and time.', ic: FileText, cols: ['Date and time', 'Who', 'What', 'Area'], rows: () => s.activity.map(a => [a.at, a.who, a.what, a.area]) },
  ];
  const dl = (r: Rep, kind: 'Excel' | 'PDF') => { s.toast(`${r.t} (${range}) downloaded as ${kind}`); s.log(`Downloaded ${r.t} report (${kind}, ${range})`, 'Reports'); };
  const rep = reps.find(r => r.id === view);

  return <>
    <PageHeader crumbs={crumbsFor('reports', s.go)} title="Reports" action={<div className="flex"><div style={{ width: 170 }}><Select value={range} onChange={setRange} options={['This month', 'Last 3 months', 'Last 6 months', 'This year'].map(x => ({ value: x, label: x }))} /></div><Btn icon={<Download size={16} />} onClick={() => { s.toast(`Full pack (${range}) downloaded as PDF`); s.log(`Downloaded full report pack (${range})`, 'Reports'); }}>Download all</Btn></div>} />
    <div className="grid g3">
      <Kpi icon={<PoundSterling size={18} />} tone="ok" label="Rent collected" value={Math.round(paid / due * 100) + '%'} caption={`${money(paid)} of ${money(due)} in October`} spark="M0 16 L16 12 L32 13 L48 9 L64 7 L80 6" onClick={() => setView('rent')} />
      <Kpi icon={<Home size={18} />} tone="brand" label="Homes and rooms let" value={Math.round(let_ / units * 100) + '%'} caption={`${let_} of ${units} lettable units`} spark="M0 12 L16 11 L32 9 L48 10 L64 7 L80 6" onClick={() => setView('tenants')} />
      <Kpi icon={<Wrench size={18} />} tone="info" label="Jobs done on time" value={onTime + '%'} caption={`${JOBS_CHART.reduce((a, x) => a + x.done, 0)} jobs in 6 months`} spark="M0 10 L16 8 L32 12 L48 7 L64 6 L80 5" onClick={() => setView('jobs')} />
      <Kpi icon={<ShieldCheck size={18} />} tone={comp >= 85 ? 'ok' : 'warn'} label="Compliance score" value={comp + '%'} caption={`${s.safety.filter(c => ['Overdue', 'Missing'].includes(c.status)).length} certificates need action`} onClick={() => setView('safety')} />
      <Kpi icon={<KeyRound size={18} />} tone="brand" label="Days to let" value="18" caption={`${live.filter(a => a.stage < 6).length} applicants in progress`} onClick={() => setView('lettings')} />
      <Kpi icon={<Wallet size={18} />} tone="warn" label="Repair spend" value={'£' + SPEND_CHART[SPEND_CHART.length - 1].v + 'k'} caption="this month, approved jobs" spark="M0 14 L16 9 L32 15 L48 6 L64 8 L80 13" onClick={() => setView('budgets')} />
    </div>
    <div className="row">
      <Card title="Rent collected vs due" sub="£ thousands per month" className="grow" action={<Tabs value={rentMode} onChange={setRentMode} items={[{ id: 'chart', label: 'Chart' }, { id: 'table', label: 'Table' }]} />}>
        {rentMode === 'chart' ? <><div className="gbars">{RENT_CHART.map((r, i) => <div key={r.m} className="gb"><div className="gb-pair"><i className="due" style={{ height: `${r.due / maxR * 100}%` }} title={`Due £${r.due}k`} /><i className={`got${i === RENT_CHART.length - 1 ? ' now' : ''}`} style={{ height: `${r.v / maxR * 100}%` }} title={`Collected £${r.v}k`} /></div><b className="caption">{Math.round(r.v / r.due * 100)}%</b><span className="caption">{r.m}</span></div>)}</div>
          <div className="flex" style={{ gap: 14 }}><span className="legend"><i className="lg-due" />Due</span><span className="legend"><i className="lg-got" />Collected</span></div></>
          : <table className="t"><thead><tr><th>Month</th><th>Due</th><th>Collected</th><th>Rate</th></tr></thead><tbody>{RENT_CHART.map(r => <tr key={r.m} style={{ cursor: 'default' }}><td className="strong">{r.m}</td><td>£{r.due}k</td><td>£{r.v}k</td><td>{Math.round(r.v / r.due * 100)}%</td></tr>)}</tbody></table>}
      </Card>
      <Card title="Lettings funnel" sub="Applicants at each step right now" style={{ width: 380, flex: 'none' }}>
        <div className="funnel">{LET_STAGES.map((st, i) => { const n = live.filter(a => a.stage === i).length; return <button key={st} className="fn" onClick={() => s.go('lettings')}><span className="caption">{st}</span><div className="fn-bar"><i style={{ width: `${Math.max(6, n / Math.max(1, ...LET_STAGES.map((_, k) => live.filter(a => a.stage === k).length)) * 100)}%` }} /></div><b>{n}</b></button>; })}</div>
        <span className="caption">{s.applicants.filter(a => a.rejected).length} not going ahead · average 18 days from applied to moved in</span>
      </Card>
    </div>
    <div className="row">
      <Card title="Jobs finished" sub="On time and late, per month" className="grow">
        <div className="sbars">{JOBS_CHART.map(r => <div key={r.m} className="sb"><b className="caption">{r.done + r.late}</b><div className="sb-col" style={{ height: `${(r.done + r.late) / maxJ * 100}%` }}><i className="late" style={{ flex: r.late }} /><i className="ok" style={{ flex: r.done }} /></div><span className="caption">{r.m}</span></div>)}</div>
        <div className="flex" style={{ gap: 14 }}><span className="legend"><i className="lg-ok" />On time</span><span className="legend"><i className="lg-warn" />Late</span></div>
      </Card>
      <Card title="Repair spend by type" sub="All jobs on Genesis" className="grow">
        <div className="hbars">{cats.map(c => <div key={c.c} className="hb"><span className="small" style={{ width: 110 }}>{c.c}</span><div className="hb-bar"><i style={{ width: `${c.v / maxC * 100}%` }} /></div><b className="small" style={{ width: 70, textAlign: 'right' }}>{money(c.v)}</b></div>)}</div>
        <div className="flex between"><span className="caption">Monthly spend (£k)</span><div className="minibars">{SPEND_CHART.map(x => <i key={x.m} title={`${x.m} £${x.v}k`} style={{ height: `${x.v / maxS * 100}%` }} />)}</div></div>
      </Card>
    </div>
    <div className="row">
      <Card title="Compliance by certificate" sub="How many of each are in date" className="grow">
        <div className="col" style={{ gap: 12 }}>{CERT_KINDS.map(k => { const cs = s.safety.filter(c => c.kind === k); return <div key={k} className="stack" style={{ gap: 6 }}><span className="flex between"><b className="small" style={{ color: 'var(--text-primary)' }}>{k}</b><span className="caption">{cs.filter(c => c.status === 'Valid').length} of {cs.length} in date</span></span>
          <div className="stackbar">{(['Valid', 'Due soon', 'Booked', 'Proof to check', 'Overdue', 'Missing'] as const).map(st => { const n = cs.filter(c => c.status === st).length; return n ? <i key={st} className={`c-${certTone(st)}`} style={{ flex: n }} title={`${st}: ${n}`} /> : null; })}</div></div>; })}</div>
        <Btn sm kind="ghost" onClick={() => s.go('safety')}>Open Compliance Centre</Btn>
      </Card>
      <Card title="Team performance" sub="Tasks per Office Admin" className="grow">
        <table className="t"><thead><tr><th>Office Admin</th><th>Homes</th><th>Open</th><th>Late</th><th>On time</th></tr></thead><tbody>
          {admins.map(x => <tr key={x.a.id} onClick={() => s.go('team', x.a.id)}><td><span className="cell"><Avatar id={x.a.id} />{x.a.name}</span></td><td>{x.homes}</td><td>{x.open}</td><td>{x.late ? <Chip tone="warn">{x.late}</Chip> : '0'}</td><td><div className="flex" style={{ minWidth: 110 }}><Bar value={x.pct} tone={x.pct >= 80 ? 'ok' : 'warn'} /><b className="small">{x.pct}%</b></div></td></tr>)}
        </tbody></table>
      </Card>
    </div>
    <Card title="Report library" sub={`Open any report to see the data, then download it as Excel or PDF. Showing: ${range}.`}>
      <div className="replist">{reps.map(r => <div key={r.id} className="rep"><span className="tile t-brand"><r.ic size={16} /></span><div className="stack grow"><b>{r.t}</b><span className="caption">{r.d}</span></div><span className="caption">{r.rows().length} rows</span>
        <Btn sm kind="ghost" icon={<Eye size={14} />} onClick={() => setView(r.id)}>View</Btn><Btn sm kind="outline" icon={<FileSpreadsheet size={14} />} onClick={() => dl(r, 'Excel')}>Excel</Btn><Btn sm kind="outline" icon={<Download size={14} />} onClick={() => dl(r, 'PDF')}>PDF</Btn></div>)}</div>
    </Card>
    {rep && <Modal wide title={rep.t} sub={`${rep.d} · ${range}`} onClose={() => setView(null)} footer={<><Btn kind="outline" icon={<FileSpreadsheet size={16} />} onClick={() => dl(rep, 'Excel')}>Excel</Btn><Btn icon={<Download size={16} />} onClick={() => dl(rep, 'PDF')}>PDF</Btn></>}>
      <div className="tablewrap" style={{ margin: 0, maxHeight: 420, overflowY: 'auto' }}><table className="t"><thead><tr>{rep.cols.map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{rep.rows().map((row, i) => <tr key={i} style={{ cursor: 'default' }}>{row.map((v, k) => <td key={k} className={k === 0 ? 'strong' : undefined}>{v as ReactNode}</td>)}</tr>)}</tbody></table></div>
    </Modal>}
  </>;
}
