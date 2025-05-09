'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from '@/utils/debounce';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const headingsRef = useRef<TOCItem[]>([]);

  useEffect(() => {
    headingsRef.current = headings;
  }, [headings]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetActiveId = useCallback(
    debounce((id: string) => {
      setActiveId(id);
    }, 50),
    []
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateHash = useCallback(
    debounce((id: string | null) => {
      if (id) {
        if (window.location.hash !== `#${id}`) {
          window.history.replaceState(null, '', `#${id}`);
        }
      } else {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }, 200),
    []
  );

  useEffect(() => {
    const extractHeadings = () => {
      const article = document.querySelector('article');
      if (!article) {
        console.log('TableOfContents: No article element found');
        return;
      }

      const elements = Array.from(article.querySelectorAll('h2'));

      if (elements.length === 0) {
        console.log('TableOfContents: No h2 elements found');
        return;
      }

      const usedTexts = new Set<string>();
      const tocItems: TOCItem[] = [];

      elements.forEach(element => {
        const text = element.textContent || '';

        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        element.id = id;

        if (!usedTexts.has(text)) {
          usedTexts.add(text);
          tocItems.push({
            id,
            text,
            level: 2,
          });
        }
      });

      setHeadings(tocItems);

      const observerOptions = {
        rootMargin: '-80px 0px -75% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      };

      const visibleHeadings = new Map<
        string,
        {
          isIntersecting: boolean;
          ratio: number;
          y: number;
        }
      >();

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          visibleHeadings.set(entry.target.id, {
            isIntersecting: entry.isIntersecting,
            ratio: entry.intersectionRatio,
            y: entry.boundingClientRect.y,
          });
        });

        let maxRatio = 0;
        let topHeadingId = '';
        let closestToTopY = Infinity;

        visibleHeadings.forEach((value, key) => {
          if (value.isIntersecting && value.ratio > maxRatio) {
            maxRatio = value.ratio;
            topHeadingId = key;
          }
        });

        if (!topHeadingId) {
          visibleHeadings.forEach((value, key) => {
            if (!value.isIntersecting && value.y < 0 && Math.abs(value.y) < closestToTopY) {
              closestToTopY = Math.abs(value.y);
              topHeadingId = key;
            }
          });
        }

        if (topHeadingId) {
          debouncedSetActiveId(topHeadingId);
          debouncedUpdateHash(topHeadingId);
        } else {
          if (window.scrollY < 100) {
            debouncedSetActiveId('');
            debouncedUpdateHash(null);
          }
        }
      }, observerOptions);

      const handleScroll = () => {
        if (window.scrollY < 100) {
          debouncedSetActiveId('');
          debouncedUpdateHash(null);
        } else if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
          const currentHeadings = headingsRef.current;
          if (currentHeadings.length > 0) {
            const lastHeading = currentHeadings[currentHeadings.length - 1];
            debouncedSetActiveId(lastHeading.id);
            debouncedUpdateHash(lastHeading.id);
          }
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      elements.forEach(element => observer.observe(element));

      return () => {
        window.removeEventListener('scroll', handleScroll);
        elements.forEach(element => observer.unobserve(element));
      };
    };

    extractHeadings();

    const retryTimer = setTimeout(extractHeadings, 1000);

    const handleInitialHash = () => {
      if (window.location.hash) {
        const id = window.location.hash.substring(1);
        debouncedSetActiveId(id);
      }
    };

    handleInitialHash();

    return () => {
      clearTimeout(retryTimer);
    };
  }, [debouncedSetActiveId, debouncedUpdateHash]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      debouncedSetActiveId(id);
      debouncedUpdateHash(id);
    }
  };

  return (
    <nav className="table-of-contents hidden lg:block" data-testid="toc-container">
      <div className="toc-container fixed right-8 top-32 w-64 max-h-[70vh] overflow-y-auto border-l border-gray-200 pl-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Table of Contents</h3>
        {headings.length > 0 ? (
          <ul className="text-sm">
            {headings.map(heading => (
              <li
                key={heading.id}
                className={`mb-2 relative ${activeId === heading.id ? 'active' : ''}`}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={e => handleClick(e, heading.id)}
                  className={`block hover:text-accent transition-colors duration-300 ${
                    activeId === heading.id ? 'font-medium text-accent' : 'text-gray-600'
                  }`}
                >
                  {heading.text}
                  {activeId === heading.id && (
                    <span className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full transition-opacity duration-300"></span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No headings found</p>
        )}
      </div>
    </nav>
  );
}
