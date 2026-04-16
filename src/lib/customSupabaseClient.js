import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cgfjgosmqfsoypmfqnhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmpnb3NtcWZzb3lwbWZxbmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTY5NTIsImV4cCI6MjA2NTY5Mjk1Mn0.iNNDFJzFlkMfdBLt-V64iC0gfDdL2v5xzG8l1JtRb8I';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
