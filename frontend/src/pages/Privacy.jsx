import PageLayout from '../components/PageLayout';

export default function Privacy() {
  return (
    <PageLayout title="LEGAL" description={<>Privacy <em>Policy</em></>}>
      <section className="info-content">
        <p className="info-updated">Last updated: September 18, 2026</p>

        <h2>Introduction</h2>
        <p>
          Cedar Sentinel provides a permission and audit layer for AI agents. This Privacy Policy
          explains how we collect, use, and protect information when you use our platform and
          services. By using Cedar Sentinel, you agree to the practices described in this policy.
        </p>

        <h2>Information We Collect</h2>
        <p>
          Cedar Sentinel is designed with privacy in mind. Our platform processes agent authorization
          requests in real time and maintains audit records of policy decisions. The types of
          information we handle include:
        </p>
        <ul>
          <li><strong>Agent Request Data:</strong> When an agent submits a request for authorization,
            we process the principal identifier, the action being requested, the target resource,
            and any contextual information required for policy evaluation.</li>
          <li><strong>Audit Records:</strong> We maintain logs of policy decisions, including
            timestamps, request details, decisions made (allow or deny), and the policies applied.
            These records are essential for accountability and compliance.</li>
          <li><strong>Account Information:</strong> If you create an account, we collect your name,
            email address, and organization details necessary for authentication and service
            delivery.</li>
          <li><strong>Usage Data:</strong> We may collect anonymized usage statistics to improve
            platform performance and reliability, such as request volume, response times, and error
            rates.</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect for the following purposes:</p>
        <ul>
          <li>To evaluate and enforce authorization policies for agent actions</li>
          <li>To maintain a complete audit trail of policy decisions for accountability and compliance</li>
          <li>To authenticate users and manage access to the platform</li>
          <li>To provide support and respond to inquiries</li>
          <li>To improve the performance, security, and reliability of our services</li>
          <li>To comply with legal obligations and enforce our terms of service</li>
        </ul>

        <h2>Data Storage and Security</h2>
        <p>
          We implement industry-standard security measures to protect your data. Audit records and
          configuration data are stored in encrypted databases with access controls that limit
          exposure to authorized personnel only. We use TLS encryption for all data in transit and
          encryption at rest for stored data.
        </p>
        <p>
          Cedar Sentinel is designed to process authorization requests in real time without retaining
          unnecessary data. We do not store the full content of agent actions beyond what is required
          for policy evaluation and audit logging.
        </p>

        <h2>Data Sharing</h2>
        <p>
          We do not sell your data to third parties. We may share information in the following
          limited circumstances:
        </p>
        <ul>
          <li><strong>Service Providers:</strong> We work with trusted infrastructure providers who
            assist in delivering our services. These providers are bound by contractual obligations
            to protect your data.</li>
          <li><strong>Legal Requirements:</strong> We may disclose information if required by law,
            regulation, or legal process.</li>
          <li><strong>Security:</strong> We may share information if necessary to protect the rights,
            property, or safety of Cedar Sentinel, our users, or the public.</li>
        </ul>

        <h2>Data Retention</h2>
        <p>
          Audit records are retained according to the retention policy configured by your
          organization. You control how long decision logs are kept. Account information is retained
          for the duration of your account and for a reasonable period after deletion to handle any
          outstanding obligations.
        </p>

        <h2>Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the following rights:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your personal data</li>
          <li>Object to or restrict certain processing activities</li>
          <li>Data portability — receive your data in a structured, machine-readable format</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us using the information provided on our
          Contact page.
        </p>

        <h2>International Transfers</h2>
        <p>
          Your data may be processed in countries other than your own. We ensure that appropriate
          safeguards are in place for international data transfers, including standard contractual
          clauses where required by applicable law.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          Cedar Sentinel is not intended for use by individuals under the age of 16. We do not
          knowingly collect personal data from children. If you believe we have collected data from
          a child, please contact us immediately.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we make material changes, we
          will notify you through the platform or by email. Your continued use of Cedar Sentinel
          after changes are posted constitutes acceptance of the updated policy.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or our data practices, please reach out
          through our <a href="#/contact">Contact page</a>.
        </p>
      </section>
    </PageLayout>
  );
}
