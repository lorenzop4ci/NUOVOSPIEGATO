import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create the client if we have the required environment variables
// This prevents the "supabaseUrl is required" error at module load time
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as SupabaseClient, {
      get() {
        throw new Error('Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Settings > Secrets menu.');
      }
    });

export type Work = {
  id: string;
  title: string;
  category: string;
  is_featured: boolean;
  cover_image_url: string;
  cover_media_type?: 'image' | 'video' | 'youtube';
  cover_video_url?: string;
  cover_image_caption: string;
  link_label: string;
  link_url: string;
  description_top: string;
  description_bottom: string;
  group_name: string; // e.g., 'galleria 3', 'sezione 1'
  seo_alt_text?: string;
  display_order: number;
  fit_large?: 'height' | 'width';
  fit_small?: 'height' | 'width';
  created_at: string;
};

export type WorkImage = {
  id: string;
  work_id: string;
  image_url: string;
  media_type?: 'image' | 'video' | 'youtube';
  video_url?: string;
  title?: string;
  description?: string;
  link?: string;
  seo_alt_text?: string;
  display_order: number;
  fit_large?: 'height' | 'width';
  fit_small?: 'height' | 'width';
  created_at: string;
};
