import { Html, Head, Main, NextScript, DocumentProps } from 'next/document';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

function MyDocument(props: DocumentProps) {
  const active = (pathname: string) =>
    props.__NEXT_DATA__.page === pathname ? 'text-xl font-bold' : '';
  return (
    <Html lang="en">
      <Head>
        <link rel="apple-touch-icon" href="/img/pencil.png"></link>
        <meta charSet="utf-8" />
        <meta name="author" content="Eden Reich" />
        <meta
          name="keywords"
          content="Eden,Eden Reich,PHP,C++,Typescript,Javascript,CPP,Go,Web,GitOps"
        />
        <meta
          name="description"
          content="This is a blog about software engineering, web development, and
          anything else I find interesting."
        />
        <meta property="og:site_name" content="Eden Reich" />
      </Head>
      <body>
        <header className="bg-gray-900">
          <Navigation active={active} />
        </header>
        <Main />
        <NextScript />
        <Footer />
      </body>
    </Html>
  );
}

export default MyDocument;
