# API Specification

The Python FastAPI backend exposes endpoints for route calculation, traffic state retrieval, and benchmark evaluations.

## Base URL
Default: `http://localhost:8000/api/v1`

## Key Endpoints

- `GET /health`: System health and status check.
- `POST /routes/optimize`: Compute Pareto-optimal routes given origin, destination, and user objective weights.
- `GET /traffic/network`: Retrieve current network road edge traffic metrics (V/C, current speed, incidents).
- `POST /traffic/simulate`: Trigger time-of-day traffic flow simulation step.
- `POST /benchmark/run`: Execute comparative benchmark runs across selected algorithms and networks.
