import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React, { useRef, useState, useEffect, memo, useMemo } from "react";
import { Link } from 'react-router-dom';
import { getYouTubeEmbedUrl } from "../lib/utils";

const Process = memo(({ data, settings, index = 0, sticky = true }: { data: any, settings: any, index?: number, sticky?: boolean }) => {
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
  const entranceScale = useTransform(entranceProgress, [0, 1], [0.6, 1]);
  const entranceOpacity = useTransform(entranceProgress, [0, 0.5], [0, 1]);

  const steps = useMemo(() => [
    { title: settings?.col1_title || "", desc: settings?.col1_text || "", link: "/gallery/galleria-3" },
    { title: settings?.col2_title || "", desc: settings?.col2_text || "", link: "/gallery/galleria-2" },
    { title: settings?.col3_title || "", desc: settings?.col3_text || "", link: "/gallery/galleria-1" },
    { title: settings?.col4_title || "", desc: settings?.col4_text || "" , link: "/about" }
  ], [settings]);

  const titleSize = settings?.section2_title_size || 'text-4xl md:text-6xl lg:text-8xl';
  const subtitleSize = settings?.section2_subtitle_size || 'text-sm md:text-base';
  const descSize = settings?.section2_desc_size || 'text-lg md:text-xl';

  return (
    <section ref={ref} className={`${sticky ? 'sticky top-0' : 'relative'} z-10 h-screen w-full bg-transparent`} style={{ borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem', overflow: 'hidden', zIndex: index, pointerEvents }}>
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
              style={{ 
                top: data?.fit === 'width' || data?.fit === 'height' ? '50%' : '-15%', 
                left: '50%', 
                x: '-50%', 
                y: data?.fit === 'width' || data?.fit === 'height' ? '-50%' : y, 
                width: data?.fit === 'width' ? '100%' : data?.fit === 'height' ? 'auto' : '100%', 
                height: data?.fit === 'height' ? '100%' : data?.fit === 'width' ? 'auto' : '130%', 
                position: 'absolute', 
                objectFit: data?.fit === 'width' || data?.fit === 'height' ? 'contain' : 'cover' 
              }}
              src={data.image_url} 
              alt="Process background" 
              className="opacity-80"
              referrerPolicy="no-referrer"
            />
          ) : null}
        </div>

        {/* Large Absolute Text */}
        {!isMobile && (
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
        )}

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
        <div className="relative z-20 flex md:hidden flex-col justify-between h-full w-full p-6 pt-24 pb-12">
          {steps.map((step, i) => (
            <Link to={step.link} key={i} className="border-b border-white/20 pb-6 last:border-0 block hover:opacity-80 transition-opacity flex-1 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-2 flex items-center justify-between uppercase tracking-widest">
                {step.title}
                <ArrowRight size={20} className="opacity-50" />
              </h3>
              <p className="text-gray-300 text-sm line-clamp-2">{step.desc}</p>
            </Link>
          ))}
        </div>
        </motion.div>
      </motion.div>
    </section>
  );
});

export default Process;
