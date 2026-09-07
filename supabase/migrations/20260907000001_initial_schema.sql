-- TLTP Initial Database Schema & RLS Policies (Hardened)
-- Compatible with PostgreSQL 15+ and Supabase Postgres

-- Extension for UUID generation
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. Helper Functions (Security Definer with Search Path)
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'school'
      and verification_status = 'active'
  );
$$;

-- Auto updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 2. Profiles Table
-- ============================================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null check (role in ('student', 'teacher', 'school')),
  verification_status text not null default 'pending_verification'
    check (verification_status in ('active', 'pending_verification', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role_status on public.profiles(role, verification_status);

create trigger trigger_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- ============================================================================
-- 3. Teachers Table (Canonical Target List)
-- ============================================================================
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  display_name text not null unique,
  subject text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_teachers_active on public.teachers(active);

insert into public.teachers (display_name, subject, active) values
  ('Thầy Nguyễn Văn A', 'Toán học', true),
  ('Cô Trần Thị B', 'Ngữ văn', true),
  ('Thầy Lê Văn C', 'Vật lý', true),
  ('Cô Phạm Thị D', 'Tiếng Anh', true),
  ('Thầy Hoàng Văn E', 'Hóa học', true),
  ('Cô Vũ Thị F', 'Sinh học', true),
  ('Thầy Đỗ Văn G', 'Lịch sử - Địa lý', true),
  ('Cô Ngô Thị H', 'Tin học', true)
on conflict (display_name) do nothing;

-- ============================================================================
-- 4. Private Submissions Table (STRICT: Backend & Admin Access Only)
-- ============================================================================
create table if not exists public.submissions_private (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(user_id) on delete cascade,
  role text not null check (role in ('student', 'teacher', 'school')),
  target text not null,
  target_teacher_id uuid references public.teachers(id) on delete set null,
  raw_text text not null,
  ip_hash text,
  user_agent text,
  model text not null default 'gpt-5.6-luna',
  reasoning_effort text not null default 'high',
  ai_decision text check (ai_decision in ('publish', 'nothing', 'processing_failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_submissions_author_created on public.submissions_private(author_id, created_at desc);
create index if not exists idx_submissions_decision on public.submissions_private(ai_decision);

-- ============================================================================
-- 5. Public Posts Table
-- ============================================================================
create table if not exists public.posts_public (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.submissions_private(id) on delete set null,
  author_id uuid references public.profiles(user_id) on delete set null,
  processed_text text not null,
  display_sender text not null,
  display_target text not null,
  target_teacher_id uuid references public.teachers(id) on delete set null,
  status text not null default 'published' check (status in ('published', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_posts_status_created on public.posts_public(status, created_at desc);
create index if not exists idx_posts_author on public.posts_public(author_id);
create index if not exists idx_posts_teacher on public.posts_public(target_teacher_id);

create trigger trigger_posts_updated_at
  before update on public.posts_public
  for each row
  execute function public.handle_updated_at();

-- Secure View for Public Feed (Hides author_id and submission_id per PLAN.md Section 6)
create or replace view public.posts_feed_view as
select
  id,
  processed_text,
  display_sender,
  display_target,
  target_teacher_id,
  status,
  created_at
from public.posts_public
where status = 'published';

-- ============================================================================
-- 6. Reports Table
-- ============================================================================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts_public(id) on delete cascade,
  reporter_id uuid references public.profiles(user_id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  moderator_note text,
  action_taken text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reports_status_created on public.reports(status, created_at desc);
create index if not exists idx_reports_post on public.reports(post_id);

create trigger trigger_reports_updated_at
  before update on public.reports
  for each row
  execute function public.handle_updated_at();

-- ============================================================================
-- 7. Audit & Moderation Log Tables
-- ============================================================================
create table if not exists public.moderation_audit (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts_public(id) on delete set null,
  submission_id uuid references public.submissions_private(id) on delete set null,
  prompt_version text not null default 'v1',
  model text not null,
  decision text not null,
  flags jsonb default '{}'::jsonb,
  token_usage jsonb default '{}'::jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_access_audit (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(user_id),
  resource_type text not null,
  resource_id uuid not null,
  action text not null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_access_admin_created on public.admin_access_audit(admin_id, created_at desc);

-- ============================================================================
-- 8. Quota Check Function (Refunds Technical Failures)
-- ============================================================================
create or replace function public.check_user_daily_quota(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_published_count int;
  v_attempts_count int;
  v_can_submit boolean;
  v_reason text := null;
begin
  select count(*)
  into v_published_count
  from public.posts_public
  where author_id = p_user_id
    and status != 'deleted'
    and created_at >= (now() - interval '24 hours');

  -- Count only successful or off-topic attempts; refund technical processing failures
  select count(*)
  into v_attempts_count
  from public.submissions_private
  where author_id = p_user_id
    and ai_decision != 'processing_failed'
    and created_at >= (now() - interval '24 hours');

  if v_published_count >= 1 then
    v_can_submit := false;
    v_reason := 'DAILY_POST_LIMIT_REACHED';
  elsif v_attempts_count >= 3 then
    v_can_submit := false;
    v_reason := 'DAILY_ATTEMPTS_LIMIT_REACHED';
  else
    v_can_submit := true;
  end if;

  return jsonb_build_object(
    'can_submit', v_can_submit,
    'published_today', v_published_count,
    'attempts_today', v_attempts_count,
    'reason', v_reason
  );
end;
$$;

-- ============================================================================
-- 9. Row Level Security (RLS) - Hardened Against Privilege Escalation
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.teachers enable row level security;
alter table public.submissions_private enable row level security;
alter table public.posts_public enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_audit enable row level security;
alter table public.admin_access_audit enable row level security;

-- Profiles: Disallow self-escalation to admin role or active status
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own profile on signup"
  on public.profiles for insert
  with check (
    auth.uid() = user_id
    and (
      (role = 'student' and verification_status = 'active')
      or
      (role in ('teacher', 'school') and verification_status = 'pending_verification')
    )
  );

create policy "Users can update own role if pending"
  on public.profiles for update
  using (auth.uid() = user_id or public.is_admin())
  with check (
    (public.is_admin())
    or
    (
      auth.uid() = user_id
      and (
        (role = 'student' and verification_status = 'active')
        or
        (role in ('teacher', 'school') and verification_status = 'pending_verification')
      )
    )
  );

-- Teachers policies
create policy "Anyone can read active teachers"
  on public.teachers for select
  using (active = true or public.is_admin());

create policy "Admins can manage teachers"
  on public.teachers for all
  using (public.is_admin());

-- Submissions private policies (STRICT: ONLY ADMINS)
create policy "Admins can view private submissions"
  on public.submissions_private for select
  using (public.is_admin());

-- Posts public policies
create policy "Anyone can view published posts"
  on public.posts_public for select
  using (status = 'published');

create policy "Authors can view own posts"
  on public.posts_public for select
  using (auth.uid() = author_id);

create policy "Authors can soft delete own posts"
  on public.posts_public for update
  using (auth.uid() = author_id)
  with check (status = 'deleted');

create policy "Admins can manage all posts"
  on public.posts_public for all
  using (public.is_admin());

-- Reports policies
create policy "Authenticated users can submit reports"
  on public.reports for insert
  with check (true);

create policy "Admins can view and manage reports"
  on public.reports for all
  using (public.is_admin());

-- Audit policies
create policy "Admins can view moderation audit"
  on public.moderation_audit for select
  using (public.is_admin());

create policy "Admins can view admin access audit"
  on public.admin_access_audit for select
  using (public.is_admin());
