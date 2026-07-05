-- Profile "about me" text for the Settings page.

alter table profiles add column about_md text not null default '';
