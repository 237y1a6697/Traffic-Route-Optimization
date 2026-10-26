"""
Traffic flow and dynamic fleet load simulator.
Models diurnal peak/off-peak traffic variations, weather impact, and incident disruptions.
"""
from typing import Dict, Any, Optional
from .bpr import calculate_bpr_latency
from .congestion import classify_congestion_level

class TrafficSimulator:
    def __init__(self, time_of_day: float = 8.5, day_type: str = "weekday", weather: str = "clear"):
        self.time_of_day = time_of_day
        self.day_type = day_type
        self.weather = weather
        self.incidents: Dict[str, float] = {}

    def get_time_multiplier(self) -> float:
        """
        Diurnal traffic multiplier for urban networks.
        Peak hours: 8:00 - 10:30 AM (multiplier 1.4 - 1.6) and 5:00 - 8:00 PM (1.5 - 1.7).
        """
        t = self.time_of_day
        if 8.0 <= t <= 10.5:
            return 1.55
        elif 17.0 <= t <= 20.0:
            return 1.65
        elif 11.0 <= t <= 16.0:
            return 1.15
        elif 6.0 <= t <= 8.0:
            return 1.20
        else:
            return 0.45  # Night off-peak

    def get_weather_factor(self) -> float:
        w = self.weather.lower()
        if w in ["rain", "rainy"]:
            return 0.80
        elif w in ["storm", "stormy"]:
            return 0.60
        return 1.0

    def set_incident(self, link_id: str, capacity_multiplier: float = 0.2):
        self.incidents[link_id] = capacity_multiplier

    def clear_incident(self, link_id: str):
        self.incidents.pop(link_id, None)

    def simulate_network_flow(self, graph: Any, fleet_demand: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """
        Calculates simulated traffic flow volumes and congested travel times across all edges.
        """
        time_mult = self.get_time_multiplier()
        weather_fact = self.get_weather_factor()

        edge_metrics = {}
        total_vmt = 0.0  # Vehicle miles / kilometers traveled
        total_vht = 0.0  # Vehicle hours traveled

        # Extract edges from RoadGraph, TrafficNetwork, or dict
        edges = []
        if hasattr(graph, "edges") and isinstance(graph.edges, dict):
            edges = list(graph.edges.values())
        elif hasattr(graph, "links"):
            edges = graph.links

        for e in edges:
            eid = e.get("id", "")
            base_t0 = e.get("base_t0", e.get("t0", 2.0))
            base_cap = e.get("capacity", 2000.0)
            dist = e.get("distance", e.get("t0", 1.0))

            incident_mult = self.incidents.get(eid, 1.0)
            effective_cap = max(1.0, base_cap * weather_fact * incident_mult)

            # Simulated base volume based on diurnal curve + injected demand
            nominal_volume = base_cap * 0.55 * time_mult
            if fleet_demand and eid in fleet_demand:
                nominal_volume += fleet_demand[eid]

            congested_time = calculate_bpr_latency(base_t0, nominal_volume, effective_cap)
            vc = nominal_volume / effective_cap
            level = classify_congestion_level(vc)

            edge_metrics[eid] = {
                "id": eid,
                "volume": round(nominal_volume, 1),
                "effective_capacity": round(effective_cap, 1),
                "vc_ratio": round(vc, 2),
                "travel_time_mins": round(congested_time, 2),
                "free_flow_time_mins": round(base_t0, 2),
                "congestion_level": level,
                "has_incident": eid in self.incidents
            }

            total_vmt += nominal_volume * dist
            total_vht += nominal_volume * (congested_time / 60.0)

        return {
            "time_of_day": self.time_of_day,
            "weather": self.weather,
            "edge_metrics": edge_metrics,
            "total_vmt": round(total_vmt, 1),
            "total_vht": round(total_vht, 1),
            "active_incidents": list(self.incidents.keys())
        }
