"""
Traffic Network Model & BPR Latency Engine in Python
"""
import math
import copy

class TrafficNetwork:
    def __init__(self, name="Sioux Falls Benchmark"):
        self.name = name
        self.alpha = 0.15
        self.beta = 4.0
        self.weather_factor = 1.0
        self.incidents = {}  # link_id -> capacity_multiplier

        # Sioux Falls canonical 24-node network
        self.nodes = list(range(1, 25))
        self.links = [
            {"id": "1-2", "from": 1, "to": 2, "t0": 6, "capacity": 50},
            {"id": "2-1", "from": 2, "to": 1, "t0": 6, "capacity": 50},
            {"id": "1-3", "from": 1, "to": 3, "t0": 4, "capacity": 45},
            {"id": "3-1", "from": 3, "to": 1, "t0": 4, "capacity": 45},
            {"id": "2-6", "from": 2, "to": 6, "t0": 5, "capacity": 40},
            {"id": "6-2", "from": 6, "to": 2, "t0": 5, "capacity": 40},
            {"id": "3-4", "from": 3, "to": 4, "t0": 4, "capacity": 45},
            {"id": "4-3", "from": 4, "to": 3, "t0": 4, "capacity": 45},
            {"id": "3-12", "from": 3, "to": 12, "t0": 4, "capacity": 45},
            {"id": "12-3", "from": 12, "to": 3, "t0": 4, "capacity": 45},
            {"id": "4-5", "from": 4, "to": 5, "t0": 3, "capacity": 35},
            {"id": "5-4", "from": 5, "to": 4, "t0": 3, "capacity": 35},
            {"id": "4-11", "from": 4, "to": 11, "t0": 6, "capacity": 40},
            {"id": "11-4", "from": 11, "to": 4, "t0": 6, "capacity": 40},
            {"id": "5-6", "from": 5, "to": 6, "t0": 4, "capacity": 35},
            {"id": "6-5", "from": 6, "to": 5, "t0": 4, "capacity": 35},
            {"id": "5-9", "from": 5, "to": 9, "t0": 5, "capacity": 40},
            {"id": "9-5", "from": 9, "to": 5, "t0": 5, "capacity": 40},
            {"id": "6-8", "from": 6, "to": 8, "t0": 4, "capacity": 40},
            {"id": "8-6", "from": 8, "to": 6, "t0": 4, "capacity": 40},
            {"id": "7-8", "from": 7, "to": 8, "t0": 3, "capacity": 60},
            {"id": "8-7", "from": 8, "to": 7, "t0": 3, "capacity": 60},
            {"id": "7-18", "from": 7, "to": 18, "t0": 5, "capacity": 45},
            {"id": "18-7", "from": 18, "to": 7, "t0": 5, "capacity": 45},
            {"id": "8-9", "from": 8, "to": 9, "t0": 6, "capacity": 45},
            {"id": "9-8", "from": 9, "to": 8, "t0": 6, "capacity": 45},
            {"id": "8-16", "from": 8, "to": 16, "t0": 5, "capacity": 50},
            {"id": "16-8", "from": 16, "to": 8, "t0": 5, "capacity": 50},
            {"id": "9-10", "from": 9, "to": 10, "t0": 3, "capacity": 50},
            {"id": "10-9", "from": 10, "to": 9, "t0": 3, "capacity": 50},
            {"id": "10-11", "from": 10, "to": 11, "t0": 4, "capacity": 45},
            {"id": "11-10", "from": 11, "to": 10, "t0": 4, "capacity": 45},
            {"id": "10-15", "from": 10, "to": 15, "t0": 6, "capacity": 40},
            {"id": "15-10", "from": 15, "to": 10, "t0": 6, "capacity": 40},
            {"id": "11-12", "from": 11, "to": 12, "t0": 5, "capacity": 40},
            {"id": "12-11", "from": 12, "to": 11, "t0": 5, "capacity": 40},
            {"id": "12-13", "from": 12, "to": 13, "t0": 6, "capacity": 40},
            {"id": "13-12", "from": 13, "to": 12, "t0": 6, "capacity": 40},
            {"id": "13-14", "from": 13, "to": 14, "t0": 4, "capacity": 45},
            {"id": "14-13", "from": 14, "to": 13, "t0": 4, "capacity": 45},
            {"id": "14-15", "from": 14, "to": 15, "t0": 5, "capacity": 45},
            {"id": "15-14", "from": 15, "to": 14, "t0": 5, "capacity": 45},
            {"id": "15-16", "from": 15, "to": 16, "t0": 4, "capacity": 45},
            {"id": "16-15", "from": 16, "to": 15, "t0": 4, "capacity": 45},
            {"id": "15-19", "from": 15, "to": 19, "t0": 6, "capacity": 40},
            {"id": "19-15", "from": 19, "to": 15, "t0": 6, "capacity": 40},
            {"id": "16-17", "from": 16, "to": 17, "t0": 3, "capacity": 50},
            {"id": "17-16", "from": 17, "to": 16, "t0": 3, "capacity": 50},
            {"id": "16-18", "from": 16, "to": 18, "t0": 4, "capacity": 45},
            {"id": "18-16", "from": 18, "to": 16, "t0": 4, "capacity": 45},
            {"id": "17-19", "from": 17, "to": 19, "t0": 4, "capacity": 40},
            {"id": "19-17", "from": 19, "to": 17, "t0": 4, "capacity": 40},
            {"id": "18-20", "from": 18, "to": 20, "t0": 4, "capacity": 50},
            {"id": "20-18", "from": 20, "to": 18, "t0": 4, "capacity": 50},
            {"id": "19-20", "from": 19, "to": 20, "t0": 4, "capacity": 40},
            {"id": "20-19", "from": 20, "to": 19, "t0": 4, "capacity": 40},
            {"id": "20-21", "from": 20, "to": 21, "t0": 3, "capacity": 50},
            {"id": "21-20", "from": 21, "to": 20, "t0": 3, "capacity": 50},
            {"id": "20-22", "from": 20, "to": 22, "t0": 5, "capacity": 40},
            {"id": "22-20", "from": 22, "to": 20, "t0": 5, "capacity": 40},
            {"id": "21-22", "from": 21, "to": 22, "t0": 3, "capacity": 45},
            {"id": "22-21", "from": 22, "to": 21, "t0": 3, "capacity": 45},
            {"id": "21-24", "from": 21, "to": 24, "t0": 4, "capacity": 45},
            {"id": "24-21", "from": 24, "to": 21, "t0": 4, "capacity": 45},
            {"id": "22-23", "from": 22, "to": 23, "t0": 4, "capacity": 45},
            {"id": "23-22", "from": 23, "to": 22, "t0": 4, "capacity": 45},
            {"id": "23-24", "from": 23, "to": 24, "t0": 3, "capacity": 50},
            {"id": "24-23", "from": 24, "to": 23, "t0": 3, "capacity": 50}
        ]
        self._path_cache = {}

    def get_effective_capacity(self, link):
        cap = link["capacity"] * self.weather_factor
        if link["id"] in self.incidents:
            cap *= self.incidents[link["id"]]
        return max(cap, 1.0)

    def get_link_travel_time(self, link, volume):
        cap = self.get_effective_capacity(link)
        vc = volume / cap
        return link["t0"] * (1.0 + self.alpha * math.pow(vc, self.beta))

    def find_candidate_paths(self, origin, dest, k=4):
        key = (origin, dest)
        if key in self._path_cache:
            return self._path_cache[key]

        paths = []
        visited = set([origin])

        def dfs(curr, target, curr_path, curr_cost, depth):
            if len(paths) >= 12 or depth > 8:
                return
            if curr == target:
                link_ids = []
                for i in range(len(curr_path) - 1):
                    u, v = curr_path[i], curr_path[i+1]
                    l = next((lnk["id"] for lnk in self.links if lnk["from"] == u and lnk["to"] == v), None)
                    if l: link_ids.push if False else link_ids.append(l)
                paths.append({"nodes": list(curr_path), "link_ids": link_ids, "cost": curr_cost})
                return

            outbound = [l for l in self.links if l["from"] == curr and l["to"] not in visited]
            outbound.sort(key=lambda x: x["t0"])
            for lnk in outbound:
                visited.add(lnk["to"])
                curr_path.append(lnk["to"])
                dfs(lnk["to"], target, curr_path, curr_cost + lnk["t0"], depth + 1)
                curr_path.pop()
                visited.remove(lnk["to"])

        dfs(origin, dest, [origin], 0, 0)
        paths.sort(key=lambda p: p["cost"])
        selected = paths[:max(k, 2)]
        if not selected:
            selected = [{"nodes": [origin, dest], "link_ids": [f"{origin}-{dest}"], "cost": 99}]
        self._path_cache[key] = selected
        return selected

    def evaluate_assignment(self, vehicle_routes):
        volumes = {l["id"]: 0 for l in self.links}
        for r in vehicle_routes:
            for lid in r.get("link_ids", []):
                if lid in volumes:
                    volumes[lid] += 1

        tstt = 0.0
        max_vc = 0.0
        severe_count = 0
        free_flow_tstt = 0.0

        for link in self.links:
            v = volumes[link["id"]]
            c = self.get_effective_capacity(link)
            vc = v / c
            tt = self.get_link_travel_time(link, v)
            if vc > max_vc:
                max_vc = vc
            if vc >= 1.0:
                severe_count += 1
            tstt += v * tt
            free_flow_tstt += v * link["t0"]

        n_veh = max(len(vehicle_routes), 1)
        avg_tt = tstt / n_veh
        delay = max(0.0, tstt - free_flow_tstt)
        co2_kg = ((free_flow_tstt * 0.8 * 120) + (delay * 32)) / 1000.0

        return {
            "tstt": round(tstt, 1),
            "avg_travel_time": round(avg_tt, 2),
            "max_vc": round(max_vc, 2),
            "severe_bottlenecks": severe_count,
            "co2_kg": round(co2_kg, 1),
            "delay_mins": round(delay, 1)
        }
