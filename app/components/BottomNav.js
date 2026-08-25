'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wrench, Star, User } from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'My Services',
    href: '/my-services',
    icon: Wrench,
  },
  {
    label: 'Reviews',
    href: '/profile/rating',
    icon: Star,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <div aria-hidden="true" className="h-16" />
      <nav aria-label="Partner Navigation" className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-md">
      <div className="max-w-4xl mx-auto px-2 sm:px-6">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            let isActive = false;
            if (item.href === '/') {
              isActive = pathname === '/';
            } else if (item.href === '/profile/rating') {
              isActive = pathname === '/profile/rating' || pathname.startsWith('/profile/rating/');
            } else if (item.href === '/profile') {
              isActive = (pathname === '/profile' || pathname.startsWith('/profile/')) && !pathname.startsWith('/profile/rating');
            } else {
              isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center justify-center py-2.5 px-1 text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#ff8a4c]'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 inset-x-4 sm:inset-x-8 h-0.5 bg-[#ff8a4c] rounded-full" />
                )}
                <Icon
                  size={19}
                  className={`mb-1 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
    </>
  );
}
