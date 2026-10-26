# Routing & Optimization Algorithms

## Implemented & Planned Algorithms

### 1. Classical Dijkstra
Greedy shortest path based on static free-flow travel time ($t_0$) or physical distance. Represents uncoordinated user-equilibrium baseline.

### 2. A* (A-Star) Heuristic Search
Goal-directed shortest path using admissible Haversine/Euclidean distance heuristics towards destination coordinates.

### 3. Quantum-Inspired Genetic Algorithm (QIGA)
Multi-objective optimization algorithm utilizing:
- **Quantum Bit (Q-bit) Angle Representation**: Phase angles $\theta \in [0, \pi/2]$ defining superposition states.
- **Quantum Rotation Gates**: Dynamic phase update $U(\Delta\theta)$ driving the population towards non-dominated Pareto solutions.
- **Quantum Dynamic Mutation**: Phase inversion and stochastic perturbation to escape local optima.
- **Fitness Function**: Multi-criteria weighted cost balancing travel time, congestion (V/C), distance, fuel, and emissions.
