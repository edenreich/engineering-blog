'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();

  const active = (path: string) => {
    if (path === '/' && pathname === '/') {
      return 'font-bold';
    }
    if (path !== '/' && pathname?.startsWith(path)) {
      return 'font-bold';
    }
    return '';
  };

  return (
    <header className="w-full bg-[#171B31]">
      <nav className="max-w-screen-xl mx-auto">
        <ul className="blog-container grid grid-cols-3 items-center">
          <li className="justify-self-start flex items-center h-full">
            <Link
              href="/"
              className={`text-white ${active('/') === 'font-bold' ? 'font-bold' : ''}`}
            >
              Home
            </Link>
          </li>
          <li className="justify-self-center flex items-center h-full">
            <Link
              href="/about"
              className={`text-white ${active('/about') === 'font-bold' ? 'font-bold' : ''}`}
            >
              About
            </Link>
          </li>
          <li className="justify-self-end flex items-center h-full">
            <Link
              href="/contact"
              className={`text-white ${active('/contact') === 'font-bold' ? 'font-bold' : ''}`}
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}