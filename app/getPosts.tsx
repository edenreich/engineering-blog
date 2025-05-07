import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Metadata } from '../types/MarkdownPost';

export async function getPosts() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const fileNames = fs.readdirSync(postsDirectory);

  const markdownFiles = fileNames.filter(fileName =>
    fileName.endsWith('.md') || fileName.endsWith('.mdx')
  );

  const posts = markdownFiles.map((fileName) => {
    const slug = fileName.replace(/\.(md|mdx)$/, '');

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const { data } = matter(fileContents);

    const metadata: Metadata = {
      title: data.title as string,
      linkText: data.linkText ? data.linkText : '' as string,
      excerpt: data.excerpt as string,
      thumbnail: data.thumbnail as string | undefined,
      date: data.date as string,
      tags: data.tags ? (data.tags as string).split(', ') : [],
      draft: data.draft || false,
    };

    return {
      slug,
      metadata,
    };
  });

  const sortedPosts = posts.sort((a, b) => {
    const dateA = new Date(a.metadata.date);
    const dateB = new Date(b.metadata.date);
    return dateB.getTime() - dateA.getTime();
  });

  const allTags: string[] = [];

  posts.forEach(post => {
    post.metadata.tags.forEach(tag => {
      if (!allTags.includes(tag)) {
        allTags.push(tag);
      }
    });
  });

  return {
    posts: sortedPosts,
    tags: allTags
  };
}
