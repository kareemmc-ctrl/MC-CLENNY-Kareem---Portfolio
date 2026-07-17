import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

// Livre papier 3D qui s'ouvre au fil du scroll (section sticky).
// La couverture puis une page intérieure pivotent autour de la reliure.
export default function BookSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const coverRotate = useTransform(scrollYProgress, [0.08, 0.42], [0, -180]);
  const pageRotate = useTransform(scrollYProgress, [0.5, 0.82], [0, -180]);
  const bookScale = useTransform(scrollYProgress, [0, 0.3], [0.82, 1]);
  const bookTilt = useTransform(scrollYProgress, [0, 0.42], [18, 6]);
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.3], [0.25, 0.55]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.06, 0.14], [1, 1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0.85, 0.95], [1, 0]);

  // Ombrage dynamique des faces pendant la rotation
  const coverShade = useTransform(coverRotate, [-180, -90, 0], [0, 0.45, 0]);
  const pageShade = useTransform(pageRotate, [-180, -90, 0], [0, 0.45, 0]);

  return (
    <section ref={containerRef} className="relative h-[420vh] bg-[#121212]" id="manifeste">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">

        {/* Titre d'intro, disparaît quand le livre s'ouvre */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="absolute top-[10vh] md:top-[12vh] z-10 flex flex-col items-center text-center px-6"
        >
          <span className="rounded-full border border-[#F0E2D3]/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] font-medium text-[#F0E2D3]/60 mb-5">
            Le Manifeste
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-light tracking-tight text-[#F0E2D3]">
            Ouvrez le <em className="italic text-[#B86443]">livre</em>
          </h2>
        </motion.div>

        {/* Scène 3D */}
        <div style={{ perspective: '2600px' }} className="relative w-[min(92vw,1040px)]">
          <motion.div
            style={{ scale: bookScale, rotateX: bookTilt, transformStyle: 'preserve-3d' }}
            className="relative w-full"
          >
            {/* Le livre : la moitié droite porte les pages, la gauche les reçoit */}
            <div
              className="relative w-full aspect-[4/3] sm:aspect-[16/10]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Plat verso (fond gauche, visible avant ouverture : vide) */}
              <div className="absolute left-0 top-0 w-1/2 h-full" />

              {/* Page de droite (fond) — Chapitre 02 */}
              <div className="paper absolute right-0 top-0 w-1/2 h-full rounded-r-md p-[5%] flex flex-col justify-between text-[#211a13] shadow-[inset_18px_0_28px_-18px_rgba(0,0,0,0.45)]">
                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-sans font-semibold opacity-50">Chapitre 02</span>
                  <h3 className="font-display text-[clamp(1.1rem,2.6vw,2rem)] font-medium mt-2 mb-[4%]">La méthode</h3>
                  <ul className="font-sans text-[clamp(0.6rem,1.15vw,0.95rem)] leading-relaxed space-y-[3%]">
                    {[
                      ['01', 'Découverte', 'Comprendre la marque, l’audience, l’objectif.'],
                      ['02', 'Design', 'Direction artistique forte, prototypage soigné.'],
                      ['03', 'Développement', 'Code performant, animations au pixel près.'],
                      ['04', 'Données & IA', 'Mesurer, automatiser, itérer intelligemment.'],
                    ].map(([n, t, d]) => (
                      <li key={n} className="flex gap-3 items-baseline border-b border-[#211a13]/10 pb-[2%]">
                        <span className="font-display italic text-[#B86443]">{n}</span>
                        <span><strong className="font-semibold">{t}</strong> — <span className="opacity-70">{d}</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-signature text-[clamp(1.3rem,3vw,2.6rem)] text-[#B86443] -rotate-3">Kareem</span>
                  <span className="font-sans text-[9px] opacity-40">04</span>
                </div>
              </div>

              {/* Page intérieure volante : recto = citation, verso = chiffres */}
              <motion.div
                style={{ rotateY: pageRotate, transformStyle: 'preserve-3d', transformOrigin: 'left center', translateZ: 1 }}
                className="absolute right-0 top-0 w-1/2 h-full will-change-transform"
              >
                {/* Recto — citation */}
                <div className="paper absolute inset-0 rounded-r-md p-[6%] flex flex-col justify-between text-[#211a13] [backface-visibility:hidden] shadow-[inset_18px_0_28px_-18px_rgba(0,0,0,0.45)]">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-sans font-semibold opacity-50">Chapitre 01</span>
                  <blockquote className="font-display italic font-light text-[clamp(0.95rem,2.2vw,1.8rem)] leading-snug">
                    « Un site ne doit pas seulement se voir.<br />
                    Il doit se <span className="text-[#B86443] not-italic font-medium">ressentir</span> — comme le papier
                    entre les doigts. »
                  </blockquote>
                  <span className="font-sans text-[9px] opacity-40 self-end">02</span>
                  <motion.div style={{ opacity: pageShade }} className="absolute inset-0 bg-black pointer-events-none rounded-r-md" />
                </div>
                {/* Verso — chiffres (devient page de gauche) */}
                <div
                  className="paper absolute inset-0 rounded-l-md p-[6%] flex flex-col justify-between text-[#211a13] [backface-visibility:hidden] shadow-[inset_-18px_0_28px_-18px_rgba(0,0,0,0.45)]"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-sans font-semibold opacity-50">En chiffres</span>
                  <div className="space-y-[6%]">
                    {[
                      ['3+', 'années de design digital'],
                      ['12', 'projets web & IA livrés'],
                      ['∞', 'curiosité pour la suite'],
                    ].map(([n, label]) => (
                      <div key={label} className="flex items-baseline gap-4 border-b border-[#211a13]/10 pb-[3%]">
                        <span className="font-display text-[clamp(1.4rem,3.4vw,2.8rem)] font-medium text-[#B86443]">{n}</span>
                        <span className="font-sans text-[clamp(0.6rem,1.15vw,0.95rem)] opacity-70">{label}</span>
                      </div>
                    ))}
                  </div>
                  <span className="font-sans text-[9px] opacity-40">03</span>
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
                  className="paper absolute inset-0 rounded-l-md p-[6%] flex flex-col justify-between text-[#211a13] [backface-visibility:hidden] shadow-[inset_-18px_0_28px_-18px_rgba(0,0,0,0.45)]"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-sans font-semibold opacity-50">Avant-propos</span>
                  <p className="font-sans text-[clamp(0.62rem,1.2vw,1rem)] leading-relaxed opacity-80">
                    J’aide les marques à grandir en alliant un web design créatif,
                    un marketing orienté données et une intelligence artificielle
                    de pointe. Chaque projet est une histoire — celle-ci commence
                    ici, page après page.
                  </p>
                  <span className="font-sans text-[9px] opacity-40">01</span>
                </div>
              </motion.div>
            </div>

            {/* Ombre portée sous le livre */}
            <motion.div
              style={{ opacity: shadowOpacity }}
              className="absolute -bottom-[7%] left-1/2 -translate-x-1/2 w-[85%] h-[12%] bg-black blur-2xl rounded-[100%]"
            />
          </motion.div>
        </div>

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
