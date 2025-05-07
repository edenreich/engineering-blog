import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/mdx';
import TagList from '@/components/TagList';
import Comments from '@/components/Comments';
import MDXContent from '@/components/MDXContent';

export async function generateStaticParams() {
  return getAllPosts();
}

type PageParams = {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PageParams) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="container mx-auto p-8 h-64 flex items-center justify-center">Loading post...</div>}>
      <section className="blog-container">
        <div className="blog-post-header">
          <h1 className="text-4xl font-bold">{post.metadata.title}</h1>
          <p className="mt-2 text-lg">{post.metadata.date}</p>
          <div className="mt-4">
            <TagList initialTags={post.metadata.tags} />
          </div>
        </div>

        <div className="mt-8 mb-16 prose prose-lg max-w-none">
          {post.content ? (
            <MDXContent source={post.content} />
          ) : (
            <div>No content available</div>
          )}
        </div>
      </section>
      <Comments />
    </Suspense>
  );
}
