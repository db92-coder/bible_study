-- Chapter briefs now come in two reading levels (standard | simple).
-- Requires 003_chapter_context.sql to have been applied first.

alter table chapter_context add column level text not null default 'standard';
alter table chapter_context drop constraint chapter_context_pkey;
alter table chapter_context add primary key (book, chapter, level);
