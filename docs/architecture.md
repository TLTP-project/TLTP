# TLTP Architecture

## Runtime boundaries

```text
Public browser
  ├─ reads filtered public posts through server-rendered pages/API
  ├─ cannot read submissions_private, raw_text, IP addresses or admin audit data
  └─ sends submissions/reports through server routes

Next.js server
  ├─ validates session, role, quota and Turnstile
  ├─ locks the teacher target with [[TARGET_TEACHER]]
  ├─ calls GPT-5.6 Luna once with Structured Output
  ├─ publishes public_text or drops the item when decision = nothing
  └─ keeps the service-role key server-side only

Supabase Postgres
  ├─ public tables/views: processed data
  └─ private tables: raw content, account reference, IP address, audit data
```

## Module rules

- `src/app`: route composition, page metadata and loading/error states; do not place long business logic here.
- `src/components`: presentational UI components; they do not call the database directly.
- `src/features`: domain use cases (`ai`, `submissions`, `reports`, `moderation`).
- `src/lib`: integration adapters (OpenAI, Supabase, Turnstile), config and privacy/security helpers.
- `src/server`: server actions and queries shared by routes and pages.
- `supabase/migrations`: schema, RLS policies, indexes and triggers; every database change must be a reviewed migration.

## Submission flow

1. The user signs in with Google and chooses a role and target.
2. The server checks quota, authorization, length and anti-bot controls.
3. One request sends the role, target and content to Luna.
4. `decision = publish`: write `public_text` to `posts_public`, generate an alias and publish immediately.
5. `decision = nothing`: create no public post; record an internal status if needed.
6. The sender can only keep or soft-delete the post after it appears.

Never place unprocessed raw text on a public page. Never call the model from the browser client.
