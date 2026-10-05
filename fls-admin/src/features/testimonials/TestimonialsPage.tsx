import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  Check,
  X,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { testimonialsApi } from '@/api/testimonials';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { Testimonial } from '@/types/api';

type TabType = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<TabType>('PENDING');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Avis des parents · FLS School';
  }, []);

  // Fetch counts
  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ['testimonials', 'counts'],
    queryFn: testimonialsApi.getCounts,
    refetchInterval: 30_000,
  });

  // Switch tab default once counts arrive
  useEffect(() => {
    if (counts && counts.pending === 0 && selectedTab === 'PENDING') {
      setSelectedTab('ALL');
    }
  }, [counts]);

  // Fetch paginated testimonials
  const statusParam = selectedTab === 'ALL' ? undefined : selectedTab;
  const { data: testimonialsData, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['testimonials', { status: statusParam, page, limit }],
    queryFn: () => testimonialsApi.getTestimonials({ status: statusParam, page, limit }),
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      testimonialsApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'APPROVED' ? 'Avis approuvé avec succès' : 'Avis refusé'
      );
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'testimonials'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => testimonialsApi.deleteTestimonial(id),
    onSuccess: () => {
      toast.success('Avis supprimé');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'testimonials'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-100'
            )}
          />
        ))}
        <span className="text-xs font-bold text-ink ml-1.5">{rating}/5</span>
      </div>
    );
  };

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'PENDING', label: 'En attente', count: counts?.pending },
    { key: 'APPROVED', label: 'Approuvés', count: counts?.approved },
    { key: 'REJECTED', label: 'Refusés', count: counts?.rejected },
    { key: 'ALL', label: 'Tous', count: counts?.total },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avis des parents"
        subtitle="Modérez et gérez les témoignages déposés par les parents d'élèves"
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white rounded-2xl border border-line/60 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted">Total avis</p>
            <p className="text-2xl font-bold text-ink mt-1">
              {countsLoading ? '—' : counts?.total ?? 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* En attente */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-amber-50/40">
          <div>
            <p className="text-xs font-medium text-amber-700">En attente</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {countsLoading ? '—' : counts?.pending ?? 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Approuvés */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 p-5 shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/40">
          <div>
            <p className="text-xs font-medium text-emerald-700">Approuvés</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {countsLoading ? '—' : counts?.approved ?? 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Refusés */}
        <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-rose-50/40">
          <div>
            <p className="text-xs font-medium text-rose-700">Refusés</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {countsLoading ? '—' : counts?.rejected ?? 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-line/60 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedTab(tab.key);
                setPage(1);
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2',
                isActive
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-muted hover:text-ink hover:bg-slate-100'
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-bold leading-none',
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.key === 'PENDING' && tab.count > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Testimonials List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : !testimonialsData?.data || testimonialsData.data.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-line/60 p-8">
          <MessageSquare className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-base font-bold text-ink">Aucun avis dans cet onglet</p>
          <p className="text-xs text-muted mt-1">
            Les nouveaux avis déposés par les parents apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonialsData.data.map((testimonial: Testimonial) => {
            const isPending = testimonial.status === 'PENDING';
            const isApproved = testimonial.status === 'APPROVED';
            const isRejected = testimonial.status === 'REJECTED';

            return (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl border border-line/60 p-6 shadow-xs transition-all hover:border-line flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Top row: Author + Student + Status */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-ink">
                          {testimonial.authorName}
                        </h3>
                        {/* Status Badge */}
                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            En attente
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Approuvé
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            Refusé
                          </span>
                        )}
                      </div>

                      {/* Student relation */}
                      {testimonial.student && (
                        <div className="mt-1 flex items-center gap-2">
                          <Link
                            to={`/eleves/${testimonial.student.id}`}
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1 hover:underline"
                          >
                            <span>
                              Élève : {testimonial.student.firstName} {testimonial.student.lastName}
                            </span>
                            {testimonial.student.schoolClass?.name && (
                              <span className="text-muted">
                                ({testimonial.student.schoolClass.name})
                              </span>
                            )}
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Star Rating */}
                    <div>{renderStars(testimonial.rating)}</div>
                  </div>

                  {/* Message */}
                  <div className="mt-3.5 bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                    <p className="text-sm text-ink leading-relaxed whitespace-pre-line italic">
                      « {testimonial.message} »
                    </p>
                  </div>
                </div>

                {/* Footer: Dates & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-line/40 text-xs text-muted">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>Soumis le {formatDateTime(testimonial.createdAt)}</span>
                    {testimonial.reviewedAt && (
                      <span>• Traité le {formatDateTime(testimonial.reviewedAt)}</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Approve button */}
                    {!isApproved && (
                      <Button
                        size="sm"
                        variant={isPending ? 'default' : 'outline'}
                        onClick={() =>
                          statusMutation.mutate({
                            id: testimonial.id,
                            status: 'APPROVED',
                          })
                        }
                        disabled={statusMutation.isPending}
                        className={cn(
                          'h-8 px-3 rounded-lg font-medium text-xs',
                          isPending
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                        )}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Approuver
                      </Button>
                    )}

                    {/* Reject button */}
                    {!isRejected && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          statusMutation.mutate({
                            id: testimonial.id,
                            status: 'REJECTED',
                          })
                        }
                        disabled={statusMutation.isPending}
                        className="h-8 px-3 rounded-lg font-medium text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Refuser
                      </Button>
                    )}

                    {/* Delete button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(testimonial.id)}
                      className="h-8 w-8 p-0 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50"
                      title="Supprimer cet avis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {testimonialsData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-muted">
                Page {testimonialsData.meta.page} sur {testimonialsData.meta.totalPages} (
                {testimonialsData.meta.total} avis)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || isPlaceholderData}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="h-8 px-3 rounded-lg text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Précédent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    page >= testimonialsData.meta.totalPages || isPlaceholderData
                  }
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 px-3 rounded-lg text-xs"
                >
                  Suivant
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Supprimer cet avis ?"
        description="Cette action est irréversible. L'avis sera définitivement supprimé de la base de données."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId);
          }
        }}
      />
    </div>
  );
}
