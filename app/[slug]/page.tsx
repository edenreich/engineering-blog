import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import MDXPost from '../../components/MDXPost';
import { getPostBySlug, getAllPosts } from '@/lib/mdx';

export async function generateStaticParams() {
  return getAllPosts();
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="container mx-auto p-8 h-64 flex items-center justify-center">Loading post...</div>}>
      <MDXPost post={post} />
    </Suspense>
  );
}