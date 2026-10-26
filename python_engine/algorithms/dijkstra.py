"""
Dijkstra shortest path algorithm.
Computes optimal single-source shortest path using priority-queue (min-heap).
Compatible with RoadGraph, TrafficNetwork, or dict-based graph models.
"""
import heapq
from typing import Dict, Any, List, Optional, Union

def dijkstra_shortest_path(
    graph: Any,
    start_node: Union[str, int],
    end_node: Union[str, int],
    weight_key: str = "base_t0"
) -> Dict[str, Any]:
    """
    Computes shortest path based on Dijkstra's single-source algorithm.
    
    Args:
        graph: RoadGraph, TrafficNetwork, or dictionary representation.
        start_node: Origin node identifier.
        end_node: Destination node identifier.
        weight_key: Edge weight attribute ('base_t0', 'distance', or custom function).
        
    Returns:
        dict: Path, total cost, distance, edges traversed, and status.
    """
    if start_node == end_node:
        return {
            "algorithm": "Dijkstra",
            "path": [start_node],
            "edges": [],
            "cost": 0.0,
            "distance": 0.0,
            "status": "success"
        }

    # Extract adjacency representation
    adj: Dict[Any, List[Dict[str, Any]]] = {}

    if hasattr(graph, "adj") and isinstance(graph.adj, dict):
        # RoadGraph instance
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
    elif hasattr(graph, "links"):
        # TrafficNetwork instance
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
    else:
        return {
            "algorithm": "Dijkstra",
            "path": [],
            "edges": [],
            "cost": float("inf"),
            "distance": 0.0,
            "status": "unsupported_graph_type"
        }

    # Dijkstra priority queue: (cumulative_cost, current_node, path_nodes, path_edges, total_dist)
    pq = [(0.0, start_node, [start_node], [], 0.0)]
    best_costs = {start_node: 0.0}

    while pq:
        curr_cost, curr_node, path_nodes, path_edges, total_dist = heapq.heappop(pq)

        if curr_cost > best_costs.get(curr_node, float("inf")):
            continue

        if curr_node == end_node:
            return {
                "algorithm": "Dijkstra",
                "path": path_nodes,
                "edges": path_edges,
                "cost": round(curr_cost, 3),
                "distance": round(total_dist, 2),
                "status": "success"
            }

        for neighbor in adj.get(curr_node, []):
            next_node = neighbor["to"]
            edge_cost = neighbor["cost"]
            next_cost = curr_cost + edge_cost

            if next_cost < best_costs.get(next_node, float("inf")):
                best_costs[next_node] = next_cost
                heapq.heappush(pq, (
                    next_cost,
                    next_node,
                    path_nodes + [next_node],
                    path_edges + [neighbor["id"]],
                    total_dist + neighbor.get("distance", 1.0)
                ))

    return {
        "algorithm": "Dijkstra",
        "path": [],
        "edges": [],
        "cost": float("inf"),
        "distance": 0.0,
        "status": "no_path_found"
    }
