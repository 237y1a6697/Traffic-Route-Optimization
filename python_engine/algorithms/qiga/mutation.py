"""
Quantum dynamic mutation operators (Phase inversion and random shift).
Applies quantum NOT or phase disturbance to escape local Pareto optima.
"""
import math
import random
from typing import List

def apply_quantum_mutation(
    angles: List[float],
    mutation_rate: float = 0.05
) -> List[float]:
    """
    Applies quantum NOT gate (phase inversion) or stochastic phase disturbance:
    theta' = (pi / 2) - theta + disturbance
    """
    mutated = list(angles)
    min_theta = 0.02
    max_theta = (math.pi / 2.0) - 0.02

    for i in range(len(mutated)):
        if random.random() < mutation_rate:
            # Quantum NOT inversion: |psi> = alpha|0> + beta|1>  -->  beta|0> + alpha|1>
            new_angle = (math.pi / 2.0) - mutated[i]
            # Small stochastic perturbation
            disturbance = (random.random() - 0.5) * 0.1
            mutated[i] = max(min_theta, min(max_theta, new_angle + disturbance))

    return mutated
