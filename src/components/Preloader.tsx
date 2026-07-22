import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

const EASE = [0.76, 0, 0.24, 1] as const;

// Écran d'introduction : compteur + signature, puis rideau qui se lève.
export default function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1600;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // easing doux vers 100
      setCount(Math.round(100 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 250);
    };
    raf = requestAnimationFrame(tick);
    // Filet de sécurité : si l'onglet est en arrière-plan, rAF est throttlé
    // et le compteur peut se figer — on force la fin après un délai dur.
    const failsafe = setTimeout(() => { setCount(100); setDone(true); }, 4000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ y: '-100%' }}
          transition={{ duration: 1, ease: EASE }}
          className="fixed inset-0 z-[100] bg-[#0d0d0d] flex flex-col items-center justify-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="font-signature text-6xl md:text-8xl text-[#F0E2D3]"
          >
            Kareem
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-[11px] uppercase tracking-[0.4em] text-[#F0E2D3]/40 font-medium"
          >
            Portfolio · Design & IA
          </motion.span>
          <span className="absolute bottom-10 right-10 font-display text-5xl md:text-7xl font-light text-[#B86443] tabular-nums">
            {count}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
