# Pippa

Resource-mobilisation assistant for SOS Children's Villages course participants. It looks inward first (Resource Finder), then outward (Funder Check), asks before it answers, and returns a structured brief.

- **Front end:** React + Vite (`src/`)
- **API:** one Cloudflare Worker (`worker/`) that also serves the built site
- **Brain:** `worker/playbook.md`, loaded into every AI call. Edit it in plain English.
- **Data:** Cloudflare D1 (`schema.sql`): cases, saved analyses, daily usage
- **Sign-in:** Cloudflare Access (one-time PIN to invited emails) on pippa.maahigupta.workers.dev, verified again inside the Worker

## First-time setup (about 30 minutes)

You need: a GitHub account, a free Cloudflare account, an Anthropic API key, and Node 20+.

### 1. Put the code on GitHub

```bash
cd pippa
git remote add origin https://github.com/YOUR-USERNAME/pippa.git
git push -u origin main
```

Create the empty **private** repo on github.com first (no README), then run the commands above.

### 2. Install and log in to Cloudflare

```bash
npm install
npx wrangler login
```

### 3. Create the database

```bash
npx wrangler d1 create pippa-db
```

Copy the `database_id` it prints into `wrangler.jsonc`, then:

```bash
npm run db:init:remote
```

### 4. Add the Anthropic key

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

Also set a monthly spend limit in the Anthropic console.

### 5. Deploy once

```bash
npm run deploy
```

### 6. Give it an address and lock it with Access

Pippa ships with `workers_dev: false`, so it has no public address until you add one.

1. Cloudflare dashboard → Workers & Pages → **pippa** → Settings → Domains & Routes → add a custom domain (for example `pippa.yourdomain.com`). You need a domain on Cloudflare; Cloudflare Registrar sells them at cost.
2. Zero Trust → Settings → Authentication → add **One-time PIN**.
3. Zero Trust → Access → Applications → **Add application → Self-hosted**. Domain: your Pippa domain. Policy: **Allow**, with **Emails** listed one by one (the course participants). The free plan covers up to 50 users.
4. Open the application's settings and copy the **Application Audience (AUD) tag**. Your **team domain** is shown under Zero Trust → Settings → Custom Pages (looks like `https://yourteam.cloudflareaccess.com`).
5. Put both into `wrangler.jsonc` (`ACCESS_AUD`, `ACCESS_TEAM_DOMAIN`) and run `npm run deploy` again.

The Worker rejects any API call without a valid Access token, so a leaked link alone gets nobody in.

### 7. Auto-deploy from GitHub (optional, recommended)

Workers & Pages → pippa → Settings → Builds → connect the GitHub repo. Build command `npm run build`, deploy command `npx wrangler deploy`. Every push to `main` then goes live.

## Adding or removing participants

Zero Trust → Access → Applications → Pippa → edit the policy → add or remove emails. Nothing in the code changes.

## Local development

```bash
cp .dev.vars.example .dev.vars   # then fill in your key
npm run db:init:local
npm run build && npx wrangler dev   # http://localhost:8787
```

`DEV_EMAIL` in `.dev.vars` skips Access locally. It must never be set in production.

## Settings (`wrangler.jsonc` → `vars`)

| Name | What it does |
| --- | --- |
| `MODEL` | Claude model used for analyses |
| `DAILY_RUN_LIMIT` | Pippa calls per person per day (questions + analysis each count) |
| `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` | From Cloudflare Access, step 6 |
| `ADMIN_EMAILS` | Comma-separated; reserved for an admin view |

## How an analysis works

1. The browser reads files: PDFs and images go to the model as-is (it reads scans and tables), Word and Excel are converted to text in the browser.
2. `POST /api/clarify`: Pippa says what each document looks like and asks up to four questions.
3. `POST /api/analyze`: the answers are added, and the model returns structured JSON (forced tool call), which the front end renders as cards. The run is saved to D1.

## Editing Pippa's thinking

Change `worker/playbook.md` and deploy. Keep it under about 5,000 words. The output shape lives in `worker/prompts.ts` (the tool schemas) and `shared/types.ts`; change them together.
