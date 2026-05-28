# Digital Wave AI Student Project Delivery Platform — Merge & Deployment Blueprint

## 1. Files reviewed

### Phase 1 live code
- ZIP: `digitalwave-phase1-live-code.zip`
- Existing stack: React + Vite frontend, Express backend, Supabase database.
- Existing live modules found:
  - Admin login/dashboard
  - Contact form
  - Internship/payment flow
  - College project form
  - Certificate download/verify
  - Settings panel
  - Student dashboard
  - PayU payment route

### Phase 2 ongoing code
- ZIP: `phase 2 on going.zip`
- New module work added:
  - `backend/src/routes/aiProjectDelivery.js`
  - `backend/src/routes/projectTemplates.js`
  - `frontend/src/pages/AIProjectOrder.jsx`
  - `frontend/src/pages/AIProjectPortal.jsx`
  - `frontend/src/components/admin/AIProjectOrders.jsx`
  - Supabase SQL: `supabase/ai_student_project_delivery_phase1.sql`
  - Admin dashboard AI Projects tab
  - New routes in `App.jsx`

## 2. What has been done so far

### Backend additions
- AI project delivery route mounted at:
  - `/api/ai-project-delivery`
- Project templates route mounted at:
  - `/api/project-templates`
- Current AI project form route:
  - `POST /api/ai-project-delivery/submit`
- Current admin AI project route:
  - `GET /api/ai-project-delivery/admin/orders`
- Current student lookup route:
  - `GET /api/ai-project-delivery/student/order-lookup`
- Current student token route:
  - `GET /api/ai-project-delivery/student/my-projects`

### Frontend additions
- New page route:
  - `/ai-project-order`
- New student portal route:
  - `/student/ai-projects`
- Existing college project page has been changed to submit to:
  - `/api/ai-project-delivery/submit`
- Admin dashboard has new `AI Projects` tab.

### Database additions
The Phase 2 SQL creates:
- `internship_program_templates`
- `project_orders`
- `project_requirements`
- `ai_projects`
- `ai_jobs`
- `generated_artifacts`
- `admin_reviews`
- `delivery_unlocks`
- `chatbot_sessions`
- `chatbot_messages`
- `audit_logs`

It also seeds internship templates:
- MERN
- AI / Machine Learning
- Python
- Web Development
- Mobile App Development
- Data Science

## 3. Important finding: current Phase 2 flow is not final business flow

The current Phase 2 code still creates project order directly before confirmed payment.

Current behavior:
1. User fills project form.
2. Frontend calls `/api/ai-project-delivery/submit`.
3. Backend creates `project_orders` record with `payment_status = pending`.
4. Frontend navigates user to AI project portal.

This is NOT the final required flow.

## 4. Final required business flow

### Product types
1. Only Project Buyer
2. Internship + Project Buyer

### Correct flow for Only Project Buyer
1. Student fills project order form.
2. Backend creates a draft/pending order or pending transaction reference.
3. Payment page opens.
4. Payment success callback verifies PayU hash.
5. Order becomes active only after payment success.
6. Temporary student password is generated.
7. Password hash is stored in DB.
8. Login details are emailed to student.
9. Student logs in with email + temporary password.
10. Student dashboard opens.
11. Student sees only their own project status, scope, files, guides, viva, PPT, and project-related chatbot.

### Correct flow for Internship + Project Buyer
1. Student selects internship/program.
2. Payment page opens.
3. Payment success creates/activates internship enrollment.
4. Temporary student password is generated.
5. Login email is sent.
6. Student dashboard opens.
7. Dashboard includes:
   - Internship status
   - Class/news updates
   - Assigned project
   - Project status
   - Docs/PPT/viva/install/deploy assets
   - Project + internship related chatbot

## 5. Required change before deployment

### A. Do not let `/submit` activate final order directly
Current `/submit` route should be converted into one of these safer patterns:

Option 1 — Recommended:
- `POST /api/student-orders/create-payment-order`
- This creates a pending order and PayU transaction.
- It returns PayU action + payload.

Then:
- `POST /api/payment/success` or PayU callback verifies payment.
- Backend activates order.
- Backend creates student account.
- Backend sends login email.

Option 2 — Temporary local testing:
- Keep `/submit`, but mark clearly as test-only.
- Never unlock dashboard until payment is completed.

### B. Extend PayU success logic
Current `backend/src/routes/payment.js` only handles:
- `college-project`
- `internship`

Need to add support for:
- `ai-project`
- `internship-project`

On successful payment:
- Update `transactions.status = completed`
- Update `project_orders.payment_status = paid`
- Update `project_orders.status = requirements_received` or `paid`
- Create/activate student account
- Send email with login URL + email + temporary password

### C. Add student login table
Current code has student JWT route but no final dedicated student login/password system for AI project buyers.

Add table:
- `student_accounts`

Required columns:
- `id`
- `student_email`
- `student_name`
- `password_hash`
- `temporary_password_used`
- `must_change_password`
- `account_status`
- `last_login_at`
- `created_at`
- `updated_at`

### D. Add student auth APIs
Required APIs:
- `POST /api/student-auth/login`
- `POST /api/student-auth/change-password`
- `GET /api/student-dashboard/me`
- `GET /api/student-dashboard/orders`
- `GET /api/student-dashboard/assets`
- `GET /api/student-dashboard/updates`

### E. Add internship update table
For internship buyers only:
- `internship_updates`

Required columns:
- `id`
- `program_slug`
- `title`
- `message`
- `resource_url`
- `visible_from`
- `created_by`
- `created_at`

### F. Add controlled chatbot
Required API:
- `POST /api/student-chatbot/ask`

Chatbot must only answer from:
- Student name
- Student order
- Project scope
- Selected stack/program
- Admin notes
- Uploaded/generated files metadata
- Internship updates
- Approved FAQs
- Current project status

Blocked examples:
- Politics
- Random internet queries
- Other students' details
- Admin-only data
- Internal secrets

## 6. Deployment error prevention checklist

### Environment variable rule
Frontend `VITE_API_URL` should be base backend origin only, without `/api`.

Correct:
```env
VITE_API_URL=https://your-backend-domain.com
```

Wrong:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

Reason: many frontend files call endpoints like:
```js
/api/auth/admin-login
/api/payment/initiate
/api/contact
```

If `VITE_API_URL` already contains `/api`, final URL becomes:
```txt
/api/api/...
```

This caused the previous `/api/api/settings` 404 issue.

### Standard API helper rule
Use one API helper everywhere:
```js
apiFetch('/api/route-name')
```

Avoid direct fetch with inconsistent base URL logic.

Files that should be standardized later:
- `frontend/src/pages/AdminLogin.jsx`
- `frontend/src/pages/Contact.jsx`
- `frontend/src/pages/Internship.jsx`
- `frontend/src/pages/StudentDashboard.jsx`
- `frontend/src/pages/CertificateDownload.jsx`
- `frontend/src/components/admin/Overview.jsx`

### CORS rule
Backend must allow:
- Local frontend: `http://localhost:5173`
- Production frontend root domain
- Production frontend www domain
- Any Vercel preview domain if used

Production env should include:
```env
FRONTEND_URL=https://digitalwaveitsolution.online
FRONTEND_URLS=https://digitalwaveitsolution.online,https://www.digitalwaveitsolution.online
```

### Supabase rule
Backend DB env must include:
```env
DB_TYPE=supabase
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

Do not use only anon key on backend for admin/order/payment writes.

### PayU rule
Backend must include:
```env
PAYU_KEY=...
PAYU_SALT=...
PAYU_BASE_URL=https://secure.payu.in/_payment
PAYU_SUCCESS_URL=https://your-backend-domain.com/api/payment/success
PAYU_FAILURE_URL=https://your-backend-domain.com/api/payment/failure
```

For testing use test URL, for production use production URL.

### JWT rule
Backend must include strong JWT secret:
```env
JWT_SECRET=long_random_secret
```

Student token and admin token can use same secret initially, but payload must include role/type.

Example:
```js
{ email, role: 'student', accountType: 'ai_project_student' }
```

### Email rule
Temporary password mail requires mail env:
```env
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
FROM_EMAIL=...
```

Or map to the existing email variables already used in Phase 1.

## 7. Security warning from uploaded ZIP

The Phase 2 ZIP contains:
- `backend/.env`
- `frontend/.env`

Before GitHub commit/deployment sharing:
- Remove `.env` from ZIP/repo.
- Keep only `.env.example`.
- If real keys were uploaded/shared anywhere, rotate them.

Required `.gitignore` entries:
```gitignore
.env
.env.local
.env.production
.env.development
node_modules
.vercel
dist
build
coverage
```

## 8. Phase 1 merge strategy

Do not replace full Phase 1 blindly.

Use safe merge:

### Backend safe merge
Add only:
- `src/routes/aiProjectDelivery.js`
- `src/routes/projectTemplates.js`

Modify only:
- `src/server.js`

Required server imports:
```js
import projectTemplateRoutes from './routes/projectTemplates.js'
import aiProjectDeliveryRoutes from './routes/aiProjectDelivery.js'
```

Required server mounts:
```js
app.use('/api/project-templates', projectTemplateRoutes)
app.use('/api/ai-project-delivery', aiProjectDeliveryRoutes)
```

Do not remove existing routes:
- `/api/auth`
- `/api/student`
- `/api/payment`
- `/api/contact`
- `/api/admin`
- `/api/college-project`
- `/api/certificate`
- `/api/settings`
- `/api/upload`

### Frontend safe merge
Add only:
- `src/pages/AIProjectOrder.jsx`
- `src/pages/AIProjectPortal.jsx`
- `src/components/admin/AIProjectOrders.jsx`

Modify carefully:
- `src/App.jsx`
- `src/pages/AdminDashboard.jsx`
- `src/pages/CollegeProject.jsx`
- `src/lib/api.js`

Do not break existing pages:
- Home
- Internship
- Admin login
- Contact
- Certificate
- StudentDashboard
- PaymentSuccess
- PaymentFailed

## 9. Current Phase 2 changes still needed

### Must fix before production
1. Payment-first architecture.
2. Student account/password creation after payment success.
3. Email login details after payment success.
4. Student dashboard with real auth, not only email/order lookup.
5. Chatbot restricted to order/internship context.
6. PayU success handling for AI project order types.
7. Admin can update status and upload/deliver assets.
8. Remove `.env` files from repo/ZIP.
9. Standardize API calls to avoid `/api/api`.
10. Run Supabase migration before testing backend route.

### Good to keep from Phase 2
1. `internship_program_templates` concept.
2. Project template based generation planning.
3. `project_orders`, `project_requirements`, `ai_projects` structure.
4. Admin AI Projects page idea.
5. AI Project Portal route idea.
6. Program-specific outputs for MERN, AI/ML, Python, Web, App, Data Science.

## 10. Recommended next implementation phases

### Phase 2A — Payment-first order flow
Backend:
- Create pending order.
- Create PayU transaction.
- Redirect/open PayU page.
- Verify success callback.
- Activate order only after payment.

Frontend:
- Form submit should initiate payment, not open portal directly.
- Show payment processing state.

### Phase 2B — Student auth and email password
Backend:
- Generate temporary password.
- Hash with bcrypt.
- Save in `student_accounts`.
- Send email.
- Create JWT login.

Frontend:
- Student login page.
- Student dashboard protected route.

### Phase 2C — Admin delivery workflow
Admin can:
- View orders.
- Change project status.
- Add notes.
- Upload files/assets.
- Mark ready for review.
- Approve final delivery.
- Unlock delivery.

### Phase 2D — Internship updates
Admin can:
- Create class/news update by program.
- Student dashboard shows only updates for purchased internship/program.

### Phase 2E — Restricted AI chatbot
Backend:
- Fetch order context.
- Fetch assets/notes/updates.
- Build limited prompt.
- Block unrelated questions.
- Save chat logs.

### Phase 2F — Final deployment hardening
- Build frontend locally.
- Start backend locally.
- Test health route.
- Test payment initiation.
- Test PayU callback in test mode.
- Test CORS from production domain.
- Test admin permissions.
- Test student login.
- Test dashboard protected data.

## 11. Deployment smoke test commands

### Backend local
```bash
cd backend
npm install
npm run dev
```

Test:
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/project-templates
```

### Frontend local
```bash
cd frontend
npm install
npm run build
npm run dev
```

### API duplicate check
Search frontend for bad URL usage:
```bash
grep -R "/api/api" -n src
```

Search all direct fetch calls:
```bash
grep -R "fetch(`" -n src
```

### Supabase SQL
Run before backend testing:
```sql
-- run supabase/ai_student_project_delivery_phase1.sql
```

## 12. Final target dashboard behavior

### Only Project Buyer dashboard
- Welcome by student name.
- Project card.
- Payment status.
- Project status tracker.
- Scope and requirements.
- Admin notes.
- Docs/PPT/viva/install/deploy assets.
- Restricted chatbot.

### Internship + Project Buyer dashboard
Everything from project buyer, plus:
- Internship program name.
- Class schedule/news.
- Internship updates.
- Assigned project.
- Learning resources.

## 13. Recommended status values

### Payment status
- `pending`
- `paid`
- `failed`
- `refunded`

### Order status
- `payment_pending`
- `paid`
- `requirements_received`
- `planning`
- `in_development`
- `ai_generating`
- `admin_review`
- `changes_required`
- `approved`
- `delivery_unlocked`
- `delivered`
- `cancelled`

### AI generation status
- `not_started`
- `queued`
- `generating`
- `failed`
- `completed`

## 14. Immediate next coding task

Do this next, not random dashboard expansion:

1. Add `student_accounts` table.
2. Add `order_type` column to `project_orders`:
   - `only_project`
   - `internship_project`
3. Add `payment_txn_id` column to `project_orders`.
4. Change frontend submit to call payment initiate.
5. Add PayU success logic for AI project orders.
6. Generate temporary password after payment success.
7. Email student login credentials.
8. Add student login page.
9. Protect student dashboard with JWT.

