/**
 * Cloudflare Pages middleware — apex → www 301 redirect.
 * Si la request entra sin www, redirige a www.dominio.com manteniendo path y query.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  // Ficheros internos del repositorio: la raíz del repo es la de la web, así que
  // README, docs, código fuente, configuración y carpetas ocultas responden 404.
  {
    let __ruta = url.pathname;
    try { __ruta = decodeURIComponent(__ruta); } catch (e) {}
    if (
      /(^|\/)\.(?!well-known(\/|$))[^/]+/.test(__ruta) ||
      /^\/(docs|src|scripts|public|functions|node_modules|contenido|_contenido)(\/|$)/i.test(__ruta) ||
      /\.(md|markdown|py|ts|tsx|astro|sh|toml|jsonc|ya?ml|lock|sql|log|bak|php)$/i.test(__ruta) ||
      /^\/(readme|changelog|license)[^/]*$/i.test(__ruta) ||
      /^\/(package(-lock)?|tsconfig|composer)\.json$/i.test(__ruta) ||
      /^\/(wrangler|astro\.config|vite\.config|tailwind\.config|postcss\.config)\.[^/]+$/i.test(__ruta)
    ) {
      let __cuerpo = "Not found";
      try {
        let __nf = await context.env.ASSETS.fetch(new URL("/404.html", url));
        const __loc = __nf.headers.get("location");
        if (__nf.status >= 300 && __nf.status < 400 && __loc) __nf = await context.env.ASSETS.fetch(new URL(__loc, url));
        if (__nf.ok) __cuerpo = await __nf.text();
      } catch (e) {}
      return new Response(__cuerpo, {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex", "cache-control": "no-store" },
      });
    }
  }
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
