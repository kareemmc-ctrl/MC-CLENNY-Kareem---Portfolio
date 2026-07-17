import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';
import { ArrowUpRight, ChevronDown, Plus, Minus, FileText, Shield } from 'lucide-react';
import Chatbot from './components/Chatbot';

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-[#F0E2D3]/10 py-8">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-left focus:outline-none group"
      >
        <span className="text-2xl font-semibold group-hover:text-[#B86443] transition-colors">{question}</span>
        <span className="ml-4 flex-shrink-0 text-[#B86443]">
          {isOpen ? <Minus size={24} /> : <Plus size={24} />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pt-6 text-lg text-[#F0E2D3]/60 leading-relaxed max-w-4xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const footerRef = useRef(null);
  const { scrollYProgress: footerScrollProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });
  const footerY = useTransform(footerScrollProgress, [0, 1], [400, 0]);

  const [activeCategory, setActiveCategory] = useState<'webdesign' | 'ia'>('webdesign');
  const [activeBlogCategory, setActiveBlogCategory] = useState<string>('Tous');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Webdesign & UX/UI',
    message: ''
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Nouveau contact : ${formData.service} - de ${formData.name}`);
    const body = encodeURIComponent(`Nom: ${formData.name}\nEmail: ${formData.email}\nService: ${formData.service}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:kareemmcclenny@gmail.com?subject=${subject}&body=${body}`;
  };

  const projects = {
    webdesign: [
      {
        title: 'Atelier Kawa',
        desc: 'Landing Page • Torréfaction & Café de spécialité',
        longDesc: 'Conception complète de la landing page pour Atelier Kawa, artisan torréfacteur. Design immersif avec vidéo hero en plein écran, animations au scroll, section storytelling et formulaire de commande. Stack : HTML/CSS/JS + Vite.',
        tags: ['Landing Page', 'Web Design', 'Animations'],
        year: '2026',
        img: '/projects/atelier-kawa.png',
        link: 'http://localhost:3001'
      },
      {
        title: 'Complice',
        desc: 'Landing Page • Application de productivité & bien-être',
        longDesc: 'Landing page premium pour l\'application Complice, conçue pour convertir des utilisateurs. Design épuré, dark mode, section features animées, témoignages et CTA stratégiques. Déployée sur Vercel avec gestion de CGU et mentions légales.',
        tags: ['Landing Page', 'React', 'Vercel'],
        year: '2026',
        img: '/projects/complice.png',
        link: 'https://complice-landing-page.vercel.app'
      }
    ],
    ia: [
      {
        title: 'Bushido — App Sport',
        desc: 'Application Mobile • Coaching sportif inspiré du Bushido',
        longDesc: 'MVP d\'une application de coaching sportif au design japonais. Interface sombre et premium avec suivi de séances, anneau de progression, calendrier d\'entraînement et stats personnalisées. Conçue pour transformer le sport en discipline de vie.',
        tags: ['App Design', 'UI/UX', 'Mobile'],
        year: '2026',
        img: '/projects/bushido.png',
        link: '#'
      },
      {
        title: 'Agence SW — Dashboard IA',
        desc: 'Tableau de bord IA • Pilotage marketing temps réel',
        longDesc: 'Dashboard de pilotage complet pour une agence digitale. Vue d\'ensemble en temps réel des KPIs (leads, conversion, rétention), SEO score, Google My Business, veille concurrentielle et consultant IA intégré via Ollama. Interface dark avec accents néon.',
        tags: ['IA', 'Dashboard', 'React', 'Ollama'],
        year: '2026',
        img: '/projects/agence-sw.png',
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
      img: "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?q=80&w=2000&auto=format&fit=crop"
    },
    {
      title: "Comment optimiser vos conversions avec l'A/B testing",
      category: "Marketing Digital",
      date: "04 Jui 2026",
      readTime: "8 min",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop"
    },
    {
      title: "Créer des expériences web immersives avec WebGL",
      category: "Web Design",
      date: "22 Mai 2026",
      readTime: "6 min",
      img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop"
    }
  ];

  const blogCategories = ['Tous', 'Web Design', 'IA & Automatisation', 'Marketing Digital'];
  
  const filteredPosts = activeBlogCategory === 'Tous' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeBlogCategory);

  return (
    <div className="w-full min-h-screen text-[#F0E2D3] font-sans overflow-x-hidden bg-[#121212]">
      {/* Initial Page Load Transition Overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
        className="fixed inset-0 z-[100] bg-[#121212] pointer-events-none"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-16 py-12 z-50">
        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="flex flex-col justify-center">
            <span className="text-[1.1rem] font-sans font-bold tracking-[0.15em] leading-none mb-1">MC CLENNY</span>
            <span className="text-3xl font-signature font-normal tracking-normal leading-none opacity-90">Kareem</span>
          </div>
        </div>
        <div className="flex gap-12 items-center">
          <a
            href="#work"
            className="text-sm font-semibold tracking-widest uppercase transition-colors duration-300 hover:text-[#B86443]"
          >
            PROJETS
          </a>
          <a
            href="#journal"
            className="text-sm font-semibold tracking-widest uppercase transition-colors duration-300 hover:text-[#B86443]"
          >
            JOURNAL
          </a>
          <a
            href="#expertise"
            className="text-sm font-semibold tracking-widest uppercase transition-colors duration-300 hover:text-[#B86443]"
          >
            EXPERTISE
          </a>
          <a
            href="#contact"
            className="text-sm font-semibold tracking-widest uppercase transition-colors duration-300 hover:text-[#B86443]"
          >
            CONTACT
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex flex-col justify-end items-center pb-32 px-10 overflow-hidden bg-transparent">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none [&::-webkit-media-controls]:hidden"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_3GG7Y16i1wZd6gC9IXwtKc5HQug/hf_20260717_115329_696a8707-668a-4222-8eb3-1e7f2fd27998.mp4"
        />
        <div
          className="absolute inset-0 w-full h-full z-10"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 50%, #121212 100%)' }}
        />
        <motion.div
          style={{ y, opacity }}
          className="relative z-20 flex w-full flex-col items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
          <h1 className="text-[7.5rem] leading-none font-bold tracking-tighter mb-6">
            Design Digital & IA
          </h1>

          <p className="text-[1.35rem] text-[#F0E2D3] opacity-70 font-light max-w-3xl mb-12">
            Création d'expériences web immersives et d'automatisations intelligentes.
          </p>

          <a href="#work" className="px-12 py-5 bg-[#F0E2D3] text-[#121212] rounded-full font-semibold text-lg tracking-wide transition-all duration-300 hover:bg-[#B86443] hover:text-[#F0E2D3] cursor-pointer">
            Voir les Projets
          </a>
          </motion.div>
        </motion.div>

        {/* Social Links */}
        <div className="absolute bottom-12 right-16 z-20 flex gap-8">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold tracking-widest uppercase transition-colors duration-300 hover:text-[#B86443]"
          >
            LINKEDIN
          </a>
          <a
            href="https://behance.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold tracking-widest uppercase transition-colors duration-300 hover:text-[#B86443]"
          >
            BEHANCE
          </a>
        </div>
      </section>

      {/* Infinite Marquee Section */}
      <section className="py-24 border-y border-[#F0E2D3]/10 overflow-hidden flex whitespace-nowrap relative bg-[#121212]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
          className="flex whitespace-nowrap text-[6rem] font-bold tracking-tighter uppercase opacity-10"
        >
          <span className="mx-10">Marketing Digital</span>
          <span>•</span>
          <span className="mx-10">Design UX/UI</span>
          <span>•</span>
          <span className="mx-10">Intégration IA</span>
          <span>•</span>
          <span className="mx-10">Marketing Digital</span>
          <span>•</span>
          <span className="mx-10">Design UX/UI</span>
          <span>•</span>
          <span className="mx-10">Intégration IA</span>
          <span>•</span>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-48 px-16 max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-[3.5rem] leading-[1.2] font-light max-w-5xl"
        >
          J'aide les marques à se développer en alliant un <span className="text-[#B86443] font-medium">web design créatif</span>, un <span className="text-[#B86443] font-medium">marketing digital</span> orienté données, et une <span className="text-[#B86443] font-medium">intelligence artificielle</span> de pointe.
        </motion.h2>
      </section>

      {/* Expertise Section */}
      <section id="expertise" className="py-32 px-16 bg-[#181818]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8"
          >
            <h2 className="text-6xl font-bold tracking-tighter">Mon Expertise</h2>
            <p className="text-xl opacity-60 max-w-md md:text-right">Une approche holistique de la croissance digitale, de la stratégie à l'exécution au pixel près.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="group p-10 border border-[#F0E2D3]/10 hover:border-[#B86443]/50 transition-colors duration-500 flex flex-col justify-between h-[450px]"
            >
              <div>
                <span className="text-6xl text-[#B86443] mb-6 block opacity-80 group-hover:opacity-100 transition-opacity">01</span>
                <h3 className="text-3xl font-bold mb-4">Marketing Digital</h3>
                <p className="text-[#F0E2D3]/60 leading-relaxed text-lg">
                  Croissance stratégique, SEO, acquisition payante et optimisation du taux de conversion adaptés à votre audience.
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border border-[#F0E2D3]/30 flex items-center justify-center group-hover:bg-[#B86443] group-hover:border-[#B86443] transition-all duration-300">
                <ArrowUpRight className="group-hover:-rotate-12 transition-transform duration-300" size={20} />
              </div>
            </motion.div>

            {/* Service 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="group p-10 border border-[#F0E2D3]/10 hover:border-[#B86443]/50 transition-colors duration-500 flex flex-col justify-between h-[450px]"
            >
              <div>
                <span className="text-6xl text-[#B86443] mb-6 block opacity-80 group-hover:opacity-100 transition-opacity">02</span>
                <h3 className="text-3xl font-bold mb-4">Design UX/UI</h3>
                <p className="text-[#F0E2D3]/60 leading-relaxed text-lg">
                  Création d'interfaces immersives et centrées sur l'utilisateur. Du wireframing au prototypage haute-fidélité.
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border border-[#F0E2D3]/30 flex items-center justify-center group-hover:bg-[#B86443] group-hover:border-[#B86443] transition-all duration-300">
                <ArrowUpRight className="group-hover:-rotate-12 transition-transform duration-300" size={20} />
              </div>
            </motion.div>

            {/* Service 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="group p-10 border border-[#F0E2D3]/10 hover:border-[#B86443]/50 transition-colors duration-500 flex flex-col justify-between h-[450px]"
            >
              <div>
                <span className="text-6xl text-[#B86443] mb-6 block opacity-80 group-hover:opacity-100 transition-opacity">03</span>
                <h3 className="text-3xl font-bold mb-4">Intégration IA</h3>
                <p className="text-[#F0E2D3]/60 leading-relaxed text-lg">
                  Mise en place d'automatisations intelligentes, d'outils basés sur les LLMs et d'infrastructures IA dédiées.
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border border-[#F0E2D3]/30 flex items-center justify-center group-hover:bg-[#B86443] group-hover:border-[#B86443] transition-all duration-300">
                <ArrowUpRight className="group-hover:-rotate-12 transition-transform duration-300" size={20} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Selected Works (Tabs & Grid) */}
      <section id="work" className="py-32 px-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold tracking-tighter mb-6">Projets Récents</h2>
            <div className="w-24 h-1 bg-[#B86443]"></div>
          </motion.div>
          
          <div className="flex flex-wrap gap-8 border-b border-[#F0E2D3]/10 pb-4">
            <button
              onClick={() => setActiveCategory('webdesign')}
              className={`text-2xl font-bold tracking-tighter transition-all duration-300 ${activeCategory === 'webdesign' ? 'text-[#B86443]' : 'text-[#F0E2D3]/30 hover:text-[#F0E2D3]'}`}
            >
              Webdesign & UI
            </button>
            <button
              onClick={() => setActiveCategory('ia')}
              className={`text-2xl font-bold tracking-tighter transition-all duration-300 ${activeCategory === 'ia' ? 'text-[#B86443]' : 'text-[#F0E2D3]/30 hover:text-[#F0E2D3]'}`}
            >
              Créations IA
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
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.7, delay: idx * 0.15, ease: 'easeOut' }}
                className={`group cursor-pointer block ${idx % 2 !== 0 ? 'md:mt-32' : ''}`}
              >
                {/* Image */}
                <div className="w-full aspect-[4/3] bg-[#1a1a1a] overflow-hidden mb-8 relative">
                  <div className="absolute inset-0 bg-[#B86443]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay"></div>
                  {/* Year badge */}
                  <span className="absolute top-4 left-4 z-20 text-xs font-mono tracking-widest bg-[#121212]/80 text-[#B86443] px-3 py-1 border border-[#B86443]/40">{project.year}</span>
                  <img 
                    src={project.img} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                  />
                </div>

                {/* Title + arrow */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-3xl font-semibold mb-2">{project.title}</h3>
                    <span className="text-[#F0E2D3]/50 font-mono text-sm uppercase tracking-widest">{project.desc}</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-[#F0E2D3]/30 flex items-center justify-center group-hover:bg-[#B86443] group-hover:border-[#B86443] transition-all duration-300 -rotate-45 group-hover:rotate-0 flex-shrink-0 ml-4">
                    <ArrowUpRight size={20} />
                  </div>
                </div>

                {/* Long description */}
                <p className="text-[#F0E2D3]/60 text-sm leading-relaxed mb-5 max-w-lg">{project.longDesc}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-xs font-mono tracking-widest uppercase px-3 py-1 border border-[#F0E2D3]/15 text-[#F0E2D3]/50 hover:border-[#B86443]/60 hover:text-[#B86443] transition-colors duration-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>

      </section>

      {/* Journal / Blog Section */}
      <section id="journal" className="py-32 px-16 max-w-7xl mx-auto border-t border-[#F0E2D3]/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold tracking-tighter mb-6">Journal</h2>
            <div className="w-24 h-1 bg-[#B86443]"></div>
          </motion.div>
          
          <div className="flex flex-wrap gap-6 border-b border-[#F0E2D3]/10 pb-4">
            {blogCategories.map(category => (
              <button
                key={category}
                onClick={() => setActiveBlogCategory(category)}
                className={`text-lg font-semibold tracking-tight transition-all duration-300 ${activeBlogCategory === category ? 'text-[#B86443]' : 'text-[#F0E2D3]/40 hover:text-[#F0E2D3]'}`}
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
                className="group cursor-pointer flex flex-col"
              >
                <div className="w-full aspect-[4/3] bg-[#1a1a1a] overflow-hidden mb-6 relative rounded-sm">
                  <div className="absolute inset-0 bg-[#121212]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#B86443] flex items-center justify-center text-[#121212] -rotate-45 group-hover:rotate-0 transition-transform duration-300">
                      <ArrowUpRight size={24} />
                    </div>
                  </div>
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                
                <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-[#F0E2D3]/50 mb-3">
                  <span className="text-[#B86443] font-semibold">{post.category}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                
                <h3 className="text-2xl font-bold leading-tight group-hover:text-[#B86443] transition-colors">{post.title}</h3>
                
                <div className="mt-auto pt-6 text-sm font-semibold opacity-60">
                  {post.date}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 flex flex-col items-center text-center"
        >
          <h2 className="text-5xl font-bold tracking-tighter mb-6">Questions Fréquentes</h2>
          <div className="w-24 h-1 bg-[#B86443]"></div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <FaqItem 
            question="Quels types de projets acceptez-vous ?" 
            answer="Je travaille avec des startups, des agences et des entreprises de toutes tailles pour concevoir des expériences web sur mesure (sites vitrines, e-commerce, portfolios) et intégrer des solutions IA (automatisations, bots, optimisation de flux de travail)." 
          />
          <FaqItem 
            question="Combien de temps faut-il pour créer un site web ?" 
            answer="Le délai dépend de la complexité du projet. Une landing page ou un site vitrine peut prendre entre 2 et 4 semaines, tandis qu'une application sur mesure ou une plateforme e-commerce complexe peut nécessiter 2 à 3 mois." 
          />
          <FaqItem 
            question="Comment l'IA peut-elle aider mon entreprise ?" 
            answer="L'IA peut transformer votre entreprise de multiples façons : automatisation des tâches répétitives (emails, génération de rapports), création de chatbots pour le service client, ou encore génération de contenu intelligent. L'objectif est de vous faire gagner du temps et de la valeur." 
          />
          <FaqItem 
            question="Faites-vous aussi du SEO et du marketing digital ?" 
            answer="Absolument. Mon approche est holistique : un beau site web ne sert à rien s'il n'est pas vu. J'intègre les meilleures pratiques SEO dès la conception et je peux vous accompagner sur vos stratégies d'acquisition et de conversion." 
          />
        </div>
      </section>

      {/* Big Footer / Contact CTA & Form */}
      <footer ref={footerRef} id="contact" className="pt-32 pb-16 px-8 md:px-16 bg-[#B86443] text-[#121212] overflow-hidden relative">
        <motion.div style={{ y: footerY }} className="w-full relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-24">
          
          {/* Left Col - Contact Info */}
          <div className="flex-1 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-[5rem] lg:text-[7.5rem] leading-[0.9] font-bold tracking-tighter mb-12">
                Travaillons<br />ensemble.
              </h2>
              <div className="flex flex-col gap-6 text-3xl font-medium tracking-tight">
                <a href="mailto:kareemmcclenny@gmail.com" className="hover:opacity-60 transition-opacity flex items-center gap-4">
                  <ArrowUpRight size={32} />
                  kareemmcclenny@gmail.com
                </a>
                <a href="tel:0749808698" className="hover:opacity-60 transition-opacity flex items-center gap-4">
                  <ArrowUpRight size={32} />
                  07 49 80 86 98
                </a>
              </div>
            </motion.div>
            
            <div className="hidden lg:flex flex-col text-left mt-32">
              <span className="text-sm font-semibold opacity-70 uppercase tracking-widest mb-6">Liens Rapides</span>
              <div className="flex flex-col gap-4 mb-8">
                <a href="#mentions-legales" className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                  <FileText size={16} /> Mentions Légales
                </a>
                <a href="#confidentialite" className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                  <Shield size={16} /> Politique de Confidentialité
                </a>
              </div>
              <span className="text-sm font-semibold opacity-70 uppercase tracking-widest">© 2026 Tous droits réservés</span>
            </div>
          </div>

          {/* Right Col - Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-xl lg:ml-auto"
          >
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-10">
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">Quel est votre nom ?</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Jean Dupont"
                  className="w-full bg-transparent border-b-2 border-[#121212]/30 py-3 text-2xl font-medium placeholder:text-[#121212]/30 focus:border-[#121212] outline-none transition-colors"
                />
              </div>

              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">Votre adresse email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="jean@exemple.com"
                  className="w-full bg-transparent border-b-2 border-[#121212]/30 py-3 text-2xl font-medium placeholder:text-[#121212]/30 focus:border-[#121212] outline-none transition-colors"
                />
              </div>

              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">Comment puis-je vous aider ?</label>
                <div className="relative">
                  <select
                    required
                    value={formData.service}
                    onChange={e => setFormData({...formData, service: e.target.value})}
                    className="w-full bg-transparent border-b-2 border-[#121212]/30 py-3 text-2xl font-medium focus:border-[#121212] outline-none transition-colors appearance-none cursor-pointer rounded-none"
                  >
                    <option value="Webdesign & UX/UI">Webdesign & UX/UI</option>
                    <option value="Intelligence Artificielle">Solutions IA (Apps, Workflows)</option>
                    <option value="Marketing Digital">Marketing Digital & Stratégie</option>
                    <option value="Autre demande">Autre demande</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={24} />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">Parlez-moi de votre projet</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="Bonjour, je cherche un expert pour..."
                  className="w-full bg-transparent border-b-2 border-[#121212]/30 py-3 text-xl font-medium placeholder:text-[#121212]/30 focus:border-[#121212] outline-none transition-colors resize-none"
                />
              </div>

              <button type="submit" className="group self-start mt-4 px-12 py-5 bg-[#121212] text-[#F0E2D3] rounded-full font-bold tracking-widest uppercase text-sm transition-all duration-300 hover:bg-[#F0E2D3] hover:text-[#121212] flex items-center gap-4">
                Envoyer le message
                <ArrowUpRight className="group-hover:rotate-45 transition-transform duration-300" size={18} />
              </button>
            </form>
          </motion.div>
        </div>

        {/* Mobile Footer Bottom */}
        <div className="mt-32 pt-8 border-t border-[#121212]/20 flex flex-col items-center gap-6 lg:hidden relative z-10">
          <div className="flex flex-col text-center">
            <span className="text-xs font-semibold opacity-70 uppercase tracking-widest">© 2026 Tous droits réservés</span>
          </div>
          <div className="flex gap-8">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="font-bold uppercase text-sm tracking-widest hover:opacity-60 transition-opacity">LinkedIn</a>
            <a href="https://behance.net" target="_blank" rel="noopener noreferrer" className="font-bold uppercase text-sm tracking-widest hover:opacity-60 transition-opacity">Behance</a>
          </div>
          <div className="flex flex-col gap-4 mt-2 w-full text-left">
            <span className="text-xs font-semibold opacity-70 uppercase tracking-widest text-center mb-2">Liens Rapides</span>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a href="#mentions-legales" className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                <FileText size={14} /> Mentions Légales
              </a>
              <a href="#confidentialite" className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                <Shield size={14} /> Confidentialité
              </a>
            </div>
          </div>
        </div>
        </motion.div>
      </footer>
      
      <Chatbot />
    </div>
  );
}
