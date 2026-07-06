-- Persistent prayer requests: the "planning" half of the prayer feature.
-- Woven into guided prayer sessions at their supplication/provision steps,
-- and tracked through to answer — a personal record of answered prayer.

create table prayer_requests (
  id           uuid primary key default gen_random_uuid(),
  firebase_uid text not null references profiles (firebase_uid) on delete cascade,
  title        text not null,
  category     text not null default 'other', -- person | situation | world | thanksgiving | other
  body_md      text not null default '',
  status       text not null default 'active', -- active | answered
  answered_note text,
  answered_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index prayer_requests_uid_idx on prayer_requests (firebase_uid);
create index prayer_requests_status_idx on prayer_requests (firebase_uid, status);

alter table prayer_requests enable row level security;
