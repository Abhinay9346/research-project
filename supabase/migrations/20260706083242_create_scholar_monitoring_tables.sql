/*
# Scholar Monitoring: Research Projects, Guide Explanations, Chairman Reviews

1. Purpose
   Adds three new tables for the Chairman's Scholar Monitoring feature:
   - research_projects: detailed research work info for scholars (especially those >4 years)
   - guide_explanations: mandatory explanation from the guide when a scholar exceeds 4 years
   - chairman_reviews: chairman's review/comments on overdue scholars

2. New Tables
   research_projects:
     - id (uuid PK), scholar_id (text), project_title, project_description, research_domain,
       technologies_used (text[]), major_contributions, related_publications (text),
       progress_percentage (int), uploaded_reports (text[]), thesis_status (enum),
       created_at, updated_at
   guide_explanations:
     - id (uuid PK), scholar_id (text), guide_name, reason_for_delay (text, required),
       challenges_faced, current_progress, expected_completion_date (date),
       additional_remarks, digital_signature (text), updated_at, created_at
   chairman_reviews:
     - id (uuid PK), scholar_id (text), observation, comments, recommendations,
       required_actions, new_deadline (date), review_status (enum),
       chairman_name (text), created_at, updated_at

3. Indexes
   - research_projects: scholar_id
   - guide_explanations: scholar_id
   - chairman_reviews: scholar_id

4. Security
   - RLS enabled on all tables.
   - Policies allow anon + authenticated full CRUD (single-tenant demo with client-side RBAC).
*/

CREATE TABLE IF NOT EXISTS research_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_id text NOT NULL,
  project_title text NOT NULL DEFAULT '',
  project_description text NOT NULL DEFAULT '',
  research_domain text NOT NULL DEFAULT '',
  technologies_used text[] DEFAULT '{}',
  major_contributions text NOT NULL DEFAULT '',
  related_publications text NOT NULL DEFAULT '',
  progress_percentage integer NOT NULL DEFAULT 0,
  uploaded_reports text[] DEFAULT '{}',
  thesis_status text NOT NULL DEFAULT 'in_progress' CHECK (thesis_status IN ('not_started','in_progress','submitted','under_review','approved','rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guide_explanations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_id text NOT NULL UNIQUE,
  guide_name text NOT NULL DEFAULT '',
  reason_for_delay text NOT NULL DEFAULT '',
  challenges_faced text NOT NULL DEFAULT '',
  current_progress text NOT NULL DEFAULT '',
  expected_completion_date date,
  additional_remarks text NOT NULL DEFAULT '',
  digital_signature text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chairman_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_id text NOT NULL,
  observation text NOT NULL DEFAULT '',
  comments text NOT NULL DEFAULT '',
  recommendations text NOT NULL DEFAULT '',
  required_actions text NOT NULL DEFAULT '',
  new_deadline date,
  review_status text NOT NULL DEFAULT 'needs_immediate_attention' CHECK (review_status IN ('accepted','continue_research','needs_immediate_attention','extension_recommended','extension_rejected')),
  chairman_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_research_projects_scholar ON research_projects(scholar_id);
CREATE INDEX IF NOT EXISTS idx_guide_explanations_scholar ON guide_explanations(scholar_id);
CREATE INDEX IF NOT EXISTS idx_chairman_reviews_scholar ON chairman_reviews(scholar_id);

-- RLS
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chairman_reviews ENABLE ROW LEVEL SECURITY;

-- research_projects policies
DROP POLICY IF EXISTS "anon_select_research_projects" ON research_projects;
CREATE POLICY "anon_select_research_projects" ON research_projects FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_research_projects" ON research_projects;
CREATE POLICY "anon_insert_research_projects" ON research_projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_research_projects" ON research_projects;
CREATE POLICY "anon_update_research_projects" ON research_projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_research_projects" ON research_projects;
CREATE POLICY "anon_delete_research_projects" ON research_projects FOR DELETE
  TO anon, authenticated USING (true);

-- guide_explanations policies
DROP POLICY IF EXISTS "anon_select_guide_explanations" ON guide_explanations;
CREATE POLICY "anon_select_guide_explanations" ON guide_explanations FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_guide_explanations" ON guide_explanations;
CREATE POLICY "anon_insert_guide_explanations" ON guide_explanations FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_guide_explanations" ON guide_explanations;
CREATE POLICY "anon_update_guide_explanations" ON guide_explanations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_guide_explanations" ON guide_explanations;
CREATE POLICY "anon_delete_guide_explanations" ON guide_explanations FOR DELETE
  TO anon, authenticated USING (true);

-- chairman_reviews policies
DROP POLICY IF EXISTS "anon_select_chairman_reviews" ON chairman_reviews;
CREATE POLICY "anon_select_chairman_reviews" ON chairman_reviews FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_chairman_reviews" ON chairman_reviews;
CREATE POLICY "anon_insert_chairman_reviews" ON chairman_reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_chairman_reviews" ON chairman_reviews;
CREATE POLICY "anon_update_chairman_reviews" ON chairman_reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_chairman_reviews" ON chairman_reviews;
CREATE POLICY "anon_delete_chairman_reviews" ON chairman_reviews FOR DELETE
  TO anon, authenticated USING (true);
