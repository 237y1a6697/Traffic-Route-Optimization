# Database Architecture & Spatial Storage

This directory manages relational and spatial schema definitions, migration scripts, and spatial queries for the traffic optimization platform.

## Structure

- `schema/`: DDL scripts for PostgreSQL + PostGIS spatial tables (road segments, nodes, historical traffic, incident logs).
- `migrations/`: Versioned migration scripts (Alembic / SQL) for database updates.

## Spatial Schema Requirements

- **PostGIS Extension**: Required for geometry types (`POINT`, `LINESTRING`, `MULTILINESTRING`) using SRID 4326 (WGS 84).
- **Indexing**: GiST spatial indexing on road edge geometries for fast bounding box and nearest-neighbor lookups.
