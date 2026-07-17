import {
  motion, useAnimationFrame, useMotionValue, useScroll,
  useSpring, useTransform, useVelocity,
} from 'motion/react';
import { useRef, type ReactNode } from 'react';

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

// Bandeau défilant dont la vitesse et la direction réagissent au scroll,
// avec un léger skew proportionnel à la vélocité.
export default function VelocityMarquee({ children, baseVelocity = 2 }: { children: ReactNode; baseVelocity?: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [-2000, 0, 2000], [-4, 0, 4], { clamp: false });
  const skew = useTransform(smoothVelocity, [-2000, 2000], ['3deg', '-3deg']);

  const x = useTransform(baseX, v => `${wrap(-25, 0, v)}%`);
  const directionFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) directionFactor.current = -1;
    else if (vf > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * Math.abs(vf);
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap">
      <motion.div style={{ x, skewX: skew }} className="flex whitespace-nowrap flex-nowrap will-change-transform">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex items-center shrink-0">{children}</div>
        ))}
      </motion.div>
    </div>
  );
}
