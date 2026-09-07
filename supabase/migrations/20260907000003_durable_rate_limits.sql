-- Durable, server-only IP rate limits for serverless deployments.
create table if not exists public.rate_limit_buckets (
  key text primary key,
  request_count integer not null default 0 check (request_count >= 0),
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_rate_limit_buckets_updated_at
  on public.rate_limit_buckets(updated_at);

alter table public.rate_limit_buckets enable row level security;

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_count integer;
  v_reset_at timestamptz;
begin
  if p_key is null or length(p_key) = 0 or p_limit <= 0 or p_window_seconds <= 0 then
    raise exception 'Invalid rate limit arguments';
  end if;

  -- Serialize requests for the same bucket across all app instances.
  perform pg_advisory_xact_lock(hashtextextended(p_key, 0));

  select request_count, reset_at
    into v_count, v_reset_at
    from public.rate_limit_buckets
    where key = p_key
    for update;

  if not found or v_now >= v_reset_at then
    v_count := 1;
    v_reset_at := v_now + make_interval(secs => p_window_seconds);

    insert into public.rate_limit_buckets(key, request_count, reset_at, updated_at)
    values (p_key, v_count, v_reset_at, v_now)
    on conflict (key) do update
      set request_count = excluded.request_count,
          reset_at = excluded.reset_at,
          updated_at = excluded.updated_at;
  else
    v_count := v_count + 1;
    update public.rate_limit_buckets
      set request_count = v_count,
          updated_at = v_now
      where key = p_key;
  end if;

  return jsonb_build_object(
    'allowed', v_count <= p_limit,
    'remaining', greatest(p_limit - v_count, 0),
    'reset_in_seconds', greatest(ceil(extract(epoch from (v_reset_at - v_now)))::integer, 0)
  );
end;
$$;

revoke all on table public.rate_limit_buckets from anon, authenticated;
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
