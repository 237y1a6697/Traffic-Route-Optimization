"""
Road Graph representation.
Provides graph structures for nodes (intersections) and edges (road segments).
"""

class RoadGraph:
    def __init__(self, name="Road Network Graph"):
        self.name = name
        self.nodes = {}
        self.edges = {}
        self.adj = {}

    def add_node(self, node_id, lat=0.0, lng=0.0, metadata=None):
        self.nodes[node_id] = {
            "id": node_id,
            "lat": lat,
            "lng": lng,
            "metadata": metadata or {}
        }
        if node_id not in self.adj:
            self.adj[node_id] = []

    def add_edge(self, edge_id, from_node, to_node, distance=1.0, speed_limit=50.0, base_t0=1.0, capacity=2000.0, metadata=None):
        edge_data = {
            "id": edge_id,
            "from": from_node,
            "to": to_node,
            "distance": distance,
            "speed_limit": speed_limit,
            "base_t0": base_t0,
            "capacity": capacity,
            "metadata": metadata or {}
        }
        self.edges[edge_id] = edge_data
        if from_node not in self.adj:
            self.adj[from_node] = []
        self.adj[from_node].append(edge_data)
