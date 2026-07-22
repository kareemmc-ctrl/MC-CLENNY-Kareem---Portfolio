import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { useRef, useState } from 'react';

// Livre papier 3D qui s'ouvre au fil du scroll (section sticky).
// La couverture puis une page intérieure pivotent autour de la reliure.
export default function BookSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [showTitle, setShowTitle] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.05) {
      if (showTitle) setShowTitle(false);
    } else {
      if (!showTitle) setShowTitle(true);
    }
  });

  const coverRotate = useTransform(scrollYProgress, [0.08, 0.42], [0, -180]);
  const pageRotate = useTransform(scrollYProgress, [0.5, 0.82], [0, -180]);
  const bookScale = useTransform(scrollYProgress, [0, 0.3], [0.82, 1]);
  const bookTilt = useTransform(scrollYProgress, [0, 0.42], [18, 6]);
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.3], [0.25, 0.55]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.02, 0.05], [1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.05], [0, -35]);
  const hintOpacity = useTransform(scrollYProgress, [0.85, 0.95], [1, 0]);

  // Ombrage dynamique des faces pendant la rotation
  const coverShade = useTransform(coverRotate, [-180, -90, 0], [0, 0.45, 0]);
  const pageShade = useTransform(pageRotate, [-180, -90, 0], [0, 0.45, 0]);

  return (
    <section ref={containerRef} className="relative h-[420vh] bg-[#121212]" id="manifeste">
      <div className="sticky top-0 h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden">

        {/* Titre d'intro, disparaît quand le livre s'ouvre */}
        {showTitle && (
          <motion.div
            style={{ opacity: titleOpacity, y: titleY }}
            className="absolute top-[10%] md:top-[12%] z-10 flex flex-col items-center text-center px-6 pointer-events-none"
          >
            <span className="rounded-full border border-[#B86443]/30 bg-[#B86443]/5 px-5 py-2 text-[11px] uppercase tracking-[0.3em] font-semibold text-[#B86443] mb-5">
              Le Manifeste
            </span>
            <h2 className="font-display text-5xl md:text-7xl font-light tracking-tight text-[#F0E2D3] drop-shadow-md">
              Ouvrez le <em className="italic text-[#B86443] font-normal">livre</em>
            </h2>
          </motion.div>
        )}

        {/* Scène 3D — entre en douceur dans le viewport */}
        <motion.div
          style={{ perspective: '2600px' }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
          className="relative w-[min(92vw,1040px)]"
        >
          <motion.div
            style={{ scale: bookScale, rotateX: bookTilt, transformStyle: 'preserve-3d' }}
            className="relative w-full"
          >
            {/* Le livre : la moitié droite porte les pages, la gauche les reçoit */}
            <div
              className="relative w-full aspect-[2/3] sm:aspect-[16/10]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Plat verso (fond gauche, visible avant ouverture : vide) */}
              <div className="absolute left-0 top-0 w-1/2 h-full" />

              {/* Page de droite (fond) — Chapitre 02 */}
              <div className="paper absolute right-0 top-0 w-1/2 h-full rounded-r-md p-[6%] flex flex-col justify-between text-[#1c120c] shadow-[inset_20px_0_35px_-20px_rgba(0,0,0,0.5)]">
                <div>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-sans font-bold text-[#B86443]">Chapitre 02</span>
                  <h3 className="font-display text-[clamp(1.4rem,2.8vw,2.2rem)] font-semibold mt-2 mb-[6%]">La méthode</h3>
                  <ul className="font-sans text-[clamp(0.78rem,1.3vw,1.05rem)] leading-relaxed space-y-[4%]">
                    {[
                      ['01', 'Découverte', 'Comprendre la marque, l’audience, l’objectif.'],
                      ['02', 'Design', 'Direction artistique forte, prototypage soigné.'],
                      ['03', 'Développement', 'Code performant, animations au pixel près.'],
                      ['04', 'Données & IA', 'Mesurer, automatiser, itérer intelligemment.'],
                    ].map(([n, t, d]) => (
                      <li key={n} className="flex gap-3 items-baseline border-b border-[#1c120c]/10 pb-[3%]">
                        <span className="font-display italic text-[#B86443] font-semibold">{n}</span>
                        <span><strong className="font-semibold text-[#1c120c]">{t}</strong> : <span className="text-[#1c120c]/85">{d}</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-signature text-[clamp(1.5rem,3.2vw,2.8rem)] text-[#B86443] -rotate-3">Kareem</span>
                  <span className="font-sans text-[10px] opacity-50">04</span>
                </div>
              </div>

              {/* Page intérieure volante : recto = citation, verso = chiffres */}
              <motion.div
                style={{ rotateY: pageRotate, transformStyle: 'preserve-3d', transformOrigin: 'left center', translateZ: 1 }}
                className="absolute right-0 top-0 w-1/2 h-full will-change-transform"
              >
                {/* Recto — citation */}
                <div className="paper absolute inset-0 rounded-r-md p-[7%] flex flex-col justify-between text-[#1c120c] [backface-visibility:hidden] shadow-[inset_20px_0_35px_-20px_rgba(0,0,0,0.5)]">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-sans font-bold text-[#B86443]">Chapitre 01</span>
                  <blockquote className="font-display italic font-light text-[clamp(1.15rem,2.4vw,1.95rem)] leading-relaxed text-[#1c120c]">
                    « Un site ne doit pas seulement se voir.<br />
                    Il doit se <span className="text-[#B86443] not-italic font-semibold">ressentir</span>, comme le papier
                    entre les doigts. »
                  </blockquote>
                  <span className="font-sans text-[10px] opacity-50 self-end">02</span>
                  <motion.div style={{ opacity: pageShade }} className="absolute inset-0 bg-black pointer-events-none rounded-r-md" />
                </div>
                {/* Verso — chiffres (devient page de gauche) */}
                <div
                  className="paper absolute inset-0 rounded-l-md p-[7%] flex flex-col justify-between text-[#1c120c] [backface-visibility:hidden] shadow-[inset_-20px_0_35px_-20px_rgba(0,0,0,0.5)]"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-sans font-bold text-[#B86443]">En chiffres</span>
                  <div className="space-y-[7%]">
                    {[
                      ['★', 'Expert Marketing Digital'],
                      ['01', 'studio créatif fondé : Framo, Nancy'],
                      ['∞', 'curiosité pour la suite'],
                    ].map(([n, label]) => (
                      <div key={label} className="flex items-baseline gap-4 border-b border-[#1c120c]/10 pb-[4%]">
                        <span className="font-display text-[clamp(1.6rem,3.6vw,3rem)] font-bold text-[#B86443]">{n}</span>
                        <span className="font-sans text-[clamp(0.78rem,1.3vw,1.05rem)] text-[#1c120c] font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                  <span className="font-sans text-[10px] opacity-50">03</span>
                </div>
              </motion.div>

              {/* Couverture : recto = plat, verso = première page de gauche */}
              <motion.div
                style={{ rotateY: coverRotate, transformStyle: 'preserve-3d', transformOrigin: 'left center', translateZ: 2 }}
                className="absolute right-0 top-0 w-1/2 h-full will-change-transform"
              >
                {/* Recto — la couverture */}
                <div className="absolute inset-0 rounded-r-lg bg-[#1d1510] border border-[#B86443]/25 [backface-visibility:hidden] flex flex-col items-center justify-center text-center p-[8%] shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.8),0_0_40px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-[5%] border border-[#B86443]/30 rounded-sm pointer-events-none" />
                  <div className="absolute left-0 top-0 h-full w-[6px] bg-gradient-to-r from-black/70 to-transparent" />
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] font-sans font-semibold text-[#B86443] mb-[6%]">Édition 2026</span>
                  <h3 className="font-display text-[clamp(1.2rem,3vw,2.6rem)] font-light text-[#F0E2D3] leading-tight">
                    Manifeste<br /><em className="italic text-[#B86443]">du design</em>
                  </h3>
                  <span className="font-signature text-[clamp(1.2rem,2.6vw,2.2rem)] text-[#F0E2D3]/80 mt-[8%]">Kareem</span>
                  <motion.div style={{ opacity: coverShade }} className="absolute inset-0 bg-black pointer-events-none rounded-r-lg" />
                </div>
                {/* Verso — première page de gauche */}
                <div
                  className="paper absolute inset-0 rounded-l-md p-[7%] flex flex-col justify-between text-[#1c120c] [backface-visibility:hidden] shadow-[inset_-20px_0_35px_-20px_rgba(0,0,0,0.5)]"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-sans font-bold text-[#B86443]">Avant-propos</span>
                  <p className="font-sans text-[clamp(0.82rem,1.35vw,1.15rem)] leading-relaxed text-[#1c120c]/90 font-medium">
                    J’aide les marques à grandir en alliant un web design créatif,
                    un marketing orienté données et une intelligence artificielle
                    de pointe. Chaque projet est une histoire, celle-ci commence
                    ici, page après page.
                  </p>
                  <span className="font-sans text-[10px] opacity-50">01</span>
                </div>
              </motion.div>
            </div>

            {/* Ombre portée sous le livre */}
            <motion.div
              style={{ opacity: shadowOpacity }}
              className="absolute -bottom-[7%] left-1/2 -translate-x-1/2 w-[85%] h-[12%] bg-black blur-2xl rounded-[100%]"
            />
          </motion.div>
        </motion.div>

        {/* Indice de scroll */}
        <motion.div style={{ opacity: hintOpacity }} className="absolute bottom-8 flex items-center gap-3 text-[#F0E2D3]/40">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Scrollez pour tourner les pages</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="block w-px h-6 bg-[#F0E2D3]/40"
          />
        </motion.div>
      </div>
    </section>
  );
}
