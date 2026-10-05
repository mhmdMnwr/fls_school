import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Users,
  Layers,
  BookOpen,
  GraduationCap,
  UsersRound,
  CalendarDays,
  Wallet,
  MessageSquare,
  Settings,
  X,
  Globe,
  ExternalLink,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME, APP_SUBTITLE, TAGLINE } from '@/config/brand';
import { testimonialsApi } from '@/api/testimonials';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', to: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Élèves', to: '/eleves', icon: Users },
  { label: 'Niveaux', to: '/niveaux', icon: Layers },
  { label: 'Matières', to: '/matieres', icon: BookOpen },
  { label: 'Professeurs', to: '/profs', icon: GraduationCap },
  { label: 'Groupes', to: '/groupes', icon: UsersRound },
  { label: 'Séances', to: '/seances', icon: CalendarDays },
  { label: 'Paiements', to: '/paiements', icon: Wallet },
  { label: 'Avis', to: '/avis', icon: MessageSquare },
];

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  className,
}) => {
  const location = useLocation();

  const { data: counts } = useQuery({
    queryKey: ['testimonials', 'counts'],
    queryFn: testimonialsApi.getCounts,
    refetchInterval: 30_000,
  });

  // Close on route change
  React.useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [location.pathname, onClose]);

  // Close on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top brand block */}
      <div>
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 overflow-hidden p-0.5">
              <img
                src="/images/fls-logo.png"
                alt="FLS School Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-xl font-black text-white tracking-tight leading-tight">
                {APP_NAME}
              </div>
              <div className="text-xs text-white/80 font-bold">
                {APP_SUBTITLE}
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav aria-label="Navigation principale" className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;
            const isAvis = item.to === '/avis';
            const pendingCount = isAvis ? counts?.pending ?? 0 : 0;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 h-11 px-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-150',
                  active
                    ? 'bg-gradient-to-r from-sidebar-active-from to-sidebar-active-to text-white font-extrabold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),0_8px_24px_rgba(91,75,245,0.45)]'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon size={20} strokeWidth={2} className="shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-black rounded-full bg-amber-500 text-white shadow-xs">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-white/10" />

          {/* Settings */}
          <NavLink
            to="/parametres"
            aria-current={location.pathname === '/parametres' ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 h-11 px-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-150',
              location.pathname === '/parametres'
                ? 'bg-gradient-to-r from-sidebar-active-from to-sidebar-active-to text-white font-extrabold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),0_8px_24px_rgba(91,75,245,0.45)]'
                : 'text-white/90 hover:text-white hover:bg-white/10'
            )}
          >
            <Settings size={20} strokeWidth={2} className="shrink-0" />
            <span>Paramètres</span>
          </NavLink>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 h-10 px-4 rounded-xl text-xs font-bold text-white/85 hover:text-white hover:bg-white/10 transition-colors mt-1"
          >
            <Globe size={18} strokeWidth={2} className="shrink-0 text-amber-400" />
            <span>Voir le site public</span>
            <ExternalLink size={13} className="ml-auto opacity-75" />
          </a>
        </nav>
      </div>

      {/* Bottom block */}
      <div className="pt-6 pb-2 text-center border-t border-white/10">
        <div className="flex justify-center mb-2">
          <div className="w-9 h-9 rounded-full bg-white p-0.5 shadow-sm overflow-hidden flex items-center justify-center">
            <img
              src="/images/fls-logo.png"
              alt="FLS School Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <p className="text-sm italic text-white/80 font-medium leading-snug px-2">
          « {TAGLINE} »
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-gradient-to-b from-sidebar-from to-sidebar-to p-5 px-4 z-30 shadow-xl overflow-y-auto',
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (off-canvas) */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop overlay */}
        <div
          className="fixed inset-0 bg-[#15144D]/50 backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Sliding drawer panel */}
        <aside
          className={cn(
            'fixed top-0 bottom-0 left-0 w-64 bg-gradient-to-b from-sidebar-from to-sidebar-to p-5 px-4 shadow-2xl transition-transform duration-300 ease-out flex flex-col',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
