import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from "lucide-react";
import { getYouTubeEmbedUrl } from '../lib/utils';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  allProjects?: any[];
}

export const Lightbox = memo(({ isOpen, onClose, project, allProjects = [] }: LightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (project && allProjects.length > 0) {
      const index = allProjects.findIndex(p => p.id === project.id);
      if (index !== -1) setCurrentIndex(index);
    }
  }, [project, allProjects]);

  const currentProject = allProjects[currentIndex] || project;

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allProjects.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % allProjects.length);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (allProjects.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + allProjects.length) % allProjects.length);
    }
  };

  if (!currentProject) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black flex items-center justify-center p-4 md:p-12"
          onClick={onClose}
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-[1010] text-white hover:opacity-70 transition-opacity bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20"
          >
            <X size={24} />
          </button>

          {allProjects.length > 1 && (
            <>
              <button 
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-[1010] text-white hover:opacity-70 transition-opacity bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 hidden md:flex"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-[1010] text-white hover:opacity-70 transition-opacity bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 hidden md:flex"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <div className="w-full h-full max-w-6xl max-h-[80vh] relative group">
              {currentProject.cover_media_type === 'youtube' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <iframe 
                    src={`${getYouTubeEmbedUrl(currentProject.cover_video_url)}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1`}
                    className="w-full h-full aspect-video shadow-2xl"
                    allow="autoplay; encrypted-media"
                    title={currentProject.title}
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                  ></iframe>
                </div>
              ) : currentProject.cover_media_type === 'video' ? (
                <div className="w-full h-full relative">
                  <video 
                    src={currentProject.cover_video_url} 
                    autoPlay 
                    muted={isMuted}
                    loop 
                    playsInline
                    className="w-full h-full object-contain shadow-2xl"
                  ></video>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>
              ) : (
                <img 
                  src={currentProject.cover_image_url || currentProject.image} 
                  alt={currentProject.title} 
                  className="w-full h-full object-contain shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            <div className="mt-8 text-center text-white max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-serif mb-2">{currentProject.title}</h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                {currentProject.description_top || currentProject.description}
              </p>
              {allProjects.length > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  {allProjects.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-redd-accent w-6' : 'bg-white/20 hover:bg-white/40'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
