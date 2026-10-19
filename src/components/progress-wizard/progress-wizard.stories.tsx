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

export default {
  title: 'Progress-wizard',
  description:
    'Multi-step progress (stepper). Layout: inline, centered or stacked steps; Style: bar (top bar per step) or connector (line between markers). Steps before current are done, the current step is bold with aria-current="step", the rest are next. Each step is progress/step-width wide, so the wizard hugs its steps, and shrinks to share a narrower row. Not interactive.',
  components: ['ProgressWizard'],
  demo: {
    component: 'ProgressWizard',
    args: { steps: 4, current: 1, layout: 'inline', style: 'bar', disabled: false },
    controls: {
      steps: { kind: 'select', options: ['2', '3', '4', '5'] },
      current: { kind: 'select', options: ['0', '1', '2', '3', '4', '5'] },
      progressLabels: false,
    },
    render: ({ steps, current, ...args }) => (
      <ProgressWizard {...args} steps={stepsOf(Number(steps))} current={Number(current)} aria-label="Sign-up progress" />
    ),
    code: ({ steps, current, ...args }) => ({
      ...args,
      current: Number(current),
      steps: `{${JSON.stringify(stepsOf(Number(steps)).map(({ title }) => ({ title })))}}`,
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
