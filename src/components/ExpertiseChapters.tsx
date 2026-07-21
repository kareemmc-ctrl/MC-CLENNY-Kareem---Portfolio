import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const EASE = [0.32, 0.72, 0, 1] as const;

type Service = { num: string; title: string; desc: string; points: string[] };

// Colonne d'index à gauche : le grand numéro passe en fondu vers le suivant,
// une mini table des matières indique le chapitre actif.
function Rail({ services, active }: { services: Service[]; active: number }) {
  return (
    <div className="hidden md:flex flex-col justify-between h-full py-2">
      <div className="relative h-32">
        {services.map((s, i) => (
          <motion.span
            key={s.num}
            animate={{ opacity: active === i ? 1 : 0, filter: active === i ? 'blur(0px)' : 'blur(6px)', y: active === i ? 0 : 12 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute top-0 left-0 font-display italic text-7xl xl:text-8xl font-light text-[#B86443]"
          >
            {s.num}
          </motion.span>
        ))}
      </div>

      <ul className="flex flex-col gap-4">
        {services.map((s, i) => (
          <li key={s.num} className="flex items-center gap-3">
            <span className={`block h-px transition-all duration-500 ${active === i ? 'w-8 bg-[#B86443]' : 'w-3 bg-[#F0E2D3]/25'}`} />
            <span className={`text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors duration-500 ${active === i ? 'text-[#F0E2D3]' : 'text-[#F0E2D3]/35'}`}>
              {s.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Chapitre unique : grand titre, description, tags — pas de boîte, juste du
// papier éditorial sur fond continu, avec un numéro fantôme géant en fond.
function Chapter({ service, index, onActive }: { service: Service; index: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onActive(index); },
      { rootMargin: '-25% 0px -55% 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index, onActive]);

  return (
    <div ref={ref} className="relative py-16 md:py-20 pl-10 md:pl-16">
      <span className="pointer-events-none select-none absolute -top-6 md:-top-10 left-2 md:left-4 font-display italic text-[7rem] md:text-[10rem] leading-none text-[#F0E2D3]/[0.03] font-light">
        {service.num}
      </span>

      <span className="md:hidden font-display italic text-4xl text-[#B86443] block mb-4">{service.num}</span>

      <motion.h3
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative font-display text-3xl md:text-5xl font-medium tracking-tight mb-6 max-w-xl"
      >
        {service.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        className="relative text-base md:text-lg leading-relaxed font-light text-[#F0E2D3]/60 max-w-xl mb-8"
      >
        {service.desc}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        className="relative flex flex-wrap gap-2"
      >
        {service.points.map(p => (
          <span key={p} className="text-[11px] font-mono uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full border border-[#F0E2D3]/15 text-[#F0E2D3]/50">
            {p}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// Ligne d'encre verticale : la colonne vertébrale qui relie les chapitres,
// se dessine au fil du scroll — écho de celle de la section Méthode.
function InkSpine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.6'] });

  return (
    <div ref={ref} className="absolute left-0 top-0 bottom-0 w-6 hidden md:block" aria-hidden="true">
      <svg viewBox="0 0 24 1000" preserveAspectRatio="none" className="w-6 h-full overflow-visible">
        <motion.path
          d="M 12 4 C 4 120, 20 260, 12 400 S 2 620, 12 780 S 20 940, 12 996"
          fill="none"
          stroke="#B86443"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ pathLength: scrollYProgress }}
        />
      </svg>
    </div>
  );
}

export default function ExpertiseChapters({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid md:grid-cols-[200px_1fr] xl:grid-cols-[240px_1fr] gap-8 md:gap-16">
      <div className="hidden md:block sticky top-32 h-[50vh]">
        <Rail services={services} active={active} />
      </div>

      <div className="relative pb-[20vh]">
        <InkSpine />
        {services.map((s, i) => (
          <Chapter key={s.num} service={s} index={i} onActive={setActive} />
        ))}
      </div>
    </div>
  );
}
