import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import langHttp from 'highlight.js/lib/languages/http';
import langNginx from 'highlight.js/lib/languages/nginx';
import langDockerfile from 'highlight.js/lib/languages/dockerfile';
import langYaml from 'highlight.js/lib/languages/yaml';
import langGolang from 'highlight.js/lib/languages/go';
import langRust from 'highlight.js/lib/languages/rust';
import { MarkdownPost, Metadata } from '@/types/MarkdownPost';

export async function fetchMarkdownPosts(): Promise<MarkdownPost[]> {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const fileNames = fs.readdirSync(postsDirectory);

  const posts = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const filePath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(filePath, 'utf8');

      const { data, content } = matter(fileContents);
      data.slug = slug;

      const processedContent = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeHighlight, {
          languages: {
            http: langHttp,
            nginx: langNginx,
            dockerfile: langDockerfile,
            yaml: langYaml,
            golang: langGolang,
            rust: langRust,
          },
        })
        .use(rehypeStringify)
        .process(content);

      const metadata: Metadata = {
        title: data.title as string,
        linkText: data.linkText ? data.linkText : '' as string,
        excerpt: data.excerpt as string,
        thumbnail: data.thumbnail as string | undefined,
        date: data.date as string,
        tags: data.tags.split(', '),
      };

      return {
        slug,
        metadata: metadata,
        content: processedContent.toString(),
      } as MarkdownPost;
    })
  );

  return posts;
}
