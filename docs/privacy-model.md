# Privacy Model

## Public surface

The public page contains only `posts_public.processed_text`, the public UUID, an allowed target, an alias/role title, status and necessary timestamps. It never returns `author_id`, Google identity, raw text, IP address, user-agent or admin notes.

## Private surface

`submissions_private` and audit tables are accessible only through server/admin paths with authorization checks. RLS is deny-by-default; the service-role key never enters the client bundle.

## Display policy

- Student → Teacher: the teacher target may be visible; the sender receives a random cute alias.
- Teacher → Student: both sides remain anonymous; the sender receives a random cute alias.
- School: follows the Teacher policy while the public title is `School`.

Product details live in the local `PLAN.md`; every policy change must update the migration, UI copy and this document.
