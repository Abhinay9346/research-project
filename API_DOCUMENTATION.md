# API Documentation

## Authentication & Users
- `POST /api/login` - Authenticates a user and returns a token.
- `GET /api/users` - Retrieves all registered users.
- `POST /api/users` - Creates a new user.
- `PUT /api/users/:id` - Updates user details.
- `DELETE /api/users/:id` - Deletes a user.

## Dashboard & Analytics
- `GET /api/dashboard/stats` - Fetches high-level metrics (total scholars, publications, guides, departments).
- `GET /api/dashboard/analytics` - Retrieves analytical data for charts and graphs.

## Scholars
- `GET /api/scholars` - Fetches all research scholars and their milestones.
- `POST /api/scholars` - Registers a new scholar.
- `PUT /api/scholars/:id` - Updates scholar details or progress.
- `DELETE /api/scholars/:id` - Removes a scholar.

## Publications
- `GET /api/publications` - Fetches all publications.
- `POST /api/publications` - Adds a new publication.
- `PUT /api/publications/:id` - Updates publication status or details.
- `DELETE /api/publications/:id` - Deletes a publication.

## Weekly Logs
- `GET /api/weekly-logs` - Retrieves weekly logs.
- `POST /api/weekly-logs` - Submits a new weekly log.
- `PUT /api/weekly-logs/:id` - Updates or approves a weekly log.
- `DELETE /api/weekly-logs/:id` - Removes a weekly log.

## Committee Meetings
- `GET /api/committee-meetings` - Fetches all scheduled or past meetings.
- `POST /api/committee-meetings` - Schedules a new meeting.
- `PUT /api/committee-meetings/:id` - Updates meeting minutes or status.
- `DELETE /api/committee-meetings/:id` - Cancels/removes a meeting.

## Announcements
- `GET /api/announcements` - Fetches recent announcements.
- `POST /api/announcements` - Creates an announcement.
- `PUT /api/announcements/:id` - Edits an announcement.
- `DELETE /api/announcements/:id` - Deletes an announcement.

## Notifications
- `GET /api/notifications` - Fetches notifications for the logged-in user.
- `POST /api/notifications` - Creates a new system notification.
- `PUT /api/notifications/:id/read` - Marks a notification as read.
- `DELETE /api/notifications/:id` - Removes a notification.
