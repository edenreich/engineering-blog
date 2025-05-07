'use client';

import Giscus from '@giscus/react';

export default function Comments() {
  return (
    <section className="blog-container mb-16">
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
  );
}
