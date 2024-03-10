import Link from 'next/link';

interface NavigationProps {
  active: (pathname: string) => string;
}

const Navigation: React.FC<NavigationProps> = ({ active }) => {
  return (
    <nav className="container mx-auto h-16 px-4 py-2">
      <ul className="flex items-center justify-between h-full">
        <li>
          <Link className={`text-white ${active('/')}`} href="/">
            Home
          </Link>
        </li>
        <li>
          <Link className={`text-white ${active('/about')}`} href="/about/">
            About
          </Link>
        </li>
        <li>
          <Link className={`text-white ${active('/contact')}`} href="/contact/">
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
