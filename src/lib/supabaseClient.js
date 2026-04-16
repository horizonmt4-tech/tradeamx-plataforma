import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to hardcoded values for development
// Note: In a real production build, these should strictly come from env vars.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cgfjgosmqfsoypmfqnhq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmpnb3NtcWZzb3lwbWZxbmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTY5NTIsImV4cCI6MjA2NTY5Mjk1Mn0.iNNDFJzFlkMfdBLt-V64iC0gfDdL2v5xzG8l1JtRb8I';

// Create a single instance (Singleton pattern)
// We add auth flow type to ensure PKCE is used for better security and stability
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});

// Helper to check session validity
export const isSessionValid = (session) => {
    if (!session) return false;
    const expiresAt = session.expires_at; 
    // Check if token is expired or about to expire (within 60s)
    return expiresAt ? (expiresAt * 1000) > (Date.now() + 60000) : false;
};