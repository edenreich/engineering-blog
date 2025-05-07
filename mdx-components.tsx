

import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

const CodeSandbox = ({ id, title }: { id: string; title?: string }) => {
  return (
    <div className="my-6">
      <p className="text-sm text-gray-500 mb-2">{title || 'Interactive Code Example'}</p>
      <iframe
        src={`https://codesandbox.io/embed/${id}?fontsize=14&theme=dark`}
        style={{ width: '100%', height: '500px', border: 0, borderRadius: '4px', overflow: 'hidden' }}
        title={title || 'Code Example'}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      ></iframe>
    </div>
  );
};

const Disclosure = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  return (
    <details className="my-4 border rounded-lg" open={defaultOpen}>
      <summary className="cursor-pointer p-4 font-semibold bg-gray-50 hover:bg-gray-100 transition-colors">
        {title}
      </summary>
      <div className="p-4">{children}</div>
    </details>
  );
};

const Tooltip = ({ text, children }: { text: string; children: ReactNode }) => {
  return (
    <span className="relative group inline-block">
      <span className="cursor-help border-dotted border-b">{children}</span>
      <span className="pointer-events-none absolute w-max max-w-xs bg-black text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 -translate-y-full -translate-x-1/2 left-1/2 top-0 transition-opacity">
        {text}
      </span>
    </span>
  );
};

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
      const { node, ...rest } = props;
      return <ul className="list-disc ml-5 my-4" {...rest} />;
    },
    ol: (props: any) => {
      const { node, ...rest } = props;
      return <ol className="list-decimal ml-5 my-4" {...rest} />;
    },
    li: (props: any) => {
      const { node, ...rest } = props;
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

    CodeSandbox,
    Disclosure,
    Tooltip,

    ...components,
  };
}
