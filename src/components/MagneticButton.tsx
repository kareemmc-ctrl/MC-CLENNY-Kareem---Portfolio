import { motion, useMotionValue, useSpring } from 'motion/react';
import { useRef, type ReactNode, type MouseEvent } from 'react';

// Bouton "magnétique" : suit légèrement le curseur au survol puis revient
// en place avec un léger rebond ressort. `as` choisit la balise sémantique.
export default function MagneticButton({
  as = 'button',
  children,
  className,
  strength = 0.3,
  ...rest
}: {
  as?: 'a' | 'button';
  children: ReactNode;
  className?: string;
  strength?: number;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 14, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 14, mass: 0.4 });

  const onMouseMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const style = { x: springX, y: springY };

  if (as === 'a') {
    return (
      <motion.a ref={ref} style={style} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={className} {...rest}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button ref={ref} style={style} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={className} {...rest}>
      {children}
    </motion.button>
  );
}
