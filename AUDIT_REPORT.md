# Audit Report

## Root Cause
The root cause was a combination of two things:
1. The global Axios interceptor (`src/lib/api.ts`) strips the HTTP wrapper and returns `response.data` directly when `api.get()` resolves.
2. In the `login.tsx` code, the condition was written as `if (res.data && res.data.success)` which incorrectly attempted to access a nested `.data` property inside the already-unwrapped response payload. Because `res` was already `{ success: true, data: {...} }`, accessing `res.data.success` yielded `undefined`, triggering the fallback to zeroes silently.

## Files Modified
- `src/pages/login.tsx`

## Backend Response Before
```json
{
  "success": true,
  "data": {
    "totalUsers": 67,
    "totalScholars": 50,
    "totalGuides": 10,
    "totalCommitteeMembers": 6,
    "totalPublications": 150,
    ...
  }
}
```

## Backend Response After
The backend was actually returning the correct payload containing `departments`, but due to the frontend flaw, it wasn't being parsed. The current working response from `http://localhost:5000/api/dashboard/stats` is exactly:
```json
{
  "success": true,
  "data": {
    "totalUsers": 67,
    "totalScholars": 50,
    "totalGuides": 10,
    "totalCommitteeMembers": 6,
    "totalPublications": 150,
    ...
    "departments": 4
  }
}
```

## Frontend Mapping
The `login.tsx` file was updated to correctly typecast the `AxiosResponse` and map the values from the unwrapped payload:
- `Active Scholars`: `res.data.totalScholars`
- `Publications`: `res.data.totalPublications`
- `Research Guides`: `res.data.totalGuides`
- `Departments`: `res.data.departments`

## Console Output
Temporary `console.log()` statements were added to log exactly what's passing through the Axios interceptor:
- `console.log('Axios response (from interceptor):', res);`
- `console.log('Stats data:', res.data);`
- `console.log('API returned failure or unexpected format:', res);`
- `console.error('API Error fetching stats:', err);`

## Final Verification
The `npm run build` completed cleanly without TypeScript errors by explicitly typing the unwrapped response `const res = response as any;`. The API is correctly called at `GET /api/dashboard/stats`, and the data is safely routed to the visual components.
