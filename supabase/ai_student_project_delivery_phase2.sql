-- Phase 2 database update for AI Student Project Delivery
-- Adds AI output storage, delivery assets, and project messaging.

create extension if not exists pgcrypto;

alter table if exists ai_projects
  add column if not exists ai_output jsonb default '{}'::jsonb,
  add column if not exists admin_review_notes text,
  add column if not exists is_approved boolean default false,
  add column if not exists approved_at timestamptz,
  add column if not exists delivered_at timestamptz;

create table if not exists project_delivery_assets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references project_orders(id) on delete cascade,
  project_id uuid references ai_projects(id) on delete cascade,
  github_repo_url text,
  zip_file_url text,
  documentation_url text,
  ppt_url text,
  installation_video_url text,
  deployment_guide_url text,
  live_demo_url text,
  demo_credentials text,
  admin_notes text,
  is_approved boolean default false,
  approved_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_project_delivery_assets_order_id on project_delivery_assets(order_id);
create index if not exists idx_project_delivery_assets_project_id on project_delivery_assets(project_id);

create table if not exists project_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references project_orders(id) on delete cascade,
  project_id uuid references ai_projects(id) on delete cascade,
  sender_type text not null,
  sender_name text,
  message text not null,
  is_internal boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_project_messages_order_id on project_messages(order_id);
create index if not exists idx_project_messages_project_id on project_messages(project_id);
