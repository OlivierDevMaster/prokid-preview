-- Profile views tracking table
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast aggregation queries
CREATE INDEX idx_profile_views_professional_id ON public.profile_views(professional_id);
CREATE INDEX idx_profile_views_viewed_at ON public.profile_views(viewed_at);
CREATE INDEX idx_profile_views_professional_date ON public.profile_views(professional_id, viewed_at DESC);

-- RLS: anyone can insert (public profiles), professionals can read their own
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert profile views" ON public.profile_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Professionals can read their own views" ON public.profile_views
  FOR SELECT USING (auth.uid() = professional_id);

-- RPC to get profile view stats for a professional
CREATE OR REPLACE FUNCTION get_profile_view_stats(p_professional_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'today', COALESCE((
      SELECT COUNT(*) FROM public.profile_views
      WHERE professional_id = p_professional_id
      AND viewed_at >= CURRENT_DATE
    ), 0),
    'yesterday', COALESCE((
      SELECT COUNT(*) FROM public.profile_views
      WHERE professional_id = p_professional_id
      AND viewed_at >= CURRENT_DATE - INTERVAL '1 day'
      AND viewed_at < CURRENT_DATE
    ), 0),
    'this_week', COALESCE((
      SELECT COUNT(*) FROM public.profile_views
      WHERE professional_id = p_professional_id
      AND viewed_at >= date_trunc('week', CURRENT_DATE)
    ), 0),
    'last_week', COALESCE((
      SELECT COUNT(*) FROM public.profile_views
      WHERE professional_id = p_professional_id
      AND viewed_at >= date_trunc('week', CURRENT_DATE) - INTERVAL '7 days'
      AND viewed_at < date_trunc('week', CURRENT_DATE)
    ), 0),
    'this_month', COALESCE((
      SELECT COUNT(*) FROM public.profile_views
      WHERE professional_id = p_professional_id
      AND viewed_at >= date_trunc('month', CURRENT_DATE)
    ), 0),
    'last_month', COALESCE((
      SELECT COUNT(*) FROM public.profile_views
      WHERE professional_id = p_professional_id
      AND viewed_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
      AND viewed_at < date_trunc('month', CURRENT_DATE)
    ), 0),
    'total', COALESCE((
      SELECT COUNT(*) FROM public.profile_views
      WHERE professional_id = p_professional_id
    ), 0)
  ) INTO result;

  RETURN result;
END;
$$;
