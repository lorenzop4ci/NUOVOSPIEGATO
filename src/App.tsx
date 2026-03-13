import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { Menu, ArrowRight, X, ArrowUpRight, Plus, Instagram, Youtube, Facebook, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase, Work } from './lib/supabase';

const ParallaxImage = ({ src, alt, className }: { src: string, alt?: string, className?: string }) => {
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
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              draggable="false"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 pt-6 pb-12 transition-all duration-500 ${scrolled ? 'bg-gradient-to-b from-redd-light/100 via-redd-light/80 to-transparent text-redd-dark' : 'text-white'}`}>
      <Link 
        to="/" 
        onClick={(e) => {
          if (window.location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="flex flex-col hover:opacity-80 transition-opacity"
      >
        <div className="text-xl font-bold tracking-tight uppercase">LORENZO PACI</div>
        <div className="text-[10px] tracking-[0.2em] uppercase opacity-70">CREATIVE VISIONARY</div>
      </Link>
      <div className="flex items-center gap-6">
        <button onClick={onMenuClick} className="flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-70 transition-opacity">
          Menu <Menu size={18} />
        </button>
      </div>
    </nav>
  );
};

const Hero = ({ data }: { data: any }) => {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 1500], [1, 1.3]);
  const overlayOpacity = useTransform(scrollY, [0, 800], [0, 0.8]);
  const textY = useTransform(scrollY, [0, 800], [0, -250]);

  return (
    <section className="relative z-0 h-[100vh] w-full bg-redd-dark">
      <div className="absolute top-0 left-0 h-full w-full overflow-hidden -z-10">
        <div className="sticky top-0 h-screen w-full">
          {data?.image_url && (
            <motion.img 
              style={{ scale, transformOrigin: "bottom center" }}
              src={data.image_url} 
              alt="Hero background" 
              className="w-full h-full object-cover opacity-100"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-black pointer-events-none" />
        </div>
      </div>
      <motion.div style={{ y: textY }} className={`absolute top-0 left-0 w-full h-screen flex flex-col justify-end p-6 md:p-16 lg:p-24 pb-24 md:pb-32 pointer-events-none ${data?.title_align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
        {data?.subtitle && (
          <div className="text-sm md:text-base tracking-[0.3em] uppercase mb-6 md:mb-8 font-bold opacity-80 text-white pointer-events-auto">
            {data.subtitle}
          </div>
        )}
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-white font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] max-w-5xl pointer-events-auto"
        >
          {data?.title || ""}
        </motion.h1>
        {data?.description && (
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl pointer-events-auto">
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
      </motion.div>
    </section>
  );
};

const Process = ({ data }: { data: any }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);

  const { scrollYProgress: entranceProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"]
  });

  const padding = useTransform(entranceProgress, [0.4, 1], ["24px", "0px"]);
  const borderRadius = useTransform(entranceProgress, [0.4, 1], ["48px", "0px"]);

  const steps = [
    { title: data?.step1_title || "We ground.", desc: data?.step1_desc || "Onderzoek en analyse vormen de basis van elk succesvol project.", link: "/gallery/galleria-3" },
    { title: data?.step2_title || "We shape.", desc: data?.step2_desc || "Vormgeving van ruimte en structuur met oog voor detail.", link: "/gallery/galleria-2" },
    { title: data?.step3_title || "We plant.", desc: data?.step3_desc || "Plannen worden plekken. Materialen gaan leven.", link: "/gallery/galleria-1" },
    { title: data?.step4_title || "We grow.", desc: data?.step4_desc || "Onderhoud en ontwikkeling over tijd voor een blijvend resultaat.", link: "/about" }
  ];

  return (
    <section ref={ref} className="relative z-10 h-[80vh] md:h-screen w-full bg-redd-light">
      <motion.div style={{ paddingTop: padding, paddingLeft: padding, paddingRight: padding, width: '100%', height: '100%' }}>
        <motion.div 
          style={{ overflow: 'hidden' }}
          className="relative h-full w-full bg-redd-dark text-white flex flex-col md:flex-row"
        >
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {data?.image_url && (
            <motion.img 
              style={{ y, height: '130%', top: '-15%', width: '100%', position: 'absolute', objectFit: 'cover' }}
              src={data.image_url} 
              alt="Process background" 
              className="opacity-80"
              referrerPolicy="no-referrer"
            />
          )}
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
            <div className="text-sm md:text-base tracking-[0.3em] uppercase mb-6 md:mb-8 font-bold opacity-80 text-white pointer-events-auto">
              {data.subtitle}
            </div>
          )}
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-serif max-w-5xl leading-[1.1]">
            {data?.title || ""}
          </h2>
          {data?.description && (
            <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl pointer-events-auto">
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

        {/* 4 Columns (Desktop) */}
        <div className="relative z-20 hidden md:flex w-full h-full">
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

              <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-4 pointer-events-none">
                <h3 className="text-2xl lg:text-3xl font-bold mb-4 flex items-center gap-4">
                  {step.title}
                  <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" size={24} />
                </h3>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500">
                  <p className="overflow-hidden text-sm lg:text-base text-gray-300">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

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

const Lightbox = ({ isOpen, onClose, project }: { isOpen: boolean, onClose: () => void, project: any }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (project?.id) {
        fetchGalleryImages(project.id);
      } else if (project?.gallery) {
        setGalleryImages(project.gallery);
      } else {
        setGalleryImages([]);
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
          title: img.title || '', 
          description: img.description || '',
          link: img.link || '#'
        })));
      }
    } catch (err: any) {
      if (!err.message?.includes('work_images')) {
        console.error('Error fetching gallery images:', err.message);
      }
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setSelectedImageIndex(selectedImageIndex === 0 ? galleryImages.length - 1 : selectedImageIndex - 1);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setSelectedImageIndex(selectedImageIndex === galleryImages.length - 1 ? 0 : selectedImageIndex + 1);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && project && (
          <motion.div
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
            
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-32">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-24">
                {/* Left side: Text */}
                <div className="w-full lg:w-1/2 flex flex-col">
                  <div className="text-sm tracking-[0.2em] uppercase text-gray-400 mb-4 font-bold">PROJECTS</div>
                  <h2 className="text-5xl md:text-7xl font-sans tracking-tight mb-12 uppercase">{project.title}</h2>
                  
                  <div className="text-lg text-gray-600 space-y-6 leading-relaxed">
                    {(project.description_top || project.description)?.split('\n').map((paragraph: string, i: number) => (
                      <p key={i} className="min-h-[1rem]">{paragraph}</p>
                    ))}
                  </div>
                </div>
                
                {/* Right side: Cover Image (Sticky) */}
                <div className="w-full lg:w-1/2">
                  <div className="sticky top-24 overflow-hidden rounded-3xl shadow-2xl group">
                    {(project.cover_image_url || project.image) ? (
                      <img 
                        src={project.cover_image_url || project.image} 
                        alt={project.title} 
                        className="w-full object-cover aspect-[4/5] transition-transform duration-700 group-hover:scale-110 bg-gray-100"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full aspect-[4/5] bg-gray-100" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Gallery Section */}
              {galleryImages && galleryImages.length > 0 && (
                <div className="border-t border-gray-200 pt-16">
                  <div className="text-sm tracking-[0.2em] uppercase text-gray-400 mb-12 font-bold">PROJECT GALLERY</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {galleryImages.map((img: any, idx: number) => (
                      <div 
                        key={idx}
                        className="overflow-hidden rounded-2xl shadow-lg cursor-pointer group"
                        onClick={() => setSelectedImageIndex(idx)}
                      >
                        {img.url ? (
                          <img 
                            src={img.url}
                            alt={img.title || `${project.title} gallery ${idx + 1}`}
                            className="w-full object-cover aspect-video transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full aspect-video bg-gray-100" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
                {galleryImages[selectedImageIndex].url ? (
                  <motion.img 
                    key={selectedImageIndex} // Force re-render on index change for animation
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
                      className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-white/70 hover:text-white transition-colors border-b border-white/30 hover:border-white pb-1"
                    >
                      View Details <ArrowUpRight size={16} />
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

const HorizontalGallery = ({ title, galleryId, projects, isLast = false, onMenuClick, onOpenLightbox }: { title: string, galleryId?: string, projects: any[], isLast?: boolean, onMenuClick?: () => void, onOpenLightbox?: (project: any) => void, key?: string | number }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.8]);

  const { scrollYProgress: entranceProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"]
  });

  const padding = useTransform(entranceProgress, [0.4, 1], ["24px", "0px"]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isWrapping, setIsWrapping] = useState(false);

  const isDraggingRef = useRef(false);

  // Double the projects to allow seamless looping
  const displayProjects = projects.length > 1 ? [...projects, ...projects] : projects;

  const handleNext = () => {
    if (projects.length <= 1) return;
    
    if (activeIndex === projects.length - 1) {
      // Move to the first item of the second set
      setActiveIndex(projects.length);
      // Then silently reset to the first item of the first set
      setTimeout(() => {
        setIsWrapping(true);
        setActiveIndex(0);
        setTimeout(() => setIsWrapping(false), 50);
      }, 800); // Wait for animation to finish
    } else if (activeIndex >= projects.length) {
      // We are in the second set, just continue
      setActiveIndex(prev => (prev + 1) % displayProjects.length);
    } else {
      setActiveIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (projects.length <= 1) return;
    
    if (activeIndex === 0) {
      // Jump to the first item of the second set instantly
      setIsWrapping(true);
      setActiveIndex(projects.length);
      // Then animate to the last item of the first set
      setTimeout(() => {
        setIsWrapping(false);
        setActiveIndex(projects.length - 1);
      }, 50);
    } else {
      setActiveIndex(prev => prev - 1);
    }
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
    if (rel === 0) {
      return {
        width: '65vw',
        height: 'calc(100vh - 4rem)',
        left: '0vw',
        top: '2rem',
        zIndex: 40,
        opacity: 1,
        borderTopRightRadius: '3rem',
        borderBottomLeftRadius: isLast ? '3rem' : '0rem',
      };
    } else if (rel > 0) {
      const offset = 2 + (rel - 1) * 26;
      const margin = (rel - 1) * 2;
      return {
        width: '26vw',
        height: 'calc(100vh - 16rem)',
        left: `calc(65vw + ${offset}vw + ${margin}rem)`,
        top: '8rem',
        zIndex: 30 - Math.min(rel, 10),
        opacity: rel > 3 ? 0 : 1,
        borderTopRightRadius: '0rem',
      };
    } else {
      return {
        width: '65vw',
        height: 'calc(100vh - 4rem)',
        left: '-100vw',
        top: '2rem',
        zIndex: 10,
        opacity: 0,
        borderTopRightRadius: '3rem',
      };
    }
  };

  return (
    <>
      <div className="relative w-full h-0 z-0">
        <div ref={ref} className="absolute top-0 left-0 w-full h-screen pointer-events-none invisible" />
      </div>
      <motion.section 
        initial={{ opacity: 1 }}
        className={`h-screen w-full relative z-0 overflow-hidden bg-redd-light sticky top-0`}
      >
        <motion.div style={{ paddingTop: padding, paddingLeft: padding, paddingRight: padding, width: '100%', height: '100%' }}>
          <div className={`relative w-full h-full bg-redd-light overflow-hidden`}>
            {/* Background Layers */}
            <div className="absolute inset-x-0 top-0 bottom-4 md:bottom-6 flex pointer-events-none">
              <div className="w-[65vw] h-full bg-redd-light" />
              <div className="w-[35vw] h-full bg-redd-light" />
            </div>

      {/* Header aligned with the first small image */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="absolute top-8 md:top-12 left-[calc(65vw+2rem)] w-[26vw] flex justify-between items-center pointer-events-none z-50"
      >
        <h3 className="text-xl md:text-2xl font-sans uppercase tracking-tight text-redd-dark">{title}</h3>
        {projects && projects.length > 0 && galleryId && (
          <Link 
            to={`/gallery/${galleryId}`}
            className="pointer-events-auto border border-redd-dark px-3 py-1.5 text-[10px] md:text-xs uppercase tracking-widest hover:bg-redd-dark hover:text-white transition-colors flex items-center justify-center gap-2 bg-white whitespace-nowrap"
          >
            APRI GALLERIA <ArrowRight size={12} />
          </Link>
        )}
      </motion.div>

      {/* Images Layer */}
      <div className="absolute inset-x-0 top-0 bottom-4 md:bottom-6">
            {displayProjects.map((proj, i) => {
              const rel = i - activeIndex;
              if (rel < -1 || rel > 4) return null;
              const styles = getStyles(rel);

              return (
                <motion.div
                  key={i}
                  initial={false}
                  animate={styles}
                  transition={isWrapping ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing group select-none"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.1}
                  onDragStart={() => {
                    isDraggingRef.current = true;
                  }}
                  onDragEnd={handleDragEnd}
                  onTap={() => {
                    if (!isDraggingRef.current && rel === 0 && onOpenLightbox) {
                      onOpenLightbox(proj);
                    }
                  }}
                >
              <ParallaxImage 
                src={proj.cover_image_url || proj.image || null} 
                alt={proj.title} 
                className="w-full h-full pointer-events-none bg-gray-100"
              />
              
              <motion.div 
                animate={{ opacity: rel === 0 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-black/20 pointer-events-none" 
              />
              
              <motion.div 
                animate={{ opacity: rel > 0 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-gradient-to-b from-redd-light/80 via-transparent to-transparent pointer-events-none" 
              />

              {/* Hover dark gradient for readability */}
              <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <motion.div 
                animate={{ 
                  opacity: rel === 0 ? 1 : 0,
                  x: rel === 0 ? 0 : (rel < 0 ? -50 : 50)
                }}
                transition={{ duration: 0.6, delay: rel === 0 ? 0.2 : 0 }}
                className="absolute inset-0 p-8 md:p-16 flex flex-col justify-between text-white pointer-events-none"
              >
                <div className="text-xl font-bold tracking-widest uppercase opacity-0">REDD</div>
                
                <div className="my-auto">
                  <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-serif leading-tight drop-shadow-lg max-w-4xl">
                    {proj.title}
                  </h2>
                  <p className="mt-4 text-lg md:text-xl max-w-2xl line-clamp-2 drop-shadow-md text-gray-200">
                    {proj.description_top || proj.description}
                  </p>
                </div>

                <div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenLightbox) onOpenLightbox(proj);
                    }} 
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-70 transition-opacity pointer-events-auto cursor-pointer"
                  >
                    Visit project <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Hint Arrow */}
      {projects && projects.length > 1 && (
        <div className="absolute top-1/2 left-[calc(78vw+2rem)] -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-opacity cursor-pointer z-50" onClick={handleNext}>
          <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg text-redd-dark">
            <ArrowRight size={20} />
          </div>
          <span className="text-xs uppercase tracking-widest font-bold text-redd-dark bg-white/90 px-2 py-1 rounded">Drag or Click</span>
        </div>
      )}

      {/* UI Overlay (Buttons) */}
      <div className="absolute inset-x-0 bottom-0 h-[8rem] pointer-events-none z-50 flex items-start pt-8">
        <div className="w-[calc(65vw+2rem)]" />
        <div className="flex-1 flex justify-center items-center pr-8 md:pr-12 pointer-events-auto">
          <div className="text-xl md:text-2xl font-sans tracking-tight text-redd-dark/70">
            {projects && projects.length > 0 ? `${activeIndex + 1}/${projects.length}` : '0/0'}
          </div>
        </div>
      </div>
      {!isLast && <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-x-0 top-0 bottom-4 md:bottom-6 bg-black z-50 pointer-events-none" />}
          </div>
        </motion.div>
      </motion.section>
    </>
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

const LetsTalk = ({ data }: { data: any }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.8]);

  const { scrollYProgress: entranceProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"]
  });

  const padding = useTransform(entranceProgress, [0.4, 1], ["24px", "0px"]);

  return (
    <>
      <div className="relative w-full h-0 z-0">
        <div ref={ref} className="absolute top-0 left-0 w-full h-screen pointer-events-none invisible" />
      </div>
      <motion.section 
        initial={{ opacity: 1 }}
        className={`relative z-0 h-screen bg-redd-light px-6 md:px-16 lg:px-24 flex flex-col justify-center sticky top-0 overflow-hidden ${data?.title_align === 'left' ? 'items-start text-left' : 'items-center text-center'}`}
      >
        <motion.div style={{ paddingTop: padding, paddingLeft: padding, paddingRight: padding, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
          <div className="relative w-full h-full bg-redd-light overflow-hidden">
            {data?.image_url && (
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img 
                  src={data.image_url} 
                  alt="Let's talk background" 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </motion.div>
        
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-6 font-bold relative z-10">
          {data?.subtitle || "Klaar voor een nieuw project?"}
        </p>
        
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-8xl lg:text-[10rem] font-serif leading-none hover:text-redd-accent transition-colors cursor-pointer max-w-6xl relative z-10"
        >
          {data?.title ? (
            <span dangerouslySetInnerHTML={{ __html: data.title.replace(/\n/g, '<br/>') }} />
          ) : (
            <>Let's <span className="italic">talk</span></>
          )}
        </motion.h2>

        {data?.description && (
          <p className="mt-8 text-lg md:text-xl text-gray-600 max-w-2xl relative z-10">
            {data.description}
          </p>
        )}

        {data?.link_text && data?.link_url && (
          <a 
            href={data.link_url}
            className="mt-12 inline-flex items-center gap-4 text-sm md:text-base uppercase tracking-widest border border-black px-8 py-4 hover:bg-black hover:text-white transition-colors text-black pointer-events-auto relative z-10"
          >
            {data.link_text} <ArrowRight size={20} />
          </a>
        )}

        <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-black z-50 pointer-events-none" />
      </motion.section>
    </>
  );
};

const Footer = () => {
  return (
    <footer className="w-full bg-[#161a1d] text-[#8e9299] pt-24 md:pt-32 pb-4 px-6 md:px-16 lg:px-24 flex flex-col justify-center relative z-50">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl mx-auto mb-8 md:mb-10 gap-12 md:gap-0">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6 text-center md:text-left text-sm tracking-[0.2em] uppercase mt-12 md:mt-16 flex-1">
          <a href="#" className="hover:text-white transition-colors">Graphic</a>
          <a href="#" className="hover:text-white transition-colors">Photo</a>
          <a href="#" className="hover:text-white transition-colors">Project</a>
        </div>

        {/* Center Column */}
        <div className="flex flex-col items-center justify-center flex-1">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
            LORENZO PACI
          </h2>
          <p className="text-xs tracking-[0.3em] uppercase mb-6">
            Creative Visionary
          </p>
          
          <div className="flex items-center gap-6 mb-12">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
              <Instagram size={16} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
              <Youtube size={16} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
              <Facebook size={16} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
              <MessageCircle size={16} />
            </a>
          </div>

          <Link to="/admin" className="hover:text-white transition-colors flex items-center justify-center gap-2 text-sm tracking-[0.2em] uppercase">
            <Lock size={14} /> Admin Panel
          </Link>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 text-center md:text-right text-sm tracking-[0.2em] uppercase mt-12 md:mt-16 flex-1">
          <a href="#" className="hover:text-white transition-colors">Client Area</a>
          <a href="#" className="hover:text-white transition-colors">Bio</a>
          <a href="#" className="hover:text-white transition-colors">Privacy & Policy</a>
        </div>

      </div>

      <div className="w-full max-w-7xl mx-auto border-t border-white/10 pt-4 text-center">
        <p className="text-[10px] tracking-widest uppercase opacity-50">
          © 2025 MADE WITH LOVE IN MARCHE - LORENZ.PACI@GMAIL.COM - ANCONA|MARCHE|ITALIA - 3208130419
        </p>
      </div>
    </footer>
  );
};

const MenuOverlay = ({ isOpen, onClose, galleryNames, works, onOpenLightbox }: { isOpen: boolean; onClose: () => void; galleryNames: Record<string, string>; works: any[]; onOpenLightbox: (project: any) => void }) => {
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
      subItems: [
        { 
          name: galleryNames['galleria 3'] || "Galleria 3", 
          id: "galleria-3",
          projects: works.filter(w => w.group_name === 'galleria 3')
        },
        { 
          name: galleryNames['galleria 2'] || "Galleria 2", 
          id: "galleria-2",
          projects: works.filter(w => w.group_name === 'galleria 2')
        },
        { 
          name: galleryNames['galleria 1'] || "Galleria 1", 
          id: "galleria-1",
          projects: works.filter(w => w.group_name === 'galleria 1')
        }
      ]
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
              <Link to="/" onClick={onClose} className="text-xl font-medium tracking-tight uppercase hover:opacity-80 transition-opacity">LORENZO PACI</Link>
              <button onClick={onClose} className="md:hidden flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-70 transition-opacity bg-white px-4 py-2 rounded-full shadow-sm">
                <X size={16} /> Sluiten
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
                                        onOpenLightbox(project);
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
                <p className="font-semibold text-lg mb-2">info@lorenzopaci.com</p>
                <p className="font-semibold text-lg">+39 123 456 7890</p>
              </div>
              <div className="flex gap-12">
                <div>
                  <p className="text-gray-500 mb-1">Studio Roma</p>
                  <p>Via Roma 123</p>
                  <p>00100 Roma</p>
                  <a href="#" className="flex items-center gap-1 mt-2 font-medium hover:text-redd-accent transition-colors">
                    Routebeschrijving <ArrowUpRight size={14} />
                  </a>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Studio Milano</p>
                  <p>Via Milano 45</p>
                  <p>20100 Milano</p>
                  <a href="#" className="flex items-center gap-1 mt-2 font-medium hover:text-redd-accent transition-colors">
                    Routebeschrijving <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="hidden md:block w-1/2 h-full relative bg-[#161a1d]">
            {/* Background image removed as per user request for empty backgrounds */}
            <div className="absolute top-12 right-12">
              <button onClick={onClose} className="flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-70 transition-opacity bg-white px-6 py-3 shadow-lg hover:bg-gray-100">
                <X size={16} /> Sluiten
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
  const [works, setWorks] = useState<Work[]>([]);
  const [galleryNames, setGalleryNames] = useState<Record<string, string>>({});
  const [sectionsData, setSectionsData] = useState<Record<string, any>>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const { data: worksData, error: worksError } = await supabase
          .from('works')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (worksError) {
          // Fallback to created_at if display_order doesn't exist
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('works')
            .select('*')
            .order('created_at', { ascending: false });
          if (fallbackError) throw fallbackError;
          if (fallbackData && isMounted) setWorks(fallbackData);
        } else if (worksData && isMounted) {
          setWorks(worksData);
        }

        const { data: settingsData, error: settingsError } = await supabase.from('settings').select('*');
        if (settingsError) {
          if (settingsError.code === '42P01' || settingsError.message.includes('settings')) {
            console.warn('settings table not found. Please run the updated SQL schema.');
          } else {
            console.error('Error fetching settings:', settingsError.message);
          }
        } else if (settingsData && isMounted) {
          const names: Record<string, string> = {};
          const sections: Record<string, any> = {
            section1: {},
            section2: {},
            section3: {}
          };
          
          settingsData.forEach(setting => {
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
        }
      } catch (err: any) {
        if (!err.message?.includes('settings') && !err.message?.includes('works')) {
          console.error('Error fetching data:', err);
        }
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleOpenLightbox = (project: any) => {
    setSelectedProject(project);
    setIsLightboxOpen(true);
  };

  const galleria1 = works.filter(w => w.group_name === 'galleria 1');
  const galleria2 = works.filter(w => w.group_name === 'galleria 2');
  const galleria3 = works.filter(w => w.group_name === 'galleria 3');

  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  const hasNoData = works.length === 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen text-redd-dark selection:bg-redd-accent selection:text-white bg-[#161a1d]"
    >
      <Lightbox isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} project={selectedProject} />
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} galleryNames={galleryNames} works={works} onOpenLightbox={handleOpenLightbox} />
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      
      <main className="relative z-10 bg-redd-light shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-b-[2rem] md:rounded-b-[3rem] min-h-screen">
        {!isSupabaseConfigured ? (
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
            <Hero data={sectionsData.section1} />
            <HorizontalGallery 
              key={`galleria-3-${galleria3.length}`}
              title={galleryNames['galleria 3'] || "Galleria 3"} 
              galleryId="galleria-3" 
              projects={galleria3} 
              onMenuClick={() => setIsMenuOpen(true)} 
              onOpenLightbox={handleOpenLightbox} 
            />
            <Process data={sectionsData.section2} />
            <HorizontalGallery 
              key={`galleria-2-${galleria2.length}`}
              title={galleryNames['galleria 2'] || "Galleria 2"} 
              galleryId="galleria-2" 
              projects={galleria2} 
              onMenuClick={() => setIsMenuOpen(true)} 
              onOpenLightbox={handleOpenLightbox} 
            />
            <LetsTalk data={sectionsData.section3} />
            <HorizontalGallery 
              key={`galleria-1-${galleria1.length}`}
              title={galleryNames['galleria 1'] || "Galleria 1"} 
              galleryId="galleria-1" 
              projects={galleria1} 
              isLast={true} 
              onMenuClick={() => setIsMenuOpen(true)} 
              onOpenLightbox={handleOpenLightbox} 
            />
          </>
        )}
      </main>
      <div className="relative z-0">
        <div className="fixed bottom-0 left-0 w-full -z-10 bg-[#161a1d]">
          <Footer />
        </div>
        <div className="invisible pointer-events-none">
          <Footer />
        </div>
      </div>
    </motion.div>
  );
}
