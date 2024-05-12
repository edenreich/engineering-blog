---
title: 'NextJS Static Site Generator(SSG)'
date: 'January 29 2022'
thumbnail: 'nextjs.png'
tags: 'nextjs, ssg, javascript'
excerpt: 'In this tutorial I want to cover how powerful raw HTML and Javascript could be, and how they could improve the speed of your website'
draft: false
---

In this tutorial I want to cover how powerful raw HTML and Javascript could be and how they could improve the speed of your website.
I'll be covering an important fundamental concept in the web industry, which is a Static Site Generator(SSG).

## What is a Static Site Generator(SSG) ?

A static site generator is a tool that generates a full static HTML website based on raw data and a set of templates. Essentially, a static site generator automates the task of coding individual HTML pages and gets those pages ready to serve to users ahead of time.
Browsers understand Javascript and HTML natively, by doing so the website is going to gain a boost of performance.

## How to use SSG

For this tutorial I'm going to use NextJS version 12.0.9 with typescript, if you don't want to read all of this you can also checkout the [repository](https://github.com/edenreich/examples/nextjs-ssg) I've created on github.

Let's create new NextJS with typescript app:

```sh
mkdir nextjs-ssg && cd nextjs-ssg
yarn create next-app --typescript .
```

Open it with your favorite code editor, I'm going to use vscode:

```sh
code .
```

The folder structure should look like this:

```sh
.
├── README.md
├── next-env.d.ts
├── next.config.js
├── package.json
├── pages
│   ├── _app.tsx
│   ├── api
│   └── index.tsx
├── public
│   ├── favicon.ico
│   └── vercel.svg
├── styles
│   ├── Home.module.css
│   └── globals.css
├── tsconfig.json
└── yarn.lock
```

First thing I like to do is ensure that I can package this application using docker, so we can later on deploy it to any other cloud vendors.

Let's create a simple Dockerfile:

```dockerfile
FROM node:17.1.0-alpine3.12 AS development
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=development
EXPOSE 3000
CMD [ "yarn", "dev" ]
```

This dockerfile is based on **node:17.1.0-alpine3.12** and I've created only a development target and common C libraries for alpine, alpine images are normally very small and a lot of things needs to be explicitly installed.

Alright, let's build and run it:

```sh
docker build -t blog --target development .
docker run --rm -it --name blog -p 3000:3000 -v ${PWD}:/app -w /app blog
```

Open http://localhost:3000 and you should see the default index page of the NextJS app.

Now that we have a layer for development we also need a layer for production, in production we won't use volumes, instead we'll generate a static site with NextJS and copy it over to an nginx alpine container, NGINX is the web server that will serve all of the generated HTML and Javascript files.

Let's add dependencies, builder and production layers to the dockerfile:

```dockerfile
...
FROM node:17.1.0-alpine3.12 AS dependencies
ENV NODE_ENV=production
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:17.1.0-alpine3.12 AS builder
ENV NODE_ENV=development
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile && NODE_ENV=production yarn build

FROM node:17.1.0-alpine3.12 AS production
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production
COPY --chown=node --from=builder /app/next.config.js ./
COPY --chown=node --from=builder /app/public ./public
COPY --chown=node --from=builder /app/.next ./.next
COPY --chown=node --from=builder /app/yarn.lock /app/package.json ./
COPY --chown=node --from=dependencies /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD [ "yarn", "start" ]
```

I'll shortly explain what the above means:

- Docker **dependencies** layer - builds the node_modules for production
- Docker **builder** layer - builds the NextJS framework optimized version for production
- Docker **production** layer - this is the final layer, here is where I copy all necessary artifacts and create the final container image (~ 354MB)

To build the application for production we can use:

```sh
docker build -t blog --target production .
```

For development we can just mount a volume to our local environment:

```sh
docker build -t blog-development --target development .
docker run --rm -it --name blog -p 3000:3000 -v ${PWD}:/app blog-development /bin/sh
yarn
yarn dev
```

Now that we have a way to ship the application from development to production let's continue with the application layer.

First thing I like to do on brand new NextJS application, is to remove whatever I'm not using, so the first thing would be to remove the API endpoints:

```sh
rm -rf ./pages/api
```

Let's create a new dynamic page, I'll call it **[slug].tsx**, slug will be captured as props to our page component:

```tsx
import type { NextPage } from 'next';
import Head from 'next/head';

const Blog: NextPage = () => {
  return (
    <div>
      <Head>
        <title>My Blog</title>
        <meta name="description" content="My Blog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main></main>
      <footer></footer>
    </div>
  );
};

export default Blog;
```

Let's adjust this opened file to generate the static content ahead of time, capture a dynamic slug at runtime and fetch the right resource:

```tsx
import type {
  NextPage,
  GetStaticProps,
  GetStaticPaths,
  GetStaticPropsContext,
  GetStaticPropsResult,
  GetStaticPathsResult,
} from 'next';
import Head from 'next/head';
import { PropsWithChildren } from 'react';

type Request = {
  slug: string | string[];
};

type Page = {
  slug: string;
  title: string;
  content: string;
};

const mockedPages: Page[] = [
  {
    slug: 'about',
    title: 'About',
    content: 'About page',
  },
  {
    slug: 'contact',
    title: 'Contact',
    content: 'Contact page',
  },
];

export const getStaticPaths: GetStaticPaths = async (): Promise<GetStaticPathsResult<Request>> => {
  // Get all existing paths from an API for generating static pages ahead of time
  // Probably use Contentful API to get this data
  // But for now let's mock that data
  const allPossiblePaths = mockedPages.map((page) => ({
    params: { slug: page.slug },
  }));
  return {
    paths: allPossiblePaths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context: GetStaticPropsContext): Promise<GetStaticPropsResult<Page>> => {
  // Lookup for a page by slug, this is where you'd use Contentful API
  const page: Page = mockedPages.filter((page) => page.slug === context.params?.slug)[0];

  return {
    props: {
      ...page,
    },
  };
};

const Blog: NextPage<Page> = ({ title, content }: PropsWithChildren<Page>) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content={title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{content}</main>
      <footer></footer>
    </div>
  );
};

export default Blog;
```

Normally you would get the pages from some sort of external datastore, but for the purpose of demonstrating I just mocked it.
I don't want to focus here on the external API, otherwise this tutorial is going to be very long, but if you would like to know how I'll just recommend you to take a look at [Contentful](https://www.contentful.com/), which is a great Headless CMS.

Notice that there are two important functions, getStaticPaths getStaticProps.

- **getStaticPaths** - Needs to know about the paths of the to be generated static files ahead of time (at build-time, i.e when you run `next build`)
- **getStaticProps** - Fetches the props ahead of time (i.e when running `next build`), in above case it fetches a single record from the statically generated files for each slug

The default component which is exported will then receive the properties that are delivered by getStaticProps.

Let's verify that this actually works, let's run:

```sh
yarn build
```

Now you can inspect **.next/server/pages** folder, there are a bunch of HTML files, a part of them are the **about.html**, **contact.html**, along aside there is json format for those pages, if you open the contact.json file for example you should see:

```json
{ "pageProps": { "slug": "contact", "title": "Contact", "content": "Contact page" }, "__N_SSG": true }
```

Those are the properties that NextJS internally would inject to your component when a client requests the **/contact** path.
You can also verify it in the browser, let's run:

```sh
yarn dev
```

And open **http://localhost:3000/contact**, you should see the contact component outputted to the page.

Now you are probably asking yourself, but if it's just an HTML page, why do we actually need NextJS for production ? Can't we just get those HTML files at build time and pack them all into a smaller version of NGINX alpine container image for example ?

In fact, you can, and I already tried it, the container would end up being very small ~ 36MB instead of ~ 354MB, which means downloading speed and running this container is way faster and you could also deploy it to a bucket, you don't necessarily need NGINX to run this application, for that you can have a look on [**next export**](https://nextjs.org/docs/advanced-features/static-html-export) command.
But of course there are downsides for this approach, because NextJS also provides further features like Incremental Static Regeneration([ISR](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)).
[ISR](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration) allows you to fetch the content on the fly after the clients requested the page, it will also check if the page in fact changed before making this new API call to the external datastore, this could be very useful if the content team want to change the dynamic content, you don't want to redeploy all those pages all over again, just because of a content change.
Also if you think about it, what if there are 2 million static pages, would you run a build for all of them when a single page has been changed ? absolutely no.

To add [ISR](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration) all there is to do is to add another property to the returned object from **getStaticProps** function, the key of that property called revalidate and the value it accepts is in seconds - how long since the last time a user visited the page the **getStaticProps** should be called. If the content is changing very frequently this value should be low and if not that frequently then this value should be high, depending on the use-case, for testing purposes let's add it with a high value and log "called" on the function:

```tsx
...
export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
): Promise<GetStaticPropsResult<Page>> => {
  // Lookup for a page by slug, this is where you'd use Contentful API
  const page: Page = mockedPages.filter(
    (page) => page.slug === context.params?.slug
  )[0];
  console.log("called");
  return {
    props: {
      ...page,
    },
    revalidate: 30,
  };
};
...
```

Let's build and start this code:

```sh
yarn build
yarn start
```

To verify you can visit **http://localhost:3000/contact** and inspect the server logs, refreshing the page, doesn't call the function. You can even refresh multiple times, you will not see the **"called"** log, but if you wait for **30 seconds**, and refresh again, you'll notice that function indeed gets called once in order to fetch the new content.
I normally set this value to **30 seconds** and add an **[ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)** verification that will be sent to the server to verify if the content indeed has been changed, to avoid passing unnecessary data over the http wire, if the content hasn't been changed the http server response should be **304 Not Modified**.
Many **Headless CMS** also provide a webhook to listen for change events of content and you want to avoid clients receiving an outdated one, therefore you can listen for that event and send a curl request to the page that was modified, this will ensure that after 30 seconds the next client that will visit this page, **getStaticProps** function will get called and the client will get the up to date content.

If the use case of creating new dynamic pages from the external datastore without redeploying the application is important for you, it's also possible to enable in NextJS the **fallback** flag that is returned from **getStaticPaths** function, this will allow the calling of your render function instead of a 404 page even if the page is not statically generated ahead of time.

Then you can check if a page has been passed as an argument to the component if nothing is passed, you could show a loading component, while NextJS will generate a new static page and recall **getStaticProps** and fetch the new data, everything happens on the fly so the next time you call this page, that page would already exists and will be loaded way faster.

## Conclusion

NextJS provides great features for [SSG](https://nextjs.org/docs/basic-features/pages#static-generation-with-data).

NextJS provides those features out of the box and makes it very easy to use.

Not all pages need to be dynamic, but in most cases a page could be statically generated ahead of time.

By using [ISR](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration), it's even possible to apply this strategy to pages that require frequent data changes incrementally without generating the whole pages every time a change to the content is made.

By using external webhooks of **Headless CMS** like [Contentful](https://www.contentful.com/) for example, it's possible to listen for a change event and revalidate a page content by issuing a curl request.

By using [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) we can further optimize the loads on the external API's for fetching the updated content.

It's also possible to generate static pages at runtime, so we don't necessarily need to redeploy all static pages build process every time a new page is created on the backend.

Static pages are blazing fast because there is no computation needed, those pages are generated and fetched ahead of time.

It's easy to package NextJS as a container and deliver it to different environments.

If you would like to review all the changes on github: [nextjs-ssg](https://github.com/edenreich/examples/tree/master/nextjs-ssg)
