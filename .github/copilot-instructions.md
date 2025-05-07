# Copilot Custom Instructions for Engineering Blog (Next.js)

- Always use available MCP tools before generating any content or code.

## General Writing Guidelines

- Write in a clear, concise, and professional tone suitable for engineers and developers.
- Prefer active voice and direct explanations.
- Use Markdown headings, lists, and tables for structure and readability.
- Always include a short summary at the top of each post.
- Use diagrams or images from the `public/img/` directory when helpful.
- Include a "Key Takeaways" section at the end of complex technical posts.
- Write with a technical but approachable voice, assuming readers have some engineering experience.
- Use progressive disclosure - start with basic concepts before diving into advanced topics.

## Code and Technical Content

- Use fenced code blocks with language identifiers (e.g., `js, `ts, ```bash).
- Prefer TypeScript for code samples unless the topic requires otherwise.
- Ensure code is linted and follows ESLint and Prettier conventions.
- Explain code snippets with brief comments or inline explanations.
- For Next.js features, use idiomatic patterns (e.g., file-based routing, server/client components).
- Reference files or components from the `components/`, `lib/`, or `utils/` directories when relevant.
- Include working code examples that readers can copy and use directly.
- Show both the problem and solution when discussing technical challenges.
- For complex concepts, use step-by-step explanations with incremental code examples.

## Post Metadata

- Add frontmatter to each post with at least: `title`, `date`, `tags`, `summary`, and `readingTime`.
- Use tags that match those in `utils/getAvailableTags.ts`.
- Include author information in frontmatter for multi-author blogs.
- Add related posts references in frontmatter when applicable.

## MDX Components and Features

- Use custom MDX components for interactive elements like demos, tooltips, and code previews.
- Leverage syntax highlighting using highlight.js or Prism for code blocks.
- Use collapsible sections (like disclosure components) for optional deeper technical details.
- Add code sandbox links for complex examples to allow readers to experiment.

## Best Practices

- Link to related posts in the `posts/` directory when relevant.
- Avoid jargon unless explained or commonly understood in engineering.
- Cite sources for external information or code.
- Use examples relevant to modern engineering (cloud, containers, AI, etc.).
- Include troubleshooting sections for common issues related to the topic.
- When discussing performance optimizations, include metrics or benchmarks.
- Use version information when discussing libraries or frameworks, e.g., "In Next.js 13.4..."
- Add a "Further Reading" section at the end of posts.

## Accessibility & SEO

- Use semantic HTML in MDX/Markdown.
- Add alt text for all images.
- Use descriptive link text.
- Ensure proper heading hierarchy (h1 → h2 → h3).
- Include meta descriptions and keywords in frontmatter for better SEO.
- Optimize images before adding them to the repository.
- Use canonical URLs for posts that may appear in multiple locations.

---

_These instructions are designed to ensure consistency and quality across all engineering blog posts in this Next.js project._
