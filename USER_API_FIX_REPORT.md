# User API Fix Report

## Issue Identified
The `GET /api/users` endpoint was crashing due to a `mysql2` validation error:
`"Bind parameters must not contain undefined. To pass SQL NULL specify JS null."`

This occurred when executing `db.execute()` or `db.query()` with parameter arrays containing `undefined`. Specifically, properties like `req.user.scholarId` and `req.user.userName` could be `undefined` depending on the role making the request and the presence of custom headers.

## Files Audited
- `backend/controllers/userController.js`
- `backend/middleware/authMiddleware.js`
- *(Note: `roleFilter.js` was not found in the project's middleware directory, but all relevant role checks in the controller were audited.)*

## Fixes Applied

In `userController.js`:
1. Updated `getUsers` parameter arrays to fallback to `null` if the property is undefined.
   ```javascript
   // Before
   queryParams.push(req.user.scholarId);
   // After
   queryParams.push(req.user.scholarId || null);
   
   // Before
   queryParams.push(req.user.userName, req.user.userName);
   // After
   queryParams.push(req.user.userName || null, req.user.userName || null);
   ```

2. Updated `updateUser` parameter array to prevent the same issue on optional fields.
   ```javascript
   // Before
   [full_name, email, role, department || null, id]
   // After
   [full_name || null, email || null, role || null, department || null, id || null]
   ```

## Testing Performed
A verification script was run against `GET /api/users` simulating headers for the following roles:
- `Admin`
- `Chairman`
- `Guide`
- `Scholar`

### Test Results
| Role     | Endpoint         | Expected Status | Actual Status | Result |
| -------- | ---------------- | --------------- | ------------- | ------ |
| Admin    | `GET /api/users` | 200             | 200           | ✅ PASS |
| Chairman | `GET /api/users` | 200             | 200           | ✅ PASS |
| Guide    | `GET /api/users` | 200             | 200           | ✅ PASS |
| Scholar  | `GET /api/users` | 200             | 200           | ✅ PASS |

The backend successfully executes the SQL statements and returns HTTP 200 for all user roles. No frontend code was modified during this fix.
