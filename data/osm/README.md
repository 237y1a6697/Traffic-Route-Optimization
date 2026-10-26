# OpenStreetMap (OSM) Source Road Network Data

This directory stores raw and exported road network data obtained from OpenStreetMap.

## Metadata & Provenance

- **Source**: [OpenStreetMap](https://www.openstreetmap.org/) (OSM)
- **Extraction Method**: Overpass Turbo API / Overpass QL queries
- **Primary Geographic Area**: Hyderabad Metropolitan Area, Telangana, India
  - Bounding Box: `[17.3000, 78.3000, 17.5500, 78.5500]`
- **Extraction Date**: September 2026
- **License & Attribution**:
  - OpenStreetMap data is licensed under the [Open Data Commons Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/) by the OpenStreetMap Foundation (OSMF).
  - Any maps or derived products must credit: `© OpenStreetMap contributors`.

## Overpass Turbo Query Example

```overpassql
[out:json][timeout:90];
(
  way["highway"~"motorway|trunk|primary|secondary|tertiary|motorway_link|trunk_link|primary_link"]
    (17.3000, 78.3000, 17.5500, 78.5500);
);
out body;
>;
out skel qt;
```

## Storage Guidelines

- Keep raw `.osm` or `.pbf` dumps in this directory (ignored by git if exceeding repository limits).
- Use `python_engine/data/osm/` for python-processed intermediate files.
- Static frontend visualization geometries reside in `src/data/static/`.
