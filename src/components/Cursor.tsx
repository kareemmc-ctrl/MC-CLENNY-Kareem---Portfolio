import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';

// Curseur custom : point + anneau traînant en mix-blend-difference.
// Grossit sur les éléments interactifs, et affiche un label contextuel
// ("Voir", "Ouvrir"…) sur les éléments marqués data-cursor-text.
// Désactivé sur écrans tactiles.
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

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
      const labelEl = t.closest<HTMLElement>('[data-cursor-text]');
      setLabel(labelEl?.dataset.cursorText ?? null);
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
        animate={{ opacity: label ? 0 : 1 }}
        className="fixed top-0 left-0 z-[99] pointer-events-none mix-blend-difference"
      >
        <div className="w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </motion.div>
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="fixed top-0 left-0 z-[99] pointer-events-none mix-blend-difference"
      >
        <motion.div
          animate={{
            scale: pressed ? 0.7 : label ? 1 : hovering ? 2.2 : 1,
            opacity: hovering || label ? 0.9 : 0.5,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-white flex items-center justify-center overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {label ? (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white"
              >
                {label}
              </motion.span>
            ) : (
              <motion.span key="empty" className="block w-8 h-8" />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
