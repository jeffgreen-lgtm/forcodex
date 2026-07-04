import { CreatorStudio } from "./CreatorStudio";

export const metadata = {
  title: "Creator Studio | CosmoScope",
  description: "Private internal CosmoScope Creator Studio.",
  robots: {
    index: false,
    follow: false
  }
};

export default function StudioPage() {
  return <CreatorStudio />;
}
