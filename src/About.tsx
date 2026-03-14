import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './lib/supabase';

export default function About() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const settingsObj = data.reduce((acc: any, curr: any) => ({
          ...acc,
          [curr.key]: curr.value
        }), {});
        setSettings(settingsObj);
      }
    }
    fetchSettings();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-redd-light text-redd-dark"
    >
      {/* Header */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 pt-6 pb-12 bg-gradient-to-b from-redd-light/100 via-redd-light/80 to-transparent">
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

      <div className="pt-32 pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:mb-24"
          >
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-6 font-bold">About</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.1] max-w-5xl">
              Lorenzo Paci is a creative visionary based in Italy, specializing in visual storytelling and design.
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100"
            >
              {/* Profile image removed as per user request for empty backgrounds */}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col gap-8"
            >
              <h2 className="text-3xl md:text-4xl font-serif">
                My approach to <span className="italic text-redd-accent">design</span>
              </h2>
              <div className="text-lg text-gray-600 space-y-6">
                <p>
                  With a background in graphic design and photography, I bring a unique perspective to every project. My work is characterized by a minimalist aesthetic, attention to detail, and a deep understanding of visual communication.
                </p>
                <p>
                  I believe that good design is not just about making things look beautiful, but about solving problems and creating meaningful experiences. Whether it's a brand identity, a website, or a photographic campaign, my goal is always to tell a compelling story.
                </p>
                <p>
                  Over the years, I have had the privilege of working with a diverse range of clients, from small startups to established brands. I approach every project with the same level of passion and dedication, always striving to exceed expectations.
                </p>
              </div>
              
              <div className="mt-8">
                <Link 
                  to="/contact"
                  className="inline-flex items-center gap-4 text-sm uppercase tracking-widest border border-black px-8 py-4 hover:bg-black hover:text-white transition-colors text-black"
                >
                  Get in touch <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
