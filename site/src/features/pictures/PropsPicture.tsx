// "Typed down to every prop": one component and its code (Stageshow bento kind). A live Button over a line of JSX
// whose `emotion` value is being completed: the editor's suggestions are Button's real ButtonEmotion values,
// and the type shows on the chosen one. On a loop the choice moves down the list (brand, success, danger,
// warning, and round again): the value rolls into the code and the Button above restyles. The list is a real
// listbox: click an option, or focus it and use the arrow keys, Home and End; your pick holds until the loop's
// next step. The Button and the code are decorative (aria-hidden, inert).
import { useId, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Button, type ButtonEmotion } from '../../../../src';
import { useLoop } from '../playback';
import { Roll } from '../Roll';
import type { PictureProps } from '../cards';

const EMOTIONS: ButtonEmotion[] = ['brand', 'success', 'danger', 'warning'];
const HOLD = [2200, 2200, 2200, 2200];
const POSTER = 1;

export function PropsPicture({ active, reduced }: PictureProps) {
  const step = useLoop(active, reduced, HOLD, 0, POSTER);
  // The card is on the page twice (Features and FeatureRow): option ids must not clash.
  const uid = useId();
  const [mine, setMine] = useState<{ index: number; step: number } | null>(null);
  const index = mine && mine.step === step ? mine.index : step;
  const emotion = EMOTIONS[index] ?? 'brand';
  const pick = (i: number) => setMine({ index: (i + EMOTIONS.length) % EMOTIONS.length, step });

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const to =
      e.key === 'ArrowDown' ? index + 1 : e.key === 'ArrowUp' ? index - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? EMOTIONS.length - 1 : null;
    if (to === null) return;
    e.preventDefault();
    pick(to);
  };

  return (
    <div className="props-pic" data-step={step} style={{ '--pick': index } as CSSProperties}>
      <div className="props-pic__result" aria-hidden inert>
        <Button emotion={emotion} type="primary" size="md">
          Deploy
        </Button>
      </div>
      <div className="props-pic__editor bland-smooth">
        <code className="props-pic__line" aria-hidden>
          <span className="props-pic__tag">{'<'}</span>
          <span className="props-pic__name">Button</span>
          <span className="props-pic__attr">{' '}emotion</span>
          <span className="props-pic__tag">=</span>
          <span className="props-pic__string">
            &quot;
            <Roll value={emotion} />
            &quot;
          </span>
          <span className="props-pic__caret" />
          <span className="props-pic__tag">{' />'}</span>
        </code>
        <div className="props-pic__menu">
          <span className="props-pic__highlight bland-smooth" aria-hidden />
          <ul
          className="props-pic__list"
          role="listbox"
          aria-label="Button emotion"
          tabIndex={0}
          aria-activedescendant={`${uid}-${emotion}`}
          onKeyDown={onKeyDown}
        >
          {EMOTIONS.map((e, i) => (
            <li
              key={e}
              id={`${uid}-${e}`}
              className="props-pic__option"
              role="option"
              aria-selected={i === index}
              onClick={() => pick(i)}
            >
              <span className="props-pic__value">&quot;{e}&quot;</span>
              <span className="props-pic__type">ButtonEmotion</span>
            </li>
          ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
