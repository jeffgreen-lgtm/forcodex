import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/reset"]
    },
    sitemap: "https://cosmo.greenhenncollective.com/sitemap.xml",
    host: "https://cosmo.greenhenncollective.com"
  };
}
