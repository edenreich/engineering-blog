'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface TagFilterProps {
  postElements: {
    slug: string;
    tags: string[];
  }[];
}

export default function TagFilter({ postElements }: TagFilterProps) {
  const searchParams = useSearchParams();
  const [, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    resetFilterState();

    const tag = searchParams.get('tag');
    if (!tag) return;

    setActiveTag(tag);

    applyTagFilter(tag);
  }, [searchParams]);

  const resetFilterState = () => {
    const heading = document.getElementById('posts-heading');
    if (heading) {
      heading.innerText = 'Blog Posts';
    }

    const indicator = document.getElementById('tag-filter-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }

    document.querySelectorAll('.active-tag').forEach(element => {
      element.classList.remove('active-tag');
    });

    document.querySelectorAll('.blog-post-card').forEach(post => {
      (post as HTMLElement).style.display = '';
    });

    const noPostsMessage = document.getElementById('no-posts-message');
    if (noPostsMessage) {
      noPostsMessage.style.display = 'none';
    }

    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
      postsContainer.style.display = '';
    }
  };

  const applyTagFilter = (tag: string) => {
    const normalizedTag = tag.trim();

    const heading = document.getElementById('posts-heading');
    if (heading) {
      heading.innerText = `Posts tagged with #${normalizedTag}`;
    }

    const indicator = document.getElementById('tag-filter-indicator');
    if (indicator) {
      indicator.style.display = 'flex';

      const tagName = document.getElementById('current-tag-name');
      if (tagName) {
        tagName.innerText = `#${normalizedTag}`;
      }
    }

    const cssEscapedTag = CSS.escape(normalizedTag.replace(/\s+/g, '-'));
    document.querySelectorAll(`.tag-${cssEscapedTag}`).forEach(link => {
      link.classList.add('active-tag');
    });

    const postCards = document.querySelectorAll('.blog-post-card');
    let visiblePosts = 0;

    postCards.forEach(post => {
      const postTags = post.getAttribute('data-tags');
      if (!postTags || !postTags.split(',').includes(normalizedTag)) {
        (post as HTMLElement).style.display = 'none';
      } else {
        (post as HTMLElement).style.display = '';
        visiblePosts++;
      }
    });

    if (visiblePosts === 0) {
      const noPostsMessage = document.getElementById('no-posts-message');
      if (noPostsMessage) {
        noPostsMessage.style.display = 'block';
      }

      const postsContainer = document.getElementById('posts-container');
      if (postsContainer) {
        postsContainer.style.display = 'none';
      }
    }
  };

  return null;
}
