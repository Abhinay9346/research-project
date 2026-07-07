# RSMS Mock Data Import Guide

This directory contains realistic generated demo data designed to populate the entire RSMS database. 

## Import Order

Due to foreign key relationships and logical data flow, you **must** import the SQL files in numerical order:

1. `01_users.sql` (Creates Admin, Chairman, Committee, Guides, and Scholars. Essential for all other tables.)
2. `02_research_projects.sql` (Assigns projects to scholars)
3. `03_publications.sql` (Generates scholar publications)
4. `04_weekly_logs.sql` (Generates weekly progress logs for scholars and guides)
5. `05_committee_meetings.sql` (Generates meetings)
6. `06_guide_explanations.sql` (Generates delay explanations for scholars)
7. `07_chairman_reviews.sql` (Generates reviews)
8. `08_announcements.sql` (System-wide announcements)

## How to Import
Run the following from your MySQL terminal or client:

```bash
mysql -u root -p rsms_db < backend/database/mock-data/01_users.sql
mysql -u root -p rsms_db < backend/database/mock-data/02_research_projects.sql
mysql -u root -p rsms_db < backend/database/mock-data/03_publications.sql
mysql -u root -p rsms_db < backend/database/mock-data/04_weekly_logs.sql
mysql -u root -p rsms_db < backend/database/mock-data/05_committee_meetings.sql
mysql -u root -p rsms_db < backend/database/mock-data/06_guide_explanations.sql
mysql -u root -p rsms_db < backend/database/mock-data/07_chairman_reviews.sql
mysql -u root -p rsms_db < backend/database/mock-data/08_announcements.sql
```

## Generated Credentials

**Password for ALL users is identical to their email address.**

### Key Users:
- **Admin**: `admin@rsms.edu`
- **Chairman**: `chairman@rsms.edu`
- **Guides**: `guide1@rsms.edu` through `guide10@rsms.edu`
- **Scholars**: `rs001@rsms.edu` through `rs050@rsms.edu` (Scholar IDs: RS001 - RS050)
- **Committee**: `committee1@rsms.edu` through `committee5@rsms.edu`
