import Link from 'next/link';
import Image from 'next/image';

interface PostProps {
  title: string;
  date: string;
  excerpt: string;
  imageUrl: string;
  thumbnailUrl?: string;
  url: string;
  linkText: string;
  tags?: string[];
}

const Post: React.FC<PostProps> = ({
  title,
  date,
  excerpt,
  imageUrl,
  thumbnailUrl,
  url,
  linkText,
  tags = [],
}) => {
  const displayImageUrl = thumbnailUrl || imageUrl;

  return (
    <div className="blog-post-card">
      <div className="relative w-full h-48">
        <Image
          fill
          src={displayImageUrl}
          alt={title}
          className="blog-post-thumbnail object-cover"
          priority
        />
      </div>
      <div className="blog-post-content">
        <h3 className="blog-post-title">{title}</h3>
        <p className="blog-post-date">{date}</p>
        <p className="blog-post-excerpt">{excerpt}</p>
      </div>

      <div className="blog-post-footer">
        {tags && tags.length > 0 && (
          <div className="blog-post-tags">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="blog-tag">
                {tag}
              </span>
            ))}
            {tags.length > 3 && <span className="blog-tag">+{tags.length - 3}</span>}
          </div>
        )}

        <Link href={url} className="blog-post-readmore text-accent hover:text-accent-dark">
          Read more
        </Link>
      </div>
    </div>
  );
};

export default Post;
