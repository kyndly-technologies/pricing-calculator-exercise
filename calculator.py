from pricing_defaults import SYSTEM_DEFAULTS


def find_best_tier(tiers, membership, concierge, payment, config):
    """Find the tier with the lowest total cost for given inputs."""
    best = tiers[0]
    best_cost = float("inf")
    for t in tiers:
        cost = (
            t["platform"]
            + t["pepm"] * membership
            + (config["concierge_pepm"] if concierge else 0) * membership
            + (config["payment_processing_pepm"] if payment else 0) * membership
        )
        if cost < best_cost:
            best_cost = cost
            best = t
    return best["id"]


def calculate_pnl(
    config: dict,
    membership: int = 500,
    admin_pepm: float = 50,
    member_ratio: float = 1.5,
    concierge: bool = False,
    payment: bool = False,
    tier_override: str | None = None,
) -> dict:
    """Calculate the full P&L for given inputs and config.

    Returns a dict with all revenue, cost, and profit figures.
    """
    tiers = config["tiers"]
    total_members = round(membership * member_ratio)

    # Determine active tier
    recommended_tier = find_best_tier(tiers, membership, concierge, payment, config)
    active_tier_id = tier_override or recommended_tier
    tier = next(t for t in tiers if t["id"] == active_tier_id)

    # Revenue
    admin_revenue = admin_pepm * membership
    # BUG: should be total_members, not membership
    bor_revenue = 0 if concierge else config["bor_commission_pmpm"] * membership
    gross_revenue = admin_revenue + bor_revenue

    # Costs
    platform_cost = tier["platform"]
    pepm_cost = tier["pepm"] * membership
    concierge_cost = config["concierge_pepm"] * membership if concierge else 0
    payment_cost = config["payment_processing_pepm"] * membership if payment else 0
    total_cost = platform_cost + pepm_cost + concierge_cost + payment_cost

    # Profit
    monthly_profit = gross_revenue - total_cost
    annual_profit = monthly_profit * 12
    margin = (monthly_profit / gross_revenue * 100) if gross_revenue > 0 else 0

    return {
        "tier": tier,
        "recommended_tier": recommended_tier,
        "total_members": total_members,
        "admin_revenue": admin_revenue,
        "bor_revenue": bor_revenue,
        "gross_revenue": gross_revenue,
        "platform_cost": platform_cost,
        "pepm_cost": pepm_cost,
        "concierge_cost": concierge_cost,
        "payment_cost": payment_cost,
        "total_cost": total_cost,
        "monthly_profit": monthly_profit,
        "annual_profit": annual_profit,
        "margin": margin,
    }
