import type { MetadataRoute } from 'next';

const SITE = 'https://sqbpictures.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/work', '/ai-lab', '/social'];
  return routes.map((path) => ({
    url: `${SITE}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));
}
