-- AI-extracted Bible genealogy data (people + parent/child relationships),
-- grounded in the literal text of known genealogy passages and generated
-- once via a seed script, not per-request. Public shared reference data,
-- server-only access (RLS enabled, no policies).

create table genealogy_people (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  gender       text not null default 'unknown' check (gender in ('male', 'female', 'unknown')),
  primary_ref  text not null,
  created_at   timestamptz not null default now()
);
create index genealogy_people_name_idx on genealogy_people (name);

create table genealogy_relationships (
  id           uuid primary key default gen_random_uuid(),
  parent_id    uuid not null references genealogy_people (id) on delete cascade,
  child_id     uuid not null references genealogy_people (id) on delete cascade,
  relationship text not null check (relationship in ('father', 'mother')),
  source_ref   text not null,
  unique (parent_id, child_id)
);
create index genealogy_relationships_parent_idx on genealogy_relationships (parent_id);
create index genealogy_relationships_child_idx on genealogy_relationships (child_id);

-- Tracks which chapters have already been run through extraction so the
-- seed script never reprocesses a chapter.
create table genealogy_extraction_log (
  book         text not null,
  chapter      integer not null,
  model        text not null,
  extracted_at timestamptz not null default now(),
  primary key (book, chapter)
);

alter table genealogy_people enable row level security;
alter table genealogy_relationships enable row level security;
alter table genealogy_extraction_log enable row level security;
