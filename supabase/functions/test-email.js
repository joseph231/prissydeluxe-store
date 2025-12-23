export async function handler() {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "RESEND_API_KEY missing" }),
        };
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "orders@prissydeluxe.store",
                to: ["your-email@gmail.com"],
                subject: "Resend test – Netlify Function",
                html: "<strong>Email system verified.</strong>",
            }),
        });

        const data = await response.json();

        return {
            statusCode: response.status,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
