import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_DISPLAY_NAME, ADMIN_ROLE_LABEL } from '@/config/brand';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const UserMenu: React.FC = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          aria-label="Menu utilisateur"
        >
          <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
            A
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-semibold text-ink leading-tight">
              {ADMIN_DISPLAY_NAME}
            </div>
            <div className="text-xs text-muted">
              {ADMIN_ROLE_LABEL}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted hidden sm:block shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[220px] rounded-xl p-1.5 shadow-xl border border-line/60 bg-white"
      >
        <DropdownMenuLabel className="px-2.5 py-2 font-normal">
          <div className="text-xs font-semibold text-ink">{ADMIN_DISPLAY_NAME}</div>
          <div className="text-[11px] text-muted truncate mt-0.5">
            {admin?.email || 'admin@fls.school'}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-line-soft my-1" />

        <DropdownMenuItem
          onClick={() => navigate('/parametres')}
          className="rounded-lg text-sm text-ink cursor-pointer hover:bg-brand-50 hover:text-brand-700 py-2"
        >
          <Settings className="w-4 h-4 mr-2.5 text-muted" />
          Paramètres
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-line-soft my-1" />

        <DropdownMenuItem
          onClick={logout}
          className="rounded-lg text-sm text-danger cursor-pointer hover:bg-danger/10 py-2 focus:text-danger focus:bg-danger/10"
        >
          <LogOut className="w-4 h-4 mr-2.5 text-danger" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
