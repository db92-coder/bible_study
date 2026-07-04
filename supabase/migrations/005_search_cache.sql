-- Permanent cache for AI topical searches (normalized query → results).

create table topical_search_cache (
  query      text primary key,
  results    jsonb not null,
  created_at timestamptz not null default now()
);

alter table topical_search_cache enable row level security;
