import PageLayout from '../components/PageLayout';

export default function Terms() {
  return (
    <PageLayout title="LEGAL" description={<>Terms & <em>Conditions</em></>}>
      <section className="info-content">
        <p className="info-updated">Last updated: September 18, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Cedar Sentinel, you agree to be bound by these Terms and Conditions.
          If you do not agree to these terms, do not use the platform. These terms apply to all
          visitors, users, and others who access or use the service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Cedar Sentinel provides a permission and audit layer for AI agents. The platform evaluates
          agent authorization requests against defined policies and maintains an audit trail of all
          decisions. Cedar Sentinel is provided as a software service and does not include the
          underlying AI agents or the systems they interact with.
        </p>

        <h2>3. Account Registration</h2>
        <p>
          To access certain features, you may need to create an account. You are responsible for
          maintaining the confidentiality of your account credentials and for all activities that
          occur under your account. You agree to provide accurate and complete information during
          registration and to keep that information up to date.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the platform for any unlawful purpose or in violation of any applicable regulations</li>
          <li>Attempt to circumvent or bypass authorization policies</li>
          <li>Interfere with or disrupt the platform's infrastructure or security</li>
          <li>Access another user's account without authorization</li>
          <li>Use the service to develop competing authorization systems</li>
          <li>Transmit malware, malicious code, or harmful content through the platform</li>
        </ul>

        <h2>5. Policy Configuration</h2>
        <p>
          You are responsible for configuring the authorization policies that govern your agents'
          behavior. Cedar Sentinel provides the engine for evaluating policies, but the policies
          themselves reflect your organization's requirements and decisions. You bear responsibility
          for ensuring that policies are correct, complete, and appropriate for your use case.
        </p>

        <h2>6. Audit Records</h2>
        <p>
          Cedar Sentinel maintains audit records of all policy decisions. These records belong to
          your organization and are subject to your data retention and access policies. You are
          responsible for managing audit log retention in compliance with your applicable legal and
          regulatory obligations.
        </p>

        <h2>7. Service Availability</h2>
        <p>
          We strive to provide reliable service, but we do not guarantee uninterrupted or
          error-free operation. We may perform maintenance, updates, or modifications that
          temporarily affect availability. We will make reasonable efforts to provide advance notice
          of planned downtime.
        </p>

        <h2>8. Intellectual Property</h2>
        <p>
          Cedar Sentinel and its associated software, design, documentation, and branding are owned
          by Cedar Sentinel and protected by intellectual property laws. You are granted a limited,
          non-exclusive, non-transferable license to use the platform in accordance with these terms.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Cedar Sentinel shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages arising from your use of
          the platform. Our total liability for any claim arising from or related to the service
          shall not exceed the amount you paid to us in the twelve months preceding the claim.
        </p>
        <p>
          Cedar Sentinel provides authorization decisions based on configured policies. We are not
          responsible for the actions of AI agents, the outcomes of authorized operations, or any
          consequences arising from policy configuration choices made by your organization.
        </p>

        <h2>10. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Cedar Sentinel, its officers, directors,
          employees, and agents from any claims, losses, damages, liabilities, and expenses arising
          from your use of the platform, your violation of these terms, or your violation of any
          third-party rights.
        </p>

        <h2>11. Modifications to Terms</h2>
        <p>
          We reserve the right to modify these Terms and Conditions at any time. When we make
          material changes, we will notify you through the platform or by email. Continued use of
          the platform after changes are posted constitutes acceptance of the modified terms.
        </p>

        <h2>12. Governing Law</h2>
        <p>
          These terms are governed by the laws of the jurisdiction in which Cedar Sentinel operates,
          without regard to conflict of law principles. Any disputes arising from these terms shall
          be resolved in the courts of that jurisdiction.
        </p>

        <h2>13. Contact</h2>
        <p>
          If you have questions about these Terms and Conditions, please reach out through our
          <a href="#/contact"> Contact page</a>.
        </p>
      </section>
    </PageLayout>
  );
}
