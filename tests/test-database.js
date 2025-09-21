// Quick test script to check if the database is set up correctly
// Run this in your browser console on the app

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nzbbzzenziwwxoiisjoz.supabase.co",
  "sb_publishable_pXQbw4-W9-JNpB0jbtfyxA_GVkmycmU"
);

async function testDatabase() {
  console.log("Testing database setup...");

  try {
    // Test 1: Check if user_profiles table exists
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(1);

    if (error) {
      console.error(
        "❌ user_profiles table does not exist or has issues:",
        error
      );
      console.log(
        "Please run the database migration from supabase-dual-auth-schema.sql"
      );
    } else {
      console.log("✅ user_profiles table exists and is accessible");
    }

    // Test 2: Check if RPC functions exist
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_user_profile",
      {
        user_uuid: "00000000-0000-0000-0000-000000000000", // dummy UUID
        profile_type: "buyer",
        full_name: "Test",
        additional_data: {},
      }
    );

    if (rpcError) {
      console.log(
        "⚠️ RPC functions not available (this is okay, fallback will be used):",
        rpcError.message
      );
    } else {
      console.log("✅ RPC functions are available");
    }
  } catch (err) {
    console.error("❌ Database test failed:", err);
  }
}

// Run the test
testDatabase();
