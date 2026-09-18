import { ArrowUpRight, ShieldCheck, CircleDashed } from 'lucide-react';

export default function Dashboard() {
  return <>
    <div className="page-heading"><div><p className="eyebrow">YOUR GOVERNANCE WORKSPACE</p><h1>Overview</h1><p className="muted">A clear view of what your agents are allowed to do.</p></div><a className="button" href="#/app/commands">New request <ArrowUpRight size={15} aria-hidden="true" /></a></div>
    <div className="demo-banner" role="status"><ShieldCheck size={18} aria-hidden="true" /><span><strong>A safe place to explore.</strong> This workspace simulates decisions locally. No agent, Cedar engine, or OpenSearch is connected.</span></div>
    <div className="metrics">
      <article><span>Total actions</span><strong>0</strong><small>This browser session</small></article>
      <article><span>Denial rate</span><strong>0%</strong><small>0 denied · 0 allowed</small></article>
      <article><span>Last audit</span><strong className="time-metric">No events yet</strong><small>Waiting for your first request</small></article>
    </div>
    <div className="dashboard-grid">
      <section className="panel" aria-labelledby="recent-decisions-heading">
        <div className="panel-heading"><h2 id="recent-decisions-heading">Recent decisions</h2><a className="text-link" href="#/app/audit">View audit log <ArrowUpRight size={14} aria-hidden="true" /></a></div>
        <div className="empty-state"><CircleDashed size={44} strokeWidth={1.2} aria-hidden="true" /><h2>No decisions. Yet.</h2><p>Try an allowed request, then test the boundary.<br />Both outcomes will appear here.</p><a className="text-link" href="#/app/commands">Run your first simulation <ArrowUpRight size={14} aria-hidden="true" /></a></div>
      </section>
      <section className="panel boundary-panel" aria-labelledby="boundary-heading">
        <p className="eyebrow">THE ACTIVE DEMO BOUNDARY</p>
        <h2 id="boundary-heading">Permission<br />before <em>action.</em></h2>
        <dl>
          <div><dt>Principal</dt><dd>refund-bot</dd></div>
          <div><dt>Action</dt><dd>IssueRefund</dd></div>
          <div><dt>Resource</dt><dd>Order 12345</dd></div>
          <div><dt>Limit</dt><dd>Up to $100</dd></div>
        </dl>
        <p>Illustrative rule, not a deployed Cedar policy.</p>
        <a className="text-link" href="#/app/commands">Test this boundary <ArrowUpRight size={14} aria-hidden="true" /></a>
      </section>
    </div>
  </>;
}
