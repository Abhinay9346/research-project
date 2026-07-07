/*
# Research Scholar Management System - Core Schema

1. Purpose
   Creates the core data tables for the Research Scholar Management System (RSMS).
   This is a single-tenant demo app with client-side role-based access, so tables
   are readable/writable by the anon key (TO anon, authenticated).

2. New Tables
   - `weekly_logs`: Scholar weekly research log entries with guide approval workflow.
   - `publications`: Scholar publication records with indexing and verification tracking.
   - `committee_meetings`: Doctoral committee meeting schedules and minutes.
   - `announcements`: System-wide announcements from admin/chairman.

3. Columns
   weekly_logs:
     - id (uuid PK), scholar_id, scholar_name, guide_id, week_date, research_work,
       hours_worked, problems_faced, future_plan, approval_status (enum),
       guide_comment, submitted_at, reviewed_at, created_at.
   publications:
     - id (uuid PK), scholar_id, scholar_name, title, doi, journal, conference,
       issn, indexing (text[]), apc_paid, journal_link, status (enum),
       verified, published_date, created_at.
   committee_meetings:
     - id (uuid PK), scholar_id, scholar_name, title, meeting_date, meeting_time,
       status (enum), agenda, minutes, recommendations, attendees (text[]),
       created_at.
   announcements:
     - id (uuid PK), title, content, priority (enum), author, created_at.

4. Indexes
   - weekly_logs: scholar_id, approval_status, week_date
   - publications: scholar_id, status
   - committee_meetings: scholar_id, meeting_date

5. Security
   - RLS enabled on all tables.
   - Policies allow anon + authenticated full CRUD (single-tenant demo).
*/

CREATE TABLE IF NOT EXISTS weekly_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_id text NOT NULL,
  scholar_name text NOT NULL,
  guide_id text,
  week_date date NOT NULL,
  research_work text NOT NULL,
  hours_worked integer NOT NULL DEFAULT 0,
  problems_faced text DEFAULT '',
  future_plan text DEFAULT '',
  approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected','revision')),
  guide_comment text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_id text NOT NULL,
  scholar_name text NOT NULL,
  title text NOT NULL,
  doi text DEFAULT '',
  journal text NOT NULL,
  conference text DEFAULT '',
  issn text DEFAULT '',
  indexing text[] DEFAULT '{}',
  apc_paid boolean DEFAULT false,
  journal_link text DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','under_review','accepted','published','rejected')),
  verified boolean DEFAULT false,
  published_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS committee_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_id text NOT NULL,
  scholar_name text NOT NULL,
  title text NOT NULL,
  meeting_date date NOT NULL,
  meeting_time text NOT NULL DEFAULT '10:00',
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  agenda text NOT NULL,
  minutes text DEFAULT '',
  recommendations text DEFAULT '',
  attendees text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  author text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weekly_logs_scholar ON weekly_logs(scholar_id);
CREATE INDEX IF NOT EXISTS idx_weekly_logs_status ON weekly_logs(approval_status);
CREATE INDEX IF NOT EXISTS idx_weekly_logs_week_date ON weekly_logs(week_date);
CREATE INDEX IF NOT EXISTS idx_publications_scholar ON publications(scholar_id);
CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_meetings_scholar ON committee_meetings(scholar_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON committee_meetings(meeting_date);

-- RLS
ALTER TABLE weekly_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- weekly_logs policies
DROP POLICY IF EXISTS "anon_select_weekly_logs" ON weekly_logs;
CREATE POLICY "anon_select_weekly_logs" ON weekly_logs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_weekly_logs" ON weekly_logs;
CREATE POLICY "anon_insert_weekly_logs" ON weekly_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_weekly_logs" ON weekly_logs;
CREATE POLICY "anon_update_weekly_logs" ON weekly_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_weekly_logs" ON weekly_logs;
CREATE POLICY "anon_delete_weekly_logs" ON weekly_logs FOR DELETE
  TO anon, authenticated USING (true);

-- publications policies
DROP POLICY IF EXISTS "anon_select_publications" ON publications;
CREATE POLICY "anon_select_publications" ON publications FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_publications" ON publications;
CREATE POLICY "anon_insert_publications" ON publications FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_publications" ON publications;
CREATE POLICY "anon_update_publications" ON publications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_publications" ON publications;
CREATE POLICY "anon_delete_publications" ON publications FOR DELETE
  TO anon, authenticated USING (true);

-- committee_meetings policies
DROP POLICY IF EXISTS "anon_select_meetings" ON committee_meetings;
CREATE POLICY "anon_select_meetings" ON committee_meetings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_meetings" ON committee_meetings;
CREATE POLICY "anon_insert_meetings" ON committee_meetings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_meetings" ON committee_meetings;
CREATE POLICY "anon_update_meetings" ON committee_meetings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_meetings" ON committee_meetings;
CREATE POLICY "anon_delete_meetings" ON committee_meetings FOR DELETE
  TO anon, authenticated USING (true);

-- announcements policies
DROP POLICY IF EXISTS "anon_select_announcements" ON announcements;
CREATE POLICY "anon_select_announcements" ON announcements FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_announcements" ON announcements;
CREATE POLICY "anon_insert_announcements" ON announcements FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_announcements" ON announcements;
CREATE POLICY "anon_update_announcements" ON announcements FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_announcements" ON announcements;
CREATE POLICY "anon_delete_announcements" ON announcements FOR DELETE
  TO anon, authenticated USING (true);
