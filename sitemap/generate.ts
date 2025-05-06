import fs from 'fs';
import path from 'path';
import { fetchMarkdownPosts } from '../utils/markdownParser';
import { MarkdownPost } from '../types/MarkdownPost';

interface SitemapEntry {
  url: string;
  lastMod: string;
  changeFreq: string;
}

const generateSitemap = async () => {
  const baseUrl = 'https://engineering-blog.eden-reich.com';
  const posts: MarkdownPost[] = await fetchMarkdownPosts();
  const staticPages = ['/', '/about/', '/contact/'];
  const currentDate = new Date().toISOString().split('T')[0];

  const modificationTrackingPath = path.join(process.cwd(), 'sitemap', 'last-modified.json');

  let previousModifications: Record<string, string> = {};
  try {
    if (fs.existsSync(modificationTrackingPath)) {
      previousModifications = JSON.parse(fs.readFileSync(modificationTrackingPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Could not load previous modification data, generating full sitemap');
  }

  const currentModifications: Record<string, string> = {};

  const staticPagesEntries: SitemapEntry[] = staticPages.map((page) => {
    let pagePath = page === '/'
      ? path.join(process.cwd(), 'app', 'page.tsx')
      : path.join(process.cwd(), 'app', page.replace(/\/$/, ''), 'page.tsx');

    let lastMod = currentDate;
    if (fs.existsSync(pagePath)) {
      const stats = fs.statSync(pagePath);
      const fileModTime = new Date(stats.mtime).toISOString().split('T')[0];
      lastMod = fileModTime;
    }

    currentModifications[page] = lastMod;

    return {
      url: `${baseUrl}${page}`,
      lastMod,
      changeFreq: 'monthly'
    };
  });

  const postsEntries: SitemapEntry[] = posts.map((post) => {
    const postUrl = `/${post.slug}/`;
    const postsDir = path.join(process.cwd(), 'posts');
    let lastMod = currentDate;

    const mdFilePath = path.join(postsDir, `${post.slug}.md`);
    const mdxFilePath = path.join(postsDir, `${post.slug}.mdx`);

    if (fs.existsSync(mdFilePath)) {
      const stats = fs.statSync(mdFilePath);
      lastMod = new Date(stats.mtime).toISOString().split('T')[0];
    } else if (fs.existsSync(mdxFilePath)) {
      const stats = fs.statSync(mdxFilePath);
      lastMod = new Date(stats.mtime).toISOString().split('T')[0];
    }

    currentModifications[postUrl] = lastMod;

    return {
      url: `${baseUrl}${postUrl}`,
      lastMod,
      changeFreq: 'monthly'
    };
  });

  const allEntries = [...staticPagesEntries, ...postsEntries];

  const modifiedEntries = allEntries.filter(entry => {
    const urlPath = new URL(entry.url).pathname;
    return !previousModifications[urlPath] ||
      previousModifications[urlPath] !== entry.lastMod;
  });

  console.log(`Found ${modifiedEntries.length} modified entries out of ${allEntries.length} total`);

  if (modifiedEntries.length === 0 && Object.keys(previousModifications).length > 0) {
    console.log('No changes detected, sitemap remains unchanged');
    return;
  }

  const finalEntries = allEntries.map(entry => {
    const urlPath = new URL(entry.url).pathname;
    const isModified = !previousModifications[urlPath] ||
      previousModifications[urlPath] !== entry.lastMod;

    if (isModified) {
      console.log(`Modified: ${entry.url} (${entry.lastMod})`);
    }

    return entry;
  });

  const urlXml = finalEntries
    .map(entry => {
      return `    <url>
      <loc>${entry.url}</loc>
      <lastmod>${entry.lastMod}</lastmod>
      <changefreq>${entry.changeFreq}</changefreq>
    </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlXml}
</urlset>`;

  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);

  fs.writeFileSync(modificationTrackingPath, JSON.stringify(currentModifications, null, 2));

  console.log(`Sitemap generated at ${sitemapPath}`);
  console.log(`Total URLs in sitemap: ${finalEntries.length}`);
};

generateSitemap().catch((error) => {
  console.error('Error generating sitemap:', error);
  process.exit(1);
});
