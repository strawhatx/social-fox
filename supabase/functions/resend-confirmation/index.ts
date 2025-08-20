// supabase/functions/resend-confirmation/index.ts
import { supabase } from "../utils/supabase.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { Resend } from "npm:resend"; // Make sure Resend is installed

export const config = {
  auth: false,
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY")); // Add your API key to env

const createErrorResponse = (message: string, req: Request, status = 400) => {
  return new Response(
    JSON.stringify({ error: message }),
    { headers: handleReturnCORS(req), status }
  );
};

const createSuccessResponse = (data: unknown, req: Request) => {
  return new Response(
    JSON.stringify(data),
    { headers: handleReturnCORS(req), status: 200 }
  );
};

Deno.serve(async (req: Request) => {
  const rateLimitResponse = await applyRateLimit(req, 'resend-confirmation');
  if (rateLimitResponse) return rateLimitResponse;

  const cors = handleCORS(req);
  if (cors) return cors;

  try {
    if (req.method !== "POST") {
      return createErrorResponse("Method not allowed", req, 405);
    }

    const body = await req.json();
    const email = body.email as string;

    if (!email) {
      return createErrorResponse("Email is required", req, 400);
    }

    // Generate new signup confirmation link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
    });

    if (error) {
      console.error("Error generating confirmation link:", error);
      return createErrorResponse("Failed to generate confirmation link", req, 500);
    }

    const link = data.properties?.action_link;
    if (!link) {
      return createErrorResponse("No confirmation link returned", req, 500);
    }

    // Send confirmation email via Resend
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "Support <support@socialfox.dev>",
      to: [email],
      subject: "Confirm your Social Fox account",
      html: `
        <p>Hi there,</p>
        <p>Please confirm your email by clicking the link below:</p>
        <a href="${link}">Confirm Email</a>
        <p>Thanks!</p>
      `,
    });

    if (sendError) {
      console.error("Error sending confirmation email:", sendError);
      return createErrorResponse("Failed to send confirmation email", req, 500);
    }

    return createSuccessResponse({
      success: true,
      message: "Confirmation email sent successfully.",
    }, req);

  } catch (err) {
    console.error("Edge function error:", err);
    return createErrorResponse("Internal Server Error", req, 500);
  }
});
