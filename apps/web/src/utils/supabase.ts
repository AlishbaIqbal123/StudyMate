import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://smadzakvfhkvguhzkzpu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hsfGg1Y6Lagi2InrfFlN6A_HwZdiuDJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
