# Frontend Algorithm Utilities & Interfaces

This directory is reserved strictly for frontend-specific algorithm types, visualization adapters, and state wrappers.

## Architectural Note

The authoritative routing, ML prediction, and Quantum-Inspired optimization routines reside in the **Python Computational Engine** (`python_engine/algorithms/`).

The frontend interfaces with the computational engine via `src/services/api.ts` and `src/services/routing.ts`.
