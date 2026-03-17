import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ArrowUpRight, Plus, Play, Volume2, VolumeX } from 'lucide-react';
import { supabase } from './lib/supabase';

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
};

export default function FullGallery() {
  const { galleryId } = useParams();
  const [works, setWorks] = useState<any[]>([]);
  const [galleryName, setGalleryName] = useState('');
  const [settings, setSettings] = useState<any>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [direction, setDirection] = useState(0);
  const [projectDirection, setProjectDirection] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!galleryId) return;

      // Fetch gallery name
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', `${galleryId.replace(/-/g, '_')}_name`)
          .single();
        
        if (settingsError) {
          if (settingsError.code !== '42P01' && !settingsError.message.includes('settings')) {
            console.error('Error fetching gallery name:', settingsError.message);
          }
          setGalleryName(galleryId.replace(/-/g, ' '));
        } else if (settingsData) {
          setGalleryName(settingsData.value);
        } else {
          setGalleryName(galleryId.replace(/-/g, ' '));
        }
      } catch (err) {
        setGalleryName(galleryId.replace(/-/g, ' '));
      }

      // Fetch works for this gallery
      const { data: worksData, error: worksError } = await supabase
        .from('works')
        .select('*')
        .ilike('group_name', galleryId.replace(/-/g, ' '))
        .order('display_order', { ascending: true });

      if (worksError) {
        const { data: fallbackData } = await supabase
          .from('works')
          .select('*')
          .ilike('group_name', galleryId.replace(/-/g, ' '))
          .order('created_at', { ascending: false });
        if (fallbackData) setWorks(fallbackData);
      } else if (worksData) {
        setWorks(worksData);
      }

      // Fetch all settings for header consistency
      const { data: allSettings } = await supabase.from('settings').select('*');
      if (allSettings) {
        const settingsObj = allSettings.reduce((acc: any, curr: any) => ({
          ...acc,
          [curr.key]: curr.value
        }), {});
        setSettings(settingsObj);
      }
    }
    fetchData();
  }, [galleryId]);

  useEffect(() => {
    if (galleryName) {
      document.title = `${galleryName} | Portfolio`;
    }
  }, [galleryName]);

  const lightboxRef = React.useRef<HTMLDivElement>(null);

  const handleOpenLightbox = async (project: any) => {
    setSelectedProject(project);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
    
    // Scroll to top when opening or changing project
    if (lightboxRef.current) {
      lightboxRef.current.scrollTo(0, 0);
    }

    try {
      const { data, error } = await supabase
        .from('work_images')
        .select('*')
        .eq('work_id', project.id)
        .order('display_order', { ascending: true });
      if (error) {
        if (error.code !== '42P01') throw error;
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

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedProject(null);
    setSelectedImageIndex(null);
    setGalleryImages([]);
    document.body.style.overflow = '';
  };

  const handlePrevProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedProject && works.length > 0) {
      const currentIndex = works.findIndex(w => w.id === selectedProject.id);
      setProjectDirection(-1);
      const prevIndex = currentIndex === 0 ? works.length - 1 : currentIndex - 1;
      handleOpenLightbox(works[prevIndex]);
    }
  };

  const handleNextProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedProject && works.length > 0) {
      const currentIndex = works.findIndex(w => w.id === selectedProject.id);
      setProjectDirection(1);
      const nextIndex = currentIndex === works.length - 1 ? 0 : currentIndex + 1;
      handleOpenLightbox(works[nextIndex]);
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
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white text-redd-dark"
    >
      {/* Header */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 pt-6 pb-12 bg-gradient-to-b from-white/100 via-white/80 to-transparent">
        <Link 
          to="/" 
          className="flex flex-col hover:opacity-80 transition-opacity"
        >
          {settings.header_logo ? (
            <div className={`flex ${settings.header_title_align === 'text-center' ? 'justify-center' : settings.header_title_align === 'text-right' ? 'justify-end' : 'justify-start'}`}>
              <img 
                src={settings.header_logo} 
                alt="Logo" 
                style={{ height: `${settings.header_logo_height || 40}px` }}
                className="w-auto object-contain" 
              />
            </div>
          ) : (
            <div className={`flex flex-col ${settings.header_title_align === 'text-center' ? 'items-center' : settings.header_title_align === 'text-right' ? 'items-end' : 'items-start'}`}>
              <div className={`${settings.header_title_size || 'text-xl'} font-bold tracking-tight uppercase`}>
                {settings.header_title || "SPIEGATO IN BREVE"}
              </div>
              <div className={`${settings.header_subtitle_size || 'text-[10px]'} tracking-[0.2em] uppercase opacity-70`}>
                {settings.header_subtitle || "CINEMA & POP CULTURE"}
              </div>
            </div>
          )}
        </Link>
        <Link to="/" className="flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-70 transition-opacity">
          <ArrowLeft size={18} /> Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <main className="pt-32 px-6 md:px-12 pb-24 max-w-[1600px] mx-auto min-h-screen">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif mb-16 uppercase tracking-tight"
        >
          {galleryName}
        </motion.h1>

        {works.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-400 uppercase tracking-widest text-sm italic">Nessun lavoro trovato in questa galleria.</p>
            <Link to="/" className="inline-block mt-8 text-black font-bold uppercase tracking-widest text-xs border-b border-black pb-1">Torna alla Home</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {works.map((work, idx) => (
              <motion.div 
                key={work.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer flex flex-col"
                onClick={() => handleOpenLightbox(work)}
              >
                <div className="overflow-hidden rounded-2xl shadow-lg mb-6 aspect-[4/5] relative bg-gray-100">
                  {work.cover_media_type === 'youtube' ? (
                    <div className="w-full h-full">
                      <iframe 
                        src={`${getYouTubeEmbedUrl(work.cover_video_url)}?autoplay=1&mute=1&loop=1&playlist=${work.cover_video_url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : work.cover_media_type === 'video' ? (
                    <video 
                      src={work.cover_video_url} 
                      autoPlay 
                      muted 
                      loop 
                      className="w-full h-full object-cover"
                    ></video>
                  ) : (work.cover_image_url || work.image) ? (
                    <img 
                      src={work.cover_image_url || work.image} 
                      alt={work.seo_alt_text || work.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Plus size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2 uppercase">{work.title}</h3>
                <p className="text-gray-500 line-clamp-2 text-sm">{work.description_top || work.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox 1: Project Details */}
      <AnimatePresence>
        {isLightboxOpen && selectedProject && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-white overflow-y-auto text-redd-dark"
          >
            <button 
              onClick={closeLightbox}
              className="fixed top-6 right-6 md:top-8 md:right-8 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors z-[110]"
            >
              <X size={24} />
            </button>

            {/* Project Navigation Arrows */}
            {works.length > 1 && (
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
                key={selectedProject.id}
                initial={{ x: projectDirection * 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -projectDirection * 100, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-32"
              >
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-24">
                  <div className="w-full lg:w-1/2 flex flex-col">
                    <div className="text-sm tracking-[0.2em] uppercase text-gray-400 mb-4 font-bold">PROJECTS</div>
                    <h2 className="text-5xl md:text-7xl font-sans tracking-tight mb-12 uppercase">{selectedProject.title}</h2>
                    
                    <div className="text-lg text-gray-600 space-y-1 leading-relaxed">
                      {(selectedProject.description_top || selectedProject.description)?.split('\n').map((paragraph: string, i: number) => (
                        <p key={i} className={paragraph.trim() === '' ? "h-2" : ""}>{paragraph}</p>
                      ))}
                    </div>

                    {selectedProject.link_url && (
                      <a 
                        href={selectedProject.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 text-sm uppercase tracking-widest bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-all mt-12 self-start"
                      >
                        {selectedProject.link_label || 'Visit Project'} <ArrowUpRight size={18} />
                      </a>
                    )}
                  </div>
                  
                  <div className="w-full lg:w-1/2">
                    <div className="sticky top-24">
                      <div className="overflow-hidden rounded-3xl shadow-2xl group bg-black/5">
                        {selectedProject.cover_media_type === 'youtube' ? (
                          <div className="w-full aspect-video lg:aspect-auto lg:h-[80vh] rounded-3xl overflow-hidden shadow-2xl bg-black relative">
                            <iframe 
                              src={`${getYouTubeEmbedUrl(selectedProject.cover_video_url)}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${selectedProject.cover_video_url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}`}
                              className={`absolute top-0 left-1/2 -translate-x-1/2 ${selectedProject.fit_large === 'width' ? 'w-full h-auto aspect-video' : 'h-full aspect-video'}`}
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
                        ) : selectedProject.cover_media_type === 'video' ? (
                          <div className="w-full rounded-3xl overflow-hidden shadow-2xl bg-black flex items-center justify-center lg:h-[80vh] relative">
                            <video 
                              src={selectedProject.cover_video_url} 
                              controls 
                              autoPlay 
                              muted={isMuted}
                              loop
                              className={`absolute top-0 left-1/2 -translate-x-1/2 ${selectedProject.fit_large === 'width' ? 'w-full h-auto object-contain' : 'h-full object-cover'}`}
                              style={selectedProject.fit_large === 'width' ? {} : { minWidth: '160vh' }}
                            ></video>
                            <button 
                              onClick={() => setIsMuted(!isMuted)}
                              className="absolute bottom-6 right-6 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                            >
                              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                          </div>
                        ) : (selectedProject.cover_image_url || selectedProject.image) ? (
                          <img 
                            src={selectedProject.cover_image_url || selectedProject.image} 
                            alt={selectedProject.seo_alt_text || selectedProject.title} 
                            className="w-full object-cover aspect-[4/5] transition-transform duration-700 group-hover:scale-110 bg-gray-100"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full aspect-[4/5] bg-gray-100" />
                        )}
                      </div>
                      {selectedProject.cover_image_caption && (
                        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold text-right">
                          {selectedProject.cover_image_caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {galleryImages && galleryImages.length > 0 && (
                  <div className="border-t border-gray-200 pt-16 mb-24">
                    <div className="text-sm tracking-[0.2em] uppercase text-gray-400 mb-12 font-bold">PROJECT GALLERY</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {galleryImages.map((img: any, idx: number) => (
                        <div 
                          key={idx}
                          className="overflow-hidden rounded-2xl shadow-lg cursor-pointer group bg-black"
                          onClick={() => setSelectedImageIndex(idx)}
                        >
                          <div className="relative">
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
                              <img 
                                src={img.url}
                                alt={img.seo_alt_text || img.title || `${selectedProject.title} gallery ${idx + 1}`}
                                className="w-full object-cover aspect-video transition-transform duration-700 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full aspect-video bg-gray-100" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description Bottom */}
                {selectedProject.description_bottom && (
                  <div className="border-t border-gray-200 pt-16">
                    <div className="text-sm tracking-[0.2em] uppercase text-gray-400 mb-8 font-bold">ADDITIONAL DETAILS</div>
                    <div className="text-lg text-gray-600 space-y-1 leading-relaxed max-w-4xl">
                      {selectedProject.description_bottom.split('\n').map((paragraph: string, i: number) => (
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

      {/* Lightbox 2: Fullscreen Gallery */}
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
                    key={selectedImageIndex}
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
                  
                  <div className="mt-12 text-sm tracking-[0.2em] text-white/50 font-mono">
                    {selectedImageIndex + 1} / {galleryImages.length}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
