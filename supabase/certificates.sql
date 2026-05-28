-- Digital Wave certificate issuing support
-- Safe to run multiple times in Supabase SQL Editor.

create extension if not exists "pgcrypto";

alter table if exists students
  add column if not exists certificate_available boolean default false,
  add column if not exists certificate_id text;

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_id text unique not null,
  student_id uuid references students(id) on delete cascade,
  student_name text not null,
  course_name text,
  duration text,
  verification_token text unique not null,
  verification_url text,
  pdf_url text,
  status text default 'issued',
  issue_date date default current_date,
  revoked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_certificates_student_id on certificates(student_id);
create index if not exists idx_certificates_verification_token on certificates(verification_token);
create index if not exists idx_certificates_status on certificates(status);
