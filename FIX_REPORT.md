# Fix Report

**Files modified:**
- `src/pages/login.tsx`
- `backend/controllers/dashboardController.js`

**Bug root cause:**
The frontend login page was expecting properties named `activeScholars`, `publications`, and `researchGuides`, but the backend was returning `totalScholars`, `totalPublications`, and `totalGuides`. Because the fields didn't match, they were falling back to 0. In addition, the `departments` count was correctly requested by the frontend but had been removed from the backend response in my previous correction.

**Exact mapping fixed:**
In `src/pages/login.tsx`, the `stats` state and API response mapping were updated to correctly match the backend's original field names:
- `activeScholars` -> `totalScholars`
- `publications` -> `totalPublications`
- `researchGuides` -> `totalGuides`
- `departments` -> `departments`

**Backend query added:**
In `backend/controllers/dashboardController.js`, the departments count was added and properly injected into the response:
```sql
SELECT COUNT(DISTINCT department) AS departments
FROM users
WHERE department IS NOT NULL
AND department <> '';
```

**Build status:**
The frontend build (`npm run build`) completed successfully with zero TypeScript errors.
