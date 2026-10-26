"""
Multi-objective fitness evaluation for QIGA traffic routing.
Evaluates cost = w_time*T + w_cong*C + w_dist*D + w_fuel*F + w_emis*E + incident_penalty.
"""
from typing import Dict, Any, Optional

DEFAULT_WEIGHTS = {
    "timeWeight": 0.35,
    "congestionWeight": 0.30,
    "distanceWeight": 0.15,
    "fuelWeight": 0.10,
    "emissionsWeight": 0.10
}

def evaluate_fitness(metrics: Dict[str, Any], weights: Optional[Dict[str, float]] = None) -> float:
    """
    Computes scalarized multi-objective Pareto fitness score (lower is better).
    
    Args:
        metrics: Dictionary containing traffic metrics:
                 - tstt / travelTimeMins
                 - max_vc / maxVcRatio
                 - distance / distanceKm
                 - fuel / fuelLitres
                 - co2 / co2Kg
                 - severe_bottlenecks / severeBottlenecks
        weights: Optional dictionary of objective weights summing to 1.0.
    """
    w = dict(DEFAULT_WEIGHTS)
    if weights:
        w.update(weights)

    travel_time = metrics.get("tstt", metrics.get("travelTimeMins", metrics.get("avg_travel_time", 1.0)))
    vc_ratio = metrics.get("max_vc", metrics.get("maxVcRatio", 0.5))
    distance = metrics.get("distance", metrics.get("distanceKm", 1.0))
    fuel = metrics.get("fuel", metrics.get("fuelLitres", 0.5))
    co2 = metrics.get("co2_kg", metrics.get("co2Kg", 0.5))
    bottlenecks = metrics.get("severe_bottlenecks", metrics.get("severeBottlenecks", 0))

    # Normalized objectives with sensible baselines
    norm_time = travel_time / max(travel_time * 1.5, 10.0)
    norm_cong = vc_ratio / 1.5
    norm_dist = distance / max(distance * 1.5, 5.0)
    norm_fuel = fuel / max(fuel * 1.5, 1.0)
    norm_co2 = co2 / max(co2 * 1.5, 1.0)

    score = (
        (w.get("timeWeight", 0.35) * norm_time) +
        (w.get("congestionWeight", 0.30) * norm_cong) +
        (w.get("distanceWeight", 0.15) * norm_dist) +
        (w.get("fuelWeight", 0.10) * norm_fuel) +
        (w.get("emissionsWeight", 0.10) * norm_co2) +
        (bottlenecks * 0.5)
    )

    return float(round(score, 4))
