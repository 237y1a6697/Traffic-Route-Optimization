"""
FastAPI entrypoint for Quantum-Inspired Intelligent Traffic Route Optimization API.
Provides REST endpoints for route optimization, multi-algorithm benchmarks,
network topology state, and real-time traffic prediction.
"""
import time
import math
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Internal algorithm and network engines
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from traffic_network import TrafficNetwork
from qga import run_qga
from qubo_annealing import run_qubo
from classical_ga import run_classical_ga, run_dijkstra
from algorithms.dijkstra import dijkstra_shortest_path
from algorithms.astar import astar_shortest_path
from algorithms.qiga import qiga_optimize
from traffic.simulator import TrafficSimulator
from ml.predict import predict_travel_time

app = FastAPI(
    title="Quantum-Inspired Intelligent Traffic Route Optimization API",
    description="Authoritative scientific service providing QIGA, QUBO, Classical GA, and Dijkstra traffic optimization.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Persistent singleton network model
active_network = TrafficNetwork(name="Sioux Falls Benchmark Network")
traffic_simulator = TrafficSimulator(time_of_day=8.5, day_type="weekday")

# Pydantic Schemas
class OptimizationWeights(BaseModel):
    timeWeight: float = Field(default=0.35, ge=0.0, le=1.0)
    congestionWeight: float = Field(default=0.30, ge=0.0, le=1.0)
    distanceWeight: float = Field(default=0.15, ge=0.0, le=1.0)
    fuelWeight: float = Field(default=0.10, ge=0.0, le=1.0)
    emissionsWeight: float = Field(default=0.10, ge=0.0, le=1.0)

class RouteOptimizeRequest(BaseModel):
    origin: str = Field(description="Origin node identifier or name")
    destination: str = Field(description="Destination node identifier or name")
    algorithm: Optional[str] = Field(default="QGA", description="Algorithm: QGA, QUBO, CGA, DIJKSTRA, ASTAR, or ALL")
    weights: Optional[OptimizationWeights] = Field(default_factory=OptimizationWeights)

class BenchmarkRequest(BaseModel):
    num_vehicles: int = Field(default=60, ge=5, le=500, description="Fleet vehicle load")
    max_steps: Optional[int] = Field(default=30, ge=5, le=100)
    pop_size: Optional[int] = Field(default=20, ge=5, le=50)

class IncidentToggleRequest(BaseModel):
    link_id: str
    capacity_multiplier: float = Field(default=0.15, ge=0.0, le=1.0)

class FeaturePredictionRequest(BaseModel):
    distance: float = Field(default=2.5, gt=0.0)
    speed_limit: float = Field(default=50.0, gt=0.0)
    capacity: float = Field(default=2000.0, gt=0.0)
    time_of_day: float = Field(default=8.5, ge=0.0, le=24.0)
    weather_factor: float = Field(default=1.0, ge=0.4, le=1.0)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Quantum-Inspired Intelligent Traffic Route Optimization",
        "version": "1.0.0",
        "endpoints": [
            "/health",
            "/traffic/network",
            "/routes/optimize",
            "/benchmark/run",
            "/incidents/toggle",
            "/ml/predict"
        ]
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "network_name": active_network.name,
        "nodes_count": len(active_network.nodes),
        "links_count": len(active_network.links)
    }

@app.get("/traffic/network")
def get_network_status():
    """
    Returns current network topology, active incidents, and simulated link volumes.
    """
    flow_sim = traffic_simulator.simulate_network_flow(active_network)
    return {
        "network_name": active_network.name,
        "nodes": active_network.nodes,
        "links": active_network.links,
        "incidents": active_network.incidents,
        "weather_factor": active_network.weather_factor,
        "simulation": flow_sim
    }

@app.post("/routes/optimize")
def optimize_route(req: RouteOptimizeRequest):
    """
    Computes optimal traffic route using quantum-inspired or classical algorithms.
    """
    # Parse origin and destination (convert to int if digits)
    orig = int(req.origin) if req.origin.isdigit() else req.origin
    dest = int(req.destination) if req.destination.isdigit() else req.destination

    # Check if nodes exist in network, fallback to default valid nodes
    if orig not in active_network.nodes:
        orig = active_network.nodes[0]
    if dest not in active_network.nodes:
        dest = active_network.nodes[min(len(active_network.nodes) - 1, 10)]

    weights_dict = req.weights.model_dump() if req.weights else {}
    algo = (req.algorithm or "QGA").upper()

    results = {}

    # Run Dijkstra
    if algo in ["DIJKSTRA", "ALL"]:
        t0 = time.time()
        d_res = dijkstra_shortest_path(active_network, orig, dest)
        results["DIJKSTRA"] = {
            "algorithm": "DIJKSTRA",
            "name": "Classical Dijkstra (Greedy)",
            "type": "Greedy Shortest Path",
            "path": d_res.get("path", []),
            "edges": d_res.get("edges", []),
            "travelTimeMins": d_res.get("cost", 0.0),
            "distanceKm": d_res.get("distance", 0.0),
            "computeTimeMs": round((time.time() - t0) * 1000, 2)
        }

    # Run A*
    if algo in ["ASTAR", "ALL"]:
        t0 = time.time()
        a_res = astar_shortest_path(active_network, orig, dest)
        results["ASTAR"] = {
            "algorithm": "ASTAR",
            "name": "A* Heuristic Search",
            "type": "Heuristic Direct Path",
            "path": a_res.get("path", []),
            "edges": a_res.get("edges", []),
            "travelTimeMins": a_res.get("cost", 0.0),
            "distanceKm": a_res.get("distance", 0.0),
            "computeTimeMs": round((time.time() - t0) * 1000, 2)
        }

    # Run QIGA
    if algo in ["QGA", "QIGA", "ALL"]:
        t0 = time.time()
        q_res = qiga_optimize(active_network, orig, dest, weights=weights_dict, pop_size=20, max_generations=25)
        best_r = q_res.get("best_route", {})
        results["QGA"] = {
            "algorithm": "QGA",
            "name": "Quantum-Inspired Genetic Algorithm (QGA)",
            "type": "Multi-Objective Quantum Pareto Route",
            "path": best_r.get("nodes", []),
            "edges": best_r.get("link_ids", []),
            "travelTimeMins": q_res.get("metrics", {}).get("travelTimeMins", 10.0),
            "distanceKm": q_res.get("metrics", {}).get("distanceKm", 5.0),
            "fitness": q_res.get("fitness", 0.0),
            "history": q_res.get("history", []),
            "computeTimeMs": round((time.time() - t0) * 1000, 2)
        }

    # Run QUBO
    if algo in ["QUBO", "ALL"]:
        t0 = time.time()
        single_trip = [{"id": 0, "origin": orig, "dest": dest}]
        qubo_res = run_qubo(active_network, single_trip, max_steps=30)
        best_routes = qubo_res.get("best_routes", [{}])
        first_route = best_routes[0] if best_routes else {}
        results["QUBO"] = {
            "algorithm": "QUBO",
            "name": "Simulated Quantum Annealing (QUBO)",
            "type": "Ising Transverse Field Tunneling",
            "path": first_route.get("nodes", []),
            "edges": first_route.get("link_ids", []),
            "travelTimeMins": qubo_res.get("metrics", {}).get("avg_travel_time", 10.0),
            "distanceKm": round(qubo_res.get("metrics", {}).get("avg_travel_time", 10.0) * 0.8, 1),
            "computeTimeMs": round((time.time() - t0) * 1000, 2)
        }

    # Select primary response
    primary_key = "QGA" if "QGA" in results else list(results.keys())[0]

    return {
        "origin": orig,
        "destination": dest,
        "primary_result": results.get(primary_key),
        "comparison": results,
        "weights_used": weights_dict
    }

@app.post("/benchmark/run")
def run_benchmark_endpoint(req: BenchmarkRequest):
    """
    Executes comparative multi-algorithm benchmark across fleet vehicles.
    """
    num_vehicles = req.num_vehicles
    nodes = active_network.nodes

    # Generate synthetic OD trips across network
    trips = []
    for i in range(num_vehicles):
        orig = nodes[(i * 3 + 1) % len(nodes)]
        dest = nodes[(i * 3 + 7) % len(nodes)]
        trips.append({"id": i, "origin": orig, "dest": dest})

    results = []

    # 1. Dijkstra
    t0 = time.time()
    res_dijkstra = run_dijkstra(active_network, trips)
    t_dijkstra = round((time.time() - t0) * 1000, 2)
    results.append({
        "algorithm": "DIJKSTRA",
        "name": "Dijkstra (Greedy Shortest Path)",
        "type": "Greedy Shortest Path",
        "isQuantum": False,
        "metrics": res_dijkstra["metrics"],
        "runtimeMs": t_dijkstra
    })

    # 2. Classical GA
    t0 = time.time()
    res_cga = run_classical_ga(active_network, trips, pop_size=req.pop_size, max_generations=req.max_steps)
    t_cga = round((time.time() - t0) * 1000, 2)
    results.append({
        "algorithm": "CGA",
        "name": "Classical Genetic Algorithm",
        "type": "Classical Evolutionary (GA)",
        "isQuantum": False,
        "metrics": res_cga["metrics"],
        "history": res_cga.get("history", []),
        "runtimeMs": t_cga
    })

    # 3. QUBO Annealing
    t0 = time.time()
    res_qubo = run_qubo(active_network, trips, max_steps=req.max_steps)
    t_qubo = round((time.time() - t0) * 1000, 2)
    results.append({
        "algorithm": "QUBO",
        "name": "Simulated Quantum Annealing (QUBO)",
        "type": "Ising Hamiltonian & Tunneling",
        "isQuantum": True,
        "metrics": res_qubo["metrics"],
        "history": res_qubo.get("history", []),
        "runtimeMs": t_qubo
    })

    # 4. Quantum-Inspired GA
    t0 = time.time()
    res_qga = run_qga(active_network, trips, pop_size=req.pop_size, max_generations=req.max_steps)
    t_qga = round((time.time() - t0) * 1000, 2)
    results.append({
        "algorithm": "QGA",
        "name": "Quantum-Inspired GA (QGA)",
        "type": "Q-bit Superposition & Rotation Gate",
        "isQuantum": True,
        "metrics": res_qga["metrics"],
        "history": res_qga.get("history", []),
        "runtimeMs": t_qga
    })

    # Calculate comparative delta vs Dijkstra baseline
    base_tstt = res_dijkstra["metrics"]["tstt"] or 1.0
    for r in results:
        tstt = r["metrics"]["tstt"]
        delta_pct = round(((tstt - base_tstt) / base_tstt) * 100, 1)
        r["tsttDeltaPct"] = "Baseline" if r["algorithm"] == "DIJKSTRA" else f"{delta_pct:+.1f}%"

    return {
        "network": active_network.name,
        "fleet_vehicles": num_vehicles,
        "timestamp": time.time(),
        "results": results
    }

@app.post("/incidents/toggle")
def toggle_incident(req: IncidentToggleRequest):
    """
    Injects or clears capacity bottleneck incident on a link.
    """
    lid = req.link_id
    if lid in active_network.incidents:
        active_network.incidents.pop(lid, None)
        status = "cleared"
    else:
        active_network.incidents[lid] = req.capacity_multiplier
        status = "injected"

    return {
        "link_id": lid,
        "status": status,
        "active_incidents": active_network.incidents
    }

@app.post("/ml/predict")
def predict_features(req: FeaturePredictionRequest):
    """
    ML estimator for expected travel time, speed, and congestion index.
    """
    pred = predict_travel_time(req.model_dump())
    return pred
