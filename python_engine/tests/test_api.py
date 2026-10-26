"""
Integration tests for FastAPI REST API endpoints using standard library unittest.
"""
import unittest
from fastapi.testclient import TestClient
from api.main import app

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("/health", data["endpoints"])

    def test_health_endpoint(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertGreater(data["nodes_count"], 0)
        self.assertGreater(data["links_count"], 0)

    def test_traffic_network_endpoint(self):
        res = self.client.get("/traffic/network")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("nodes", data)
        self.assertIn("links", data)
        self.assertIn("simulation", data)

    def test_route_optimize_endpoint(self):
        payload = {
            "origin": "1",
            "destination": "20",
            "algorithm": "ALL",
            "weights": {
                "timeWeight": 0.4,
                "congestionWeight": 0.3,
                "distanceWeight": 0.1,
                "fuelWeight": 0.1,
                "emissionsWeight": 0.1
            }
        }
        res = self.client.post("/routes/optimize", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("primary_result", data)
        self.assertIn("DIJKSTRA", data["comparison"])
        self.assertIn("ASTAR", data["comparison"])
        self.assertIn("QGA", data["comparison"])
        self.assertIn("QUBO", data["comparison"])

    def test_benchmark_endpoint(self):
        payload = {
            "num_vehicles": 25,
            "max_steps": 10,
            "pop_size": 10
        }
        res = self.client.post("/benchmark/run", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("results", data)
        self.assertEqual(len(data["results"]), 4)

    def test_ml_predict_endpoint(self):
        payload = {
            "distance": 4.0,
            "speed_limit": 60.0,
            "capacity": 2000.0,
            "time_of_day": 8.5
        }
        res = self.client.post("/ml/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("predicted_travel_time_mins", data)
        self.assertIn("predicted_speed_kmh", data)
        self.assertTrue(data["is_peak"])

if __name__ == "__main__":
    unittest.main()
