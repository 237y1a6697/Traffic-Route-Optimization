"""
Q-bit Chromosome representation for QIGA.
Represents individual states using quantum bit angles theta in [0, pi/2].
Each Q-bit state is |psi> = cos(theta)|0> + sin(theta)|1>.
"""
import math
import random
from typing import List

class QubitChromosome:
    def __init__(self, length: int):
        self.length = length
        # Initialize in equal superposition theta = pi / 4
        # cos(pi/4)^2 = sin(pi/4)^2 = 0.5
        self.angles: List[float] = [math.pi / 4.0] * length

    def observe(self) -> List[int]:
        """
        Collapses quantum state into classical binary string via measurement:
        P(1) = sin^2(theta), P(0) = cos^2(theta).
        """
        collapsed = []
        for th in self.angles:
            p_one = math.sin(th) ** 2
            collapsed.append(1 if random.random() < p_one else 0)
        return collapsed

    def sample_categorical(self, candidate_counts: List[int]) -> List[int]:
        """
        Samples path indices across multiple decision variables (e.g. per-vehicle candidate paths).
        """
        choices = []
        offset = 0
        for count in candidate_counts:
            if count <= 1:
                choices.append(0)
                offset += count
                continue

            sub_angles = self.angles[offset:offset + count]
            probs = [math.sin(th) ** 2 for th in sub_angles]
            total_p = sum(probs) or 1.0

            r = random.random() * total_p
            cum = 0.0
            chosen = 0
            for idx, p in enumerate(probs):
                cum += p
                if r <= cum:
                    chosen = idx
                    break
            choices.append(chosen)
            offset += count
        return choices
