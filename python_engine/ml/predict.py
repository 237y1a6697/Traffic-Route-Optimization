"""
Traffic speed and travel time prediction inference module.
Predicts speed and travel time given road attributes, temporal features, and weather.
"""
from typing import Dict, Any

def predict_travel_time(edge_features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predicts expected travel time, speed, and congestion index from feature vector.
    
    Features:
        distance: length in km
        speed_limit: base speed limit in km/h
        capacity: link design capacity in veh/h
        time_of_day: hour in [0.0, 24.0]
        is_peak: boolean
        weather_factor: weather multiplier in [0.5, 1.0]
    """
    dist = float(edge_features.get("distance", 2.0))
    speed_limit = float(edge_features.get("speed_limit", 50.0))
    time_of_day = float(edge_features.get("time_of_day", 9.0))
    weather_factor = float(edge_features.get("weather_factor", 1.0))

    # Free flow travel time (minutes)
    free_flow_time = (dist / max(speed_limit, 10.0)) * 60.0

    # Rush hour congestion curve
    is_peak = (8.0 <= time_of_day <= 10.5) or (17.0 <= time_of_day <= 20.0)
    peak_multiplier = 1.65 if is_peak else (1.20 if 11.0 <= time_of_day <= 16.0 else 1.0)

    # Weather impact
    weather_slowdown = 1.0 / max(weather_factor, 0.5)

    predicted_time = free_flow_time * peak_multiplier * weather_slowdown
    predicted_speed = max(10.0, (dist / (predicted_time / 60.0)))
    congestion_ratio = min(1.8, predicted_time / max(free_flow_time, 0.01))

    return {
        "distance_km": round(dist, 2),
        "free_flow_mins": round(free_flow_time, 2),
        "predicted_travel_time_mins": round(predicted_time, 2),
        "predicted_speed_kmh": round(predicted_speed, 1),
        "congestion_index": round(congestion_ratio, 2),
        "is_peak": is_peak
    }
