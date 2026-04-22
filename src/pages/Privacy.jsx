import React, { useEffect } from 'react';
import '../styles/legal.css';

/**
 * Privacy Policy — static public page. Placeholder content until finalized.
 */
export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = 'Privacy Policy — MacroVault';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Privacy Policy</h1>
        <p className="legal-page__updated">Last updated: April 2026</p>

        <div className="legal-page__body">
          <p>
            This Privacy Policy is being finalized and will be published
            shortly. For questions contact{' '}
            <a href="mailto:lclampitt44@outlook.com">lclampitt44@outlook.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
