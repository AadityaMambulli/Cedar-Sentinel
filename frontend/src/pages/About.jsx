import PageLayout from '../components/PageLayout';

export default function About() {
  return (
    <PageLayout title="ABOUT US" description={<>Building the permission layer for <em>autonomous agents.</em></>}>
      <section className="info-content">
        <h2>Why Cedar Sentinel Exists</h2>
        <p>
          AI agents are no longer a concept. They are here, operating in production, making decisions
          that affect real systems and real people. They issue refunds, query databases, send emails,
          and interact with APIs on behalf of organizations. But there is a growing gap between what
          agents are capable of doing and what organizations can confidently allow them to do.
        </p>
        <p>
          Cedar Sentinel was built to close that gap. It provides a permission and audit layer that
          sits between an agent's intent and its execution. Before any action runs, a policy check
          determines whether that action is allowed. After every decision, an audit trail captures the
          full context — the request, the outcome, and the reasoning behind it.
        </p>

        <h2>The Problem We Solve</h2>
        <p>
          When an AI agent takes action autonomously, organizations face three fundamental challenges.
          First, there is the question of permission: can this agent perform this specific action on
          this specific resource? Second, there is the question of scope: even if an action is
          permitted, what constraints apply? And third, there is the question of evidence: if
          something goes wrong, how do you trace the decision back to the policy that allowed or
          denied it?
        </p>
        <p>
          Without clear answers to these questions, teams either lock down agents so tightly that
          they become useless, or they grant broad permissions that create unacceptable risk.
          Cedar Sentinel offers a third path: fine-grained, policy-driven permission that gives
          agents exactly the room they need — no more, no less.
        </p>

        <h2>How It Works</h2>
        <p>
          Cedar Sentinel is built around three principles. Permission comes first: every agent
          request is evaluated against a Cedar policy before any execution occurs. A denied request
          never reaches the action layer. Evidence follows every decision: every allow and every
          deny is logged with its full context — principal, action, resource, and the policy that
          produced the result. And the boundary is explicit: policies are written in Cedar, a
          purpose-built policy language, so the rules are human-readable, auditable, and
          unambiguous.
        </p>
        <p>
          The flow is straightforward. An agent proposes a task. The request is passed to the policy
          engine. Cedar evaluates the request against the active policies and returns an allow or
          deny decision with a reason. If allowed, execution proceeds. If denied, the request stops
          at the gate. Either way, the full decision is recorded in a searchable audit log.
        </p>

        <h2>Built on Cedar</h2>
        <p>
          Cedar is an open-source policy language developed and battle-tested at Amazon Web Services.
          It is designed for authorization: determining who can do what under which conditions. Cedar
          policies are compact, formally specified, and optimized for fast evaluation. Cedar Sentinel
          leverages this foundation so that organizations do not have to build authorization logic
          from scratch.
        </p>
        <p>
          A Cedar policy might look like this: permit a specific agent to perform a specific action
          on a resource when a condition is met. For example, a refund bot might be allowed to issue
          refunds up to one hundred dollars. The policy is explicit about the principal, the action,
          and the constraint. There is no ambiguity, no implicit permission, and no reliance on
          default-allow behavior.
        </p>

        <h2>Audit and Accountability</h2>
        <p>
          Every decision Cedar Sentinel makes is recorded. The audit log captures the timestamp, the
          agent principal, the action requested, the resource targeted, and the decision reached.
          This means that when a question arises about why an agent performed a particular action,
          the answer is always available. Not in a vague log entry, but in a structured record that
          ties directly back to the policy that governed the decision.
        </p>
        <p>
          The audit log is searchable and filterable. Teams can look up decisions by agent, by action
          type, by time range, or by outcome. This makes it possible to answer questions like "which
          agents have attempted to access this resource?" or "how many refund requests were denied
          this week?" quickly and with confidence.
        </p>

        <h2>Designed for Real Integration</h2>
        <p>
          Cedar Sentinel is designed to sit between an existing agent framework and the execution
          layer. It does not require agents to be rewritten or restructured. Instead, it provides a
          clear integration point: before an agent executes an action, the request is passed through
          Cedar Sentinel for evaluation. The decision is returned, and the agent or orchestration
          layer acts accordingly.
        </p>
        <p>
          This approach means organizations can adopt Cedar Sentinel incrementally. Start with a
          single agent, a single action type, or a single resource. Expand the policy surface as
          confidence grows. The permission layer scales with the organization's needs, not the other
          way around.
        </p>

        <h2>Our Mission</h2>
        <p>
          The goal is not to slow agents down. The goal is to make autonomous action accountable.
          When an agent can act freely and every action is traceable to a clear policy, organizations
          gain the confidence to let agents do what they do best — move fast, handle routine tasks,
          and operate at scale — while maintaining the oversight that responsible operation demands.
        </p>
        <p>
          Cedar Sentinel exists because autonomy without accountability is a risk, and oversight
          without clarity is a bottleneck. We believe the path forward is permission before action
          and evidence after every decision.
        </p>
      </section>
    </PageLayout>
  );
}
