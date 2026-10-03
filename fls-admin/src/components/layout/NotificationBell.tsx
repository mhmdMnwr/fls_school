import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { getActivitySeen, setActivitySeen, hasToken } from '@/lib/auth';
import { getActivityConfig } from '@/lib/labels';
import { relativeTime } from '@/lib/format';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  detail: string;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [seenTimestamp, setSeenTimestamp] = useState<string | null>(getActivitySeen());

  const { data: activities, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ['notifications', 'recent'],
    queryFn: async () => {
      const res = await api.get<ActivityItem[]>('/dashboard/recent-activities', {
        params: { limit: 5 },
      });
      return res.data;
    },
    enabled: hasToken(),
    refetchInterval: 60_000,
  });

  // Calculate unseen count
  const unseenCount = React.useMemo(() => {
    if (!activities || !seenTimestamp) return activities?.length || 0;
    const seenDate = new Date(seenTimestamp).getTime();
    return activities.filter((a) => new Date(a.createdAt).getTime() > seenDate).length;
  }, [activities, seenTimestamp]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const now = new Date().toISOString();
      setActivitySeen(now);
      setSeenTimestamp(now);
    }
  };

  const badgeText = unseenCount > 9 ? '9+' : unseenCount > 0 ? String(unseenCount) : null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="relative w-10 h-10 rounded-full bg-white shadow-xs border border-line/60 flex items-center justify-center text-ink hover:text-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-body" />
          {badgeText && (
            <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-[#EF4444] text-[11px] font-bold text-white shadow-xs">
              {badgeText}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] p-0 rounded-2xl bg-white border border-line/60 shadow-xl overflow-hidden"
      >
        <div className="p-4 border-b border-line-soft flex items-center justify-between">
          <h3 className="text-base font-bold text-ink">Notifications</h3>
          {unseenCount > 0 && (
            <span className="text-xs bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded-full">
              {unseenCount} nouvelle{unseenCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto divide-y divide-line-soft">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : !activities || activities.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              Aucune notification récente
            </div>
          ) : (
            activities.map((item) => {
              const cfg = getActivityConfig(item.type, item.title);
              const Icon = cfg.icon;
              return (
                <div key={item.id} className="p-3.5 hover:bg-brand-50/50 transition-colors flex gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cfg.bg, color: cfg.iconColor }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-semibold text-ink truncate">
                        {cfg.title}
                      </p>
                      <span className="text-[11px] text-muted shrink-0">
                        {relativeTime(item.createdAt)}
                      </span>
                    </div>
                    {item.detail && (
                      <p className="text-xs text-muted truncate">{item.detail}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-line-soft text-center bg-[#F8F9FD]">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Tout voir
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
