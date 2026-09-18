import { useState } from 'react';
import { Mail, MessageSquare, ArrowRight } from 'lucide-react';
import PageLayout from '../components/PageLayout';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <PageLayout title="GET IN TOUCH" description={<>Let's talk about <em>agent governance.</em></>}>
      <section className="info-content contact-section">
        <p className="contact-intro">
          Whether you have a question about Cedar Sentinel, need help with policy configuration,
          or want to discuss how authorization fits into your agent architecture, we are here to
          help.
        </p>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-card">
              <Mail size={20} />
              <div>
                <h3>Email</h3>
                <p>Reach us directly for technical questions, partnership inquiries, or general feedback.</p>
                <a href="mailto:hello@cedarsentinel.dev" className="text-link">hello@cedarsentinel.dev <ArrowRight size={14} /></a>
              </div>
            </div>
            <div className="contact-card">
              <MessageSquare size={20} />
              <div>
                <h3>Community</h3>
                <p>Join the conversation about AI agent governance, Cedar policies, and best practices for authorization.</p>
                <a href="#/" className="text-link">Visit our blog <ArrowRight size={14} /></a>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            {submitted ? (
              <div className="contact-success">
                <span className="empty-mark">✓</span>
                <h3>Message sent</h3>
                <p>Thank you for reaching out. We will get back to you within one business day.</p>
                <button className="button" onClick={() => setSubmitted(false)}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-pair">
                  <div>
                    <label htmlFor="contact-name">Name</label>
                    <input id="contact-name" type="text" required placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="contact-email">Email</label>
                    <input id="contact-email" type="email" required placeholder="you@company.com" />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject">Subject</label>
                  <select id="contact-subject" required>
                    <option value="">Select a topic</option>
                    <option value="technical">Technical support</option>
                    <option value="sales">Sales inquiry</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" required placeholder="Tell us how we can help..." rows={5} />
                </div>
                <button type="submit" className="button">Send message <ArrowRight size={16} /></button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
