-- Create a function to handle visit creation with elevated privileges
create or replace function create_visit(
  p_client_id uuid,
  p_entry_time timestamp with time zone
) returns void
language plpgsql
security definer
as $$
begin
  insert into visits (client_id, entry_time)
  values (p_client_id, p_entry_time);
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function create_visit to authenticated;

