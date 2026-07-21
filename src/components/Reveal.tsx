import { motion, useScroll, useTransform, animate, type MotionValue } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const EASE = [0.32, 0.72, 0, 1] as const;

// Révélation mot par mot en flou->net, pour varier du slide-up de LineReveal
// sur un titre clé. `children` doit être une chaîne simple (pas de JSX imbriqué).
export function BlurReveal({ children, className = '', delay = 0, accentWords = 0 }: { children: string; delay?: number; className?: string; accentWords?: number }) {
  const words = children.split(' ');
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          initial={{ opacity: 0, filter: 'blur(14px)', y: 14 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.9, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          className={`inline-block mr-[0.25em] will-change-[filter,transform] ${accentWords > 0 && i >= words.length - accentWords ? 'italic text-[#B86443]' : ''}`}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

// Compteur qui s'incrémente de 0 à `to` une fois visible à l'écran.
// IntersectionObserver natif (plus fiable ici que useInView de Motion,
// qui ratait le déclenchement du premier élément d'une rangée).
export function Counter({ to, suffix = '', duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let controls: ReturnType<typeof animate> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        controls = animate(0, to, {
          duration,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: v => setValue(Math.round(v)),
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      controls?.stop();
    };
  }, [to, duration]);

  return <span ref={ref}>{value}{suffix}</span>;
}

// Trait d'encre terracotta qui se dessine au fil du scroll, comme un stylo
// qui relie les étapes sur le papier. Ondulation légère pour un tracé "main".
export function InkLine({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.3'] });

  return (
    <div ref={ref} className={`w-full ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-10 overflow-visible">
        <motion.path
          d="M 4 34 C 120 14, 240 48, 380 32 S 620 12, 780 34 S 1040 50, 1196 26"
          fill="none"
          stroke="#B86443"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ pathLength: scrollYProgress }}
        />
        {/* Goutte d'encre au départ du trait */}
        <motion.circle
          cx="4"
          cy="34"
          r="4"
          fill="#B86443"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [0, 1]) }}
        />
      </svg>
    </div>
  );
}

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
