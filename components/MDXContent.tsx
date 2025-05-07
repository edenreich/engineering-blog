"use client";

import { useMDXComponents } from '@/mdx-components';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { useEffect, useState } from 'react';

interface MDXContentProps {
  source: string;
}

const MDXContent: React.FC<MDXContentProps> = ({ source }) => {
  const components = useMDXComponents({});
  const [mdxSource, setMdxSource] = useState<any>(null);

  useEffect(() => {
    const prepareMDX = async () => {
      try {
        const serialized = await serialize(source);
        setMdxSource(serialized);
      } catch (error) {
        console.error('Error serializing MDX:', error);
      }
    };

    prepareMDX();
  }, [source]);

  if (!mdxSource) {
    return <div>Loading content...</div>;
  }

  return (
    <MDXRemote
      {...mdxSource}
      components={components}
    />
  );
};

export default MDXContent;
