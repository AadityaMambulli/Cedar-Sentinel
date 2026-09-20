import { ArrowRight, ArrowUpRight, ShieldCheck, ScanLine, Fingerprint, Menu, X, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Brand from '../components/Brand';

const stats = [
  { value: '70%', label: 'less manual\ntriage' },
  { value: '85%', label: 'fewer repeat\npolicy gaps' },
  { value: '1x', label: 'fix, infinite,\npermanent prevention' },
  { value: '95%', label: 'of unauthorized actions\nblocked before execution' },
];

const problems = [
  {
    title: 'No fine-grained control',
    desc: 'Most systems either trust the AI agent completely or rely on brittle, hardcoded if/else checks. There\'s no scalable, declarative way to define exactly what an agent is allowed to do.',
  },
  {
    title: 'No audit trail',
    desc: 'When an agent takes an action, there\'s no immutable, queryable record of why that decision was made. Proving compliance after the fact becomes nearly impossible.',
  },
  {
    title: 'No separation of concerns',
    desc: 'The AI model that decides what to try and the system that decides what\'s allowed are usually the same thing — a security anti-pattern that breaks trust.',
  },
];

const memoryTabs = [
  {
    title: 'Ingest & index everything',
    desc: 'Cedar Sentinel continuously ingests your agent configs, policies, and past incidents — building a living inventory of your entire governance history.',
  },
  {
    title: 'Evaluate against policies',
    desc: 'Every proposed action is evaluated against explicit, human-readable Cedar policies before execution. ALLOW or DENY with a traceable reason.',
  },
  {
    title: 'Execute with boundaries',
    desc: 'Allowed requests continue to execution. Denied requests never reach your infrastructure. The agent\'s reasoning and authorization are cleanly separated.',
  },
  {
    title: 'Log everything immutably',
    desc: 'Every decision — allowed or denied — is written to an immutable, searchable audit log. What was attempted, when, by which agent, and why.',
  },
];

const benefits = [
  { title: 'Separation of reasoning and authorization', desc: 'The AI model generates actions, but the Cedar policy engine decides what\'s allowed. A clean security boundary between thinking and doing.' },
  { title: 'Declarative, human-readable policies', desc: 'Logic lives in .cedar files, not buried in Python code. Security teams can read, review, and version policies like any other code.' },
  { title: 'Immutable audit trail', desc: 'Every decision is logged to OpenSearch with full context. Answer "What did this agent do?" and "Why was this blocked?" in seconds.' },
  { title: 'Zero Trust by default', desc: 'Every action requires explicit permission. No implicit trust, no wildcard access — every request is evaluated individually against your policies.' },
  { title: 'Real-time enforcement', desc: 'Policies are evaluated in milliseconds before execution. No batch processing, no delayed checks — every action is gated in real time.' },
  { title: 'Enterprise-grade compliance', desc: 'Built for teams that need to prove compliance. Full traceability from agent reasoning to policy decision to execution result.' },
];

const memoryContent = [
  {
    title: 'Ingest & index everything',
    desc: 'Cedar Sentinel continuously ingests your agent configs, policies, and past incidents — building a living inventory of your entire governance history.',
    visual: 'policies',
  },
  {
    title: 'Evaluate against policies',
    desc: 'Every proposed action is evaluated against explicit, human-readable Cedar policies before execution. ALLOW or DENY with a traceable reason.',
    visual: 'detection',
  },
  {
    title: 'Execute with boundaries',
    desc: 'Allowed requests continue to execution. Denied requests never reach your infrastructure. The agent\'s reasoning and authorization are cleanly separated.',
    visual: 'remediation',
  },
  {
    title: 'Log everything immutably',
    desc: 'Every decision — allowed or denied — is written to an immutable, searchable audit log. What was attempted, when, by which agent, and why.',
    visual: 'enforcement',
  },
];

function MemoryTabs() {
  const [active, setActive] = useState(0);
  const progressRef = useRef(0);
  const barRef = useRef(null);
  const tickRef = useRef(null);

  const startTimer = (from = 0) => {
    clearInterval(tickRef.current);
    progressRef.current = from;
    if (barRef.current) barRef.current.style.width = `${from}%`;
    tickRef.current = setInterval(() => {
      progressRef.current += 1.5;
      if (progressRef.current >= 100) {
        clearInterval(tickRef.current);
        progressRef.current = 0;
        setActive(a => (a + 1) % memoryTabs.length);
        return;
      }
      if (barRef.current) barRef.current.style.width = `${progressRef.current}%`;
    }, 80);
  };

  useEffect(() => {
    startTimer(0);
    return () => clearInterval(tickRef.current);
  }, [active]);

  const goTo = (i) => {
    setActive(i);
    progressRef.current = 0;
  };

  return (
    <div className="memory-tabs">
      <div className="memory-tabs-menu">
        {memoryContent.map((tab, i) => (
          <button
            key={tab.title}
            className={`memory-tab ${i === active ? 'is-active' : ''}`}
            onClick={() => goTo(i)}
          >
            <div className="memory-tab-head">
              <span className="memory-tab-indicator" />
              <span>{tab.title}</span>
            </div>
            <div className="memory-tab-desc-wrap">
              <p className="memory-tab-desc">{tab.desc}</p>
            </div>
            <div className="memory-tab-progress">
              <span ref={i === active ? barRef : null} style={{ width: i === active ? `${progressRef.current}%` : i < active ? '100%' : '0%' }} />
            </div>
          </button>
        ))}
      </div>
      <div className="memory-tabs-content">
        <div className="memory-panel" key={active}>
          <div className="memory-panel-visual">
            <div className="memory-panel-icon">
              {active === 0 && <ScanLine size={48} strokeWidth={1.5} />}
              {active === 1 && <Fingerprint size={48} strokeWidth={1.5} />}
              {active === 2 && <ShieldCheck size={48} strokeWidth={1.5} />}
              {active === 3 && <ShieldCheck size={48} strokeWidth={1.5} />}
            </div>
            <h3 className="memory-panel-title">{memoryContent[active].title}</h3>
            <p className="memory-panel-desc">{memoryContent[active].desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitsSlider() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const startTimer = (idx) => {
    clearInterval(timerRef.current);
    clearInterval(progressRef.current);
    setProgress(0);
    const start = Date.now();
    const dur = 3500;
    progressRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / dur) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(progressRef.current);
        setCurrent(c => (c + 1) % benefits.length);
      }
    }, 30);
  };

  useEffect(() => {
    startTimer(current);
    return () => { clearInterval(timerRef.current); clearInterval(progressRef.current); };
  }, [current]);

  const goTo = (i) => setCurrent(i);

  const len = benefits.length;
  const getOffset = (i) => {
    const diff = ((i - current) % len + len) % len;
    return diff > len / 2 ? diff - len : diff;
  };

  return (
    <div className="benefits-carousel">
      <div className="benefits-viewport">
        <div className="benefits-track">
          {benefits.map((b, i) => {
            const offset = getOffset(i);
            const absOffset = Math.abs(offset);
            let cls = 'benefits-slide';
            if (offset === 0) cls += ' is-center';
            else if (absOffset === 1) cls += ' is-near';
            else cls += ' is-far';
            const tx = isMobile ? offset * 90 : offset * 110;
            const sc = offset === 0 ? 1 : absOffset === 1 ? 0.92 : 0.85;
            return (
              <div key={b.title} className={cls} style={{ transform: `translateX(${tx}%) scale(${sc})` }} onClick={() => goTo(i)}>
                <div className="benefits-card-inner">
                  <div className="benefits-icon"><ShieldCheck size={32} /></div>
                  <h3>{b.title}</h3>
                  <p>{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="benefits-dots">
        {benefits.map((_, i) => (
          <button key={i} className={`dot ${i === current ? 'is-active' : ''}`} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}>
            {i === current && <span className="dot-progress" style={{ width: `${progress}%` }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

const flowSteps = [
  ['Agent proposes', 'A task becomes a scoped request: principal, action, resource, and context.'],
  ['Policy decides', 'An explicit allow or deny, with a reason you can inspect.'],
  ['Execution respects the boundary', 'Allowed requests continue. Denied requests never reach execution.'],
  ['The trail stays visible', 'Review the outcome in the audit log, then filter down to what matters.'],
];

function FlowSteps() {
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState(0);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const flowRef = useRef(null);
  const playing = !reducedMotion && inView && pageVisible;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 }) : null;
    observer?.observe(flowRef.current);
    return () => {
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
      observer?.disconnect();
    };
  }, []);

  return (
    <div ref={flowRef} className="flow-player" data-playing={playing}>
      <ol className="flow-list">
        {flowSteps.map(([title, description], index) => (
          <li key={title} className={index === step ? 'is-active' : index < step ? 'is-complete' : ''}>
            <h3>
              <button type="button" id={`flow-step-${index}`} aria-expanded={step === index} aria-controls={`flow-description-${index}`} onClick={() => { setStep(index); setSelection(c => c + 1); }}>
                <span className="flow-marker" aria-hidden="true" />
                <span>{title}</span>
              </button>
            </h3>
            <div id={`flow-description-${index}`} role="region" aria-labelledby={`flow-step-${index}`} hidden={step !== index} className="flow-description">
              <p>{description}</p>
            </div>
            <div className="flow-track" aria-hidden="true">
              <span key={`${index}-${step}-${selection}`} className="flow-progress" onAnimationEnd={event => {
                if (event.animationName === 'flow-progress' && index === step && playing) setStep(c => (c + 1) % flowSteps.length);
              }} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Landing() {
  const [menu, setMenu] = useState(false);
  const [platformStep, setPlatformStep] = useState(0);
  const landscapeRef = useRef(null);

  const heroVideoRef = useRef(null);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.from('.hero-content > *', { y: 30, opacity: 0, stagger: 0.12, duration: 0.9 })
        .from('.hero-video-wrapper', { opacity: 0, scale: 0.96, duration: 1.2 }, 0.3);
    }, landscapeRef);
    return () => media.revert();
  }, []);

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  return (
    <div className="landing">
      {/* Topbar */}
      <div className="topbar">
        <span>Cedar Sentinel is officially live! <a href="#/about">Read more on Forbes →</a></span>
      </div>

      {/* Navbar — links left, logo center, CTA right */}
      <header className="site-nav pi-nav">
        <nav id="site-menu" aria-label="Main navigation" className={menu ? 'is-open' : ''}>
          <a href="#about-section" onClick={() => setMenu(false)}>About</a>
          <a href="#platform" onClick={() => setMenu(false)}>Platform</a>
          <a href="#how-it-works" onClick={() => setMenu(false)}>How it works</a>
          <a href="#about-section" onClick={() => setMenu(false)}>Why governance</a>

        </nav>
        <a href="#/" aria-label="Cedar Sentinel home" className="nav-logo-center"><Brand /></a>
        <a className="button small" href="#/app/dashboard">Open console <ArrowUpRight size={15} /></a>
        <button className="menu-toggle" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="site-menu" onClick={() => setMenu(!menu)}>
          {menu ? <X /> : <Menu />}
        </button>
      </header>

      <main id="main-content">
        {/* Hero Section — light bg, centered text, video illustration */}
        <section className="pi-hero">
          <div className="pi-hero-video">
            <video ref={heroVideoRef} autoPlay muted loop playsInline preload="auto">
              <source src="/hero-video.webm" type="video/webm" />
            </video>
          </div>
          <div className="pi-hero-inner">
            <div className="pi-hero-content">
              <p className="eyebrow">AGENT GOVERNANCE LAYER</p>
              <h1>AI that acts.<br />Permissions that <em>make sense.</em></h1>
              <p className="hero-subtitle">Cedar Sentinel sits between your AI agents and real-world execution. Every action is evaluated against human-readable policies before it reaches your infrastructure.</p>
              <a className="button hero-cta" href="#/app/dashboard">See it in action <ArrowRight size={17} /></a>
            </div>
            <div className="pi-hero-card">
              <div className="hero-card-video">
                <video autoPlay muted loop playsInline preload="auto">
<source src="/hero-video.webm" type="video/webm" />
                </video>
                <span className="hero-card-duration">90s</span>
              </div>
              <div className="hero-card-body">
                <blockquote>&ldquo;&hellip;preventing vulnerabilities from <em>ever getting into production</em>.&rdquo;</blockquote>
                <p className="hero-card-author">Jonathan Jaffe <span>&middot; CISO, Lemonade</span></p>
                <span className="hero-card-link">Read the story &rarr;</span>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Testimonial Card — shown only on mobile after hero */}
        <div className="pi-hero-card-mobile">
          <div className="pi-hero-card">
            <div className="hero-card-video">
              <video autoPlay muted loop playsInline preload="auto">
                <source src="/hero-video.webm" type="video/webm" />
              </video>
              <span className="hero-card-duration">90s</span>
            </div>
            <div className="hero-card-body">
              <blockquote>&ldquo;&hellip;preventing vulnerabilities from <em>ever getting into production</em>.&rdquo;</blockquote>
              <p className="hero-card-author">Jonathan Jaffe <span>&middot; CISO, Lemonade</span></p>
              <span className="hero-card-link">Read the story &rarr;</span>
            </div>
          </div>
        </div>

        {/* Mobile Hero Video — shown only on mobile */}
        <div className="pi-hero-video-mobile">
          <video autoPlay muted loop playsInline preload="auto">
            <source src="/hero-video.webm" type="video/webm" />
          </video>
        </div>

        {/* Stats Marquee */}
        <div className="stats-marquee">
          <div className="stats-track">
            {[...stats, ...stats, ...stats, ...stats].map((s, i) => (
              <div key={i} className="stats-item">
                <div className="stats-value"><em>{s.value}</em></div>
                <div>{s.label.split('\n').map((l, j) => <span key={j}>{l}<br /></span>)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Section */}
        <section className="pi-video-section">
          <div className="pi-container">
            <h2 className="section-heading-large">Fix once, prevent everywhere.</h2>
            <div className="pi-video-wrapper">
              <video autoPlay muted loop playsInline preload="auto">
                <source src="/diagram.webm" type="video/webm" />
              </video>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="about-section" className="pi-problem-section">
          <div className="pi-container">
            <div className="problem-header">
              <p className="eyebrow">THE GOVERNANCE GAP</p>
              <h2>AI agents are acting without guardrails.</h2>
              <p className="problem-description">Organizations are deploying AI agents that process refunds, update records, and call APIs — but there's no scalable way to define exactly what they're allowed to do, or prove what they did.</p>
            </div>
            <div className="problem-grid">
              {problems.map((p) => (
                <div key={p.title} className="problem-card">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="pi-quote-section">
          <div className="pi-container">
            <h2 data-reveal>
              The AI model that decides what to try and the system that decides what's allowed are usually the same thing.
              <br />
              <span className="accent-italic">That's a security anti-pattern. Cedar Sentinel fixes it.</span>
            </h2>
          </div>
        </section>

        {/* Memory Tabs Section */}
        <section className="pi-memory-section">
          <div className="pi-container">
            <div className="memory-header">
              <h2>From agent reasoning to policy enforcement, at wire speed.</h2>
            </div>
            <MemoryTabs />
          </div>
        </section>

        {/* Logo Section */}
        <section className="pi-logo-section">
          <div className="pi-container">
            <h3>Chosen by teams that <span className="accent-italic">refuse to slow down</span></h3>
          </div>
        </section>

        {/* AI Assistant Section */}
        <section className="pi-assistant-section">
          <div className="pi-container">
            <p className="eyebrow">Meet Cedar Sentinel's AI governance assistant</p>
            <h2 className="section-heading-large">Sage knows every corner of your codebase, and your organization's full governance history, as well as your own engineers do.</h2>
            <p className="assistant-desc">Ask it anything, and get answers in seconds, not sprints.</p>
            <a className="button" href="#/sage">Learn more <ArrowRight size={17} /></a>
          </div>
        </section>

        {/* Together Section */}
        <section id="platform" className="pi-together-section">
          <div className="pi-container">
            <p className="eyebrow">THE ARCHITECTURE</p>
            <h2>Cedar Sentinel separates thinking from permission.</h2>
            <BenefitsSlider />
          </div>
        </section>

        {/* Works Section */}
        <section className="pi-works-section">
          <div className="pi-container">
            <h2>Built on proven infrastructure.</h2>
            <p>Cedar Sentinel integrates with the tools your team already depends on — Cedar policy engine, OpenSearch audit logs, and your existing cloud infrastructure.</p>
          </div>
        </section>

        {/* Flow Section */}
        <section id="how-it-works" className="section flow-section">
          <div>
            <p className="eyebrow">ONE REQUEST. A COMPLETE TRAIL.</p>
            <h2>From "can I?"<br />to <em>"here's why."</em></h2>
            <p className="section-description">Follow the path from an agent's request to a policy decision, execution, and a complete audit trail.</p>
            <a className="button" href="#/app/commands">Try a request <ArrowRight size={17} /></a>
          </div>
          <FlowSteps />
        </section>

        {/* Statement Section */}
        <section className="section statement">
          <p className="eyebrow">LESS BLIND TRUST. MORE CLARITY.</p>
          <h2>Your agent can be autonomous.<br />Its permissions<br />shouldn't be <em>ambiguous.</em></h2>
          <a className="button" href="#/app/dashboard">Open console <ArrowUpRight size={17} /></a>
          <p>Backend integration pending</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer pi-footer">
        <a href="#/" aria-label="Cedar Sentinel home"><Brand /></a>
        <div className="footer-links">
          <a href="#/about">About</a>
          <a href="#/faq">FAQ</a>
          <a href="#/privacy">Privacy</a>
          <a href="#/terms">Terms</a>
          <a href="#/contact">Contact</a>
        </div>
        <p>AI agents that act. Policies that prove it.</p>
        <span>CEDAR SENTINEL / AGENT GOVERNANCE</span>
      </footer>
    </div>
  );
}
