import Link from 'next/link';
import Image from 'next/image';
import TagList from '@/components/TagList';
import TagFilter from '@/components/TagFilter';
import { getAllPostsWithMetadata, getAllTags } from '@/lib';
import { Metadata } from 'next';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const tags = await getAllTags();

  const allTags = tags.map(tag => tag.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ');

  return {
    title: 'Engineering Blog | Latest Tech Insights and Best Practices',
    description: 'Explore expert insights on software engineering, cloud native technologies, AI, and more. Stay updated with the latest trends and best practices.',
    keywords: `software engineering, tech blog, ${allTags}, development best practices, coding tutorials`,

    openGraph: {
      title: 'Engineering Blog | Technology Insights and Best Practices',
      description: 'The latest insights on software engineering, cloud technologies, and development best practices from our expert team.',
      url: 'https://engineering-blog.eden-reich.com',
      siteName: 'Engineering Blog',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/img/posts/kubernetes.png',
          width: 1200,
          height: 630,
          alt: 'Engineering Blog',
        }
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: 'Engineering Blog | Technology Insights',
      description: 'Latest thoughts on software engineering, cloud native technologies, and more.',
      images: ['/img/posts/kubernetes.png'],
    },

    alternates: {
      canonical: '/',
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ slug: "/" }];
}

type PageParams = {
  params: Promise<{ slug: string }>
}

export default async function Home({ params }: PageParams) {
  const p = await params;
  const slug = p.slug;
  const posts = await getAllPostsWithMetadata();
  const tags = await getAllTags();

  const publishedPosts = posts.filter((post) => !post.metadata.draft && post.slug !== slug);

  const postElements = publishedPosts.map(post => ({
    slug: post.slug,
    tags: post.metadata.tags
  }));

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    headline: 'Engineering Blog',
    description: 'Latest thoughts on software engineering, cloud native technologies, and more.',
    url: 'https://engineering-blog.eden-reich.com',
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Engineering Team',
      url: 'https://engineering-blog.eden-reich.com/about',
    },
    blogPost: publishedPosts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: post.metadata.title,
      description: post.metadata.excerpt,
      datePublished: post.metadata.date,
      url: `https://engineering-blog.eden-reich.com/${post.slug}`,
      author: {
        '@type': 'Person',
        name: post.metadata.author || 'Engineering Team',
      },
      keywords: post.metadata.tags.join(', ')
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="blog-container py-8">
        <div className="blog-header text-center mb-8">
          <h1 className="blog-title">Engineering Blog</h1>
          <p className="blog-subtitle">
            Latest thoughts on software engineering, cloud native technologies, and more.
          </p>

          <div className="flex flex-wrap justify-center mb-8">
            <TagList initialTags={tags} />
          </div>

          <div id="tag-filter-indicator" className="mt-6 mb-8 flex justify-center" style={{ display: 'none' }}>
            <div className="filter-indicator px-6 py-3 rounded-lg shadow-sm flex items-center">
              <span className="mr-2">Currently filtering:</span>
              <span id="current-tag-name" className="tag-pill"></span>
              <Link href="/" className="clear-filter-btn ml-4" aria-label="Clear filter">
                <span className="sr-only">Clear filter</span>
                &times;
              </Link>
            </div>
          </div>
        </div>

        <h2 id="posts-heading" className="text-2xl font-bold mb-6">Blog Posts</h2>

        <div id="no-posts-message" className="text-center py-8" style={{ display: 'none' }}>
          <p className="text-lg">No posts found with this tag.</p>
          <Link href="/" className="mt-4 inline-block text-accent-color underline">
            View all posts
          </Link>
        </div>

        <div className="blog-posts-grid" id="posts-container">
          {publishedPosts.map((post) => {
            const imagePath = post.metadata.thumbnail ?
              (post.metadata.thumbnail.startsWith('/img/posts/') ?
                post.metadata.thumbnail :
                `/img/posts/${post.metadata.thumbnail}`) :
              '/img/pencil.png';

            return (
              <div
                key={post.slug}
                className="blog-post-card"
                data-tags={post.metadata.tags.map(t => t.trim()).join(',')}
              >
                <div className="h-48 relative">
                  <Image
                    src={imagePath}
                    alt={post.metadata.title}
                    fill
                    className="object-cover"
                    priority={publishedPosts.indexOf(post) < 3}
                  />
                </div>

                <div className="blog-post-content">
                  <h3 className="blog-post-title">
                    {post.metadata.title}
                  </h3>

                  <p className="blog-post-date">
                    <time dateTime={new Date(post.metadata.date).toISOString().split('T')[0]}>
                      {post.metadata.date}
                    </time>
                  </p>

                  <p className="blog-post-excerpt">
                    {post.metadata.excerpt.split(' ').slice(0, 10).join(' ')}
                    {post.metadata.excerpt.split(' ').length > 10 ? '...' : ''}
                  </p>
                </div>

                <div className="blog-post-footer">
                  <div className="blog-post-tags">
                    {post.metadata.tags.map((postTag, i) => (
                      <Link
                        key={i}
                        href={`/?tag=${encodeURIComponent(postTag.trim())}`}
                        className={`blog-tag tag-${postTag.trim().replace(/\s+/g, '-')}`}
                      >
                        #{postTag.trim()}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={`/${post.slug}`}
                    className="blog-post-readmore"
                    aria-label={`Read more about ${post.metadata.linkText || post.metadata.title.split(':')[0]}`}
                  >
                    Read more about {post.metadata.linkText || post.metadata.title.split(':')[0]}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <TagFilter postElements={postElements} />
      </div>
    </>
  );
}
