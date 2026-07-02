-- Scribe — initial schema
-- All user-owned rows are keyed on the Firebase UID (text). The server talks to
-- Supabase with the service-role key, which bypasses RLS; RLS is enabled with no
-- policies so anon/authenticated Supabase clients can never touch these tables.

create extension if not exists "pgcrypto";

-- ── Users ─────────────────────────────────────────────────────────────────
create table profiles (
  firebase_uid      text primary key,
  display_name      text,
  preferred_version text not null default 'WEB',
  created_at        timestamptz not null default now()
);

-- ── Notes (verse-anchored markdown) ───────────────────────────────────────
create table notes (
  id           uuid primary key default gen_random_uuid(),
  firebase_uid text not null references profiles (firebase_uid) on delete cascade,
  title        text not null default '',
  body_md      text not null default '',
  book         text,
  chapter      integer,
  verse_start  integer,
  verse_end    integer,
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index notes_uid_idx on notes (firebase_uid);
create index notes_anchor_idx on notes (firebase_uid, book, chapter);

-- ── Knowledge graph ───────────────────────────────────────────────────────
create type node_type as enum ('theme', 'person', 'place', 'verse', 'idea');

create table graph_nodes (
  id           uuid primary key default gen_random_uuid(),
  firebase_uid text not null references profiles (firebase_uid) on delete cascade,
  label        text not null,
  type         node_type not null default 'idea',
  body_md      text not null default '',
  verse_ref    text,
  color        text,
  created_at   timestamptz not null default now()
);
create index graph_nodes_uid_idx on graph_nodes (firebase_uid);

create table graph_edges (
  id           uuid primary key default gen_random_uuid(),
  firebase_uid text not null references profiles (firebase_uid) on delete cascade,
  source_id    uuid not null references graph_nodes (id) on delete cascade,
  target_id    uuid not null references graph_nodes (id) on delete cascade,
  label        text
);
create index graph_edges_uid_idx on graph_edges (firebase_uid);

-- ── Study plans ───────────────────────────────────────────────────────────
create table study_plans (
  id           uuid primary key default gen_random_uuid(),
  firebase_uid text not null references profiles (firebase_uid) on delete cascade,
  title        text not null,
  description  text not null default '',
  is_public    boolean not null default false,
  created_at   timestamptz not null default now()
);
create index study_plans_uid_idx on study_plans (firebase_uid);

create table plan_days (
  id                uuid primary key default gen_random_uuid(),
  plan_id           uuid not null references study_plans (id) on delete cascade,
  day_number        integer not null,
  passages          jsonb not null default '[]',
  reflection_prompt text,
  unique (plan_id, day_number)
);

create table plan_progress (
  firebase_uid text not null references profiles (firebase_uid) on delete cascade,
  plan_id      uuid not null references study_plans (id) on delete cascade,
  day_number   integer not null,
  completed_at timestamptz not null default now(),
  primary key (firebase_uid, plan_id, day_number)
);

-- ── Shared reference data (server-seeded, read-only to users) ─────────────
create table places (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  modern_name text,
  lat         double precision not null,
  lon         double precision not null,
  verse_refs  text[] not null default '{}',
  era         text,
  description text
);
create index places_name_idx on places (name);

create table book_context (
  book                  text primary key,
  author                text,
  date_written          text,
  location_written      text,
  audience              text,
  purpose               text,
  historical_setting_md text,
  author_journey        jsonb -- ordered array of place ids for route drawing
);

create table scripture_cache (
  version    text not null,
  book       text not null,
  chapter    integer not null,
  content    jsonb not null,
  fetched_at timestamptz not null default now(),
  primary key (version, book, chapter)
);

-- ── Row-level security ────────────────────────────────────────────────────
-- No policies on purpose: only the service-role key (server) may read/write.
alter table profiles        enable row level security;
alter table notes           enable row level security;
alter table graph_nodes     enable row level security;
alter table graph_edges     enable row level security;
alter table study_plans     enable row level security;
alter table plan_days       enable row level security;
alter table plan_progress   enable row level security;
alter table places          enable row level security;
alter table book_context    enable row level security;
alter table scripture_cache enable row level security;
