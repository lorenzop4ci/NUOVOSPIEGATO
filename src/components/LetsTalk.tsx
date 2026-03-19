import React, { useRef, memo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getYouTubeEmbedUrl } from "../lib/utils";

interface LetsTalkProps {
  data: any;
  settings: any;
  index?: number;
  sticky?: boolean;
}

export const LetsTalk = memo(({ data, settings, index = 0, sticky = true }: LetsTalkProps) => {
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

  // Parallax effects for the text
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
                  title="Lets Talk Background"
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
});

export default LetsTalk;

