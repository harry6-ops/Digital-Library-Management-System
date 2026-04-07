const SUPABASE_URL = "https://upadhfzyeluusknpztbi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwYWRoZnp5ZWx1dXNrbnB6dGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MDg0NDYsImV4cCI6MjA4NzQ4NDQ0Nn0.cJKKpE4tnWZW9wibu9BkwoVSN3O5h2gsIXUpCdhMZ6g";

if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.warn('Supabase CDN not loaded yet — supabaseClient unavailable');
}
