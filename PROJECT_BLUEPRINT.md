# Digital Wave AI Student Project Delivery Platform Blueprint

## Project Goal
Digital Wave website me AI-powered student project delivery + internship project dashboard module add karna hai.

## Current Existing Phase 1
- Existing website already live hai.
- Frontend React/Vite.
- Backend Express.
- Database Supabase.
- Contact/settings/project templates/internship tracks existing flow working.
- New module ko existing system ke saath merge karna hai bina existing DB/env/server break kiye.

## New Module: AI Student Project Delivery

## Product Types
1. Only Project Buyer
2. Internship + Project Buyer

## Correct User Flow

### Step 1: User Form
User form fill karega:
- Name
- Email
- Phone
- College
- Course/Branch
- Year
- Order type: project or internship
- Selected program/stack
- Project requirements
- Deadline

### Step 2: Payment
Form submit ke baad payment page open hoga.
Order active tabhi hoga jab payment success hoga.

### Step 3: Payment Success
Payment success ke baad:
- Student order create/update hoga
- Payment status paid hoga
- Temporary password generate hoga
- Password hash DB me save hoga
- Student ke email par login URL + email + temporary password jayega

### Step 4: Student Login
Student same email + temporary password se login karega.

### Step 5: Student Dashboard

For Only Project:
- Project status
- Project scope
- Selected stack
- Documents
- Viva questions
- Installation guide
- Deployment guide
- Final delivery assets
- Project-related chatbot

For Internship + Project:
- Internship status
- Class updates/news
- Selected internship track
- Assigned project
- Project status
- Documents
- Viva questions
- Installation guide
- Deployment guide
- Internship + project chatbot

## AI Chatbot Rules
Chatbot sirf student ke purchased project/internship se related answer dega.
Allowed context:
- Student name
- Order type
- Selected stack/program
- Project scope
- Admin notes
- Uploaded documents
- Internship updates
- FAQs
- Current status

Blocked:
- Random topic
- Politics
- General internet answers
- Other student data
- Admin/internal data

## Required Backend APIs

### Payment
- POST /api/student-orders/create-payment-order
- POST /api/student-orders/payment-success

### Student Auth
- POST /api/student-auth/login
- POST /api/student-auth/change-password
- GET /api/student-dashboard/me

### Dashboard
- GET /api/student-dashboard/orders
- GET /api/student-dashboard/assets
- GET /api/student-dashboard/updates

### Chatbot
- POST /api/student-chatbot/ask

### Admin
- GET /api/admin/student-orders
- PATCH /api/admin/student-orders/:id/status
- POST /api/admin/student-orders/:id/assets
- POST /api/admin/internship-updates

## Required Tables

### student_orders
Stores project/internship purchase order.

### student_accounts
Stores student login credentials.

### student_project_assets
Stores uploaded/generated files.

### internship_updates
Stores internship class/news updates.

### student_chat_logs
Stores chatbot logs.

## Merge Safety Rules
- Do not remove existing working Phase 1 routes.
- Do not rename existing env variables without fallback.
- New module routes should be isolated under /api/student-* or /api/ai-project-delivery.
- Existing Supabase tables should not be dropped.
- New tables should use create table if not exists.
- Frontend API base URL should not duplicate /api.
- Production and local env should remain separate.

## Current Problem/Status
- Initial /api/api/settings issue fixed by API base URL correction.
- AI project form was posting to backend.
- Direct submit flow stopped because final business flow requires payment first.
- Next implementation should start from payment-first architecture.