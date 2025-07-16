import Link from 'next/link';
import { ReactNode } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Verifications', href: '/verifications' },
];

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => (
  <div className="flex min-h-screen bg-gray-50">
    <aside className="w-64 bg-white border-r flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
      <nav className="flex-1">
        <ul className="space-y-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-3 py-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                tabIndex={0}
                aria-label={item.label}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
    <main className="flex-1 p-8">{children}</main>
  </div>
);

export default AdminLayout; 