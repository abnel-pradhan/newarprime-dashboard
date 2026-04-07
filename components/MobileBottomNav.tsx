'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlayCircle, Calendar, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // 🚨 Only show this nav on internal app pages, hide on public pages!
  const hiddenPages = ['/', '/login', '/register', '/admin'];
  if (hiddenPages.includes(pathname)) return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', path: '/courses', icon: PlayCircle },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-gray-800 z-[100] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.path} 
              className="flex flex-col items-center gap-1.5 w-16"
            >
              {/* Icon Container with glowing active state */}
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-purple-600/20 text-purple-400 scale-110' : 'text-gray-500'
              }`}>
                <Icon size={22} className={isActive ? 'drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]' : ''} />
              </div>
              
              {/* Label */}
              <span className={`text-[10px] font-bold transition-all duration-300 ${
                isActive ? 'text-purple-400' : 'text-gray-500'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}