import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthTest() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session...");

        // First try to exchange code for session if there's a code in the URL
        if (
          window.location.search.includes("code=") ||
          window.location.hash.includes("code=")
        ) {
          console.log("Code found in URL, attempting exchange...");
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(window.location.href);
          console.log("Exchange result:", exchangeData);
          console.log("Exchange error:", exchangeError);

          if (exchangeError) {
            setError(`Exchange error: ${exchangeError.message}`);
          } else if (exchangeData.session) {
            setSession(exchangeData.session);
            setLoading(false);
            return;
          }
        }

        // Fallback to regular session check
        const { data, error } = await supabase.auth.getSession();
        console.log("Session data:", data);
        console.log("Session error:", error);

        if (error) {
          setError(error.message);
        } else {
          setSession(data.session);
        }
      } catch (err: any) {
        console.error("Error checking session:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Current URL:</h2>
          <p className="text-sm text-gray-600">{window.location.href}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">URL Search Params:</h2>
          <p className="text-sm text-gray-600">{window.location.search}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">URL Hash:</h2>
          <p className="text-sm text-gray-600">{window.location.hash}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Session:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Error:</h2>
          <p className="text-sm text-red-600">{error || "None"}</p>
        </div>
      </div>
    </div>
  );
}
