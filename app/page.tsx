import Link from 'next/link';
import Image from 'next/image';
import TagList from '@/components/TagList';
import TagFilter from '@/components/TagFilter';
import { getAllPosts, getAllTags } from '@/lib';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const tags = await getAllTags();
  const params = [{ slug: undefined }];

  return params;
}

export default async function Home({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await params;
  const slug = p.slug;
  const posts = await getAllPosts();
  const tags = await getAllTags();

  const publishedPosts = posts.filter((post) => !post.metadata.draft && post.slug !== slug);

  const postElements = publishedPosts.map(post => ({
    slug: post.slug,
    tags: post.metadata.tags
  }));

  return (
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
                />
              </div>

              <div className="blog-post-content">
                <h3 className="blog-post-title">
                  {post.metadata.title}
                </h3>

                <p className="blog-post-date">
                  {post.metadata.date}
                </p>

                <p className="blog-post-excerpt">
                  {post.metadata.excerpt}
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
  );
}