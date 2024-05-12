import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import ProgressBar from '@/components/ProgressBar';

const AboutPage: React.FC = () => {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>About | Engineering Blog</title>
        <meta property="og:title" content="About | Engineering Blog" />
      </Head>
      <section className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">About Me</h1>
        <div className="flex flex-col justify-center items-center">
          <Image
            width={500}
            height={600}
            src="/img/profile.png"
            alt="About Us"
            className="md:w-1/3 rounded-lg shadow-md mb-4 md:mb-0"
          />
          <h2 className="text-center">Who am I?</h2>
          <div className="container text-center">
            <p className="text-lg">
              I&apos;m a passionate developer specializing in C++, C#, PHP,
              Typescript, Javascript, Rust, CSS and some Go.
            </p>
            <p className="text-lg">
              I like to build desktop as well as web applications.
            </p>
            <p className="text-lg">I&apos;m based in Berlin.</p>
          </div>
        </div>
      </section>
      <section className="container mx-auto">
        <h2 className="text-center">Language Knowledge</h2>
        <div className="flex flex-col justify-center items-center">
          <ProgressBar color="#f34b7d" label="C++" value={90} />
          <ProgressBar color="#178600" label="C#" value={70} />
          <ProgressBar color="#4F5D95" label="PHP" value={90} />
          <ProgressBar color="#3178c6" label="Typescript" value={85} />
          <ProgressBar color="#f1e05a" label="Javascript" value={85} />
          <ProgressBar color="#dea584" label="Rust" value={70} />
          <ProgressBar color="#563d7c" label="CSS" value={60} />
          <ProgressBar color="#00ADD8" label="Go" value={70} />
        </div>
      </section>
    </>
  );
};

export default AboutPage;
