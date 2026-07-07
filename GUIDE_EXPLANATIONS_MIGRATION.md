# Guide Explanations Migration Report

## Files Modified
1. **`src/lib/monitoring-hooks.ts`**
   - Updated the `useGuideExplanations` hook to fetch data using `api.get('/guide-explanations')` instead of the direct Supabase `.select()` query.
2. **`src/components/scholar-monitoring-drawer.tsx`**
   - Replaced `supabase.insert()` and `supabase.update()` calls specifically for Guide Explanations with their Express equivalents: `api.post('/guide-explanations')` and `api.put('/guide-explanations/:id')`.
   - The `supabase` import is intentionally preserved in this file because the Chairman Reviews module is still relying on it.

## API Endpoints Used
- **GET** `/api/guide-explanations`: Fetches all guide explanations to check compliance for overdue scholars in the dashboard UI.
- **POST** `/api/guide-explanations`: Records a new explanation from a guide regarding a scholar's progress delay.
- **PUT** `/api/guide-explanations/:id`: Updates an existing explanation if the guide needs to revise it.
- *(Note: Delete functionality is intentionally not exposed in the UI for compliance tracking purposes, so the `DELETE` endpoint is not invoked on the client.)*

## JSON Compatibility & Data Types
- **Data Model:** The schema uses standard text fields and timestamps (`reason_for_delay`, `digital_signature`, etc.), mapping perfectly 1:1 between PostgreSQL and MySQL.
- **TypeScript & UI Sync:** The `RawGuideExplanation` type required no modifications. The Express backend perfectly mirrors the `snake_case` JSON structure originally provided by Supabase.

## Testing Performed
- [x] Fetched explanations across all overdue scholars successfully.
- [x] Tested creating a new guide explanation with a digital signature text string.
- [x] Verified that updating an explanation accurately reflects the changes in the UI and pushes to the backend.

## Issues Encountered
- **None:** The transition was entirely seamless. No routing, UI layout, or client-side business logic needed any modification.
