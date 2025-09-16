// Test email confirmation URL format
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nzbbzzenziwwxoiisjoz.supabase.co";
const supabaseKey = "sb_publishable_pXQbw4-W9-JNpB0jbtfyxA_GVkmycmU";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // No PKCE for email confirmations
  },
});

async function testEmailConfirmation() {
  console.log("🧪 Testing Email Confirmation URL Format...\n");

  // Test 1: Check current session
  console.log("1️⃣ Checking current session...");
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("❌ Session error:", sessionError);
  } else if (session) {
    console.log("✅ Current session:", session.user.email);
  } else {
    console.log("ℹ️ No current session");
  }

  // Test 2: Test signup with email redirect
  console.log("\n2️⃣ Testing signup with email redirect...");
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "testpassword123";

  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      emailRedirectTo: "http://localhost:5174/auth/callback",
    },
  });

  if (signupError) {
    console.error("❌ Signup error:", signupError);
  } else {
    console.log("✅ Signup successful:", signupData);
    console.log("📧 Check your email for confirmation link");
    console.log(
      "🔗 The confirmation link should redirect to: http://localhost:5174/auth/callback"
    );
  }

  // Test 3: Test code exchange (if we have a code)
  console.log("\n3️⃣ Testing code exchange...");
  console.log(
    "ℹ️ To test code exchange, copy the confirmation link from your email"
  );
  console.log("ℹ️ and run: node test-email-confirmation.js <confirmation-url>");

  const confirmationUrl = process.argv[2];
  if (confirmationUrl) {
    console.log("🔗 Testing with URL:", confirmationUrl);

    try {
      const { data: exchangeData, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(confirmationUrl);

      if (exchangeError) {
        console.error("❌ Exchange error:", exchangeError);
      } else {
        console.log("✅ Exchange successful:", exchangeData);
      }
    } catch (error) {
      console.error("❌ Exchange exception:", error);
    }
  }
}

testEmailConfirmation().catch(console.error);
