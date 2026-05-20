import { useEffect, useState } from 'react';

export function useCanvasSize(ref, dpr = Math.min(window.devicePixelRatio || 1, 2)) {
  const [size, setSize] = useState({ w: 0, h: 0, dpr });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const parent = el.parentElement || document.body;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      el.width = Math.floor(w * dpr);
      el.height = Math.floor(h * dpr);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      setSize({ w, h, dpr });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el.parentElement || el);
    window.addEventListener('orientationchange', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', update);
    };
  }, [ref, dpr]);

  return size;
}
