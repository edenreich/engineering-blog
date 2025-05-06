'use client';

import TagList from './TagList';
import Giscus from '@giscus/react';
import { type Post } from '../lib/mdx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { components } from './MDXProvider';

interface MDXPostProps {
  post: Post;
}

const MDXPost: React.FC<MDXPostProps> = ({ post }) => {
  return (
    <>
      <section className="blog-post">
        <div className="blog-post-header">
          <h1 className="text-4xl font-bold text-gray-900">{post.metadata.title}</h1>
          <p className="text-gray-500 mt-2 text-lg">{post.metadata.date}</p>
          <div className="mt-4">
            <TagList initialTags={post.metadata.tags} />
          </div>
        </div>

        <div className="mt-8 mb-16 prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={components}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </section>
      <section className="blog-post mb-16">
        <div className="border-t pt-8">
          <h3 className="text-2xl font-semibold mb-6">Comments</h3>
          <Giscus
            repo="edenreich/engineering-blog"
            repoId="R_kgDOLeQUkA"
            category="General"
            categoryId="DIC_kwDOLeQUkM4Cj_sa"
            mapping="pathname"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            theme="light"
            lang="en"
          />
        </div>
      </section>
    </>
  );
};

export default MDXPost;