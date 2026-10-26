"""
Experimental Benchmarking Suite
Compares Dijkstra, Classical GA (CGA), Simulated Quantum Annealing (QUBO),
and Quantum-Inspired Genetic Algorithm (QGA) under varying network loads and incidents.
"""
import sys
import os
import time
import json

# Ensure python_engine is on path
ENGINE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'python_engine'))
if ENGINE_PATH not in sys.path:
    sys.path.insert(0, ENGINE_PATH)

from traffic_network import TrafficNetwork
from qga import run_qga
from qubo_annealing import run_qubo
from classical_ga import run_classical_ga, run_dijkstra

def run_experiment(fleet_loads=[30, 75, 130], inject_bottleneck=True):
    print("=" * 96)
    print("QUANTUM-INSPIRED INTELLIGENT TRAFFIC ROUTE OPTIMIZATION - EXPERIMENTAL SUITE")
    print("Benchmark Network: Sioux Falls 24-Node Corridor (68 Directed Links)")
    print("Comparing: Dijkstra (Greedy), Classical GA, QUBO Annealing, Quantum-Inspired GA (QGA)")
    print("=" * 96)

    network = TrafficNetwork("Sioux Falls Experimental Network")
    all_experiments = []

    for load in fleet_loads:
        print(f"\n[SCENARIO] Fleet Load: {load} Vehicles | Weather: Clear")
        if inject_bottleneck and load >= 100:
            # Simulate high-severity arterial bottleneck on core links
            network.incidents["4-11"] = 0.2
            network.incidents["10-15"] = 0.2
            print("  (!) Arterial Incidents Injected: Link 4-11 (80% capacity drop), Link 10-15 (80% drop)")

        nodes = network.nodes
        trips = []
        for i in range(load):
            orig = nodes[(i * 3 + 1) % len(nodes)]
            dest = nodes[(i * 3 + 7) % len(nodes)]
            trips.append({"id": i, "origin": orig, "dest": dest})

        scenario_results = {}

        # 1. Dijkstra
        t0 = time.time()
        d_res = run_dijkstra(network, trips)
        t_d = round((time.time() - t0) * 1000, 1)
        scenario_results["DIJKSTRA"] = {"metrics": d_res["metrics"], "runtime_ms": t_d}

        # 2. Classical GA
        t0 = time.time()
        c_res = run_classical_ga(network, trips, pop_size=20, max_generations=25)
        t_c = round((time.time() - t0) * 1000, 1)
        scenario_results["CGA"] = {"metrics": c_res["metrics"], "runtime_ms": t_c}

        # 3. QUBO
        t0 = time.time()
        q_res = run_qubo(network, trips, max_steps=30)
        t_q = round((time.time() - t0) * 1000, 1)
        scenario_results["QUBO"] = {"metrics": q_res["metrics"], "runtime_ms": t_q}

        # 4. QGA
        t0 = time.time()
        qga_res = run_qga(network, trips, pop_size=20, max_generations=25)
        t_qga = round((time.time() - t0) * 1000, 1)
        scenario_results["QGA"] = {"metrics": qga_res["metrics"], "runtime_ms": t_qga}

        # Formatted Output Table
        base_tstt = d_res["metrics"]["tstt"]
        header = f"{'Algorithm':<28} | {'Avg Time':<9} | {'TSTT':<9} | {'Max V/C':<8} | {'Jams':<5} | {'CO2 (kg)':<9} | {'Runtime':<9} | {'vs Dijkstra'}"
        print("-" * 104)
        print(header)
        print("-" * 104)

        for key, name in [
            ("DIJKSTRA", "Dijkstra (Greedy Shortest)"),
            ("CGA", "Classical GA"),
            ("QUBO", "Quantum Annealing (QUBO)"),
            ("QGA", "Quantum-Inspired GA (QGA)")
        ]:
            data = scenario_results[key]
            m = data["metrics"]
            delta = round(((m["tstt"] - base_tstt) / max(base_tstt, 1.0)) * 100, 1)
            delta_str = "Baseline" if key == "DIJKSTRA" else f"{delta:+.1f}%"
            print(f"{name:<28} | {m['avg_travel_time']:>6.2f} min | {m['tstt']:>7.1f} | {m['max_vc']:>6.2f}   | {m['severe_bottlenecks']:>3}   | {m['co2_kg']:>7.1f}   | {data['runtime_ms']:>6.1f} ms | {delta_str:>10}")

        print("-" * 104)

        all_experiments.append({
            "fleet_load": load,
            "results": scenario_results
        })

    # Save to JSON
    output_path = os.path.join(os.path.dirname(__file__), "benchmark_results.json")
    with open(output_path, "w") as f:
        json.dump(all_experiments, f, indent=2)
    print(f"\n[SAVED] Benchmark experiment results written to: {output_path}")
    print("=" * 96)

if __name__ == "__main__":
    run_experiment()
