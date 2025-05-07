export interface Metadata {
  title: string;
  linkText: string;
  excerpt: string;
  date: string;
  tags: string[];
  image?: string;
  thumbnail?: string;
  readingTime?: string;
  [key: string]: unknown;
}

export interface MarkdownPost {
  slug: string;
  metadata: Metadata;
  content: string;
  isMarkdownX?: boolean;
};
