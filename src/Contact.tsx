import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Mail, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-redd-light text-redd-dark"
    >
      {/* Header */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 pt-6 pb-6 bg-redd-light/80 backdrop-blur-md border-b border-gray-200">
        <Link to="/" className="flex flex-col hover:opacity-80 transition-opacity">
          <div className="text-xl font-bold tracking-tight uppercase">LORENZO PACI</div>
          <div className="text-[10px] tracking-[0.2em] uppercase opacity-70">CREATIVE VISIONARY</div>
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
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-6 font-bold">Contact</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.1] max-w-5xl">
              Let's create something <span className="italic text-redd-accent">extraordinary</span> together.
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col gap-12"
            >
              <div className="flex flex-col gap-8">
                <div className="flex items-start gap-4">
                  <div className="bg-black text-white p-3 rounded-full shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Email</h3>
                    <a href="mailto:hello@lorenzopaci.com" className="text-xl hover:text-redd-accent transition-colors">hello@lorenzopaci.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-black text-white p-3 rounded-full shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Phone</h3>
                    <a href="tel:+391234567890" className="text-xl hover:text-redd-accent transition-colors">+39 123 456 7890</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-black text-white p-3 rounded-full shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Studio</h3>
                    <p className="text-xl">Milan, Italy</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100"
            >
              <h2 className="text-3xl font-serif mb-8">Send a message</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Message</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent min-h-[120px] resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>
                <button 
                  type="submit"
                  className="mt-4 inline-flex items-center justify-center gap-4 text-sm uppercase tracking-widest bg-black text-white px-8 py-4 hover:bg-gray-800 transition-colors"
                >
                  Send Message <ArrowRight size={20} />
                </button>
                {status && <p className="text-green-600 text-sm font-bold mt-2">{status}</p>}
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
