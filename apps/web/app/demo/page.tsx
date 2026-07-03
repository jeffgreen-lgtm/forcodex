import { PREMIUM_PRODUCTS } from "@cosmoscope/api";
import { DemoExperience } from "./DemoExperience";

const products = Object.values(PREMIUM_PRODUCTS);

export const metadata = {
  title: "CosmoScope Demo",
  description: "A payment-disabled preview of the CosmoScope member experience."
};

export default function DemoPage() {
  return <DemoExperience products={products} />;
}
