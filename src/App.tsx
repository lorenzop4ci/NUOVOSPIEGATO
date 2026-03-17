import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Menu, ArrowRight, X, ArrowUpRight, Plus, Instagram, Youtube, Facebook, MessageCircle, ChevronLeft, ChevronRight, Linkedin, Mail, Lock, Play, Volume2, VolumeX } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { supabase, Work } from './lib/supabase';

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
};

const ParallaxImage = React.memo(({ src, alt, className, fit = 'cover' }: { src: string | null, alt?: string, className?: string, fit?: 'cover' | 'contain' }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y, height: '130%', top: '-15%', width: '100%', position: 'absolute' }}>
        <div className="w-full h-full transition-transform duration-700 group-hover:scale-110">
          {src ? (
            <img 
              src={src} 
              alt={alt} 
              className={`w-full h-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
              referrerPolicy="no-referrer"
              draggable="false"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-transparent" />
          )}
        </div>
      </motion.div>
    </div>
  );
});

const Navbar = ({ onMenuClick, settings }: { onMenuClick: () => void, settings: any }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 pt-6 pb-6 transition-all duration-500 ${scrolled ? 'bg-gradient-to-b from-redd-light/100 via-redd-light/40 to-transparent text-redd-dark' : 'text-white'}`}>
      <Link 
        to="/" 
        onClick={(e) => {
          if (window.location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="flex flex-col hover:opacity-80 transition-opacity w-full"
      >
        {settings.header_logo ? (
          <div className={`w-full flex ${settings.header_title_align === 'text-center' ? 'justify-center' : settings.header_title_align === 'text-right' ? 'justify-end' : 'justify-start'}`}>
            <img 
              src={settings.header_logo} 
              alt="Logo" 
              style={{ height: `${settings.header_logo_height || 40}px` }}
              className={`w-auto object-contain ${!scrolled ? 'brightness-0 invert' : ''}`} 
            />
          </div>
        ) : (
          <div className={`w-fit flex flex-col items-center`}>
            <div className={`${settings.header_title_size || 'text-xl'} font-bold tracking-tight uppercase text-center`}>
              {settings.header_title || "SPIEGATO IN BREVE"}
            </div>
            <div className={`${settings.header_subtitle_size || 'text-[10px]'} tracking-[0.2em] uppercase opacity-70 text-center`}>
              {settings.header_subtitle || "CINEMA & POP CULTURE"}
            </div>
          </div>
        )}
      </Link>
      <div className="flex items-center absolute right-6 md:right-12">
        <button onClick={onMenuClick} className="flex items-center hover:opacity-70 transition-opacity">
          <Menu size={32} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
};

const Hero = ({ data, settings }: { data: any, settings: any }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.6]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -250]);

  const titleSize = settings?.section1_title_size || 'text-5xl md:text-7xl lg:text-8xl';
  const subtitleSize = settings?.section1_subtitle_size || 'text-sm md:text-base';
  const descSize = settings?.section1_desc_size || 'text-lg md:text-xl';

  return (
    <section ref={ref} className="relative z-0 h-[100vh] w-full bg-redd-dark">
      <div className="absolute top-0 left-0 h-full w-full overflow-hidden -z-10">
        <div className="sticky top-0 h-screen w-full">
          {data?.media_type === 'youtube' ? (
            <div className="w-full h-full bg-black overflow-hidden relative">
              <iframe 
                src={`${getYouTubeEmbedUrl(data.video_url)}?autoplay=1&mute=1&loop=1&playlist=${data.video_url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${data?.fit === 'width' ? 'w-full h-auto' : data?.fit === 'height' ? 'w-auto h-full' : 'h-full scale-[1.1]'}`}
                style={data?.fit === 'width' || data?.fit === 'height' ? { aspectRatio: '16/9' } : { minWidth: '177.77vh' }}
                allow="autoplay; encrypted-media"
              ></iframe>
            </div>
          ) : data?.media_type === 'video' ? (
            <div className="w-full h-full bg-black overflow-hidden relative">
              <video 
                src={data.video_url} 
                autoPlay 
                muted 
                loop 
                playsInline
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${data?.fit === 'width' ? 'w-full h-auto' : data?.fit === 'height' ? 'w-auto h-full' : 'w-full h-full object-cover'}`}
                style={data?.fit === 'width' || data?.fit === 'height' ? {} : { minWidth: '177.77vh' }}
              ></video>
            </div>
          ) : data?.image_url ? (
            <motion.img 
              style={{ scale, transformOrigin: "bottom center" }}
              src={data.image_url} 
              alt="Hero background" 
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${data?.fit === 'width' ? 'w-full h-auto' : data?.fit === 'height' ? 'w-auto h-full' : 'w-full h-full object-cover'} opacity-100`}
              referrerPolicy="no-referrer"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </div>
      <motion.div style={{ y: textY }} className={`absolute top-0 left-0 w-full h-screen flex flex-col justify-end p-6 md:p-16 lg:p-24 pb-24 md:pb-32 pointer-events-none ${data?.title_align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
        {data?.subtitle && (
          <div className={`${subtitleSize} tracking-[0.3em] uppercase mb-6 md:mb-8 font-bold opacity-80 text-white pointer-events-auto`}>
            {data.subtitle}
          </div>
        )}
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`text-white font-serif ${titleSize} leading-[1.1] max-w-5xl pointer-events-auto`}
        >
          {data?.title || ""}
        </motion.h1>
        {data?.description && (
          <p className={`mt-6 ${descSize} text-gray-300 max-w-2xl pointer-events-auto`}>
            {data.description}
          </p>
        )}
        {data?.link_text && data?.link_url && (
          <a 
            href={data.link_url}
            className="mt-8 inline-flex items-center gap-4 text-sm md:text-base uppercase tracking-widest border border-white px-8 py-4 hover:bg-white hover:text-black transition-colors text-white pointer-events-auto"
          >
            {data.link_text} <ArrowRight size={20} />
          </a>
        )}

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

const Process = ({ data, settings, index = 0, sticky = true }: { data: any, settings: any, index?: number, sticky?: boolean }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);

  const { scrollYProgress: activeProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"]
  });

  const pointerEvents = useTransform(activeProgress, [0, 0.9, 1], ["none", "none", "auto"]);

  const { scrollYProgress: entranceProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"]
  });

  const padding = useTransform(entranceProgress, [0.4, 1], ["24px", "0px"]);
  const borderRadius = useTransform(entranceProgress, [0.4, 1], ["48px", "0px"]);
  const entranceScale = useTransform(entranceProgress, [0, 1], [0.6, 1]);
  const entranceOpacity = useTransform(entranceProgress, [0, 0.5], [0, 1]);

  const steps = [
    { title: settings?.col1_title || "", desc: settings?.col1_text || "", link: "/gallery/galleria-3" },
    { title: settings?.col2_title || "", desc: settings?.col2_text || "", link: "/gallery/galleria-2" },
    { title: settings?.col3_title || "", desc: settings?.col3_text || "", link: "/gallery/galleria-1" },
    { title: settings?.col4_title || "", desc: settings?.col4_text || "" , link: "/about" }
  ];

  const titleSize = settings?.section2_title_size || 'text-4xl md:text-6xl lg:text-8xl';
  const subtitleSize = settings?.section2_subtitle_size || 'text-sm md:text-base';
  const descSize = settings?.section2_desc_size || 'text-lg md:text-xl';

  return (
    <section ref={ref} className={`${sticky ? 'sticky top-0' : 'relative'} z-10 h-[80vh] md:h-screen w-full bg-transparent`} style={{ borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem', overflow: 'hidden', zIndex: index, pointerEvents }}>
      <motion.div style={{ 
        paddingTop: `calc(${padding} + 4rem)`, 
        paddingLeft: padding, 
        paddingRight: padding, 
        width: '100%', 
        height: '100%', 
        borderTopLeftRadius: '3rem', 
        borderTopRightRadius: '3rem', 
        overflow: 'hidden',
        scale: entranceScale,
        opacity: entranceOpacity
      }}>
        <motion.div 
          style={{ overflow: 'hidden', borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem' }}
          className="relative h-full w-full bg-redd-dark text-white flex flex-col md:flex-row"
        >
        {/* Background Image/Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {data?.media_type === 'youtube' ? (
            <div className="w-full h-full bg-black overflow-hidden relative">
              <iframe 
                src={`${getYouTubeEmbedUrl(data.video_url)}?autoplay=1&mute=1&loop=1&playlist=${data.video_url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${data?.fit === 'width' ? 'w-full h-auto' : data?.fit === 'height' ? 'w-auto h-full' : 'object-cover'} opacity-80`}
                style={data?.fit === 'width' || data?.fit === 'height' ? { aspectRatio: '16/9' } : { minWidth: '177.77vh' }}
                allow="autoplay; encrypted-media"
              ></iframe>
            </div>
          ) : data?.media_type === 'video' ? (
            <div className="w-full h-full bg-black overflow-hidden relative">
              <video 
                src={data.video_url} 
                autoPlay 
                muted 
                loop 
                playsInline
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${data?.fit === 'width' ? 'w-full h-auto' : data?.fit === 'height' ? 'w-auto h-full' : 'object-cover'} opacity-80`}
                style={data?.fit === 'width' || data?.fit === 'height' ? {} : { minWidth: '177.77vh' }}
              ></video>
            </div>
          ) : data?.image_url ? (
            <motion.img 
              style={{ y, height: data?.fit === 'width' || data?.fit === 'height' ? 'auto' : '130%', top: data?.fit === 'width' || data?.fit === 'height' ? '50%' : '-15%', left: '50%', x: '-50%', y: data?.fit === 'width' || data?.fit === 'height' ? '-50%' : y, width: data?.fit === 'width' ? '100%' : data?.fit === 'height' ? 'auto' : '100%', height: data?.fit === 'height' ? '100%' : data?.fit === 'width' ? 'auto' : '130%', position: 'absolute', objectFit: data?.fit === 'width' || data?.fit === 'height' ? 'contain' : 'cover' }}
              src={data.image_url} 
              alt="Process background" 
              className="opacity-80"
              referrerPolicy="no-referrer"
            />
          ) : null}
        </div>

        {/* Large Absolute Text */}
        <motion.div 
          style={{ y: textY }} 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 p-6 md:p-16 lg:p-24 pointer-events-none flex flex-col justify-center md:pt-32 z-10 ${data?.title_align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
        >
          {data?.subtitle && (
            <div className={`${subtitleSize} tracking-[0.3em] uppercase mb-6 md:mb-8 font-bold opacity-80 text-white pointer-events-auto`}>
              {data.subtitle}
            </div>
          )}
          <h2 className={`${titleSize} font-serif max-w-5xl leading-[1.1]`}>
            {data?.title || ""}
          </h2>
          {data?.description && (
            <p className={`mt-6 ${descSize} text-gray-300 max-w-2xl pointer-events-auto`}>
              {data.description}
            </p>
          )}
          {data?.link_text && data?.link_url && (
            <a 
              href={data.link_url}
              className="mt-8 inline-flex items-center gap-4 text-sm md:text-base uppercase tracking-widest border border-white px-8 py-4 hover:bg-white hover:text-black transition-colors text-white pointer-events-auto w-fit"
            >
              {data.link_text} <ArrowRight size={20} />
            </a>
          )}
        </motion.div>

        <motion.div 
          style={{ opacity: 1 }}
          className="relative z-20 hidden md:flex w-full h-full"
        >
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="group relative flex-1 flex flex-col justify-end p-8 lg:p-12 overflow-hidden"
            >
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-t from-white/30 via-white/5 to-transparent pointer-events-none" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <Link to={step.link} className="absolute inset-x-0 bottom-0 h-1/2 z-20" />
              
              <div className="relative z-10">
                <div className="text-redd-accent font-mono text-xs mb-2">0{i + 1}</div>
                <h4 className="text-xl font-bold uppercase tracking-widest mb-2 group-hover:text-redd-accent transition-colors">{step.title}</h4>
                <p className="text-sm text-gray-400 max-w-[200px] line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Mobile List */}
        <div className="relative z-20 flex md:hidden flex-col justify-end h-full w-full p-6 pb-12 gap-6">
          {steps.map((step, i) => (
            <Link to={step.link} key={i} className="border-b border-white/20 pb-4 last:border-0 block hover:opacity-80 transition-opacity">
              <h3 className="text-2xl font-bold mb-2 flex items-center justify-between">
                {step.title}
                <ArrowRight size={20} className="opacity-50" />
              </h3>
              <p className="text-gray-300 text-sm">{step.desc}</p>
            </Link>
          ))}
        </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

const baseProjects: any[] = [];
const featuredProjects: any[] = [];

const Lightbox = ({ isOpen, onClose, project, allProjects = [] }: { isOpen: boolean, onClose: () => void, project: any, allProjects?: any[] }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(project);
  const [direction, setDirection] = useState(0);
  const [projectDirection, setProjectDirection] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentProject(project);
      if (lightboxRef.current) {
        lightboxRef.current.scrollTo(0, 0);
      }
    } else {
      document.body.style.overflow = '';
      setSelectedImageIndex(null);
      setGalleryImages([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, project]);

  useEffect(() => {
    if (isOpen && currentProject) {
      if (currentProject.id) {
        fetchGalleryImages(currentProject.id);
      } else if (currentProject.gallery) {
        setGalleryImages(currentProject.gallery);
      } else {
        setGalleryImages([]);
      }
    }
  }, [isOpen, currentProject]);

  const fetchGalleryImages = async (workId: string) => {
    try {
      const { data, error } = await supabase
        .from('work_images')
        .select('*')
        .eq('work_id', workId)
        .order('display_order', { ascending: true });
      if (error) {
        if (error.code === '42P01') {
          console.warn('work_images table not found. Please run the updated SQL schema.');
          return;
        }
        throw error;
      }
      if (data) {
        setGalleryImages(data.map(img => ({ 
          url: img.image_url, 
          media_type: img.media_type || 'image',
          video_url: img.video_url || '',
          title: img.title || '', 
          description: img.description || '',
          link: img.link || '#',
          seo_alt_text: img.seo_alt_text || ''
        })));
      }
    } catch (err: any) {
      if (!err.message?.includes('work_images')) {
        console.error('Error fetching gallery images:', err.message);
      }
    }
  };

  const handlePrevProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentProject && allProjects.length > 0) {
      const currentIndex = allProjects.findIndex(w => w.id === currentProject.id);
      if (currentIndex !== -1) {
        setProjectDirection(-1);
        const prevIndex = currentIndex === 0 ? allProjects.length - 1 : currentIndex - 1;
        setCurrentProject(allProjects[prevIndex]);
        if (lightboxRef.current) {
          lightboxRef.current.scrollTo(0, 0);
        }
      }
    }
  };

  const handleNextProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentProject && allProjects.length > 0) {
      const currentIndex = allProjects.findIndex(w => w.id === currentProject.id);
      if (currentIndex !== -1) {
        setProjectDirection(1);
        const nextIndex = currentIndex === allProjects.length - 1 ? 0 : currentIndex + 1;
        setCurrentProject(allProjects[nextIndex]);
        if (lightboxRef.current) {
          lightboxRef.current.scrollTo(0, 0);
        }
      }
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setDirection(-1);
      setSelectedImageIndex(selectedImageIndex === 0 ? galleryImages.length - 1 : selectedImageIndex - 1);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setDirection(1);
      setSelectedImageIndex(selectedImageIndex === galleryImages.length - 1 ? 0 : selectedImageIndex + 1);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && currentProject && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-white overflow-y-auto text-redd-dark"
          >
            <button 
              onClick={onClose}
              className="fixed top-6 right-6 md:top-8 md:right-8 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors z-[110]"
            >
              <X size={24} />
            </button>

            {/* Project Navigation Arrows */}
            {allProjects.length > 1 && (
              <>
                <button 
                  onClick={handlePrevProject}
                  className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/5 text-black rounded-full flex items-center justify-center hover:bg-black/10 transition-colors z-[110]"
                  title="Progetto precedente"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={handleNextProject}
                  className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/5 text-black rounded-full flex items-center justify-center hover:bg-black/10 transition-colors z-[110]"
                  title="Prossimo progetto"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            
            <AnimatePresence mode="wait" initial={false}>
              <motion.div 
                key={currentProject.id}
                initial={{ x: projectDirection * 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -projectDirection * 100, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-32"
              >
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-24">
                  {/* Left side: Text */}
                  <div className="w-full lg:w-1/2 flex flex-col">
                    <div className="text-sm tracking-[0.2em] uppercase text-gray-400 mb-4 font-bold">PROJECTS</div>
                    <h2 className="text-5xl md:text-7xl font-sans tracking-tight mb-12 uppercase">{currentProject.title}</h2>
                    
                    <div className="text-lg text-gray-600 space-y-1 leading-relaxed">
                      {(currentProject.description_top || currentProject.description)?.split('\n').map((paragraph: string, i: number) => (
                        <p key={i} className={paragraph.trim() === '' ? "h-2" : ""}>{paragraph}</p>
                      ))}
                    </div>

                    {currentProject.link_url && (
                      <a 
                        href={currentProject.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 text-sm uppercase tracking-widest bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-all mt-12 self-start"
                      >
                        {currentProject.link_label || 'Visit Project'} <ArrowUpRight size={18} />
                      </a>
                    )}
                  </div>
                  
                  {/* Right side: Cover Image (Sticky) */}
                  <div className="w-full lg:w-1/2">
                    <div className="sticky top-24">
                      <div className="overflow-hidden rounded-3xl shadow-2xl group bg-black/5">
                        {currentProject.cover_media_type === 'youtube' ? (
                          <div className="w-full aspect-video lg:aspect-auto lg:h-[80vh] rounded-3xl overflow-hidden shadow-2xl bg-black relative">
                            <iframe 
                              src={`${getYouTubeEmbedUrl(currentProject.cover_video_url)}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${currentProject.cover_video_url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}`}
                              className={`absolute top-0 left-1/2 -translate-x-1/2 ${currentProject.fit_large === 'width' ? 'w-full h-auto aspect-video' : 'h-full aspect-video'}`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                            ></iframe>
                            <button 
                              onClick={() => setIsMuted(!isMuted)}
                              className="absolute bottom-6 right-6 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                            >
                              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                          </div>
                        ) : currentProject.cover_media_type === 'video' ? (
                          <div className="w-full rounded-3xl overflow-hidden shadow-2xl bg-black flex items-center justify-center lg:h-[80vh] relative">
                            <video 
                              src={currentProject.cover_video_url} 
                              controls 
                              autoPlay 
                              muted={isMuted}
                              loop
                              className={`absolute top-0 left-1/2 -translate-x-1/2 ${currentProject.fit_large === 'width' ? 'w-full h-auto object-contain' : 'h-full object-cover'}`}
                              style={currentProject.fit_large === 'width' ? {} : { minWidth: '142.22vh' }}
                            ></video>
                            <button 
                              onClick={() => setIsMuted(!isMuted)}
                              className="absolute bottom-6 right-6 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                            >
                              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                          </div>
                        ) : (currentProject.cover_image_url || currentProject.image) ? (
                          <img 
                            src={currentProject.cover_image_url || currentProject.image} 
                            alt={currentProject.seo_alt_text || currentProject.title} 
                            className="w-full object-cover aspect-[4/5] transition-transform duration-700 group-hover:scale-110 bg-gray-100"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full aspect-[4/5] bg-gray-100" />
                        )}
                      </div>
                      {currentProject.cover_image_caption && (
                        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold text-right">
                          {currentProject.cover_image_caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Gallery Section */}
                {galleryImages && galleryImages.length > 0 && (
                  <div className="border-t border-gray-200 pt-16 mb-24">
                    <div className="text-sm tracking-[0.2em] uppercase text-gray-400 mb-12 font-bold">PROJECT GALLERY</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {galleryImages.map((img: any, idx: number) => (
                        <div 
                          key={idx}
                          className="overflow-hidden rounded-2xl shadow-lg cursor-pointer group relative bg-black"
                          onClick={() => setSelectedImageIndex(idx)}
                        >
                          {img.media_type === 'youtube' ? (
                            <div className="w-full aspect-video pointer-events-none">
                              <iframe 
                                src={`${getYouTubeEmbedUrl(img.video_url)}?autoplay=0&mute=1&controls=0&showinfo=0&rel=0`}
                                className="w-full h-full"
                                allow="autoplay; encrypted-media"
                              ></iframe>
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                                  <Play size={24} fill="currentColor" />
                                </div>
                              </div>
                            </div>
                          ) : img.media_type === 'video' ? (
                            <div className="w-full aspect-video pointer-events-none">
                              <video 
                                src={img.video_url} 
                                muted 
                                className="w-full h-full object-cover"
                              ></video>
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                                  <Play size={24} fill="currentColor" />
                                </div>
                              </div>
                            </div>
                          ) : img.url ? (
                            <>
                              <img 
                                src={img.url}
                                alt={img.seo_alt_text || img.title || `${currentProject.title} gallery ${idx + 1}`}
                                className="w-full object-cover aspect-video transition-transform duration-700 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                            </>
                          ) : (
                            <div className="w-full aspect-video bg-gray-100" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description Bottom */}
                {currentProject.description_bottom && (
                  <div className="border-t border-gray-200 pt-16">
                    <div className="text-sm tracking-[0.2em] uppercase text-gray-400 mb-8 font-bold">ADDITIONAL DETAILS</div>
                    <div className="text-lg text-gray-600 space-y-1 leading-relaxed max-w-4xl">
                      {currentProject.description_bottom.split('\n').map((paragraph: string, i: number) => (
                        <p key={i} className={paragraph.trim() === '' ? "h-2" : ""}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Second Lightbox for Gallery Images */}
      <AnimatePresence>
        {selectedImageIndex !== null && galleryImages && galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/85 overflow-y-auto"
            onClick={() => setSelectedImageIndex(null)}
          >
            <button 
              onClick={() => setSelectedImageIndex(null)}
              className="fixed top-6 right-6 md:top-8 md:right-8 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-[210]"
            >
              <X size={24} />
            </button>

            {/* Navigation Arrows */}
            <button 
              onClick={handlePrevImage}
              className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-[210]"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNextImage}
              className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-[210]"
            >
              <ChevronRight size={24} />
            </button>
            
            <div className="min-h-screen flex flex-col items-center p-4 py-24 md:p-12 md:py-24">
              <div className="relative w-full max-w-6xl flex flex-col items-center my-auto" onClick={(e) => e.stopPropagation()}>
                {galleryImages[selectedImageIndex].media_type === 'youtube' ? (
                  <div className="w-full h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-black relative">
                    <iframe 
                      src={`${getYouTubeEmbedUrl(galleryImages[selectedImageIndex].video_url)}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${galleryImages[selectedImageIndex].video_url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}`}
                      className={`absolute top-0 left-1/2 -translate-x-1/2 ${galleryImages[selectedImageIndex].fit_small === 'width' ? 'w-full h-auto aspect-video' : 'h-full aspect-video'}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute bottom-6 right-6 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </div>
                ) : galleryImages[selectedImageIndex].media_type === 'video' ? (
                  <div className="w-full h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-black flex items-center justify-center relative">
                    <video 
                      src={galleryImages[selectedImageIndex].video_url} 
                      controls 
                      autoPlay 
                      muted={isMuted}
                      loop
                      className={`absolute top-0 left-1/2 -translate-x-1/2 ${galleryImages[selectedImageIndex].fit_small === 'width' ? 'w-full h-auto object-contain' : 'h-full object-cover'}`}
                      style={galleryImages[selectedImageIndex].fit_small === 'width' ? {} : { minWidth: '160vh' }}
                    ></video>
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute bottom-6 right-6 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </div>
                ) : galleryImages[selectedImageIndex].url ? (
                  <motion.img 
                    key={selectedImageIndex} // Force re-render on index change for animation
                    initial={{ x: direction * 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -direction * 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    src={galleryImages[selectedImageIndex].url} 
                    alt={galleryImages[selectedImageIndex].title || "Gallery fullscreen"} 
                    className="w-full h-auto object-contain rounded-lg shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gray-900 rounded-lg" />
                )}
                
                {/* Image Info */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="mt-8 text-center text-white max-w-3xl"
                >
                  {galleryImages[selectedImageIndex].title && (
                    <h3 className="text-3xl font-bold mb-4">{galleryImages[selectedImageIndex].title}</h3>
                  )}
                  {galleryImages[selectedImageIndex].description && (
                    <p className="text-gray-300 text-base mb-6 leading-relaxed">{galleryImages[selectedImageIndex].description}</p>
                  )}
                  {galleryImages[selectedImageIndex].link && galleryImages[selectedImageIndex].link !== "#" && (
                    <a 
                      href={galleryImages[selectedImageIndex].link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-sm uppercase tracking-widest text-white hover:text-redd-accent transition-all border border-white/20 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10"
                    >
                      {galleryImages[selectedImageIndex].title || "VISIT LINK"} <ArrowUpRight size={18} />
                    </a>
                  )}
                  
                  {/* Image Counter */}
                  <div className="mt-12 text-sm tracking-[0.2em] text-white/50 font-mono">
                    {selectedImageIndex + 1} / {galleryImages.length}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const HorizontalGallery = ({ title, galleryId, projects, isLast = false, onMenuClick, onOpenLightbox, index = 0, sticky = true, showOverlay = true }: { title: string, galleryId?: string, projects: any[], isLast?: boolean, onMenuClick?: () => void, onOpenLightbox?: (project: any, projects?: any[]) => void, key?: string | number, index?: number, sticky?: boolean, showOverlay?: boolean }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // More precise pointer events: enable only when the section is mostly in view at the top
  const { scrollYProgress: activeProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"]
  });

  const pointerEvents = useTransform(activeProgress, [0, 0.9, 1], ["none", "none", "auto"]);
  
  // Adjusted overlay opacity to start earlier for a smoother transition
  const overlayOpacity = useTransform(scrollYProgress, [0.6, 0.9], [0, 1]);

  const { scrollYProgress: entranceProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"]
  });

  const isPersonaggi = title === 'Personaggi' || title === 'PERSONAGGI';
  const padding = useTransform(entranceProgress, [0.4, 1], ["24px", "0px"]);
  const bottomPadding = useTransform(entranceProgress, [0.4, 1], [
    isLast ? "62px" : (isPersonaggi ? "24px" : "24px"),
    isLast ? "38px" : (isPersonaggi ? "0px" : "0px")
  ]);
  const entranceOpacity = useTransform(entranceProgress, [0.1, 0.5], [0, 1]);

  const [activeIndex, setActiveIndex] = useState(0);

  const isDraggingRef = useRef(false);

  const handleNext = () => {
    if (projects.length <= 1) return;
    setActiveIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (projects.length <= 1) return;
    setActiveIndex(prev => prev - 1);
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    const swipeVelocity = velocity.x;
    
    if (swipe < -10 || swipeVelocity < -100) {
      handleNext();
    } else if (swipe > 10 || swipeVelocity > 100) {
      handlePrev();
    }

    // Reset dragging flag after a short delay to allow the tap event to be blocked
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const getStyles = (rel: number) => {
    const vMargin = isPersonaggi ? '3rem' : '2rem';
    const totalVMargin = isPersonaggi ? '6rem' : '4rem';
    const smallVMargin = isPersonaggi ? '9rem' : '8rem';
    const smallTotalVMargin = isPersonaggi ? '18rem' : '16rem';

    if (rel === 0) {
      return {
        width: '65vw',
        height: `calc(100vh - ${totalVMargin})`,
        left: '0vw',
        top: vMargin,
        zIndex: 40,
        opacity: 1,
        borderTopRightRadius: '3rem',
        borderBottomLeftRadius: isLast ? '3rem' : '0rem',
        borderBottomRightRadius: '0rem',
        borderTopLeftRadius: '0rem',
      };
    } else if (rel > 0) {
      const offset = 2; // 2rem gap from the main image
      const margin = (rel - 1) * 2; // 2rem gap between small images
      return {
        width: '26vw',
        height: `calc(100vh - ${smallTotalVMargin})`,
        left: `calc(65vw + ${offset}rem + ${(rel - 1) * 26}vw + ${margin}rem)`,
        top: smallVMargin,
        zIndex: 30 - Math.min(rel, 10),
        opacity: rel > 3 ? 0 : 1,
        borderTopRightRadius: '0rem',
        borderBottomLeftRadius: '0rem',
        borderBottomRightRadius: '0rem',
      };
    } else {
      return {
        width: '65vw',
        height: `calc(100vh - ${totalVMargin})`,
        left: '-100vw',
        top: vMargin,
        zIndex: 10,
        opacity: 0,
        borderTopRightRadius: '3rem',
        borderBottomLeftRadius: '0rem',
        borderBottomRightRadius: '0rem',
      };
    }
  };

  const safeActiveIndex = projects && projects.length > 0 ? ((activeIndex % projects.length) + projects.length) % projects.length : 0;
  const currentProject = projects && projects.length > 0 ? projects[safeActiveIndex] : null;

  if (!projects || projects.length === 0) return null;

  return (
    <motion.section 
      ref={ref} 
      className={`${sticky ? 'sticky top-0' : 'relative'} h-screen w-full bg-transparent`}
      style={{ 
        zIndex: index,
        pointerEvents: pointerEvents
      }}
    >
      <motion.div style={{ 
        paddingTop: padding, 
        paddingLeft: padding, 
        paddingRight: padding, 
        paddingBottom: bottomPadding,
        width: '100%', 
        height: '100%', 
        backgroundColor: 'transparent',
        position: 'relative'
      }}>
        {/* Aggressive background layer that plunges slightly into the footer area to cover gaps */}
        {/* Height is calculated to make the 4rem (64px) rounding start ~20px (0.5cm) below the image */}
        {isLast && (
          <div 
            className="absolute top-0 left-0 w-full h-[calc(100%+52px)] bg-[#F7F7F5]" 
            style={{ 
              zIndex: -1,
              clipPath: 'inset(0 0 0 0 round 0 0 3rem 3rem)'
            }} 
          />
        )}
        {!isLast && (
          <div className="absolute inset-0 bg-[#F7F7F5] -z-10" />
        )}
        <div className={`relative w-full h-full ${isLast ? '' : 'overflow-hidden'}`} style={{ borderBottomLeftRadius: isLast ? '3rem' : '0' }}>
          <motion.div style={{ opacity: entranceOpacity }} className="w-full h-full">

      {/* Header aligned with the small image */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className={`absolute ${isPersonaggi ? 'top-6 md:top-12' : 'top-3 md:top-6'} left-[calc(65vw+2rem)] w-[26vw] flex flex-col items-center pointer-events-none z-50 gap-1`}
      >
        <h3 className="text-xl md:text-3xl font-sans uppercase tracking-tight text-redd-dark font-medium mb-0">{title}</h3>
        {projects && projects.length > 0 && galleryId && (
          <Link 
            to={`/gallery/${galleryId}`}
            onClick={() => {
              sessionStorage.setItem('homeScrollPos', window.scrollY.toString());
            }}
            className="pointer-events-auto shadow-xl px-8 py-3.5 text-[10px] md:text-xs uppercase tracking-widest hover:bg-redd-dark hover:text-white transition-all flex items-center justify-center gap-2 bg-white whitespace-nowrap rounded-none font-bold text-redd-dark"
          >
            APRI GALLERIA <ArrowRight size={12} />
          </Link>
        )}
      </motion.div>

      {/* Images Layer */}
      <div className="absolute inset-x-0 top-0 bottom-4 md:bottom-6 z-20">
            {(() => {
              const items = [];
              for (let rel = -1; rel <= 4; rel++) {
                // If there's only one project, only render it at the center position (rel = 0)
                if (projects.length === 1 && rel !== 0) continue;
                
                const index = activeIndex + rel;
                const projectIndex = ((index % projects.length) + projects.length) % projects.length;
                const proj = projects[projectIndex];
                if (proj) {
                  const styles = getStyles(rel);
                  items.push(
                    <motion.div
                      key={index}
                      initial={false}
                      animate={styles}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute overflow-hidden cursor-grab active:cursor-grabbing group select-none pointer-events-auto z-20"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.1}
                      onDragStart={() => {
                        isDraggingRef.current = true;
                      }}
                      onDragEnd={handleDragEnd}
                      onTap={() => {
                        if (!isDraggingRef.current && rel === 0 && onOpenLightbox) {
                          onOpenLightbox(proj, projects);
                        }
                      }}
                    >
                      <div className="w-full h-full pointer-events-none bg-gray-200 relative overflow-hidden">
                        {proj.cover_media_type === 'youtube' ? (
                          <iframe 
                            src={`${getYouTubeEmbedUrl(proj.cover_video_url)}?autoplay=1&mute=1&loop=1&playlist=${proj.cover_video_url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                            className={`absolute top-0 left-1/2 -translate-x-1/2 ${proj.fit_large === 'width' ? 'w-full h-auto aspect-video' : 'h-full aspect-video'}`}
                            allow="autoplay; encrypted-media"
                          ></iframe>
                        ) : proj.cover_media_type === 'video' ? (
                          <video 
                            src={proj.cover_video_url} 
                            autoPlay 
                            muted 
                            loop 
                            playsInline
                            className={`absolute top-0 left-1/2 -translate-x-1/2 ${proj.fit_large === 'width' ? 'w-full h-auto object-contain' : 'h-full object-cover'}`}
                          ></video>
                        ) : (
                          <ParallaxImage 
                            src={proj.cover_image_url || proj.image || null} 
                            alt={proj.seo_alt_text || proj.title} 
                            className="w-full h-full"
                            fit={proj.fit_large === 'width' ? 'contain' : 'cover'}
                          />
                        )}
                      </div>

                      {(proj.cover_media_type === 'video' || proj.cover_media_type === 'youtube') && rel !== 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors pointer-events-none">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                            <Play size={32} fill="currentColor" />
                          </div>
                        </div>
                      )}
                      
                      <motion.div 
                        animate={{ opacity: rel === 0 ? 1 : 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-black/20 pointer-events-none" 
                      />
                      
                      <motion.div 
                        animate={{ opacity: rel > 0 ? 1 : 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-redd-light via-redd-light/60 to-transparent pointer-events-none" 
                      />

                      {/* Hover dark gradient for readability - only for active image */}
                      {rel === 0 && (
                        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      )}
                    </motion.div>
                  );
                }
              }
              return items;
            })()}
      </div>

      {/* Stable Text Overlay - Moved outside the loop to prevent jump during wrap */}
      <div className="absolute left-0 top-8 bottom-4 md:bottom-6 w-[65vw] pointer-events-none z-40">
        <AnimatePresence initial={false}>
          <motion.div 
            key={safeActiveIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 p-8 md:p-16 flex flex-col justify-between text-white"
          >
            <div className="text-xl font-bold tracking-widest uppercase opacity-0">REDD</div>
            
            <div className="my-auto">
              <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-serif leading-tight drop-shadow-lg max-w-4xl">
                {currentProject?.title}
              </h2>
              <p className="mt-4 text-lg md:text-xl max-w-2xl line-clamp-2 drop-shadow-md text-gray-200">
                {currentProject?.description_top || currentProject?.description}
              </p>
            </div>

            <div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenLightbox) onOpenLightbox(currentProject);
                }} 
                className="inline-flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-70 transition-opacity pointer-events-auto cursor-pointer"
              >
                Visit project <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  </div>
</motion.div>

  {/* UI Overlay (Buttons, Hint, Counter) */}
  <motion.div style={{ opacity: entranceOpacity }} className="absolute inset-x-0 bottom-0 h-[12rem] pointer-events-none z-[500] flex items-end pb-12">
    <div className="w-[calc(65vw+2rem)] pointer-events-none" />
    <div className="flex-1 flex flex-col justify-center items-center pr-8 md:pr-12 pointer-events-none gap-4">
      {/* Navigation Controls */}
      {projects.length > 1 && (
        <div className="flex items-center gap-6 pointer-events-auto relative z-[510]">
          <button 
            className="w-14 h-14 rounded-full bg-white text-redd-dark flex items-center justify-center shadow-xl hover:bg-redd-dark hover:text-white transition-all active:scale-90 cursor-pointer pointer-events-auto" 
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            title="Previous"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col items-center gap-0 pointer-events-none">
            <span className="text-[10px] uppercase tracking-widest font-bold text-redd-dark/40">Navigation</span>
            <div className="text-xl md:text-2xl font-sans tracking-tight text-redd-dark font-medium">
              {safeActiveIndex + 1} <span className="text-redd-dark/30 mx-1">/</span> {projects.length}
            </div>
          </div>

          <button 
            className="w-14 h-14 rounded-full bg-white text-redd-dark flex items-center justify-center shadow-xl hover:bg-redd-dark hover:text-white transition-all active:scale-90 cursor-pointer pointer-events-auto" 
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            title="Next"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  </motion.div>
    {showOverlay && !isLast && <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-black z-[600] pointer-events-none" />}
  </motion.section>
  );
};

const Team = () => {
  return (
    <section className="py-24 md:py-40 px-6 md:px-16 lg:px-24 bg-redd-dark text-redd-light">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="relative aspect-square md:aspect-[3/4] w-full overflow-hidden bg-redd-dark/50"
        >
          {/* Team image removed as per user request for empty backgrounds */}
        </motion.div>
        <div className="flex flex-col gap-8 md:pl-12">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif"
          >
            Multidisciplinaire <span className="italic text-redd-accent">team</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 leading-relaxed"
          >
            Onze ontwerpen komen tot stand door de nauwe samenwerking van landschapsarchitecten, ontwerpers en technische specialisten. Samen vertalen we uw wensen naar een kloppend en leefbaar ontwerp.
          </motion.p>
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="self-start mt-4 flex items-center gap-2 text-sm uppercase tracking-widest border-b border-redd-light pb-1 hover:text-redd-accent hover:border-redd-accent transition-colors"
          >
            Leer ons kennen <ArrowRight size={16} />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

const LetsTalk = ({ data, settings, index = 0, sticky = true }: { data: any, settings: any, index?: number, sticky?: boolean }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: activeProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"]
  });

  const pointerEvents = useTransform(activeProgress, [0, 0.9, 1], ["none", "none", "auto"]);

  const { scrollYProgress: entranceProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"]
  });

  const padding = useTransform(entranceProgress, [0.4, 1], ["24px", "0px"]);

  // New appearance transition for background
  const bgScale = useTransform(entranceProgress, [0, 1], [1.2, 1]);
  const bgOpacity = useTransform(entranceProgress, [0, 0.5], [0, 1]);
  const contentY = useTransform(entranceProgress, [0, 1], [100, 0]);

  // Parallax effects for the text - synchronized to prevent overlap
  // Adjusted to be higher as requested
  const titleY = useTransform(scrollYProgress, [0, 1], [200, -50]);
  const contentEntranceY = useTransform(entranceProgress, [0, 1], [100, 0]);

  const titleSize = settings?.section3_title_size || 'text-6xl md:text-8xl lg:text-[10rem]';
  const subtitleSize = settings?.section3_subtitle_size || 'text-sm';
  const descSize = settings?.section3_desc_size || 'text-lg md:text-xl';

  return (
    <>
      <div className="relative w-full h-0 z-0">
        <div ref={ref} className="absolute top-0 left-0 w-full h-screen pointer-events-none invisible" />
      </div>
      <motion.section 
        initial={{ opacity: 1 }}
        className={`relative z-0 h-screen bg-redd-dark flex flex-col justify-end pb-4 ${sticky ? 'sticky top-0' : 'relative'} overflow-hidden ${data?.title_align === 'left' ? 'items-start text-left' : 'items-center text-center'}`}
        style={{ borderTopLeftRadius: '0', borderTopRightRadius: '0', zIndex: index, pointerEvents }}
      >
        <motion.div style={{ 
          paddingTop: padding, 
          paddingLeft: padding, 
          paddingRight: padding, 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          zIndex: 0, 
          borderTopLeftRadius: '0', 
          borderTopRightRadius: '0', 
          overflow: 'hidden',
          opacity: sticky ? 1 : bgOpacity,
          scale: sticky ? 1 : bgScale
        }}>
          <div className="relative w-full h-full bg-redd-dark overflow-hidden" style={{ borderTopLeftRadius: '0', borderTopRightRadius: '0' }}>
            {data?.media_type === 'youtube' ? (
              <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
                <iframe 
                  src={`${getYouTubeEmbedUrl(data.video_url)}?autoplay=1&mute=1&loop=1&playlist=${data.video_url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${data?.fit === 'width' ? 'min-w-[101vw] h-auto' : data?.fit === 'height' ? 'w-auto h-full' : 'h-full scale-[1.1]'} opacity-80`}
                  style={data?.fit === 'width' || data?.fit === 'height' ? { aspectRatio: '16/9' } : { minWidth: '177.77vh' }}
                  allow="autoplay; encrypted-media"
                ></iframe>
              </div>
            ) : data?.media_type === 'video' ? (
              <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
                <video 
                  src={data.video_url} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${data?.fit === 'width' ? 'min-w-[101vw] h-auto' : data?.fit === 'height' ? 'w-auto h-full' : 'object-cover'} opacity-80`}
                  style={data?.fit === 'width' || data?.fit === 'height' ? {} : { minWidth: '177.77vh' }}
                ></video>
              </div>
            ) : data?.image_url ? (
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img 
                  src={data.image_url} 
                  alt="Let's talk background" 
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${data?.fit === 'width' ? 'min-w-[101vw] h-auto' : data?.fit === 'height' ? 'w-auto h-full' : 'w-full h-full object-cover'} opacity-100`}
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : null}
          </div>
        </motion.div>
        
        <motion.div 
          style={{ y: sticky ? titleY : contentEntranceY, opacity: sticky ? 1 : bgOpacity }} 
          className="relative z-10 w-full flex flex-col items-center gap-12 pb-20"
        >
          <p className={`${subtitleSize} uppercase tracking-widest text-white/50 mb-2 font-bold`}>
            {data?.subtitle || ""}
          </p>
        
          <h2 className={`${titleSize} font-serif leading-none text-white max-w-6xl`}>
            {data?.title ? (
              <span dangerouslySetInnerHTML={{ __html: data.title.replace(/\n/g, '<br/>') }} />
            ) : (
              <span className="opacity-0">.</span>
            )}
          </h2>

          {data?.description && (
            <p className={`mt-4 ${descSize} text-gray-300 max-w-2xl`}>
              {data.description}
            </p>
          )}
          
          {data?.link_text && data?.link_url && (
            <a 
              href={data.link_url}
              className="mt-6 inline-flex items-center gap-4 text-sm md:text-base uppercase tracking-widest border border-white px-10 py-5 hover:bg-white hover:text-black transition-all font-bold text-white"
            >
              {data.link_text} <ArrowRight size={20} />
            </a>
          )}
        </motion.div>

      </motion.section>
    </>
  );
};

const Footer = ({ settings }: { settings: any }) => {
  const { scrollYProgress } = useScroll();
  
  // Create a more organic and fluid elastic bounce effect at the end of scroll
  // Increased initial offset and adjusted spring for more bounce
  const footerY = useTransform(scrollYProgress, [0.8, 1], [500, 0]);
  const springY = useSpring(footerY, { 
    stiffness: 180, 
    damping: 10, 
    mass: 1.2,
    restDelta: 0.001
  });

  // Parallax for footer content to make it feel more fluid during scroll
  const contentParallaxY = useTransform(scrollYProgress, [0.85, 1], [150, 0]);
  const contentSpringY = useSpring(contentParallaxY, { stiffness: 80, damping: 20 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.footer 
      style={{ y: springY }}
      className="w-full bg-[#000000] text-[#8e9299] pt-32 md:pt-48 pb-12 px-6 md:px-16 lg:px-24 flex flex-col justify-center relative z-50"
    >
      <motion.div 
        style={{ y: contentSpringY }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-col md:flex-row justify-between items-start w-full max-w-7xl mx-auto mb-16 gap-12 md:gap-0"
      >
        
        {/* Left Column - Navigation */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 text-left flex-1">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-4">Navigation</h4>
          <Link to="/" className="text-sm tracking-[0.2em] uppercase hover:text-white transition-colors">Home</Link>
          <Link to="/about" className="text-sm tracking-[0.2em] uppercase hover:text-white transition-colors">About</Link>
          <Link to="/contact" className="text-sm tracking-[0.2em] uppercase hover:text-white transition-colors">Contact</Link>
        </motion.div>

        {/* Center Column - Brand */}
        <motion.div variants={itemVariants} className="flex flex-col flex-1 w-full">
          <div className={`w-full ${settings?.footer_title_align || 'text-center'}`}>
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <h2 className={`${settings?.footer_title_size || 'text-5xl'} font-bold tracking-tight text-white mb-2 uppercase leading-none`}>
                {settings?.footer_title || settings?.header_title || "SPIEGATO IN BREVE"}
              </h2>
            </Link>
            <p className={`${settings?.footer_subtitle_size || 'text-xs'} tracking-[0.3em] uppercase mb-8 text-[#8e9299]`}>
              {settings?.footer_subtitle || settings?.header_subtitle || "CINEMA & POP CULTURE"}
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 mb-12">
            {settings?.social_instagram && (
              <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                <Instagram size={16} />
              </a>
            )}
            {settings?.social_youtube && (
              <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                <Youtube size={16} />
              </a>
            )}
            {settings?.social_linkedin && (
              <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                <Linkedin size={16} />
              </a>
            )}
            {settings?.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                <Mail size={16} />
              </a>
            )}
          </div>

          <div className="flex justify-center">
            <Link to="/admin" className="hover:text-white transition-colors flex items-center justify-center gap-2 text-[10px] tracking-[0.2em] uppercase opacity-50 hover:opacity-100">
              <Lock size={12} /> Admin Panel
            </Link>
          </div>
        </motion.div>

        {/* Right Column - Work Categories */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 text-right flex-1 w-full">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-4">Work</h4>
          <Link to="/work?category=FILM" className="text-sm tracking-[0.2em] uppercase hover:text-white transition-colors">Film</Link>
          <Link to="/work?category=PERSONAGGI" className="text-sm tracking-[0.2em] uppercase hover:text-white transition-colors">Personaggi</Link>
          <Link to="/work?category=YOUTUBE" className="text-sm tracking-[0.2em] uppercase hover:text-white transition-colors">YouTube</Link>
        </motion.div>

      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="w-full max-w-7xl mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div className="text-[10px] tracking-[0.2em] uppercase opacity-40">
          {settings?.footer_copyright || `© ${new Date().getFullYear()} LORENZO PACI - ALL RIGHTS RESERVED`}
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <a href={`mailto:${settings.contact_email}`} className="text-[10px] tracking-[0.2em] uppercase opacity-40 hover:opacity-100 transition-opacity">{settings.contact_email}</a>
          <a href={`tel:${settings.contact_phone?.replace(/\s+/g, '')}`} className="text-[10px] tracking-[0.2em] uppercase opacity-40 hover:opacity-100 transition-opacity">{settings.contact_phone}</a>
          <span className="text-[10px] tracking-[0.2em] uppercase opacity-40 hover:opacity-100 cursor-pointer transition-opacity">Privacy Policy</span>
          <span className="text-[10px] tracking-[0.2em] uppercase opacity-40 hover:opacity-100 cursor-pointer transition-opacity">Cookie Policy</span>
        </div>
      </motion.div>
    </motion.footer>
  );
};

const MenuOverlay = ({ isOpen, onClose, galleryNames, works, onOpenLightbox, settings, groupedWorks }: { isOpen: boolean; onClose: () => void; galleryNames: Record<string, string>; works: any[]; onOpenLightbox: (project: any, projects?: any[]) => void; settings: any; groupedWorks: Record<string, any[]> }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [expandedSubItem, setExpandedSubItem] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setExpandedItem(null);
        setExpandedSubItem(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const menuItems = [
    { name: "Home", icon: <ArrowUpRight size={24} />, type: "link", path: "/" },
    { 
      name: "Works", 
      icon: <Plus size={24} />, 
      type: "expandable",
      subItems: (() => {
        const galleryOrder = ['galleria 3', 'galleria 2', 'galleria 1'];
        const otherGalleries = Object.keys(groupedWorks).filter(g => !galleryOrder.includes(g)).sort();
        const allGalleries = [...galleryOrder, ...otherGalleries];
        
        return allGalleries.map(g => ({
          name: galleryNames[g] || g,
          id: g.replace(/\s+/g, '-'),
          projects: groupedWorks[g] || []
        }));
      })()
    },
    { name: "About", icon: <ArrowUpRight size={24} />, type: "link", path: "/about" },
    { name: "Contact", icon: <ArrowUpRight size={24} />, type: "link", path: "/contact" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex bg-redd-light text-redd-dark"
        >
          {/* Left Side: Navigation & Info */}
          <div className="w-full md:w-1/2 h-full flex flex-col justify-between p-6 md:p-12 lg:p-24 overflow-y-auto overflow-x-hidden">
            <div className="flex justify-between items-center shrink-0">
              <Link to="/" onClick={onClose} className="text-xl font-medium tracking-tight uppercase hover:opacity-80 transition-opacity">SPIEGATO IN BREVE</Link>
              <button onClick={onClose} className="md:hidden flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-70 transition-opacity bg-white px-4 py-2 rounded-full shadow-sm">
                <X size={16} /> CHIUDI
              </button>
            </div>

            <nav className="flex flex-col gap-4 md:gap-6 my-8">
              {menuItems.map((item, i) => (
                <div key={item.name} className="flex flex-col">
                  {item.type === "expandable" ? (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                      onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                      className="text-3xl md:text-4xl lg:text-5xl font-serif flex items-center justify-between group hover:text-redd-accent transition-colors text-left w-full"
                    >
                      <span>{item.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.div animate={{ rotate: expandedItem === item.name ? 45 : 0 }}>
                          <Plus size={24} />
                        </motion.div>
                      </span>
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    >
                      <Link
                        to={item.path || "/"}
                        onClick={onClose}
                        className="text-3xl md:text-4xl lg:text-5xl font-serif flex items-center justify-between group hover:text-redd-accent transition-colors w-full"
                      >
                        <span>{item.name}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight size={24} />
                        </span>
                      </Link>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {item.type === "expandable" && expandedItem === item.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden flex flex-col gap-3 mt-4"
                      >
                        {item.subItems?.map((subItem) => (
                          <div key={subItem.name} className="flex flex-col ml-8 md:ml-12">
                            <div className="flex items-center gap-6 w-full group">
                              <button
                                onClick={() => setExpandedSubItem(expandedSubItem === subItem.name ? null : subItem.name)}
                                className="text-xl md:text-3xl lg:text-4xl font-serif flex items-center hover:text-redd-accent transition-colors text-left whitespace-nowrap"
                              >
                                <span>{subItem.name}</span>
                              </button>
                              
                              <div className="flex items-center gap-4">
                                <AnimatePresence>
                                  {expandedSubItem === subItem.name && (
                                    <motion.div 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                    >
                                      <Link 
                                        to={`/gallery/${subItem.id}`}
                                        onClick={onClose}
                                        className="hidden md:flex items-center justify-center gap-2 text-[10px] md:text-xs uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors bg-white whitespace-nowrap"
                                      >
                                        APRI GALLERIA <ArrowRight size={12} />
                                      </Link>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                                {expandedSubItem !== subItem.name && (
                                  <button 
                                    onClick={() => setExpandedSubItem(expandedSubItem === subItem.name ? null : subItem.name)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                  >
                                    <Plus size={20} />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {expandedSubItem === subItem.name && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden flex flex-col gap-2 mt-3"
                                >
                                  {subItem.projects.map((project: any) => (
                                    <button
                                      key={project.id}
                                      onClick={() => {
                                        onClose();
                                        onOpenLightbox(project, subItem.projects);
                                      }}
                                      className="text-base md:text-lg lg:text-xl font-serif ml-8 md:ml-12 hover:text-redd-accent transition-colors flex items-center justify-between group py-1 text-left"
                                    >
                                      <span>{project.title}</span>
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <ArrowUpRight size={16} />
                                      </span>
                                    </button>
                                  ))}
                                  
                                  {/* Mobile link to full gallery */}
                                  <Link 
                                    to={`/gallery/${subItem.id}`}
                                    onClick={onClose}
                                    className="md:hidden flex items-center gap-2 text-xs uppercase tracking-widest font-bold mt-4 ml-8 text-redd-accent"
                                  >
                                    APRI GALLERIA <ArrowRight size={14} />
                                  </Link>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm shrink-0 mt-8"
            >
              <div>
                {settings.contact_email && (
                  <a href={`mailto:${settings.contact_email}`} className="block font-semibold text-lg mb-2 hover:text-redd-accent transition-colors">
                    {settings.contact_email}
                  </a>
                )}
                {settings.contact_phone && (
                  <a href={`tel:${settings.contact_phone.replace(/\s+/g, '')}`} className="block font-semibold text-lg hover:text-redd-accent transition-colors">
                    {settings.contact_phone}
                  </a>
                )}
              </div>
              <div className="flex gap-12">
                {settings.contact_address && (
                  <div>
                    <p className="text-gray-500 mb-1">Indirizzo</p>
                    <p className="whitespace-pre-line">{settings.contact_address}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="hidden md:block w-1/2 h-full relative bg-[#000000] overflow-hidden">
            {settings.menu_image ? (
              <motion.img 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                src={settings.menu_image} 
                alt={settings.seo_title || "Menu background"} 
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-black/20" />
            )}
            <div className="absolute top-12 right-12">
              <button onClick={onClose} className="flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-70 transition-opacity bg-white px-6 py-3 shadow-lg hover:bg-gray-100">
                <X size={16} /> CHIUDI
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [lightboxProjects, setLightboxProjects] = useState<any[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [galleryNames, setGalleryNames] = useState<Record<string, string>>({});
  const [sectionsData, setSectionsData] = useState<Record<string, any>>({});
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn("Data fetching timed out. Forcing loading to false.");
        setIsLoading(false);
      }
    }, 8000);

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching data from Supabase...");
        
        const { data: worksData, error: worksError } = await supabase
          .from('works')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (worksError) {
          console.error("Works error:", worksError);
          // Fallback to created_at if display_order doesn't exist
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('works')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fallbackError) {
            setError(`Errore caricamento lavori: ${fallbackError.message}`);
            throw fallbackError;
          }
          if (fallbackData && isMounted) setWorks(fallbackData);
        } else if (worksData && isMounted) {
          setWorks(worksData);
        }

        const { data: settingsData, error: settingsError } = await supabase.from('settings').select('*');
        if (settingsError) {
          console.error("Settings error:", settingsError);
          // If the table is missing from schema cache (common Supabase issue), just log it and continue with defaults
          if (settingsError.code === '42P01' || settingsError.message.includes('settings') || settingsError.message.includes('schema cache')) {
            console.warn('settings table not found or schema cache stale. Using defaults.');
          } else {
            setError(`Errore impostazioni: ${settingsError.message}`);
          }
        } else if (settingsData && isMounted) {
          const names: Record<string, string> = {};
          const sections: Record<string, any> = {
            section1: {},
            section2: {},
            section3: {}
          };
          const allSettings: Record<string, any> = {};
          
          settingsData.forEach(setting => {
            allSettings[setting.key] = setting.value;
            if (setting.key.endsWith('_name')) {
              const galleryKey = setting.key.replace('_name', '').replace(/_/g, ' ');
              names[galleryKey] = setting.value;
            } else if (setting.key.startsWith('section1_')) {
              sections.section1[setting.key.replace('section1_', '')] = setting.value;
            } else if (setting.key.startsWith('section2_')) {
              sections.section2[setting.key.replace('section2_', '')] = setting.value;
            } else if (setting.key.startsWith('section3_')) {
              sections.section3[setting.key.replace('section3_', '')] = setting.value;
            }
          });
          setGalleryNames(names);
          setSectionsData(sections);
          setSettings(allSettings);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        if (isMounted) {
          setError(`Errore di connessione: ${err.message || "Impossibile connettersi a Supabase"}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log("Loading finished");
        }
      }
    }
    fetchData();
    return () => { 
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  useEffect(() => {
    // Restore scroll position if returning from a gallery
    if (!isLoading) {
      const savedScrollPos = sessionStorage.getItem('homeScrollPos');
      if (savedScrollPos) {
        // Delay to ensure content is rendered and user sees the top briefly
        const timer = setTimeout(() => {
          const target = parseInt(savedScrollPos);
          const start = window.scrollY;
          const distance = target - start;
          const duration = 1500; // Slower duration (1.5 seconds)
          let startTime: number | null = null;

          function animation(currentTime: number) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, start, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
          }

          function ease(t: number, b: number, c: number, d: number) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
          }

          requestAnimationFrame(animation);
          sessionStorage.removeItem('homeScrollPos');
        }, 800); // Increased delay (800ms)
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    // Apply SEO settings
    if (settings) {
      if (settings.seo_title) {
        document.title = settings.seo_title;
      } else if (settings.header_title) {
        document.title = `${settings.header_title} | Portfolio`;
      }

      const updateMeta = (name: string, content: string, isProperty = false) => {
        if (!content) return;
        let meta = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          if (isProperty) meta.setAttribute('property', name);
          else meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateMeta('description', settings.seo_description || '');
      updateMeta('keywords', settings.seo_keywords || '');
      updateMeta('og:title', settings.seo_title || document.title, true);
      updateMeta('og:description', settings.seo_description || '', true);
      updateMeta('og:image', settings.seo_og_image || '', true);
      updateMeta('og:url', window.location.href, true);
      updateMeta('twitter:card', 'summary_large_image');

      if (settings.seo_favicon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settings.seo_favicon;
      }
    }
  }, [settings]);

  const handleOpenLightbox = (project: any, projects: any[] = []) => {
    setSelectedProject(project);
    setLightboxProjects(projects);
    setIsLightboxOpen(true);
  };

  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  const hasNoData = works.length === 0;

  // Group works by group_name dynamically
  const groupedWorks = works.reduce((acc, work) => {
    const group = work.group_name || 'galleria 1';
    if (!acc[group]) acc[group] = [];
    acc[group].push(work);
    return acc;
  }, {} as Record<string, Work[]>);

  // Define the order of galleries. We prioritize the standard ones, then any others.
  const galleryOrder = ['galleria 3', 'galleria 2', 'galleria 1'];
  const otherGalleries = Object.keys(groupedWorks).filter(g => !galleryOrder.includes(g)).sort();
  const allGalleries = [...galleryOrder, ...otherGalleries];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen text-redd-dark selection:bg-redd-accent selection:text-white bg-[#000000]"
    >
      <Lightbox isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} project={selectedProject} allProjects={lightboxProjects} />
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} galleryNames={galleryNames} works={works} onOpenLightbox={handleOpenLightbox} settings={settings} groupedWorks={groupedWorks} />
      <Navbar onMenuClick={() => setIsMenuOpen(true)} settings={settings} />
      
      <main className="relative z-10 bg-transparent min-h-screen">
        {isLoading ? (
          <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 border-4 border-redd-accent border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-bold uppercase tracking-widest animate-pulse">Caricamento contenuti...</h2>
          </div>
        ) : error ? (
          <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
              <X size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest">Errore di Connessione</h2>
            <p className="max-w-md text-gray-500 mb-8 bg-red-50 p-4 rounded-lg font-mono text-sm">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors"
            >
              Riprova Caricamento
            </button>
          </div>
        ) : !isSupabaseConfigured ? (
          <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
            <Lock size={48} className="mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest">Database non configurato</h2>
            <p className="max-w-md text-gray-500 mb-8">
              Inserisci <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> nel pannello <strong>Settings &gt; Secrets</strong> per collegare il tuo database.
            </p>
            <Link to="/admin" className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors">
              Vai al Pannello Admin
            </Link>
          </div>
        ) : hasNoData ? (
          <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
            <Plus size={48} className="mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest">Nessun contenuto trovato</h2>
            <p className="max-w-md text-gray-500 mb-8">
              Il database è collegato, ma non ci sono ancora lavori caricati. Accedi all'area admin per aggiungere le tue prime immagini.
            </p>
            <Link to="/admin" className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors">
              Aggiungi il primo lavoro
            </Link>
          </div>
        ) : (
          <>
            <Hero data={sectionsData.section1} settings={settings} />
            
            {/* 
              As requested, we use the working "First" gallery data (Galleria 3) for all galleries.
            */}
            {(() => {
              const workingWorks = groupedWorks['galleria 3'] || works;
              const galleryKeys = ['galleria 3', 'galleria 2', 'galleria 1'];
              const galleryTitles = [
                galleryNames['galleria 3'] || 'YouTube',
                galleryNames['galleria 2'] || 'Personaggi',
                galleryNames['galleria 1'] || 'Film'
              ];

              return [0, 1, 2].map((i) => {
                const isLast = i === 2;
                const galleryZIndex = 100 + i * 50;
                const title = galleryTitles[i];
                const galleryId = galleryKeys[i].replace(/\s+/g, '-');
                const galleryWorks = groupedWorks[galleryKeys[i]] || [];

                return (
                  <React.Fragment key={i}>
                    <HorizontalGallery 
                      title={title} 
                      galleryId={galleryId} 
                      projects={galleryWorks} 
                      isLast={isLast}
                      index={galleryZIndex}
                      sticky={i !== 1}
                      showOverlay={i !== 1}
                      onMenuClick={() => setIsMenuOpen(true)} 
                      onOpenLightbox={handleOpenLightbox} 
                    />
                    {i === 0 && (
                      <Process data={sectionsData.section2} settings={settings} index={galleryZIndex + 20} sticky={false} />
                    )}
                    {i === 1 && (
                      <div className="relative w-full" style={{ marginTop: '-100vh', zIndex: galleryZIndex - 10 }}>
                        <LetsTalk data={sectionsData.section3} settings={settings} index={galleryZIndex - 10} sticky={true} />
                        <div className="h-screen pointer-events-none" />
                      </div>
                    )}
                  </React.Fragment>
                );
              });
            })()}
            <div className="h-[20vh] bg-transparent" />
          </>
        )}
      </main>
      <div className="relative z-0">
        <div className="fixed bottom-0 left-0 w-full -z-10 bg-[#000000]">
          <Footer settings={settings} />
        </div>
        <div className="invisible pointer-events-none">
          <Footer settings={settings} />
        </div>
      </div>
    </motion.div>
  );
}
