import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { fetchMarkdownPosts } from '@/utils/markdownParser';
import type { MarkdownPost } from '@/types/MarkdownPost';
import { getAvailableTags } from '@/utils/getAvailableTags';
import Post from '@/components/Post';
import TagList from '@/components/TagList';
import Head from 'next/head';

interface HomeProps {
  posts: MarkdownPost[];
  tags: string[];
}

const Home: React.FC<HomeProps> = ({ posts, tags }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagClick = (selectedTags: string[]) => {
    setSelectedTags(selectedTags);
  };

  const filterPostsBySelectedTags = (posts: MarkdownPost[]) => {
    if (selectedTags.length === 0) {
      return posts;
    }

    return posts.filter((post: MarkdownPost) => {
      return selectedTags.some((selectedTag) =>
        post.metadata.tags.includes(selectedTag)
      );
    });
  };

  const filterDrafts = (posts: MarkdownPost[]) => {
    return posts.filter((post) => !post.metadata.draft);
  };

  const sortByDate = (posts: MarkdownPost[]) => {
    return posts.sort((a, b) => {
      const dateA = new Date(a.metadata.date);
      const dateB = new Date(b.metadata.date);

      return dateB.getTime() - dateA.getTime();
    });
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>Home | Engineering Blog</title>
        <meta property="og:title" content="Home | Engineering Blog" />
      </Head>
      <section className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mt-8">Engineering Blog</h1>
        <p className="text-xl mt-4 text-center">
          This is a blog about software engineering, web development, and
          anything else I find interesting.
        </p>
        <div className="container">
          <TagList
            tags={tags}
            selectedTags={selectedTags}
            onTagClick={handleTagClick}
          />
        </div>
      </section>
      <section>
        <h2 className="text-4xl font-bold mt-5 mb-5 ml-5">Blog Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortByDate(filterPostsBySelectedTags(filterDrafts(posts))).map(
            (post) => (
              <Post
                key={post.slug}
                title={post.metadata.title}
                date={post.metadata.date}
                excerpt={post.metadata.excerpt}
                imageUrl={`/img/posts/${post.metadata.thumbnail}`}
                url={`/${post.metadata.slug}`}
              />
            )
          )}
        </div>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const posts = await fetchMarkdownPosts();
  const tags = await getAvailableTags(posts);

  return {
    props: {
      posts,
      tags,
    },
  };
};

export default Home;
