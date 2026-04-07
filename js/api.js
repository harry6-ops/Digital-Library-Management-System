const SUPABASE_URL = "https://upadhfzyeluusknpztbi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwYWRoZnp5ZWx1dXNrbnB6dGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MDg0NDYsImV4cCI6MjA4NzQ4NDQ0Nn0.cJKKpE4tnWZW9wibu9BkwoVSN3O5h2gsIXUpCdhMZ6g";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
window.supabaseClient = supabaseClient;

class ApiService {

    // ---------------- LOGIN ----------------
    async login(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    // ---------------- BOOKS ----------------
    async getBooks(category = 'all', search = '', page = 1) {
        let query = supabaseClient.from("books").select("*");

        if (category !== "all")
            query = query.eq("category", category);

        if (search)
            query = query.ilike("title", `%${search}%`);

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async getBook(id) {
        const { data, error } = await supabaseClient
            .from("books")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    }

    // ---------------- DASHBOARD ----------------
    async getDashboardStats() {
        // Use try/catch per query — Supabase returns PostgrestBuilder, not a native Promise,
        // so .catch() doesn't work. Missing tables fall back to empty arrays silently.
        let books   = [], users   = [], borrows = [];

        try { const { data } = await supabaseClient.from("books").select("*");   books   = data || []; } catch (_) {}
        try { const { data } = await supabaseClient.from("users").select("*");   users   = data || []; } catch (_) {}
        try { const { data } = await supabaseClient.from("borrows").select("*"); borrows = data || []; } catch (_) {}

        return {
            stats: {
                totalBooks:      books.length,
                activeUsers:     users.length,
                pendingRequests: borrows.filter(b => b.status === "pending").length
            },
            recentBooks: books.slice(0, 5)
        };
    }

    // ---------------- BORROW ----------------
    async borrowBook(userId, bookId) {
        const { data, error } = await supabaseClient
            .from("borrows")
            .insert([{ user_id: userId, book_id: bookId, status: "pending" }]);

        if (error) throw error;
        return data;
    }

    async returnBook(borrowId) {
        const { data, error } = await supabaseClient
            .from("borrows")
            .update({ status: "returned" })
            .eq("id", borrowId);

        if (error) throw error;
        return data;
    }

    // ---------------- MEMBERSHIP ----------------
    async updateMembership(userId, plan) {
        const { data, error } = await supabaseClient
            .from("users")
            .update({ membership_plan: plan })
            .eq("id", userId);

        if (error) throw error;
        return data;
    }

    async getPaymentHistory(userId) {
        const { data, error } = await supabaseClient
            .from("payments")
            .select("*")
            .eq("user_id", userId);

        if (error) throw error;
        return data;
    }
}

window.apiService = new ApiService();