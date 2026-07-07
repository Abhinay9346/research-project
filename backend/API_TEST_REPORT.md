# API Test Report

## Environment Validation
❌ **MySQL Connection Test**: Failed.
**Reason**: MySQL Server is not installed or the service is not running on the current host machine (connection refused on 127.0.0.1:3306).
**Fix**: This is an environment issue, not a code issue. MySQL needs to be installed, running, and accessible on the host system to accept connections.

❌ **Schema Import Test (`schema.sql`)**: Failed.
**Reason**: Cannot import the schema without a running MySQL instance. 

## REST Endpoint Testing
Because the `server.js` file is correctly configured to verify the database connection on startup and exit (`process.exit(1)`) if the database is unreachable, the Express server cannot start in this environment. Therefore, the live endpoints could not be reached.

❌ **GET /**: Failed (Server unable to start)
❌ **GET /api/health**: Failed (Server unable to start)

### CRUD Endpoints (Failed due to Server Offline)
The following endpoints were queued for testing but failed because the backend server process could not start without a database:

*   ❌ `weekly-logs` (GET, POST, PUT, DELETE)
*   ❌ `publications` (GET, POST, PUT, DELETE)
*   ❌ `committee-meetings` (GET, POST, PUT, DELETE)
*   ❌ `announcements` (GET, POST, PUT, DELETE)
*   ❌ `research-projects` (GET, POST, PUT, DELETE)
*   ❌ `guide-explanations` (GET, POST, PUT, DELETE)
*   ❌ `chairman-reviews` (GET, POST, PUT, DELETE)

---

## Sample JSON Request Bodies (Prepared for POST Endpoints)

If the server were running, these payloads satisfy the required field validations we implemented in Phase 3B:

**1. POST `/api/weekly-logs`**
```json
{
  "scholar_id": "S1001",
  "scholar_name": "John Doe",
  "week_date": "2026-07-06",
  "research_work": "Completed literature review and began data collection."
}
```

**2. POST `/api/publications`**
```json
{
  "scholar_id": "S1001",
  "scholar_name": "John Doe",
  "title": "Optimizing Machine Learning Models",
  "journal": "IEEE Transactions on AI",
  "indexing": ["SCI", "Scopus"]
}
```

**3. POST `/api/committee-meetings`**
```json
{
  "scholar_id": "S1001",
  "scholar_name": "John Doe",
  "title": "First Doctoral Committee Meeting",
  "meeting_date": "2026-08-15",
  "agenda": "Review of research proposal and methodology.",
  "attendees": ["Dr. Smith", "Dr. Johnson"]
}
```

**4. POST `/api/announcements`**
```json
{
  "title": "Upcoming Research Symposium",
  "content": "All scholars must submit their posters by next Friday.",
  "author": "Dr. Chairman"
}
```

**5. POST `/api/research-projects`**
```json
{
  "scholar_id": "S1001",
  "project_title": "AI Driven Supply Chain",
  "research_domain": "Artificial Intelligence",
  "technologies_used": ["Python", "TensorFlow"]
}
```

**6. POST `/api/guide-explanations`**
```json
{
  "scholar_id": "S1001",
  "guide_name": "Dr. Smith",
  "reason_for_delay": "Hardware procurement was delayed by 3 months.",
  "challenges_faced": "Lack of GPU resources.",
  "current_progress": "Theoretical framework is complete."
}
```

**7. POST `/api/chairman-reviews`**
```json
{
  "scholar_id": "S1001",
  "observation": "Scholar has made good progress despite hardware issues.",
  "comments": "Ensure the new timeline is strictly followed.",
  "recommendations": "Provide additional compute access.",
  "required_actions": "Submit revised timeline by next week.",
  "review_status": "continue_research",
  "chairman_name": "Dr. Chairman"
}
```

---

## Warnings
- The backend codebase is complete and structurally sound, but cannot be verified on this specific local sandboxed environment due to the lack of a running MySQL daemon.
- `server.js` is designed to strictly fail-fast if the database is unreachable, which correctly prevents the REST API from running in a broken state. 

## Recommendations
1. **Local Setup**: Install MySQL Server locally, ensure it is running on port `3306`, and create the `rsms_db`.
2. **Schema Import**: Run the `backend/database/schema.sql` file via your MySQL client to build the tables.
3. **Run Server**: Execute `npm run dev` in the `backend` folder. The "MySQL Connected Successfully" message will confirm readiness.
4. **Endpoint Testing**: Use Postman, Insomnia, or `curl` using the sample JSON bodies above to hit `http://localhost:5000/api/...`.
