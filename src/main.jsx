import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowUpRight, AudioLines, Boxes, Captions, Check, ChevronDown,
  CircleHelp, Clapperboard, Cloud, Command, CreditCard, Film, Gamepad2,
  ImagePlus, LayoutDashboard, Library, LifeBuoy, LockKeyhole, Menu,
  MoreHorizontal, Play, Plus, Search, Settings2, ShieldCheck, Sparkles,
  Split, Upload, WandSparkles, Zap, Scissors, Trash2, Gauge,
  SlidersHorizontal
} from 'lucide-react';
import './styles.css';

const modes = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Video Editor', icon: Clapperboard },
  { label: 'Social Editor', icon: Captions },
  { label: 'Gaming Editor', icon: Gamepad2 },
  { label: 'Movie Studio', icon: Film, badge: 'MAX' },
  { label: 'Billing', icon: CreditCard },
];

const projects = [
  { title: 'Neon nights / Tokyo', meta: 'Edited 12 min ago', type: 'Cinematic', color: 'coral', duration: '00:42' },
  { title: 'Ranked grind highlights', meta: 'Edited yesterday', type: 'Gaming', color: 'lime', duration: '01:18' },
  { title: 'The 3-second hook', meta: 'Edited 3 days ago', type: 'Social', color: 'blue', duration: '00:28' },
];

const DEMO_ACCOUNT = {
  name: 'Jamie Davis',
  email: 'admin@onezstudio.com',
  password: 'onez1234',
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function OneZLogo({ compact = false }) {
  return (
    <svg className={compact ? 'brand-logo brand-logo-compact' : 'brand-logo'} viewBox="0 0 560 220" role="img" aria-label="OneZ Creation Studio">
      <defs>
        <linearGradient id="onezGradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ff6d53" />
          <stop offset="40%" stopColor="#ff5a45" />
          <stop offset="100%" stopColor="#ff8b4d" />
        </linearGradient>
        <linearGradient id="onezShadow" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#d9412c" />
          <stop offset="100%" stopColor="#e14b32" />
        </linearGradient>
      </defs>
      <g transform="translate(0 10)">
        <path d="M120 42 L278 42 L200 172 L38 172 L108 92 L40 92 L118 12 L280 12 L208 142 L370 142 L300 42 L120 42 Z" fill="url(#onezGradient)" stroke="url(#onezShadow)" strokeWidth="8" strokeLinejoin="round"/>
        <path d="M96 42 L268 42 L190 172 L28 172 L99 92 L30 92 L108 12 L270 12 L198 142 L350 142 L282 42 L96 42 Z" fill="url(#onezGradient)" opacity="0.2"/>
      </g>
      <g transform="translate(290 12)">
        <text x="0" y="108" fill="#f3f3f1" fontSize="109" fontFamily="'Space Grotesk', 'Segoe UI', sans-serif" fontWeight="700" letterSpacing="-4">OneZ</text>
        <text x="2" y="170" fill="#b9bec7" fontSize="40" fontFamily="'DM Sans', 'Segoe UI', sans-serif" fontWeight="500" letterSpacing="1.3">Creation Studio</text>
      </g>
    </svg>
  );
}

function App() {
  const [activeMode, setActiveMode] = useState('Dashboard');
  const [prompt, setPrompt] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('onez-user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('onez-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('onez-user');
    }
  }, [user]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}>
        <div className="brand"><OneZLogo /></div>
        <button className="new-project" onClick={() => setActiveMode('Video Editor')}><Plus size={17} /> New project <span>⌘ N</span></button>
        <nav className="main-nav">
          <p className="nav-label">Workspace</p>
          {modes.map(({ label, icon: Icon, badge }) => <button key={label} className={`nav-item ${activeMode === label ? 'active' : ''}`} onClick={() => { setActiveMode(label); setMobileNav(false); }}><Icon size={18} /><span>{label}</span>{badge && <em>{badge}</em>}</button>)}
          <p className="nav-label library-label">Library</p>
          <button className="nav-item"><Sparkles size={18} /><span>AI Studio</span><i className="pulse-dot" /></button>
          <button className="nav-item"><Library size={18} /><span>Templates</span></button>
          <button className="nav-item"><Boxes size={18} /><span>Effects & Filters</span></button>
          <button className="nav-item"><AudioLines size={18} /><span>Audio</span></button>
          <p className="nav-label library-label">Manage</p>
          <button className="nav-item"><Activity size={18} /><span>Analytics</span><LockKeyhole size={13} className="locked" /></button>
          {isLocalApp && <a className="nav-item admin-link" href="http://localhost:4000/admin/" target="_blank" rel="noreferrer"><Settings2 size={18} /><span>Promo Admin</span></a>}
          <button className="nav-item"><Cloud size={18} /><span>Cloud projects</span></button>
        </nav>
        <div className="sidebar-bottom"><button className="nav-item"><LifeBuoy size={18} /><span>Help center</span></button><button className="nav-item"><Settings2 size={18} /><span>Settings</span></button><button className="profile profile-button" onClick={() => setAuthOpen(true)}><div className="avatar">{(user?.picture ? <img src={user.picture} alt={user.name} className="user-avatar" /> : (user?.name || 'JD').slice(0, 2).toUpperCase())}</div><div><strong>{user?.name || 'Jamie Davis'}</strong><span>{user ? user.email : 'Free plan · Account'}</span></div><MoreHorizontal size={18} /></button></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}><Menu size={20} /></button><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{activeMode}</strong></div><div className="top-actions"><button className="icon-button"><Search size={18} /></button><button className="help-button"><CircleHelp size={17} /> Help</button><button className="upgrade-button" onClick={() => setActiveMode('Billing')}><Zap size={15} /> Upgrade to Pro <ArrowUpRight size={14} /></button></div></header>

        {activeMode === 'Dashboard' ? <Dashboard prompt={prompt} setPrompt={setPrompt} setActiveMode={setActiveMode} /> : activeMode === 'Billing' ? <Billing /> : <EditorWorkspace mode={activeMode} />}
      </main>
      {authOpen && <AuthDialog close={() => setAuthOpen(false)} onLogin={setUser} user={user} />}
    </div>
  );
}

function AuthDialog({ close, onLogin, user }) {
  const [email, setEmail] = useState(user?.email || DEMO_ACCOUNT.email);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(GOOGLE_CLIENT_ID ? 'Google login is ready to use once configured for your app.' : 'Demo login: admin@onezstudio.com / onez1234');

  function parseGoogleJwt(credential) {
    try {
      const segments = credential.split('.');
      if (segments.length < 2) return null;
      const payload = segments[1].replace(/-/g, '+').replace(/_/g, '/');
      const base64 = atob(payload);
      return JSON.parse(base64);
    } catch {
      return null;
    }
  }

  function handleGoogleCredentialResponse(response) {
    const payload = parseGoogleJwt(response.credential);
    if (!payload) {
      setMessage('Google sign-in failed. Please try again.');
      return;
    }

    const nextUser = {
      name: payload.name || payload.given_name || payload.email?.split('@')[0] || 'Google User',
      email: payload.email || '',
      picture: payload.picture || '',
    };

    onLogin(nextUser);
    setMessage('Google login successful.');
    window.setTimeout(close, 350);
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
    });
  }, []);

  function handleGoogleLogin() {
    if (!GOOGLE_CLIENT_ID) {
      setMessage('Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to your .env file and restart the app.');
      return;
    }

    if (!window.google?.accounts?.id) {
      setMessage('Google sign-in script is still loading. Please try again in a moment.');
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setMessage('Google sign-in is unavailable right now. Please use the demo login or configure the OAuth client.');
      }
    });
  }

  function providerLogin(provider) {
    setMessage(`${provider} sign-in needs OAuth keys in the backend environment. Use the demo credentials below instead.`);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (email.trim().toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      onLogin({ name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email });
      setMessage('Login successful.');
      setTimeout(close, 350);
      return;
    }

    setMessage('Invalid email or password. Use the demo account shown below.');
  }

  return <div className="auth-backdrop" role="presentation" onClick={close}><section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={event => event.stopPropagation()}><button className="auth-close" onClick={close} aria-label="Close sign in">×</button><div className="auth-logo"><OneZLogo /></div><p className="eyebrow">ONEZ CREATION STUDIO</p><h2 id="auth-title">Welcome back</h2><p className="auth-subtitle">Sign in to keep your projects, credits, and cloud workspace together.</p><button className="oauth-button google" onClick={handleGoogleLogin}><b>G</b> Continue with Google</button><button className="oauth-button facebook" onClick={() => providerLogin('Facebook')}><b>f</b> Continue with Facebook</button><button className="oauth-button tiktok" onClick={() => providerLogin('TikTok')}><b>♪</b> Continue with TikTok</button><div className="auth-divider"><span>or continue with email</span></div><form onSubmit={handleSubmit}><input className="auth-input" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /><input className="auth-input" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" /><button className="email-login" type="submit">Continue with email <ArrowUpRight size={15} /></button></form>{message && <p className="auth-message">{message}</p>}<small className="auth-terms">Demo login: <strong>{DEMO_ACCOUNT.email}</strong> / <strong>{DEMO_ACCOUNT.password}</strong></small><small className="auth-terms">By continuing, you agree to OneZ Terms and Privacy Policy.</small></section></div>;
}

function Dashboard({ prompt, setPrompt, setActiveMode }) {
  return <div className="dashboard page-enter">
    <section className="welcome-row"><div><p className="eyebrow">WEDNESDAY, AUGUST 19, 2026</p><h1>Good morning, Jamie<span>.</span></h1><p className="subhead">What are we making today?</p></div><button className="import-button"><Upload size={17} /> Import media</button></section>
    <section className="ai-command"><div className="ai-icon"><WandSparkles size={21} /></div><div className="ai-copy"><strong>Tell OneZ what to make</strong><span>Turn a thought into an edit, a cut, or a complete social package.</span></div><div className="prompt-wrap"><Command size={16} /><input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Make this a 20 second TikTok..." /><button aria-label="Run AI command"><ArrowUpRight size={18} /></button></div></section>
    <section className="section-heading"><div><h2>Choose your workspace</h2><span>Every format, one creative home.</span></div><button className="text-button">View all <ArrowUpRight size={15} /></button></section>
    <section className="mode-grid">
      <ModeCard icon={Clapperboard} title="Video Editor" text="Cut, layer, and polish with precision." accent="coral" action={() => setActiveMode('Video Editor')} />
      <ModeCard icon={Captions} title="Social Editor" text="Make every second count on social." accent="blue" action={() => setActiveMode('Social Editor')} />
      <ModeCard icon={Gamepad2} title="Gaming Editor" text="Find the moment. Own the replay." accent="lime" action={() => setActiveMode('Gaming Editor')} />
      <ModeCard icon={Film} title="Movie Studio" text="Your long-form story, beautifully cut." accent="gold" locked action={() => setActiveMode('Movie Studio')} />
    </section>
    <section className="content-grid"><div className="projects-panel"><div className="section-heading compact"><div><h2>Recent projects</h2><span>Your latest creative work</span></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="project-list">{projects.map(project => <ProjectCard key={project.title} {...project} />)}</div></div><UsagePanel /></section>
  </div>;
}

function ModeCard({ icon: Icon, title, text, accent, locked, action }) { return <button className={`mode-card ${accent}`} onClick={action}><div className="mode-card-top"><span className="mode-icon"><Icon size={21} /></span>{locked ? <span className="max-tag"><LockKeyhole size={11} /> MAX</span> : <ArrowUpRight size={18} className="card-arrow" />}</div><strong>{title}</strong><span>{text}</span><div className="card-lines"><i /><i /><i /></div></button>; }
function ProjectCard({ title, meta, type, color, duration }) { return <button className="project-card"><div className={`project-thumb ${color}`}><Play size={16} fill="currentColor" /><span>{duration}</span></div><div className="project-info"><strong>{title}</strong><span>{meta}</span></div><span className={`type-tag ${color}`}>{type}</span><MoreHorizontal size={17} className="project-more" /></button>; }
function UsagePanel() { return <aside className="usage-panel"><div className="usage-title"><div><p className="eyebrow">YOUR PLAN</p><h3>Free</h3></div><button className="text-button">Manage <ArrowUpRight size={14} /></button></div><div className="usage-meter"><div className="meter-label"><span>AI credits</span><strong>4 <small>/ 10</small></strong></div><div className="meter"><i /></div><span className="usage-note">Resets in 12 days</span></div><div className="usage-divider" /><div className="usage-stat"><span>Cloud projects</span><strong>2 <small>/ 3</small></strong></div><div className="usage-stat"><span>Exports this month</span><strong>7</strong></div><button className="upgrade-wide"><Zap size={16} /> Unlock 100 AI credits <ArrowUpRight size={15} /></button></aside>; }

const plans = {
  Pro: { price: 1, caption: 'For everyday creators', features: ['No ads or watermark', '100 AI credits / month', 'Advanced timeline tools', 'Premium effects and filters'] },
  MAX: { price: 8, caption: 'For serious creators and filmmakers', features: ['Everything in Pro', '500+ AI credits / month', 'GPU-accelerated AI processing', 'Movie Studio and 4K export', 'Analytics and direct publishing'] },
};

const promoCodes = { ONEZPRO: { type: 'percent', value: 20, label: '20% off applied', plans: ['Pro'] }, ONEZMAX: { type: 'percent', value: 25, label: '25% off applied', plans: ['MAX'] }, CREATOR5: { type: 'fixed', value: 5, label: '$5 off applied', plans: ['Pro', 'MAX'] } };
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const isLocalApp = ['localhost', '127.0.0.1'].includes(window.location.hostname);

function Billing() {
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [email, setEmail] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [accessMessage, setAccessMessage] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [paid, setPaid] = useState(false);
  const plan = plans[selectedPlan];
  const discount = appliedPromo ? appliedPromo.type === 'percent' ? plan.price * appliedPromo.value / 100 : Math.min(plan.price, appliedPromo.value) : 0;
  const total = Math.max(0, plan.price - discount);

  async function applyPromo() {
    const code = promo.trim().toUpperCase();
    try {
      const response = await fetch(`${API_BASE}/promo/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: selectedPlan, code }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setAppliedPromo(result.promo);
      setPromoMessage(result.promo.label);
    } catch (error) {
      const offer = promoCodes[code];
      if (offer && offer.plans?.includes(selectedPlan)) { setAppliedPromo(offer); setPromoMessage(offer.label); } else { setAppliedPromo(null); setPromoMessage(error.message || 'That promo code is not valid.'); }
    }
  }

  async function startCheckout() {
    if (accessGranted) return;
    setCheckoutMessage('');
    try {
      const response = await fetch(`${API_BASE}/checkout/session`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: selectedPlan, provider: 'card', promoCode: promo, email }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPaid(true);
    } catch (error) {
      setCheckoutMessage(error.message || 'Unable to start checkout.');
    }
  }

  async function redeemAccessCode() {
    setAccessMessage('');
    try {
      const response = await fetch(`${API_BASE}/access/redeem`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: accessCode }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (result.plan !== selectedPlan) throw new Error(`This code unlocks ${result.plan}, not ${selectedPlan}.`);
      setAccessGranted(true);
      setAccessMessage(`${result.plan} access granted without payment.`);
    } catch (error) {
      setAccessGranted(false);
      setAccessMessage(error.message || 'Unable to redeem access code.');
    }
  }

  return <div className="billing-page page-enter">
    <div className="billing-hero"><div><p className="eyebrow">ONEZ MEMBERSHIP</p><h1>Make more. <span>Pay less.</span></h1><p className="subhead">Choose the plan that keeps your creative momentum moving.</p></div><div className="secure-note"><ShieldCheck size={17} /> Secure checkout</div></div>
    <div className="billing-layout">
      <section className="checkout-panel"><div className="checkout-step"><span>01</span><div><h2>Choose your plan</h2><p>Upgrade or switch plans anytime.</p></div></div><div className="plan-options">{Object.entries(plans).map(([name, option]) => <button key={name} className={`plan-option ${selectedPlan === name ? 'selected' : ''}`} onClick={() => setSelectedPlan(name)}><div className="plan-radio">{selectedPlan === name && <Check size={13} />}</div><div className="plan-option-copy"><strong>{name}</strong><span>{option.caption}</span></div><b>${option.price}<small>/mo</small></b></button>)}</div>
        <div className="checkout-step payment-step"><span>02</span><div><h2>Card payment</h2><p>Visa and Mastercard payments are secured by Stripe.</p></div></div><div className="payment-options card-only"><button className="selected" type="button"><CreditCard size={18} /><span>Visa / Mastercard</span></button></div>
        <label className="email-field">Account email<input value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" type="email" /></label><div className="card-fields"><label>Card number<input placeholder="1234  5678  9012  3456" inputMode="numeric" /></label><div className="field-row"><label>Expiry date<input placeholder="MM / YY" /></label><label>Security code<input placeholder="CVC" /></label></div><label>Cardholder name<input placeholder="Jamie Davis" /></label></div>
      <div className="promo-box"><div><strong>Have a promo code?</strong><span>Apply it before completing checkout.</span></div><div className="promo-input"><input value={promo} onChange={event => setPromo(event.target.value)} placeholder="Enter code" /><button onClick={applyPromo}>Apply</button></div>{promoMessage && <small className={appliedPromo ? 'promo-success' : 'promo-error'}>{promoMessage}</small>}</div>
      <div className="access-box"><div><strong>Have free access?</strong><span>Redeem an invitation code instead of paying.</span></div><div className="promo-input"><input value={accessCode} onChange={event => setAccessCode(event.target.value)} placeholder="Enter access code" type="password" /><button onClick={redeemAccessCode}>Redeem</button></div>{accessMessage && <small className={accessGranted ? 'promo-success' : 'promo-error'}>{accessMessage}</small>}</div>
      <button className="pay-button" onClick={startCheckout}>{accessGranted ? <><Check size={17} /> Access granted</> : paid ? <><Check size={17} /> Payment request created</> : <>Continue to secure payment <ArrowUpRight size={17} /></>}</button>{checkoutMessage && <p className="checkout-error">{checkoutMessage}</p>}<p className="terms-note">By continuing, you agree to OneZ's Terms and recurring billing policy. Cancel anytime.</p></section>
      <aside className="order-summary"><p className="eyebrow">ORDER SUMMARY</p><div className="summary-plan"><div className={`summary-plan-icon ${selectedPlan.toLowerCase()}`}>{selectedPlan === 'MAX' ? <Film size={20} /> : <Zap size={20} />}</div><div><strong>OneZ {selectedPlan}</strong><span>{plan.caption}</span></div></div><div className="summary-line"><span>Monthly membership</span><b>${plan.price.toFixed(2)}</b></div>{appliedPromo && <div className="summary-line discount"><span>Promo discount</span><b>-${discount.toFixed(2)}</b></div>}<div className="summary-total"><span>Total due today</span><strong>${total.toFixed(2)}<small> USD</small></strong></div><div className="summary-perks"><strong>Included with {selectedPlan}</strong>{plan.features.map(feature => <span key={feature}><Check size={14} /> {feature}</span>)}</div><div className="trust-row"><ShieldCheck size={16} /><span>Payments handled securely by your selected provider.</span></div></aside>
    </div>
  </div>;
}

function EditorWorkspace({ mode }) {
  const [media, setMedia] = useState(null);
  const [toolTab, setToolTab] = useState('Media');
  const [selectedTool, setSelectedTool] = useState('');
  const [filterIntensity, setFilterIntensity] = useState(70);
  const [volume, setVolume] = useState(100);
  const [caption, setCaption] = useState('');
  const [projectStatus, setProjectStatus] = useState('Saved');
  const fileInput = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(`onez-project-${mode}`);
    if (saved) {
      try { setCaption(JSON.parse(saved).caption || ''); } catch { localStorage.removeItem(`onez-project-${mode}`); }
    }
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(`onez-project-${mode}`, JSON.stringify({ caption, filterIntensity, volume, updatedAt: Date.now() }));
    setProjectStatus('Autosaved');
  }, [caption, filterIntensity, volume, mode]);

  function importMedia(event) {
    const file = event.target.files?.[0];
    if (file) setMedia({ file, url: URL.createObjectURL(file), name: file.name, type: file.type });
  }

  function runTool(tool) {
    setSelectedTool(tool);
    window.setTimeout(() => setSelectedTool(`${tool} ready`), 450);
  }

  function exportMedia() {
    if (!media) { setSelectedTool('Import media before exporting'); return; }
    const link = document.createElement('a');
    link.href = media.url;
    link.download = `onez-${media.name}`;
    link.click();
    setSelectedTool('Export download started');
  }

  async function runAI(tool) {
    try {
      const maxWorkflow = mode === 'Movie Studio';
      const response = await fetch(`${API_BASE}/ai/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool, fileName: media?.name || '', plan: maxWorkflow ? 'MAX' : 'Pro', gpuRequested: maxWorkflow }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setSelectedTool(`${tool} queued on ${result.job.processing.toUpperCase()} (${result.job.id})`);
    } catch (error) {
      setSelectedTool(error.message || 'AI service unavailable');
    }
  }

  return <div className="editor-workspace page-enter"><input ref={fileInput} className="hidden-file-input" type="file" accept="video/*,audio/*,image/*" onChange={importMedia} /><ModePreset mode={mode} runTool={runTool} selectedTool={selectedTool} /><div className="editor-heading"><div><p className="eyebrow">{mode.toUpperCase()}</p><h1>{media?.name || 'Untitled project'}</h1></div><div className="editor-heading-actions"><button className="secondary-button"><Cloud size={16} /> {projectStatus}</button><button className="export-button" onClick={exportMedia}><Upload size={16} /> Export</button></div></div><div className="editor-canvas"><div className="canvas-top"><span>00:00:00:00</span><div className="canvas-tools"><button title="Split clip" onClick={() => runTool('Split')}><Scissors size={16} /></button><button title="Crop clip" onClick={() => runTool('Crop')}><Split size={16} /></button><button title="Adjust" onClick={() => runTool('Adjust')}><Settings2 size={16} /></button></div><span>Fit <ChevronDown size={14} /></span></div>{media?.type.startsWith('video/') ? <video className="video-preview" src={media.url} controls /> : media?.type.startsWith('image/') ? <img className="image-preview" src={media.url} alt={media.name} /> : <div className="empty-canvas"><div className="empty-play"><Play size={28} fill="currentColor" /></div><strong>Drop media to start creating</strong><span>or import footage from your device</span><button className="import-button" onClick={() => fileInput.current?.click()}><ImagePlus size={16} /> Import media</button></div>}</div><div className="editor-controls"><div className="control-tabs">{['Media', 'Manual tools', 'Effects', 'Filters', 'Text', 'Audio', 'AI tools'].map(tab => <button key={tab} className={toolTab === tab ? 'selected' : ''} onClick={() => setToolTab(tab)}>{tab}</button>)}</div>{toolTab === 'AI tools' ? <AITools runTool={runTool} runAI={runAI} selectedTool={selectedTool} /> : toolTab === 'Manual tools' ? <ManualTools runTool={runTool} selectedTool={selectedTool} /> : toolTab === 'Effects' ? <EffectsPanel runTool={runTool} selectedTool={selectedTool} /> : toolTab === 'Filters' ? <FiltersPanel intensity={filterIntensity} setIntensity={setFilterIntensity} runTool={runTool} selectedTool={selectedTool} /> : toolTab === 'Audio' ? <AudioPanel volume={volume} setVolume={setVolume} runTool={runTool} selectedTool={selectedTool} /> : toolTab === 'Text' ? <TextPanel caption={caption} setCaption={setCaption} runTool={runTool} selectedTool={selectedTool} /> : <><div className="tool-strip"><button onClick={() => fileInput.current?.click()}><ImagePlus size={16} /> Import media</button><span>{media ? `${media.name} loaded` : 'Add video, audio, or images to your project'}</span></div><Timeline media={media} /></>}</div></div>;
}

function ModePreset({ mode, runTool, selectedTool }) {
  const presets = mode === 'Social Editor' ? ['TikTok 9:16', 'Reels 9:16', 'Shorts 9:16', 'Feed 1:1'] : mode === 'Gaming Editor' ? ['FPS highlights', 'Battle royale', 'Racing moments', 'Auto short'] : mode === 'Movie Studio' ? ['Scene board', 'Multi-track', 'Color grade', 'Credits'] : [];
  if (!presets.length) return null;
  return <div className={`mode-preset-bar ${mode.toLowerCase().replaceAll(' ', '-')}`}><div className="mode-preset-copy"><strong>{mode === 'Social Editor' ? 'Platform setup' : mode === 'Gaming Editor' ? 'Gaming auto-edit' : 'Movie workflow'}</strong><span>{mode === 'Social Editor' ? 'Choose a delivery format before you start.' : mode === 'Gaming Editor' ? 'Detect moments and shape a highlight reel.' : 'Build a longer story with scenes and tracks.'}</span></div><div className="preset-actions">{presets.map(preset => <button key={preset} onClick={() => runTool(preset)}>{preset}</button>)}</div>{mode === 'Movie Studio' && <em className="gpu-badge">GPU queue · MAX</em>}{selectedTool && <small>{selectedTool}</small>}</div>;
}

function ManualTools({ runTool, selectedTool }) { return <div className="tool-panel"><div className="tool-grid"><button onClick={() => runTool('Split')}><Scissors size={18} /><strong>Split</strong><span>Cut at playhead</span></button><button onClick={() => runTool('Trim')}><SlidersHorizontal size={18} /><strong>Trim</strong><span>Set clip in/out</span></button><button onClick={() => runTool('Speed')}><Gauge size={18} /><strong>Speed</strong><span>0.25x to 4x</span></button><button onClick={() => runTool('Audio')}><AudioLines size={18} /><strong>Audio</strong><span>Volume and fade</span></button><button onClick={() => runTool('Text')}><Captions size={18} /><strong>Text</strong><span>Add title or subtitle</span></button><button onClick={() => runTool('Delete')}><Trash2 size={18} /><strong>Delete</strong><span>Remove selection</span></button></div>{selectedTool && <p className="tool-status">{selectedTool}</p>}</div>; }
function AITools({ runAI, selectedTool }) { return <div className="tool-panel"><div className="ai-tool-banner"><WandSparkles size={19} /><div><strong>AI editing tools</strong><span>Jobs are sent securely to the processing queue.</span></div></div><div className="tool-grid ai-tool-grid"><button onClick={() => runAI('Auto captions')}><Captions size={18} /><strong>Auto captions</strong><span>Generate subtitles</span></button><button onClick={() => runAI('AI enhance')}><Sparkles size={18} /><strong>AI enhance</strong><span>Improve visual quality</span></button><button onClick={() => runAI('AI repair')}><SlidersHorizontal size={18} /><strong>AI repair</strong><span>Reduce noise and shake</span></button><button onClick={() => runAI('AI clip maker')}><Film size={18} /><strong>AI clip maker</strong><span>Find best moments</span></button></div>{selectedTool && <p className="tool-status">{selectedTool}</p>}</div>; }
function EffectsPanel({ runTool, selectedTool }) { return <div className="tool-panel"><div className="tool-grid effect-grid">{['Fade', 'Zoom', 'Blur', 'Vignette', 'Film grain', 'Glitch', 'Shake', 'Beat flash'].map(effect => <button key={effect} onClick={() => runTool(effect)}><Sparkles size={17} /><strong>{effect}</strong><span>Apply effect</span></button>)}</div>{selectedTool && <p className="tool-status">{selectedTool}</p>}</div>; }
function FiltersPanel({ intensity, setIntensity, runTool, selectedTool }) { return <div className="tool-panel"><div className="tool-grid effect-grid">{['Cinematic', 'Gaming', 'Vintage', 'Warm', 'Cool', 'Black & white'].map(filter => <button key={filter} onClick={() => runTool(`${filter} filter`)}><SlidersHorizontal size={17} /><strong>{filter}</strong><span>Preview filter</span></button>)}</div><label className="range-control">Intensity <strong>{intensity}%</strong><input type="range" min="0" max="100" value={intensity} onChange={event => setIntensity(Number(event.target.value))} /></label>{selectedTool && <p className="tool-status">{selectedTool}</p>}</div>; }
function AudioPanel({ volume, setVolume, runTool, selectedTool }) { return <div className="tool-panel"><label className="range-control">Volume <strong>{volume}%</strong><input type="range" min="0" max="200" value={volume} onChange={event => setVolume(Number(event.target.value))} /></label><div className="tool-grid effect-grid"><button onClick={() => runTool('Noise removal')}><AudioLines size={17} /><strong>Noise removal</strong><span>Clean background sound</span></button><button onClick={() => runTool('Voice enhance')}><AudioLines size={17} /><strong>Voice enhance</strong><span>Improve speech clarity</span></button><button onClick={() => runTool('Music ducking')}><Gauge size={17} /><strong>Music ducking</strong><span>Lower music under voice</span></button></div>{selectedTool && <p className="tool-status">{selectedTool}</p>}</div>; }
function TextPanel({ caption, setCaption, runTool, selectedTool }) { return <div className="tool-panel"><label className="text-control">Caption or title<input value={caption} onChange={event => setCaption(event.target.value)} placeholder="Type text for your video" /></label><button className="text-apply" onClick={() => runTool('Text added')}><Captions size={16} /> Add to timeline</button>{selectedTool && <p className="tool-status">{selectedTool}</p>}</div>; }
function Timeline({ media }) { return <div className="timeline"><div className="timeline-ruler">{['00:00','00:05','00:10','00:15','00:20','00:25','00:30'].map(t => <span key={t}>{t}</span>)}</div><div className="track"><span className="track-label">Video</span><div className={`track-line ${media ? 'loaded-track' : ''}`}><span>{media ? media.name : 'Import a clip to begin'}</span></div></div><div className="track"><span className="track-label">Audio</span><div className="track-line audio-line" /></div></div>; }

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
