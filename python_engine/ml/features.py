"""
Feature extraction pipeline for traffic estimation.
"""

def extract_traffic_features(edge_dict: dict, timestamp: float, weather: str = "clear") -> dict:
    """
    Extracts numerical feature vector for machine learning estimators.
    """
    return {
        "distance": edge_dict.get("distance", 1.0),
        "capacity": edge_dict.get("capacity", 2000.0),
        "speed_limit": edge_dict.get("speed_limit", 50.0),
        "time_of_day": timestamp,
        "is_peak": 7.0 <= timestamp <= 10.0 or 17.0 <= timestamp <= 20.0,
        "weather_factor": 0.8 if weather == "rain" else 1.0
    }
