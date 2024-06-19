import type { APIRoute } from "astro";

const robotsTXT = `
User-agent: *
Allow: /

Sitemap: ${new URL("sitemap-index.xml", import.meta.env.SITE).href}
`.trim()

export const GET: APIRoute = () => {
  return new Response(robotsTXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  })
}