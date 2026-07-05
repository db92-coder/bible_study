-- Pinned node positions for the knowledge graph (null = free-floating).

alter table graph_nodes add column x double precision;
alter table graph_nodes add column y double precision;
