# Subtext

A live demonstration built for BUSGEN 116. Five intake questions. One story. Every reader gets a different version.

The thesis: what is the minimum data required to produce the sensation of recognition — not accuracy, recognition?

See `DESIGN.md` for the full rationale.

---

## Local development

```bash
npm install
npm run dev     # runs on localhost:3001
```

### Required environment variables

Create `.env.local` in the project root:

```
OPENROUTER_API_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

- **OpenRouter** — get a key at openrouter.ai. The app uses `claude-opus-4.7` for generation and `claude-haiku-4.5` for validation.
- **Upstash** — create a free Redis database at upstash.com. Copy the REST URL and REST Token from the dashboard. Without these, eval submissions fall back to an in-memory store (lost on restart).

---

## Deploy

```bash
vercel --prod
```

Set the same four env vars in the Vercel dashboard or via CLI:

```bash
echo "..." | vercel env add OPENROUTER_API_KEY production
echo "..." | vercel env add UPSTASH_REDIS_REST_URL production
echo "..." | vercel env add UPSTASH_REDIS_REST_TOKEN production
echo "https://your-url.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production
```

Then redeploy to pick up the env vars.

---

## URLs

| Path | Purpose |
|------|---------|
| `/` | Reader experience — landing, intake, story |
| `/reveal` | Instructor view — aggregate, cards, compare |

---

## How it works

**Generation** — reader intake answers enter the story through two channels:
- *Sensory layer*: ambient sound, nearest object, time of day, where they're going — embedded in the scene without announcement
- *Psychological layer*: presence (here vs. somewhere else) and phone position calibrate the character's emotional register

**Architecture** — news streams to the left column immediately while the personal story buffers and validates in parallel. A Haiku validator checks for five failure modes; if it fails, the story is regenerated once before displaying.

**Eval** — after reading, "did this know you?" is collected with an optional note. Submissions persist in Upstash Redis. The `/reveal` page shows a live aggregate and allows the instructor to select two stories for side-by-side comparison.

**Reader identity** — each visitor is assigned a random word (e.g. *ember*, *tarn*, *wisp*) on first load, stored in localStorage, shown dimly in the corner of their story screen. This word appears on their card in `/reveal` so they can find themselves and so the instructor can refer to them by name during discussion.
