import { htmlResponse } from "../_lib/html";
import { renderDestek } from "../_lib/pages/destek";

// Plain, JS-free HTML rendered at build time (see _lib/html.ts for why this
// is a route handler rather than a page). HEAD is derived from GET.
export const dynamic = "force-static";

export function GET() {
  return htmlResponse(renderDestek());
}
