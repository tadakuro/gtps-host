/**
 * LEGACY — required only by very old @cloudflare/next-on-pages (<= 1.1.x).
 *
 * - This repo deploys with @opennextjs/cloudflare (OpenNext), which does NOT
 *   use this file. With OpenNext keep `wrangler.jsonc` as-is and DELETE this
 *   `functions/` directory, otherwise Cloudflare Pages throws:
 *   "Cannot combine a `main` entrypoint in wrangler.jsonc with a functions
 *   directory."
 * - Modern @cloudflare/next-on-pages (>= 1.6) dropped `handleRequest` — it
 *   builds a complete worker at `.vercel/output/static/_worker.js` and also
 *   does not need this file. `getRequestContext` remains exported for the
 *   edge runtime utilities used by routes.
 */
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async (request: Request) => {
  getRequestContext();
  return request;
};