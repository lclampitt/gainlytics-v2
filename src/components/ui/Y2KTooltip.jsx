import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Y2K Windows XP-style yellow tooltip.
 *
 * Usage:
 *   <Y2KTooltip text="Save to meals">
 *     <button>...</button>
 *   </Y2KTooltip>
 *
 * When Y2K mode is not active, just renders children with a native `title`.
 */
export default function Y2KTooltip({ text, children, enabled = true, delay = 400 }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, arrow: 'bottom' });
  const triggerRef = useRef(null);
  const timerRef = useRef(null);

  const show = useCallback(() => {
    if (!text || !enabled) return;
    timerRef.current = setTimeout(() => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const arrow = spaceBelow > 40 ? 'bottom' : 'top';

      setPos({
        x: rect.left + 4,
        y: arrow === 'bottom' ? rect.bottom + 6 : rect.top - 6,
        arrow,
      });
      setVisible(true);
    }, delay);
  }, [text, enabled, delay]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  if (!enabled || !text) {
    // When not Y2K, pass native title for accessibility
    return React.cloneElement(React.Children.only(children), { title: text });
  }

  const child = React.Children.only(children);

  return (
    <>
      {React.cloneElement(child, {
        ref: triggerRef,
        onMouseEnter: (e) => {
          show();
          child.props.onMouseEnter?.(e);
        },
        onMouseLeave: (e) => {
          hide();
          child.props.onMouseLeave?.(e);
        },
        onFocus: (e) => {
          show();
          child.props.onFocus?.(e);
        },
        onBlur: (e) => {
          hide();
          child.props.onBlur?.(e);
        },
        // Remove native title so browser tooltip doesn't show
        title: undefined,
      })}
      {visible &&
        createPortal(
          <div
            className={`y2k-tooltip ${visible ? 'y2k-tooltip--visible' : ''}`}
            style={{
              left: pos.x,
              top: pos.arrow === 'bottom' ? pos.y : undefined,
              bottom: pos.arrow === 'top' ? window.innerHeight - pos.y : undefined,
            }}
          >
            <div className={`y2k-tooltip__arrow y2k-tooltip__arrow--${pos.arrow}`} />
            {text}
          </div>,
          document.body
        )}
    </>
  );
}
