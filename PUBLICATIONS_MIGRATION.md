# Publications Migration Report

## Files Modified
1. **`src/lib/hooks.ts`**
   - Updated the `usePublications` hook to fetch data using `api.get('/publications')` instead of the direct Supabase `.select()` query.
2. **`src/pages/publications.tsx`**
   - Swapped out the direct Supabase CRUD functions with the Express REST equivalents:
     - `api.post('/publications')` for inserting a new publication.
     - `api.put('/publications/:id')` for updating publication details and toggling verification status.
     - `api.delete('/publications/:id')` for removing a publication.
   - Removed the `import { supabase } from '@/lib/supabase';` import to cleanly isolate the module from direct DB access.

## API Endpoints Used
- **GET** `/api/publications`: To fetch the full list of publications.
- **POST** `/api/publications`: To record a new publication entry.
- **PUT** `/api/publications/:id`: To update existing entries and process the chairman/guide verification status.
- **DELETE** `/api/publications/:id`: To delete a specific publication.

## Compatibility Fixes & JSON Handling
- **Indexing Field (JSON Array):** The `indexing` field is handled seamlessly. The frontend sends the array natively through Axios (`{ indexing: ["SCI", "Scopus"] }`). On the backend, because we explicitly specified `['indexing']` in the `BaseModel` array of JSON columns, it automatically stringifies the array on MySQL insert, and parses it back into a native JavaScript array on `GET` requests. No extra compatibility shims or mapping were needed on the frontend.
- **Data Types:** TypeScript types in `RawPublication` are still 100% accurate since the JSON object returned from Express has the exact same `snake_case` property keys as Supabase.

## Issues Encountered
- **No Blocking Issues:** Similar to the Weekly Logs migration, this was a straightforward 1:1 drop-in replacement.
