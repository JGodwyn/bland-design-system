// The site's 404 page (dist-site/404.html). Cloudflare Pages serves it with a 404 status for any path that has no
// file, once it exists (landing audit 2026-11-10; Godwin: logo, "Page not found", links home and to the docs).
// The theme follows the visitor's system (no data-theme on <html>).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../src/tokens/tokens.css';
import '../../../src/styles/fonts.css';
import '../../../src/styles/base.css';
import { Logo } from '../../../src';
// Button's CSS, which the link buttons below use without the Button component.
import '../../../src/components/button/button.css';
import './not-found.css';

/** A Bland Button drawn on a link (Button itself renders a <button>, which can't hold an href). */
function LinkButton({ href, type, children }: { href: string; type: 'primary' | 'stroke'; children: string }) {
  return (
    <a className="bland-button bland-focus-ring bland-smooth" data-size="md" data-emotion="brand" data-type={type} href={href}>
      <span className="bland-button__label">{children}</span>
    </a>
  );
}

function NotFound() {
  return (
    <main className="not-found">
      <Logo size="lg" href="/" />
      <div className="not-found__text">
        <h1 className="not-found__title">Page not found</h1>
        <p className="not-found__description">This address doesn't lead anywhere. It may have moved, or the link has a typo.</p>
      </div>
      <div className="not-found__actions">
        <LinkButton href="/" type="primary">
          Go to the home page
        </LinkButton>
        <LinkButton href="/docs/" type="stroke">
          Read the docs
        </LinkButton>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotFound />
  </StrictMode>,
);
