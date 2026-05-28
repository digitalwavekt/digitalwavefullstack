-- Digital Wave AI Student Project Delivery Platform - Phase 1
-- Run this in Supabase SQL Editor.
-- Safe to run multiple times because tables use IF NOT EXISTS and seed uses ON CONFLICT.

create extension if not exists "pgcrypto";

create table if not exists internship_program_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  default_stack jsonb default '{}',
  required_outputs jsonb default '[]',
  prompt_rules jsonb default '{}',
  viva_focus jsonb default '[]',
  docs_structure jsonb default '[]',
  deployment_rules jsonb default '{}',
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists project_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  student_name text,
  student_email text not null,
  student_phone text,
  college text,
  branch text,
  year text,
  order_number text unique not null,
  title text not null,
  category text,
  internship_program_type text,
  project_domain text,
  delivery_template_id uuid references internship_program_templates(id),
  tech_stack text not null,
  deadline date,
  priority text default 'normal',
  status text default 'payment_pending',
  estimated_delivery timestamp,
  payment_status text default 'pending',
  total_amount numeric(10,2),
  currency text default 'INR',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index if not exists idx_project_orders_student_email on project_orders(student_email);
create index if not exists idx_project_orders_status on project_orders(status);
create index if not exists idx_project_orders_program on project_orders(internship_program_type);

create table if not exists project_requirements (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references project_orders(id) on delete cascade,
  feature_list jsonb default '[]',
  documentation_required boolean default false,
  ppt_required boolean default false,
  deployment_required boolean default false,
  custom_notes text,
  reference_links jsonb default '[]',
  attachments jsonb default '[]',
  created_at timestamp default now()
);

create table if not exists ai_projects (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references project_orders(id) on delete cascade,
  generation_status text default 'not_started',
  architecture_status text default 'pending',
  frontend_status text default 'pending',
  backend_status text default 'pending',
  docs_status text default 'pending',
  ppt_status text default 'pending',
  qa_status text default 'pending',
  packaging_status text default 'pending',
  current_stage text default 'waiting',
  failure_reason text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists ai_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references ai_projects(id) on delete cascade,
  job_type text not null,
  provider text default 'gemini',
  model text,
  prompt_hash text,
  status text default 'queued',
  attempts int default 0,
  started_at timestamp,
  completed_at timestamp,
  error_log text,
  cost_estimate numeric(10,4),
  token_usage jsonb default '{}',
  created_at timestamp default now()
);

create table if not exists generated_artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references ai_projects(id) on delete cascade,
  artifact_type text not null,
  file_name text not null,
  storage_path text not null,
  version int default 1,
  checksum text,
  is_final boolean default false,
  created_at timestamp default now()
);

create table if not exists admin_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references ai_projects(id) on delete cascade,
  reviewer_id uuid,
  review_status text default 'pending',
  notes text,
  approved_at timestamp,
  created_at timestamp default now()
);

create table if not exists delivery_unlocks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references ai_projects(id) on delete cascade,
  unlocked_by uuid,
  unlock_time timestamp default now(),
  student_notified boolean default false
);

create table if not exists chatbot_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  student_email text,
  project_id uuid references ai_projects(id) on delete cascade,
  session_title text,
  created_at timestamp default now()
);

create table if not exists chatbot_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chatbot_sessions(id) on delete cascade,
  role text not null,
  message text not null,
  token_usage jsonb default '{}',
  created_at timestamp default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_type text,
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb default '{}',
  ip text,
  created_at timestamp default now()
);

insert into internship_program_templates
(name, slug, description, default_stack, required_outputs, viva_focus, docs_structure, deployment_rules)
values
(
  'MERN Stack Internship',
  'mern',
  'Full-stack web development using MongoDB, Express, React/Next.js and Node.js.',
  '{"frontend":"React / Next.js","backend":"Node.js + Express","database":"MongoDB / Supabase","auth":"JWT","deployment":"Vercel + AWS EC2/Render"}',
  '["frontend_code","backend_code","api_docs","db_schema","readme","installation_guide","viva_questions","ppt","project_report"]',
  '["React","Node.js","Express","Database","REST API","Authentication","Deployment"]',
  '["Abstract","Introduction","Objectives","System Architecture","Modules","Database Design","API Design","Testing","Conclusion"]',
  '{"frontend":"Vercel","backend":"AWS EC2 / Render","database":"MongoDB Atlas / Supabase"}'
),
(
  'AI / Machine Learning Internship',
  'ai-ml',
  'AI and ML project delivery with dataset, model, training, evaluation and report.',
  '{"language":"Python","libraries":["Pandas","NumPy","Scikit-learn","Matplotlib"],"optional_app":"Flask / Streamlit"}',
  '["dataset_description","model_pipeline","training_code","accuracy_report","notebook","readme","viva_questions","ppt","project_report"]',
  '["Dataset","Model","Training","Testing","Accuracy","Confusion Matrix","Use Cases"]',
  '["Abstract","Problem Statement","Dataset","Methodology","Algorithm","Results","Evaluation","Conclusion"]',
  '{"app":"Streamlit / Flask optional","notebook":"Jupyter Notebook"}'
),
(
  'Python Development Internship',
  'python',
  'Python-based software project with scripts, automation, Flask or CLI app.',
  '{"language":"Python","frameworks":["Flask","FastAPI optional"],"database":"SQLite / Supabase"}',
  '["source_code","readme","installation_guide","viva_questions","project_report","ppt"]',
  '["Python Basics","OOP","APIs","Database","File Handling","Deployment"]',
  '["Abstract","Introduction","Modules","Flow","Implementation","Testing","Conclusion"]',
  '{"app":"Local Python / Flask / FastAPI"}'
),
(
  'Web Development Internship',
  'web-dev',
  'Modern frontend and web app project using React, Vite, Next.js or Tailwind.',
  '{"frontend":"React / Vite / Next.js","styling":"Tailwind CSS","optional_backend":"Node.js / Supabase"}',
  '["frontend_code","responsive_ui","readme","installation_guide","viva_questions","ppt","project_report"]',
  '["HTML","CSS","React","Routing","State Management","Responsive Design"]',
  '["Abstract","UI Design","Pages","Components","Implementation","Testing","Conclusion"]',
  '{"frontend":"Vercel / Netlify"}'
),
(
  'Mobile App Development Internship',
  'app-dev',
  'Mobile app project for Android with modern UI and backend/API integration.',
  '{"platform":"Android","stack":["React Native / Flutter / Kotlin","Firebase / Supabase","REST API"]}',
  '["mobile_app_code","api_docs","screenshots","readme","installation_guide","viva_questions","ppt","project_report"]',
  '["Mobile UI","API Integration","Authentication","Storage","Build APK"]',
  '["Abstract","App Screens","Architecture","Modules","Testing","Deployment","Conclusion"]',
  '{"mobile":"APK build / Expo build / Android Studio"}'
),
(
  'Data Science Internship',
  'data-science',
  'Data analysis, visualization, dashboard and insight-based project.',
  '{"tools":["Python","Pandas","NumPy","Matplotlib","Power BI / Tableau optional"],"outputs":["charts","dashboard","insights_report"]}',
  '["dataset_cleaning_steps","eda_report","charts","dashboard_files","insights_report","ppt","viva_questions"]',
  '["EDA","Data Cleaning","Charts","Dashboard","Insights","Business Questions"]',
  '["Abstract","Dataset","Data Cleaning","EDA","Visualizations","Insights","Conclusion"]',
  '{"dashboard":"Power BI / Tableau / Streamlit optional"}'
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  default_stack = excluded.default_stack,
  required_outputs = excluded.required_outputs,
  viva_focus = excluded.viva_focus,
  docs_structure = excluded.docs_structure,
  deployment_rules = excluded.deployment_rules,
  is_active = true,
  updated_at = now();
