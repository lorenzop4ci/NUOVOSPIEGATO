import React, { useRef, useState, useEffect, memo, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Link } from 'react-router-dom';
import ParallaxImage from './ParallaxImage';
import { getYouTubeEmbedUrl } from '../lib/utils';

interface HorizontalGalleryProps {
  title: string;
  galleryId?: string;
  projects: any[];
  isLast?: boolean;
  onMenuClick?: () => void;
  onOpenLightbox?: (project: any, projects?: any[]) => void;
  index?: number;
  sticky?: boolean;
  showOverlay?: boolean;
}

export const HorizontalGallery = memo(({ 
  title, 
  galleryId, 
  projects, 
  isLast = false, 
  onMenuClick, 
  onOpenLightbox, 
  index = 0, 
  sticky = true, 
  showOverlay = true 
}: HorizontalGalleryProps) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  const overlayOpacity = useTransform(scrollYProgress, [0.6, 0.9], [0, 1]);

  const { scrollYProgress: entranceProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"]
  });

  const isPersonaggi = title === 'Personaggi' || title === 'PERSONAGGI';
  const padding = useTransform(entranceProgress, [0.4, 1], [isMobile ? "0px" : "24px", "0px"]);
  const bottomPadding = useTransform(entranceProgress, [0.4, 1], [
    isLast ? "62px" : (isPersonaggi ? "24px" : "24px"),
    isLast ? "38px" : (isPersonaggi ? "0px" : "0px")
  ]);
  const entranceOpacity = useTransform(entranceProgress, [0.1, 0.5], [0, 1]);

  const [activeIndex, setActiveIndex] = useState(0);
  const isDraggingRef = useRef(false);

  const handleNext = useCallback(() => {
    if (projects.length <= 1) return;
    setActiveIndex(prev => prev + 1);
  }, [projects.length]);

  const handlePrev = useCallback(() => {
    if (projects.length <= 1) return;
    setActiveIndex(prev => prev - 1);
  }, [projects.length]);

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    const swipeVelocity = velocity.x;
    
    if (swipe < -10 || swipeVelocity < -100) {
      handleNext();
    } else if (swipe > 10 || swipeVelocity > 100) {
      handlePrev();
    }

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const getStyles = useCallback((rel: number) => {
    const vMargin = isPersonaggi ? '3rem' : '2rem';
    const totalVMargin = isPersonaggi ? '6rem' : '4rem';
    const smallVMargin = isPersonaggi ? '9rem' : '8rem';
    const smallTotalVMargin = isPersonaggi ? '18rem' : '16rem';

    if (isMobile) {
      if (rel === 0) {
        return {
          width: '100vw',
          height: '100vh',
          left: '0vw',
          top: '0px',
          zIndex: 40,
          opacity: 1,
          borderRadius: '0px',
        };
      } else {
        return {
          width: '100vw',
          height: '100vh',
          left: rel > 0 ? '100vw' : '-100vw',
          top: '0px',
          zIndex: 10,
          opacity: 0,
          borderRadius: '0px',
        };
      }
    }

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
      const offset = 2;
      const margin = (rel - 1) * 2;
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
        borderTopLeftRadius: '0rem',
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
        borderTopLeftRadius: '0rem',
      };
    }
  }, [isMobile, isPersonaggi, isLast]);

  const safeActiveIndex = projects && projects.length > 0 ? ((activeIndex % projects.length) + projects.length) % projects.length : 0;
  const currentProject = projects && projects.length > 0 ? projects[safeActiveIndex] : null;

  if (!projects || projects.length === 0) return null;

  return (
    <motion.section 
      ref={ref} 
      className={`${sticky ? 'sticky top-0' : 'relative'} h-screen w-full bg-transparent overflow-x-hidden`}
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
        {isLast && (
          <div 
            className={`absolute top-0 left-0 w-full h-[calc(100%+52px)] ${isMobile ? 'bg-black' : 'bg-[#F7F7F5]'}`} 
            style={{ 
              zIndex: -1,
              clipPath: isMobile ? 'none' : 'inset(0 0 0 0 round 0 0 3rem 3rem)'
            }} 
          />
        )}
        {!isLast && (
          <div className={`absolute inset-0 ${isMobile ? 'bg-black' : 'bg-[#F7F7F5]'} -z-10`} />
        )}
        <div className="relative w-full h-full overflow-hidden" style={{ borderBottomLeftRadius: (isLast && !isMobile) ? '3rem' : '0' }}>
          <motion.div style={{ opacity: entranceOpacity }} className="w-full h-full">

            {!isMobile && (
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
            )}

            {isMobile && projects.length > 1 && (
              <button 
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20"
              >
                <ChevronRight size={24} />
              </button>
            )}

            <div className="absolute inset-x-0 top-0 bottom-4 md:bottom-6 z-20">
              {(() => {
                const items = [];
                for (let rel = -1; rel <= 4; rel++) {
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
                              title={proj.title}
                              style={{ border: 'none', overflow: 'hidden' }}
                              scrolling="no"
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

                  <div className={`flex flex-col ${isMobile ? 'items-center text-center' : 'items-start'} gap-4 md:gap-6`}>
                    {isMobile && (
                      <h3 className="text-white font-bold uppercase tracking-[0.3em] text-sm mb-2">{title}</h3>
                    )}
                    <div className="flex items-center gap-4 md:gap-6">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenLightbox) onOpenLightbox(currentProject);
                        }} 
                        className={`inline-flex items-center gap-1 md:gap-2 ${isMobile ? 'text-[11px]' : 'text-sm'} uppercase tracking-widest hover:opacity-70 transition-opacity pointer-events-auto cursor-pointer`}
                      >
                        Visit project <ArrowRight size={isMobile ? 14 : 16} />
                      </button>
                      {isMobile && galleryId && (
                        <Link 
                          to={`/gallery/${galleryId}`}
                          onClick={() => {
                            sessionStorage.setItem('homeScrollPos', window.scrollY.toString());
                          }}
                          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest hover:opacity-70 transition-opacity pointer-events-auto cursor-pointer"
                        >
                          apri galleria <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {!isMobile && (
        <motion.div style={{ opacity: entranceOpacity }} className="absolute inset-x-0 bottom-0 h-[12rem] pointer-events-none z-[500] flex items-end pb-12">
          <div className="w-[calc(65vw+2rem)] pointer-events-none" />
          <div className="flex-1 flex flex-col justify-center items-center pr-8 md:pr-12 pointer-events-none gap-4">
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
      )}
      {showOverlay && !isLast && <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-black z-[600] pointer-events-none" />}
    </motion.section>
  );
});
