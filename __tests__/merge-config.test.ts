import { mergeConfig } from "../lib/merge-config";
import { SYSTEM_DEFAULTS } from "../lib/pricing-defaults";

describe("mergeConfig", () => {
  it("returns system defaults when no config provided", () => {
    const result = mergeConfig(null);
    expect(result.tiers).toEqual(SYSTEM_DEFAULTS.tiers);
    expect(result.defaultMembership).toBe(500);
  });

  it("uses client overrides when provided", () => {
    const config = {
      id: "1",
      clientSlug: "test",
      label: "Custom",
      tiers: [{ id: "custom", name: "Custom", platform: 3000, pepm: 15 }],
      borCommissionPmpm: 25,
      conciergePepm: null,
      paymentProcessingPepm: null,
      defaultMembership: null,
      defaultAdminPepm: null,
      defaultMemberRatio: null,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    };
    const result = mergeConfig(config);
    expect(result.tiers).toHaveLength(1);
    expect(result.tiers[0].name).toBe("Custom");
    expect(result.borCommissionPmpm).toBe(25);
    // Null fields should fall back to defaults
    expect(result.conciergePepm).toBe(SYSTEM_DEFAULTS.conciergePepm);
  });

  it("falls back to defaults when client config has empty tiers", () => {
    const config = {
      id: "2",
      clientSlug: "empty-test",
      label: "Empty",
      tiers: [],
      borCommissionPmpm: null,
      conciergePepm: null,
      paymentProcessingPepm: null,
      defaultMembership: null,
      defaultAdminPepm: null,
      defaultMemberRatio: null,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    };
    const result = mergeConfig(config);
    // Should fall back to system defaults, not use empty array
    expect(result.tiers.length).toBeGreaterThan(0);
    expect(result.tiers).toEqual(SYSTEM_DEFAULTS.tiers);
  });

  it("falls back to defaults when numeric fields are zero", () => {
    const config = {
      id: "3",
      clientSlug: "zero-test",
      label: "Zeros",
      tiers: null,
      borCommissionPmpm: null,
      conciergePepm: null,
      paymentProcessingPepm: null,
      defaultMembership: 0,
      defaultAdminPepm: 0,
      defaultMemberRatio: null,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    };
    const result = mergeConfig(config);
    // Zero is not a valid membership or admin PEPM — should fall back to defaults
    expect(result.defaultMembership).toBe(SYSTEM_DEFAULTS.defaultMembership);
    expect(result.defaultAdminPepm).toBe(SYSTEM_DEFAULTS.defaultAdminPepm);
  });
});
