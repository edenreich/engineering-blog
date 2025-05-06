export interface Metadata {
  title: string;
  linkText: string;
  excerpt: string;
  thumbnail?: string;
  date: string;
  tags: string[];
  [key: string]: unknown;
}

export interface MarkdownPost {
  slug: string;
  metadata: Metadata;
  content: string;
  isMarkdownX?: boolean;
};
