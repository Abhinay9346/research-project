# Database Schema

The RSMS application uses a MySQL database structured to maintain strong relational integrity between Users, Scholars, and their associated academic records.

## Core Tables

### 1. `users`
Stores all authenticable users in the system (Admin, Chairman, Guide, Scholar).
- `id` (VARCHAR/UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `full_name` (VARCHAR)
- `role` (ENUM: 'admin', 'chairman', 'guide', 'scholar')
- `department` (VARCHAR)
- `created_at` (TIMESTAMP)

### 2. `scholars`
Stores specific academic details for research scholars.
- `id` (VARCHAR/UUID, Primary Key)
- `user_id` (FK to `users.id`)
- `guide_id` (FK to `users.id`)
- `research_area` (VARCHAR)
- `registration_date` (DATE)
- `status` (ENUM: 'active', 'completed', 'discontinued')
- `progress_percentage` (INT)

### 3. `publications`
Records academic publications authored by scholars.
- `id` (VARCHAR/UUID, Primary Key)
- `scholar_id` (FK to `scholars.id`)
- `title` (VARCHAR)
- `journal` (VARCHAR)
- `status` (ENUM: 'published', 'under_review', 'accepted')
- `verified` (BOOLEAN)
- `published_date` (DATE)

### 4. `weekly_logs`
Tracks weekly progress submissions by scholars.
- `id` (VARCHAR/UUID, Primary Key)
- `scholar_id` (FK to `scholars.id`)
- `guide_id` (FK to `users.id`)
- `week_date` (DATE)
- `research_work` (TEXT)
- `hours_worked` (INT)
- `approval_status` (ENUM: 'pending', 'approved', 'rejected')
- `guide_comment` (TEXT)

### 5. `committee_meetings`
Schedules and logs Doctoral Committee (DC) meetings.
- `id` (VARCHAR/UUID, Primary Key)
- `scholar_id` (FK to `scholars.id`)
- `meeting_date` (DATE)
- `status` (ENUM: 'scheduled', 'completed', 'cancelled')
- `minutes` (TEXT)
- `recommendations` (TEXT)

### 6. `notifications`
Stores system notifications for users.
- `id` (VARCHAR/UUID, Primary Key)
- `recipient_user_id` (FK to `users.id`)
- `title` (VARCHAR)
- `message` (TEXT)
- `type` (ENUM: 'info', 'success', 'warning', 'error')
- `is_read` (BOOLEAN)
- `created_at` (TIMESTAMP)

### 7. `announcements`
Stores global announcements visible on the dashboard.
- `id` (VARCHAR/UUID, Primary Key)
- `title` (VARCHAR)
- `content` (TEXT)
- `author_id` (FK to `users.id`)
- `priority` (ENUM: 'high', 'normal', 'low')
- `created_at` (TIMESTAMP)
