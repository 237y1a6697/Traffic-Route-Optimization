"""
Unit tests for routing and quantum-inspired optimization algorithms using standard library unittest.
"""
import unittest
from traffic_network import TrafficNetwork
from algorithms.dijkstra import dijkstra_shortest_path
from algorithms.astar import astar_shortest_path
from algorithms.qiga import qiga_optimize
from qubo_annealing import run_qubo
from classical_ga import run_classical_ga, run_dijkstra

class TestAlgorithms(unittest.TestCase):
    def setUp(self):
        self.network = TrafficNetwork("Sioux Falls Test Network")

    def test_dijkstra_shortest_path(self):
        res = dijkstra_shortest_path(self.network, start_node=1, end_node=20)
        self.assertEqual(res["status"], "success")
        self.assertGreater(res["cost"], 0)
        self.assertGreaterEqual(len(res["path"]), 2)
        self.assertEqual(res["path"][0], 1)
        self.assertEqual(res["path"][-1], 20)

    def test_astar_shortest_path(self):
        res = astar_shortest_path(self.network, start_node=1, end_node=20)
        self.assertEqual(res["status"], "success")
        self.assertGreater(res["cost"], 0)
        self.assertGreaterEqual(len(res["path"]), 2)
        self.assertEqual(res["path"][0], 1)
        self.assertEqual(res["path"][-1], 20)

    def test_qiga_optimize(self):
        res = qiga_optimize(self.network, origin=1, destination=20, pop_size=10, max_generations=10)
        self.assertEqual(res["status"], "success")
        self.assertIn("best_route", res)
        self.assertIn("metrics", res)
        self.assertEqual(len(res["history"]), 10)

    def test_qubo_annealing(self):
        trips = [{"id": 0, "origin": 1, "dest": 20}, {"id": 1, "origin": 2, "dest": 15}]
        res = run_qubo(self.network, trips, max_steps=10)
        self.assertIsNotNone(res)
        self.assertEqual(res["algorithm"], "QUBO")
        self.assertIn("metrics", res)
        self.assertEqual(len(res["history"]), 10)

    def test_classical_ga(self):
        trips = [{"id": 0, "origin": 1, "dest": 20}, {"id": 1, "origin": 2, "dest": 15}]
        res = run_classical_ga(self.network, trips, pop_size=10, max_generations=10)
        self.assertIsNotNone(res)
        self.assertEqual(res["algorithm"], "CGA")
        self.assertIn("metrics", res)
        self.assertEqual(len(res["history"]), 10)

if __name__ == "__main__":
    unittest.main()
