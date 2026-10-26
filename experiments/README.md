# Experiments & Empirical Evaluation

This directory contains benchmarking suites, datasets, and experiment result logs for evaluating classical vs. quantum-inspired traffic route optimization algorithms.

## Directory Structure

- `datasets/`: Standard transportation network benchmark datasets (Sioux Falls, Chicago Sketch, Hyderabad arterial subsets).
- `results/`: Output metrics, convergence trajectories, and CSV/JSON runtime logs.
- `benchmark.py`: Execution script for comparative multi-algorithm experiments.

## Execution

```bash
python experiments/benchmark.py
```
