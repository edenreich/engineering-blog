export interface MarkdownPost {
  slug: string;
  metadata: {
    [key: string]: any;
  };
  content: string;
};
