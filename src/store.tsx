import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import * as D from './data';
import { useLocation, useNavigate } from 'react-router-dom';

export type Route =
  | 'today' | 'team' | 'enquiries' | 'landlords' | 'lettings' | 'tenants' | 'properties' | 'signups' | 'agents'
  | 'jobs' | 'inspections' | 'approvals' | 'safety' | 'rent' | 'records' | 'support' | 'reports';

export const ROUTES: Route[] = ['today', 'team', 'enquiries', 'landlords', 'lettings', 'tenants', 'properties', 'signups', 'agents', 'jobs', 'inspections', 'approvals', 'safety', 'rent', 'records', 'support', 'reports'];
type Setter<T> = (fn: (prev: T[]) => T[]) => void;
interface Store {
  route: Route; detail: string | null; go: (r: Route, detail?: string | null) => void;
  toast: (msg: string) => void; toasts: { id: number; msg: string }[];
  log: (what: string, area: string) => void;
  landlords: D.Landlord[]; setLandlords: Setter<D.Landlord>;
  properties: D.Property[]; setProperties: Setter<D.Property>;
  enquiries: D.Enquiry[]; setEnquiries: Setter<D.Enquiry>;
  applicants: D.Applicant[]; setApplicants: Setter<D.Applicant>;
  tenants: D.Tenant[]; setTenants: Setter<D.Tenant>;
  signups: D.SignUp[]; setSignups: Setter<D.SignUp>;
  agents: D.Agent[]; setAgents: Setter<D.Agent>;
  contractors: D.Contractor[]; setContractors: Setter<D.Contractor>;
  jobs: D.Job[]; setJobs: Setter<D.Job>;
  inspections: D.Inspection[]; setInspections: Setter<D.Inspection>;
  safety: D.SafetyCert[]; setSafety: Setter<D.SafetyCert>;
  rent: D.RentRow[]; setRent: Setter<D.RentRow>;
  invoices: D.Invoice[]; setInvoices: Setter<D.Invoice>;
  tasks: D.Task[]; setTasks: Setter<D.Task>;
  activity: D.Activity[];
  locked: D.LockedRecord[]; setLocked: Setter<D.LockedRecord>;
  support: D.SupportReq[]; setSupport: Setter<D.SupportReq>;
  search: string; setSearch: (s: string) => void;
}
const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

function useList<T>(init: T[]): [T[], Setter<T>] {
  const [v, setV] = useState<T[]>(init);
  return [v, (fn) => setV(prev => fn(prev))];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const loc = useLocation(); const nav = useNavigate();
  const parts = loc.pathname.split('/').filter(Boolean);
  const route = (ROUTES.includes(parts[0] as Route) ? parts[0] : 'today') as Route;
  const detail = parts[1] ? decodeURIComponent(parts[1]) : null;
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [activity, setActivity] = useState<D.Activity[]>(D.ACTIVITY);
  const [search, setSearch] = useState('');
  const [landlords, setLandlords] = useList(D.LANDLORDS);
  const [properties, setProperties] = useList(D.PROPERTIES);
  const [enquiries, setEnquiries] = useList(D.ENQUIRIES);
  const [applicants, setApplicants] = useList(D.APPLICANTS);
  const [tenants, setTenants] = useList(D.TENANTS);
  const [signups, setSignups] = useList(D.SIGNUPS);
  const [agents, setAgents] = useList(D.AGENTS);
  const [contractors, setContractors] = useList(D.CONTRACTORS);
  const [jobs, setJobs] = useList(D.JOBS);
  const [inspections, setInspections] = useList(D.INSPECTIONS);
  const [safety, setSafety] = useList(D.SAFETY);
  const [rent, setRent] = useList(D.RENT);
  const [invoices, setInvoices] = useList(D.INVOICES);
  const [tasks, setTasks] = useList(D.TASKS);
  const [locked, setLocked] = useList(D.LOCKED);
  const [support, setSupport] = useList(D.SUPPORT);

  const go = useCallback((r: Route, d: string | null = null) => { nav('/' + r + (d ? '/' + encodeURIComponent(d) : '')); setSearch(''); window.scrollTo({ top: 0 }); }, [nav]);
  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);
  const log = useCallback((what: string, area: string) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0'), mm = String(now.getMinutes()).padStart(2, '0');
    setActivity(a => [{ id: 'H' + Date.now(), when: `Today ${hh}:${mm}`, who: 'Sarah Khan', what, area }, ...a]);
  }, []);

  const value = useMemo(() => ({
    route, detail, go, toast, toasts, log, activity, search, setSearch,
    landlords, setLandlords, properties, setProperties, enquiries, setEnquiries, applicants, setApplicants, tenants, setTenants,
    signups, setSignups, agents, setAgents, contractors, setContractors, jobs, setJobs, inspections, setInspections, safety, setSafety,
    rent, setRent, invoices, setInvoices, tasks, setTasks, locked, setLocked, support, setSupport,
  }), [route, detail, go, toasts, activity, search, landlords, properties, enquiries, applicants, tenants, signups, agents, contractors, jobs, inspections, safety, rent, invoices, tasks, locked, support]); // eslint-disable-line
  return <Ctx.Provider value={value as Store}>{children}</Ctx.Provider>;
}

// ---------- lookups ----------
export const staff = (id?: string) => D.STAFF.find(s => s.id === id);
export const money = (n: number): string => n < 0 ? '−' + money(-n) : '£' + n.toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
export function useLookups() {
  const s = useStore();
  return {
    prop: (id?: string) => s.properties.find(p => p.id === id),
    landlord: (id?: string) => s.landlords.find(l => l.id === id),
    agent: (id?: string) => s.agents.find(a => a.id === id),
    contractor: (id?: string) => s.contractors.find(c => c.id === id),
    tenant: (id?: string) => s.tenants.find(t => t.id === id),
    ownerName: (p?: D.Property) => !p ? '' : p.managed ? (s.landlords.find(l => l.id === p.owner)?.name ?? '') : (s.agents.find(a => a.id === p.owner)?.name ?? ''),
  };
}
export const rentStatus = (r: D.RentRow): { label: string; tone: D.Tone } => {
  if (r.paid >= r.amount) return { label: 'Paid', tone: 'ok' };
  const day = parseInt(r.due);
  const isNov = r.due.includes('Nov');
  const late = !isNov && day < D.RENT_LATE_DAY;
  if (r.paid > 0) return { label: late ? 'Part-paid · late' : 'Part-paid', tone: late ? 'err' : 'warn' };
  if (isNov || day > D.RENT_LATE_DAY) return { label: 'Due', tone: 'neutral' };
  if (day === D.RENT_LATE_DAY) return { label: 'Due today', tone: 'info' };
  return { label: 'Late', tone: 'err' };
};
