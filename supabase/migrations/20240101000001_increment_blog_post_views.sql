-- Function to increment blog post view count
CREATE OR REPLACE FUNCTION increment_blog_post_views(post_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;








