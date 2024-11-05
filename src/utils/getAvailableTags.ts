import { MarkdownPost } from '@/types/MarkdownPost';

export async function getAvailableTags(
  posts: MarkdownPost[]
): Promise<string[]> {
  const tags = new Set<string>();
  posts.forEach((post: MarkdownPost) => {
    if (!post.metadata.tags) {
      return;
    }
    if (post.metadata.draft === true) {
      return;
    }

    post.metadata.tags.forEach((tag: string) => tags.add(tag));
  });

  return Array.from(tags);
}
