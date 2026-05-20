const { createClient } = require("@supabase/supabase-js");

// Langsung masukkan datamu di sini tanpa lewat process.env
const supabaseUrl = "https://xedmzxaytjnfcnhnxumj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZG16eGF5dGpuZmNuaG54dW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkwNzg3NCwiZXhwIjoyMDkzNDgzODc0fQ.wOpOC3ZkXB1ioyGJoCpxZX1cL3iMkFkMth6qSPJQZzc";

console.log("✅ Berhasil membaca variabel Supabase secara langsung!");

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Berhasil inisialisasi koneksi Supabase!');

module.exports = supabase;