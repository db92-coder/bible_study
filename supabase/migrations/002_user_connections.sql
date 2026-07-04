-- User-created Bible connections (arcs drawn alongside the seeded set).

create table user_connections (
  id           uuid primary key default gen_random_uuid(),
  firebase_uid text not null references profiles (firebase_uid) on delete cascade,
  title        text not null,
  category     text not null default 'Personal',
  description  text not null default '',
  ot_book      text not null,
  ot_chapter   integer not null,
  ot_label     text not null,
  nt_book      text not null,
  nt_chapter   integer not null,
  nt_label     text not null,
  created_at   timestamptz not null default now()
);
create index user_connections_uid_idx on user_connections (firebase_uid);

alter table user_connections enable row level security;
