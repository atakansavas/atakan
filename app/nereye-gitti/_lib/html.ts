// Tiny HTML templating for the Nereye Gitti pages.
//
// These pages are served by route handlers as complete, JS-free documents so
// that nothing from the site's root layout (ElevenLabs widget, site-wide
// canonical/og tags, fonts) leaks into them. Interpolated values are escaped
// unless they are themselves `html` fragments.

export class Html {
  constructor(readonly value: string) {}
  toString() {
    return this.value;
  }
}

type Part = Html | string | number | false | null | undefined | readonly Part[];

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

export const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ESCAPES[c]);

const render = (part: Part): string => {
  if (part instanceof Html) return part.value;
  if (Array.isArray(part)) return part.map(render).join("");
  if (part === false || part === null || part === undefined) return "";
  return escapeHtml(String(part));
};

export function html(strings: TemplateStringsArray, ...values: Part[]): Html {
  let out = strings[0];
  values.forEach((value, i) => {
    out += render(value) + strings[i + 1];
  });
  return new Html(out);
}

/** Trusted markup (e.g. our own stylesheet) inserted verbatim. */
export const raw = (s: string) => new Html(s);

export function htmlResponse(doc: Html): Response {
  return new Response(doc.value, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Short, so a policy edit reaches readers right after a deploy.
      // no-transform: Cloudflare must not rewrite these pages — it would
      // otherwise inject its Web Analytics beacon (a third-party script) and
      // obfuscate the support e-mail address behind a decoder script.
      "cache-control": "public, max-age=0, s-maxage=300, must-revalidate, no-transform",
    },
  });
}
