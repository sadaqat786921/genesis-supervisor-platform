import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useStore } from './store';
import { Sidebar, Login } from './Shell';
import { Toasts } from './ui';
import Today from './pages/Today';
import { TeamWork, Enquiries, Landlords, Lettings, Tenants } from './pages/People';
import { Properties, SignUps, Agents } from './pages/Homes';
import { Jobs, Inspections, Approvals, Safety } from './pages/Work';
import { Rent, Records, Support, Reports } from './pages/Money';

const PAGES = { today: Today, team: TeamWork, enquiries: Enquiries, landlords: Landlords, lettings: Lettings, tenants: Tenants, properties: Properties, signups: SignUps, agents: Agents, jobs: Jobs, inspections: Inspections, approvals: Approvals, safety: Safety, rent: Rent, records: Records, support: Support, reports: Reports };

const KEY = 'genesis-signed-in';
const read = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } };
const write = (v: boolean) => { try { v ? sessionStorage.setItem(KEY, '1') : sessionStorage.removeItem(KEY); } catch { /* ignore */ } };

function Platform({ onLogout }: { onLogout: () => void }) {
  const s = useStore();
  const Page = PAGES[s.route];
  return <div className="app">
    <Sidebar onLogout={onLogout} />
    <main className="content" key={s.route + (s.detail ?? '')}><Page /></main>
  </div>;
}

export default function App() {
  const [auth, setAuth] = useState(read);
  const nav = useNavigate();
  return <>
    <Routes>
      <Route path="/login" element={auth ? <Navigate to="/today" replace /> : <Login onDone={() => { write(true); setAuth(true); nav('/today'); }} />} />
      <Route path="/*" element={auth ? <Platform onLogout={() => { write(false); setAuth(false); nav('/login'); }} /> : <Navigate to="/login" replace />} />
    </Routes>
    <Toasts />
  </>;
}
