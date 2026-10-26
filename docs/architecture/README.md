# System Architecture

## Overview
The Quantum-Inspired Intelligent Traffic Route Optimization platform is organized as a decoupled, multi-tier system:

1. **Frontend Presentation & Interactive GIS (React + TypeScript + Leaflet)**
   - Delivers real-world location search (geocoding), interactive OpenStreetMap visualization, traffic overlays, route comparisons, and academic benchmark dashboards.
2. **Computational Routing & Optimization Engine (Python)**
   - Authoritative research implementation containing road network graph construction, BPR latency models, Dijkstra, A*, and Quantum-Inspired Genetic Algorithm (QIGA).
3. **API Layer (FastAPI)**
   - High-throughput REST API serving route requests, traffic predictions, and benchmark metrics.
4. **Spatial Storage (PostgreSQL + PostGIS)**
   - Stores road geometries, speeds, historical traffic time-series, and incidents.
