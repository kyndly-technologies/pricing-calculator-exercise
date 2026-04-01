import { ResolvedConfig } from "./types";

export const SYSTEM_DEFAULTS: ResolvedConfig = {
  tiers: [
    { id: "catalyst", name: "Catalyst", platform: 2500, pepm: 20 },
    { id: "core", name: "Core", platform: 5000, pepm: 12.5 },
    { id: "premier", name: "Premier", platform: 10000, pepm: 7.5 },
  ],
  borCommissionPmpm: 20,
  conciergePepm: 10,
  paymentProcessingPepm: 2,
  defaultMembership: 500,
  defaultAdminPepm: 50,
  defaultMemberRatio: 1.5,
};
