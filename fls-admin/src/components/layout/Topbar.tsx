import React from 'react';
import { Menu } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

export interface TopbarProps {
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-20 h-16 bg-page-bg/85 backdrop-blur-md px-4 md:px-8 flex items-center justify-between border-b border-line/40">
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-white border border-line/60 shadow-xs text-ink hover:bg-brand-50 hover:text-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 shrink-0"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
};

export default Topbar;
