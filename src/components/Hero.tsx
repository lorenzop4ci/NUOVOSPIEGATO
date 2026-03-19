import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React, { useRef, useState, useEffect, memo } from "react";
import { getYouTubeEmbedUrl } from "../lib/utils";

const Hero = memo(({ data, settings }: { data: any, settings: any }) => {
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
    offset: ["start start", "end start"]
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.6]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -250]);

  const titleSize = settings?.section1_title_size || 'text-5xl md:text-7xl lg:text-8xl';
  const subtitleSize = settings?.section1_subtitle_size || 'text-sm md:text-base';
  const descSize = settings?.section1_desc_size || 'text-lg md:text-xl';

  if (isMobile) {
    return (
      <section ref={ref} className="relative z-0 h-screen bg-redd-dark flex flex-col justify-end pb-4 items-start text-left overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
          {data?.media_type === 'youtube' ? (
            <div className="w-full h-full bg-black overflow-hidden relative">
              <iframe 
                src={`${getYouTubeEmbedUrl(data.video_url)}?autoplay=1&mute=1&loop=1&playlist=${data.video_url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-auto"
                style={{ minWidth: '177.77vh', aspectRatio: '16/9' }}
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
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-auto object-cover"
                style={{ minWidth: '177.77vh' }}
              ></video>
            </div>
          ) : data?.image_url ? (
            <img 
              src={data.image_url} 
              alt="Hero background" 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-auto object-cover opacity-100"
              style={{ minWidth: '177.77vh' }}
              referrerPolicy="no-referrer"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 p-6 pb-24 w-full">
          {data?.subtitle && (
            <div className={`${subtitleSize} tracking-[0.3em] uppercase mb-4 font-bold opacity-80 text-white`}>
              {data.subtitle}
            </div>
          )}
          <h1 className={`text-white font-serif ${titleSize} leading-[1.1] mb-6`}>
            {data?.title || ""}
          </h1>
          {data?.description && (
            <p className={`mb-8 ${descSize} text-gray-300 max-w-2xl`}>
              {data.description}
            </p>
          )}
          {data?.link_text && data?.link_url && (
            <a 
              href={data.link_url}
              className="inline-flex items-center gap-4 text-sm uppercase tracking-widest border border-white px-8 py-4 hover:bg-white hover:text-black transition-colors text-white"
            >
              {data.link_text} <ArrowRight size={20} />
            </a>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent"
          />
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative z-0 h-[100vh] w-full bg-redd-dark">
      <div className="absolute top-0 left-0 h-full w-full overflow-hidden -z-10">
        <div className="sticky top-0 h-screen w-full">
          {data?.media_type === 'youtube' ? (
            <div className="w-full h-full bg-black overflow-hidden relative">
              <iframe 
                src={`${getYouTubeEmbedUrl(data.video_url)}?autoplay=1&mute=1&loop=1&playlist=${data.video_url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${data?.fit === 'width' ? 'w-full h-auto' : data?.fit === 'height' ? 'w-auto h-full' : (isMobile ? 'h-full w-auto' : 'h-full scale-[1.1]')}`}
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
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${data?.fit === 'width' ? 'w-full h-auto' : data?.fit === 'height' ? 'w-auto h-full' : (isMobile ? 'h-full w-auto object-cover' : 'w-full h-full object-cover')}`}
                style={data?.fit === 'width' || data?.fit === 'height' ? {} : { minWidth: '177.77vh' }}
              ></video>
            </div>
          ) : data?.image_url ? (
            <motion.img 
              style={{ scale, transformOrigin: "bottom center" }}
              src={data.image_url} 
              alt="Hero background" 
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${data?.fit === 'width' ? 'w-full h-auto' : data?.fit === 'height' ? 'w-auto h-full' : (isMobile ? 'h-full w-auto object-cover' : 'w-full h-full object-cover')} opacity-100`}
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
});

export default Hero;
