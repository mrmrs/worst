import { useEffect, useRef } from 'react';

export function useKeys(active = true) {
  const keys = useRef(new Set());

  useEffect(() => {
    if (!active) return;
    const down = (e) => {
      keys.current.add(e.key.toLowerCase());
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const up = (e) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      keys.current.clear();
    };
  }, [active]);

  return keys;
}

export function keyDown(keys, ...names) {
  return names.some((n) => keys.current.has(n.toLowerCase()));
}
