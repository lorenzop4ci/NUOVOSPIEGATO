import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ArrowUpRight, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  galleryNames: Record<string, string>;
  works: any[];
  onOpenLightbox: (project: any, projects?: any[]) => void;
  settings: any;
  groupedWorks: Record<string, any[]>;
}

export const MenuOverlay = memo(({ 
  isOpen, 
  onClose, 
  galleryNames, 
  works, 
  onOpenLightbox, 
  settings, 
  groupedWorks 
}: MenuOverlayProps) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [expandedSubItem, setExpandedSubItem] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuItems = [
    { name: "Home", path: "/" },
    { 
      name: "Gallerie", 
      type: "expandable",
      subItems: Object.keys(groupedWorks).map(key => ({
        name: galleryNames[key] || key.charAt(0).toUpperCase() + key.slice(1),
        id: key.replace(/\s+/g, '-'),
        projects: groupedWorks[key]
      }))
    },
    { name: "About", path: "/about" },
    { name: "Contatti", path: "/contact" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-white text-black flex flex-col md:flex-row"
        >
          <div className="w-full md:w-1/2 h-full flex flex-col p-8 md:p-16 overflow-y-auto">
            <div className="flex justify-between items-center mb-16 md:hidden">
              <div className="flex flex-col">
                <div className="text-xl font-bold tracking-tight uppercase">
                  {settings.header_title || "SPIEGATO IN BREVE"}
                </div>
                <div className="text-[10px] tracking-[0.2em] uppercase opacity-70">
                  {settings.header_subtitle || "CINEMA & POP CULTURE"}
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col gap-6 md:gap-8 my-auto">
              {menuItems.map((item, i) => (
                <div key={item.name} className="flex flex-col">
                  {item.type === "expandable" ? (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                      onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                      className="text-3xl md:text-4xl lg:text-5xl font-serif flex items-center justify-between group hover:text-redd-accent transition-colors text-left w-full"
                    >
                      <span>{item.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.div animate={{ rotate: expandedItem === item.name ? 45 : 0 }}>
                          <Plus size={24} />
                        </motion.div>
                      </span>
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    >
                      <Link
                        to={item.path || "/"}
                        onClick={onClose}
                        className="text-3xl md:text-4xl lg:text-5xl font-serif flex items-center justify-between group hover:text-redd-accent transition-colors w-full"
                      >
                        <span>{item.name}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight size={24} />
                        </span>
                      </Link>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {item.type === "expandable" && expandedItem === item.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden flex flex-col gap-3 mt-4"
                      >
                        {item.subItems?.map((subItem) => (
                          <div key={subItem.name} className="flex flex-col ml-8 md:ml-12">
                            <div className="flex items-center gap-6 w-full group">
                              <button
                                onClick={() => setExpandedSubItem(expandedSubItem === subItem.name ? null : subItem.name)}
                                className="text-xl md:text-3xl lg:text-4xl font-serif flex items-center hover:text-redd-accent transition-colors text-left whitespace-nowrap"
                              >
                                <span>{subItem.name}</span>
                              </button>
                              
                              <div className="flex items-center gap-4">
                                <AnimatePresence>
                                  {expandedSubItem === subItem.name && (
                                    <motion.div 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                    >
                                      <Link 
                                        to={`/gallery/${subItem.id}`}
                                        onClick={onClose}
                                        className="hidden md:flex items-center justify-center gap-2 text-[10px] md:text-xs uppercase tracking-widest border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors bg-white whitespace-nowrap"
                                      >
                                        APRI GALLERIA <ArrowRight size={12} />
                                      </Link>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                                {expandedSubItem !== subItem.name && (
                                  <button 
                                    onClick={() => setExpandedSubItem(expandedSubItem === subItem.name ? null : subItem.name)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                  >
                                    <Plus size={20} />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {expandedSubItem === subItem.name && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden flex flex-col gap-2 mt-3"
                                >
                                  {subItem.projects.map((project: any) => (
                                    <button
                                      key={project.id}
                                      onClick={() => {
                                        onClose();
                                        onOpenLightbox(project, subItem.projects);
                                      }}
                                      className="text-base md:text-lg lg:text-xl font-serif ml-8 md:ml-12 hover:text-redd-accent transition-colors flex items-center justify-between group py-1 text-left"
                                    >
                                      <span>{project.title}</span>
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <ArrowUpRight size={16} />
                                      </span>
                                    </button>
                                  ))}
                                  
                                  <Link 
                                    to={`/gallery/${subItem.id}`}
                                    onClick={onClose}
                                    className="md:hidden flex items-center gap-2 text-xs uppercase tracking-widest font-bold mt-4 ml-8 text-redd-accent"
                                  >
                                    APRI GALLERIA <ArrowRight size={14} />
                                  </Link>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm shrink-0 mt-8"
            >
              <div>
                {settings.contact_email && (
                  <a href={`mailto:${settings.contact_email}`} className="block font-semibold text-lg mb-2 hover:text-redd-accent transition-colors">
                    {settings.contact_email}
                  </a>
                )}
                {settings.contact_phone && (
                  <a href={`tel:${settings.contact_phone.replace(/\s+/g, '')}`} className="block font-semibold text-lg hover:text-redd-accent transition-colors">
                    {settings.contact_phone}
                  </a>
                )}
              </div>
              <div className="flex gap-12">
                {settings.contact_address && (
                  <div>
                    <p className="text-gray-500 mb-1">Indirizzo</p>
                    <p className="whitespace-pre-line">{settings.contact_address}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="hidden md:block w-1/2 h-full relative bg-[#000000] overflow-hidden">
            {settings.menu_image ? (
              <motion.img 
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                src={settings.menu_image} 
                alt={settings.seo_title || "Menu background"} 
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-black/20" />
            )}
            <div className="absolute top-12 right-12">
              <button onClick={onClose} className="flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-70 transition-opacity bg-white px-6 py-3 shadow-lg hover:bg-gray-100">
                <X size={16} /> CHIUDI
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default MenuOverlay;

