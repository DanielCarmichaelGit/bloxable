import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("AuthCallback: Starting email confirmation process");
        console.log("Current URL:", window.location.href);
        console.log("URL search params:", window.location.search);
        console.log("URL hash:", window.location.hash);

        // Wait a moment for Supabase to process the URL
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Try to get the session first (in case it's already processed)
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        console.log("Initial session check:", sessionData, sessionError);

        if (sessionData.session) {
          console.log("Session already exists, processing immediately");
          await processSuccessfulAuth(sessionData.session);
          return;
        }

        // If no session, try to exchange the code
        console.log("No existing session, attempting code exchange...");

        // Extract code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          setError(
            "No confirmation code found in URL. Please check your email link."
          );
          setLoading(false);
          return;
        }

        console.log("Code found:", code);

        // Try exchangeCodeForSession with the full URL
        const { data: exchangeData, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(window.location.href);

        console.log("Exchange result:", exchangeData);
        console.log("Exchange error:", exchangeError);

        if (exchangeError) {
          console.error("Exchange error:", exchangeError);

          // If exchange fails, try verifyOtp as fallback
          console.log("Trying verifyOtp as fallback...");
          const { data: otpData, error: otpError } =
            await supabase.auth.verifyOtp({
              token_hash: code,
              type: "signup",
            });

          console.log("OTP result:", otpData);
          console.log("OTP error:", otpError);

          if (otpError) {
            setError(`Authentication error: ${otpError.message}`);
            setLoading(false);
            return;
          }

          if (otpData.session) {
            await processSuccessfulAuth(otpData.session);
            return;
          }
        } else if (exchangeData.session) {
          await processSuccessfulAuth(exchangeData.session);
          return;
        }

        // If we get here, both methods failed
        setError("Failed to confirm email. Please try signing up again.");
        setLoading(false);
      } catch (err: any) {
        console.error("Auth callback exception:", err);
        setError(err.message || "An error occurred during email confirmation");
        setLoading(false);
      }
    };

    const processSuccessfulAuth = async (session: any) => {
      try {
        console.log("Processing successful authentication");

        // Create buyer and seller profiles for the user
        console.log(
          "Creating buyer and seller profiles for user:",
          session.user.id
        );

        const { data: buyerProfile, error: buyerError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: session.user.id,
            profile_type: "buyer",
            full_name: session.user.user_metadata?.full_name,
            preferences: {},
            is_active: true,
          })
          .select()
          .single();

        if (buyerError) {
          console.error("Error creating buyer profile:", buyerError);
        } else {
          console.log("Buyer profile created successfully");
        }

        const { data: sellerProfile, error: sellerError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: session.user.id,
            profile_type: "seller",
            full_name: session.user.user_metadata?.full_name,
            company_name: "",
            is_active: false,
          })
          .select()
          .single();

        if (sellerError) {
          console.error("Error creating seller profile:", sellerError);
        } else {
          console.log("Seller profile created successfully");
        }

        // Create buyer config
        if (buyerProfile) {
          const { error: buyerConfigError } = await supabase
            .from("buyer_configs")
            .insert({
              user_id: session.user.id,
              profile_id: buyerProfile.id,
              preferences: {},
              notifications_enabled: true,
              email_notifications: true,
            });

          if (buyerConfigError) {
            console.error("Error creating buyer config:", buyerConfigError);
          } else {
            console.log("Buyer config created successfully");
          }
        }

        // Create seller config and seller page
        if (sellerProfile) {
          const { error: sellerConfigError } = await supabase
            .from("seller_configs")
            .insert({
              user_id: session.user.id,
              profile_id: sellerProfile.id,
              preferences: {},
              notifications_enabled: true,
              email_notifications: true,
            });

          if (sellerConfigError) {
            console.error("Error creating seller config:", sellerConfigError);
          } else {
            console.log("Seller config created successfully");
          }

          const { error: sellerPageError } = await supabase
            .from("seller_pages")
            .insert({
              user_id: session.user.id,
              profile_id: sellerProfile.id,
              page_title: `${
                session.user.user_metadata?.full_name || "Seller"
              }'s Store`,
              page_description: "Welcome to my store!",
              is_published: false,
            });

          if (sellerPageError) {
            console.error("Error creating seller page:", sellerPageError);
          } else {
            console.log("Seller page created successfully");
          }
        }

        // Handle account switching based on localStorage
        console.log("AuthCallback: Handling account switching...");

        // Check localStorage for last account type
        const lastAccountType = localStorage.getItem("lastAccountType");
        console.log(
          "AuthCallback: Last account type from localStorage:",
          lastAccountType
        );

        // Determine which account type to switch to
        let targetAccountType = "buyer"; // Default to buyer for fresh accounts

        if (
          lastAccountType &&
          (lastAccountType === "buyer" || lastAccountType === "seller")
        ) {
          targetAccountType = lastAccountType;
        }

        console.log(
          "AuthCallback: Switching user to account type:",
          targetAccountType
        );

        // Switch the user to the target account type
        const { error: switchError } = await supabase.rpc(
          "switch_user_profile",
          {
            user_uuid: session.user.id,
            new_profile_type: targetAccountType,
          }
        );

        if (switchError) {
          console.error(
            "AuthCallback: Error switching user profile:",
            switchError
          );
        } else {
          console.log(
            "AuthCallback: Successfully switched user to:",
            targetAccountType
          );
          // Update localStorage to persist the choice
          localStorage.setItem("lastAccountType", targetAccountType);
        }

        // Check URL params to determine redirect destination
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const redirectTo =
          urlParams.get("redirect") ||
          hashParams.get("redirect") ||
          "/dashboard";

        console.log("AuthCallback: Redirecting to:", redirectTo);
        console.log("AuthCallback: Current URL:", window.location.href);
        console.log("AuthCallback: Search params:", window.location.search);
        console.log("AuthCallback: Hash params:", window.location.hash);

        // Small delay to ensure auth state is updated
        setTimeout(() => {
          console.log("AuthCallback: Executing redirect to:", redirectTo);
          navigate(redirectTo);
        }, 1000);
      } catch (error) {
        console.error("Error processing successful auth:", error);
        setError("Error processing authentication. Please try again.");
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Confirming your email...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we verify your email address.
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>If this takes too long, please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Email Confirmation Failed
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
