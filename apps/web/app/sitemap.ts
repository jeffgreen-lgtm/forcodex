import type { MetadataRoute } from "next";

const siteUrl = "https://cosmo.greenhenncollective.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/app`,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${siteUrl}/beta-feedback`,
      changeFrequency: "monthly",
      priority: 0.4
    }
  ];
}
