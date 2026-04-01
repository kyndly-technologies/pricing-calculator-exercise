export interface Tier {
  id: string;
  name: string;
  platform: number;
  pepm: number;
}

export interface ResolvedConfig {
  tiers: Tier[];
  borCommissionPmpm: number;
  conciergePepm: number;
  paymentProcessingPepm: number;
  defaultMembership: number;
  defaultAdminPepm: number;
  defaultMemberRatio: number;
}

export interface PricingConfigRecord {
  id: string;
  clientSlug: string;
  label: string;
  tiers?: Tier[] | null;
  borCommissionPmpm?: number | null;
  conciergePepm?: number | null;
  paymentProcessingPepm?: number | null;
  defaultMembership?: number | null;
  defaultAdminPepm?: number | null;
  defaultMemberRatio?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  slug: string;
  status: "prospect" | "active" | "archived";
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
