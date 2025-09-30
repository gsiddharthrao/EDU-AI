import { createClient } from '@supabase/supabase-js';

// Using the Supabase credentials provided by the user.
const supabaseUrl = 'https://pvsxhlqntcictadptpfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2c3hobHFudGNpY3RhZHB0cGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODU2MzgsImV4cCI6MjA3NDE2MTYzOH0.vTKnNTnYOKCdXa7TtUcrw0BIwBV-NxPWvdP-q1jrmbI';

// Initialize the Supabase client. This singleton instance is used throughout the application.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
