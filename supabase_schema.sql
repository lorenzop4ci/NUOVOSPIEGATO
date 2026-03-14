-- Esegui questo script nell'editor SQL di Supabase per creare le tabelle necessarie

-- 1. Crea la tabella principale per i lavori (works)
CREATE TABLE works (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'PROJECTS',
  is_featured BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  cover_image_caption TEXT,
  link_label TEXT,
  link_url TEXT,
  description_top TEXT,
  description_bottom TEXT,
  group_name TEXT NOT NULL, -- es: 'galleria 3', 'sezione 1'
  seo_alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crea la tabella per le immagini della galleria (work_images)
CREATE TABLE work_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  link TEXT,
  seo_alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crea la tabella per le impostazioni (es. nomi gallerie)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 4. Configura le policy di sicurezza (RLS) per permettere l'accesso anonimo (solo per sviluppo/test)
-- ATTENZIONE: In produzione dovresti restringere queste policy solo agli utenti autenticati!
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permetti lettura a tutti per works" ON works FOR SELECT USING (true);
CREATE POLICY "Permetti inserimento a tutti per works" ON works FOR INSERT WITH CHECK (true);
CREATE POLICY "Permetti modifica a tutti per works" ON works FOR UPDATE USING (true);
CREATE POLICY "Permetti cancellazione a tutti per works" ON works FOR DELETE USING (true);

CREATE POLICY "Permetti lettura a tutti per work_images" ON work_images FOR SELECT USING (true);
CREATE POLICY "Permetti inserimento a tutti per work_images" ON work_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Permetti modifica a tutti per work_images" ON work_images FOR UPDATE USING (true);
CREATE POLICY "Permetti cancellazione a tutti per work_images" ON work_images FOR DELETE USING (true);

CREATE POLICY "Permetti lettura a tutti per settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Permetti inserimento a tutti per settings" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Permetti modifica a tutti per settings" ON settings FOR UPDATE USING (true);
CREATE POLICY "Permetti cancellazione a tutti per settings" ON settings FOR DELETE USING (true);
