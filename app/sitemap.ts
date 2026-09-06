import type { MetadataRoute } from 'next';

const SITE = 'https://sqbpictures.com';

// `lastModified` is the field crawlers actually act on — changeFrequency and
// priority are hints Google has said it largely ignores. Build time is the
// honest answer for a statically-generated site: the pages change when we ship.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = ['', '/work', '/ai-lab', '/social', '/careers'];
  return routes.map((path) => ({
    url: `${SITE}${path}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));
}
