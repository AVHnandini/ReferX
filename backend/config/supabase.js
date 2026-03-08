import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl =
  process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY || "placeholder_key";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "placeholder_key";

// Log basic env status to help debug “Invalid API key” issues.
console.log("→ Supabase URL:", supabaseUrl);
console.log(
  "→ Supabase Service Key:",
  supabaseServiceKey ? `set (${supabaseServiceKey.length} chars)` : "missing",
);
console.log(
  "→ Supabase Anon Key:",
  supabaseAnonKey ? `set (${supabaseAnonKey.length} chars)` : "missing",
);

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Validate Supabase configuration early to help diagnose "Invalid API key" issues.
(async function validateSupabaseConnection() {
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) {
      console.error("❌ Supabase connection test failed:", error.message);
      if (error.message?.includes("Invalid API key")) {
        console.error(
          "➡️  Invalid API key detected; ensure SUPABASE_SERVICE_KEY in backend/.env is the Service Role key from your Supabase project.",
        );
      }
    } else {
      console.log("✅ Supabase connection OK (query succeeded).");
    }
  } catch (err) {
    console.error("❌ Supabase connection attempt threw an error:", err);
  }
})();
