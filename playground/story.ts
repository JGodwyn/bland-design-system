import type { ReactNode } from 'react';

/** A control in a component page's live demo. Most come from the props' types; override one here. */
export type Control =
  | { kind: 'select'; options: (string | boolean)[] }
  | { kind: 'boolean' }
  | { kind: 'text' };

/**
 * One component's docs page and screenshot fixture. File: src/components/<name>/<name>.stories.tsx.
 * `render` shows every state: it is the page's Variants section and what Playwright screenshots.
 */
export interface Story {
  title: string;
  /** What the component is for, in Figma's words. Falls back to the component's JSDoc. */
  description?: string;
  /** Export names whose props tables appear on the page, e.g. ['Button', 'IconButton']. */
  components?: string[];
  /** Live demo: controls built from `component`'s props, starting at `args`. */
  demo?: {
    component: string;
    args: Record<string, unknown>;
    /** Override a generated control, or `false` to hide one. Props of type ReactNode never get one. */
    controls?: Record<string, Control | false>;
    render: (args: Record<string, any>) => ReactNode;
    /**
     * The args the code snippet shows, when they differ from the controls: controls that only build
     * a slot's content are removed, and a string starting with "<" is printed as JSX.
     */
    code?: (args: Record<string, any>) => Record<string, unknown>;
  };
  render: () => ReactNode;
}
