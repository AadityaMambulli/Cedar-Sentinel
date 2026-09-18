import { ArrowRight, ArrowUpRight, ShieldCheck, ScanLine, Fingerprint, Menu, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import gsap from 'gsap';
import Brand from '../components/Brand';

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

  return <div ref={flowRef} className="flow-player" data-playing={playing}>
    <ol className="flow-list">
      {flowSteps.map(([title, description], index) => <li key={title} className={index === step ? 'is-active' : index < step ? 'is-complete' : ''}>
        <h3><button type="button" id={`flow-step-${index}`} aria-expanded={step === index} aria-controls={`flow-description-${index}`} onClick={() => { setStep(index); setSelection(current => current + 1); }}>
          <span className="flow-marker" aria-hidden="true" /><span>{title}</span>
        </button></h3>
        <div id={`flow-description-${index}`} role="region" aria-labelledby={`flow-step-${index}`} hidden={step !== index} className="flow-description"><p>{description}</p></div>
        <div className="flow-track" aria-hidden="true"><span key={`${index}-${step}-${selection}`} className="flow-progress" onAnimationEnd={event => {
          if (event.animationName === 'flow-progress' && index === step && playing) setStep(current => (current + 1) % flowSteps.length);
        }} /></div>
      </li>)}
    </ol>
  </div>;
}

export default function Landing() {
  const [menu, setMenu] = useState(false);
  const [platformStep, setPlatformStep] = useState(0);
  const landscapeRef = useRef(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
      timeline.from('.sun', { y: 80, opacity: 0, scale: 0.7, duration: 1.8 })
        .from('.ridge', { yPercent: 65, duration: 1.5, stagger: 0.18 }, 0.2)
        .from('.landscape-caption', { opacity: 0, y: 8, duration: 0.8 }, 1.2);
      gsap.to('.sun', { y: -10, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.8 });
      gsap.to('.ridge-back', { xPercent: 2, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });
      gsap.to('.ridge-mid', { xPercent: -1.5, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });
    }, landscapeRef);
    return () => media.revert();
  }, []);
  useEffect(() => {
    if (!menu) return;
    const onKey = (event) => { if (event.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);
  return <div className="landing">
    <div className="announcement"><span className="status-dot" /> Meet your agents’ new permission layer. <a href="#/app/dashboard">Explore the console <ArrowUpRight size={13} /></a></div>
    <header className="site-nav"><a href="#/" aria-label="Cedar Sentinel home"><Brand /></a><nav id="site-menu" aria-label="Main navigation" className={menu ? 'is-open' : ''}><a href="#platform" onClick={() => setMenu(false)}>Platform</a><a href="#how-it-works" onClick={() => setMenu(false)}>How it works</a><a href="#governance" onClick={() => setMenu(false)}>Why governance</a><a className="mobile-console-link" href="#/app/dashboard" onClick={() => setMenu(false)}>Open console <ArrowUpRight size={15} /></a></nav><a className="button small" href="#/app/dashboard">Open console <ArrowUpRight size={15} /></a><button className="menu-toggle" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="site-menu" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button></header>
    <main id="main-content">
      <section className="hero"><div className="hero-grid" aria-hidden="true" /><div className="hero-copy"><p className="eyebrow">AUTONOMY, WITH ACCOUNTABILITY</p><h1>Let agents move <em>fast.</em><br />Keep control of<br className="mobile-break" /> what happens next.</h1><p className="hero-description">A permission and audit layer for AI agents. Put a clear boundary between what an agent wants to do and what it’s allowed to do.</p><div className="hero-actions"><a className="button" href="#/app/dashboard">See it in action <ArrowRight size={17} /></a><a className="text-link" href="#how-it-works">Follow an action <span>↓</span></a></div><p className="hero-note">CEDAR POLICIES. EXPLICIT DECISIONS. A TRACE FOR EVERY ACTION.</p></div>
      <div ref={landscapeRef} className="landscape" aria-hidden="true"><div className="sun" /><div className="ridge ridge-back" /><div className="ridge ridge-mid" /><div className="ridge ridge-front" /><div className="landscape-caption">A CLEAR PATH. A DEFINED BOUNDARY.</div></div>
      <div className="hero-receipt"><span className="receipt-label"><span className="status-dot" /> ANATOMY OF A DECISION</span><div><code>agent.request</code><ArrowRight size={14} /><code>cedar.check</code><ArrowRight size={14} /><span className="badge allow">ALLOW</span></div><small>Permission first. Execution second. Evidence always.</small></div></section>
      <div className="principles-strip"><span>Built for the space between</span><strong>Agent intent</strong><span className="strip-arrow">→</span><strong>Policy decision</strong><span className="strip-arrow">→</span><strong>Accountable action</strong></div>
      <section id="platform" className="section platform"><div className="section-intro"><p className="eyebrow">THE BOUNCER + THE CAMERA</p><h2>Confidence isn’t a prompt.<br />It’s a <em>permission.</em></h2><p>Give agents room to work without giving them the keys to everything. Cedar Sentinel brings decisions and their evidence into one place.</p></div><div className="platform-layout"><div className="platform-story">{[["Set the boundary.", "Define which principals can act on which resources. Make permission explicit, not implied.", ShieldCheck], ["Check before the action.", "Inspect the policy outcome before an operation runs. A denied request stops at the gate.", ScanLine], ["Keep the whole story.", "Follow the request, the decision, and the result in a searchable audit view.", Fingerprint]].map(([title, text, Icon], index) => (<div className="feature-row" key={title}><Icon /><div><button type="button" aria-pressed={platformStep === index} onClick={() => setPlatformStep(index)}>{title}</button><p hidden={platformStep !== index}>{index === 1 ? 'Every request gets a decision.' : index === 2 ? 'Every decision leaves a trace.' : text}</p></div></div>))}</div><div className="policy-preview"><div className="preview-top"><span><span className="status-dot" /> POLICY EXPLORER</span><span>ILLUSTRATIVE</span></div><div className="code-title">A little policy. A clear boundary.</div><pre><code><span className="syntax-orange">permit</span> (
  principal == Agent::<span className="syntax-teal">"refund-bot"</span>,
  action == Action::<span className="syntax-teal">"IssueRefund"</span>,
  resource
)
<span className="syntax-orange">when</span> {'{'}
  context.amount &lt;= 100
{'}'};</code></pre><div className="preview-bottom"><ShieldCheck size={16} /> Explicit scope. No permission by assumption.</div></div></div></section>
      <section id="how-it-works" className="section flow-section"><div><p className="eyebrow">ONE REQUEST. A COMPLETE TRAIL.</p><h2>From “can I?”<br />to <em>“here’s why.”</em></h2><p className="section-description">Follow the path from an agent’s request to a policy decision, execution, and a complete audit trail.</p><a className="button" href="#/app/commands">Try a request <ArrowRight size={17} /></a></div><FlowSteps /></section>
      <section id="governance" className="section statement"><p className="eyebrow">LESS BLIND TRUST. MORE CLARITY.</p><h2>Your agent can be autonomous.<br />Its permissions<br />shouldn’t be <em>ambiguous.</em></h2><a className="button" href="#/app/dashboard">Open console <ArrowUpRight size={17} /></a><p>Backend integration pending</p></section>
    </main><footer className="site-footer"><a href="#/" aria-label="Cedar Sentinel home"><Brand /></a><div className="footer-links"><a href="#/about">About</a><a href="#/faq">FAQ</a><a href="#/privacy">Privacy</a><a href="#/terms">Terms</a><a href="#/contact">Contact</a></div><p>Permission before action.<br />Evidence after every decision.</p><span>CEDAR SENTINEL / AGENT GOVERNANCE</span></footer>
  </div>;
}
