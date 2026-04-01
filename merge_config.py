from pricing_defaults import SYSTEM_DEFAULTS


def merge_config(db_config: dict | None) -> dict:
    """Merge a client-specific config with system defaults.

    Fields not set in db_config fall back to SYSTEM_DEFAULTS.
    """
    if db_config is None:
        return SYSTEM_DEFAULTS.copy()

    def _get(key):
        val = db_config.get(key)
        return val if val is not None else SYSTEM_DEFAULTS[key]

    return {
        "tiers": _get("tiers"),
        "bor_commission_pmpm": _get("bor_commission_pmpm"),
        "concierge_pepm": _get("concierge_pepm"),
        "payment_processing_pepm": _get("payment_processing_pepm"),
        "default_membership": _get("default_membership"),
        "default_admin_pepm": _get("default_admin_pepm"),
        "default_member_ratio": _get("default_member_ratio"),
    }
