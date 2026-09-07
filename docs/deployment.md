# TLTP deployment runbook

This runbook is intentionally explicit about secrets and environment boundaries. Never paste a service-role key or OpenAI key into GitHub, client-side code, a browser form or a public issue.

## 1. Create the Supabase project

1. Create a project in Supabase and note the project reference, project URL and publishable key.
2. Run the migrations from `supabase/migrations/` in filename order. With the CLI:

   ```bash
   pnpm dlx supabase login
   pnpm dlx supabase link --project-ref YOUR_PROJECT_REF
   pnpm dlx supabase db push
   ```

3. Confirm that `profiles`, `teachers`, `submissions_private`, `posts_public`, `reports` and the audit tables exist.
4. Confirm RLS is enabled. The service-role key is used only by server-side routes for trusted writes; the browser receives only the publishable key.

## 2. Configure Google OAuth

1. In Google Cloud, create a Web OAuth client.
2. Add the production origin (`https://YOUR_DOMAIN`) and local origin (`http://localhost:3000`) as authorized JavaScript origins.
3. In the Google client, add the Supabase Auth callback shown in the Supabase Google provider page, normally `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`.
4. In Supabase Auth → URL Configuration, set:
   - Site URL: `https://YOUR_DOMAIN`
   - Redirect URL: `https://YOUR_DOMAIN/api/auth/callback`
   - Local redirect URL: `http://localhost:3000/api/auth/callback`
5. Add the Google client ID and secret to the Supabase Google provider. Do not put them in this repository.

## 3. Configure environment variables

Set these in Vercel Project Settings → Environment Variables. Use separate values for Development, Preview and Production.

| Variable | Scope | Production value |
| --- | --- | --- |
| `NEXT_PUBLIC_DEMO_MODE` | public flag | `false` |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | server secret | Supabase service-role key |
| `OPENAI_API_KEY` | server secret | OpenAI project API key |
| `OPENAI_MODEL` | server config | `gpt-5.6-luna` |
| `OPENAI_REASONING_EFFORT` | server config | `high` |
| `OPENAI_STORE` | server config | `false` |
| `TURNSTILE_SITE_KEY` | public | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | server secret | Cloudflare Turnstile secret |
| `IP_HASH_SALT` | server secret | long random value |
| `NEXT_PUBLIC_APP_URL` | public config | `https://YOUR_DOMAIN` |

The complete variable name list is in [`.env.example`](../.env.example). `NEXT_PUBLIC_*` values are embedded into the client build, so they must never contain secrets. After changing Vercel variables, redeploy; a previous build does not receive newly added values.

## 4. Deploy to Vercel

1. Import `TLTP-project/TLTP` into Vercel.
2. Keep the project root at the repository root. Vercel detects Next.js automatically.
3. Use `pnpm install` for install and `pnpm build` for build.
4. Add the variables above to the correct Vercel environments.
5. Deploy a Preview first. Test Google login, onboarding, quota, AI rewrite, report submission and soft delete with test data.
6. Set the production domain in Supabase URL Configuration and Google Cloud, then deploy Production.

## 5. Smoke test after deployment

- Open `/login` and complete Google OAuth.
- Choose Student and verify that a `profiles` row is created.
- Submit a short school-related test message and verify one private submission plus one public post.
- Submit an off-topic test message and verify `nothing` creates no public post.
- Confirm the public feed never contains `author_id`, raw text or the original IP.
- Report a post and verify the reporter identity is stored privately.
- Try a second post within 24 hours and verify quota enforcement.
- Check Vercel logs for OpenAI, Supabase and Turnstile failures without logging secrets or raw feedback.

## Launch checklist note

The public feed, submission, report and moderation paths have production Supabase branches. Only School profiles with `verification_status = 'active'` can open the protected moderation actions; every action writes to `moderation_audit` and `admin_access_audit`.
