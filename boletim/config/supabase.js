const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Use a anon key ou a service_role dependendo da segurança

if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️ ATENÇÃO: SUPABASE_URL ou SUPABASE_KEY não foram definidos nas variáveis de ambiente!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;