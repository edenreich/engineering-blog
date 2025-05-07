export async function getAllPosts() {
  const { getAllPosts } = await import('./mdx');
  return getAllPosts();
}

export async function getAllPostsWithMetadata() {
  const { getAllPostsWithMetadata } = await import('./mdx');
  return getAllPostsWithMetadata();
}

export async function getAllTags() {
  const { getAllTags } = await import('./mdx');
  return getAllTags();
}

export async function getPostBySlug(slug: string) {
  const { getPostBySlug } = await import('./mdx');
  return getPostBySlug(slug);
}

export { type Post } from './mdx';
