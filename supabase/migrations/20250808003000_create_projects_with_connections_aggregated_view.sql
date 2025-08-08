-- Create an aggregated view: one row per project with its connections summarized
-- Each connection includes: id, integration name, provider, and status

CREATE OR REPLACE VIEW public.projects_with_connections AS
SELECT
  p.id AS project_id,
  p.name AS project_name,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'connection_id', c.id,
        'name', i.name,
        'provider', i.provider,
        'status', c.status
      )
    ) FILTER (WHERE c.id IS NOT NULL),
    '[]'::json
  ) AS connections
FROM public.projects p
LEFT JOIN public.connections c
  ON c.project_id = p.id
LEFT JOIN public.integrations i
  ON i.id = c.integration_id
GROUP BY p.id, p.name;

-- Ensure security barrier remains set on the view
ALTER VIEW public.projects_with_connections SET (security_barrier = true);

