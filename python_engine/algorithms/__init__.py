"""
Algorithms package containing routing and quantum-inspired optimization methods.
"""
from .dijkstra import dijkstra_shortest_path
from .astar import astar_shortest_path
from .qiga import qiga_optimize

__all__ = ["dijkstra_shortest_path", "astar_shortest_path", "qiga_optimize"]
