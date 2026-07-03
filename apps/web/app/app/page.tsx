import { LiveExperience } from "./LiveExperience";

export const metadata = {
  title: "CosmoScope App",
  description: "Live CosmoScope member readings."
};

export default function AppPage() {
  return <LiveExperience />;
}
