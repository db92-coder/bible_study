-- AI-picked Strong's-numbered Hebrew/Greek words worth studying per chapter,
-- generated once and cached permanently. Server-only access.

create table chapter_words (
  book         text not null,
  chapter      integer not null,
  words        jsonb not null,
  model        text not null,
  generated_at timestamptz not null default now(),
  primary key (book, chapter)
);

alter table chapter_words enable row level security;
