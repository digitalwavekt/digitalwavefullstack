# Digital Wave AI Student Project Delivery Platform — Merge Blueprint V2

## Current Review Summary

Two codebases were reviewed:

1. `digitalwave-phase1-live-code.zip`
   - Stable Phase 1 live website code.
   - React/Vite frontend.
   - Express backend.
   - Supabase based existing production system.
   - Existing routes include auth, payment, contact, admin, college project, certificate, settings, upload.

2. `phase 2 on going.zip`
   - Phase 1 code plus AI student project delivery module additions.
   - Added AI project order UI, AI project portal, admin AI orders, project templates route, and Supabase SQL.
   - Main problem: AI project order was being created directly before payment and could send user toward portal without payment-first activation.

## What Has Been Fixed In This Patch

### 1. Payment-first flow added

Old risky flow:

```txt
Form submit -> project order created -> portal flow starts
```

Corrected flow:

```txt
Form submit -> draft order created as payment_pending -> PayU payment starts -> payment success callback -> student account created -> temporary password emailed -> student dashboard unlocked
```

### 2. New backend AI order draft endpoint

```txt
POST /api/ai-project-delivery/create-draft
```

Creates only a pending order:

```txt
project_orders.status = payment_pending
project_orders.payment_status = pending
ai_projects.current_stage = payment_pending
```

It does not create a student login account.

### 3. Payment success now activates student access

`backend/src/routes/payment.js` now detects:

```txt
type = ai_project_delivery
```

After PayU success and hash validation:

```txt
finalizePaidStudentOrder()
```

This function:

- Finds project order by `transaction.reference_id`
- Generates temporary password
- Hashes password using bcrypt
- Upserts `student_accounts`
- Updates project order to paid
- Links order with account
- Adds default internship update if order type is internship
- Sends dashboard login email
- Adds audit log

### 4. Student login system added

```txt
POST /api/ai-project-delivery/student/login
POST /api/ai-project-delivery/student/change-password
GET  /api/ai-project-delivery/student/dashboard
```

JWT type:

```txt
type = student
```

This is separate from admin auth, so admin login and student login do not conflict.

### 5. Restricted project chatbot added

```txt
POST /api/ai-project-delivery/student/chatbot/ask
```

Current implementation is rule-based and restricted. It only replies using:

- student name
- order type
- order title
- selected stack/program
- project status
- payment status

Blocked/general topics return a safe restriction message.

Future step: connect OpenAI API with strict system prompt + database context only.

### 6. Frontend payment-first order page updated

`AIProjectOrder.jsx` now:

- Shows order type selector:
  - Only Project
  - Internship + Assigned Project
- Creates draft order
- Calls existing PayU initiate endpoint
- Auto-submits PayU payment form
- Does not open dashboard before payment

### 7. Student dashboard pages added

New pages:

```txt
frontend/src/pages/StudentProjectLogin.jsx
frontend/src/pages/StudentProjectDashboard.jsx
```

New routes:

```txt
/student/project-login
/student/project-dashboard
```

Dashboard shows:

For Only Project:

- project status
- payment status
- selected stack/program
- final asset lock message
- restricted chatbot

For Internship + Project:

- all project fields
- internship updates/news section
- restricted chatbot

### 8. Supabase patch added

New safe SQL patch:

```txt
supabase/ai_student_project_delivery_payment_first_patch.sql
```

It uses:

```sql
create table if not exists
alter table add column if not exists
create index if not exists
```

So it will not drop Phase 1 tables.

## New / Modified Files

### Backend new files

```txt
backend/src/utils/studentMailer.js
backend/src/utils/aiStudentAccess.js
```

### Backend modified files

```txt
backend/src/routes/aiProjectDelivery.js
backend/src/routes/payment.js
```

### Frontend new files

```txt
frontend/src/pages/StudentProjectLogin.jsx
frontend/src/pages/StudentProjectDashboard.jsx
```

### Frontend modified files

```txt
frontend/src/pages/AIProjectOrder.jsx
frontend/src/App.jsx
```

### Database new file

```txt
supabase/ai_student_project_delivery_payment_first_patch.sql
```

## Final Business Flow

### A. Only Project Buyer

```txt
1. Student opens AI project order page
2. Selects Only Project
3. Selects program/stack
4. Fills project requirements
5. Clicks Continue to Payment
6. Backend creates draft order
7. PayU payment opens
8. Payment success callback validates hash
9. Backend creates student account
10. Temporary password sent by email
11. Student logs in at /student/project-login
12. Student dashboard shows project status, docs/status/chatbot
13. Admin reviews/updates project
14. Final delivery unlocks after admin approval
```

### B. Internship + Project Buyer

```txt
1. Student opens AI project order page
2. Selects Internship + Assigned Project
3. Selects internship track
4. Fills details
5. Pays via PayU
6. Payment success creates student account
7. Dashboard shows internship updates + assigned project status
8. Admin can post class/news updates
9. Student tracks project and internship details from same dashboard
```

## Deployment Safety Checklist

### Before deploying backend

Run Supabase SQL in this order:

1. Existing Phase 2 base SQL if not already run:

```txt
supabase/ai_student_project_delivery_phase1.sql
```

2. New payment-first patch:

```txt
supabase/ai_student_project_delivery_payment_first_patch.sql
```

### Backend env required

```env
NODE_ENV=production
DB_TYPE=supabase
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
FRONTEND_URL=https://digitalwaveitsolution.online
FRONTEND_URLS=https://digitalwaveitsolution.online,https://www.digitalwaveitsolution.online

PAYU_KEY=
PAYU_SALT=
PAYU_BASE_URL=https://secure.payu.in/_payment
PAYU_SUCCESS_URL=https://YOUR_BACKEND_DOMAIN/api/payment/success
PAYU_FAILURE_URL=https://YOUR_BACKEND_DOMAIN/api/payment/failure

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
FROM_NAME=Digital Wave IT Solutions
FROM_EMAIL=
```

### Frontend env required

Important: because `frontend/src/lib/api.js` removes trailing `/api`, both of these are safe, but recommended is without `/api`:

```env
VITE_API_URL=https://YOUR_BACKEND_DOMAIN
```

Do not use duplicated path like:

```txt
/api/api/settings
```

### Do not upload/deploy secrets

Remove these from ZIP/GitHub:

```txt
backend/.env
frontend/.env
.env
.env.local
```

Use only:

```txt
.env.example
```

## Errors This Patch Prevents

### 1. Direct dashboard access before payment

Fixed by making `/create-draft` only create `payment_pending` order.

### 2. Student account before payment

Fixed. Student account is created only after PayU success callback.

### 3. Admin/student auth conflict

Fixed. Student JWT has `type: student`, admin JWT remains `type: admin`.

### 4. Phase 1 DB breaking

Fixed by using additive SQL only.

### 5. Duplicate `/api/api` issue

Frontend `api.js` normalizes base URL. Keep frontend endpoint calls starting with `/api/...` and `VITE_API_URL` as backend root URL.

### 6. Missing SMTP should not crash order payment

Email helper logs warning if SMTP is missing. However, for production, SMTP must be configured so student receives password.

## Remaining Important Work Before Production

### Must Do

1. Add admin button to resend student password.
2. Add admin UI for internship updates.
3. Add final asset upload/download module.
4. Add password reset flow.
5. Add status timeline UI.
6. Add PayU success testing with sandbox.
7. Add webhook/idempotency protection for duplicate PayU callbacks.
8. Add frontend payment success page message:
   - “Payment successful. Login credentials have been sent to your email.”

### Should Do

1. Move chatbot from rule-based to OpenAI with strict context-only prompt.
2. Add rate limit specifically for student chatbot.
3. Add admin delivery asset upload with Supabase Storage.
4. Add signed download URLs.
5. Add email template branding.
6. Add audit log viewer in admin.

## Recommended Merge Strategy

1. Keep Phase 1 live branch safe.
2. Create new branch:

```bash
git checkout -b feature/ai-student-delivery-payment-first
```

3. Copy patched files.
4. Run Supabase SQL patch.
5. Test locally.
6. Deploy backend to staging/Render.
7. Deploy frontend preview to Vercel.
8. Test PayU sandbox full flow.
9. Merge to production only after successful payment callback and email login test.

## Local Test Commands

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Health:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/ai-project-delivery/health
```

Create draft test:

```bash
curl -X POST http://localhost:5000/api/ai-project-delivery/create-draft \
  -H "Content-Type: application/json" \
  -d '{
    "orderType":"project",
    "studentName":"Test Student",
    "email":"student@test.com",
    "phone":"9999999999",
    "title":"AI Student Dashboard",
    "internshipProgramType":"mern",
    "techStack":"MERN",
    "features":["Dashboard","Docs","Viva"],
    "amount":4999
  }'
```

Expected response:

```txt
success: true
message: Draft created. Continue to payment.
payment_status: pending
status: payment_pending
```

## Production Rule

No project/internship dashboard access before successful payment.
Student login must be email + temporary password sent after payment success only.
