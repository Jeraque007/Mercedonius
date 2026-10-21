-- Create users table for Mercedonius application
-- Stores user profile information: name, birth date, and email

create table if not exists public.users (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  birth_date date not null,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable row level security
alter table public.users enable row level security;

-- Create policy: users can read their own data, service role can do everything
create policy "Users can read own data" on public.users
  for select using (auth.uid() = id);

create policy "Service role full access" on public.users
  using (true) with check (true);

-- Index on email for faster lookups
create index if not exists users_email_idx on public.users (email);

-- Index on birth_date for age-based queries
create index if not exists users_birth_date_idx on public.users (birth_date);

-- Comment on table and columns
comment on table public.users is 'User profile table for Mercedonius calendar application';
comment on column public.users.name is 'Full user name';
comment on column public.users.birth_date is 'User birth date for Mercedonius zodiac calculation';
comment on column public.users.email is 'User email address (must be unique)';
comment on column public.users.created_at is 'Timestamp when user was created';
comment on column public.users.updated_at is 'Timestamp when user was last updated';