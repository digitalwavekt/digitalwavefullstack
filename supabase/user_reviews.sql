create table if not exists user_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  name text not null,
  email text not null,
  role text default 'Digital Wave Client',
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists user_reviews_status_created_at_idx
  on user_reviews (status, created_at desc);

