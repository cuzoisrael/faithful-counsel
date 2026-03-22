CREATE POLICY "Admins can view all blog posts"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));