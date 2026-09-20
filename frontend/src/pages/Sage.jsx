import PageLayout from '../components/PageLayout';
import { ArrowRight, MessageSquare, BookOpen, Shield, Search, Zap, Clock } from 'lucide-react';

const capabilities = [
  {
    icon: <MessageSquare size={22} />,
    title: 'Natural language queries',
    desc: 'Ask Sage anything about your governance setup in plain English. No need to remember policy names, agent IDs, or query syntax — Sage understands context and intent.',
  },
  {
    icon: <BookOpen size={22} />,
    title: 'Full governance history',
    desc: 'Sage has complete visibility into every policy decision, every agent action, and every audit event. It can trace a decision from intent to outcome across your entire organization.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Policy reasoning',
    desc: 'When a request is denied, Sage explains why — which policy was triggered, what condition failed, and what would need to change for the request to be allowed.',
  },
  {
    icon: <Search size={22} />,
    title: 'Audit trail exploration',
    desc: 'Search through your decision history by agent, action, resource, time range, or outcome. Sage surfaces patterns and anomalies that matter.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Real-time context',
    desc: 'Sage evaluates queries against your live policy set and current audit data. Answers reflect the actual state of your governance layer, not stale snapshots.',
  },
  {
    icon: <Clock size={22} />,
    title: 'Instant answers',
    desc: 'What used to require a ticket to the security team, a database query, and a 30-minute meeting now takes seconds. Sage eliminates the latency between question and answer.',
  },
];

const exampleQuestions = [
  'Which agents attempted to access production databases this week?',
  'Why was the refund bot denied permission to process a $500 refund?',
  'What policies govern email-sending agents in our finance department?',
  'How many policy violations occurred in the last 24 hours?',
  'Show me all agents with write access to user records.',
  'What would it take for the onboarding agent to send Slack invitations?',
];

export default function Sage() {
  return (
    <PageLayout title="SAGE AI ASSISTANT" description={<>Your governance history, <em>understood in seconds.</em></>}>
      <section className="info-content">
        <h2>What is Sage?</h2>
        <p>
          Sage is Cedar Sentinel's built-in AI governance assistant. It knows every corner of your
          codebase, your organization's full governance history, and your engineering team's context
          — as well as your own engineers do. Sage exists to close the gap between the questions
          your team asks about governance and the answers buried in your policy engine and audit logs.
        </p>
        <p>
          Instead of digging through OpenSearch indices, tracing Cedar policy evaluations manually,
          or filing tickets with the security team, you ask Sage. It understands your policies, your
          agents, your resource hierarchy, and your decision history — and it returns precise,
          contextual answers in seconds.
        </p>

        <h2>Why Sage Matters</h2>
        <p>
          Most governance systems generate enormous amounts of useful data but make it nearly
          impossible to consume. Cedar policies are evaluated in milliseconds. Audit logs accumulate
          by the millions. Agent actions happen continuously across dozens of systems. The data is
          there — the accessibility is not.
        </p>
        <p>
          Sage flips that dynamic. It sits on top of your governance layer and translates raw policy
          decisions and audit records into human-readable answers. It turns "the refund agent was
          denied" into "the refund agent was denied because Policy #14 limits refund actions to
          amounts under $200, and this request was for $500." That's the difference between having
          data and having understanding.
        </p>
      </section>

      <section className="sage-capabilities">
        <div className="pi-container">
          <h2>What Sage Can Do</h2>
          <div className="sage-cap-grid">
            {capabilities.map((cap) => (
              <div key={cap.title} className="sage-cap-card">
                <div className="sage-cap-icon">{cap.icon}</div>
                <h3>{cap.title}</h3>
                <p>{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sage-examples">
        <div className="pi-container">
          <h2>Example Questions</h2>
          <p>Here are some of the things you can ask Sage right now:</p>
          <ul className="sage-question-list">
            {exampleQuestions.map((q) => (
              <li key={q}>
                <span className="sage-q-mark">&ldquo;</span>{q}<span className="sage-q-mark">&rdquo;</span>
              </li>
            ))}
          </ul>
          <p>
            Sage pulls from your live Cedar policies, your OpenSearch audit trail, and your agent
            configuration to deliver answers that are grounded in your actual governance state — not
            generic guidance or hypotheticals.
          </p>
        </div>
      </section>

      <section className="info-content sage-how">
        <h2>How It Works</h2>
        <p>
          When you ask Sage a question, it decomposes your query into the relevant governance
          dimensions — which agents, which actions, which resources, and which time frame. It then
          queries your Cedar policy definitions and your audit log index to find the matching records.
          Finally, it synthesizes the results into a coherent answer that directly addresses your
          question.
        </p>
        <p>
          For policy-related questions, Sage reads your Cedar files and evaluates the logic to
          explain why a particular decision was made. For audit-related questions, it searches your
          decision log and presents the relevant entries with context. For forward-looking questions
          — like "what would change if I added a new policy?" — Sage simulates the impact and
          tells you exactly what would happen.
        </p>
      </section>

      <section className="sage-cta">
        <div className="pi-container">
          <p className="eyebrow">GET STARTED</p>
          <h2>Sage is ready to use in your Cedar Sentinel console.</h2>
          <p>Open the command center, type your question, and get an answer.</p>
          <a className="button" href="#/app/commands">
            Open the command center <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
