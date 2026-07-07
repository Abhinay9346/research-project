# Importing the RSMS Database Schema

This document explains how to set up the MySQL database for the RSMS backend.

## 1. Creating the Database and Tables

The schema is completely defined in `schema.sql`. It includes the command `CREATE DATABASE IF NOT EXISTS rsms_db;` and sets it as the active database before creating all the tables.

### Option A: Using the MySQL Command Line
1. Open your terminal or command prompt.
2. Log into MySQL as the root user (or another user with sufficient privileges):
   ```bash
   mysql -u root -p
   ```
3. Run the SQL script directly from the MySQL prompt using the `source` command. Make sure to provide the full path to `schema.sql`:
   ```sql
   source /path/to/project/backend/database/schema.sql;
   ```

### Option B: Using a GUI Client (e.g., MySQL Workbench, DBeaver, phpMyAdmin)
1. Open your database client and connect to your local MySQL instance.
2. Open the `schema.sql` file in a new query window.
3. Select "Execute All" (or run the entire script). The script will automatically create `rsms_db` and all necessary tables.

---

## 2. Verifying the Import

To ensure all tables have been imported correctly, you can run the following commands in your MySQL client:

1. Switch to the database:
   ```sql
   USE rsms_db;
   ```
2. Show all tables:
   ```sql
   SHOW TABLES;
   ```
   You should see exactly 7 tables listed:
   * `announcements`
   * `chairman_reviews`
   * `committee_meetings`
   * `guide_explanations`
   * `publications`
   * `research_projects`
   * `weekly_logs`

3. Verify a table's structure (e.g., to ensure ENUMs and JSON fields converted properly):
   ```sql
   DESCRIBE weekly_logs;
   ```

You are now ready to start creating the REST APIs in the backend!
