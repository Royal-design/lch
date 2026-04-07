import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leenah-ch.vercel.app"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/auth/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
