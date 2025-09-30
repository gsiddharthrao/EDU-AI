import { createClient } from '@supabase/supabase-js';

// Access Supabase credentials from environment variables.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// If credentials are not provided (e.g., in a preview environment), 
// use placeholders to prevent the app from crashing on startup.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found. Using placeholders. App will run but database features will be disabled.");
}

// Initialize the Supabase client. This singleton instance is used throughout the application.
// If the URL or key is missing, it will use 'http://localhost:8000' and a placeholder key.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:8000', 
  supabaseAnonKey || 'placeholder-anon-key'
);
