-- Do not allow anonymous or cross-account report submissions.
drop policy if exists "Authenticated users can submit reports" on public.reports;

create policy "Authenticated users can submit reports"
  on public.reports for insert
  with check (
    auth.uid() is not null
    and reporter_id = auth.uid()
  );
