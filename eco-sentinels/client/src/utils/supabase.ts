import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://erjbxuhdcjrptxwzzzer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyamJ4dWhkY2pycHR4d3p6emVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODc1OTIsImV4cCI6MjA4OTY2MzU5Mn0.rQTJyIQdLcOi0EcDeljSYmwm-OL9cUtDqILVsWmzQV8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'econode-auth-token',
    // Use sessionStorage to prevent cross-tab Web Lock contention (GoTrue lock bug)
    storage: window.sessionStorage,
  }
});


