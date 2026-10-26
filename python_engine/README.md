# Python Computational & Research Engine

The `python_engine` serves as the authoritative research and optimization backend for the Quantum-Inspired Intelligent Traffic Route Optimization platform.

## Architecture

- `graph/`: Road network graph representations, OSM ingestion, and node-link spatial mappings.
- `algorithms/`: Authoritative routing algorithms including Dijkstra, A*, and the Quantum-Inspired Genetic Algorithm (`qiga/`).
- `traffic/`: Macroscopic/mesoscopic traffic flow simulation, congestion evaluation, and Bureau of Public Roads (BPR) latency functions.
- `ml/`: Machine learning models for traffic prediction, congestion forecasting, and feature extraction.
- `api/`: FastAPI REST endpoints bridging computational routines with the React frontend.
- `data/`: Local OSM cache and processed spatial graph files.

## Running the Engine

```bash
# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn api.main:app --reload --port 8000
```
