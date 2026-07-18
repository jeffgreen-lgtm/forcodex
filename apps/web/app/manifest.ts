import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CosmoScope",
    short_name: "CosmoScope",
    description:
      "Personal astrological guidance built from your exact birth data and today’s sky.",
    start_url: "/app",
    display: "standalone",
    background_color: "#0c0912",
    theme_color: "#120f1f",
    orientation: "portrait-primary"
  };
}
