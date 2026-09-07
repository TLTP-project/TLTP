# Threat Model

## Assets to protect

- Student/teacher identities and raw feedback.
- OpenAI, Supabase and Turnstile secrets.
- RLS policies, admin actions and audit logs.
- Integrity of public text after AI processing.

## Main risks

- A user attempts doxxing or prompt injection inside feedback.
- The client calls a service key directly or reads private tables.
- Spam exceeds quota or abuses the report workflow.
- An admin views raw data without an audit trail.

## Required controls

- Server-only secrets, deny-by-default RLS, account/IP quotas and Turnstile.
- Treat submitted content as data, never as instructions.
- Never commit real data; use CodeQL, Dependabot, secret scanning and push protection.
- Every raw-data access requires a role check and `admin_access_audit` entry.
