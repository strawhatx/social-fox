// supabase/functions/resend-confirmation/index.ts
import { supabase } from "../utils/supabase.ts";

export const config = {
  auth: false, // Disable JWT, we'll handle auth via the hook or other logic
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.json();
    const email = body.email as string;

    if (!email) {
      return new Response("Email is required", { status: 400 });
    }

    // Generate new signup confirmation link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
    });

    if (error) {
      console.error("Error generating confirmation link:", error);
      return new Response("Failed to generate confirmation link", { status: 500 });
    }

    // TODO: send the link via your transactional email provider
    // Example: using Postmark / SendGrid / Resend
    // const link = data.properties?.action_link;

    return new Response(JSON.stringify({
      success: true,
      message: "Confirmation link generated. Send it via your email provider.",
      link: data.properties?.action_link // optional: remove for production
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
