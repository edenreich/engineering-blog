import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Metadata, MarkdownPost } from '../types/MarkdownPost';

export type Post = MarkdownPost;

export async function getAllPosts(): Promise<{ slug: string }[]> {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const fileNames = fs.readdirSync(postsDirectory);

  const markdownFiles = fileNames.filter(fileName =>
    fileName.endsWith('.md') || fileName.endsWith('.mdx')
  );

  return markdownFiles.map((fileName) => {
    const slug = fileName.replace(/\.(md|mdx)$/, '');
    return { slug };
  });
}

export async function getAllPostsWithMetadata(): Promise<Post[]> {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const fileNames = fs.readdirSync(postsDirectory);

  const markdownFiles = fileNames.filter(fileName =>
    fileName.endsWith('.md') || fileName.endsWith('.mdx')
  );

  const postsPromises = markdownFiles.map(async (fileName) => {
    const slug = fileName.replace(/\.(md|mdx)$/, '');
    const post = await getPostBySlug(slug);
    return post;
  });

  const posts = (await Promise.all(postsPromises)).filter(post => post !== null) as Post[];

  return posts.sort((a, b) => {
    const dateA = new Date(a.metadata.date);
    const dateB = new Date(b.metadata.date);
    return dateB.getTime() - dateA.getTime();
  });
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPostsWithMetadata();
  const allTags: string[] = [];

  posts.forEach(post => {
    post.metadata.tags.forEach(tag => {
      if (!allTags.includes(tag)) {
        allTags.push(tag);
      }
    });
  });

  return allTags;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const postsDirectory = path.join(process.cwd(), 'posts');

    let fullPath = path.join(postsDirectory, `${slug}.mdx`);
    let isMarkdownX = true;

    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(postsDirectory, `${slug}.md`);
      isMarkdownX = false;

      if (!fs.existsSync(fullPath)) {
        return null;
      }
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const metadata: Metadata = {
      title: data.title as string,
      linkText: data.linkText ? data.linkText : '' as string,
      excerpt: data.excerpt as string,
      image: data.image as string | undefined,
      thumbnail: data.thumbnail as string | undefined,
      date: data.date as string,
      tags: data.tags ? (data.tags as string).split(', ') : [],
      draft: data.draft || false,
    };

    return {
      slug,
      metadata,
      content,
      isMarkdownX
    };
  } catch (error) {
    console.error(`Error getting post with slug ${slug}:`, error);
    return null;
  }
}
