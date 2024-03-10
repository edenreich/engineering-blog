import { GetStaticPaths, GetStaticProps } from 'next';
import { fetchMarkdownPosts } from '@/utils/markdownParser';
import type { MarkdownPost } from '@/types/MarkdownPost';
import Head from 'next/head';

interface PostProps {
  post: MarkdownPost;
}

const Post: React.FC<PostProps> = ({ post }) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>{`${post.metadata.title} | Engineering Blog`}</title>
        <meta property="og:title" content={`${post.metadata.title} | Engineering Blog`} />
      </Head>
      <section className="px-4 sm:pl-10 sm:pr-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mt-8">{post.metadata.title}</h1>
        <p className="text-gray-400 mt-2">{post.metadata.date}</p>
        <div className="container text-xl sm:text-2xl lg:text-3xl mt-10 mb-10 break-words" dangerouslySetInnerHTML={{ __html: post.content }} />
      </section>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await fetchMarkdownPosts();
  const paths = posts.map((post) => ({
    params: { slug: post.metadata.slug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const posts = await fetchMarkdownPosts();
  const post = posts.find((p) => p.metadata.slug === slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
  };
};

export default Post;
