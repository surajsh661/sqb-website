// BreadcrumbList structured data for the sub-pages.
//
// This is what Google renders in place of the raw URL in a search result
// ("sqbpictures.com › Careers"). The site is one level deep and every page
// carries the full nav, so the trail is Home → <page> and no more.

const SITE = 'https://sqbpictures.com';

export function breadcrumbJsonLd(page: { name: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: page.name, item: `${SITE}${page.path}` },
    ],
  };
}
