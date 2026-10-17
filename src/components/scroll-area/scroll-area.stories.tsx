import type { Story } from '../../../playground/story';
import { ScrollArea } from './ScrollArea';

const rows = Array.from({ length: 24 }, (_, i) => `Row ${i + 1}`);

export default {
  title: 'Scroll area',
  description:
    'Every scroll area that overflows shows a visible scrollbar and an edge fade, always both. The fade appears only on edges with hidden content. Use the sm fade in compact areas such as Menu. Truncated text is not overflow: it ends in an ellipsis.',
  components: ['ScrollArea'],
  demo: {
    component: 'ScrollArea',
    args: { axis: 'y', fadeSize: 'md' },
    controls: { viewportProps: false },
    render: ({ axis, fadeSize }) => (
      <ScrollArea axis={axis} fadeSize={fadeSize} style={{ width: 'min(320px, 100%)', height: 200, border: 'var(--stroke-sm) solid var(--border-subtle)', borderRadius: 'var(--rad-md)' }}>
        <div style={{ display: 'flex', flexDirection: axis === 'x' ? 'row' : 'column', gap: 'var(--space-sm)', padding: 'var(--space-lg)', width: axis === 'x' ? 'max-content' : undefined }}>
          {rows.map((r) => (
            <span key={r} style={{ padding: 'var(--space-xs) var(--space-sm)', background: 'var(--surface-200)', borderRadius: 'var(--rad-sm)' }}>{r}</span>
          ))}
        </div>
      </ScrollArea>
    ),
  },
  render: () => (
    <>
      <div className="pg-stack">
        <span className="pg-label">Vertical, overflowing (fade/md)</span>
        <ScrollArea style={{ height: 240, border: 'var(--stroke-sm) solid var(--border-subtle)', borderRadius: 'var(--rad-md)' }} data-testid="scroll-y" viewportProps={{ tabIndex: 0, 'aria-label': 'Rows' }}>
          <ul style={{ margin: 0, padding: 'var(--space-sm) var(--space-lg)', listStyle: 'none' }}>
            {rows.map((r) => (
              <li key={r} style={{ padding: 'var(--space-xs) 0' }}>{r}</li>
            ))}
          </ul>
        </ScrollArea>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Horizontal, compact (fade/sm)</span>
        <ScrollArea axis="x" fadeSize="sm" style={{ border: 'var(--stroke-sm) solid var(--border-subtle)', borderRadius: 'var(--rad-md)' }} data-testid="scroll-x" viewportProps={{ tabIndex: 0, 'aria-label': 'Chips' }}>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', padding: 'var(--space-lg)', width: 'max-content' }}>
            {rows.map((r) => (
              <span key={r} style={{ padding: 'var(--space-xs) var(--space-sm)', background: 'var(--surface-200)', borderRadius: 'var(--rad-sm)' }}>{r}</span>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="pg-stack">
        <span className="pg-label">Fits: no scrollbar, no fade</span>
        <ScrollArea style={{ height: 120, border: 'var(--stroke-sm) solid var(--border-subtle)', borderRadius: 'var(--rad-md)' }} data-testid="scroll-fits">
          <p style={{ margin: 0, padding: 'var(--space-lg)' }}>Short content.</p>
        </ScrollArea>
      </div>
    </>
  ),
} satisfies Story;
