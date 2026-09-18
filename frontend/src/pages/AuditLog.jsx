import { useState } from 'react';
import { ArrowRight, Search, ScrollText } from 'lucide-react';

export default function AuditLog() {
  const [query, setQuery] = useState('');
  const [decision, setDecision] = useState('All');
  const [agent, setAgent] = useState('All');
  return <>
    <div className="page-heading"><div><p className="eyebrow">EVIDENCE, NOT ASSUMPTIONS</p><h1>Audit log</h1><p className="muted">Allowed and denied attempts, in one searchable trail.</p></div><span className="outline-tag">IN-MEMORY DEMO</span></div>
    <section className="panel console-audit" aria-label="Audit events">
      <div className="audit-toolbar">
        <div className="search-field"><Search size={17} aria-hidden="true" /><input aria-label="Search actions, agents, resources" placeholder="Search actions, agents, resources…" value={query} onChange={e => setQuery(e.target.value)} /></div>
        <select aria-label="Decision filter" value={decision} onChange={e => setDecision(e.target.value)}><option>All</option><option>Allow</option><option>Deny</option></select>
        <select aria-label="Agent filter" value={agent} onChange={e => setAgent(e.target.value)}><option>All</option><option>refund-bot</option><option>support-bot</option></select>
      </div>
      <div className="table-scroll" role="region" aria-label="Authorization events, scroll horizontally for more columns" tabIndex={0}>
        <table><caption className="sr-only">Authorization events</caption><thead><tr><th>Timestamp</th><th>Agent / Action</th><th>Resource</th><th>Decision</th><th>Details</th></tr></thead><tbody /></table>
      </div>
      <div className="empty-state"><ScrollText size={32} aria-hidden="true" /><h2>Your audit trail starts here.</h2><p>Run a command to record your first simulated decision.</p><a className="button small" href="#/app/commands">Try a request <ArrowRight size={15} aria-hidden="true" /></a></div>
      <div className="table-footer"><span>0 of 0 events</span><span>Session only · refresh clears events</span></div>
    </section>
  </>;
}
