// supabase/functions/send-order-email/index.ts

/// <reference lib="deno.ns" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * Edge Function configuration
 * - auth optional: allows anon/public calls
 */
export const config = {
  auth: {
    mode: "optional",
  },
};

/**
 * REQUIRED ENVIRONMENT VARIABLES
 * These must be set in:
 * Supabase Dashboard → Edge Functions → Secrets
 */
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is missing in Supabase Edge Function secrets");
}

/**
 * EMAIL CONFIGURATION
 * Domain MUST be verified in Resend
 */
const ADMIN_EMAIL = "prissydeluxe@gmail.com";
const FROM_EMAIL = "Prissy Deluxe <orders@prissydeluxe.store>";

/**
 * CORS HEADERS
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";

    /* =====================================================
       JSON ORDER (CARD / WHATSAPP / NORMAL CHECKOUT)
    ===================================================== */
    if (contentType.includes("application/json")) {
      const body = await req.json();

      const items =
        body?.items?.map((i: any) => `${i.name} × ${i.qty}`).join(", ") ??
        "N/A";

      const html = `
        <h2>New Order Received</h2>
        <p><strong>Customer Email:</strong> ${body.email ?? "N/A"}</p>
        <p><strong>Items:</strong> ${items}</p>
        <p><strong>Total:</strong> ₦${body.total ?? "0"}</p>
      `;

      const resendResponse = await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: "🛒 New Order Received",
            html,
          }),
        }
      );

      const resendResult = await resendResponse.json();

      if (!resendResponse.ok) {
        console.error("Resend API Error:", resendResult);
        return new Response(JSON.stringify(resendResult), {
          status: 500,
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify(resendResult), {
        status: 200,
        headers: corsHeaders,
      });
    }

    /* =====================================================
       BANK TRANSFER (MULTIPART + RECEIPT)
    ===================================================== */
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      const email = form.get("email")?.toString() ?? "N/A";
      const items = form.get("items")?.toString() ?? "N/A";
      const total = form.get("total")?.toString() ?? "0";
      const receipt = form.get("receipt") as File | null;

      const html = `
        <h2>Bank Transfer Order</h2>
        <p><strong>Customer Email:</strong> ${email}</p>
        <p><strong>Items:</strong> ${items}</p>
        <p><strong>Total:</strong> ₦${total}</p>
        <p>Receipt attached.</p>
      `;

      const payload: any = {
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: "🏦 Bank Transfer Order",
        html,
      };

      if (receipt) {
        const buffer = await receipt.arrayBuffer();
        payload.attachments = [
          {
            filename: receipt.name,
            content: btoa(
              String.fromCharCode(...new Uint8Array(buffer))
            ),
          },
        ];
      }

      const resendResponse = await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const resendResult = await resendResponse.json();

      if (!resendResponse.ok) {
        console.error("Resend API Error:", resendResult);
        return new Response(JSON.stringify(resendResult), {
          status: 500,
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify(resendResult), {
        status: 200,
        headers: corsHeaders,
      });
    }

    return new Response("Unsupported request", {
      status: 400,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("Edge Function Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
