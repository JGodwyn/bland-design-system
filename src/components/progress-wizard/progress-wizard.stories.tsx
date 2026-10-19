import type { Story } from '../../../playground/story';
import {
  ProgressWizard,
  type ProgressWizardLayout,
  type ProgressWizardStep,
  type ProgressWizardStyle,
} from './ProgressWizard';

const layouts: ProgressWizardLayout[] = ['inline', 'centered', 'stacked'];
const styles: ProgressWizardStyle[] = ['bar', 'connector'];

const fiveSteps: ProgressWizardStep[] = [
  { title: 'Account', description: 'Your details' },
  { title: 'Company', description: 'Your team' },
  { title: 'Plan', description: 'Pick a plan' },
  { title: 'Payment', description: 'Card details' },
  { title: 'Done', description: 'Start using it' },
];

const stepsOf = (count: number) => fiveSteps.slice(0, count);

/** The demo's steps, with or without their descriptions. */
const demoSteps = (count: number, description: boolean) =>
  stepsOf(count).map((step) => (description ? step : { title: step.title }));

export default {
  title: 'Progress-wizard',
  description:
    'Multi-step progress (stepper). Layout: inline, centered or stacked steps; Style: bar (top bar per step) or connector (line between markers). Steps before current are done, the current step is bold with aria-current="step", the rest are next. Each step is progress/step-width wide, so the wizard hugs its steps, and shrinks to share a narrower row; fill stretches the wizard across its container with equal steps. In an inline connector step a long title truncates with an ellipsis, so the line keeps at least space-xl. Not interactive.',
  components: ['ProgressWizard'],
  demo: {
    component: 'ProgressWizard',
    args: { steps: 4, current: 1, description: true, layout: 'inline', style: 'bar', disabled: false },
    controls: {
      steps: { kind: 'select', options: ['2', '3', '4', '5'] },
      current: { kind: 'select', options: ['0', '1', '2', '3', '4', '5'] },
      // Figma's 👀 Description: in code, a step with or without its `description`.
      description: { kind: 'boolean' },
      progressLabels: false,
    },
    render: ({ steps, current, description, ...args }) => (
      <ProgressWizard
        {...args}
        steps={demoSteps(Number(steps), description)}
        current={Number(current)}
        aria-label="Sign-up progress"
      />
    ),
    code: ({ steps, current, description, ...args }) => ({
      ...args,
      current: Number(current),
      steps: demoSteps(Number(steps), description),
    }),
  },
  render: () => (
    <>
      {styles.map((style) => (
        <div key={style} className="pg-stack">
          <span className="pg-label">style="{style}": inline, centered, stacked; step 2 of 5 current</span>
          {layouts.map((layout) => (
            <ProgressWizard
              key={layout}
              layout={layout}
              style={style}
              steps={fiveSteps}
              current={1}
              aria-label={`${layout} ${style}`}
            />
          ))}
        </div>
      ))}

      <div className="pg-stack">
        <span className="pg-label">2, 3 and 4 steps; every step done (current = steps.length)</span>
        <ProgressWizard steps={stepsOf(2)} current={1} aria-label="Two steps" />
        <ProgressWizard steps={stepsOf(3)} current={1} style="connector" layout="centered" aria-label="Three steps" />
        <ProgressWizard steps={stepsOf(4)} current={4} style="connector" aria-label="All done" />
      </div>

      <div className="pg-stack">
        <span className="pg-label">disabled: every step, both styles</span>
        {styles.map((style) => (
          <ProgressWizard
            key={style}
            style={style}
            layout={style === 'bar' ? 'inline' : 'centered'}
            steps={stepsOf(3)}
            current={1}
            disabled
            aria-label={`Disabled ${style}`}
          />
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">fill: the steps share the container's width (here 960)</span>
        {styles.map((style) => (
          <div key={style} style={{ width: 960, maxWidth: '100%' }}>
            <ProgressWizard fill style={style} steps={stepsOf(3)} current={1} aria-label={`Fill ${style}`} />
          </div>
        ))}
      </div>

      <div className="pg-stack">
        <span className="pg-label">A title too long for an inline connector step truncates; the line keeps its space-xl (24) minimum</span>
        <ProgressWizard
          style="connector"
          steps={[{ title: 'Billing and shipping address' }, { title: 'Payment' }, { title: 'Review' }]}
          current={0}
          aria-label="Long title"
        />
      </div>

      <div className="pg-stack">
        <span className="pg-label">Without descriptions</span>
        <ProgressWizard
          steps={stepsOf(4).map(({ title }) => ({ title }))}
          current={2}
          style="connector"
          aria-label="Titles only"
        />
      </div>
    </>
  ),
} satisfies Story;
