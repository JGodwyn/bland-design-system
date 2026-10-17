// A component's docs page: live demo with controls, every variant (the story), and props tables.
import { useState } from 'react';
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

  return (
    <Section title="Playground">
      <div className="docs-demo">
        <div className="docs-demo-stage">{demo.render(args)}</div>
        <form className="docs-controls" onSubmit={(e) => e.preventDefault()} aria-label="Props">
          {controls.map(({ name, control }) => {
            const id = `ctl-${name}`;
            const value = args[name];
            return (
              <div key={name} className="docs-control">
                <label htmlFor={id}>{name}</label>
                {control.kind === 'select' && (
                  <select id={id} className="bland-focus-ring" value={String(value)} onChange={(e) => set(name, parseOption(e.target.value, control.options))}>
                    {control.options.map((o) => (
                      <option key={String(o)} value={String(o)}>
                        {String(o)}
                      </option>
                    ))}
                  </select>
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
          <button type="button" className="docs-link-button bland-focus-ring" onClick={() => setArgs(demo.args)}>
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
