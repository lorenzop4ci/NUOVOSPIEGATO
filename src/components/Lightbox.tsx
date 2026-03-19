import React, { useState, useEffect, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Volume2, VolumeX, ArrowUpRight } from "lucide-react";
import { getYouTubeEmbedUrl } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  allProjects?: any[];
}

export const Lightbox = memo(({ isOpen, onClose, project, allProjects = [] }: LightboxProps) => {
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
          seo_alt_text: img.seo_alt_text || '',
          fit_small: img.fit_small || 'cover'
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
                      className="inline-flex items-center gap-2 text-redd-accent hover:underline uppercase tracking-widest text-sm font-bold"
                    >
                      View Link <ArrowUpRight size={16} />
                    </a>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default Lightbox;
