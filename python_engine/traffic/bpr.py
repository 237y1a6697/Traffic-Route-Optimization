"""
Bureau of Public Roads (BPR) link latency function.
Formula: t_e = t_0 * [1 + alpha * (V / C)^beta]
"""

def calculate_bpr_latency(t0: float, volume: float, capacity: float, alpha: float = 0.15, beta: float = 4.0) -> float:
    """
    Computes congested travel time on a link using standard BPR parameters.
    """
    safe_cap = max(capacity, 1.0)
    vc_ratio = volume / safe_cap
    return t0 * (1.0 + alpha * (vc_ratio ** beta))
