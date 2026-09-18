import { ArrowRight } from 'lucide-react';
import Brand from '../components/Brand';

export default function NotFound() {
  return (
    <div className="error-page">
      <div className="error-content">
        <span className="error-code">404</span>
        <h1>Page not found</h1>
        <p>
          The page you are looking for does not exist, or has been moved.
          Check the URL or head back to a known route.
        </p>
        <div className="error-actions">
          <a className="button" href="#/">Go home <ArrowRight size={16} /></a>
          <a className="button outline-button" href="#/app/dashboard">Open console</a>
        </div>
      </div>
    </div>
  );
}
