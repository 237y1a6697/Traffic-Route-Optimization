"""
Node mapping utilities for spatial projections and nearest-node snapping.
"""
import math

class NodeMapper:
    @staticmethod
    def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2.0) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(d_lon / 2.0) ** 2)
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c

    @classmethod
    def find_nearest_node(cls, nodes_dict: dict, lat: float, lng: float):
        closest = None
        min_dist = float("inf")
        for node_id, data in nodes_dict.items():
            dist = cls.haversine(lat, lng, data.get("lat", 0.0), data.get("lng", 0.0))
            if dist < min_dist:
                min_dist = dist
                closest = node_id
        return closest, min_dist
