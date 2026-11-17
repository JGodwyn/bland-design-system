// "Rebrand with one color" (Figma 7243:40822, Godwin 2026-11-11). A panel with the hex and its shades, and under
// it a few real Bland parts that read the brand roles: a Button, a ticked Checkbox, and a sent Chat bubble with its
// Avatar. At the foot, a strip of color tabs; they take turns being active (the active one rises), and the active
// color rebrands the whole picture, its tint behind the panel included ("these should move one after the other,
// changing the theme; use more vibrant colors; the active color also changes the background"). Every scale is
// real `npm run brand -- generate` output in landing-values.css (`[data-rebrand]`); the picture and each tab set
// data-theme="light" on themselves, so Bland's roles are computed from their own steps. Decorative.
import type { CSSProperties } from 'react';
import { Avatar, Button, ChatBubble, Checkbox } from '../../../../src';
import { useLoop } from '../playback';
import { Roll } from '../Roll';
import type { PictureProps } from '../cards';

const noop = () => {};
/** The tabs, left to right: Bland's blue, then the generated vibrant brands. The hex is what each scale came from. */
const BRANDS = [
  { id: 'blue', hex: '#0062FF' },
  { id: 'violet', hex: '#7C3AED' },
  { id: 'green', hex: '#16A34A' },
  { id: 'red', hex: '#E5182E' },
  { id: 'amber', hex: '#F59E0B' },
] as const;
/** Eight of the thirteen shades, light to dark, as Figma's row. */
const SHADES = [100, 200, 300, 400, 500, 600, 800, 900] as const;
const HOLD = BRANDS.map(() => 2400);
const POSTER = 2;

export function RebrandPicture({ active, reduced }: PictureProps) {
  const step = useLoop(active, reduced, HOLD, 0, POSTER);
  const brand = BRANDS[step] ?? BRANDS[0];
  return (
    <div className="rebrand-pic" data-theme="light" data-rebrand={brand.id} data-brand={brand.id} data-step={step} aria-hidden inert>
      <div className="rebrand-pic__stack">
        <div className="rebrand-pic__panel bland-smooth">
          <div className="rebrand-pic__hex">
            <span className="rebrand-pic__dot bland-smooth" />
            <Roll value={brand.hex} className="rebrand-pic__hex-value" />
          </div>
          <div className="rebrand-pic__shades">
            {SHADES.map((s, i) => (
              <span key={s} className="rebrand-pic__shade bland-smooth" style={{ '--s': `var(--brand-${s})`, '--i': i } as CSSProperties} />
            ))}
          </div>
        </div>
        <div className="rebrand-pic__row">
          <Button emotion="brand" type="primary" size="sm">
            Button this
          </Button>
          <Checkbox checked onCheckedChange={noop} tabIndex={-1}>
            Built for your use
          </Checkbox>
        </div>
        <div className="rebrand-pic__chat">
          <ol className="rebrand-pic__thread">
            <ChatBubble who="sender" time="9:41 AM" status="delivered">
              Bland design system
            </ChatBubble>
          </ol>
          <Avatar size="lg" initials="A" />
        </div>
      </div>
      <div className="rebrand-pic__tabs">
        {BRANDS.map((b, i) => (
          // Each tab shows its color as picked; the picture wears the scale the brand tool makes from it (for a
          // light or very dark pick the tool shifts the shades so text stays readable).
          <span key={b.id} className="rebrand-pic__tab bland-smooth" data-current={b.id === brand.id || undefined} style={{ '--s': b.hex, '--i': i } as CSSProperties} />
        ))}
      </div>
    </div>
  );
}
