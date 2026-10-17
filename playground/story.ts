import type { ReactNode } from 'react';

/** A playground page: every state of one component. File: src/components/<name>/<name>.stories.tsx. */
export interface Story {
  title: string;
  render: () => ReactNode;
}
