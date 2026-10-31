# BundleSystem — Demonstration & Testing Plan

## 1. Demo Strategy

**How the application will be demonstrated:** a live walkthrough on a local multi-tier deployment (React/Vite on :5173, Express API on :3000, MySQL), starting from the Login screen and following the real business flow: configure data (Office Manager) → assign inventory → transfer between users → deliver to a client → review reports.

**Test data used** (real records already in MySQL):

| Data | Value used in the demo |
|---|---|
| Office Manager account | josevaca@gmail.com (user_id 1 — "José Vaca") |
| Field Force account | dvasquezjim@gmail.com (user_id 4 — "Damaris Vasquez") |
| City Manager account | Maritza Cardozo (MI ID 6758838608) |
| Bundles | Real serials, e.g. `71617/CEAGDF6R304850` (REDMI Buds 8 Lite) |
| Smartphones | Real IMEIs, e.g. `866953086457580` |
| Stores | Real stores with codes and cities (e.g. IMPERIO MOBILE* — Santa Cruz) |
| Excel imports | Files built from the app's own downloadable templates |

**Environment prerequisites:** MySQL running, `npm run dev` in `backend/` and `frontend/`.

---

## 2. Requirement Verification

Each requirement is verified by a concrete procedure. A requirement is **fulfilled** only if all acceptance criteria are met; it is **not fulfilled** if any failure condition occurs.

### REQ-01 — The app shall authenticate users with email and password

- **Verification:** Open Login → enter valid email/password → press *Iniciar Sesión*.
- **Acceptable:** user object stored in `localStorage`, dashboard renders, sidebar shows menus allowed for the user's level.
- **Not fulfilled:** wrong credentials accepted; valid credentials rejected; session not persisted after reload; password visible anywhere (stored in plain text in DB or sent back by the API).

### REQ-02 — The app shall lock the account after 5 failed login attempts

- **Verification:** enter a wrong password 4 times → observe "Te quedan X intentos" → fail a 5th time.
- **Acceptable:** `user.failed_attempts` increments in DB; after the 5th, `locked_until` = next day 00:00 and even a correct password is rejected until then.
- **Not fulfilled:** unlimited attempts allowed; counter does not persist; locked account still logs in.

### REQ-03 — The app shall restrict management pages to Office Manager

- **Verification:** log in as Field Force → inspect the sidebar for Users/Stores/Projects/Distributors; log in as Office Manager → repeat.
- **Acceptable:** Field Force sees only Reports, Delivery, Share/Receive; Office Manager sees all management pages. Navigation options for hidden pages do not exist (not merely disabled).
- **Not fulfilled:** a non-Office-Manager can open management pages (menu or direct access); API endpoints accept write requests from unauthorized levels.

### REQ-04 — The app shall scope City Manager data to self + team

- **Verification:** log in as a City Manager → open Bandeos and Reports.
- **Acceptable:** only bundles owned by the manager or by users whose `head_in_charge` is that manager appear; report KPIs/charts show the same scope.
- **Not fulfilled:** the manager sees bundles/data of unrelated users; SQL scope (`head_in_charge`) missing → full inventory shown.

### REQ-05 — The app shall provide CRUD for the base catalogs

- **Verification:** for Users, Stores, Projects, Bundle Models, Smartphone Models, Distributors — create one record, edit it, delete it (confirmation modal), confirm in the table/DB.
- **Acceptable:** record persists in the corresponding MySQL table with the fields the schema requires; edits reflect immediately; deletion asks for confirmation and removes the row.
- **Not fulfilled:** record not persisted; required schema fields missing from the form; delete happens without confirmation; validation allows empty/invalid data.

### REQ-06 — The app shall import bulk records from Excel

- **Verification:** download each template → fill with valid + intentionally invalid rows (e.g., unknown MI ID, nonexistent project) → import.
- **Acceptable:** valid rows are inserted and linked correctly (stores by MI ID, bundles auto-assigned to the importing user, smartphones with `tag_model` from IMEI); a per-row error report identifies each invalid row and reason; invalid rows do not partially insert.
- **Not fulfilled:** invalid rows silently inserted; no error feedback; file format other than the template's accepted wrongly; import crashes on bad data.

### REQ-07 — The app shall assign a bundle and record it in transfer_history

- **Verification:** as Office Manager, assign a bundle to a user → inspect `transfer_history`.
- **Acceptable:** `bundle.user_id` = new owner; `transfer_history` row has `bundle_id`, `old_user_id`, `new_user_id`, `manager_user_id` = the session user's ID, `status='completed'`.
- **Not fulfilled:** ownership changes without audit row; `manager_user_id` missing or wrong (not the actor); assignment succeeds for bundles not available.

### REQ-08 — The app shall implement the share/approve transfer lifecycle

- **Verification:** as Field Force A, share a bundle to MI ID of B → confirm row `status='transfering'` and that A still owns the bundle → as B open Recibir Bandeos → approve; repeat for reject and for sender-cancel.
- **Acceptable:** while `transfering`, the bundle cannot be re-transferred; approve → `completed` + `bundle.user_id` changes; reject → `rejected` + ownership unchanged; cancel → `canceled` + ownership unchanged; only the recipient can approve/reject; confirmation modals appear before each decision.
- **Not fulfilled:** bundle changes owner before approval; a non-recipient can resolve the transfer; a second transfer of the same pending bundle is allowed; actions execute without confirmation.

### REQ-09 — The app shall register a delivery with verified data

- **Verification:** as Field Force, enter own available serial + valid IMEI + client name + 8-digit phone + photo + store → register. Then repeat with a serial not owned / already delivered.
- **Acceptable:** success inserts `bundle_delivered` (client data, photo file, store_code, date) and sets bundle + smartphone to `delivered`; photo saved under `/uploads`; invalid serial/IMEI/phone rejected with a clear message; store resolved by searchable lookup.
- **Not fulfilled:** delivery saved with invalid or someone else's serial; status fields not updated; photo missing; transaction left half-done (e.g., delivered row exists but bundle still `available`).

### REQ-10 — The app shall scan CODE_128 with the device camera

- **Verification:** on a camera-enabled device, use the scanner icon next to serial/IMEI/MI ID fields and scan a printed barcode.
- **Acceptable:** modal opens the camera, decodes CODE_128, fills the field and triggers the same validation as manual input.
- **Not fulfilled:** scanner fails to decode CODE_128; scanned value bypasses validation; no camera fallback (manual input must always remain available).

### REQ-11 — The app shall filter table columns and show empty results

- **Verification:** in Bundles/Smartphones/Stores/Deliveries tables, use the magnifier on each column; then search for a nonexistent value.
- **Acceptable:** rows filter live by that column only; "No results" message shown when nothing matches; active filter visibly marks the column.
- **Not fulfilled:** filter does nothing; filters the wrong column; no empty-state feedback.

### REQ-12 — The app shall scope the reports dashboard by role

- **Verification:** compare the dashboard as Office Manager vs. Field Force (KPIs, charts, deliveries table).
- **Acceptable:** Office Manager sees all charts + User/City columns; Field Force sees only own-scope KPIs, Deliveries by Store/Day, and table without User/City columns; the numbers match the DB scope (`?userId=&levelUser=`).
- **Not fulfilled:** Field Force sees restricted charts/columns; any user can pass another `userId` and read foreign data; totals inconsistent with the database.

### REQ-13 — The app shall keep an inactive user from operating

- **Verification:** while a user is logged in, an admin sets `status='inactive'` → the user makes any request.
- **Acceptable:** API responds 403, the frontend clears the session and redirects to login immediately.
- **Not fulfilled:** inactive user keeps navigating/loading data until manual logout.

---

## 3. Acceptance ranges (summary)

| Criterion | Acceptable | Out of range |
|---|---|---|
| Auth latency | login < 2 s on localhost | > 5 s or silent failure |
| Lockout threshold | exactly at 5th failure | lock before 5, or never |
| Transfer atomicity | owner + status change in one transaction | either side applied alone |
| Import tolerance | ≥1 invalid row reported, rest processed | full import aborts or ignores errors |
| Scope enforcement | enforced server-side in SQL/API | enforced only by hiding UI elements |
| Audit completeness | every owner change has a `transfer_history` row | any change without history |
