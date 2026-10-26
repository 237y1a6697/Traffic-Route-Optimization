"""
Quantum Rotation Gate U(Delta_theta) probability amplitude update.
Rotates Q-bit phase angles toward optimal classical states using quantum rotation gate lookup table.
"""
import math
from typing import List

def apply_rotation_gate(
    angles: List[float],
    current_solution: List[int],
    best_solution: List[int],
    delta_theta: float = 0.04 * math.pi
) -> List[float]:
    """
    Updates phase angles theta using quantum rotation lookup table:
    |alpha'|   | cos(d_theta)  -sin(d_theta) | | alpha |
    |beta' | = | sin(d_theta)   cos(d_theta) | | beta  |
    
    In angle representation: theta' = theta + s(x, b) * delta_theta
    where s(x, b) directs state toward best known solution.
    """
    updated = list(angles)
    min_theta = 0.02
    max_theta = (math.pi / 2.0) - 0.02

    for i in range(len(updated)):
        curr_bit = current_solution[i] if i < len(current_solution) else 0
        best_bit = best_solution[i] if i < len(best_solution) else 0

        # Determine rotation direction s(x, b)
        if curr_bit == 0 and best_bit == 1:
            # Rotate toward |1> by increasing phase angle
            updated[i] += delta_theta
        elif curr_bit == 1 and best_bit == 0:
            # Rotate toward |0> by decreasing phase angle
            updated[i] -= delta_theta

        # Enforce boundary conditions to preserve quantum coherence
        updated[i] = max(min_theta, min(max_theta, updated[i]))

    return updated

def apply_categorical_rotation(
    angles: List[float],
    chosen_idx: int,
    best_idx: int,
    delta_theta: float = 0.04 * math.pi
) -> List[float]:
    """
    Rotates angles for candidate choices: reinforces best_idx, suppresses others.
    """
    updated = list(angles)
    min_theta = 0.02
    max_theta = (math.pi / 2.0) - 0.02

    for k in range(len(updated)):
        if k == best_idx:
            updated[k] += delta_theta
        else:
            updated[k] -= delta_theta
        updated[k] = max(min_theta, min(max_theta, updated[k]))

    return updated
