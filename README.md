# TLTP — Trải Lòng Trần Phú

TLTP is an anonymous feedback forum for the Trần Phú school community. It helps students, teachers and the school share experiences and improvement ideas in a calm, constructive way.

> TLTP is not the school's official website and does not speak on behalf of the school.

## Current stack

- Svelte 5 + SvelteKit 2 + TypeScript
- Vite, Tailwind CSS and Lucide Svelte
- Lenis for smooth scrolling (no GSAP and no 3D runtime)
- Neon PostgreSQL with Drizzle ORM and Drizzle migrations
- Better Auth with GitHub and optional Google OAuth
- OpenAI Responses API with structured output for the Luna rewrite pipeline
- Zod 4 validation, Vitest tests and Vercel adapter

## Product rules

- A sender chooses Student, Teacher or School during onboarding. School uses the same privacy display policy as Teacher.
- Student → Teacher: the teacher target may remain visible; the student is shown as a server-generated alias.
- Teacher → Student and School → Student: both identities remain hidden on the public surface.
- Relevant feedback is rewritten into gentle, constructive Vietnamese without changing its meaning.
- The AI infers a teacher from the submitted text and the active teacher list; the client does not choose a recipient dropdown.
- Completely off-topic text returns `nothing` and creates no public post.
- Relevant text is published immediately after AI processing. The sender may soft-delete it from “Bài của tôi”.
- Public routes never expose raw text, IP hashes, user agents or admin notes.

## Architecture

```text
Browser
  → SvelteKit pages and server endpoints
  → Better Auth session cookie (demo identity only in local demo mode)
  → server validation, Neon-backed quotas/rate limits and Turnstile
  → one OpenAI Responses API call (structured output)
  → processed public post or `nothing`
  → Neon PostgreSQL tables through Drizzle/raw server queries
```

The private/public boundary is documented in [`docs/privacy-model.md`](docs/privacy-model.md). Security assumptions are in [`docs/threat-model.md`](docs/threat-model.md), and the deployment checklist is in [`docs/deployment.md`](docs/deployment.md).

## Repository structure

```text
TLTP/
├─ docs/                         # architecture, privacy and deployment notes
├─ drizzle/                      # generated Neon migrations and teacher seed SQL
├─ src/
│  ├─ features/                  # AI, auth, reports, moderation, submissions
│  ├─ lib/components/            # Svelte UI components and Lenis
│  ├─ lib/server/                # Better Auth, Neon/Drizzle and repositories
│  ├─ routes/                    # SvelteKit pages and +server API endpoints
│  └─ types/                     # shared domain types
├─ scripts/seed.mjs              # seed active teacher candidates
├─ static/icon.svg
├─ .env.example
├─ svelte.config.js
├─ vite.config.ts
└─ drizzle.config.ts
```

## Local development

Prerequisites: Node.js LTS and pnpm.

```bash
pnpm install
pnpm dev
```

Without a database or OAuth keys, local mode defaults to a deterministic demo identity and local Luna simulation. To use the real stack, copy `.env.example` to `.env`, set `DATABASE_URL` to the Neon connection string, and set `DEMO_MODE=false`.

```bash
pnpm db:generate       # after changing the Drizzle schema
pnpm db:push           # apply schema to Neon during development
pnpm db:seed           # insert the active teacher candidates
pnpm typecheck
pnpm test
pnpm build
```

## OAuth setup

Create GitHub and/or Google OAuth clients with the app origin (`http://localhost:5173` locally and the exact Vercel domain in production). Better Auth handles the callback under:

```text
https://YOUR_DOMAIN/api/auth/callback/github
https://YOUR_DOMAIN/api/auth/callback/google
```

Set the corresponding client IDs and secrets in Vercel. `ADMIN_GITHUB_LOGINS` is a comma-separated allow-list of GitHub usernames; matching accounts are synchronized into `platform_admins` after sign-in. This platform-admin flag is independent from the user’s school role.

## Vercel deployment

1. Import the repository into Vercel; the SvelteKit Vercel adapter and `pnpm build` are already configured.
2. Create a Neon database and run `pnpm db:migrate` (or apply the generated SQL in `drizzle/`) against it, then run `pnpm db:seed`.
3. Add the variables in [`.env.example`](.env.example) separately for Development, Preview and Production. Use `DEMO_MODE=false` in production.
4. Add the exact Vercel URL to `BETTER_AUTH_URL` and to each OAuth provider’s authorized origin/callback list.
5. Configure OpenAI, Turnstile and the admin GitHub allow-list, then redeploy after variable changes.

Never commit `.env`, OAuth secrets, Neon credentials, OpenAI keys, or real school feedback. Real content reports must use the in-product Report action, not public GitHub issues.

## License and data

The code is MIT-licensed. That license does not grant rights to user feedback, identities or private school data. See [`PRIVACY.md`](PRIVACY.md), [`CONTENT_POLICY.md`](CONTENT_POLICY.md) and [`SECURITY.md`](SECURITY.md) before launch.
