import { motion, useScroll, useTransform, useSpring, AnimatePresence, MotionConfig, type MotionValue } from 'motion/react';
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { ArrowUpRight, ArrowUp, ChevronDown, Plus, Minus, FileText, Shield, Copy, Check, MapPin } from 'lucide-react';
import Lenis from 'lenis';
import Cursor from './components/Cursor';
import Preloader from './components/Preloader';
import BookSection from './components/BookSection';
import VelocityMarquee from './components/VelocityMarquee';
import { LineReveal, WordScrollReveal } from './components/Reveal';

const EASE = [0.32, 0.72, 0, 1] as const;
const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_3GG7Y16i1wZd6gC9IXwtKc5HQug/hf_20260717_115329_696a8707-668a-4222-8eb3-1e7f2fd27998.mp4';

// Accordéon contrôlé : un seul item ouvert à la fois (géré par le parent)
const FaqItem = ({ question, answer, isOpen, onToggle }: { question: string, answer: string, isOpen: boolean, onToggle: () => void }) => {
  return (
    <div className="border-b border-[#F0E2D3]/10 py-8">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
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

// Carte d'expertise empilée : reste sticky et rétrécit quand la suivante la recouvre
const StackCard = ({ i, total, progress, num, title, desc, points, bg, fg, accent }: {
  i: number; total: number; progress: MotionValue<number>;
  num: string; title: string; desc: string; points: string[];
  bg: string; fg: string; accent: string;
}) => {
  const targetScale = 1 - (total - 1 - i) * 0.06;
  const scale = useTransform(progress, [i / total, 1], [1, targetScale]);

  return (
    <div className="sticky top-0 h-screen flex items-center justify-center px-4 md:px-16" style={{ top: `${i * 24}px` }}>
      <motion.div
        style={{ scale, backgroundColor: bg, color: fg }}
        className="relative w-full max-w-6xl h-[72vh] md:h-[70vh] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-16 flex flex-col justify-between overflow-hidden border border-white/10 will-change-transform"
      >
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accent }}
        />
        <div className="flex items-start justify-between">
          <span className="font-display italic text-6xl md:text-8xl font-light" style={{ color: accent }}>{num}</span>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center" style={{ borderColor: `${fg}30` }}>
            <ArrowUpRight size={20} strokeWidth={1.25} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-end">
          <div>
            <h3 className="font-display text-3xl md:text-5xl font-medium tracking-tight mb-5">{title}</h3>
            <p className="text-base md:text-lg leading-relaxed font-light" style={{ color: `${fg}B0` }}>{desc}</p>
          </div>
          <ul className="flex flex-wrap gap-2 md:justify-end content-end">
            {points.map(p => (
              <li key={p} className="rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-medium border" style={{ borderColor: `${fg}25` }}>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
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
    const ids = ['top', 'manifeste', 'expertise', 'work', 'journal', 'contact'];
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

  const footerRef = useRef(null);
  const { scrollYProgress: footerScrollProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end'],
  });
  const footerY = useTransform(footerScrollProgress, [0, 1], [300, 0]);

  // Cartes d'expertise empilées
  const stackRef = useRef(null);
  const { scrollYProgress: stackProgress } = useScroll({
    target: stackRef,
    offset: ['start start', 'end end'],
  });

  const [activeCategory, setActiveCategory] = useState<'webdesign' | 'ia'>('webdesign');
  const [activeBlogCategory, setActiveBlogCategory] = useState<string>('Tous');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Webdesign & UX/UI',
    message: ''
  });

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Nouveau contact : ${formData.service} - de ${formData.name}`);
    const body = encodeURIComponent(`Nom: ${formData.name}\nEmail: ${formData.email}\nService: ${formData.service}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:kareemmcclenny@gmail.com?subject=${subject}&body=${body}`;
  };

  const services = [
    {
      num: '01', title: 'Marketing Digital',
      desc: 'Croissance stratégique, SEO, acquisition payante et optimisation du taux de conversion adaptés à votre audience.',
      points: ['SEO', 'Acquisition', 'CRO', 'Analytics'],
      bg: '#181818', fg: '#F0E2D3', accent: '#B86443',
    },
    {
      num: '02', title: 'Design UX/UI',
      desc: 'Création d’interfaces immersives et centrées sur l’utilisateur. Du wireframing au prototypage haute-fidélité.',
      points: ['Direction artistique', 'Prototypage', 'Design système', 'Motion'],
      bg: '#B86443', fg: '#121212', accent: '#F0E2D3',
    },
    {
      num: '03', title: 'Intégration IA',
      desc: 'Mise en place d’automatisations intelligentes, d’outils basés sur les LLMs et d’infrastructures IA dédiées.',
      points: ['Automatisations', 'LLMs', 'Chatbots', 'Workflows'],
      bg: '#EDE2D0', fg: '#121212', accent: '#B86443',
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
        link: 'http://localhost:3001'
      },
      {
        title: 'Complice',
        desc: 'Landing Page • Application de productivité & bien-être',
        longDesc: 'Landing page premium pour l\'application Complice, conçue pour convertir des utilisateurs. Design épuré, dark mode, section features animées, témoignages et CTA stratégiques. Déployée sur Vercel.',
        tags: ['Landing Page', 'React', 'Vercel'],
        year: '2026',
        img: '/projects/complice.webp',
        link: 'https://complice-landing-page.vercel.app'
      }
    ],
    ia: [
      {
        title: 'Complice — App',
        desc: 'Application • Productivité & bien-être au quotidien',
        longDesc: 'Application mobile de productivité inspirée du système d\'intentionnalité. Routine matinale, timer Pomodoro, intentions du jour, suivi d\'humeur et objectifs hebdomadaires. Construite avec React Native + IA pour les suggestions personnalisées.',
        tags: ['App', 'Productivité', 'React Native', 'IA'],
        year: '2026',
        img: '/projects/complice-app.webp',
        link: 'https://complice-nu.vercel.app'
      },
      {
        title: 'Forge — Tracker Sport',
        desc: 'Application Mobile • Suivi d\'entraînement & performance',
        longDesc: 'Forge est le module de tracking sportif de l\'écosystème Bushi. Suivi de séances en temps réel, progression des charges, RPE dial, coach vocal, smart progression par l\'IA et partage de performances. Interface dark inspirée des arts martiaux.',
        tags: ['App', 'Sport', 'React', 'IA Coach'],
        year: '2026',
        img: '/projects/forge.webp',
        link: '#'
      },
      {
        title: 'Bushido — App Sport',
        desc: 'Application Mobile • Coaching sportif inspiré du Bushido',
        longDesc: 'MVP d\'une application de coaching sportif au design japonais. Interface sombre et premium avec suivi de séances, anneau de progression, calendrier d\'entraînement et stats personnalisées. Conçue pour transformer le sport en discipline de vie.',
        tags: ['App Design', 'UI/UX', 'Mobile'],
        year: '2026',
        img: '/projects/bushido.webp',
        link: '#'
      },
      {
        title: 'Agence SW — Dashboard IA',
        desc: 'Tableau de bord IA • Pilotage marketing temps réel',
        longDesc: 'Dashboard de pilotage complet pour une agence digitale. Vue d\'ensemble en temps réel des KPIs (leads, conversion, rétention), SEO score, Google My Business, veille concurrentielle et consultant IA intégré via Ollama. Interface dark avec accents néon.',
        tags: ['IA', 'Dashboard', 'React', 'Ollama'],
        year: '2026',
        img: '/projects/agence-sw.webp',
        link: '#'
      }
    ]
  };

  const blogPosts = [
    {
      title: "L'impact de l'IA sur le design UI/UX en 2026",
      category: "IA & Automatisation",
      date: "17 Jui 2026",
      readTime: "5 min",
      img: "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=75&w=1200&auto=format&fit=crop"
    },
    {
      title: "Comment optimiser vos conversions avec l'A/B testing",
      category: "Marketing Digital",
      date: "04 Jui 2026",
      readTime: "8 min",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=75&w=1200&auto=format&fit=crop"
    },
    {
      title: "Créer des expériences web immersives avec WebGL",
      category: "Web Design",
      date: "22 Mai 2026",
      readTime: "6 min",
      img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=75&w=1200&auto=format&fit=crop"
    }
  ];

  const blogCategories = ['Tous', 'Web Design', 'IA & Automatisation', 'Marketing Digital'];

  const filteredPosts = activeBlogCategory === 'Tous'
    ? blogPosts
    : blogPosts.filter(post => post.category === activeBlogCategory);

  const navLinks = [
    ['#work', 'Projets'],
    ['#manifeste', 'Manifeste'],
    ['#journal', 'Journal'],
    ['#expertise', 'Expertise'],
    ['#contact', 'Contact'],
  ] as const;

  return (
    <MotionConfig reducedMotion="user">
    <div className="noise w-full min-h-screen text-[#F0E2D3] font-sans overflow-x-clip bg-[#121212]">
      <Preloader />
      <Cursor />

      {/* Barre de progression globale du scroll */}
      <motion.div
        style={{ scaleX: pageProgressScale }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#B86443] origin-left z-[60]"
        aria-hidden="true"
      />

      {/* Navigation — logo à gauche, pastille de verre flottante à droite */}
      <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-6 md:px-10 py-6 z-50 mix-blend-exclusion">
        <button onClick={() => scrollTo('#top')} className="flex flex-col justify-center text-left group" aria-label="Retour en haut">
          <span className="text-[0.95rem] font-sans font-bold tracking-[0.18em] leading-none mb-1">MC CLENNY</span>
          <span className="text-2xl font-signature font-normal leading-none opacity-90 group-hover:text-[#B86443] transition-colors duration-500">Kareem</span>
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
                className={`relative text-[11px] font-semibold tracking-[0.2em] uppercase group transition-colors duration-500 ${isActive ? 'text-[#B86443]' : ''}`}
              >
                {label}
                <span className={`absolute -bottom-1 left-0 w-full h-px bg-[#B86443] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isActive ? 'scale-x-100' : 'origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100'}`} />
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
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-end items-center pb-24 md:pb-32 px-6 md:px-10">
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
              <a
                href="#work"
                onClick={e => { e.preventDefault(); scrollTo('#work'); }}
                className="group inline-flex items-center gap-4 pl-8 pr-2.5 py-2.5 bg-[#F0E2D3] text-[#121212] rounded-full font-semibold text-base tracking-wide transition-colors duration-500 hover:bg-[#B86443] hover:text-[#F0E2D3]"
              >
                Voir les Projets
                <span className="w-10 h-10 rounded-full bg-[#121212]/10 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                  <ArrowUpRight size={18} strokeWidth={1.5} />
                </span>
              </a>
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
            {[['https://linkedin.com', 'LinkedIn'], ['https://behance.net', 'Behance'], ['https://github.com/kareemmc-ctrl', 'GitHub']].map(([href, label]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
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
          {['React', 'TypeScript', 'Figma', 'Motion', 'Tailwind CSS', 'IA Générative', 'Three.js', 'Node.js'].map(t => (
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
      </section>

      {/* Le livre qui s'ouvre */}
      <BookSection />

      {/* Expertise — cartes empilées façon deck */}
      <section id="expertise" className="relative bg-[#121212]">
        <div className="pt-32 pb-8 px-6 md:px-16 max-w-7xl mx-auto">
          <span className="rounded-full border border-[#F0E2D3]/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] font-medium text-[#F0E2D3]/60 inline-block mb-8">
            Expertise
          </span>
          <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-light tracking-tight">
            <LineReveal>Trois métiers,</LineReveal>
            <LineReveal delay={0.12}><em className="italic text-[#B86443]">une obsession.</em></LineReveal>
          </h2>
        </div>
        <div ref={stackRef} className="relative" style={{ height: `${services.length * 100}vh` }}>
          {services.map((s, i) => (
            <StackCard key={s.num} i={i} total={services.length} progress={stackProgress} {...s} />
          ))}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          <AnimatePresence mode="wait">
            {projects[activeCategory].map((project, idx) => (
              <motion.a
                key={project.title}
                href={project.link !== '#' ? project.link : undefined}
                target={project.link !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                initial="hidden"
                whileInView="visible"
                variants={{ hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } }}
                viewport={{ once: true, margin: '-50px' }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.9, delay: idx * 0.12, ease: EASE }}
                className={`group cursor-pointer block ${idx % 2 !== 0 ? 'md:mt-32' : ''}`}
              >
                {/* Image — révélation par clip-path + zoom lent */}
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
                  <div className="absolute inset-0 bg-[#B86443]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-overlay pointer-events-none" />
                  <span className="absolute top-4 left-4 z-20 text-[10px] font-mono tracking-[0.2em] bg-[#121212]/70 backdrop-blur-md text-[#B86443] px-3 py-1.5 rounded-full border border-[#B86443]/30">{project.year}</span>
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
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Journal — grande feuille de papier crème qui casse le fond sombre */}
      <section id="journal" className="paper text-[#1c120c] rounded-[2rem] md:rounded-[3rem] mx-2 md:mx-4 relative z-10 overflow-hidden">
        <div className="py-24 md:py-32 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 md:mb-24 gap-12">
            <div>
              <span className="rounded-full border border-[#1c120c]/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] font-semibold text-[#B86443] inline-block mb-8">
                Réflexions
              </span>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light tracking-tight">
                <LineReveal>Le <em className="italic text-[#B86443]">journal</em></LineReveal>
              </h2>
            </div>

            <div className="flex flex-wrap gap-6 border-b border-[#1c120c]/10 pb-4">
              {blogCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveBlogCategory(category)}
                  className={`text-base md:text-lg font-medium tracking-tight transition-colors duration-500 ${activeBlogCategory === category ? 'text-[#B86443]' : 'text-[#1c120c]/40 hover:text-[#1c120c]'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {filteredPosts.map((post, idx) => (
                <motion.div
                  key={post.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.7, delay: idx * 0.1, ease: EASE }}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="w-full aspect-[4/3] bg-[#1c120c]/5 overflow-hidden mb-6 relative rounded-2xl shadow-[0_18px_40px_-24px_rgba(28,18,12,0.35)]">
                    <div className="absolute inset-0 bg-[#121212]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#B86443] flex items-center justify-center text-[#FAF5EB] -rotate-45 group-hover:rotate-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                        <ArrowUpRight size={22} strokeWidth={1.5} />
                      </div>
                    </div>
                    <img
                      src={post.img}
                      alt={`Illustration de l'article : ${post.title}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-[#1c120c]/50 mb-3">
                    <span className="text-[#B86443] font-semibold">{post.category}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="font-display text-xl md:text-2xl font-medium leading-tight group-hover:text-[#B86443] transition-colors duration-500">{post.title}</h3>

                  <div className="mt-auto pt-6 text-sm font-medium opacity-50">
                    {post.date}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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

      {/* Footer / Contact — grand bloc terracotta */}
      <footer ref={footerRef} id="contact" className="pt-28 md:pt-36 pb-10 px-6 md:px-16 bg-[#B86443] text-[#121212] overflow-hidden relative rounded-t-[2rem] md:rounded-t-[3rem] -mt-6 z-10">
        {/* Halo décoratif */}
        <div className="absolute -top-40 right-[-10%] w-[42rem] h-[42rem] rounded-full bg-[#F0E2D3] opacity-[0.07] blur-3xl pointer-events-none" />
        <motion.div style={{ y: footerY }} className="w-full relative z-10">

          {/* En-tête : disponibilité + titre + CTA email */}
          <div className="max-w-7xl mx-auto mb-20 md:mb-28">
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
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Disponible pour de nouveaux projets</span>
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
              <a
                href="mailto:kareemmcclenny@gmail.com"
                className="group inline-flex items-center gap-4 pl-8 pr-2.5 py-2.5 bg-[#121212] text-[#F0E2D3] rounded-full font-semibold text-base md:text-lg tracking-wide transition-colors duration-500 hover:bg-[#F0E2D3] hover:text-[#121212] active:scale-[0.98]"
              >
                kareemmcclenny@gmail.com
                <span className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#F0E2D3]/10 group-hover:bg-[#121212]/10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight size={19} strokeWidth={1.5} />
                </span>
              </a>
              <button
                onClick={() => copyToClipboard('kareemmcclenny@gmail.com', 'email')}
                aria-label="Copier l'adresse email"
                className="inline-flex items-center gap-2.5 rounded-full border border-[#121212]/25 px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] transition-colors duration-500 hover:bg-[#121212]/10 active:scale-[0.98]"
              >
                {copied === 'email' ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.75} />}
                {copied === 'email' ? 'Copié !' : "Copier l'email"}
              </button>
            </motion.div>
          </div>

          {/* Grille : infos à gauche, formulaire à droite */}
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 border-t border-[#121212]/15 pt-16 md:pt-20">

            {/* Colonne infos */}
            <div className="flex flex-col gap-12">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-60 mb-5 block">Contact direct</span>
                <div className="flex flex-col gap-4 text-lg md:text-xl font-medium tracking-tight">
                  <button
                    onClick={() => copyToClipboard('07 49 80 86 98', 'tel')}
                    className="group flex items-center gap-4 text-left hover:opacity-70 transition-opacity duration-500"
                    aria-label="Copier le numéro de téléphone"
                  >
                    <span className="w-10 h-10 rounded-full border border-[#121212]/25 flex items-center justify-center shrink-0">
                      {copied === 'tel' ? <Check size={16} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.75} />}
                    </span>
                    {copied === 'tel' ? 'Numéro copié !' : '07 49 80 86 98'}
                  </button>
                  <span className="flex items-center gap-4 opacity-80">
                    <span className="w-10 h-10 rounded-full border border-[#121212]/25 flex items-center justify-center shrink-0">
                      <MapPin size={16} strokeWidth={1.5} />
                    </span>
                    Paris, France — {parisTime && `${parisTime} heure locale`}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-60 mb-5 block">Réseaux</span>
                <div className="flex flex-wrap gap-3">
                  {[
                    ['https://linkedin.com', 'LinkedIn'],
                    ['https://behance.net', 'Behance'],
                    ['https://github.com/kareemmc-ctrl', 'GitHub'],
                  ].map(([href, label]) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 rounded-full border border-[#121212]/25 pl-5 pr-2 py-2 text-[12px] font-bold uppercase tracking-[0.15em] transition-colors duration-500 hover:bg-[#121212] hover:text-[#F0E2D3] hover:border-[#121212]"
                    >
                      {label}
                      <span className="w-7 h-7 rounded-full bg-[#121212]/10 group-hover:bg-[#F0E2D3]/15 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
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
                      className="w-full bg-transparent border-b-2 border-[#121212]/30 py-3 text-xl font-medium placeholder:text-[#121212]/30 focus:border-[#121212] outline-none transition-colors duration-500"
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
                      className="w-full bg-transparent border-b-2 border-[#121212]/30 py-3 text-xl font-medium placeholder:text-[#121212]/30 focus:border-[#121212] outline-none transition-colors duration-500"
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
                      className="w-full bg-transparent border-b-2 border-[#121212]/30 py-3 text-xl font-medium focus:border-[#121212] outline-none transition-colors duration-500 appearance-none cursor-pointer rounded-none"
                    >
                      <option value="Webdesign & UX/UI">Webdesign & UX/UI</option>
                      <option value="Intelligence Artificielle">Solutions IA (Apps, Workflows)</option>
                      <option value="Marketing Digital">Marketing Digital & Stratégie</option>
                      <option value="Autre demande">Autre demande</option>
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
                    className="w-full bg-transparent border-b-2 border-[#121212]/30 py-3 text-lg font-medium placeholder:text-[#121212]/30 focus:border-[#121212] outline-none transition-colors duration-500 resize-none"
                  />
                </div>

                <button type="submit" className="group self-start mt-2 pl-10 pr-2.5 py-2.5 bg-[#121212] text-[#F0E2D3] rounded-full font-bold tracking-[0.15em] uppercase text-sm transition-colors duration-500 hover:bg-[#F0E2D3] hover:text-[#121212] flex items-center gap-4 active:scale-[0.98]">
                  Envoyer le message
                  <span className="w-10 h-10 rounded-full bg-[#F0E2D3]/10 group-hover:bg-[#121212]/10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={17} strokeWidth={1.5} />
                  </span>
                </button>
              </form>
            </motion.div>
          </div>

          {/* Signature géante */}
          <div className="max-w-7xl mx-auto mt-24 md:mt-28 flex justify-center overflow-hidden" aria-hidden="true">
            <motion.span
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 0.9, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE }}
              className="font-signature text-[clamp(4.5rem,14vw,12rem)] leading-none -rotate-2 select-none"
            >
              Kareem
            </motion.span>
          </div>

          {/* Barre de bas de page */}
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#121212]/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 text-center md:text-left">
              © 2026 MC CLENNY Kareem — Conçu & développé avec soin
            </span>
            <div className="flex items-center gap-6">
              <a href="#mentions-legales" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity duration-500">
                <FileText size={13} strokeWidth={1.5} /> Mentions Légales
              </a>
              <a href="#confidentialite" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity duration-500">
                <Shield size={13} strokeWidth={1.5} /> Confidentialité
              </a>
              <button
                onClick={() => scrollTo('#top')}
                aria-label="Retour en haut de page"
                className="group w-11 h-11 rounded-full border border-[#121212]/25 flex items-center justify-center transition-colors duration-500 hover:bg-[#121212] hover:text-[#F0E2D3] active:scale-[0.95]"
              >
                <ArrowUp size={17} strokeWidth={1.5} className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
    </MotionConfig>
  );
}
