-- AI-generated chapter briefs (geography, culture, observations), generated
-- once per chapter and cached permanently. Server-only access.

create table chapter_context (
  book         text not null,
  chapter      integer not null,
  brief_md     text not null,
  model        text not null,
  generated_at timestamptz not null default now(),
  primary key (book, chapter)
);

alter table chapter_context enable row level security;
