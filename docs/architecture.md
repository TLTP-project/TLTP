# TLTP Architecture

## Runtime boundaries

```text
Public browser
  ├─ reads filtered public posts through SvelteKit server-rendered pages/API
  ├─ cannot read submissions_private, raw_text, IP hashes or admin audit data
  └─ sends submissions/reports through server endpoints

SvelteKit server
  ├─ resolves Better Auth session and profile role
  ├─ validates payload, quota, role and Turnstile
  ├─ redacts PII and locks any canonical teacher target with [[TARGET_TEACHER]]
  ├─ calls GPT-5.6 Luna once with Structured Output
  ├─ publishes public_text or drops the item when decision = nothing
  └─ keeps Neon and OpenAI credentials server-side

Neon PostgreSQL
  ├─ Better Auth: user, session, account and verification
  ├─ public data: filtered posts and active teacher directory
  └─ private data: raw submissions, account references, rate limits and audit rows
```

## Module rules

- `src/routes`: SvelteKit page composition, server loads and HTTP endpoints; keep long business logic in features/repositories.
- `src/lib/components`: presentational Svelte components; they do not call Neon directly.
- `src/features`: domain use cases (`ai`, `auth`, `submissions`, `reports`, `moderation`).
- `src/lib/server`: Better Auth, Neon/Drizzle schema and server-only repositories.
- `src/lib`: OpenAI, privacy, security and configuration adapters.
- `drizzle/`: generated, reviewed Neon migrations and seed SQL. Every schema change needs a migration review.

## Submission flow

1. The user signs in with GitHub/Google and chooses a role.
2. The server checks session, quota, authorization, length and anti-bot controls.
3. One request sends the role, anonymous target contract and content to Luna.
4. `decision = publish`: write `public_text` to `posts_public`, generate an alias and publish immediately.
5. `decision = nothing`: create no public post; record an internal moderation status.
6. The sender can soft-delete the public post from “Bài của tôi”.

Never place unprocessed raw text on a public page. Never call the model from the browser client. Lenis is the only motion runtime; there is no GSAP or 3D scene.
