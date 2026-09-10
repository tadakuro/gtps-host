# GTPS Host — Growtopia Private Server Host Files

A fast, dark-themed landing page that serves the `host.txt` file for a
Growtopia private server. Built with **Next.js 14 (App Router)**, **TypeScript**
and **Tailwind CSS**, deployed to **Cloudflare Pages**.

- No database. `app/data/server.json` is the single source of truth.
- Secret admin panel to edit server info.
- `/r/host.txt` and `/r/host` serve the raw host file as `text/plain`.
- Designed for Cloudflare CDN caching + Bot Fight Mode.

---

## Tech stack

| Layer        | Choice                                             |
| ------------ | -------------------------------------------------- |
| Framework    | Next.js 14 App Router + TypeScript                 |
| Styling      | Tailwind CSS                                        |
| Data         | `app/data/server.json` (no DB)                      |
| Adapter      | `@opennextjs/cloudflare` (Cloudflare's OpenNext)   |
| Runtime      | Cloudflare Pages Workers (`functions`/worker)        |

> **Note:** the original request mentioned `@cloudflare/next-on-pages`. That
> package is **deprecated** ("Please use the OpenNext adapter instead" — its
> own README) and its last release does not support the Node runtime that the
> admin `fs` writes need. This repo uses the official replacement,
> **`@opennextjs/cloudflare`**. A legacy `functions/[[...routes]].ts` entry is
> left in place only if you insist on the old adapter — see the last section.

## Project structure

```
/
├── app/
│   ├── data/server.json          ← single source of truth
│   ├── page.tsx                  ← public landing page
│   ├── layout.tsx                ← root layout (header + footer)
│   ├── globals.css
│   ├── admin/[token]/page.tsx    ← secret admin panel (404 if token wrong)
│   ├── api/server/route.ts       ← GET public server data (no secret)
│   ├── api/admin/update/route.ts ← POST update server.json (requires token)
│   ├── r/host.txt/route.ts       ← GET raw host file (text/plain)
│   └── r/host/route.ts           ← same content, extension-free
├── components/                   ← Header, Footer, StatusBadge, AdminForm, HostButtons
├── lib/
│   ├── types.ts                  ← ServerData types
│   ├── server-data.ts            ← fs read/write + bundled fallback
│   └── host-file.ts              ← builds host.txt body
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── functions/[[...routes]].ts    ← legacy next-on-pages entry (deletable)
├── wrangler.jsonc                ← Pages/worker config (nodejs_compat)
├── open-next.config.ts           ← OpenNext Cloudflare config
├── .env.example
├── next.config.js
└── README.md
```

## Local development

```bash
npm install
cp .env.example .env.local   # set ADMIN_TOKEN + NEXT_PUBLIC_SITE_URL
npm run dev
```

Open `http://localhost:3000`. The admin panel lives at
`http://localhost:3000/admin/<ADMIN_TOKEN>`.

## Environment variables

| Variable                 | Required | Description                                                            |
| ------------------------ | -------- | ---------------------------------------------------------------------- |
| `ADMIN_TOKEN`            | yes      | Secret token that guards `/admin/<token>`. Set the **same value** in the Cloudflare Pages project settings. |
| `NEXT_PUBLIC_SITE_URL`   | no       | Canonical public URL (e.g. `https://yourdomain.com`). Used as fallback for host URL display. |
| `DEPLOY_WEBHOOK_URL`     | no       | Cloudflare Pages build-hook URL. When present, a successful admin save fires it to trigger a redeploy. |

On Cloudflare Pages: `ADMIN_TOKEN` and `DEPLOY_WEBHOOK_URL` go under
**Settings → Environment variables** (make `ADMIN_TOKEN` encrypted). Build-time
`NEXT_PUBLIC_*` variables must be set under **Build configurations → Environment
variables** so they are inlined during `next build`.

## How the data flow works

`app/data/server.json` is the single source of truth.

- At **build time**, the file is bundled into the worker. Pages, route handlers
  and the admin panel all read the same normalized data via `lib/server-data.ts`.
- The admin **save** writes back to `app/data/server.json` using `fs` (works
  locally) and, if `DEPLOY_WEBHOOK_URL` is set, fires the Cloudflare build hook.
- **On Cloudflare Pages the deployed filesystem is read-only**, so a runtime
  save returns a clear error instead of falsely reporting success. There are
  two supported update paths there:

  1. **Repo / CI path (simplest):** run the site locally, edit via admin,
     commit the changed `app/data/server.json`, push → Pages auto-redepoys.
  2. **Build-hook path:** connect a `DEPLOY_WEBHOOK_URL` that points at a
     mechanism which writes the JSON (e.g. a Cloudflare Worker / GitHub Action)
     and triggers a rebuild.

> **Roadmap → live edits:** the durable upgrade is to mirror the JSON in
> **Cloudflare KV** or **D1** (`getServerData`/`writeServerData` swap their
> storage backend — drop-in).

## Deploying to Cloudflare Pages

1. **Install the adapter**

   ```bash
   npm i -D @opennextjs/cloudflare
   ```

2. **Build the worker**

   ```bash
   npm run build && npx opennextjs-cloudflare build
   ```

   (This is the `#deploy` script: adds `wrangler pages deploy .open-next`.)

3. **Connect Git → Cloudflare Pages**

   - Dashboard → Workers & Pages → **Create → Pages → Connect to Git**.
   - Production branch: `main`.
   - Build command: `npm run build` then `npx opennextjs-cloudflare build`
     (or the combined `npm run deploy` if you deploy via CI/wrangler).
   - Build output directory: `.open-next`

4. **Add environment variables** in the Pages project:

   ```
   ADMIN_TOKEN=your_secret_string
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   DEPLOY_WEBHOOK_URL=   # optional build-hook URL
   ```

5. **DNS**

   - In Cloudflare DNS, add your domain (A/AAAA for Pages) and set the **orange
     cloud (Proxied)** ON so traffic flows through Cloudflare.
   - Enable **Security → Bots → Bot Fight Mode** (free) for DDoS/bot protection.

6. **Cache `/r/host.txt`**

   - Route handler already sends
     `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`.
   - Add a **Cache Rule** (or legacy Page Rule) for
     `*yourdomain.com/r/host*`:
     - Cache level: **Cache Everything**
     - Edge TTL: 5 minutes
     - Stale while revalidate: 1 day
   - Under **Caching → Cache Reserve** you can pre-warm / long-store it.

### Verify after deploy

```bash
curl -i https://yourdomain.com/r/host.txt        # expect text/plain + Cache-Control header
curl -i https://yourdomain.com/api/server        # expect JSON, no auth needed
curl -i https://yourdomain.com/admin/wrong-token # expect 404
curl -i https://yourdomain.com/admin/YOUR_TOKEN  # expect admin form
```

## Robots & sitemap

`public/robots.txt` and `public/sitemap.xml` contain the **yourdomain.com**
placeholder for the sitemap URL. Replace it with your real domain before going
live (the sitemap `<loc>` should match your actual home URL).

## Troubleshooting

- **Admin save fails on Cloudflare** → that is expected; the FS is read-only.
  Use the repo/CI path or KV upgrade (see above).
- **`npx opennextjs-cloudflare` not found** → `npm i -D @opennextjs/cloudflare`.
- **404 on admin with correct token** → `ADMIN_TOKEN` env missing at runtime
  (check Pages env vars; local uses `.env.local`).

## Using the legacy `@cloudflare/next-on-pages` adapter

If you really want the deprecated adapter instead of OpenNext:

```bash
npm i -D @cloudflare/next-on-pages
npx @cloudflare/next-on-pages   # builds from functions/[[...routes]].ts
```

- Keep `functions/[[...routes]].ts`.
- Set Pages build command to `npx @cloudflare/next-on-pages` and build output
  directory to `.vercel/output/static`.
- This only supports the **edge runtime**, so the admin `fs` write and Node
  runtime routes will not work on Pages with this adapter.

---

Not affiliated with Ubisoft. Growtopia is a trademark of Ubisoft.