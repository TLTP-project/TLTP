# TLTP — Trải Lòng Trần Phú

TLTP is an independent, anonymous feedback forum for the Trần Phú school community. It helps students, teachers and the school share experiences and improvement ideas in a calm, constructive way.

> TLTP is not the school's official website and does not speak on behalf of the school.

## Project status

The repository contains a polished Next.js app with a production-oriented Supabase Auth/RLS and data path. Local development intentionally uses deterministic mock data and a local Luna simulation when `NEXT_PUBLIC_DEMO_MODE` is enabled. Production School accounts can review reports and moderate posts through protected server routes with audit records.

Do not advertise an unconfigured deployment as a live production forum and do not place real student, teacher or school data in it until the launch checklist below is complete.

## Stack

- Next.js 15 App Router and React 19
- TypeScript, Tailwind CSS and Lucide React
- GSAP with `@gsap/react` for small, scoped transitions with reduced-motion support
- Supabase Postgres, RLS and cookie-based SSR Auth (`@supabase/ssr`)
- OpenAI Responses API with structured output for the Luna rewrite pipeline
- Zod validation, Vitest tests and GitHub Actions CI/CodeQL
- pnpm for deterministic dependency management

## Product rules

- A sender chooses Student, Teacher or School during onboarding. School uses the same privacy display policy as Teacher while keeping the public title “School”.
- Student → Teacher: the teacher target can remain visible; the student is shown as a server-generated cute alias.
- Teacher → Student: both identities are hidden on the public surface.
- School follows the Teacher → Student/class flow and keeps the public sender title “School”; there is no separate School target flow yet.
- Relevant feedback is rewritten into gentle, constructive Vietnamese without changing its meaning. Harsh or vulgar wording is softened, not rejected for tone alone.
- Completely off-topic text returns `nothing` and creates no public post.
- Relevant text is published immediately after AI processing. The sender sees the published result and may keep or soft-delete it; there is no preview step.
- Public pages never expose Google identity, raw text, IP hashes, user agents or admin notes.
- Reports belong in the website. GitHub Issues are for bugs and feature requests only, never real user reports or personal data.

## Architecture

```text
Browser
  → Next.js App Router + responsive UI
  → Supabase SSR session cookie (production) / demo identity (local only)
  → server validation, quota and Turnstile checks
  → one OpenAI Responses API call (structured output)
  → processed public post or `nothing`
  → Supabase private/public tables with RLS
```

The private/public boundary is documented in [`docs/privacy-model.md`](docs/privacy-model.md). The security assumptions and abuse controls are in [`docs/threat-model.md`](docs/threat-model.md). The deployment checklist is in [`docs/deployment.md`](docs/deployment.md).

## Repository structure

```text
TLTP/
├─ .github/
│  ├─ CODEOWNERS                     # owner/reviewer routing
│  ├─ dependabot.yml                 # dependency updates
│  ├─ pull_request_template.md
│  ├─ ISSUE_TEMPLATE/                # bug, feature and config forms
│  └─ workflows/                     # CI and CodeQL
├─ docs/                             # architecture and policy notes
│  ├─ architecture.md
│  ├─ privacy-model.md
│  ├─ moderation-policy.md
│  └─ threat-model.md
├─ public/                           # static assets and favicon
├─ src/
│  ├─ app/
│  │  ├─ (public)/                   # feed, auth, onboarding, submit, policies
│  │  ├─ admin/                      # report review and moderation views
│  │  ├─ api/                        # auth, onboarding, posts, reports, submissions
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ layout/                     # Navbar and Footer
│  │  ├─ posts/                      # PostCard and ReportModal
│  │  └─ ui/                         # shared Logo and primitives
│  ├─ features/
│  │  ├─ ai/                         # prompt and rewrite orchestration
│  │  ├─ auth/                       # server auth and demo client helper
│  │  ├─ moderation/
│  │  ├─ reports/
│  │  └─ submissions/
│  ├─ lib/
│  │  ├─ config/                     # validated server environment
│  │  ├─ db/                         # clients and local fixtures
│  │  ├─ openai/                     # Responses API adapter
│  │  ├─ privacy/                    # PII and alias helpers
│  │  ├─ security/                   # quotas, Turnstile, IP hashing
│  │  └─ supabase/                   # browser, server and middleware clients
│  └─ types/                         # shared domain types
├─ supabase/
│  └─ migrations/                    # ordered schema and RLS migrations
├─ tests/unit/                       # privacy, AI and submission tests
├─ .env.example                      # variable names only
├─ middleware.ts                     # Supabase session refresh
├─ package.json
└─ PLAN.md                           # local-only plan; ignored by Git
```

`PLAN.md` is intentionally ignored by `.gitignore`. Never commit it, `.env.local`, API keys, service-role keys or real feedback data.

## Local development

Prerequisites: Node.js LTS and pnpm.

```bash
pnpm install
pnpm dev
```

The default local mode is a safe demo: it uses mock data, a deterministic demo user and a local Luna response when no OpenAI key is configured. To make that explicit in `.env.local`:

```dotenv
NEXT_PUBLIC_DEMO_MODE=true
OPENAI_STORE=false
OPENAI_MODEL=gpt-5.6-luna
OPENAI_REASONING_EFFORT=high
```

Quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Supabase setup

1. Create a Supabase project and copy its project URL and publishable key.
2. Run every SQL file in `supabase/migrations/` in order, or use the Supabase CLI with `supabase db push`.
3. In Supabase Auth, enable Google. In Google Cloud, use the Supabase provider callback shown in the dashboard (usually `https://PROJECT_REF.supabase.co/auth/v1/callback`) as the Google OAuth redirect URI.
4. In Supabase URL Configuration, set the Site URL to `https://YOUR_DOMAIN` and allow the app callback `https://YOUR_DOMAIN/api/auth/callback` plus local/preview variants when needed.
5. Create the first School profile only through a controlled admin procedure. Never expose a service-role key to the browser.

Required production variables are listed in [`.env.example`](.env.example). `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `TURNSTILE_SECRET_KEY` and `IP_HASH_SALT` are server-only secrets.

## Vercel deployment

1. Import `TLTP-project/TLTP` into Vercel. Vercel detects the Next.js framework automatically.
2. Use the repository root as the project root. Keep the default install/build settings (`pnpm install`, `pnpm build`).
3. Add environment variables separately for Development, Preview and Production. Set `NEXT_PUBLIC_DEMO_MODE=false` in Production.
4. Add the Supabase, OpenAI, Turnstile and app URL values from `.env.example`. Redeploy after changing environment variables.
5. Configure the exact Vercel production URL in Supabase Auth Site URL and Google OAuth redirect allow-list.
6. Verify login, role onboarding, one-post-per-day quota, AI rewrite, report submission, soft delete and RLS before sharing the URL with students.

Vercel preview deployments are useful for pull requests, but never use real school data in a preview project unless its environment variables and database are isolated.

## GitHub governance

The recommended repository model is a public repository inside the `TLTP-project` organization:

- Owner: the project owner, with the highest repository and organization permissions.
- Maintainers/Admins: limited collaborators who review issues and operate the project.
- Contributors: fork the repo and open pull requests; they do not receive direct write access to `main`.

Protect `main` with required CI, at least one review, no force-push and squash merges. Keep CODEOWNERS, secret scanning, push protection, Dependabot and CodeQL enabled. Reports about real people must use the in-product Report action, never a public issue.

## License and data

The code is MIT-licensed. That license does not grant rights to user feedback, identities or private school data. See [`PRIVACY.md`](PRIVACY.md), [`CONTENT_POLICY.md`](CONTENT_POLICY.md) and [`SECURITY.md`](SECURITY.md) before launch.
