import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    img: (props: any) => (
      <div className="my-6">
        <Image
          src={props.src}
          alt={props.alt || 'Blog image'}
          width={800}
          height={500}
          className="rounded-lg"
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
        />
        {props.alt && <p className="text-center text-sm mt-2">{props.alt}</p>}
      </div>
    ),
    a: (props: any) => {
      const href = props.href;
      const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'));

      if (isInternalLink) {
        return (
          <Link href={href} className={props.className}>
            {props.children}
          </Link>
        );
      }

      return <a target="_blank" rel="noopener noreferrer" {...props} />;
    },
    h1: (props: any) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
    h2: (props: any) => <h2 className="text-3xl font-bold mt-8 mb-4" {...props} />,
    h3: (props: any) => <h3 className="text-2xl font-bold mt-6 mb-3" {...props} />,
    h4: (props: any) => <h4 className="text-xl font-bold mt-6 mb-3" {...props} />,
    p: (props: any) => <p className="my-4" {...props} />,
    ul: (props: any) => {
      const { node, ...rest } = props; // Filter out the node prop
      return <ul className="list-disc ml-5 my-4" {...rest} />;
    },
    ol: (props: any) => {
      const { node, ...rest } = props; // Filter out the node prop
      return <ol className="list-decimal ml-5 my-4" {...rest} />;
    },
    li: (props: any) => {
      const { node, ...rest } = props; // Filter out the node prop
      return <li className="mb-1" {...rest} />;
    },
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
    ),
    code: (props: any) => {
      const { className } = props;
      if (!className) {
        return <code className="px-1 py-0.5 rounded font-mono text-sm" {...props} />;
      }
      return <code className={`${className} block p-4 overflow-x-auto`} {...props} />;
    },
    pre: (props: any) => <pre className="rounded-lg overflow-x-auto my-4" {...props} />,
    ...components,
  };
}
