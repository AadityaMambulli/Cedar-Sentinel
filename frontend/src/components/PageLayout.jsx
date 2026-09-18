import { ArrowUpRight } from 'lucide-react';
import Brand from './Brand';

export default function PageLayout({ children, title, description }) {
  return (
    <div className="info-page">
      <header className="site-nav">
        <a href="#/" aria-label="Cedar Sentinel home"><Brand /></a>
        <nav aria-label="Main navigation" className="info-nav-links">
          <a href="#/">Home</a>
          <a href="#/about">About</a>
          <a href="#/faq">FAQ</a>
          <a href="#/contact">Contact</a>
          <a className="mobile-console-link" href="#/app/dashboard">Open console <ArrowUpRight size={15} /></a>
        </nav>
        <a className="button small" href="#/app/dashboard">Open console <ArrowUpRight size={15} /></a>
      </header>
      <main id="main-content" className="info-main">
        <div className="info-container">
          {title && <p className="eyebrow">{title}</p>}
          {description && <h1>{description}</h1>}
          {children}
        </div>
      </main>
      <footer className="site-footer">
        <a href="#/" aria-label="Cedar Sentinel home"><Brand /></a>
        <div className="footer-links">
          <a href="#/about">About</a>
          <a href="#/faq">FAQ</a>
          <a href="#/privacy">Privacy</a>
          <a href="#/terms">Terms</a>
          <a href="#/contact">Contact</a>
        </div>
        <p>Permission before action.<br />Evidence after every decision.</p>
        <span>CEDAR SENTINEL / AGENT GOVERNANCE</span>
      </footer>
    </div>
  );
}
