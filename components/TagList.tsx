'use client';

import React from 'react';
import Link from 'next/link';

interface TagListProps {
  initialTags: string[];
}

const TagList: React.FC<TagListProps> = ({ initialTags = [] }) => {
  const sortedTags = [...initialTags].sort();

  return (
    <div className="blog-post-tags flex flex-wrap justify-center gap-2 w-full">
      {sortedTags.map((tag, index) => (
        <Link
          key={index}
          href={`/?tag=${tag}`}
          className={`blog-tag tag-${tag.replace(/\s+/g, '-')}`}
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
};

export default TagList;
