// Step 3, "Copy the CSS. One file, loaded last. Done." Bland's own Code snippet holding the real brand.css for
// #e11d74 (the tool's output with the fixed step 400), whose Copy button really copies it; and a small app card
// that wears whatever is loaded (and the card's tint with it). On a loop the card's "brand.css" toggle switches on, the card turns pink, then
// off, back to Bland's blue. The toggle is real too: flip it yourself (the loop pauses while you are on the card,
// and your pick holds until its next step). The card's other parts are decorative.
import { useState } from 'react';
import { Avatar, Button, CodeSnippet, FileIcon, Icon, Toggle } from '../../../../src';
import { useLoop } from '../../features/playback';

const BRAND = `/* Load after tokens.css */
:root {
  --brand-0: #ffffff;
  --brand-50: #fef0f3;
  --brand-100: #fddde5;
  --brand-200: #fabecd;
  --brand-300: #f596b0;
  --brand-400: #f16694;
  --brand-500: #e11d74;
  --brand-600: #c70063;
  --brand-700: #a0004e;
  --brand-800: #7c003b;
  --brand-900: #5b002a;
  --brand-950: #43001d;
  --brand-1000: #300013;
  --neutral-0: #ffffff;
  --neutral-50: #f2f2f2;
  --neutral-100: #e7e5e5;
  --neutral-200: #cdc9ca;
  --neutral-300: #b5aeaf;
  --neutral-400: #9b9294;
  --neutral-500: #827a7c;
  --neutral-600: #686061;
  --neutral-700: #4f4849;
  --neutral-800: #342f31;
  --neutral-900: #1a1718;
  --neutral-950: #0d0b0c;
  --neutral-1000: #000000;
}`;

// 0 Bland's blue, the file not loaded; 1 loaded: the card wears #e11d74.
const HOLD = [1600, 2800];
const POSTER = 1;

export function CopyPicture({ active, reduced }: { active: boolean; reduced: boolean }) {
  const step = useLoop(active, reduced, HOLD, 0, POSTER);
  const [mine, setMine] = useState<{ on: boolean; step: number } | null>(null);
  const loaded = mine && mine.step === step ? mine.on : step === 1;
  return (
    <div className={`copy-pic${loaded ? ' brand-pink' : ''}`} data-theme="light" data-step={step} data-loaded={loaded || undefined}>
      <CodeSnippet
        className="copy-pic__code"
        code={BRAND}
        language="css"
        description="brand.css"
        copyLabel="Copy brand.css"
        collapsible={false}
        lineNumbers={false}
      />
      {/* A satellite: the file as the app loads it (icon, name, a switch), over a preview that wears it. */}
      <div className="copy-pic__app bland-smooth">
        <div className="copy-pic__file">
          <Icon size="sm" className="copy-pic__file-icon">
            <FileIcon />
          </Icon>
          <span className="copy-pic__file-name">brand.css</span>
          <Toggle aria-label="brand.css" checked={loaded} onCheckedChange={(on) => setMine({ on, step })} />
        </div>
        <div className="copy-pic__preview" aria-hidden inert>
          <Avatar size="sm" initials="M" />
          <span className="copy-pic__preview-lines">
            <span className="copy-pic__bar" />
            <span className="copy-pic__bar copy-pic__bar--short" />
          </span>
          <Button emotion="brand" type="primary" size="xs">
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
