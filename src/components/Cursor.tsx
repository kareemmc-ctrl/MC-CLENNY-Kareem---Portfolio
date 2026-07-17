import { motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';

// Curseur custom : point + anneau traînant en mix-blend-difference.
// Grossit sur les éléments interactifs. Désactivé sur écrans tactiles.
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    if (!fine.matches) return;
    setEnabled(true);
    document.documentElement.classList.add('has-cursor');

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement;
      setHovering(!!t.closest('a, button, [role="button"], input, textarea, select, label'));
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        style={{ x, y }}
        className="fixed top-0 left-0 z-[99] pointer-events-none mix-blend-difference"
      >
        <div className="w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </motion.div>
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="fixed top-0 left-0 z-[99] pointer-events-none mix-blend-difference"
      >
        <motion.div
          animate={{ scale: pressed ? 0.7 : hovering ? 2.2 : 1, opacity: hovering ? 0.9 : 0.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
        />
      </motion.div>
    </>
  );
}
