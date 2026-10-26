"""
A* (A-Star) heuristic search algorithm.
Finds the optimal path between start_node and end_node using admissible heuristics.
"""
import math
import heapq
from typing import Dict, Any, List, Optional, Callable, Union

def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def astar_shortest_path(
    graph: Any,
    start_node: Union[str, int],
    end_node: Union[str, int],
    weight_key: str = "base_t0",
    heuristic_fn: Optional[Callable[[Union[str, int], Union[str, int]], float]] = None
) -> Dict[str, Any]:
    """
    Computes heuristic-guided shortest path between start_node and end_node.
    
    Args:
        graph: RoadGraph or TrafficNetwork instance.
        start_node: Origin node.
        end_node: Destination node.
        weight_key: Edge weight property ('base_t0', 'distance', etc.).
        heuristic_fn: Optional custom heuristic h(u, target) -> float.
    """
    if start_node == end_node:
        return {
            "algorithm": "A*",
            "path": [start_node],
            "edges": [],
            "cost": 0.0,
            "distance": 0.0,
            "status": "success"
        }

    # Extract adjacency representation and node coordinates
    adj: Dict[Any, List[Dict[str, Any]]] = {}
    node_coords: Dict[Any, tuple] = {}

    if hasattr(graph, "adj") and isinstance(graph.adj, dict):
        for u, edge_list in graph.adj.items():
            adj[u] = []
            for e in edge_list:
                cost = e.get(weight_key, e.get("base_t0", e.get("distance", 1.0)))
                adj[u].append({
                    "to": e["to"],
                    "id": e.get("id", f"{u}-{e['to']}"),
                    "cost": float(cost),
                    "distance": float(e.get("distance", 1.0)),
                    "edge": e
                })
        if hasattr(graph, "nodes") and isinstance(graph.nodes, dict):
            for nid, nd in graph.nodes.items():
                if "lat" in nd and "lng" in nd:
                    node_coords[nid] = (nd["lat"], nd["lng"])
    elif hasattr(graph, "links"):
        for lnk in graph.links:
            u, v = lnk["from"], lnk["to"]
            if u not in adj:
                adj[u] = []
            cost = lnk.get(weight_key, lnk.get("t0", lnk.get("distance", 1.0)))
            adj[u].append({
                "to": v,
                "id": lnk["id"],
                "cost": float(cost),
                "distance": float(lnk.get("distance", lnk.get("t0", 1.0))),
                "edge": lnk
            })
    elif isinstance(graph, dict):
        adj = graph

    # Fallback default heuristic based on spatial coordinates or 0.0
    def default_heuristic(u, v):
        if heuristic_fn:
            return heuristic_fn(u, v)
        if u in node_coords and v in node_coords:
            lat1, lng1 = node_coords[u]
            lat2, lng2 = node_coords[v]
            dist_km = _haversine_distance(lat1, lng1, lat2, lng2)
            # Admissible time heuristic (assumes max highway speed 100 km/h -> minutes)
            return (dist_km / 100.0) * 60.0
        return 0.0

    # Priority queue stores (f_score, g_score, current_node, path_nodes, path_edges, total_dist)
    h_start = default_heuristic(start_node, end_node)
    pq = [(h_start, 0.0, start_node, [start_node], [], 0.0)]
    best_g = {start_node: 0.0}

    while pq:
        f_score, g_score, curr_node, path_nodes, path_edges, total_dist = heapq.heappop(pq)

        if g_score > best_g.get(curr_node, float("inf")):
            continue

        if curr_node == end_node:
            return {
                "algorithm": "A*",
                "path": path_nodes,
                "edges": path_edges,
                "cost": round(g_score, 3),
                "distance": round(total_dist, 2),
                "status": "success"
            }

        for neighbor in adj.get(curr_node, []):
            next_node = neighbor["to"]
            edge_cost = neighbor["cost"]
            tentative_g = g_score + edge_cost

            if tentative_g < best_g.get(next_node, float("inf")):
                best_g[next_node] = tentative_g
                h_cost = default_heuristic(next_node, end_node)
                heapq.heappush(pq, (
                    tentative_g + h_cost,
                    tentative_g,
                    next_node,
                    path_nodes + [next_node],
                    path_edges + [neighbor["id"]],
                    total_dist + neighbor.get("distance", 1.0)
                ))

    return {
        "algorithm": "A*",
        "path": [],
        "edges": [],
        "cost": float("inf"),
        "distance": 0.0,
        "status": "no_path_found"
    }
