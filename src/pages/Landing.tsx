import { useEffect, useState } from 'react';
import { Home, PoundSterling, Wrench, ShieldCheck, KeyRound, ClipboardCheck, ArrowRight, Check, Phone, Mail, MapPin, Clock, Sparkles, Users, Building2, HardHat, Menu, X, BellRing, Star, LineChart, Send, CircleCheck } from 'lucide-react';

const NAV = [['services', 'Services'], ['plans', 'Plans'], ['how', 'How it works'], ['about', 'About'], ['contact', 'Contact']] as const;

const SERVICES = [
  { ic: Home, t: 'Full management', d: 'We look after your home from tenant to keys back, so you don’t have to take the calls.' },
  { ic: PoundSterling, t: 'Rent collection', d: 'Rent checked against the bank every month. Late payers get reminders and a call.' },
  { ic: Wrench, t: 'Repairs that get done', d: 'Vetted contractors, photo proof of every job, and nothing over your limit without your OK.' },
  { ic: ShieldCheck, t: 'Safety and compliance', d: 'Gas, electrical, EPC, fire alarms and HMO licences tracked and booked before they end.' },
  { ic: KeyRound, t: 'Lettings and tenant find', d: 'Listed on Rightmove and Zoopla, ID and right to rent checks, referencing and move-in.' },
  { ic: ClipboardCheck, t: 'Inspections', d: 'Move-in, routine and move-out reports with dated photos and meter readings.' },
];

const PLANS = [
  { p: 12, limit: 150, t: 'Essential', d: 'For landlords who like to stay close to every decision.', f: ['Rent collection and reminders', 'Safety checks tracked', 'Repairs up to £150 without asking you', 'Monthly statement'] },
  { p: 16, limit: 200, t: 'Complete', d: 'Our most chosen plan. Hands-off, with full visibility.', f: ['Everything in Essential', 'Tenant find and referencing', 'Repairs up to £200 without asking you', 'Routine inspections with photos', 'Landlord portal'], top: true },
  { p: 20, limit: 300, t: 'Premium', d: 'For portfolios and shared houses that need the most care.', f: ['Everything in Complete', 'HMO licence management', 'Repairs up to £300 without asking you', 'Named Office Admin', 'Priority emergency response'] },
];

const STEPS = [
  { t: 'Tell us about your homes', d: 'A short call with our team. We check what you have and what you need.' },
  { t: 'Pick your plan', d: '12%, 16% or 20% of the rent. Your plan sets the repair limit and yearly repair budget.' },
  { t: 'We take over', d: 'Tenants, rent, repairs and safety checks move to us. You get your own login.' },
  { t: 'You see everything', d: 'Statements, approvals and certificates in one place, any time you want to look.' },
];

function ComingSoon({ onClose, what }: { onClose: () => void; what: string }) {
  const [email, setEmail] = useState(''); const [done, setDone] = useState(false);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return <div className="modal-scrim" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="modal lp-soon" role="dialog" aria-label="Coming soon">
      <button className="lp-x" onClick={onClose} aria-label="Close"><X size={18} /></button>
      <span className="lp-soon-ic"><Sparkles size={26} /></span>
      <span className="lp-eyebrow" style={{ alignSelf: 'center' }}>Coming soon</span>
      <h2>{what} is almost ready</h2>
      <p>Landlord, tenant, client and contractor portals open soon. Leave your email and we&rsquo;ll tell you the day it goes live.</p>
      {done ? <div className="note ok" style={{ justifyContent: 'center' }}><Check size={16} /><span>Thanks. We&rsquo;ll email {email} when it&rsquo;s ready.</span></div>
        : <form className="lp-notify" onSubmit={e => { e.preventDefault(); if (/@/.test(email)) setDone(true); }}><input className="input" type="email" placeholder="you@email.co.uk" value={email} onChange={e => setEmail(e.target.value)} aria-label="Email" /><button className="btn primary" type="submit"><BellRing size={16} />Notify me</button></form>}
      <div className="lp-portals">{[[Building2, 'Landlords'], [Users, 'Tenants'], [Home, 'Clients'], [HardHat, 'Contractors']].map(([Ic, t]) => { const I = Ic as typeof Home; return <span key={t as string}><I size={14} />{t as string}</span>; })}</div>
    </div>
  </div>;
}

export default function Landing() {
  const [soon, setSoon] = useState<'' | 'Log in' | 'Sign up'>('');
  const [menu, setMenu] = useState(false); const [scrolled, setScrolled] = useState(false);
  const [f, setF] = useState({ name: '', email: '', phone: '', who: 'Landlord', homes: '1', msg: '' }); const [sent, setSent] = useState(false);
  useEffect(() => { const s = () => setScrolled(window.scrollY > 10); s(); window.addEventListener('scroll', s); return () => window.removeEventListener('scroll', s); }, []);
  const to = (id: string) => { setMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return <div className="lp">
    <header className={`lp-head${scrolled ? ' on' : ''}`}>
      <div className="lp-wrap lp-head-in">
        <button className="lp-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Landlord Service Plans home"><img src="images/logo.svg" alt="Landlord Service Plans" /></button>
        <nav className={`lp-nav${menu ? ' open' : ''}`}>{NAV.map(([id, l]) => <button key={id} onClick={() => to(id)}>{l}</button>)}
          <div className="lp-nav-cta"><button className="btn line" onClick={() => setSoon('Log in')}>Log in</button><button className="btn primary" onClick={() => setSoon('Sign up')}>Sign up</button></div></nav>
        <div className="lp-head-cta"><button className="btn line" onClick={() => setSoon('Log in')}>Log in</button><button className="btn primary" onClick={() => setSoon('Sign up')}>Sign up</button></div>
        <button className="lp-burger" onClick={() => setMenu(m => !m)} aria-label="Menu">{menu ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
    </header>

    {/* HERO */}
    <section className="lp-hero">
      <div className="lp-wrap lp-hero-in">
        <div className="lp-hero-txt">
          <span className="lp-pill"><span className="lp-dot" />Property management for Leeds, Bradford and Wakefield</span>
          <h1>Your rental homes, <span>looked after properly.</span></h1>
          <p>Rent collected, repairs approved, safety checks on time. One trusted team and one clear platform, so you always know what&rsquo;s happening in your homes.</p>
          <div className="lp-hero-cta"><button className="btn accent lp-big" onClick={() => to('contact')}>Get a free plan review <ArrowRight size={18} /></button><button className="btn lp-ghost lp-big" onClick={() => to('plans')}>See our plans</button></div>
          <div className="lp-trust">{['No setup fee', 'Cancel with 2 months notice', 'Every action logged'].map(t => <span key={t}><CircleCheck size={16} />{t}</span>)}</div>
        </div>
        <div className="lp-hero-art">
          <div className="lp-hero-photo" style={{ backgroundImage: 'url(images/home3.jpg)' }} />
          <div className="lp-float f1"><span className="tile t-ok"><PoundSterling size={18} /></span><div><b>94%</b><span>rent collected this month</span></div></div>
          <div className="lp-float f2"><span className="tile t-brand"><Wrench size={18} /></span><div><b>Boiler repair approved</b><span>QuickPlumb · photo proof uploaded</span></div></div>
          <div className="lp-float f3"><ShieldCheck size={18} color="#5BAF00" /><div><b>Gas certificate</b><span>In date until Apr 2027</span></div></div>
        </div>
      </div>
      <div className="lp-wrap"><div className="lp-stats">{[['184', 'homes looked after'], ['96%', 'rent collected on time'], ['24h', 'emergency repair response'], ['100%', 'safety certificates tracked']].map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}</div></div>
    </section>

    {/* SERVICES */}
    <section className="lp-sec" id="services">
      <div className="lp-wrap">
        <div className="lp-title"><span className="lp-eyebrow">Services</span><h2>Everything a rental home needs, in one plan</h2><p>From the first viewing to the last meter reading, our team handles it and you can see it all.</p></div>
        <div className="lp-svc">{SERVICES.map(s => <div key={s.t} className="lp-card"><span className="lp-ic"><s.ic size={22} /></span><h3>{s.t}</h3><p>{s.d}</p></div>)}</div>
        <div className="lp-band"><div><span className="lp-eyebrow">For letting agents</span><h3>Need repairs at homes you manage?</h3><p>Send a job, get a quote, approve it and receive one clear invoice. Contractor costs stay with us.</p></div><button className="btn primary lp-big" onClick={() => to('contact')}>Talk to our team <ArrowRight size={18} /></button></div>
      </div>
    </section>

    {/* PLANS */}
    <section className="lp-sec lp-alt" id="plans">
      <div className="lp-wrap">
        <div className="lp-title"><span className="lp-eyebrow">Plans</span><h2>Simple plans. A fee of the rent, nothing hidden.</h2><p>Your plan sets how much we can spend on a repair without asking you first. Anything above comes to you to approve.</p></div>
        <div className="lp-plans">{PLANS.map(pl => <div key={pl.p} className={`lp-plan${pl.top ? ' top' : ''}`}>
          {pl.top && <span className="lp-badge"><Star size={12} fill="currentColor" />Most chosen</span>}
          <span className="lp-plan-name">{pl.t}</span>
          <div className="lp-price"><b>{pl.p}%</b><span>of monthly rent</span></div>
          <p>{pl.d}</p>
          <div className="lp-limit"><Wrench size={15} />Repair limit <b>£{pl.limit}</b></div>
          <ul>{pl.f.map(x => <li key={x}><Check size={16} />{x}</li>)}</ul>
          <button className={`btn ${pl.top ? 'accent' : 'line'} lp-big`} onClick={() => to('contact')}>Choose {pl.t}</button>
        </div>)}</div>
        <p className="lp-small">Every plan includes a yearly repair budget for each home, with alerts to you at 70%, 90% and 100%.</p>
      </div>
    </section>

    {/* HOW */}
    <section className="lp-sec" id="how">
      <div className="lp-wrap">
        <div className="lp-title"><span className="lp-eyebrow">How it works</span><h2>Moving to LSP takes about two weeks</h2></div>
        <div className="lp-steps">{STEPS.map((s, i) => <div key={s.t} className="lp-step"><span className="lp-num">{i + 1}</span><h3>{s.t}</h3><p>{s.d}</p></div>)}</div>
      </div>
    </section>

    {/* PLATFORM */}
    <section className="lp-sec lp-dark">
      <div className="lp-wrap lp-plat">
        <div className="lp-plat-txt">
          <span className="lp-eyebrow light">The Genesis platform</span>
          <h2>See everything. Approve anything. From anywhere.</h2>
          <p>Our team runs your homes on Genesis. Soon you&rsquo;ll have your own login to see rent, repairs, certificates and statements as they happen.</p>
          <ul>{[[LineChart, 'Live rent and repair budget'], [ShieldCheck, 'Every certificate with its end date'], [Wrench, 'Approve repairs over your limit in one tap'], [ClipboardCheck, 'Inspection reports with dated photos']].map(([Ic, t]) => { const I = Ic as typeof Home; return <li key={t as string}><span><I size={16} /></span>{t as string}</li>; })}</ul>
          <div className="lp-hero-cta"><button className="btn accent lp-big" onClick={() => setSoon('Log in')}>Landlord login <span className="lp-soon-chip">Soon</span></button><button className="btn lp-ghost lp-big" onClick={() => setSoon('Sign up')}>Tenant portal <span className="lp-soon-chip">Soon</span></button></div>
        </div>
        <div className="lp-shot"><div className="lp-shot-bar"><i /><i /><i /><span>genesis.lsp.co.uk</span></div><img src="images/app-preview.jpg" alt="The Genesis dashboard" /></div>
      </div>
    </section>

    {/* ABOUT */}
    <section className="lp-sec" id="about">
      <div className="lp-wrap lp-about">
        <div className="lp-about-pics"><div style={{ backgroundImage: 'url(images/home1.jpg)' }} /><div style={{ backgroundImage: 'url(images/home2.jpg)' }} /></div>
        <div>
          <span className="lp-eyebrow">About LSP</span>
          <h2>A local team that treats your homes like their own</h2>
          <p>Landlord Service Plans manages homes and shared houses across West Yorkshire. Each landlord has a named Office Admin, every repair is checked with photos, and every action is saved, so nothing gets lost and nothing is hidden.</p>
          <div className="lp-values">{[['Clear', 'Plain monthly statements and no surprise bills.'], ['Careful', 'Vetted, insured contractors with documents in date.'], ['Compliant', 'Certificates booked before they end, not after.'], ['Close', 'A real person who knows your homes by name.']].map(([t, d]) => <div key={t}><b>{t}</b><span>{d}</span></div>)}</div>
        </div>
      </div>
    </section>

    {/* CONTACT */}
    <section className="lp-sec lp-alt" id="contact">
      <div className="lp-wrap lp-contact">
        <div className="lp-contact-info">
          <span className="lp-eyebrow">Contact</span>
          <h2>Let&rsquo;s talk about your homes</h2>
          <p>Tell us a little about your property. We&rsquo;ll call you back within one working day with a free plan review.</p>
          <div className="lp-ci">{[[Phone, 'Call us', '0113 496 0000'], [Mail, 'Email', 'hello@lsp.co.uk'], [MapPin, 'Office', '40 Park Square, Leeds LS1 2NP'], [Clock, 'Opening hours', 'Mon–Fri 9:00–17:30 · emergencies 24/7']].map(([Ic, k, v]) => { const I = Ic as typeof Home; return <div key={k as string}><span className="tile t-brand"><I size={18} /></span><div><span>{k as string}</span><b>{v as string}</b></div></div>; })}</div>
        </div>
        <div className="lp-form card">
          {sent ? <div className="lp-sent"><span className="lp-soon-ic ok"><Check size={26} /></span><h3>Thanks, {f.name.split(' ')[0] || 'we got it'}!</h3><p>Someone from our team will call you on {f.phone || 'the number you gave'} within one working day.</p><button className="btn line" onClick={() => { setSent(false); setF({ name: '', email: '', phone: '', who: 'Landlord', homes: '1', msg: '' }); }}>Send another message</button></div> :
            <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
              <h3>Request a call back</h3>
              <div className="lp-seg">{['Landlord', 'Tenant', 'Letting agent', 'Contractor'].map(w => <button type="button" key={w} className={f.who === w ? 'on' : ''} onClick={() => setF({ ...f, who: w })}>{w}</button>)}</div>
              <div className="grid g2" style={{ gap: 14 }}>
                <label className="field"><span>Full name</span><input className="input" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Your name" /></label>
                <label className="field"><span>Phone</span><input className="input" required value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="07700 900000" /></label>
                <label className="field"><span>Email</span><input className="input" type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="you@email.co.uk" /></label>
                {f.who === 'Landlord' ? <label className="field"><span>How many homes?</span><select className="input" value={f.homes} onChange={e => setF({ ...f, homes: e.target.value })}>{['1', '2–4', '5–10', 'More than 10'].map(x => <option key={x}>{x}</option>)}</select></label>
                  : <label className="field"><span>Area</span><input className="input" placeholder="e.g. Leeds LS6" /></label>}
              </div>
              <label className="field"><span>How can we help?</span><textarea className="input" value={f.msg} onChange={e => setF({ ...f, msg: e.target.value })} placeholder="Tell us about your home or what you need" /></label>
              <label className="check" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}><input type="checkbox" required /> I&rsquo;m happy for LSP to contact me about my enquiry.</label>
              <button className="btn primary lp-big" type="submit"><Send size={16} />Send message</button>
            </form>}
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer className="lp-foot">
      <div className="lp-wrap">
        <div className="lp-foot-top">
          <div className="lp-foot-brand"><img src="images/logo-white.svg" alt="Landlord Service Plans" /><p>Better management. Better care. Property management for landlords, tenants and letting agents across West Yorkshire.</p></div>
          <div><b>Explore</b>{NAV.map(([id, l]) => <button key={id} onClick={() => to(id)}>{l}</button>)}</div>
          <div><b>Portals</b>{['Landlord login', 'Tenant portal', 'Client portal', 'Contractor sign-up'].map(l => <button key={l} onClick={() => setSoon('Log in')}>{l} <span className="lp-soon-chip">Soon</span></button>)}</div>
          <div><b>Contact</b><span>0113 496 0000</span><span>hello@lsp.co.uk</span><span>40 Park Square, Leeds LS1 2NP</span></div>
        </div>
        <div className="lp-foot-bot"><span>© 2026 Landlord Service Plans. All rights reserved.</span><span>Privacy · Terms · Complaints</span></div>
      </div>
    </footer>
    {soon && <ComingSoon what={soon === 'Log in' ? 'Your login' : 'Sign-up'} onClose={() => setSoon('')} />}
  </div>;
}
