import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/mdx';
import TagList from '@/components/TagList';
import Comments from '@/components/Comments';
import MDXContent from '@/components/MDXContent';
import { Metadata as NextMetadata } from 'next';
import Image from 'next/image';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<NextMetadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post was not found.',
    };
  }

  const { metadata } = post;
  const title = metadata.title;
  const description = metadata.excerpt;

  const imageUrl = metadata.thumbnail
    ? (metadata.thumbnail.startsWith('/img/')
      ? `https://engineering-blog.eden-reich.com${metadata.thumbnail}`
      : `https://engineering-blog.eden-reich.com/img/posts/${metadata.thumbnail}`)
    : 'https://engineering-blog.eden-reich.com/img/posts/nextjs.png';

  return {
    title: `${title} | Engineering Blog`,
    description,
    keywords: metadata.tags.join(', '),
    authors: [{ name: typeof metadata.author === 'string' ? metadata.author : 'Engineering Team' }],

    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://engineering-blog.eden-reich.com/${params.slug}`,
      publishedTime: metadata.date,
      modifiedTime: typeof metadata.lastModified === 'string' ? metadata.lastModified : metadata.date,
      authors: typeof metadata.author === 'string' ? [metadata.author] : ['Engineering Team'],
      tags: metadata.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },

    alternates: {
      canonical: `/${params.slug}`,
    },
  };
}

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

  const publishDate = new Date(post.metadata.date).toISOString();
  const modifiedDate = typeof post.metadata.lastModified === 'string'
    ? new Date(post.metadata.lastModified).toISOString()
    : publishDate;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metadata.title,
    description: post.metadata.excerpt,
    image: post.metadata.thumbnail
      ? `https://engineering-blog.eden-reich.com/img/posts/${post.metadata.thumbnail}`
      : 'https://engineering-blog.eden-reich.com/img/posts/nextjs.png',
    datePublished: publishDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: typeof post.metadata.author === 'string' ? post.metadata.author : 'Engineering Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Engineering Blog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://engineering-blog.eden-reich.com/img/profile.png',
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://engineering-blog.eden-reich.com/${slug}`
    },
    keywords: post.metadata.tags.join(', ')
  };

  const heroImage = post.metadata.thumbnail
    ? (post.metadata.thumbnail.startsWith('/img/posts/')
      ? post.metadata.thumbnail
      : `/img/posts/${post.metadata.thumbnail}`)
    : null;

  return (
    <Suspense fallback={<div className="container mx-auto p-8 h-64 flex items-center justify-center">Loading post...</div>}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="blog-container">
        <div className="blog-post-header">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Published on{' '}
              <time dateTime={new Date(post.metadata.date).toISOString().split('T')[0]}>
                {post.metadata.date}
              </time>
              {typeof post.metadata.lastModified === 'string' && (
                <>
                  {' · '}Updated on{' '}
                  <time dateTime={new Date(post.metadata.lastModified).toISOString().split('T')[0]}>
                    {post.metadata.lastModified}
                  </time>
                </>
              )}
              {typeof post.metadata.readingTime === 'number' && (
                <span className="ml-3">· {post.metadata.readingTime} min read</span>
              )}
              {typeof post.metadata.readingTime === 'string' && (
                <span className="ml-3">· {post.metadata.readingTime} min read</span>
              )}
            </p>

            <h1 className="text-4xl font-bold">{post.metadata.title}</h1>

            {typeof post.metadata.author === 'string' && (
              <p className="mt-2">
                By <span className="font-medium">{post.metadata.author}</span>
              </p>
            )}

            <div className="mt-4">
              <TagList initialTags={post.metadata.tags} />
            </div>
          </div>

          {heroImage && (
            <div className="mt-6 mb-8 relative aspect-video">
              <Image
                src={heroImage}
                alt={`Cover image for ${post.metadata.title}`}
                fill
                className="object-cover rounded-lg"
                priority={true}
              />
            </div>
          )}

          {post.metadata.excerpt && (
            <div className="my-6 bg-gray-50 p-6 rounded-lg border-l-4 border-accent-color">
              <p className="text-lg italic">{post.metadata.excerpt}</p>
            </div>
          )}
        </div>

        <article className="mt-8 mb-16 prose prose-lg max-w-none">
          {post.content ? (
            <MDXContent source={post.content} />
          ) : (
            <div>No content available</div>
          )}
        </article>

        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Comments</h2>
          <Comments />
        </section>
      </section>
    </Suspense>
  );
}
