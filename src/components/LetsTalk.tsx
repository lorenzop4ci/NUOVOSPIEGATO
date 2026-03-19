import React, { useRef, memo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

  const titleSize = settings?.section3_title_size || 'text-6xl md:text-8xl lg:text-[10rem]';
  const subtitleSize = settings?.section3_subtitle_size || 'text-sm';
  const descSize = settings?.section3_desc_size || 'text-lg md:text-xl';

  return (
    <motion.section 
      ref={ref} 
      className={`${sticky ? 'sticky top-0' : 'relative'} h-screen w-full bg-transparent overflow-hidden`}
      style={{ 
        zIndex: index,
        pointerEvents: pointerEvents
      }}
    >
      <motion.div style={{ 
        paddingTop: padding, 
        paddingLeft: padding, 
        paddingRight: padding, 
        paddingBottom: padding,
        width: '100%', 
        height: '100%', 
        backgroundColor: 'transparent',
        position: 'relative'
      }}>
        <div className="relative w-full h-full overflow-hidden bg-redd-dark">
          {/* Background Image with Parallax and Fade-in */}
          <motion.div 
            style={{ scale: bgScale, opacity: bgOpacity }}
            className="absolute inset-0 z-0"
          >
            {settings?.section3_bg_image ? (
              <img 
                src={settings.section3_bg_image} 
                alt="Let's Talk Background" 
                className="w-full h-full object-cover opacity-40"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-black/20" />
            )}
          </motion.div>

          {/* Content Layer */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white px-6 text-center">
            <motion.div style={{ y: titleY }} className="flex flex-col items-center gap-8">
              <div className="flex flex-col items-center">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className={`${subtitleSize} uppercase tracking-[0.4em] text-redd-accent font-bold mb-4`}
                >
                  {settings?.section3_subtitle || "CONTATTI"}
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`${titleSize} font-serif leading-none mb-8`}
                >
                  {settings?.section3_title || "LET'S TALK"}
                </motion.h2>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="max-w-2xl flex flex-col items-center gap-10"
              >
                <p className={`${descSize} text-gray-300 leading-relaxed`}>
                  {settings?.section3_desc || "Hai un progetto in mente o vuoi semplicemente fare due chiacchiere? Siamo sempre pronti per nuove sfide creative."}
                </p>
                
                <a 
                  href={`mailto:${settings?.contact_email || 'hello@spiegatoinbreve.it'}`}
                  className="group relative inline-flex items-center gap-4 bg-white text-redd-dark px-10 py-5 rounded-none font-bold uppercase tracking-widest text-sm hover:bg-redd-accent hover:text-white transition-all duration-500 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    SCRIVICI ORA <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
});
