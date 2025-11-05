// Supabase Edge Function to send email notification when contact form is submitted
// To deploy: supabase functions deploy send-contact-notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFICATION_EMAIL =
  Deno.env.get("NOTIFICATION_EMAIL") || "info@bloxable.io";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company_name?: string;
  message: string;
  created_at: string;
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Parse the request body
    const { record } = (await req.json()) as { record: ContactSubmission };

    if (!record) {
      return new Response(
        JSON.stringify({ error: "Missing record in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send email using Resend API
    if (RESEND_API_KEY) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Bloxable Contact Form <noreply@bloxable.io>",
          to: [NOTIFICATION_EMAIL],
          subject: `New Contact Form Submission from ${record.name}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background-color: #0ea5e9; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                  .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                  .field { margin-bottom: 15px; }
                  .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
                  .field-value { color: #6b7280; }
                  .message-box { background-color: white; padding: 15px; border-left: 4px solid #0ea5e9; margin-top: 15px; }
                  .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>New Contact Form Submission</h1>
                  </div>
                  <div class="content">
                    <div class="field">
                      <div class="field-label">Name</div>
                      <div class="field-value">${record.name}</div>
                    </div>
                    <div class="field">
                      <div class="field-label">Email</div>
                      <div class="field-value"><a href="mailto:${
                        record.email
                      }">${record.email}</a></div>
                    </div>
                    ${
                      record.company_name
                        ? `
                    <div class="field">
                      <div class="field-label">Company</div>
                      <div class="field-value">${record.company_name}</div>
                    </div>
                    `
                        : ""
                    }
                    <div class="message-box">
                      <div class="field-label">Message</div>
                      <div class="field-value" style="white-space: pre-wrap;">${
                        record.message
                      }</div>
                    </div>
                    <div class="field" style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                      Submitted: ${new Date(record.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div class="footer">
                    <p>This email was sent from the Bloxable.io contact form.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("Failed to send email:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to send email notification" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const emailData = await emailResponse.json();
      console.log("Email sent successfully:", emailData);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email notification sent successfully",
          emailId: emailData.id,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } else {
      console.warn(
        "RESEND_API_KEY not configured. Email notification skipped."
      );
      return new Response(
        JSON.stringify({
          success: true,
          message:
            "Contact form submitted but email notification not configured",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
