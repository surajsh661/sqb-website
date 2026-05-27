'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  end?: string | number;
  suffix?: string;
  duration?: number;
  from?: number;
  to?: number;
}

export default function CountUp({ end, suffix, duration = 2000, from, to }: Props) {
  // Backward-compatible: accept either `end` or `from`+`to`
  const initial = typeof from === 'number' ? from : 0;
  const target = typeof to === 'number' ? to : parseFloat(String(end ?? 0));
  const [val, setVal] = useState<number>(initial);
  const ref = useRef<HTMLSpanElement | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !fired.current) {
          fired.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(initial + (target - initial) * eased);
            if (t < 1) requestAnimationFrame(tick);
            else setVal(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target, duration, initial]);

  const display = Number.isInteger(target) ? Math.round(val) : val.toFixed(1);
  return (
    <span ref={ref}>
      {display}
      {suffix && <span style={{ color: 'var(--accent)' }}>{suffix}</span>}
    </span>
  );
}
