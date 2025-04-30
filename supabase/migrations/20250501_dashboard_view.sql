---------------------------------------------------------------
-- Dashboard slice materialised view (Postgres 13-safe)
---------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS public.dashboard_view;

CREATE MATERIALIZED VIEW public.dashboard_view AS
WITH task_summary AS (
  SELECT
    user_id,
    COUNT(*)::int                                            AS tasks_total,
    COUNT(*) FILTER (WHERE status = 'completed')::int        AS tasks_completed,
    COUNT(*) FILTER (WHERE status <> 'completed')::int       AS tasks_open,
    COUNT(*) FILTER (
      WHERE status <> 'completed'
        AND due IS NOT NULL
        AND due < NOW()
    )::int                                                   AS tasks_overdue
  FROM public.tasks
  GROUP BY user_id
), unread AS (
  SELECT user_id, COUNT(*)::int AS unread_messages
  FROM public.messages
  WHERE read = FALSE
  GROUP BY user_id
)
SELECT
  p.id                                      AS user_id,
  COALESCE(p.username, p.email)             AS name,
  COALESCE(ts.tasks_total,     0)           AS tasks_total,
  COALESCE(ts.tasks_completed, 0)           AS tasks_completed,
  COALESCE(ts.tasks_open,      0)           AS tasks_open,
  COALESCE(ts.tasks_overdue,   0)           AS tasks_overdue,
  COALESCE(u.unread_messages,  0)           AS unread_messages
FROM public.profiles p
LEFT JOIN task_summary ts ON ts.user_id = p.id
LEFT JOIN unread       u  ON u.user_id  = p.id;
