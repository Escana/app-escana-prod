-- Remove the duplicate trigger that was causing double counting
DROP TRIGGER IF EXISTS ensure_daily_stats_trigger ON visits;

-- Remove the function as well since we won't need it anymore
DROP FUNCTION IF EXISTS ensure_daily_stats;

