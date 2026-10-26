"""
Congestion classification and index evaluation.
"""

def classify_congestion_level(vc_ratio: float) -> str:
    """
    Classifies volume-to-capacity ratio into standard traffic condition tiers.
    """
    if vc_ratio < 0.65:
        return "low"
    elif vc_ratio < 0.90:
        return "moderate"
    elif vc_ratio < 1.15:
        return "high"
    else:
        return "severe"
