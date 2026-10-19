import { useCallback, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import './scroll-fade.css';
import './scroll-area.css';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Scroll direction. Defaults to vertical. */
  axis?: 'y' | 'x';
  /** Fade length: md (fade/md, 32) by default, sm (fade/sm, 16) for compact areas such as Menu. */
  fadeSize?: 'sm' | 'md';
  /** Extra props for the scrolling element, e.g. a role or an aria-label. */
  viewportProps?: HTMLAttributes<HTMLDivElement>;
  /**
   * Draws the visible thumb. Default true, as the overflow rule asks; tab rows turn it off and show more
   * content with the fade alone (Godwin, 2026-10-19).
   */
  scrollbar?: boolean;
}

/**
 * Every scroll area that overflows shows a visible scrollbar and an edge fade (CLAUDE.md, "Overflow").
 * Size it from outside (a max-height or a flex parent); it scrolls when its content is larger.
 */
export function ScrollArea({
  children,
  axis = 'y',
  fadeSize = 'md',
  viewportProps,
  scrollbar = true,
  className,
  ...rest
}: ScrollAreaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const update = useCallback(() => {
    const root = rootRef.current;
    const vp = viewportRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!root || !vp) return;

    const y = axis === 'y';
    const pos = y ? vp.scrollTop : vp.scrollLeft;
    const size = y ? vp.clientHeight : vp.clientWidth;
    const total = y ? vp.scrollHeight : vp.scrollWidth;
    const max = Math.max(0, total - size);
    const overflow = max > 1;

    toggle(root, 'data-overflow', overflow);
    toggle(vp, 'data-fade-start', overflow && pos > 1);
    toggle(vp, 'data-fade-end', overflow && pos < max - 1);
    if (!overflow || !track || !thumb) return;

    const trackSize = y ? track.clientHeight : track.clientWidth;
    // Proportional thumb; its CSS min size (control/xs) wins when content is very long.
    // Clear the other axis's length: after an axis switch it would otherwise stay inline and win
    // over the CSS (a 4px track drawing a thumb as tall as the old vertical one).
    thumb.style[y ? 'width' : 'height'] = '';
    thumb.style[y ? 'height' : 'width'] = `${(size / total) * trackSize}px`;
    const thumbSize = y ? thumb.offsetHeight : thumb.offsetWidth;
    const offset = max ? (pos / max) * (trackSize - thumbSize) : 0;
    thumb.style.transform = y ? `translateY(${offset}px)` : `translateX(${offset}px)`;
  }, [axis]);

  useLayoutEffect(() => {
    const vp = viewportRef.current;
    const content = contentRef.current;
    if (!vp || !content) return;
    update();
    vp.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(vp);
    ro.observe(content);
    return () => {
      vp.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [update]);

  // Dragging the thumb scrolls the viewport by the same proportion.
  const onThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!vp || !track || !thumb || e.button !== 0) return;
    e.preventDefault();
    const y = axis === 'y';
    const start = y ? e.clientY : e.clientX;
    const startScroll = y ? vp.scrollTop : vp.scrollLeft;
    const max = (y ? vp.scrollHeight - vp.clientHeight : vp.scrollWidth - vp.clientWidth) || 1;
    const travel = (y ? track.clientHeight - thumb.offsetHeight : track.clientWidth - thumb.offsetWidth) || 1;
    thumb.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const delta = ((y ? ev.clientY : ev.clientX) - start) * (max / travel);
      if (y) vp.scrollTop = startScroll + delta;
      else vp.scrollLeft = startScroll + delta;
    };
    const up = () => {
      thumb.removeEventListener('pointermove', move);
      thumb.removeEventListener('pointerup', up);
      thumb.removeEventListener('pointercancel', up);
    };
    thumb.addEventListener('pointermove', move);
    thumb.addEventListener('pointerup', up);
    thumb.addEventListener('pointercancel', up);
  };

  return (
    <div {...rest} ref={rootRef} className={className ? `bland-scroll-area ${className}` : 'bland-scroll-area'} data-axis={axis}>
      <div
        {...viewportProps}
        ref={viewportRef}
        className="bland-scroll-area__viewport bland-scroll-fade"
        data-fade-axis={axis === 'x' ? 'x' : undefined}
        data-fade-size={fadeSize === 'sm' ? 'sm' : undefined}
      >
        <div ref={contentRef} className="bland-scroll-area__content">
          {children}
        </div>
      </div>
      {scrollbar && (
        <div ref={trackRef} className="bland-scroll-area__track" aria-hidden="true">
          <div ref={thumbRef} className="bland-scroll-area__thumb" onPointerDown={onThumbPointerDown} />
        </div>
      )}
    </div>
  );
}

function toggle(el: HTMLElement, attr: string, on: boolean) {
  if (on) el.setAttribute(attr, '');
  else el.removeAttribute(attr);
}
