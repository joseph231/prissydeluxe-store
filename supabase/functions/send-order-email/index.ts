// supabase/functions/send-order-email/index.ts

export const config = {
  auth: { mode: "optional" }
};

/// <reference lib="deno.ns" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "prissydeluxe@gmail.com";
const FROM_EMAIL = "Prissy Deluxe <orders@prissydeluxe.com>";

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is missing in Edge Function secrets");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";

    /* ===============================
       JSON ORDER (CARD / WHATSAPP)
    =============================== */
    if (contentType.includes("application/json")) {
      const body = await req.json();

      const items = body.items
        ?.map((i: any) => `${i.name} × ${i.qty}`)
        .join(", ") ?? "N/A";

      const html = `
        <h2>New Order</h2>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Items:</strong> ${items}</p>
        <p><strong>Total:</strong> ₦${body.total}</p>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: "New Order Received",
          html,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Resend error:", result);
        return new Response(JSON.stringify(result), {
          status: 500,
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: corsHeaders,
      });
    }

    /* ===============================
       BANK TRANSFER (WITH RECEIPT)
    =============================== */
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      const email = form.get("email")?.toString() ?? "";
      const items = form.get("items")?.toString() ?? "";
      const total = form.get("total")?.toString() ?? "";
      const receipt = form.get("receipt") as File | null;

      const html = `
        <h2>Bank Transfer Order</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Items:</strong> ${items}</p>
        <p><strong>Total:</strong> ₦${total}</p>
        <p>Receipt attached.</p>
      `;

      const payload: any = {
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: "Bank Transfer Order",
        html,
      };

      if (receipt) {
        const buffer = await receipt.arrayBuffer();
        payload.attachments = [{
          filename: receipt.name,
          content: btoa(String.fromCharCode(...new Uint8Array(buffer))),
        }];
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Resend error:", result);
        return new Response(JSON.stringify(result), {
          status: 500,
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: corsHeaders,
      });
    }

    return new Response("Unsupported request", { status: 400 });

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
