CREATE DATABASE IF NOT EXISTS rsms_db;
USE rsms_db;

-- 1. weekly_logs
CREATE TABLE IF NOT EXISTS weekly_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  scholar_id VARCHAR(255) NOT NULL,
  scholar_name VARCHAR(255) NOT NULL,
  guide_id VARCHAR(255),
  week_date DATE NOT NULL,
  research_work TEXT NOT NULL,
  hours_worked INT NOT NULL DEFAULT 0,
  problems_faced TEXT,
  future_plan TEXT,
  approval_status ENUM('pending','approved','rejected','revision') NOT NULL DEFAULT 'pending',
  guide_comment TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. publications
CREATE TABLE IF NOT EXISTS publications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  scholar_id VARCHAR(255) NOT NULL,
  scholar_name VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  doi VARCHAR(255) DEFAULT '',
  journal VARCHAR(255) NOT NULL,
  conference VARCHAR(255) DEFAULT '',
  issn VARCHAR(255) DEFAULT '',
  indexing JSON DEFAULT (JSON_ARRAY()),
  apc_paid BOOLEAN DEFAULT false,
  journal_link VARCHAR(2000) DEFAULT '',
  status ENUM('draft','submitted','under_review','accepted','published','rejected') NOT NULL DEFAULT 'draft',
  verified BOOLEAN DEFAULT false,
  published_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. committee_meetings
CREATE TABLE IF NOT EXISTS committee_meetings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  scholar_id VARCHAR(255) NOT NULL,
  scholar_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_time VARCHAR(50) NOT NULL DEFAULT '10:00',
  status ENUM('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  agenda TEXT NOT NULL,
  minutes TEXT,
  recommendations TEXT,
  attendees JSON DEFAULT (JSON_ARRAY()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. announcements
CREATE TABLE IF NOT EXISTS announcements (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. research_projects
CREATE TABLE IF NOT EXISTS research_projects (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  scholar_id VARCHAR(255) NOT NULL,
  project_title VARCHAR(255) NOT NULL DEFAULT '',
  project_description TEXT,
  research_domain VARCHAR(255) NOT NULL DEFAULT '',
  technologies_used JSON DEFAULT (JSON_ARRAY()),
  major_contributions TEXT,
  related_publications TEXT,
  progress_percentage INT NOT NULL DEFAULT 0,
  uploaded_reports JSON DEFAULT (JSON_ARRAY()),
  thesis_status ENUM('not_started','in_progress','submitted','under_review','approved','rejected') NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. guide_explanations
CREATE TABLE IF NOT EXISTS guide_explanations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  scholar_id VARCHAR(255) NOT NULL UNIQUE,
  guide_name VARCHAR(255) NOT NULL DEFAULT '',
  reason_for_delay TEXT NOT NULL,
  challenges_faced TEXT NOT NULL,
  current_progress TEXT NOT NULL,
  expected_completion_date DATE,
  additional_remarks TEXT,
  digital_signature VARCHAR(255) NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. chairman_reviews
CREATE TABLE IF NOT EXISTS chairman_reviews (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  scholar_id VARCHAR(255) NOT NULL,
  observation TEXT NOT NULL,
  comments TEXT NOT NULL,
  recommendations TEXT NOT NULL,
  required_actions TEXT NOT NULL,
  new_deadline DATE,
  review_status ENUM('accepted','continue_research','needs_immediate_attention','extension_recommended','extension_rejected') NOT NULL DEFAULT 'needs_immediate_attention',
  chairman_name VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_weekly_logs_scholar ON weekly_logs(scholar_id);
CREATE INDEX idx_weekly_logs_status ON weekly_logs(approval_status);
CREATE INDEX idx_weekly_logs_week_date ON weekly_logs(week_date);

CREATE INDEX idx_publications_scholar ON publications(scholar_id);
CREATE INDEX idx_publications_status ON publications(status);

CREATE INDEX idx_meetings_scholar ON committee_meetings(scholar_id);
CREATE INDEX idx_meetings_date ON committee_meetings(meeting_date);

CREATE INDEX idx_research_projects_scholar ON research_projects(scholar_id);

CREATE INDEX idx_guide_explanations_scholar ON guide_explanations(scholar_id);

CREATE INDEX idx_chairman_reviews_scholar ON chairman_reviews(scholar_id);
