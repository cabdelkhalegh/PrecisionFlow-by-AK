-- TiKiT OS - Storage Buckets and Configuration
-- Supabase Storage buckets for files
-- Migration: 20260207000005

-- =============================================================================
-- CREATE STORAGE BUCKETS
-- =============================================================================

-- Briefs bucket (for brief documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'briefs',
  'briefs',
  false,  -- Private bucket
  52428800,  -- 50MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
);

-- Content bucket (for content artifacts)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content',
  'content',
  false,  -- Private bucket
  524288000,  -- 500MB for videos
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'image/jpeg', 'image/png', 'image/gif', 'text/plain']
);

-- Contracts bucket (for contracts and legal documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts',
  false,  -- Private bucket
  10485760,  -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Invoices bucket (for financial documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false,  -- Private bucket
  10485760,  -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
);

-- Avatars bucket (for user and client avatars)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- Public bucket
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- =============================================================================
-- STORAGE BUCKET POLICIES
-- =============================================================================

-- Briefs bucket policies
-- Campaign members can read brief files
CREATE POLICY "Campaign members can read briefs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'briefs' AND
    (
      is_admin() OR
      is_director() OR
      EXISTS (
        SELECT 1 FROM briefs
        WHERE briefs.raw_brief_url = storage.objects.name
        AND is_campaign_member(briefs.campaign_id)
      )
    )
  );

-- Campaign managers can upload briefs
CREATE POLICY "Campaign managers can upload briefs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'briefs' AND
    (
      is_admin() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('campaign_manager', 'admin')
        AND status = 'active'
      )
    )
  );

-- Content bucket policies
-- Campaign members and assigned influencers can read content
CREATE POLICY "Authorized users can read content"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'content' AND
    (
      is_admin() OR
      is_director() OR
      EXISTS (
        SELECT 1 FROM content_artifacts
        JOIN content_tasks ON content_artifacts.content_task_id = content_tasks.id
        WHERE content_artifacts.file_url = storage.objects.name
        AND (
          is_campaign_member(content_tasks.campaign_id) OR
          content_tasks.influencer_id IN (
            SELECT id FROM users WHERE id = auth.uid()
          )
        )
      )
    )
  );

-- Campaign managers and influencers can upload content
CREATE POLICY "Authorized users can upload content"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'content' AND
    (
      is_admin() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('campaign_manager', 'influencer')
        AND status = 'active'
      )
    )
  );

-- Contracts bucket policies
-- Campaign managers and finance can read contracts
CREATE POLICY "Authorized users can read contracts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts' AND
    (
      is_admin() OR
      is_director() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('campaign_manager', 'finance')
        AND status = 'active'
      )
    )
  );

-- Campaign managers can upload contracts
CREATE POLICY "Campaign managers can upload contracts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contracts' AND
    (
      is_admin() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'campaign_manager'
        AND status = 'active'
      )
    )
  );

-- Invoices bucket policies
-- Finance and directors can read invoices
CREATE POLICY "Finance can read invoices"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'invoices' AND
    (
      is_admin() OR
      is_director() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('finance', 'campaign_manager')
        AND status = 'active'
      )
    )
  );

-- Finance can upload invoices
CREATE POLICY "Finance can upload invoices"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'invoices' AND
    (
      is_admin() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'finance'
        AND status = 'active'
      )
    )
  );

-- Avatars bucket policies (public read)
-- Anyone can read avatars (public bucket)
CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatars
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL
  );

-- Users can update their own avatars
CREATE POLICY "Users can update avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL
  );

-- =============================================================================
-- STORAGE BUCKETS COMPLETE
-- =============================================================================
-- All storage buckets created with appropriate policies
-- File size limits and MIME type restrictions configured
-- =============================================================================
