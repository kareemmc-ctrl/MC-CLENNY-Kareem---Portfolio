import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { useState, type MouseEvent, type KeyboardEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../App';

const EASE = [0.32, 0.72, 0, 1] as const;

// Index éditorial des projets, façon table des matières de livre :
// grande liste typographique ; au survol d'une ligne, l'aperçu vidéo du
// projet (la vraie animation de sa home) flotte et suit le curseur.
export default function ProjectIndex({ projects, onOpen }: {
  projects: Project[];
  onOpen: (p: Project) => void;
}) {
  const [hovered, setHovered] = useState<Project | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const previewX = useSpring(x, { stiffness: 160, damping: 20, mass: 0.4 });
  const previewY = useSpring(y, { stiffness: 160, damping: 20, mass: 0.4 });

  const onMove = (e: MouseEvent) => {
    x.set(e.clientX);
    y.set(e.clientY);
  };

  return (
    <div onMouseMove={onMove} className="relative">
      {projects.map((project, i) => (
        <motion.div
          key={project.title}
          role="button"
          tabIndex={0}
          data-cursor-text="Découvrir"
          onClick={() => onOpen(project)}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(project); }
          }}
          onMouseEnter={() => setHovered(project)}
          onMouseLeave={() => setHovered(null)}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
          className="group relative border-b border-[#F0E2D3]/10 py-9 md:py-11 flex items-center justify-between gap-8 cursor-pointer focus:outline-none"
        >
          <div className="flex items-baseline gap-6 md:gap-10 min-w-0">
            <span className="font-mono text-xs text-[#B86443] shrink-0 translate-y-[-0.35em]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <h3 className="font-display font-light text-[clamp(1.9rem,4.2vw,3.4rem)] leading-[1.05] tracking-tight transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-3 group-hover:text-[#B86443] group-hover:italic truncate">
                {project.title}
              </h3>
              <span className="block mt-2 text-[#F0E2D3]/45 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-500 group-hover:text-[#F0E2D3]/70">
                {project.desc}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-10 shrink-0">
            <div className="hidden lg:flex gap-2">
              {project.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[10px] font-mono tracking-[0.12em] uppercase px-3 py-1 rounded-full border border-[#F0E2D3]/12 text-[#F0E2D3]/40 group-hover:border-[#B86443]/40 group-hover:text-[#B86443]/80 transition-colors duration-500">
                  {tag}
                </span>
              ))}
            </div>
            <span className="font-mono text-xs text-[#F0E2D3]/40">{project.year}</span>
            <div className="w-11 h-11 rounded-full border border-[#F0E2D3]/15 flex items-center justify-center -rotate-45 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-0 group-hover:bg-[#B86443] group-hover:border-[#B86443]">
              <ArrowUpRight size={18} strokeWidth={1.25} />
            </div>
          </div>
        </motion.div>
      ))}

      {/* Aperçu flottant : la home animée du projet suit le curseur */}
      <motion.div
        style={{ x: previewX, y: previewY }}
        className="fixed top-0 left-0 z-40 pointer-events-none"
        aria-hidden="true"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              key={hovered.title}
              initial={{ opacity: 0, scale: 0.82, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.88, rotate: 3 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="-translate-x-1/2 -translate-y-[58%] w-[300px] xl:w-[360px] aspect-[4/3] rounded-2xl overflow-hidden border border-[#F0E2D3]/15 bg-[#1a1a1a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
            >
              <img
                src={hovered.img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              {hovered.previewVideo && (
                <video
                  src={hovered.previewVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
