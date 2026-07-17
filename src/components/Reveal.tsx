import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef, type ReactNode } from 'react';

const EASE = [0.32, 0.72, 0, 1] as const;

// Révélation d'une ligne de texte par masque (slide-up depuis une boîte invisible).
// L'observer doit cibler le conteneur : l'élément masqué a une surface visible
// nulle tant qu'il est translaté hors de sa boîte, donc whileInView ne se
// déclencherait jamais dessus directement.
export function LineReveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      className={`block overflow-hidden ${className}`}
    >
      <motion.span
        variants={{ hidden: { y: '110%', rotate: 3 }, visible: { y: '0%', rotate: 0 } }}
        transition={{ duration: 1.1, delay, ease: EASE }}
        className="block origin-top-left will-change-transform"
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

function Word({ children, progress, range }: { children: ReactNode; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.28em] transition-opacity">
      {children}
    </motion.span>
  );
}

// Paragraphe qui s'allume mot par mot pendant le scroll.
// `segments` permet de colorer certains groupes de mots.
export function WordScrollReveal({ segments, className = '' }: {
  segments: { text: string; accent?: boolean }[];
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.35'] });

  const words = segments.flatMap(seg =>
    seg.text.split(' ').filter(Boolean).map(w => ({ word: w, accent: seg.accent }))
  );

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((w, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            <span className={w.accent ? 'text-[#B86443] font-medium' : undefined}>{w.word}</span>
          </Word>
        );
      })}
    </p>
  );
}
