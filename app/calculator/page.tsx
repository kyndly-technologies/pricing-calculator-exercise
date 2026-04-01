import { SYSTEM_DEFAULTS } from "@/lib/pricing-defaults";
import PricingCalculator from "./components/PricingCalculator";

export default function CalculatorPage() {
  return <PricingCalculator config={SYSTEM_DEFAULTS} />;
}
