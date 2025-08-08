-- Create a view joining projects with profiles, filterable by project_id
-- Exposes limited profile fields alongside project data

CREATE OR REPLACE VIEW public.projects_with_profiles AS
SELECT 
  p.id AS project_id,
  p.user_id,
  p.name,
  p.description,
  p.platforms,
  p.content_sources,
  p.last_generated,
  p.status,
  p.created_at,
  p.updated_at,
  pr.email AS user_email,
  pr.full_name AS user_full_name,
  pr.avatar_url AS user_avatar_url
FROM public.projects p
JOIN public.profiles pr
  ON pr.id = p.user_id;

-- Ensure security barrier remains set on the view
ALTER VIEW public.projects_with_profiles SET (security_barrier = true);

-- Policy: authenticated users can view rows for projects they own
DROP POLICY IF EXISTS "Users can view projects_with_profiles" ON public.projects_with_profiles;
CREATE POLICY "Users can view projects_with_profiles"
ON public.projects_with_profiles
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = projects_with_profiles.project_id
    AND projects.user_id = auth.uid()
)); 

