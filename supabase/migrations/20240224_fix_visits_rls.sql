-- Drop existing RLS policies for visits table
drop policy if exists "Enable insert for authenticated users" on visits;
drop policy if exists "Enable select for authenticated users" on visits;

-- Create new RLS policies
create policy "Enable all operations for authenticated users"
on visits for all
to authenticated
using (true)
with check (true);

-- Ensure RLS is enabled
alter table visits enable row level security;

