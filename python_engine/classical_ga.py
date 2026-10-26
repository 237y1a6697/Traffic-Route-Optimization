"""
Classical Genetic Algorithm and Dijkstra baselines in Python
"""
import random

def run_classical_ga(network, vehicle_trips, pop_size=20, max_generations=25, crossover_rate=0.8, mutation_rate=0.1):
    num_vehicles = len(vehicle_trips)
    if num_vehicles == 0:
        return None

    trip_candidates = [
        network.find_candidate_paths(trip["origin"], trip["dest"], 4)
        for trip in vehicle_trips
    ]

    population = [
        [random.randint(0, len(trip_candidates[v]) - 1) for v in range(num_vehicles)]
        for _ in range(pop_size)
    ]

    global_best_fitness = float("inf")
    global_best_metrics = None
    global_best_routes = None

    history = []

    for gen in range(max_generations):
        evaluated = []
        for chrom in population:
            routes = [trip_candidates[v][chrom[v]] for v in range(num_vehicles)]
            m = network.evaluate_assignment(routes)
            fitness = m["tstt"] + (m["severe_bottlenecks"] * 25.0)
            evaluated.append((chrom, fitness, m, routes))

            if fitness < global_best_fitness:
                global_best_fitness = fitness
                global_best_metrics = m
                global_best_routes = routes

        avg_fitness = sum(e[1] for e in evaluated) / pop_size
        history.append({
            "gen": gen,
            "best_fitness": round(global_best_fitness, 1),
            "avg_fitness": round(avg_fitness, 1),
            "severe_bottlenecks": global_best_metrics["severe_bottlenecks"] if global_best_metrics else 0,
            "max_vc": global_best_metrics["max_vc"] if global_best_metrics else 0
        })

        def tournament():
            i1 = random.randint(0, pop_size - 1)
            i2 = random.randint(0, pop_size - 1)
            return evaluated[i1][0] if evaluated[i1][1] < evaluated[i2][1] else evaluated[i2][0]

        next_gen = []
        while len(next_gen) < pop_size:
            p1 = tournament()
            p2 = tournament()
            c1, c2 = list(p1), list(p2)
            if random.random() < crossover_rate:
                split = random.randint(0, num_vehicles - 1)
                c1 = p1[:split] + p2[split:]
                c2 = p2[:split] + p1[split:]

            def mutate(c):
                return [
                    random.randint(0, len(trip_candidates[v]) - 1) if random.random() < mutation_rate else gene
                    for v, gene in enumerate(c)
                ]

            next_gen.append(mutate(c1))
            if len(next_gen) < pop_size:
                next_gen.append(mutate(c2))

        population = next_gen

    return {
        "algorithm": "CGA",
        "name": "Classical Genetic Algorithm",
        "best_fitness": global_best_fitness,
        "metrics": global_best_metrics,
        "best_routes": global_best_routes,
        "history": history
    }

def run_dijkstra(network, vehicle_trips):
    routes = []
    for trip in vehicle_trips:
        paths = network.find_candidate_paths(trip["origin"], trip["dest"], 1)
        routes.append(paths[0])

    m = network.evaluate_assignment(routes)
    return {
        "algorithm": "DIJKSTRA",
        "name": "Classical Dijkstra (Greedy)",
        "best_fitness": m["tstt"],
        "metrics": m
    }
