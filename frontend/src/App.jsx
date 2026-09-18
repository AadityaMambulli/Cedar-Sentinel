import { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import CommandCenter from './pages/CommandCenter';
import AuditLog from './pages/AuditLog';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Error500 from './pages/Error500';

const INFO_ROUTES = ['about', 'privacy', 'terms', 'contact', 'faq'];

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const change = () => { setHash(window.location.hash); };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);

  const isApp = hash.startsWith('#/app/');
  const isInfo = hash.startsWith('#/') && INFO_ROUTES.includes(hash.split('/')[1]);
  const isError500 = hash === '#/error/500';

  let pageContent = null;

  if (isApp) {
    const route = hash.split('/')[2] || 'dashboard';
    pageContent = (
      <div className="app-shell">
        <Sidebar route={route} />
        <div className="app-body">
          <header className="app-topbar">
            <span>Workspace <span className="muted">/ {route === 'dashboard' ? 'Overview' : route}</span></span>
            <span className="demo-tag">SIMULATION MODE</span>
          </header>
          <main id="main-content" className="app-main">
            {route === 'commands' ? <CommandCenter /> : route === 'audit' ? <AuditLog /> : <Dashboard />}
          </main>
        </div>
      </div>
    );
  } else if (isInfo) {
    const infoRoute = hash.split('/')[1];
    pageContent = (
      <>
        {infoRoute === 'about' && <About />}
        {infoRoute === 'privacy' && <Privacy />}
        {infoRoute === 'terms' && <Terms />}
        {infoRoute === 'contact' && <Contact />}
        {infoRoute === 'faq' && <FAQ />}
      </>
    );
  } else if (isError500) {
    pageContent = <Error500 />;
  } else {
    pageContent = <Landing />;
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      {pageContent}
    </>
  );
}
