// supabase/functions/resend-confirmation/index.ts
import { supabase } from "../utils/supabase.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";
import { handleCORS } from "../utils/cors.ts";

export const config = {
  auth: false, // Disable JWT, we'll handle auth via the hook or other logic
};

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

    // TODO: send the link via your transactional email provider
    // Example: using Postmark / SendGrid / Resend
    // const link = data.properties?.action_link;

    return createSuccessResponse({
      success: true,
      message: "Confirmation link generated. Send it via your email provider.",
      link: data.properties?.action_link // optional: remove for production
    }, req);

  } catch (err) {
    console.error("Edge function error:", err);
    return createErrorResponse("Internal Server Error", req, 500);
  }
});
