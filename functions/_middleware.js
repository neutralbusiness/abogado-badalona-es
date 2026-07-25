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
  return new HTMLRewriter()
    .on("head", { element(e) {
      e.append('<script>(function(){try{var c=null;try{c=JSON.parse(localStorage.getItem("nb_consent")||"null");}catch(e){}var g=c&&c.analytics?"granted":"denied";window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};gtag("consent","default",{analytics_storage:g,ad_storage:g,ad_user_data:g,ad_personalization:g,wait_for_update:500});}catch(e){}})();</script>', { html: true });
      e.append('<script async src="https://panel.neutralb.es/track.js"></script>', { html: true });
      e.append('<script defer src="https://panel.neutralb.es/consent.js"></script>', { html: true });
      e.append(`<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-5TQQB9H3');</script>`, { html: true });
    } })
    .on("body", { element(e) {
      e.prepend(`<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5TQQB9H3" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`, { html: true });
    } })
    .transform(__r);
}
