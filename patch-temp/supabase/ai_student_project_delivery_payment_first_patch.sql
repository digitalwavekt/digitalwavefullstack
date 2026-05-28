-- Digital Wave AI Student Project Delivery: Payment-first patch
-- Safe to run on existing Supabase project. Does not drop existing Phase 1 tables.

create extension if not exists pgcrypto;

alter table project_orders
  add column if not exists account_id uuid,
  add column if not exists order_type text default 'project',
  add column if not exists payment_txn_id text,
  add column if not exists payment_gateway_id text,
  add column if not exists admin_notes text;

create table if not exists student_accounts (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  phone text,
  password_hash text not null,
  must_change_password boolean default true,
  status text default 'active',
  last_password_sent_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_student_accounts_email on student_accounts(email);
create index if not exists idx_project_orders_account_id on project_orders(account_id);
create index if not exists idx_project_orders_order_type on project_orders(order_type);
create index if not exists idx_project_orders_payment_txn_id on project_orders(payment_txn_id);

create table if not exists internship_updates (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references project_orders(id) on delete cascade,
  title text not null,
  message text not null,
  visibility text default 'student',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_internship_updates_order_id on internship_updates(order_id);

-- Optional constraints via comments: keep values controlled at API level for now to avoid breaking old rows.
comment on column project_orders.order_type is 'project = direct project buyer, internship = internship plus assigned project buyer';
comment on table student_accounts is 'Temporary-password student dashboard accounts created only after payment success';
comment on table internship_updates is 'Class/news/update feed visible on internship buyer dashboard';
