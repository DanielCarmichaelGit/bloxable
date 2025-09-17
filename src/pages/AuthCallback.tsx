import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepLabel, setCurrentStepLabel] = useState("Initializing...");
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  // single-run guard (state isn't safe inside async callbacks due to stale closures)
  const processedRef = useRef(false);

  const setStep = (label: string) => setCurrentStepLabel(label);
  const setPct = (step: number, total: number) =>
    setProgress(Math.round((step / total) * 100));

  // Wait for Supabase to hydrate the session from the URL hash (#access_token=...)
  const waitForSessionUser = async (): Promise<import("@supabase/supabase-js").User> => {
    // 1) immediate check
    let { data } = await supabase.auth.getSession();
    if (data.session?.user) return data.session.user;

    // 2) tiny delay then retry (lets GoTrue parse the hash)
    await new Promise((r) => setTimeout(r, 400));
    ({ data } = await supabase.auth.getSession());
    if (data.session?.user) return data.session.user;

    // 3) single-shot listener with timeout
    return await new Promise((resolve, reject) => {
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
          sub.subscription.unsubscribe();
          resolve(session.user);
        }
      });
      const t = setTimeout(async () => {
        sub.subscription.unsubscribe();
        const { data: last } = await supabase.auth.getSession();
        if (last.session?.user) resolve(last.session.user);
        else reject(new Error("No session after email confirmation."));
      }, 7000);
    });
  };

  const runSetup = async () => {
    if (processedRef.current) return;
    processedRef.current = true;

    try {
      // 0) AUTH FIRST — do nothing else until we have a signed-in user
      const user = await waitForSessionUser();
      console.log("✅ Authenticated user:", user.id);

      const total = 5;
      let step = 0;

      // 1) Buyer profile
      step++; setStep("Creating buyer profile..."); setPct(step, total);
      const { data: buyerProfile, error: buyerErr } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          profile_type: "buyer",
          full_name: user.user_metadata?.full_name || "User",
          is_active: true,
        })
        .select()
        .single();
      if (buyerErr) throw new Error(`Buyer profile: ${buyerErr.message}`);
      console.log("✅ Buyer profile:", buyerProfile);

      // 2) Seller profile
      step++; setStep("Creating seller profile..."); setPct(step, total);
      const { data: sellerProfile, error: sellerErr } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          profile_type: "seller",
          full_name: user.user_metadata?.full_name || "User",
          company_name: "",
          is_active: false,
        })
        .select()
        .single();
      if (sellerErr) throw new Error(`Seller profile: ${sellerErr.message}`);
      console.log("✅ Seller profile:", sellerProfile);

      // 3) Buyer config
      step++; setStep("Setting up buyer preferences..."); setPct(step, total);
      const { error: buyerCfgErr } = await supabase
        .from("buyer_configs")
        .insert({
          user_id: user.id,
          profile_id: buyerProfile.id,
          preferences: {},
          notifications_enabled: true,
          email_notifications: true,
        });
      if (buyerCfgErr) throw new Error(`Buyer config: ${buyerCfgErr.message}`);
      console.log("✅ Buyer config");

      // 4) Seller config
      step++; setStep("Setting up seller preferences..."); setPct(step, total);
      const { error: sellerCfgErr } = await supabase
        .from("seller_configs")
        .insert({
          user_id: user.id,
          profile_id: sellerProfile.id,
          preferences: {},
          notifications_enabled: true,
          email_notifications: true,
        });
      if (sellerCfgErr) throw new Error(`Seller config: ${sellerCfgErr.message}`);
      console.log("✅ Seller config");

      // 5) Seller page
      step++; setStep("Creating seller store page..."); setPct(step, total);
      const { error: sellerPageErr } = await supabase
        .from("seller_pages")
        .insert({
          user_id: user.id,
          profile_id: sellerProfile.id,
          page_title: `${user.user_metadata?.full_name || "Seller"}'s Store`,
          page_description: "Welcome to my store!",
          is_published: false,
        });
      if (sellerPageErr) throw new Error(`Seller page: ${sellerPageErr.message}`);
      console.log("✅ Seller page");

      setStep("Setup complete!");
      setPct(total, total);
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (e) {
      console.error("❌ SETUP FAILED:", e);
      setError(e instanceof Error ? e.message : "Unknown error");
      setLoading(false);
    }
  };

  useEffect(() => {
    runSetup();
    // no deps; we guard with processedRef so Strict Mode won't double-run
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-xl font-semibold mb-2">Email Confirmation Failed</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // loading UI
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-4">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Setting up your account...
        </h2>
        <p className="text-muted-foreground mb-8">{currentStepLabel}</p>

        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          This may take a few moments. Please don't close this window.
        </p>
      </div>
    </div>
  );
}
