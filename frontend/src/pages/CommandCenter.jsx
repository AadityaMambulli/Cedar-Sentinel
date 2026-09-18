import { ArrowRight, ArrowUpRight, ShieldCheck, Terminal } from 'lucide-react';

export default function CommandCenter() {
  return <>
    <div className="page-heading"><div><p className="eyebrow">INTENT → PERMISSION → ACTION</p><h1>Command center</h1><p className="muted">Follow a request through the permission boundary.</p></div><span className="outline-tag">LOCAL SANDBOX</span></div>
    <div className="command-layout">
      <section className="panel composer">
        <div className="panel-heading"><h2>Propose an action</h2><Terminal size={18} aria-hidden="true" /></div>
        <p className="muted">Fixed demo: IssueRefund on Order 12345. The task is a note, not an AI-parsed instruction.</p>
        <form onSubmit={event => event.preventDefault()}>
          <label htmlFor="task">Task description</label><textarea id="task" name="task" autoComplete="off" placeholder="e.g. Refund this customer’s order" />
          <div className="form-pair">
            <div><label htmlFor="agent">Agent principal</label><select id="agent" name="agent"><option value="refund-bot">refund-bot</option><option value="support-bot">support-bot</option></select></div>
            <div><label htmlFor="amount">Amount (USD)</label><input id="amount" name="amount" type="number" inputMode="decimal" step="0.01" defaultValue="49.99" /></div>
          </div>
          <div className="quick-actions"><span>TRY A SCENARIO</span>
            <button type="button">Allowed refund <ArrowUpRight size={12} aria-hidden="true" /></button>
            <button type="button">Over the limit <ArrowUpRight size={12} aria-hidden="true" /></button>
          </div>
          <button className="button" type="submit">Run simulation <ArrowRight size={16} aria-hidden="true" /></button>
        </form>
        <div className="demo-rule"><ShieldCheck size={18} aria-hidden="true" /><p><strong>Demo policy</strong><br />Only refund-bot · $0 &lt; amount ≤ $100<br />No real Cedar evaluation or execution.</p></div>
      </section>
      <section className="request-history" aria-label="Request history">
        <div className="empty-state panel"><span className="empty-mark">→</span><h2>Every action starts<br />with a question.</h2><p>Submit a request to inspect the proposal,<br />policy decision, and simulated result.</p></div>
      </section>
    </div>
  </>;
}
