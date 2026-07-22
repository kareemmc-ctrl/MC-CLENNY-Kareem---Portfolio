import { motion, useScroll, useTransform, useSpring, AnimatePresence, MotionConfig } from 'motion/react';
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { ArrowUpRight, ArrowUp, ChevronDown, Plus, Minus, FileText, Shield, Copy, Check, MapPin } from 'lucide-react';
import Lenis from 'lenis';
import Cursor from './components/Cursor';
import MagneticButton from './components/MagneticButton';
import Preloader from './components/Preloader';
import ProjectIndex from './components/ProjectIndex';
import ExpertiseChapters from './components/ExpertiseChapters';
import BookSection from './components/BookSection';
import VelocityMarquee from './components/VelocityMarquee';
import { LineReveal, WordScrollReveal, BlurReveal, Counter, InkLine } from './components/Reveal';

const EASE = [0.32, 0.72, 0, 1] as const;
const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_3GG7Y16i1wZd6gC9IXwtKc5HQug/hf_20260717_115329_696a8707-668a-4222-8eb3-1e7f2fd27998.mp4';

// Accordéon contrôlé : un seul item ouvert à la fois (géré par le parent)
const FaqItem = ({ question, answer, isOpen, onToggle }: { question: string, answer: string, isOpen: boolean, onToggle: () => void }) => {
  return (
    <div className="border-b border-[#F0E2D3]/10 py-8">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        data-cursor-text={isOpen ? 'Fermer' : 'Ouvrir'}
        className="w-full flex justify-between items-center text-left focus:outline-none group"
      >
        <span className="font-display text-xl md:text-2xl font-medium group-hover:text-[#B86443] transition-colors duration-500">{question}</span>
        <span className="ml-4 flex-shrink-0 w-10 h-10 rounded-full border border-[#F0E2D3]/15 flex items-center justify-center text-[#B86443] group-hover:border-[#B86443]/60 transition-colors duration-500">
          {isOpen ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pt-6 text-lg text-[#F0E2D3]/60 leading-relaxed max-w-4xl font-light">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Carte projet : au survol, joue un court aperçu vidéo muet du hero de la
// landing page (ou de l'orbe Jarvis) par-dessus l'image statique, pour
// donner un avant-goût de l'animation réelle du projet.
export type Project = {
  title: string; desc: string; longDesc: string; tags: string[];
  year: string; img: string; link: string; previewVideo?: string;
};

const ProjectCard = ({ project, idx, onOpen }: { project: Project; idx: number; onOpen: (p: Project) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewActive, setPreviewActive] = useState(false);

  const startPreview = () => {
    if (!project.previewVideo) return;
    setPreviewActive(true);
    videoRef.current?.play().catch(() => {});
  };
  const stopPreview = () => {
    if (!project.previewVideo) return;
    setPreviewActive(false);
    const v = videoRef.current;
    if (v) { v.pause(); v.currentTime = 0; }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(project); } }}
      data-cursor-text="Découvrir"
      initial="hidden"
      whileInView="visible"
      variants={{ hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } }}
      viewport={{ once: true, margin: '-50px' }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.9, delay: idx * 0.12, ease: EASE }}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      className={`group cursor-pointer block ${idx % 2 !== 0 ? 'md:mt-32' : ''}`}
    >
      {/* Image — révélation par clip-path + zoom lent, aperçu vidéo au survol */}
      <div className="w-full aspect-[4/3] bg-[#1a1a1a] overflow-hidden mb-8 relative rounded-2xl border border-[#F0E2D3]/8">
        <motion.div
          variants={{ hidden: { clipPath: 'inset(100% 0% 0% 0%)' }, visible: { clipPath: 'inset(0% 0% 0% 0%)' } }}
          transition={{ duration: 1.2, ease: EASE }}
          className="absolute inset-0"
        >
          <motion.img
            src={project.img}
            alt={`Aperçu du projet ${project.title}`}
            loading="lazy"
            decoding="async"
            variants={{ hidden: { scale: 1.25 }, visible: { scale: 1 } }}
            transition={{ duration: 1.4, ease: EASE }}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform"
          />
        </motion.div>
        {project.previewVideo && (
          <video
            ref={videoRef}
            src={project.previewVideo}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${previewActive ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        <div className="absolute inset-0 bg-[#B86443]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-overlay pointer-events-none" />
        <span className="absolute top-4 left-4 z-20 text-[10px] font-mono tracking-[0.2em] bg-[#121212]/70 backdrop-blur-md text-[#B86443] px-3 py-1.5 rounded-full border border-[#B86443]/30">{project.year}</span>
        {project.previewVideo && (
          <span className={`absolute top-4 right-4 z-20 text-[9px] font-mono tracking-[0.2em] uppercase bg-[#121212]/70 backdrop-blur-md text-[#F0E2D3]/70 px-3 py-1.5 rounded-full border border-[#F0E2D3]/15 transition-opacity duration-500 ${previewActive ? 'opacity-0' : 'opacity-100'}`}>
            Survoler
          </span>
        )}
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display text-2xl md:text-3xl font-medium mb-2 group-hover:text-[#B86443] transition-colors duration-500">{project.title}</h3>
          <span className="text-[#F0E2D3]/50 font-mono text-xs uppercase tracking-[0.15em]">{project.desc}</span>
        </div>
        <div className="w-12 h-12 rounded-full border border-[#F0E2D3]/20 flex items-center justify-center group-hover:bg-[#B86443] group-hover:border-[#B86443] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] -rotate-45 group-hover:rotate-0 flex-shrink-0 ml-4">
          <ArrowUpRight size={20} strokeWidth={1.25} />
        </div>
      </div>

      <p className="text-[#F0E2D3]/60 text-sm leading-relaxed mb-5 max-w-lg font-light">{project.longDesc}</p>

      <div className="flex flex-wrap gap-2">
        {project.tags.map(tag => (
          <span key={tag} className="text-[10px] font-mono tracking-[0.15em] uppercase px-3.5 py-1.5 rounded-full border border-[#F0E2D3]/15 text-[#F0E2D3]/50 group-hover:border-[#B86443]/40 transition-colors duration-500">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// Overlay plein écran : page de présentation complète d'un projet, ouverte au clic sur une carte.
const ProjectDetailOverlay = ({ project, onClose }: { project: Project | null; onClose: () => void }) => {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed inset-0 z-[85] bg-[#0a0a0a]/94 backdrop-blur-2xl flex items-start md:items-center justify-center p-0 md:p-8 overflow-y-auto"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE }}
            onClick={e => e.stopPropagation()}
            className="bg-[#121212] w-full md:max-w-5xl md:rounded-[2rem] overflow-hidden relative border border-[#F0E2D3]/10 my-0 md:my-auto"
            data-lenis-prevent
          >
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-[#0a0a0a]/70 backdrop-blur-md border border-[#F0E2D3]/15 flex items-center justify-center hover:bg-[#B86443] hover:border-[#B86443] transition-colors duration-300"
            >
              <Plus size={20} strokeWidth={1.5} className="rotate-45 text-[#F0E2D3]" />
            </button>

            {/* Média hero : vidéo si disponible, sinon image */}
            <div className="w-full aspect-video md:aspect-[16/8] relative bg-[#1a1a1a] overflow-hidden">
              <motion.img
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: [1.08, 1.18] }}
                transition={{
                  opacity: { duration: 0.9, ease: EASE },
                  scale: { duration: 12, ease: 'linear', repeat: Infinity, repeatType: 'mirror' },
                }}
                src={project.img}
                alt={`Aperçu du projet ${project.title}`}
                className="w-full h-full object-cover"
              />
              {project.previewVideo && (
                <video
                  src={project.previewVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
              <span className="absolute top-5 left-5 text-[10px] font-mono tracking-[0.2em] bg-[#0a0a0a]/70 backdrop-blur-md text-[#B86443] px-3 py-1.5 rounded-full border border-[#B86443]/30">{project.year}</span>
            </div>

            {/* Contenu */}
            <div className="p-8 md:p-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B86443] mb-4 block">Étude de cas</span>
                <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight mb-3">{project.title}</h2>
                <p className="text-[#F0E2D3]/50 font-mono text-sm uppercase tracking-[0.1em] mb-8">{project.desc}</p>
              </motion.div>

              <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
                  className="text-lg leading-relaxed text-[#F0E2D3]/75 font-light"
                >
                  {project.longDesc}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
                  className="flex flex-col gap-8"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-50 mb-4 block">Stack & approche</span>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-[11px] font-mono tracking-[0.1em] uppercase px-3.5 py-1.5 rounded-full border border-[#F0E2D3]/15 text-[#F0E2D3]/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {project.link !== '#' ? (
                    <MagneticButton
                      as="a"
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-text="Voir"
                      className="group inline-flex items-center gap-4 pl-6 pr-2 py-2 bg-[#F0E2D3] text-[#121212] rounded-full font-semibold text-sm tracking-wide transition-colors duration-500 hover:bg-[#B86443] hover:text-[#F0E2D3] w-fit"
                    >
                      Voir le site en ligne
                      <span className="w-9 h-9 rounded-full bg-[#121212]/10 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight size={16} strokeWidth={1.5} />
                      </span>
                    </MagneticButton>
                  ) : (
                    <span className="inline-flex items-center gap-2 pl-5 pr-5 py-3 rounded-full border border-[#F0E2D3]/15 text-[#F0E2D3]/40 text-xs font-semibold uppercase tracking-[0.15em] w-fit">
                      Bientôt en ligne
                    </span>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


const prefersReducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [parisTime, setParisTime] = useState('');
  const [legalOpen, setLegalOpen] = useState<'mentions' | 'confidentialite' | null>(null);
  const [openProject, setOpenProject] = useState<Project | null>(null);

  // Ferme la modal légale avec Échap
  useEffect(() => {
    if (!legalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLegalOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [legalOpen]);

  // Coupe le smooth scroll de fond tant qu'une page projet est ouverte
  useEffect(() => {
    if (openProject) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, [openProject]);

  // Smooth scroll inertiel (Lenis) — désactivé si l'utilisateur réduit les animations
  useEffect(() => {
    if (prefersReducedMotion) return;
    const lenis = new Lenis({ lerp: 0.09 });
    lenisRef.current = lenis;
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  // Surligne le lien de nav correspondant à la section visible
  useEffect(() => {
    const ids = ['top', 'manifeste', 'expertise', 'work', 'contact'];
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveSection(e.target.id);
        }
      },
      { rootMargin: '-35% 0px -55% 0px' }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Heure locale (Paris) affichée dans le footer
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
    const tick = () => setParisTime(fmt.format(new Date()));
    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (value: string, key: string) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(c => (c === key ? null : c)), 2000);
    });
  };

  // Barre de progression globale du scroll
  const { scrollYProgress: pageProgress } = useScroll();
  const pageProgressScale = useSpring(pageProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const scrollTo = (hash: string) => {
    setMenuOpen(false);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(hash, { offset: 0, duration: 1.6 });
    } else {
      document.querySelector(hash)?.scrollIntoView();
    }
  };

  // Hero scrollytelling : la vidéo se "scrub" sur 300vh
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });
  const smoothHeroProgress = useSpring(heroProgress, {
    stiffness: 45,
    damping: 15,
    mass: 0.2,
    restDelta: 0.0005
  });
  const heroTextY = useTransform(heroProgress, [0, 0.3], [0, -140]);
  const heroTextOpacity = useTransform(heroProgress, [0.12, 0.28], [1, 0]);
  const midTextOpacity = useTransform(heroProgress, [0.4, 0.52, 0.68, 0.8], [0, 1, 1, 0]);
  const midTextY = useTransform(heroProgress, [0.4, 0.8], [60, -60]);
  const videoScale = useTransform(smoothHeroProgress, [0, 1], [1, 1.12]);
  const progressLine = useTransform(heroProgress, [0, 1], ['0%', '100%']);
  const scrollCueOpacity = useTransform(heroProgress, [0, 0.05], [1, 0]);

  const footerRef = useRef(null);
  const { scrollYProgress: footerScrollProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end'],
  });
  const footerY = useTransform(footerScrollProgress, [0, 1], [300, 0]);

  const [activeCategory, setActiveCategory] = useState<'webdesign' | 'ia'>('webdesign');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Webdesign & UX/UI',
    message: ''
  });

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Nouveau contact : ${formData.service} de ${formData.name}`);
    const body = encodeURIComponent(`Nom: ${formData.name}\nEmail: ${formData.email}\nService: ${formData.service}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:kareemmcclenny@gmail.com?subject=${subject}&body=${body}`;
  };

  const services = [
    {
      num: '01', title: 'Marketing Digital',
      desc: 'En tant qu\'expert marketing digital, je pilote croissance stratégique, SEO, acquisition payante et optimisation du taux de conversion adaptés à votre audience.',
      points: ['SEO', 'Acquisition', 'CRO', 'Analytics'],
    },
    {
      num: '02', title: 'Design UX/UI',
      desc: 'Création d’interfaces immersives et centrées sur l’utilisateur. Du wireframing au prototypage haute-fidélité.',
      points: ['Direction artistique', 'Prototypage', 'Design système', 'Motion'],
    },
    {
      num: '03', title: 'Intégration IA',
      desc: 'Mise en place d’automatisations intelligentes, d’outils basés sur les LLMs et d’infrastructures IA dédiées.',
      points: ['n8n & Make', 'LLMs', 'Chatbots', 'Workflows'],
    },
  ];

  const projects = {
    webdesign: [
      {
        title: 'Atelier Kawa',
        desc: 'Landing Page • Torréfaction & Café de spécialité',
        longDesc: 'Conception complète de la landing page pour Atelier Kawa, artisan torréfacteur. Design immersif avec vidéo hero en plein écran, animations au scroll, section storytelling et formulaire de commande. Stack : HTML/CSS/JS + Vite.',
        tags: ['Landing Page', 'Web Design', 'Animations'],
        year: '2026',
        img: '/projects/atelier-kawa.webp',
        previewVideo: '/projects/previews/atelier-kawa.mp4',
        link: 'http://localhost:3001'
      },
      {
        title: 'Complice',
        desc: 'Landing Page • Application de productivité & bien-être',
        longDesc: 'Landing page premium pour l\'application Complice, conçue pour convertir des utilisateurs. Design épuré, dark mode, section features animées, témoignages et CTA stratégiques. Déployée sur Vercel.',
        tags: ['Landing Page', 'React', 'Vercel'],
        year: '2026',
        img: '/projects/complice.webp',
        previewVideo: '/projects/previews/complice.mp4',
        link: 'https://complice-landing-page.vercel.app'
      },
      {
        title: 'ManoKlin',
        desc: 'Landing Page • Detailing automobile premium',
        longDesc: 'Landing page haut de gamme pour ManoKlin, service de nettoyage et protection céramique automobile. Vidéo hero pilotée par le scroll, storytelling visuel avant/après et grille de tarifs claire. Design épuré, typographie forte, palette sombre.',
        tags: ['Landing Page', 'Scroll Video', 'React'],
        year: '2026',
        img: '/projects/manoklin.webp',
        previewVideo: '/projects/previews/manoklin.mp4',
        link: '#'
      },
      {
        title: 'The Continuum',
        desc: 'Landing Page • Pavillon architectural & espace d\'exposition',
        longDesc: 'Direction artistique et développement pour The Continuum, pavillon d\'exposition premium. Esthétique or et noir, grande typographie éditoriale, sections expositions, ateliers et centre d\'innovation. Un exercice de style transposable à l\'immobilier de prestige.',
        tags: ['Landing Page', 'Branding', 'Architecture'],
        year: '2026',
        img: '/projects/continuum-pavilion.webp',
        previewVideo: '/projects/previews/continuum-pavilion.mp4',
        link: '#'
      }
    ],
    ia: [
      {
        title: 'Jarvis : Assistant Personnel IA',
        desc: 'Assistant IA • Cockpit vocal 100% local',
        longDesc: 'Assistant personnel piloté par la voix : orbe de particules réactif à l\'amplitude vocale, reconnaissance et synthèse en français, palette de commandes et exécution d\'actions par intentions. IA locale (Ollama) pour la confidentialité, orchestration via agents dédiés.',
        tags: ['IA', 'Voice UI', 'Next.js', 'Ollama'],
        year: '2026',
        img: '/projects/jarvis.webp',
        previewVideo: '/projects/previews/jarvis.mp4',
        link: '#'
      },
      {
        title: 'Complice : App',
        desc: 'Application • Le budget à plusieurs, sans tension',
        longDesc: 'Application de gestion budgétaire pensée pour le foyer : suivi des dépenses en temps réel, score de santé financière, objectifs d\'épargne partagés et badges de progression pour garder la motivation. Utilisable en solo, à deux ou en famille.',
        tags: ['App', 'Finance', 'PWA', 'Supabase'],
        year: '2026',
        img: '/projects/complice-app.webp',
        previewVideo: '/projects/previews/complice-app.mp4',
        link: 'https://complice-nu.vercel.app'
      },
      {
        title: 'Forge : Tracker Sport',
        desc: 'Application Mobile • Suivi d\'entraînement & performance',
        longDesc: 'Forge est le module de tracking sportif de l\'écosystème Bushi. Suivi de séances en temps réel, progression des charges, RPE dial, coach vocal, smart progression par l\'IA et partage de performances. Interface dark inspirée des arts martiaux.',
        tags: ['App', 'Sport', 'React', 'IA Coach'],
        year: '2026',
        img: '/projects/forge.webp',
        link: '#'
      },
      {
        title: 'Agence A : Dashboard IA',
        desc: 'Tableau de bord IA • Pilotage marketing temps réel',
        longDesc: 'Dashboard de pilotage complet pour une agence digitale. Vue d\'ensemble en temps réel des KPIs (leads, conversion, rétention), SEO score, Google My Business, veille concurrentielle et consultant IA intégré via Ollama. Interface dark avec accents néon.',
        tags: ['IA', 'Dashboard', 'React', 'Ollama'],
        year: '2026',
        img: '/projects/agence-sw.webp',
        link: '#'
      }
    ]
  };


  const navLinks = [
    ['#manifeste', 'Manifeste'],
    ['#expertise', 'Expertise'],
    ['#work', 'Projets'],
    ['#contact', 'Contact'],
  ] as const;

  return (
    <MotionConfig reducedMotion="user">
    <div className="noise w-full min-h-[100dvh] text-[#F0E2D3] font-sans overflow-x-clip bg-[#121212]">
      {/* Lien d'évitement pour la navigation clavier */}
      <a
        href="#work"
        onClick={e => { e.preventDefault(); scrollTo('#work'); }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:bg-[#F0E2D3] focus:text-[#121212] focus:px-6 focus:py-3 focus:rounded-full focus:font-semibold"
      >
        Aller au contenu
      </a>
      <Preloader />
      <Cursor />

      {/* Barre de progression globale du scroll */}
      <motion.div
        style={{ scaleX: pageProgressScale }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#B86443] origin-left z-[60]"
        aria-hidden="true"
      />

      {/* Navigation — logo à gauche, pastille de verre flottante à droite */}
      <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-6 md:px-10 py-6 z-50">
        <button onClick={() => scrollTo('#top')} data-cursor-text="Haut" className="flex flex-col justify-center text-left group [text-shadow:0_1px_16px_rgba(0,0,0,0.45)]" aria-label="Retour en haut">
          <span className="text-[0.95rem] font-sans font-bold tracking-[0.18em] leading-none mb-1">MC CLENNY</span>
          <span className="text-2xl font-signature font-normal leading-none opacity-90 group-hover:opacity-100 transition-opacity duration-500">Kareem</span>
        </button>
        <div className="hidden md:flex items-center gap-8 rounded-full border border-[#F0E2D3]/15 bg-[#121212]/40 backdrop-blur-xl px-8 py-3.5">
          {navLinks.map(([href, label]) => {
            const isActive = activeSection === href.slice(1);
            return (
              <a
                key={href}
                href={href}
                onClick={e => { e.preventDefault(); scrollTo(href); }}
                aria-current={isActive ? 'true' : undefined}
                data-cursor-text="Aller"
                className={`relative text-[11px] font-semibold tracking-[0.2em] uppercase group transition-colors duration-500 ${isActive ? 'text-white' : ''}`}
              >
                {label}
                <span className={`absolute -bottom-1 left-0 w-full h-px bg-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isActive ? 'scale-x-100' : 'origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100'}`} />
              </a>
            );
          })}
        </div>
        {/* Burger mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden relative w-11 h-11 rounded-full border border-[#F0E2D3]/20 flex items-center justify-center"
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span className={`absolute w-4 h-px bg-[#F0E2D3] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? 'rotate-45' : '-translate-y-[3px]'}`} />
          <span className={`absolute w-4 h-px bg-[#F0E2D3] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? '-rotate-45' : 'translate-y-[3px]'}`} />
        </button>
      </nav>

      {/* Menu mobile plein écran */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-0 z-40 bg-[#0d0d0d]/90 backdrop-blur-2xl flex flex-col items-center justify-center gap-2 md:hidden"
          >
            {navLinks.map(([href, label], i) => (
              <span key={href} className="block overflow-hidden">
                <motion.a
                  href={href}
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '110%' }}
                  transition={{ duration: 0.7, delay: 0.06 * i, ease: EASE }}
                  onClick={e => { e.preventDefault(); scrollTo(href); }}
                  className="block font-display text-5xl font-light py-2 hover:text-[#B86443] transition-colors"
                >
                  {label}
                </motion.a>
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero — le personnage marche au rythme du scroll (vidéo scrubbée sur 300vh) */}
      <section ref={heroRef} id="top" className="relative h-[300vh] w-full">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-end items-center pb-24 md:pb-32 px-6 md:px-10">
          <motion.div style={{ scale: videoScale }} className="absolute inset-0 z-0 will-change-transform">
            <video
              src={HERO_VIDEO}
              poster="/hero-poster.jpg"
              autoPlay={!prefersReducedMotion}
              loop
              muted
              playsInline
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          </motion.div>
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(18,18,18,0.25) 0%, transparent 30%, transparent 55%, #121212 100%)' }}
          />

          {/* Texte principal — s'efface quand la marche commence */}
          <motion.div
            style={{ y: heroTextY, opacity: heroTextOpacity }}
            className="relative z-20 flex w-full flex-col items-center justify-center text-center"
          >
            <h1 className="font-display font-light text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-tight mb-6">
              <LineReveal delay={1.9}>Design <em className="italic text-[#B86443]">Digital</em></LineReveal>
              <LineReveal delay={2.05}>& Intelligence</LineReveal>
            </h1>
            <span className="block overflow-hidden mb-10">
              <motion.p
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, delay: 2.25, ease: EASE }}
                className="text-[clamp(1rem,1.6vw,1.35rem)] text-[#F0E2D3]/70 font-light max-w-3xl"
              >
                Création d'expériences web immersives et d'automatisations intelligentes.
              </motion.p>
            </span>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 2.5, ease: EASE }}
            >
              <MagneticButton
                as="a"
                href="#work"
                onClick={(e: React.MouseEvent) => { e.preventDefault(); scrollTo('#work'); }}
                data-cursor-text="Aller"
                className="group inline-flex items-center gap-4 pl-8 pr-2.5 py-2.5 bg-[#F0E2D3] text-[#121212] rounded-full font-semibold text-base tracking-wide transition-colors duration-500 hover:bg-[#B86443] hover:text-[#F0E2D3]"
              >
                Voir les Projets
                <span className="w-10 h-10 rounded-full bg-[#121212]/10 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                  <ArrowUpRight size={18} strokeWidth={1.5} />
                </span>
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Texte de mi-parcours */}
          <motion.div
            style={{ opacity: midTextOpacity, y: midTextY }}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-6"
          >
            <p className="font-display italic font-light text-[clamp(1.6rem,4vw,3.2rem)] text-[#F0E2D3] text-center max-w-3xl">
              Chaque pas compte.<br />
              <span className="not-italic text-[#B86443]">Chaque pixel aussi.</span>
            </p>
          </motion.div>

          {/* Liens sociaux + progression de la marche */}
          <div className="absolute bottom-10 right-6 md:right-10 z-20 hidden md:flex gap-8">
            {[['https://www.linkedin.com/in/kareem-mc-clenny-475488241', 'LinkedIn'], ['https://behance.net', 'Behance'], ['https://github.com/kareemmc-ctrl', 'GitHub']].map(([href, label]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" data-cursor-text="Voir"
                className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#F0E2D3]/60 hover:text-[#B86443] transition-colors duration-500">
                {label}
              </a>
            ))}
          </div>
          <div className="absolute bottom-10 left-6 md:left-10 z-20 flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-[#F0E2D3]/50">La marche</span>
            <div className="w-24 md:w-40 h-px bg-[#F0E2D3]/15 overflow-hidden">
              <motion.div style={{ width: progressLine }} className="h-full bg-[#B86443]" />
            </div>
          </div>

          {/* Indice de scroll initial — s'efface dès que la marche commence */}
          <motion.div
            style={{ opacity: scrollCueOpacity }}
            className="absolute top-[85%] md:top-auto md:bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-none"
            aria-hidden="true"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-[#F0E2D3]/50">Scrollez</span>
            <motion.span
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="block"
            >
              <ChevronDown size={16} strokeWidth={1.5} className="text-[#F0E2D3]/50" />
            </motion.span>
          </motion.div>
        </div>
      </section>

      {/* Double marquee réactif à la vélocité du scroll : métiers + stack technique */}
      <section className="py-14 md:py-16 border-y border-[#F0E2D3]/10 bg-[#121212] relative z-20 flex flex-col gap-8">
        <VelocityMarquee baseVelocity={1.5}>
          {['Marketing Digital', 'Design UX/UI', 'Intégration IA'].map(t => (
            <span key={t} className="mx-8 flex items-center gap-16 font-display text-[clamp(3rem,6vw,5.5rem)] font-light tracking-tight">
              <span className="text-[#F0E2D3]/10 hover:text-[#B86443]/40 transition-colors duration-700">{t}</span>
              <span className="text-[#B86443]/30 text-3xl">✦</span>
            </span>
          ))}
        </VelocityMarquee>
        <VelocityMarquee baseVelocity={-1}>
          {['React', 'Next.js', 'TypeScript', 'Figma', 'Framer', 'Webflow', 'Tailwind CSS', 'n8n', 'Make', 'Remotion', 'IA Générative'].map(t => (
            <span key={t} className="mx-3 inline-flex items-center">
              <span className="rounded-full border border-[#F0E2D3]/12 px-5 py-2 text-[11px] uppercase tracking-[0.25em] font-medium text-[#F0E2D3]/35 hover:text-[#B86443] hover:border-[#B86443]/40 transition-colors duration-500">
                {t}
              </span>
            </span>
          ))}
        </VelocityMarquee>
      </section>

      {/* À propos — le texte s'allume mot par mot */}
      <section className="py-32 md:py-48 px-6 md:px-16 max-w-7xl mx-auto">
        <span className="rounded-full border border-[#F0E2D3]/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] font-medium text-[#F0E2D3]/60 inline-block mb-12">
          À propos
        </span>
        <WordScrollReveal
          className="font-display text-[clamp(1.8rem,4vw,3.5rem)] leading-[1.25] font-light max-w-5xl"
          segments={[
            { text: "J'aide les marques à se développer en alliant un" },
            { text: 'web design créatif,', accent: true },
            { text: 'un' },
            { text: 'marketing digital', accent: true },
            { text: 'orienté données, et une' },
            { text: 'intelligence artificielle', accent: true },
            { text: 'de pointe.' },
          ]}
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="mt-12 text-sm md:text-base text-[#F0E2D3]/50 font-light tracking-wide"
        >
          Kareem Mc Clenny · Expert Marketing Digital · Fondateur de <span className="text-[#B86443]">Framo Studio</span> · Nancy, France
        </motion.p>
      </section>

      {/* Le livre qui s'ouvre */}
      <BookSection />

      {/* Expertise — cartes empilées façon deck */}
      <section id="expertise" className="relative bg-[#121212] py-32 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 md:mb-28">
            <span className="rounded-full border border-[#F0E2D3]/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] font-medium text-[#F0E2D3]/60 inline-block mb-8">
              Expertise
            </span>
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-light tracking-tight">
              <BlurReveal accentWords={2}>Trois métiers, une obsession.</BlurReveal>
            </h2>
          </div>
          <ExpertiseChapters services={services} />
        </div>
      </section>

      {/* Projets récents */}
      <section id="work" className="py-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
          <div>
            <span className="rounded-full border border-[#F0E2D3]/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] font-medium text-[#F0E2D3]/60 inline-block mb-8">
              Travaux sélectionnés
            </span>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light tracking-tight">
              <LineReveal>Projets <em className="italic text-[#B86443]">récents</em></LineReveal>
            </h2>
          </div>

          <div className="flex flex-wrap gap-8 border-b border-[#F0E2D3]/10 pb-4">
            <button
              onClick={() => setActiveCategory('webdesign')}
              className={`text-xl md:text-2xl font-display font-medium tracking-tight transition-colors duration-500 ${activeCategory === 'webdesign' ? 'text-[#B86443]' : 'text-[#F0E2D3]/30 hover:text-[#F0E2D3]'}`}
            >
              Webdesign & Landing Pages
            </button>
            <button
              onClick={() => setActiveCategory('ia')}
              className={`text-xl md:text-2xl font-display font-medium tracking-tight transition-colors duration-500 ${activeCategory === 'ia' ? 'text-[#B86443]' : 'text-[#F0E2D3]/30 hover:text-[#F0E2D3]'}`}
            >
              Apps & Créations IA
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {/* Desktop : index éditorial avec aperçu vidéo qui suit le curseur */}
            <div className="hidden md:block border-t border-[#F0E2D3]/10">
              <ProjectIndex projects={projects[activeCategory]} onOpen={setOpenProject} />
            </div>
            {/* Mobile / tactile : cartes classiques */}
            <div className="md:hidden grid grid-cols-1 gap-y-16">
              {projects[activeCategory].map((project, idx) => (
                <ProjectCard key={project.title} project={project} idx={idx} onOpen={setOpenProject} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Process — sur papier clair, comble la respiration entre Projets et FAQ */}
      <section className="paper text-[#1c120c] rounded-[2rem] md:rounded-[3rem] mx-2 md:mx-4 relative z-10 overflow-hidden">
        <div className="py-24 md:py-32 px-6 md:px-16 max-w-7xl mx-auto">
          <span className="rounded-full border border-[#1c120c]/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] font-semibold text-[#B86443] inline-block mb-8">
            Méthode
          </span>
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light tracking-tight mb-14 max-w-3xl">
            <BlurReveal>Comment je travaille, du brief au lancement.</BlurReveal>
          </h2>

          {/* Le trait d'encre relie les 4 étapes en se dessinant au scroll */}
          <InkLine className="hidden md:block mb-2" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 mb-24">
            {[
              ['01', 'Découverte', 'Comprendre la marque, l’audience, l’objectif.'],
              ['02', 'Design', 'Direction artistique forte, prototypage soigné.'],
              ['03', 'Développement', 'Code performant, animations au pixel près.'],
              ['04', 'Données & IA', 'Mesurer, automatiser, itérer intelligemment.'],
            ].map(([n, title, desc], i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
                className="border-t-2 border-[#1c120c]/10 pt-6"
              >
                <span className="font-display italic text-3xl text-[#B86443]">{n}</span>
                <h3 className="font-display text-xl font-semibold mt-3 mb-2">{title}</h3>
                <p className="text-sm text-[#1c120c]/65 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 md:gap-12 border-t border-[#1c120c]/10 pt-12">
            {[
              { to: projects.webdesign.length + projects.ia.length, suffix: '', label: 'Projets livrés' },
              { to: services.length, suffix: '', label: 'Expertises combinées' },
              { to: 100, suffix: '%', label: 'Sur-mesure, zéro template' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
                className="text-center md:text-left"
              >
                <span className="font-display text-4xl md:text-5xl font-medium text-[#1c120c]">
                  <Counter to={stat.to} suffix={stat.suffix} />
                </span>
                <p className="text-[11px] md:text-xs uppercase tracking-[0.15em] text-[#1c120c]/50 font-semibold mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="mb-24 flex flex-col items-center text-center">
          <span className="rounded-full border border-[#F0E2D3]/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] font-medium text-[#F0E2D3]/60 inline-block mb-8">
            FAQ
          </span>
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light tracking-tight">
            <LineReveal>Questions <em className="italic text-[#B86443]">fréquentes</em></LineReveal>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          {[
            {
              question: 'Quels types de projets acceptez-vous ?',
              answer: "Je travaille avec des startups, des agences et des entreprises de toutes tailles pour concevoir des expériences web sur mesure (sites vitrines, e-commerce, portfolios) et intégrer des solutions IA (automatisations, bots, optimisation de flux de travail).",
            },
            {
              question: 'Combien de temps faut-il pour créer un site web ?',
              answer: "Le délai dépend de la complexité du projet. Une landing page ou un site vitrine peut prendre entre 2 et 4 semaines, tandis qu'une application sur mesure ou une plateforme e-commerce complexe peut nécessiter 2 à 3 mois.",
            },
            {
              question: "Comment l'IA peut-elle aider mon entreprise ?",
              answer: "L'IA peut transformer votre entreprise de multiples façons : automatisation des tâches répétitives (emails, génération de rapports), création de chatbots pour le service client, ou encore génération de contenu intelligent. L'objectif est de vous faire gagner du temps et de la valeur.",
            },
            {
              question: 'Faites-vous aussi du SEO et du marketing digital ?',
              answer: "Absolument. Mon approche est holistique : un beau site web ne sert à rien s'il n'est pas vu. J'intègre les meilleures pratiques SEO dès la conception et je peux vous accompagner sur vos stratégies d'acquisition et de conversion.",
            },
          ].map((faq, i) => (
            <FaqItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* Footer / Contact — zone terracotta (CTA) puis zone noire (coordonnées) */}
      <footer ref={footerRef} id="contact" className="overflow-hidden relative rounded-t-[2rem] md:rounded-t-[3rem] -mt-6 z-10">
        <motion.div style={{ y: footerY }} className="relative">

          {/* Zone terracotta : disponibilité + titre + CTA email */}
          <div className="relative bg-[#B86443] text-[#121212] pt-28 md:pt-36 pb-20 md:pb-24 px-6 md:px-16 overflow-hidden">
            <div className="absolute -top-40 right-[-10%] w-[42rem] h-[42rem] rounded-full bg-[#F0E2D3] opacity-[0.07] blur-3xl pointer-events-none" />
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE }}
                className="inline-flex items-center gap-3 rounded-full border border-[#121212]/20 bg-[#121212]/5 px-5 py-2.5 mb-10"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1e3b2a] opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1e5231]" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Disponible : freelance & alternance dès sept. 2026</span>
              </motion.div>

              <h2 className="font-display font-light text-[clamp(3.2rem,9vw,8.5rem)] leading-[0.95] tracking-tight mb-12">
                <LineReveal>Une idée ?</LineReveal>
                <LineReveal delay={0.12}>Travaillons <em className="italic">ensemble.</em></LineReveal>
              </h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
                className="flex flex-wrap items-center gap-4"
              >
                <MagneticButton
                  as="a"
                  href="mailto:kareemmcclenny@gmail.com"
                  data-cursor-text="Écrire"
                  className="group inline-flex items-center gap-4 pl-8 pr-2.5 py-2.5 bg-[#121212] text-[#F0E2D3] rounded-full font-semibold text-base md:text-lg tracking-wide transition-colors duration-500 hover:bg-[#F0E2D3] hover:text-[#121212] active:scale-[0.98]"
                >
                  kareemmcclenny@gmail.com
                  <span className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#F0E2D3]/10 group-hover:bg-[#121212]/10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={19} strokeWidth={1.5} />
                  </span>
                </MagneticButton>
                <button
                  onClick={() => copyToClipboard('kareemmcclenny@gmail.com', 'email')}
                  aria-label="Copier l'adresse email"
                  data-cursor-text="Copier"
                  className="inline-flex items-center gap-2.5 rounded-full border border-[#121212]/25 px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] transition-colors duration-500 hover:bg-[#121212]/10 active:scale-[0.98]"
                >
                  {copied === 'email' ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.75} />}
                  {copied === 'email' ? 'Copié !' : "Copier l'email"}
                </button>
              </motion.div>
            </div>
          </div>

          {/* Zone noire : à partir de "Coordonnées" — contact, réseaux, formulaire, bas de page */}
          <div className="relative bg-[#121212] text-[#F0E2D3] px-6 md:px-16 pt-16 md:pt-20 pb-10 overflow-hidden">
            {/* Transition douce : la teinte terracotta se prolonge légèrement dans le noir */}
            <div
              className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(184,100,67,0.18), transparent)' }}
              aria-hidden="true"
            />
            <div className="max-w-7xl mx-auto flex justify-center mb-16 md:mb-20 relative" aria-hidden="true">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F0E2D3]/40">Coordonnées</span>
            </div>

          {/* Grille : infos à gauche, formulaire à droite */}
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24">

            {/* Colonne infos */}
            <div className="flex flex-col gap-12">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-60 mb-5 block">Contact direct</span>
                <div className="flex flex-col gap-4 text-lg md:text-xl font-medium tracking-tight">
                  <button
                    onClick={() => copyToClipboard('07 49 80 86 98', 'tel')}
                    className="group flex items-center gap-4 text-left hover:opacity-70 transition-opacity duration-500"
                    aria-label="Copier le numéro de téléphone"
                    data-cursor-text="Copier"
                  >
                    <span className="w-10 h-10 rounded-full border border-[#F0E2D3]/20 flex items-center justify-center shrink-0">
                      {copied === 'tel' ? <Check size={16} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.75} />}
                    </span>
                    {copied === 'tel' ? 'Numéro copié !' : '07 49 80 86 98'}
                  </button>
                  <span className="flex items-center gap-4 opacity-80">
                    <span className="w-10 h-10 rounded-full border border-[#F0E2D3]/20 flex items-center justify-center shrink-0">
                      <MapPin size={16} strokeWidth={1.5} />
                    </span>
                    Nancy, France {parisTime && `· ${parisTime} heure locale`}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-60 mb-5 block">Réseaux</span>
                <div className="flex flex-wrap gap-3">
                  {[
                    ['https://www.linkedin.com/in/kareem-mc-clenny-475488241', 'LinkedIn'],
                    ['https://behance.net', 'Behance'],
                    ['https://github.com/kareemmc-ctrl', 'GitHub'],
                  ].map(([href, label]) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor-text="Voir"
                      className="group inline-flex items-center gap-2.5 rounded-full border border-[#F0E2D3]/20 pl-5 pr-2 py-2 text-[12px] font-bold uppercase tracking-[0.15em] transition-colors duration-500 hover:bg-[#F0E2D3] hover:text-[#121212] hover:border-[#F0E2D3]"
                    >
                      {label}
                      <span className="w-7 h-7 rounded-full bg-[#F0E2D3]/10 group-hover:bg-[#121212]/10 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight size={13} strokeWidth={1.75} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block mt-auto">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-60 mb-5 block">Navigation</span>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-xs">
                  {navLinks.map(([href, label]) => (
                    <a
                      key={href}
                      href={href}
                      onClick={e => { e.preventDefault(); scrollTo(href); }}
                      data-cursor-text="Aller"
                      className="text-[12px] font-bold uppercase tracking-[0.15em] opacity-70 hover:opacity-100 transition-opacity duration-500"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Colonne formulaire */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, delay: 0.2, ease: EASE }}
              className="w-full"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-60 mb-8 block">Ou décrivez votre projet</span>
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-9">
                <div className="grid md:grid-cols-2 gap-9">
                  <div className="relative">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2 block">Votre nom</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jean Dupont"
                      className="w-full bg-transparent border-b-2 border-[#F0E2D3]/25 py-3 text-xl font-medium placeholder:text-[#F0E2D3]/25 focus:border-[#F0E2D3] outline-none transition-colors duration-500"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2 block">Votre email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean@exemple.com"
                      className="w-full bg-transparent border-b-2 border-[#F0E2D3]/25 py-3 text-xl font-medium placeholder:text-[#F0E2D3]/25 focus:border-[#F0E2D3] outline-none transition-colors duration-500"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2 block">Comment puis-je vous aider ?</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.service}
                      onChange={e => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-[#F0E2D3]/25 py-3 text-xl font-medium focus:border-[#F0E2D3] outline-none transition-colors duration-500 appearance-none cursor-pointer rounded-none"
                    >
                      <option className="bg-[#121212]" value="Webdesign & UX/UI">Webdesign & UX/UI</option>
                      <option className="bg-[#121212]" value="Intelligence Artificielle">Solutions IA (Apps, Workflows)</option>
                      <option className="bg-[#121212]" value="Marketing Digital">Marketing Digital & Stratégie</option>
                      <option className="bg-[#121212]" value="Autre demande">Autre demande</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={22} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2 block">Parlez-moi de votre projet</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Bonjour, je cherche un expert pour..."
                    className="w-full bg-transparent border-b-2 border-[#F0E2D3]/25 py-3 text-lg font-medium placeholder:text-[#F0E2D3]/25 focus:border-[#F0E2D3] outline-none transition-colors duration-500 resize-none"
                  />
                </div>

                <MagneticButton
                  as="button"
                  type="submit"
                  data-cursor-text="Envoyer"
                  className="group self-start mt-2 pl-10 pr-2.5 py-2.5 bg-[#F0E2D3] text-[#121212] rounded-full font-bold tracking-[0.15em] uppercase text-sm transition-colors duration-500 hover:bg-[#B86443] hover:text-[#F0E2D3] flex items-center gap-4 active:scale-[0.98]"
                >
                  Envoyer le message
                  <span className="w-10 h-10 rounded-full bg-[#121212]/10 group-hover:bg-[#F0E2D3]/15 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={17} strokeWidth={1.5} />
                  </span>
                </MagneticButton>
              </form>
            </motion.div>
          </div>

          {/* Barre de bas de page */}
          <div className="max-w-7xl mx-auto mt-24 md:mt-28 pt-8 border-t border-[#F0E2D3]/15 flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 text-center md:text-left">
              © 2026 MC CLENNY Kareem · Framo Studio · Conçu & développé avec soin à Nancy
            </span>
            <div className="flex items-center gap-6">
              <button onClick={() => setLegalOpen('mentions')} data-cursor-text="Lire" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity duration-500">
                <FileText size={13} strokeWidth={1.5} /> Mentions Légales
              </button>
              <button onClick={() => setLegalOpen('confidentialite')} data-cursor-text="Lire" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity duration-500">
                <Shield size={13} strokeWidth={1.5} /> Confidentialité
              </button>
              <button
                onClick={() => scrollTo('#top')}
                aria-label="Retour en haut de page"
                data-cursor-text="Haut"
                className="group w-11 h-11 rounded-full border border-[#F0E2D3]/20 flex items-center justify-center transition-colors duration-500 hover:bg-[#F0E2D3] hover:text-[#121212] active:scale-[0.95]"
              >
                <ArrowUp size={17} strokeWidth={1.5} className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
          </div>
        </motion.div>
      </footer>

      {/* Modal légale : mentions légales / politique de confidentialité */}
      <AnimatePresence>
        {legalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-[80] bg-[#0d0d0d]/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setLegalOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label={legalOpen === 'mentions' ? 'Mentions légales' : 'Politique de confidentialité'}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.5, ease: EASE }}
              onClick={e => e.stopPropagation()}
              className="paper text-[#1c120c] rounded-3xl max-w-2xl w-full max-h-[80dvh] overflow-y-auto p-8 md:p-12 relative"
              data-lenis-prevent
            >
              <button
                onClick={() => setLegalOpen(null)}
                aria-label="Fermer"
                className="absolute top-5 right-5 w-10 h-10 rounded-full border border-[#1c120c]/20 flex items-center justify-center hover:bg-[#1c120c]/10 transition-colors duration-300"
              >
                <Plus size={18} strokeWidth={1.5} className="rotate-45" />
              </button>

              {legalOpen === 'mentions' ? (
                <div className="space-y-6">
                  <h3 className="font-display text-3xl font-medium">Mentions <em className="italic text-[#B86443]">légales</em></h3>
                  <div className="space-y-4 text-sm leading-relaxed text-[#1c120c]/80">
                    <p><strong className="text-[#1c120c]">Éditeur du site</strong><br />
                      Kareem Mc Clenny · Framo Studio<br />
                      Nancy, France<br />
                      Contact : kareemmcclenny@gmail.com</p>
                    <p><strong className="text-[#1c120c]">Directeur de la publication</strong><br />
                      Kareem Mc Clenny</p>
                    <p><strong className="text-[#1c120c]">Propriété intellectuelle</strong><br />
                      L'ensemble des contenus de ce site (textes, visuels, créations, code) est la propriété
                      de Kareem Mc Clenny, sauf mention contraire. Toute reproduction sans autorisation
                      préalable est interdite.</p>
                    <p><strong className="text-[#1c120c]">Hébergement</strong><br />
                      Les informations d'hébergement seront précisées lors de la mise en ligne du site.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="font-display text-3xl font-medium">Politique de <em className="italic text-[#B86443]">confidentialité</em></h3>
                  <div className="space-y-4 text-sm leading-relaxed text-[#1c120c]/80">
                    <p><strong className="text-[#1c120c]">Données collectées</strong><br />
                      Ce site ne dépose aucun cookie de suivi et n'utilise aucun outil de tracking publicitaire.
                      Le formulaire de contact ouvre simplement votre client email : aucune donnée n'est
                      stockée sur un serveur.</p>
                    <p><strong className="text-[#1c120c]">Utilisation de vos informations</strong><br />
                      Les informations que vous transmettez par email (nom, adresse, message) sont utilisées
                      uniquement pour répondre à votre demande et ne sont jamais partagées avec des tiers.</p>
                    <p><strong className="text-[#1c120c]">Vos droits</strong><br />
                      Conformément au RGPD, vous pouvez demander l'accès, la rectification ou la suppression
                      de vos données en écrivant à kareemmcclenny@gmail.com.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProjectDetailOverlay project={openProject} onClose={() => setOpenProject(null)} />
    </div>
    </MotionConfig>
  );
}
