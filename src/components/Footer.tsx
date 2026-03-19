import React, { memo } from "react";
import { Instagram, Youtube, Facebook, MessageCircle, Linkedin, Mail, ArrowUpRight } from "lucide-react";

interface FooterProps {
  settings: any;
}

export const Footer = memo(({ settings }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-redd-dark text-redd-light py-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col">
              <div className="text-2xl font-bold tracking-tight uppercase">
                {settings.header_title || "SPIEGATO IN BREVE"}
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase opacity-70">
                {settings.header_subtitle || "CINEMA & POP CULTURE"}
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-xs">
              {settings.footer_description || "Esploriamo il mondo del cinema e della cultura pop attraverso analisi approfondite e contenuti creativi."}
            </p>
            <div className="flex gap-4">
              {settings.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-redd-accent hover:border-redd-accent transition-all">
                  <Instagram size={18} />
                </a>
              )}
              {settings.social_youtube && (
                <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-redd-accent hover:border-redd-accent transition-all">
                  <Youtube size={18} />
                </a>
              )}
              {settings.social_facebook && (
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-redd-accent hover:border-redd-accent transition-all">
                  <Facebook size={18} />
                </a>
              )}
              {settings.social_linkedin && (
                <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-redd-accent hover:border-redd-accent transition-all">
                  <Linkedin size={18} />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h4 className="text-sm uppercase tracking-widest font-bold text-redd-accent">Contatti</h4>
            <div className="flex flex-col gap-4">
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-3 hover:text-redd-accent transition-colors group">
                  <Mail size={16} className="text-gray-500 group-hover:text-redd-accent" />
                  <span>{settings.contact_email}</span>
                </a>
              )}
              {settings.contact_phone && (
                <a href={`tel:${settings.contact_phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 hover:text-redd-accent transition-colors group">
                  <MessageCircle size={16} className="text-gray-500 group-hover:text-redd-accent" />
                  <span>{settings.contact_phone}</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h4 className="text-sm uppercase tracking-widest font-bold text-redd-accent">Sede</h4>
            <div className="flex flex-col gap-4 text-gray-400">
              {settings.contact_address ? (
                <p className="whitespace-pre-line leading-relaxed">
                  {settings.contact_address}
                </p>
              ) : (
                <p>Milano, Italia</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h4 className="text-sm uppercase tracking-widest font-bold text-redd-accent">Newsletter</h4>
            <div className="flex flex-col gap-4">
              <p className="text-gray-400 text-sm">Iscriviti per ricevere aggiornamenti sui nuovi contenuti.</p>
              <div className="flex border-b border-white/20 pb-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-600"
                />
                <button className="hover:text-redd-accent transition-colors">
                  <ArrowUpRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-gray-500 font-medium">
          <div className="flex gap-8">
            <a href="#" className="hover:text-redd-light transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-redd-light transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-redd-light transition-colors">Terms of Service</a>
          </div>
          <p>© {currentYear} {settings.header_title || "SPIEGATO IN BREVE"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
});
