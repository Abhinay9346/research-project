# Research Projects Migration Report

## Files Modified
1. **`src/lib/monitoring-hooks.ts`**
   - Updated `useResearchProjects` hook to fetch data using `api.get('/research-projects')` instead of the direct Supabase `.select()` query.
2. **`src/components/scholar-monitoring-drawer.tsx`**
   - Added `import api from '@/lib/api';`. (Intentionally kept the `supabase` import to preserve the unmigrated Guide Explanations and Chairman Reviews modules in this file).
   - Replaced `supabase.insert()` and `supabase.update()` calls specifically for Research Projects with their Express equivalents: `api.post('/research-projects')` and `api.put('/research-projects/:id')`.

## API Endpoints Used
- **GET** `/api/research-projects`: Fetches all projects to populate the dashboard stats and scholar drawer data.
- **POST** `/api/research-projects`: Records a new research project summary for a scholar.
- **PUT** `/api/research-projects/:id`: Updates an existing research project (e.g. progress percentage, status, technologies used).
- *(Note: Delete functionality is currently not exposed in the frontend UI for Research Projects, so the `DELETE` endpoint is not invoked, although it is available on the backend.)*

## JSON Compatibility & Business Logic
- **technologies_used & uploaded_reports (JSON Arrays):** Handled natively. The UI converts a comma-separated string into a standard array, and Axios sends it as JSON. The Express backend stringifies the array on insert, and parses it on fetch as defined in the `BaseModel` config.
- **progress_percentage (Integer):** Maps perfectly to the MySQL integer column with unchanged state logic.
- **thesis_status (Enum):** The thesis status string values (`not_started`, `in_progress`, `submitted`, `under_review`, `approved`, `rejected`) perfectly match the MySQL ENUM structure.

## Testing Performed
- [x] Fetched scholars list and opened a scholar drawer successfully.
- [x] Simulated creating a new research project entry.
- [x] Updated the progress percentage of a project.
- [x] Verified `technologies_used` array split logic successfully populates the database and retrieves cleanly.

## Issues Encountered
- **None:** The transition was completely seamless. No UI or routing logic needed modification.
