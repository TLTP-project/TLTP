# TLTP deployment runbook

This runbook keeps OAuth, Neon and OpenAI secrets server-side. Never paste them into GitHub, browser forms, client code or public issues.

## 1. Create Neon database

1. Create a Neon project and copy its pooled connection string.
2. Copy `.env.example` to `.env` for local work and set `DATABASE_URL`.
3. Apply the Drizzle schema and seed the active teacher list:

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

   For a new development database, `pnpm db:push` is also acceptable.
4. Confirm that Better Auth tables (`user`, `session`, `account`, `verification`) and TLTP tables (`profiles`, `teachers`, `submissions_private`, `posts_public`, `reports`, `moderation_audit`, `rate_limits`, `platform_admins`) exist.

## 2. Configure Better Auth OAuth

Create OAuth apps with these values (replace the production domain):

| Provider | Authorized origin | Callback URL |
| --- | --- | --- |
| GitHub | `https://YOUR_DOMAIN` | `https://YOUR_DOMAIN/api/auth/callback/github` |
| Google | `https://YOUR_DOMAIN` | `https://YOUR_DOMAIN/api/auth/callback/google` |

For local development use `http://localhost:5173` in the origin and callback values. Better Auth serves the provider callback and stores sessions in Neon.

## 3. Configure Vercel variables

Set these in Vercel Project Settings → Environment Variables, separately for Development, Preview and Production.

| Variable | Scope | Production value |
| --- | --- | --- |
| `DATABASE_URL` | server secret | Neon pooled connection string |
| `BETTER_AUTH_SECRET` | server secret | long random value |
| `BETTER_AUTH_URL` | server config | `https://YOUR_DOMAIN` |
| `GITHUB_CLIENT_ID` | server config | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | server secret | GitHub OAuth client secret |
| `GOOGLE_CLIENT_ID` | server config | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | server secret | Google OAuth client secret (optional) |
| `DEMO_MODE` | server config | `false` |
| `OPENAI_API_KEY` | server secret | OpenAI project API key |
| `OPENAI_MODEL` | server config | `gpt-5.6-luna` |
| `OPENAI_REASONING_EFFORT` | server config | `high` |
| `OPENAI_STORE` | server config | `false` |
| `OPENAI_MAX_OUTPUT_TOKENS` | server config | `1200` |
| `PUBLIC_TURNSTILE_SITE_KEY` | public config | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | server secret | Cloudflare Turnstile secret |
| `IP_HASH_SALT` | server secret | long random value |
| `RAW_DATA_RETENTION_DAYS` | server config | `90` |
| `ADMIN_USER_IDS` | server config | comma-separated Better Auth user IDs |
| `ADMIN_GITHUB_LOGINS` | server config | comma-separated GitHub usernames |

The complete variable list is in [`.env.example`](../.env.example). Do not put database, OAuth, OpenAI or Turnstile secrets under a `PUBLIC_` name.

## 4. Deploy to Vercel

1. Import `TLTP-project/TLTP` into Vercel.
2. Keep the project root at the repository root. The SvelteKit Vercel adapter is already configured.
3. Use `pnpm install` for install and `pnpm build` for build.
4. Add all variables above, deploy a Preview, then run the smoke tests below.
5. Set `BETTER_AUTH_URL` to the final production URL and deploy Production.

## 5. Smoke test

- Open `/login` and complete GitHub OAuth (and Google if configured).
- Choose Student and confirm a `profiles` row is created.
- Submit a school-related test message and verify one private submission plus one public post.
- Submit an off-topic test message and verify `nothing` creates no public post.
- Confirm the public feed never contains `author_id`, raw text, IP hashes or audit notes.
- Open `/my-posts`, then remove the test post and verify it is soft-deleted.
- Report a post and verify the report is stored with the reporter identity server-side.
- Try a second post within 24 hours and verify quota enforcement.
- Send rapid requests from one IP and verify the Neon-backed rate limiter.
- Check Vercel logs for OpenAI, Neon, Better Auth and Turnstile failures without logging secrets or raw feedback.

## Administrator access

Platform administration is independent from the `student`, `teacher`, and `school` profile roles. Set `ADMIN_GITHUB_LOGINS` to the exact GitHub usernames allowed to administer TLTP. After a matching GitHub sign-in, the server synchronizes the account into `platform_admins`; removing a username revokes environment-managed access on the next sign-in. `ADMIN_USER_IDS` is a controlled bootstrap fallback.
