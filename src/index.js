/**
 * Ranklytics Cloudflare Worker
 * Handles API routes, static assets, and dynamic edge processing.
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Simple API route example for forms (implement later)
        if (url.pathname.startsWith("/api/")) {
            if (url.pathname === "/api/contact" && request.method === "POST") {
                // Handle contact form submission
                return new Response(JSON.stringify({ success: true, message: "Message received." }), {
                    headers: { "Content-Type": "application/json" },
                });
            }
            return new Response("Not found", { status: 404 });
        }

        // By default, serve static assets configured in wrangler.jsonc
        // Return standard response fallback or pass through
        // For Workers with "assets", the assets are fetched before invoking this handler for GET requests
        // that match a file, unless invoked directly.
        return env.ASSETS.fetch(request);
    },
};
