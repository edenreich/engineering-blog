import fs from 'fs';
import path from 'path';
import { fetchMarkdownPosts } from '@/utils/markdownParser';
import { MarkdownPost } from '@/types/MarkdownPost';

const generateSitemap = async () => {
  const baseUrl = 'https://engineering-blog.eden-reich.com';
  const posts: MarkdownPost[] = await fetchMarkdownPosts();
  const staticPages = ['/', '/about/', '/contact/'];
  const date = new Date().toISOString().split('T')[0];

  const staticPagesXml = staticPages
    .map((page) => {
      return `
        <url>
          <loc>${baseUrl}${page}</loc>
          <lastmod>${date}</lastmod>
          <changefreq>monthly</changefreq>
        </url>
  `;
    })
    .join('');

  const postsXml = posts
    .map((post) => {
      return `
        <url>
          <loc>${baseUrl}/${post.slug}/</loc>
          <lastmod>${date}</lastmod>
          <changefreq>monthly</changefreq>
        </url>`;
    })
    .join('');

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticPagesXml}${postsXml}
      </urlset>`.replace(/>\s+</g, '><').trim();

  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');

  fs.writeFileSync(sitemapPath, sitemap.trim());
  console.log(`Sitemap generated at ${sitemapPath}`);
};

generateSitemap().catch((error) => {
  console.error('Error generating sitemap:', error);
  process.exit(1);
});
