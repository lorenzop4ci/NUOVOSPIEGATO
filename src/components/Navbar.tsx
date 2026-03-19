import React, { useState, useEffect, memo } from "react";
import { Link } from 'react-router-dom';
import { Menu } from "lucide-react";

const Navbar = memo(({ onMenuClick, settings }: { onMenuClick: () => void, settings: any }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className={`${isMobile ? 'absolute' : 'fixed'} top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 pt-6 pb-6 transition-all duration-500 ${scrolled ? 'bg-gradient-to-b from-redd-light/100 via-redd-light/40 to-transparent text-redd-dark' : 'text-white'}`}>
      <Link 
        to="/" 
        onClick={(e) => {
          if (window.location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="flex flex-col hover:opacity-80 transition-opacity w-full"
      >
        {settings.header_logo ? (
          <div className={`w-full flex ${settings.header_title_align === 'text-center' ? 'justify-center' : settings.header_title_align === 'text-right' ? 'justify-end' : 'justify-start'}`}>
            <img 
              src={settings.header_logo} 
              alt="Logo" 
              style={{ height: `${settings.header_logo_height || 40}px` }}
              className={`w-auto object-contain ${!scrolled ? 'brightness-0 invert' : ''}`} 
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className={`w-fit flex flex-col items-center`}>
            <div className={`${settings.header_title_size || 'text-xl'} font-bold tracking-tight uppercase text-center`}>
              {settings.header_title || "SPIEGATO IN BREVE"}
            </div>
            <div className={`${settings.header_subtitle_size || 'text-[10px]'} tracking-[0.2em] uppercase opacity-70 text-center`}>
              {settings.header_subtitle || "CINEMA & POP CULTURE"}
            </div>
          </div>
        )}
      </Link>
      <div className={`flex items-center ${isMobile ? 'fixed' : 'absolute'} right-6 md:right-12`}>
        <button onClick={onMenuClick} className="flex items-center hover:opacity-70 transition-opacity">
          <Menu size={32} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
});

export default Navbar;
