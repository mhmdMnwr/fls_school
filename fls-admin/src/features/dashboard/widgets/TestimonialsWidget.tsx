import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MessageSquare, Star, ArrowRight } from 'lucide-react';
import { testimonialsApi } from '@/api/testimonials';
import { relativeTime } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { cn } from '@/lib/utils';

export const TestimonialsWidget: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'testimonials'],
    queryFn: () => testimonialsApi.getDashboardTestimonials(3),
  });

  const testimonials = data || [];

  return (
    <div className="bg-white rounded-2xl border border-line/60 p-5 shadow-xs flex flex-col h-full">
      {/* Header with link */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">Avis des parents</h2>
            <p className="text-xs text-muted">Derniers avis publiés sur le site</p>
          </div>
        </div>
        <Link
          to="/avis"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
        >
          <span>Voir tout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-line/40 space-y-2.5">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Impossible de charger les avis" onRetry={refetch} />
        ) : testimonials.length === 0 ? (
          <div className="text-sm text-muted py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-line/60">
            Aucun avis approuvé pour le moment
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/60 hover:bg-slate-50 rounded-xl p-4 border border-line/50 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-ink truncate">
                      {item.authorName}
                    </span>
                    <span className="text-[10px] text-muted shrink-0">
                      {relativeTime(item.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'w-3.5 h-3.5',
                          star <= item.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-ink/80 leading-relaxed italic line-clamp-3">
                    « {item.message} »
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsWidget;
