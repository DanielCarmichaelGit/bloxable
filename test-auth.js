// Test authentication flow
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nzbbzzenziwwxoiisjoz.supabase.co";
const supabaseKey = "sb_publishable_pXQbw4-W9-JNpB0jbtfyxA_GVkmycmU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log("🧪 Testing Authentication Flow...\n");

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

  // Test 2: Check user_profiles table
  console.log("\n2️⃣ Checking user_profiles table...");
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*")
    .limit(5);

  if (profilesError) {
    console.error("❌ Profiles error:", profilesError);
  } else {
    console.log(
      "✅ Profiles accessible:",
      profiles?.length || 0,
      "profiles found"
    );
  }

  // Test 3: Test RPC functions
  console.log("\n3️⃣ Testing RPC functions...");

  // Test create_user_profile (if we have a test user)
  if (session?.user) {
    console.log("Testing create_user_profile...");
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_user_profile",
      {
        user_uuid: session.user.id,
        profile_type: "buyer",
        full_name: "Test User",
        additional_data: {},
      }
    );

    if (rpcError) {
      console.error("❌ RPC create_user_profile error:", rpcError);
    } else {
      console.log("✅ RPC create_user_profile success:", rpcData);
    }
  } else {
    console.log("ℹ️ No user session, skipping RPC test");
  }

  // Test 4: Test direct insert (fallback)
  console.log("\n4️⃣ Testing direct insert fallback...");
  if (session?.user) {
    const { data: insertData, error: insertError } = await supabase
      .from("user_profiles")
      .insert({
        user_id: session.user.id,
        profile_type: "seller",
        full_name: "Test Seller",
        preferences: {},
        is_active: true,
      })
      .select();

    if (insertError) {
      console.error("❌ Direct insert error:", insertError);
    } else {
      console.log("✅ Direct insert success:", insertData);
    }
  } else {
    console.log("ℹ️ No user session, skipping insert test");
  }

  console.log("\n🏁 Authentication test complete!");
}

testAuth().catch(console.error);
