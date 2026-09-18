import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PageLayout from '../components/PageLayout';

const faqs = [
  {
    q: 'What is Cedar Sentinel?',
    a: 'Cedar Sentinel is a permission and audit layer for AI agents. It evaluates agent authorization requests against defined Cedar policies before any action executes, and maintains a complete audit trail of every decision made.'
  },
  {
    q: 'What is Cedar?',
    a: 'Cedar is an open-source policy language developed and battle-tested at Amazon Web Services. It is purpose-built for authorization — determining who can do what under which conditions. Cedar policies are compact, formally specified, and optimized for fast evaluation.'
  },
  {
    q: 'How does Cedar Sentinel differ from traditional access control?',
    a: 'Traditional access control systems are designed for human users and static permissions. Cedar Sentinel is designed for AI agents that make dynamic, context-dependent requests. It evaluates each request individually against policies that can consider the agent, action, resource, and contextual conditions like time or amount.'
  },
  {
    q: 'Do I need to rewrite my agents to use Cedar Sentinel?',
    a: 'No. Cedar Sentinel is designed to sit between your existing agent framework and the execution layer. Before an agent executes an action, the request is passed through Cedar Sentinel for evaluation. The decision is returned, and your orchestration layer acts accordingly. No agent rewrites are required.'
  },
  {
    q: 'What happens when a request is denied?',
    a: 'When Cedar Sentinel denies a request, the action never reaches the execution layer. The agent receives a denial response with a reason, and the full context — the request, the decision, and the policy that produced it — is recorded in the audit log.'
  },
  {
    q: 'What kind of policies can I write?',
    a: 'Cedar policies support permit and deny rules with conditions. You can define which principals (agents) can perform which actions on which resources, with constraints like amount limits, time windows, or resource attributes. Policies are human-readable and auditable.'
  },
  {
    q: 'How does the audit log work?',
    a: 'Every policy decision is logged with its full context: the timestamp, agent principal, action requested, resource targeted, and the decision reached. The log is searchable and filterable, so you can look up decisions by agent, action type, time range, or outcome.'
  },
  {
    q: 'Can I use Cedar Sentinel in production?',
    a: 'Cedar Sentinel is designed for production use. The policy engine is built on Cedar, which is used in production at Amazon Web Services. The platform provides the integration points, audit infrastructure, and operational reliability needed for real-world deployments.'
  },
  {
    q: 'What integrations does Cedar Sentinel support?',
    a: 'Cedar Sentinel provides REST API endpoints for policy evaluation and audit log queries. It integrates with any agent framework that can make HTTP requests. We are actively expanding integration support for popular agent orchestration platforms.'
  },
  {
    q: 'Is Cedar Sentinel open source?',
    a: 'Cedar Sentinel is built on Cedar, which is open source. Cedar Sentinel itself is offered as a managed service with plans for self-hosted deployment options. Check our repository for the latest on licensing and availability.'
  },
  {
    q: 'How do I get started?',
    a: 'Start by exploring the console in simulation mode to understand how policy decisions work. Then define your first Cedar policy for a specific agent and action. Test it against sample requests, review the audit log, and expand from there. Our documentation walks you through each step.'
  }
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className={`faq-item ${isOpen ? 'is-open' : ''}`}>
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          <span>{item.q}</span>
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </h3>
      <div className="faq-answer" hidden={!isOpen}>
        <p>{item.a}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <PageLayout title="FREQUENTLY ASKED" description={<>Questions about <em>agent governance.</em></>}>
      <section className="info-content faq-section">
        <p className="faq-intro">
          Everything you need to know about Cedar Sentinel, Cedar policies, and how
          authorization works for AI agents.
        </p>
        <div className="faq-list">
          {faqs.map((item, index) => (
            <FAQItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
