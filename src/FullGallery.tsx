import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ArrowUpRight, Plus } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function FullGallery() {
  const { galleryId } = useParams();
  const [works, setWorks] = useState<any[]>([]);
  const [galleryName, setGalleryName] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

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
        .eq('group_name', galleryId.replace(/-/g, ' '))
        .order('display_order', { ascending: true });

      if (worksError) {
        const { data: fallbackData } = await supabase
          .from('works')
          .select('*')
          .eq('group_name', galleryId.replace(/-/g, ' '))
          .order('created_at', { ascending: false });
        if (fallbackData) setWorks(fallbackData);
      } else if (worksData) {
        setWorks(worksData);
      }
    }
    fetchData();
  }, [galleryId]);

  const handleOpenLightbox = async (project: any) => {
    setSelectedProject(project);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';

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

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedProject(null);
    setSelectedImageIndex(null);
    setGalleryImages([]);
    document.body.style.overflow = '';
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
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/';
          }}
          className="flex flex-col hover:opacity-80 transition-opacity"
        >
          <div className="text-xl font-bold tracking-tight uppercase">LORENZO PACI</div>
          <div className="text-[10px] tracking-[0.2em] uppercase opacity-70">CREATIVE VISIONARY</div>
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
                  {(work.cover_image_url || work.image) ? (
                    <img 
                      src={work.cover_image_url || work.image} 
                      alt={work.title}
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
            
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-32">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-24">
                <div className="w-full lg:w-1/2 flex flex-col">
                  <div className="text-sm tracking-[0.2em] uppercase text-gray-400 mb-4 font-bold">PROJECTS</div>
                  <h2 className="text-5xl md:text-7xl font-sans tracking-tight mb-12 uppercase">{selectedProject.title}</h2>
                  
                  <div className="text-lg text-gray-600 space-y-6 leading-relaxed">
                    {(selectedProject.description_top || selectedProject.description)?.split('\n').map((paragraph: string, i: number) => (
                      <p key={i} className="min-h-[1rem]">{paragraph}</p>
                    ))}
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2">
                  <div className="sticky top-24 overflow-hidden rounded-3xl shadow-2xl group">
                    {(selectedProject.cover_image_url || selectedProject.image) ? (
                      <img 
                        src={selectedProject.cover_image_url || selectedProject.image} 
                        alt={selectedProject.title} 
                        className="w-full object-cover aspect-[4/5] transition-transform duration-700 group-hover:scale-110 bg-gray-100"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full aspect-[4/5] bg-gray-100" />
                    )}
                  </div>
                </div>
              </div>
              
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
                            alt={img.title || `${selectedProject.title} gallery ${idx + 1}`}
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
                {galleryImages[selectedImageIndex].url ? (
                  <motion.img 
                    key={selectedImageIndex}
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
