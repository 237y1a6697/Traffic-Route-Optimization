"""
Quantum-Inspired Genetic Algorithm (QGA) in Python
"""
import math
import random
import copy

def run_qga(network, vehicle_trips, pop_size=20, max_generations=25, delta_theta_base=0.04 * math.pi):
    num_vehicles = len(vehicle_trips)
    if num_vehicles == 0:
        return None

    trip_candidates = [
        network.find_candidate_paths(trip["origin"], trip["dest"], 4)
        for trip in vehicle_trips
    ]

    # Initialize Q-bit population phase angles theta in [0, pi/2]
    # theta = pi/4 gives equal superposition |psi> = 1/sqrt(2)|0> + 1/sqrt(2)|1>
    population_angles = [
        [[math.pi / 4.0 for _ in range(len(trip_candidates[v]))] for v in range(num_vehicles)]
        for _ in range(pop_size)
    ]

    global_best_fitness = float("inf")
    global_best_routes = None
    global_best_metrics = None

    history = []

    for gen in range(max_generations):
        fitness_list = []

        for p in range(pop_size):
            routes = []
            for v in range(num_vehicles):
                angles = population_angles[p][v]
                probs = [math.sin(th) ** 2 for th in angles]
                total_p = sum(probs) or 1.0

                rand_val = random.random() * total_p
                cum = 0.0
                chosen_idx = 0
                for k, pr in enumerate(probs):
                    cum += pr
                    if rand_val <= cum:
                        chosen_idx = k
                        break
                routes.append(trip_candidates[v][chosen_idx])

            metrics = network.evaluate_assignment(routes)
            fitness = metrics["tstt"] + (metrics["severe_bottlenecks"] * 25.0)
            fitness_list.append(fitness)

            if fitness < global_best_fitness:
                global_best_fitness = fitness
                global_best_routes = routes
                global_best_metrics = metrics

        avg_fitness = sum(fitness_list) / pop_size
        history.append({
            "gen": gen,
            "best_fitness": round(global_best_fitness, 1),
            "avg_fitness": round(avg_fitness, 1)
        })

        # Apply Quantum Rotation Gate
        current_delta = delta_theta_base * (1.0 - 0.7 * (gen / max_generations))
        for p in range(pop_size):
            for v in range(num_vehicles):
                best_route = global_best_routes[v]
                try:
                    best_k = trip_candidates[v].index(best_route)
                except ValueError:
                    best_k = 0

                for k in range(len(population_angles[p][v])):
                    theta = population_angles[p][v][k]
                    if k == best_k:
                        theta += current_delta
                    else:
                        theta -= current_delta

                    # Quantum Dynamic Mutation
                    if random.random() < 0.05:
                        theta = (math.pi / 2.0) - theta + (random.random() - 0.5) * 0.1

                    population_angles[p][v][k] = max(0.02, min(math.pi / 2.0 - 0.02, theta))

    return {
        "algorithm": "QGA",
        "name": "Quantum-Inspired Genetic Algorithm",
        "best_fitness": global_best_fitness,
        "metrics": global_best_metrics,
        "history": history
    }
