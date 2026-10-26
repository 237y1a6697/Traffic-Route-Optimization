"""
Simulated Quantum Annealing (QUBO) in Python
Formulates the multi-vehicle traffic path selection as an Ising / QUBO Hamiltonian
with a time-dependent transverse quantum tunneling field Gamma(t) and thermal annealing.
"""
import math
import random

def run_qubo(network, vehicle_trips, max_steps=35, gamma0=4.0, temp0=2.5, penalty_lambda=30.0):
    num_vehicles = len(vehicle_trips)
    if num_vehicles == 0:
        return None

    trip_candidates = [
        network.find_candidate_paths(trip["origin"], trip["dest"], 4)
        for trip in vehicle_trips
    ]

    current_state = [random.randint(0, len(c) - 1) for c in trip_candidates]

    def eval_energy(state):
        routes = [trip_candidates[v][state[v]] for v in range(num_vehicles)]
        m = network.evaluate_assignment(routes)

        # Quadratic penalty for links operating over effective capacity: QUBO formulation sum (V_e - C_e)^2
        volumes = {l["id"]: 0 for l in network.links}
        for r in routes:
            for lid in r.get("link_ids", []):
                if lid in volumes:
                    volumes[lid] += 1

        quadratic_excess = 0.0
        for l in network.links:
            cap = network.get_effective_capacity(l)
            vol = volumes[l["id"]]
            if vol > cap:
                diff = vol - cap
                quadratic_excess += diff * diff

        energy = m["tstt"] + (quadratic_excess * penalty_lambda) + (m["severe_bottlenecks"] * 15.0)
        return energy, m, routes

    curr_energy, best_metrics, best_routes = eval_energy(current_state)
    best_energy = curr_energy
    best_state = list(current_state)

    history = []

    for step in range(max_steps):
        progress = step / max(max_steps, 1)
        gamma = gamma0 * math.pow(max(0.0, 1.0 - progress), 1.5)
        temp = temp0 * (1.0 - 0.85 * progress)

        for _ in range(num_vehicles):
            v = random.randint(0, num_vehicles - 1)
            num_opts = len(trip_candidates[v])
            if num_opts <= 1:
                continue

            old_c = current_state[v]
            new_c = random.randint(0, num_opts - 1)
            if new_c == old_c:
                continue

            current_state[v] = new_c
            cand_energy, cand_m, cand_r = eval_energy(current_state)
            delta_e = cand_energy - curr_energy

            # Quantum tunneling effective barrier temperature
            effective_temp = math.sqrt(temp ** 2 + gamma ** 2)
            accept_prob = 1.0 if delta_e < 0 else math.exp(-delta_e / max(effective_temp, 0.001))

            if random.random() < accept_prob:
                curr_energy = cand_energy
                if cand_energy < best_energy:
                    best_energy = cand_energy
                    best_state = list(current_state)
                    best_metrics = cand_m
                    best_routes = cand_r
            else:
                current_state[v] = old_c

        history.append({
            "step": step,
            "best_fitness": round(best_energy, 1),
            "curr_fitness": round(curr_energy, 1),
            "gamma": round(gamma, 3),
            "temp": round(temp, 3),
            "severe_bottlenecks": best_metrics["severe_bottlenecks"],
            "max_vc": best_metrics["max_vc"]
        })

    return {
        "algorithm": "QUBO",
        "name": "Simulated Quantum Annealing (QUBO)",
        "best_fitness": best_energy,
        "metrics": best_metrics,
        "best_routes": best_routes,
        "history": history
    }
