-- Separate platform administration from school-facing user roles.
-- Student, teacher, and school remain ordinary profile roles.

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  github_login text,
  grant_source text not null default 'manual'
    check (grant_source in ('manual', 'environment')),
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_platform_admins_github_login
  on public.platform_admins (lower(github_login))
  where github_login is not null;

drop trigger if exists trigger_platform_admins_updated_at on public.platform_admins;
create trigger trigger_platform_admins_updated_at
  before update on public.platform_admins
  for each row
  execute function public.handle_updated_at();

alter table public.platform_admins enable row level security;

-- Replace the legacy role-based check. A School profile no longer implies
-- platform administration privileges.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.platform_admins
    where user_id = auth.uid()
  );
$$;

drop policy if exists "Admins can view platform administrators" on public.platform_admins;
create policy "Admins can view platform administrators"
  on public.platform_admins for select
  using (public.is_admin());

-- Writes intentionally have no authenticated-user policy. They must go
-- through the trusted server service role or the Supabase dashboard.
