import { SYSTEM_DEFAULTS } from "./pricing-defaults";
import { PricingConfigRecord, ResolvedConfig } from "./types";

export function mergeConfig(
  dbConfig: PricingConfigRecord | null
): ResolvedConfig {
  if (!dbConfig) return SYSTEM_DEFAULTS;

  return {
    tiers: dbConfig.tiers ?? SYSTEM_DEFAULTS.tiers,
    borCommissionPmpm:
      dbConfig.borCommissionPmpm ?? SYSTEM_DEFAULTS.borCommissionPmpm,
    conciergePepm: dbConfig.conciergePepm ?? SYSTEM_DEFAULTS.conciergePepm,
    paymentProcessingPepm:
      dbConfig.paymentProcessingPepm ??
      SYSTEM_DEFAULTS.paymentProcessingPepm,
    defaultMembership:
      dbConfig.defaultMembership ?? SYSTEM_DEFAULTS.defaultMembership,
    defaultAdminPepm:
      dbConfig.defaultAdminPepm ?? SYSTEM_DEFAULTS.defaultAdminPepm,
    defaultMemberRatio:
      dbConfig.defaultMemberRatio ?? SYSTEM_DEFAULTS.defaultMemberRatio,
  };
}
