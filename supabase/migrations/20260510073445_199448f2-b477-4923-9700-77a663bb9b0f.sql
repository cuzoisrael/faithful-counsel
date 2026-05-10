
-- Insert admin role for existing users with these emails
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE u.email IN ('cuzoisrael@gmail.com', 'softtech2care@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger to auto-grant admin to these emails on future signup
CREATE OR REPLACE FUNCTION public.grant_admin_for_super_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IN ('cuzoisrael@gmail.com', 'softtech2care@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_for_super_admins();
