import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Edit2, Trash2, Lock, AlertCircle, Upload, GripVertical } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, type Work } from './lib/supabase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function ImageField({ 
  label, 
  value, 
  onChange, 
  placeholder = "https://..." 
}: { 
  label: string, 
  value: string, 
  onChange: (url: string) => void,
  placeholder?: string
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Errore durante l\'upload: ' + err.message + '\n\nSuggerimenti:\n1. Verifica che il nome del bucket sia "images" (tutto minuscolo).\n2. Assicurati che la policy su Supabase permetta l\'accesso agli utenti "authenticated".');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors pr-12" 
            placeholder={placeholder}
          />
          {value && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden border border-gray-100">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        <label className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
          {uploading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={18} />
          )}
        </label>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedGalleries, setCollapsedGalleries] = useState<string[]>([]);
  const [galleryNames, setGalleryNames] = useState<Record<string, string>>({});
  const [renamingGallery, setRenamingGallery] = useState<string | null>(null);
  const [newGalleryName, setNewGalleryName] = useState('');
  const [activeTab, setActiveTab] = useState<'galleries' | 'sections'>('galleries');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [adminMessage, setAdminMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (adminMessage) {
      const timer = setTimeout(() => setAdminMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [adminMessage]);

  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (isSupabaseConfigured && isAuthenticated) {
      fetchWorks();
      fetchSettings();
    }
  }, [isSupabaseConfigured, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setIsAuthenticated(true);
      setAdminMessage({ text: 'Accesso eseguito!', type: 'success' });
    } catch (err: any) {
      setAdminMessage({ text: 'Errore: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    navigate('/');
  };

  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-50 p-8 rounded-2xl border border-gray-200">
          <div className="flex flex-col items-center mb-8">
            <Lock size={32} className="mb-4" />
            <h1 className="text-2xl font-bold uppercase tracking-widest">Admin Login</h1>
            <p className="text-xs text-gray-400 mt-2 text-center">Usa le tue credenziali Supabase</p>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
              placeholder="admin@example.com"
              required
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>

          {adminMessage && (
            <div className={`mt-4 p-3 rounded-lg text-xs font-bold text-center ${adminMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {adminMessage.text}
            </div>
          )}
        </form>
      </div>
    );
  }

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) {
        if (error.code === '42P01' || error.message.includes('settings')) {
          // Table doesn't exist, ignore gracefully
          console.warn('Settings table not found. Please run the updated SQL schema.');
          return;
        }
        throw error;
      }
      if (data) {
        const names: Record<string, string> = {};
        data.forEach(setting => {
          if (setting.key.endsWith('_name')) {
            const galleryKey = setting.key.replace('_name', '').replace(/_/g, ' ');
            names[galleryKey] = setting.value;
          }
        });
        setGalleryNames(names);
      }
    } catch (err: any) {
      if (!err.message?.includes('settings')) {
        console.error('Error fetching settings:', err.message);
      }
    }
  };

  const fetchWorks = async () => {
    try {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        // Fallback to created_at if display_order doesn't exist yet
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('works')
          .select('*')
          .order('created_at', { ascending: false });
        if (fallbackError) throw fallbackError;
        setWorks(fallbackData || []);
      } else {
        setWorks(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent, groupName: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const groupWorks = works.filter((w: Work) => w.group_name === groupName);
    const oldIndex = groupWorks.findIndex((w: Work) => w.id === active.id);
    const newIndex = groupWorks.findIndex((w: Work) => w.id === over.id);

    const newGroupWorks = arrayMove(groupWorks, oldIndex, newIndex);
    
    // Update local state immediately for smooth UI
    const otherWorks = works.filter((w: Work) => w.group_name !== groupName);
    const updatedWorks = [...otherWorks, ...newGroupWorks];
    setWorks(updatedWorks);

    // Persist to DB
    try {
      const updates = newGroupWorks.map((work: Work, index: number) => ({
        id: work.id,
        display_order: index
      }));

      for (const update of updates) {
        await supabase.from('works').update({ display_order: update.display_order }).eq('id', update.id);
      }
      setAdminMessage({ text: 'Ordine salvato!', type: 'success' });
    } catch (err: any) {
      console.error('Error saving order:', err);
      setAdminMessage({ text: 'Errore nel salvataggio ordine: ' + err.message, type: 'error' });
    }
  };

  const handleEdit = (work: Work) => {
    setEditingWork(work);
    setIsEditing(true);
  };

  const handleAddNew = (groupName: string) => {
    setEditingWork({ group_name: groupName } as Work);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      // First delete related images to avoid foreign key constraint errors
      await supabase.from('work_images').delete().eq('work_id', itemToDelete);
      
      // Then delete the work itself
      const { error } = await supabase.from('works').delete().eq('id', itemToDelete);
      if (error) throw error;
      setItemToDelete(null);
      fetchWorks();
    } catch (err: any) {
      setAdminMessage({ text: 'Errore durante l\'eliminazione: ' + err.message, type: 'error' });
      setItemToDelete(null);
    }
  };

  const toggleCollapse = (groupName: string) => {
    setCollapsedGalleries(prev => 
      prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]
    );
  };

  const saveGalleryName = async (groupName: string) => {
    if (!newGalleryName.trim()) {
      setRenamingGallery(null);
      return;
    }
    
    const key = `${groupName.replace(/ /g, '_')}_name`;
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value: newGalleryName });
        
      if (error) throw error;
      
      setGalleryNames(prev => ({ ...prev, [groupName]: newGalleryName }));
      setRenamingGallery(null);
      setAdminMessage({ text: 'Galleria rinominata con successo!', type: 'success' });
    } catch (err: any) {
      setAdminMessage({ text: 'Errore: ' + err.message, type: 'error' });
    }
  };

  if (isEditing) {
    return <EditWork work={editingWork} onClose={() => { setIsEditing(false); setEditingWork(null); fetchWorks(); }} setAdminMessage={setAdminMessage} />;
  }

  // Group works by group_name
  const groupedWorks = works.reduce((acc, work) => {
    if (!acc[work.group_name]) acc[work.group_name] = [];
    acc[work.group_name].push(work);
    return acc;
  }, {} as Record<string, Work[]>);

  return (
    <div className="min-h-screen bg-white text-redd-dark font-sans pb-24">
      {/* Main Site Header (Admin Mode) */}
      <nav className="w-full flex justify-between items-center px-6 md:px-12 py-6 border-b border-gray-100">
        <Link 
          to="/" 
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/';
          }}
          className="flex flex-col hover:opacity-80 transition-opacity"
        >
          <div className="text-xl font-bold tracking-tight uppercase">LORENZO PACI</div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-gray-400">CREATIVE VISIONARY</div>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
          <Link to="/" className="hover:text-black transition-colors">ALL WORKS</Link>
          <Link to="/" className="hover:text-black transition-colors">GRAPHIC</Link>
          <Link to="/" className="hover:text-black transition-colors">PHOTO</Link>
          <Link to="/" className="hover:text-black transition-colors">PROJECTS</Link>
          <Link to="/about" className="hover:text-black transition-colors">ABOUT</Link>
          <Link to="/contact" className="hover:text-black transition-colors">CONTACT</Link>
        </div>
      </nav>

      {/* Admin Dashboard Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-8 flex justify-between items-end border-b border-gray-200">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-gray-400 font-bold mb-2">MANAGEMENT</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
          <LogOut size={14} /> LOGOUT
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16">
        {!isSupabaseConfigured && (
          <div className="mb-12 bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-2xl flex items-start gap-4">
            <AlertCircle className="shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">Supabase non configurato</h3>
              <p className="text-sm mb-4">
                Per rendere funzionante questo pannello, devi collegarlo al tuo database Supabase.
              </p>
              <ol className="list-decimal list-inside text-sm space-y-2 mb-4">
                <li>Vai su Supabase e crea un nuovo progetto.</li>
                <li>Esegui lo script SQL fornito nell'editor SQL di Supabase per creare le tabelle.</li>
                <li>Copia <code>Project URL</code> e <code>anon key</code> dalle impostazioni API di Supabase.</li>
                <li>Aggiungili come variabili d'ambiente <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-12 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('galleries')}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'galleries' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
          >
            Gallerie
          </button>
          <button 
            onClick={() => setActiveTab('sections')}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'sections' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
          >
            Sezioni Sito
          </button>
        </div>

        {activeTab === 'galleries' && (
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-serif uppercase tracking-tighter mb-8">GALLERIE</h2>
            
            <div className="border border-gray-200 rounded-[2rem] p-8 md:p-12">
            {['galleria 3', 'galleria 2', 'galleria 1'].map((galleryName) => (
              <div key={galleryName} className="mb-16 last:mb-0">
                <div className="flex items-center gap-4 mb-8">
                  {renamingGallery === galleryName ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={newGalleryName} 
                        onChange={(e) => setNewGalleryName(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xl font-bold"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveGalleryName(galleryName);
                          if (e.key === 'Escape') setRenamingGallery(null);
                        }}
                      />
                      <button onClick={() => saveGalleryName(galleryName)} className="bg-black text-white text-xs uppercase tracking-widest px-3 py-1 rounded hover:bg-gray-800">Save</button>
                      <button onClick={() => setRenamingGallery(null)} className="text-gray-500 text-xs uppercase tracking-widest px-3 py-1 hover:text-black">Cancel</button>
                    </div>
                  ) : (
                    <h3 className="text-2xl font-bold">{galleryNames[galleryName] || galleryName}</h3>
                  )}
                  
                  {renamingGallery !== galleryName && (
                    <button 
                      onClick={() => {
                        setRenamingGallery(galleryName);
                        setNewGalleryName(galleryNames[galleryName] || galleryName);
                      }}
                      className="bg-black text-white text-xs uppercase tracking-widest px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Rinomina Galleria
                    </button>
                  )}
                  <button 
                    onClick={() => handleAddNew(galleryName)}
                    className="bg-black text-white text-xs uppercase tracking-widest px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} /> Add New Work
                  </button>
                  <button onClick={() => toggleCollapse(galleryName)} className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                    <span className="text-2xl leading-none">{collapsedGalleries.includes(galleryName) ? '+' : '-'}</span>
                  </button>
                </div>

                {!collapsedGalleries.includes(galleryName) && (
                  groupedWorks[galleryName] && groupedWorks[galleryName].length > 0 ? (
                    <div className="w-full">
                      <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
                        <div className="col-span-1"></div>
                        <div className="col-span-2">Preview</div>
                        <div className="col-span-3">Title</div>
                        <div className="col-span-2">Category</div>
                        <div className="col-span-2">Featured</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleDragEnd(e, galleryName)}
                      >
                        <SortableContext 
                          items={groupedWorks[galleryName].map(w => w.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="flex flex-col gap-2">
                            {groupedWorks[galleryName].map((work) => (
                              <SortableWorkRow 
                                key={work.id}
                                work={work}
                                onEdit={() => handleEdit(work)} 
                                onDelete={() => handleDelete(work.id)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic px-4">Nessun lavoro in questa galleria.</div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
        )}

        {activeTab === 'sections' && (
          <SectionsEditor setAdminMessage={setAdminMessage} />
        )}

      </div>

      {/* Admin Message Toast */}
      {adminMessage && (
        <div className={`fixed bottom-8 right-8 z-[300] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${adminMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {adminMessage.type === 'error' && <AlertCircle size={20} />}
          <span className="font-bold uppercase tracking-widest text-xs">{adminMessage.text}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Conferma eliminazione</h3>
            <p className="text-gray-600 mb-8">Sei sicuro di voler eliminare questo lavoro? Questa azione non può essere annullata.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-colors"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionsEditor({ setAdminMessage }: { setAdminMessage: (msg: { text: string, type: 'success' | 'error' } | null) => void }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) {
        if (error.code === '42P01' || error.message.includes('settings')) {
          console.warn('Settings table not found.');
          return;
        }
        throw error;
      }
      if (data) {
        const newSettings: Record<string, string> = {};
        data.forEach(s => {
          newSettings[s.key] = s.value;
        });
        setSettings(newSettings);
      }
    } catch (err: any) {
      if (!err.message?.includes('settings')) {
        console.error('Error fetching settings:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({ key, value }));
      for (const update of updates) {
        await supabase.from('settings').upsert(update);
      }
      setAdminMessage({ text: 'Sezioni salvate con successo!', type: 'success' });
    } catch (err: any) {
      setAdminMessage({ text: 'Errore durante il salvataggio: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Caricamento sezioni...</div>;

  const renderSectionFields = (sectionId: string, sectionName: string, hasSteps: boolean = false) => (
    <div className="mb-12 border border-gray-200 rounded-[2rem] p-8 md:p-12">
      <h3 className="text-3xl font-serif uppercase tracking-tighter mb-8">{sectionName}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ImageField 
          label="Immagine di Sfondo" 
          value={settings[`${sectionId}_image_url`] || ''} 
          onChange={(url) => handleChange(`${sectionId}_image_url`, url)} 
        />
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Allineamento Titolo</label>
          <select 
            value={settings[`${sectionId}_title_align`] || 'left'} 
            onChange={(e) => handleChange(`${sectionId}_title_align`, e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors bg-white"
          >
            <option value="left">Sinistra</option>
            <option value="center">Centrato</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Sovratitolo</label>
          <input 
            type="text" 
            value={settings[`${sectionId}_subtitle`] || ''} 
            onChange={(e) => handleChange(`${sectionId}_subtitle`, e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Titolo (max 2 righe)</label>
          <textarea 
            value={settings[`${sectionId}_title`] || ''} 
            onChange={(e) => handleChange(`${sectionId}_title`, e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors min-h-[80px]"
            rows={2}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Descrizione (max 2 righe)</label>
          <textarea 
            value={settings[`${sectionId}_description`] || ''} 
            onChange={(e) => handleChange(`${sectionId}_description`, e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors min-h-[80px]"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Testo Pulsante Link</label>
          <input 
            type="text" 
            value={settings[`${sectionId}_link_text`] || ''} 
            onChange={(e) => handleChange(`${sectionId}_link_text`, e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">URL Pulsante Link</label>
          <input 
            type="text" 
            value={settings[`${sectionId}_link_url`] || ''} 
            onChange={(e) => handleChange(`${sectionId}_link_url`, e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      {hasSteps && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h4 className="text-xl font-bold mb-6">Colonne / Step (Sezione 2)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h5 className="font-bold mb-4">Colonna {step}</h5>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Titolo</label>
                  <input 
                    type="text" 
                    value={settings[`${sectionId}_step${step}_title`] || ''} 
                    onChange={(e) => handleChange(`${sectionId}_step${step}_title`, e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Descrizione</label>
                  <textarea 
                    value={settings[`${sectionId}_step${step}_desc`] || ''} 
                    onChange={(e) => handleChange(`${sectionId}_step${step}_desc`, e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-black transition-colors min-h-[80px]"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl md:text-5xl font-serif uppercase tracking-tighter">SEZIONI SITO</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvataggio...' : 'Salva Tutte le Sezioni'}
        </button>
      </div>

      {renderSectionFields('section1', 'Sezione 1 (Hero)')}
      {renderSectionFields('section2', 'Sezione 2 (Processo)', true)}
      {renderSectionFields('section3', 'Sezione 3 (Contatti)')}
    </div>
  );
}

function SortableWorkRow({ work, onEdit, onDelete }: { key?: React.Key, work: Work, onEdit: () => void, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: work.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    position: 'relative' as const,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`grid grid-cols-12 gap-4 items-center py-2 px-4 bg-white border border-transparent hover:border-gray-200 hover:bg-gray-50 rounded-xl transition-all group ${isDragging ? 'shadow-xl border-gray-200 opacity-50' : ''}`}
    >
      <div className="col-span-1 flex items-center">
        <button 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-2 text-gray-300 hover:text-gray-600 transition-colors"
        >
          <GripVertical size={18} />
        </button>
      </div>
      <div className="col-span-2">
        {work.cover_image_url ? (
          <img src={work.cover_image_url} alt={work.title} className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100" />
        )}
      </div>
      <div className="col-span-3 font-bold">{work.title}</div>
      <div className="col-span-2">
        <span className="bg-gray-100 text-gray-600 text-[10px] uppercase tracking-widest px-2 py-1 rounded font-bold">
          {work.category}
        </span>
      </div>
      <div className="col-span-2 flex items-center justify-center">
        {work.is_featured && (
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="In evidenza" />
        )}
      </div>
      <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800">
          <Edit2 size={14} />
        </button>
        <button onClick={onDelete} className="w-8 h-8 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-100 hover:text-red-600 hover:border-red-200 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function SortableImageItem({ img, index, onRemove, onUpdate }: { key?: React.Key, img: any, index: number, onRemove: (i: number) => void, onUpdate: (i: number, data: any) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: img.id || `temp-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    position: 'relative' as const,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all ${isDragging ? 'shadow-xl border-gray-300 opacity-50' : ''}`}
    >
      <div className="flex items-center gap-4">
        <button 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-2 text-gray-300 hover:text-gray-600 transition-colors"
        >
          <GripVertical size={18} />
        </button>
        {img.image_url ? (
          <img src={img.image_url} alt={`Gallery ${index}`} className="w-16 h-16 object-cover rounded-lg" />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-lg" />
        )}
        <input 
          type="text" 
          value={img.image_url} 
          readOnly 
          className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-500 truncate"
        />
        <button 
          onClick={() => onRemove(index)}
          className="w-8 h-8 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-100 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <input 
          type="text" 
          placeholder="Title (optional)" 
          value={img.title || ''} 
          onChange={(e) => onUpdate(index, { title: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
        />
        <input 
          type="text" 
          placeholder="Link URL (optional)" 
          value={img.link || ''} 
          onChange={(e) => onUpdate(index, { link: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
        />
      </div>
      <textarea 
        placeholder="Description (optional)" 
        value={img.description || ''} 
        onChange={(e) => onUpdate(index, { description: e.target.value })}
        rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors resize-none"
      />
    </div>
  );
}

function WorkRow({ title, category, image, onEdit, onDelete }: { key?: React.Key, title: string, category: string, image: string, onEdit: () => void, onDelete: () => void | Promise<void> }) {
  return (
    <div className="grid grid-cols-12 gap-4 items-center py-2 px-4 hover:bg-gray-50 rounded-xl transition-colors group">
      <div className="col-span-2">
        {image ? (
          <img src={image} alt={title} className="w-12 h-12 rounded-lg object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100" />
        )}
      </div>
      <div className="col-span-3 font-bold">{title}</div>
      <div className="col-span-3">
        <span className="bg-gray-100 text-gray-600 text-[10px] uppercase tracking-widest px-2 py-1 rounded font-bold">
          {category}
        </span>
      </div>
      <div className="col-span-2"></div>
      <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800">
          <Edit2 size={14} />
        </button>
        <button onClick={onDelete} className="w-8 h-8 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-100 hover:text-red-600 hover:border-red-200 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function EditWork({ work, onClose, setAdminMessage }: { work: Work | null, onClose: () => void, setAdminMessage: (msg: { text: string, type: 'success' | 'error' } | null) => void }) {
  const [formData, setFormData] = useState<Partial<Work>>(work || {});
  const [saving, setSaving] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{ id?: string, image_url: string, title?: string, description?: string, link?: string, display_order: number }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageDescription, setNewImageDescription] = useState('');
  const [newImageLink, setNewImageLink] = useState('');

  useEffect(() => {
    if (work?.id) {
      fetchGalleryImages();
    }
  }, [work?.id]);

  const fetchGalleryImages = async () => {
    if (!work?.id) return;
    try {
      const { data, error } = await supabase
        .from('work_images')
        .select('*')
        .eq('work_id', work.id)
        .order('display_order', { ascending: true });
      if (error) {
        if (error.code === '42P01') {
          console.warn('work_images table not found. Please run the updated SQL schema.');
          return;
        }
        throw error;
      }
      if (data) setGalleryImages(data);
    } catch (err: any) {
      console.error('Error fetching gallery images:', err.message);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setGalleryImages(prev => [
      ...prev, 
      { 
        image_url: newImageUrl, 
        title: newImageTitle,
        description: newImageDescription,
        link: newImageLink,
        display_order: prev.length 
      }
    ]);
    setNewImageUrl('');
    setNewImageTitle('');
    setNewImageDescription('');
    setNewImageLink('');
  };

  const handleRemoveImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = galleryImages.findIndex(img => (img.id || `temp-${galleryImages.indexOf(img)}`) === active.id);
    const newIndex = galleryImages.findIndex(img => (img.id || `temp-${galleryImages.indexOf(img)}`) === over.id);

    setGalleryImages(arrayMove(galleryImages, oldIndex, newIndex));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let workId = work?.id;
      
      if (workId) {
        const { error } = await supabase.from('works').update(formData).eq('id', workId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('works').insert([formData]).select().single();
        if (error) throw error;
        workId = data.id;
      }
      setAdminMessage({ text: 'Lavoro salvato con successo!', type: 'success' });

      // Handle gallery images
      if (workId) {
        // Delete existing images
        await supabase.from('work_images').delete().eq('work_id', workId);
        
        // Insert new images
        if (galleryImages.length > 0) {
          const imagesToInsert = galleryImages.map((img, index) => ({
            work_id: workId,
            image_url: img.image_url,
            title: img.title,
            description: img.description,
            link: img.link,
            display_order: index
          }));
          const { error: imgError } = await supabase.from('work_images').insert(imagesToInsert);
          if (imgError) throw imgError;
        }
      }

      onClose();
    } catch (err: any) {
      setAdminMessage({ text: 'Errore durante il salvataggio: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-redd-dark font-sans pb-24">
      {/* Main Site Header (Admin Mode) */}
      <nav className="w-full flex justify-between items-center px-6 md:px-12 py-6 border-b border-gray-100">
        <Link 
          to="/" 
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/';
          }}
          className="flex flex-col hover:opacity-80 transition-opacity"
        >
          <div className="text-xl font-bold tracking-tight uppercase">LORENZO PACI</div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-gray-400">CREATIVE VISIONARY</div>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
          <Link to="/" className="hover:text-black transition-colors">ALL WORKS</Link>
          <Link to="/" className="hover:text-black transition-colors">GRAPHIC</Link>
          <Link to="/" className="hover:text-black transition-colors">PHOTO</Link>
          <Link to="/" className="hover:text-black transition-colors">PROJECTS</Link>
          <Link to="/about" className="hover:text-black transition-colors">ABOUT</Link>
          <Link to="/contact" className="hover:text-black transition-colors">CONTACT</Link>
        </div>
      </nav>

      {/* Admin Dashboard Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-8 flex justify-between items-end border-b border-gray-200">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-gray-400 font-bold mb-2">MANAGEMENT</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{work?.id ? 'Edit Work' : 'Add New Work'}</h1>
        </div>
        <button onClick={onClose} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
          <LogOut size={14} /> BACK
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 mt-16">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl font-bold mb-8">{work?.id ? 'Edit Work' : 'Add New Work'} - {formData.group_name}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                <select name="category" value={formData.category || 'PROJECTS'} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors appearance-none bg-white">
                  <option value="PROJECTS">Projects</option>
                  <option value="GRAPHIC">Graphic</option>
                  <option value="PHOTO">Photo</option>
                </select>
              </div>

              <label className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" name="is_featured" checked={formData.is_featured || false} onChange={handleChange} className="w-4 h-4 accent-black" />
                <span className="text-sm font-bold uppercase tracking-widest">Metti in evidenza nella home page</span>
              </label>

              <ImageField 
                label="Cover Image" 
                value={formData.cover_image_url || ''} 
                onChange={(url) => setFormData(prev => ({ ...prev, cover_image_url: url }))} 
              />

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cover Image Caption (Lightbox Only)</label>
                <input type="text" name="cover_image_caption" value={formData.cover_image_caption || ''} onChange={handleChange} placeholder="Caption for the first image in lightbox..." className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="link_label" value={formData.link_label || ''} onChange={handleChange} placeholder="Link Label (Optional)" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors" />
                <input type="text" name="link_url" value={formData.link_url || ''} onChange={handleChange} placeholder="Link URL (Optional)" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Gallery Items</label>
                </div>
                
                <div className="flex flex-col gap-4">
                  {galleryImages.length > 0 && (
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest italic mb-2">
                      * Trascina le immagini per riordinarle. Ricorda di cliccare "Salva Modifiche" in fondo.
                    </p>
                  )}
                  
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleImageDragEnd}
                  >
                    <SortableContext 
                      items={galleryImages.map((img, i) => img.id || `temp-${i}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-4">
                        {galleryImages.map((img, index) => (
                          <SortableImageItem 
                            key={img.id || `temp-${index}`}
                            img={img}
                            index={index}
                            onRemove={handleRemoveImage}
                            onUpdate={(i, data) => {
                              const newImages = [...galleryImages];
                              newImages[i] = { ...newImages[i], ...data };
                              setGalleryImages(newImages);
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <ImageField 
                      label="Add New Image" 
                      value={newImageUrl} 
                      onChange={setNewImageUrl} 
                      placeholder="Image URL (required)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={newImageTitle}
                        onChange={(e) => setNewImageTitle(e.target.value)}
                        placeholder="Title (optional)" 
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                      />
                      <input 
                        type="text" 
                        value={newImageLink}
                        onChange={(e) => setNewImageLink(e.target.value)}
                        placeholder="Link URL (optional)" 
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <textarea 
                      value={newImageDescription}
                      onChange={(e) => setNewImageDescription(e.target.value)}
                      placeholder="Description (optional)" 
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                    />
                    <button 
                      onClick={handleAddImage}
                      disabled={!newImageUrl.trim()}
                      className="mt-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                      Add Image
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description (Top)</label>
                <textarea name="description_top" value={formData.description_top || ''} onChange={handleChange} rows={5} placeholder="Main description..." className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors resize-none"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description (Bottom - Optional)</label>
                <textarea name="description_bottom" value={formData.description_bottom || ''} onChange={handleChange} rows={5} placeholder="Secondary description under gallery..." className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition-colors resize-none"></textarea>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">External Links</label>
                  <button className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="border border-dashed border-gray-300 rounded-xl p-8 flex justify-center items-center text-gray-400 text-sm hover:bg-gray-50 transition-colors cursor-pointer">
                  + Add first link (Coming Soon)
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-4 mt-12 pt-8 border-t border-gray-100">
            <button onClick={onClose} className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
              Annulla
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="bg-black text-white text-sm font-bold uppercase tracking-widest px-12 py-4 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg"
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
