import React, { useState } from 'react';
import {
  StatusBadge,
  InitialsAvatar,
  IconTile,
  StatCard,
  EmptyState,
  ErrorState,
  ConfirmDialog,
  FormField,
  DataTable,
  Pagination,
  FilterBar,
  AsyncCombobox,
  ListPageSkeleton,
  DetailPageSkeleton,
  DashboardSkeleton,
  PageHeader,
  Breadcrumbs,
} from '@/components/common';
import {
  Users,
  Layers,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Plus,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UiKitPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [comboboxVal, setComboboxVal] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);

  React.useEffect(() => {
    document.title = 'UI Kit · FLS School';
  }, []);

  const dummyData = [
    { id: '1', name: 'Benali Amina', level: 'Primaire', class: '1ère Année', phone: '0555 12 34 56', status: 'success' as const },
    { id: '2', name: 'Mansouri Karim', level: 'CEM', class: '3ème Année', phone: '0666 78 90 12', status: 'neutral' as const },
    { id: '3', name: 'Brahimi Sara', level: 'Lycée', class: 'Terminale S', phone: '0777 34 56 78', status: 'warning' as const },
  ];

  const columns = [
    {
      key: 'name',
      header: 'Nom et prénom',
      render: (row: typeof dummyData[0]) => (
        <div className="flex items-center gap-3">
          <InitialsAvatar name={row.name} size="sm" />
          <span className="font-semibold text-ink">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Niveau',
      render: (row: typeof dummyData[0]) => (
        <StatusBadge variant="brand">{row.level}</StatusBadge>
      ),
    },
    { key: 'class', header: 'Classe' },
    { key: 'phone', header: 'Téléphone' },
    {
      key: 'status',
      header: 'Statut',
      render: (row: typeof dummyData[0]) => (
        <StatusBadge variant={row.status}>
          {row.status === 'success' ? 'Actif' : row.status === 'neutral' ? 'Inactif' : 'Essai'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      <PageHeader
        title="Système de Design / UI Kit"
        subtitle="Démonstration des composants visuels et états de l'application FLS School"
        breadcrumbs={[
          { label: 'Accueil', to: '/' },
          { label: 'UI Kit' },
        ]}
        actionLabel="Ouvrir dialogue"
        onAction={() => setConfirmOpen(true)}
      />

      {/* 1. Status Badges */}
      <section className="bg-white rounded-2xl p-6 border border-line/60 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-ink">1. Badges de statut (StatusBadge)</h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge variant="success">Actif / Présent (success)</StatusBadge>
          <StatusBadge variant="warning">Essai gratuit (warning)</StatusBadge>
          <StatusBadge variant="danger">Absent / Erreur (danger)</StatusBadge>
          <StatusBadge variant="neutral">Inactif / Régulière (neutral)</StatusBadge>
          <StatusBadge variant="brand">Niveau Primaire (brand)</StatusBadge>
        </div>
      </section>

      {/* 2. Initials Avatar */}
      <section className="bg-white rounded-2xl p-6 border border-line/60 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-ink">2. Avatars d'initiales (InitialsAvatar)</h2>
        <div className="flex flex-wrap items-center gap-4">
          <InitialsAvatar firstName="Amina" lastName="Benali" size="sm" />
          <InitialsAvatar firstName="Karim" lastName="Mansouri" size="md" />
          <InitialsAvatar firstName="Sara" lastName="Brahimi" size="lg" />
          <InitialsAvatar firstName="Yacine" lastName="Djebbar" size="xl" />
          <InitialsAvatar name="Omar Saidi" size="md" />
          <InitialsAvatar name="Zineb" size="md" />
        </div>
      </section>

      {/* 3. Icon Tiles */}
      <section className="bg-white rounded-2xl p-6 border border-line/60 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-ink">3. Tuiles d'icônes (IconTile)</h2>
        <div className="flex flex-wrap items-center gap-4">
          <IconTile icon={Users} variant="indigo" size="md" />
          <IconTile icon={Layers} variant="green" size="md" />
          <IconTile icon={BookOpen} variant="purple" size="md" />
          <IconTile icon={GraduationCap} variant="amber" size="md" />
          <IconTile icon={CalendarDays} variant="brand-soft" size="md" />
          <IconTile icon={Trash2} variant="danger" size="md" />
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <IconTile icon={Users} variant="indigo" size="sm" />
          <IconTile icon={Layers} variant="green" size="sm" />
          <IconTile icon={BookOpen} variant="purple" size="sm" />
          <IconTile icon={GraduationCap} variant="amber" size="sm" />
        </div>
      </section>

      {/* 4. Stat Cards */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-ink">4. Cartes de statistiques (StatCard)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            label="Total élèves"
            value="248"
            icon={Users}
            variant="indigo"
            subline={<span className="text-success font-medium">↑ +12 ce mois</span>}
            to="/eleves"
          />
          <StatCard
            label="Niveaux"
            value="3"
            icon={Layers}
            variant="green"
            subline="Cycles d'enseignement"
            to="/niveaux"
          />
          <StatCard
            label="Matières"
            value="18"
            icon={BookOpen}
            variant="purple"
            subline="Enseignements proposés"
            to="/matieres"
          />
          <StatCard
            label="Professeurs"
            value="14"
            icon={GraduationCap}
            variant="amber"
            subline="Enseignants actifs"
            to="/profs"
          />
        </div>
      </section>

      {/* 5. FilterBar & DataTable & Pagination */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">5. Barre de filtres & Tableau de données</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSkeleton(!showSkeleton)}
          >
            {showSkeleton ? 'Afficher données' : 'Afficher chargement'}
          </Button>
        </div>

        <FilterBar
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Rechercher un élève..."
          hasActiveFilters={true}
          onResetFilters={() => {}}
        >
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-white border-line text-sm">
              <SelectValue placeholder="Tous les niveaux" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="primaire">Primaire</SelectItem>
              <SelectItem value="cem">CEM</SelectItem>
              <SelectItem value="lycee">Lycée</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>

        <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden">
          <DataTable
            columns={columns}
            data={dummyData}
            isLoading={showSkeleton}
          />
          <Pagination
            total={248}
            page={page}
            limit={limit}
            totalPages={25}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>
      </section>

      {/* 6. Form Field & Inputs */}
      <section className="bg-white rounded-2xl p-6 border border-line/60 shadow-xs space-y-4 max-w-xl">
        <h2 className="text-base font-bold text-ink">6. Champs de formulaire (FormField)</h2>
        <FormField label="Nom complet" required helperText="Entrez nom et prénom de l'élève">
          <Input placeholder="ex. Amina Benali" className="h-10 rounded-xl" />
        </FormField>
        <FormField label="Email" error="Adresse email invalide">
          <Input defaultValue="amina.benali" className="h-10 rounded-xl border-danger" />
        </FormField>
        <FormField label="Recherche asynchrone (AsyncCombobox)">
          <AsyncCombobox
            value={comboboxVal}
            onChange={(val) => setComboboxVal(val)}
            loadOptions={async (q) => {
              return [
                { value: '1', label: `${q} - Amina Benali`, sublabel: '1ère Année' },
                { value: '2', label: `${q} - Karim Mansouri`, sublabel: '3ème Année' },
              ];
            }}
            placeholder="Choisir un élève..."
          />
        </FormField>
      </section>

      {/* 7. Empty & Error States */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-line/60 shadow-xs">
          <EmptyState
            title="Aucun élève trouvé"
            description="Essayez de modifier vos filtres ou ajoutez un nouvel élève."
            actionLabel="Ajouter un élève"
            actionIcon={Plus}
            onAction={() => {}}
          />
        </div>
        <div className="bg-white rounded-2xl border border-line/60 shadow-xs">
          <ErrorState
            title="Erreur de chargement"
            message="Impossible de récupérer les informations depuis le serveur."
            onRetry={() => {}}
          />
        </div>
      </section>

      {/* 8. Skeletons */}
      <section className="space-y-6">
        <h2 className="text-base font-bold text-ink">8. Squelettes de chargement</h2>
        <div className="p-6 bg-white rounded-2xl border border-line/60 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-muted">Fil d'Ariane autonome (Breadcrumbs)</h3>
          <Breadcrumbs
            items={[
              { label: 'Accueil', to: '/' },
              { label: 'Élèves', to: '/eleves' },
              { label: 'Benali Amina' },
            ]}
          />
        </div>
        <div className="p-6 bg-white rounded-2xl border border-line/60 shadow-xs">
          <h3 className="text-sm font-semibold text-muted mb-4">Squelette de liste (ListPageSkeleton)</h3>
          <ListPageSkeleton />
        </div>
        <div className="p-6 bg-white rounded-2xl border border-line/60 shadow-xs">
          <h3 className="text-sm font-semibold text-muted mb-4">Squelette de détail (DetailPageSkeleton)</h3>
          <DetailPageSkeleton />
        </div>
        <div className="p-6 bg-white rounded-2xl border border-line/60 shadow-xs">
          <h3 className="text-sm font-semibold text-muted mb-4">Squelette du tableau de bord (DashboardSkeleton)</h3>
          <DashboardSkeleton />
        </div>
      </section>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Supprimer cet élève ?"
        description="Voulez-vous vraiment supprimer l'élève Amina Benali ? Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={() => setConfirmOpen(false)}
      />
    </div>
  );
}
