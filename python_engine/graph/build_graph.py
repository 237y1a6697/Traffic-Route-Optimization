"""
Graph builder utility for ingesting OpenStreetMap (OSM) / Overpass extracts or GeoJSON.
"""
import json
import os
import math
from typing import Optional
from .road_graph import RoadGraph
from .node_mapping import NodeMapper

def build_network_from_osm(osm_data_path: str, name: str = "OSM Network") -> RoadGraph:
    """
    Parses OSM GeoJSON / Overpass JSON and constructs a RoadGraph.
    
    Supports:
    - GeoJSON FeatureCollections containing LineString road geometries
    - Overpass JSON dumps with elements (nodes and ways)
    """
    graph = RoadGraph(name=name)

    if not os.path.exists(osm_data_path):
        return graph

    try:
        with open(osm_data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return graph

    # Case 1: Standard GeoJSON FeatureCollection
    if data.get("type") == "FeatureCollection" and "features" in data:
        for idx, feat in enumerate(data.get("features", [])):
            geom = feat.get("geometry", {})
            props = feat.get("properties", {})
            if geom.get("type") == "LineString":
                coords = geom.get("coordinates", [])
                if len(coords) >= 2:
                    u_id = f"osm_n_{idx}_start"
                    v_id = f"osm_n_{idx}_end"
                    start_lng, start_lat = coords[0][0], coords[0][1]
                    end_lng, end_lat = coords[-1][0], coords[-1][1]

                    graph.add_node(u_id, lat=start_lat, lng=start_lng)
                    graph.add_node(v_id, lat=end_lat, lng=end_lng)

                    dist = NodeMapper.haversine(start_lat, start_lng, end_lat, end_lng)
                    speed = float(props.get("maxspeed", 50.0) or 50.0)
                    t0 = (dist / max(speed, 10.0)) * 60.0

                    graph.add_edge(
                        edge_id=props.get("id", f"osm_e_{idx}"),
                        from_node=u_id,
                        to_node=v_id,
                        distance=round(dist, 2),
                        speed_limit=speed,
                        base_t0=round(t0, 2),
                        capacity=float(props.get("capacity", 2000.0)),
                        metadata=props
                    )

    # Case 2: Overpass JSON elements
    elif "elements" in data:
        nodes = {}
        for elem in data.get("elements", []):
            if elem.get("type") == "node":
                nid = elem.get("id")
                nodes[nid] = (elem.get("lat", 0.0), elem.get("lon", 0.0))
                graph.add_node(nid, lat=elem.get("lat", 0.0), lng=elem.get("lon", 0.0), metadata=elem.get("tags"))

        for elem in data.get("elements", []):
            if elem.get("type") == "way":
                way_id = elem.get("id")
                way_nodes = elem.get("nodes", [])
                tags = elem.get("tags", {})
                speed = 50.0
                if "maxspeed" in tags:
                    try:
                        speed = float(tags["maxspeed"])
                    except ValueError:
                        pass

                for i in range(len(way_nodes) - 1):
                    u, v = way_nodes[i], way_nodes[i + 1]
                    if u in nodes and v in nodes:
                        lat1, lon1 = nodes[u]
                        lat2, lon2 = nodes[v]
                        dist = NodeMapper.haversine(lat1, lon1, lat2, lon2)
                        t0 = (dist / max(speed, 10.0)) * 60.0

                        graph.add_edge(
                            edge_id=f"{way_id}_{i}",
                            from_node=u,
                            to_node=v,
                            distance=round(dist, 3),
                            speed_limit=speed,
                            base_t0=round(t0, 3),
                            capacity=2000.0,
                            metadata=tags
                        )

    return graph
