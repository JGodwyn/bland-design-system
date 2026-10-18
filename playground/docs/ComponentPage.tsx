// A component's docs page: live demo with controls, every variant (the story), and props tables.
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Button } from '../../src/components/button/Button';
import { IconButton } from '../../src/components/button/IconButton';
import { Icon } from '../../src/components/icon/Icon';
import { CaretDownIcon, MinusIcon, PlusIcon } from '../../src/icons';
import type { Control, Story } from '../story';
import { componentDocs, type PropDoc } from './data';
import { PageHeader, Section } from './parts';

type Args = Record<string, unknown>;

export function ComponentPage({ story }: { story: Story }) {
  const primary = story.components?.[0] ?? story.demo?.component;
  const description = story.description ?? (primary ? componentDocs[primary]?.description : undefined);
  const names = story.components ?? (story.demo ? [story.demo.component] : []);
  return (
    <>
      <PageHeader eyebrow="Components" title={story.title}>
        {description}
      </PageHeader>
      {names.length > 0 && (
        <pre className="docs-code docs-import">
          <code>{`import { ${names.join(', ')} } from 'bland';`}</code>
        </pre>
      )}
      {story.demo && <Demo key={story.title} demo={story.demo} />}
      <Section title="Variants" note="Every state the component has. Hover and pressed show when you interact.">
        <div className="docs-variants">{story.render()}</div>
      </Section>
      {names.map((name) => (
        <PropsTable key={name} name={name} />
      ))}
    </>
  );
}

function Demo({ demo }: { demo: NonNullable<Story['demo']> }) {
  const [args, setArgs] = useState<Args>(demo.args);
  const doc = componentDocs[demo.component];
  const controls = buildControls(demo, doc?.props ?? []);
  const set = (name: string, value: unknown) => setArgs((a) => ({ ...a, [name]: value }));
  const [focused, setFocused] = useState(false);

  return (
    <Section title="Playground">
      <div className="docs-demo">
        <ZoomStage focused={focused}>{demo.render(args)}</ZoomStage>
        <form className="docs-controls" onSubmit={(e) => e.preventDefault()} aria-label="Props">
          {controls.map(({ name, control }) => {
            const id = `ctl-${name}`;
            const value = args[name];
            return (
              <div key={name} className="docs-control">
                <label htmlFor={id}>{name}</label>
                {control.kind === 'select' && (
                  <span className="docs-select">
                    <select id={id} className="bland-focus-ring" value={String(value)} onChange={(e) => set(name, parseOption(e.target.value, control.options))}>
                      {control.options.map((o) => (
                        <option key={String(o)} value={String(o)}>
                          {String(o)}
                        </option>
                      ))}
                    </select>
                    <Icon size="sm">
                      <CaretDownIcon />
                    </Icon>
                  </span>
                )}
                {control.kind === 'boolean' && (
                  <input id={id} type="checkbox" className="bland-focus-ring" checked={Boolean(value)} onChange={(e) => set(name, e.target.checked)} />
                )}
                {control.kind === 'text' && (
                  <input id={id} type="text" className="bland-focus-ring" value={String(value ?? '')} onChange={(e) => set(name, e.target.value)} />
                )}
              </div>
            );
          })}
          <div className="docs-control">
            <label htmlFor="ctl-focused">focused</label>
            <input id="ctl-focused" type="checkbox" className="bland-focus-ring" checked={focused} onChange={(e) => setFocused(e.target.checked)} />
          </div>
          <p className="docs-control-note">focused previews the keyboard focus ring; in code it is :focus-visible, not a prop.</p>
          <button
            type="button"
            className="docs-link-button bland-focus-ring"
            onClick={() => {
              setArgs(demo.args);
              setFocused(false);
            }}
          >
            Reset
          </button>
        </form>
      </div>
      <pre className="docs-code">
        <code>{snippet(demo.component, args, doc?.props ?? [])}</code>
      </pre>
    </Section>
  );
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const ZOOM_MIN = ZOOM_STEPS[0]!;
const ZOOM_MAX = ZOOM_STEPS.at(-1)!;
const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

/**
 * The demo's canvas. Zoom with the buttons at the bottom right, with + and - while the pointer is
 * over it, or by pinching on a trackpad; 0 resets the zoom and the position. Drag the background
 * to pan when zoomed in.
 */
function ZoomStage({ children, focused }: { children: ReactNode; focused: boolean }) {
  const [zoom, setZoom] = useState(1);
  const view = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  // Buttons and keys move to the next step; a pinch can leave the zoom between steps.
  const step = (dir: 1 | -1) =>
    setZoom((z) =>
      dir > 0 ? (ZOOM_STEPS.find((s) => s > z + 0.001) ?? ZOOM_MAX) : ([...ZOOM_STEPS].reverse().find((s) => s < z - 0.001) ?? ZOOM_MIN),
    );
  // Reset bumps `recenter` too, so it moves the view back even when the zoom is already 100%.
  const [recenter, setRecenter] = useState(0);
  const reset = () => {
    setZoom(1);
    setRecenter((n) => n + 1);
  };

  // A pinch zooms around the pointer: it records where the pointer was and the scroll and zoom it
  // started from, and the layout effect keeps that point under the pointer.
  const zoomRef = useRef(1);
  const anchor = useRef<{ x: number; y: number; left: number; top: number; from: number } | null>(null);

  // Keep the content centered whenever the zoom changes from a button, a key or a reset.
  useLayoutEffect(() => {
    zoomRef.current = zoom;
    const el = stage.current;
    if (!el) return;
    const a = anchor.current;
    anchor.current = null;
    if (a) {
      const f = zoom / a.from;
      el.scrollLeft = (a.left + a.x) * f - a.x;
      el.scrollTop = (a.top + a.y) * f - a.y;
      return;
    }
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [zoom, recenter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!hovering.current || e.metaKey || e.ctrlKey || e.altKey) return;
      // Leave typing alone: text fields and selects keep their keys; checkboxes and buttons don't need them.
      if ((e.target as HTMLElement).closest('input:not([type=checkbox], [type=radio]), select, textarea')) return;
      if (e.key === '+' || e.key === '=') step(1);
      else if (e.key === '-' || e.key === '_') step(-1);
      else if (e.key === '0') reset();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Trackpad pinch, only over the playground: Chrome and Firefox send it as a wheel event with
  // ctrlKey, Safari as gesture events. preventDefault stops the browser zooming the whole page.
  useEffect(() => {
    const el = view.current;
    if (!el) return;
    const zoomTo = (next: number, clientX: number, clientY: number) => {
      const st = stage.current;
      if (!st) return;
      const r = st.getBoundingClientRect();
      const from = anchor.current?.from ?? zoomRef.current;
      anchor.current = { x: clientX - r.left, y: clientY - r.top, left: anchor.current?.left ?? st.scrollLeft, top: anchor.current?.top ?? st.scrollTop, from };
      zoomRef.current = clampZoom(next);
      setZoom(zoomRef.current);
    };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return; // a plain two-finger scroll keeps scrolling
      e.preventDefault();
      zoomTo(zoomRef.current * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
    };
    type GestureEvent = UIEvent & { scale: number; clientX: number; clientY: number };
    let base = 1;
    const onGestureStart = (e: Event) => {
      e.preventDefault();
      base = zoomRef.current;
    };
    const onGestureChange = (e: Event) => {
      e.preventDefault();
      const g = e as GestureEvent;
      zoomTo(base * g.scale, g.clientX, g.clientY);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('gesturestart', onGestureStart);
    el.addEventListener('gesturechange', onGestureChange);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('gesturestart', onGestureStart);
      el.removeEventListener('gesturechange', onGestureChange);
    };
  }, []);

  // Drag on the background (not on the component) to pan.
  const pan = (e: PointerEvent<HTMLDivElement>) => {
    const el = stage.current;
    if (!el || e.button !== 0 || (e.target as HTMLElement).closest('button, a, input, select, textarea, [tabindex]')) return;
    if (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight) return;
    const start = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    el.setPointerCapture(e.pointerId);
    el.dataset.panning = '';
    const move = (m: globalThis.PointerEvent) => {
      el.scrollLeft = start.left - (m.clientX - start.x);
      el.scrollTop = start.top - (m.clientY - start.y);
    };
    const up = () => {
      delete el.dataset.panning;
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  };

  return (
    <div
      ref={view}
      className="docs-demo-view"
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      <div ref={stage} className="docs-demo-stage" onPointerDown={pan} data-testid="demo-stage">
        <div className={`docs-demo-canvas${focused ? ' pg-focus' : ''}`} style={{ zoom }}>
          {children}
        </div>
      </div>
      <div className="docs-zoom" role="group" aria-label="Zoom">
        <IconButton size="sm" type="secondary" icon={<MinusIcon />} aria-label="Zoom out" title="Zoom out (-)" onClick={() => step(-1)} disabled={zoom <= ZOOM_MIN} />
        <Button size="sm" type="ghost" aria-label="Reset zoom" title="Reset zoom and position (0)" onClick={reset} className="docs-zoom-level">
          {Math.round(zoom * 100)}%
        </Button>
        <IconButton size="sm" type="secondary" icon={<PlusIcon />} aria-label="Zoom in" title="Zoom in (+)" onClick={() => step(1)} disabled={zoom >= ZOOM_MAX} />
      </div>
    </div>
  );
}

/** Controls for the demo: the story's overrides first, then any prop with a type that has one. */
function buildControls(demo: NonNullable<Story['demo']>, props: PropDoc[]) {
  const names = [...new Set([...Object.keys(demo.args), ...props.map((p) => p.name)])];
  const out: { name: string; control: Control }[] = [];
  for (const name of names) {
    const override = demo.controls?.[name];
    if (override === false) continue;
    const prop = props.find((p) => p.name === name);
    const control = override ?? (prop ? autoControl(prop) : undefined);
    if (control) out.push({ name, control });
  }
  return out;
}

function autoControl(prop: PropDoc): Control | undefined {
  if (prop.options) return { kind: 'select', options: prop.options };
  if (prop.type === 'boolean') return { kind: 'boolean' };
  if (prop.type === 'string') return { kind: 'text' };
  return undefined; // ReactNode, objects and functions have no control
}

function parseOption(raw: string, options: (string | boolean)[]) {
  return options.find((o) => String(o) === raw) ?? raw;
}

/** JSX for the current args, leaving out props at their default. Values named like icons render as elements. */
function snippet(component: string, args: Args, props: PropDoc[]) {
  const attrs: string[] = [];
  let children = '';
  for (const [name, value] of Object.entries(args)) {
    const prop = props.find((p) => p.name === name);
    if (name === 'children') {
      children = typeof value === 'string' && /Icon$/.test(value) ? `<${value} />` : String(value ?? '');
      continue;
    }
    if (value === undefined || value === '' || value === 'none') continue;
    if (prop?.default !== undefined && String(value) === prop.default) continue;
    if (prop === undefined && value === false) continue;
    if (value === true) attrs.push(name);
    else if (value === false) attrs.push(`${name}={false}`);
    else if (typeof value === 'string' && /Icon$/.test(value)) attrs.push(`${name}={<${value} />}`);
    else if (typeof value === 'string') attrs.push(`${name}="${value}"`);
    else attrs.push(`${name}={${JSON.stringify(value)}}`);
  }
  const open = [component, ...attrs].join(' ');
  return children ? `<${open}>${children}</${component}>` : `<${open} />`;
}

function PropsTable({ name }: { name: string }) {
  const doc = componentDocs[name];
  if (!doc) {
    return (
      <Section title={`${name} props`}>
        <p className="docs-note">Props are generated when the docs start. Run npm run docs.</p>
      </Section>
    );
  }
  return (
    <Section title={`${name} props`} note={<>Native {name === 'ScrollArea' ? 'div' : 'element'} attributes also pass through. Source: <code>{doc.file}</code></>}>
      <div className="docs-table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              <th scope="col">Prop</th>
              <th scope="col">Type</th>
              <th scope="col">Default</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {doc.props.map((p) => (
              <tr key={p.name}>
                <td>
                  <code className="docs-prop">{p.name}</code>
                  {p.required && <span className="docs-required">required</span>}
                </td>
                <td>
                  <code className="docs-value">{p.options ? p.options.map((o) => `"${o}"`).join(' | ') : p.type}</code>
                </td>
                <td>{p.default !== undefined ? <code className="docs-value">{p.default}</code> : <span className="docs-muted">–</span>}</td>
                <td className="docs-desc">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
