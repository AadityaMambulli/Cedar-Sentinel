import { ArrowRight, RefreshCw } from 'lucide-react';

export default function Error500() {
  return (
    <div className="error-page">
      <div className="error-content">
        <span className="error-code">500</span>
        <h1>Something went wrong</h1>
        <p>
          An unexpected error occurred. This is not your fault — the
          issue has been logged and our team will investigate.
        </p>
        <div className="error-actions">
          <button className="button" onClick={() => window.location.reload()}>
            Try again <RefreshCw size={16} />
          </button>
          <a className="button outline-button" href="#/">Go home <ArrowRight size={16} /></a>
        </div>
      </div>
    </div>
  );
}
