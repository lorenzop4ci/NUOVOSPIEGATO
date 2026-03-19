import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

const ParallaxImage = React.memo(({ src, alt, className, fit = 'cover' }: { src: string | null, alt?: string, className?: string, fit?: 'cover' | 'contain' }) => {
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
              className={`w-full h-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
});

export default ParallaxImage;
