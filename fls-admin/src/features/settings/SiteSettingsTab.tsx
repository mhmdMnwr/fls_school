import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Share2,
  Loader2,
  Save,
  Sparkles,
  BookOpen,
  Phone,
  Plus,
  Trash2,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { siteSettingsApi } from '@/api/siteSettings';
import { SiteSettings } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/FormField';
import { SchoolMapPicker } from '@/components/common/SchoolMapPicker';
import { getErrorMessage } from '@/lib/errors';

const SUGGESTED_NETWORKS = [
  'Facebook',
  'Instagram',
  'TikTok',
  'YouTube',
  'LinkedIn',
  'Twitter / X',
  'Telegram',
  'WhatsApp',
];

const socialLinkSchema = z.object({
  name: z.string().min(1, 'Nom du réseau requis'),
  url: z.string().min(1, 'Lien requis'),
});

const siteSettingsSchema = z.object({
  // Textes Section Principale (Hero)
  heroTagline: z.string().max(250, '250 caractères maximum').optional().or(z.literal('')),
  heroDescription: z.string().max(1000, '1000 caractères maximum').optional().or(z.literal('')),

  // Textes Section À Propos
  aboutTitle: z.string().max(250, '250 caractères maximum').optional().or(z.literal('')),
  aboutText1: z.string().max(2000, '2000 caractères maximum').optional().or(z.literal('')),
  aboutText2: z.string().max(2000, '2000 caractères maximum').optional().or(z.literal('')),

  // Coordonnées de contact
  phone: z.string().max(50, '50 caractères maximum').optional().or(z.literal('')),
  whatsapp: z.string().max(50, '50 caractères maximum').optional().or(z.literal('')),
  email: z.string().email('Adresse e-mail invalide').optional().or(z.literal('')),

  // Localisation (2 éléments totalement indépendants)
  // 1. Adresse écrite à la main
  address: z.string().max(500, '500 caractères maximum').optional().or(z.literal('')),

  // 2. Coordonnées de la carte
  mapLatitude: z.number().optional(),
  mapLongitude: z.number().optional(),
  mapZoom: z.number().optional(),

  // Réseaux sociaux dynamiques
  socialLinks: z.array(socialLinkSchema).default([]),
});

type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

export const SiteSettingsTab: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['settings', 'site'],
    queryFn: siteSettingsApi.getSiteSettings,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      heroTagline: '',
      heroDescription: '',
      aboutTitle: '',
      aboutText1: '',
      aboutText2: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      mapLatitude: 36.8065,
      mapLongitude: 10.1815,
      mapZoom: 15,
      socialLinks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socialLinks',
  });

  const watchedLat = watch('mapLatitude') ?? 36.8065;
  const watchedLng = watch('mapLongitude') ?? 10.1815;
  const watchedZoom = watch('mapZoom') ?? 15;

  useEffect(() => {
    if (settings) {
      let initialSocialLinks: { name: string; url: string }[] = [];
      if (settings.socialLinks && settings.socialLinks.length > 0) {
        initialSocialLinks = settings.socialLinks;
      } else {
        if (settings.facebookUrl) {
          initialSocialLinks.push({ name: 'Facebook', url: settings.facebookUrl });
        }
        if (settings.instagramUrl) {
          initialSocialLinks.push({ name: 'Instagram', url: settings.instagramUrl });
        }
        if (settings.linkedinUrl) {
          initialSocialLinks.push({ name: 'LinkedIn', url: settings.linkedinUrl });
        }
        if (settings.youtubeUrl) {
          initialSocialLinks.push({ name: 'YouTube', url: settings.youtubeUrl });
        }
        if (settings.tiktokUrl) {
          initialSocialLinks.push({ name: 'TikTok', url: settings.tiktokUrl });
        }
      }

      // If coordinates exist, use them; otherwise default to Tunis or parse from embed if available
      let lat = settings.mapLatitude;
      let lng = settings.mapLongitude;
      let zoom = settings.mapZoom || 15;

      if ((lat === undefined || isNaN(lat)) && settings.googleMapsEmbedUrl) {
        const match = settings.googleMapsEmbedUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
          lat = parseFloat(match[1]);
          lng = parseFloat(match[2]);
        }
      }

      reset({
        heroTagline: settings.heroTagline || settings.tagline || '',
        heroDescription: settings.heroDescription || '',
        aboutTitle: settings.aboutTitle || '',
        aboutText1: settings.aboutText1 || '',
        aboutText2: settings.aboutText2 || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
        address: settings.address || '',
        mapLatitude: typeof lat === 'number' && !isNaN(lat) ? lat : 36.8065,
        mapLongitude: typeof lng === 'number' && !isNaN(lng) ? lng : 10.1815,
        mapZoom: zoom,
        socialLinks: initialSocialLinks,
      });
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (values: SiteSettingsFormValues) => {
      // Clean social links: only keep entries that have both name and url
      const cleanSocialLinks = (values.socialLinks || [])
        .filter((link) => link.name?.trim() && link.url?.trim())
        .map(({ name, url }) => ({ name: name.trim(), url: url.trim() }));

      const lat = typeof values.mapLatitude === 'number' && !isNaN(values.mapLatitude) ? values.mapLatitude : 36.8065;
      const lng = typeof values.mapLongitude === 'number' && !isNaN(values.mapLongitude) ? values.mapLongitude : 10.1815;
      const zoom = values.mapZoom || 15;

      const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

      return siteSettingsApi.updateSiteSettings({
        heroTagline: values.heroTagline?.trim() || '',
        tagline: values.heroTagline?.trim() || '',
        heroDescription: values.heroDescription?.trim() || '',
        aboutTitle: values.aboutTitle?.trim() || '',
        aboutText1: values.aboutText1?.trim() || '',
        aboutText2: values.aboutText2?.trim() || '',
        phone: values.phone?.trim() || '',
        whatsapp: values.whatsapp?.trim() || '',
        email: values.email?.trim() || '',
        address: values.address?.trim() || '',
        mapLatitude: lat,
        mapLongitude: lng,
        mapZoom: zoom,
        googleMapsEmbedUrl: embedUrl,
        mapsUrl,
        socialLinks: cleanSocialLinks,
      });
    },
    onSuccess: () => {
      toast.success('Paramètres enregistrés avec succès');
      queryClient.invalidateQueries({ queryKey: ['settings', 'site'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'site-settings'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const onSubmit = (data: SiteSettingsFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sticky Save Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-line/60 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink">Paramètres du site web</h2>
          <p className="text-xs text-muted">
            Personnalisez les textes de la page d'accueil, les coordonnées, la localisation et les réseaux sociaux
          </p>
        </div>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-xl h-10 px-5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs self-end sm:self-auto"
        >
          {mutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Enregistrer les modifications
        </Button>
      </div>

      {/* Section 1: Textes de la Section Principale (Hero) */}
      <div className="bg-white rounded-2xl border border-line/60 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-line/40 pb-3">
          <Sparkles className="w-5 h-5 text-brand-600" />
          <div>
            <h3 className="text-base font-bold text-ink">Section Principale (Accueil / Hero)</h3>
            <p className="text-xs text-muted">
              Modifiez le slogan et la description mis en avant sur la page d'accueil
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          <FormField
            label="Slogan principal (Accroche sous le nom de l'école)"
            error={errors.heroTagline?.message}
          >
            <Input
              placeholder="Ex: L'excellence académique et l'épanouissement personnel au cœur de notre école"
              className="h-10 rounded-xl"
              {...register('heroTagline')}
            />
          </FormField>

          <FormField
            label="Description détaillée"
            error={errors.heroDescription?.message}
          >
            <Textarea
              placeholder="Ex: Un accompagnement d'excellence, des enseignants qualifiés et un suivi rigoureux pour garantir le meilleur parcours scolaire."
              rows={3}
              className="rounded-xl"
              {...register('heroDescription')}
            />
          </FormField>
        </div>
      </div>

      {/* Section 2: Textes de la Section À Propos */}
      <div className="bg-white rounded-2xl border border-line/60 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-line/40 pb-3">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <div>
            <h3 className="text-base font-bold text-ink">Section À Propos</h3>
            <p className="text-xs text-muted">
              Présentez l'histoire, la vision et les valeurs pédagogiques de l'établissement
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          <FormField
            label="Titre de la présentation"
            error={errors.aboutTitle?.message}
          >
            <Input
              placeholder="Ex: Une institution dédiée à l'excellence et à la réussite de chaque élève"
              className="h-10 rounded-xl"
              {...register('aboutTitle')}
            />
          </FormField>

          <FormField
            label="Paragraphe principal de présentation"
            error={errors.aboutText1?.message}
          >
            <Textarea
              placeholder="Ex: Fondée avec l'ambition d'offrir une formation d'excellence, FLS School accompagne chaque enfant dans un cadre structuré..."
              rows={3}
              className="rounded-xl"
              {...register('aboutText1')}
            />
          </FormField>

          <FormField
            label="Deuxième paragraphe (facultatif)"
            error={errors.aboutText2?.message}
          >
            <Textarea
              placeholder="Ex: Nos équipes pédagogiques expérimentées appliquent des méthodes innovantes favorisant l'autonomie..."
              rows={3}
              className="rounded-xl"
              {...register('aboutText2')}
            />
          </FormField>
        </div>
      </div>

      {/* Section 3: Coordonnées de Contact */}
      <div className="bg-white rounded-2xl border border-line/60 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-line/40 pb-3">
          <Phone className="w-5 h-5 text-brand-600" />
          <div>
            <h3 className="text-base font-bold text-ink">Coordonnées de Contact</h3>
            <p className="text-xs text-muted">
              Numéros de téléphone et e-mail affichés dans le pied de page et les contacts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <FormField label="Téléphone" error={errors.phone?.message}>
            <Input
              placeholder="Ex: +216 71 234 567"
              className="h-10 rounded-xl"
              {...register('phone')}
            />
          </FormField>

          <FormField label="WhatsApp" error={errors.whatsapp?.message}>
            <Input
              placeholder="Ex: +216 98 765 432"
              className="h-10 rounded-xl"
              {...register('whatsapp')}
            />
          </FormField>

          <FormField label="Adresse e-mail" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="Ex: contact@fls.school"
              className="h-10 rounded-xl"
              {...register('email')}
            />
          </FormField>
        </div>
      </div>

      {/* Section 4: Localisation & Carte (2 éléments indépendants : Adresse écrite + Carte) */}
      <div className="bg-white rounded-2xl border border-line/60 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-line/40 pb-3">
          <MapPin className="w-5 h-5 text-brand-600" />
          <div>
            <h3 className="text-base font-bold text-ink">Localisation</h3>
            <p className="text-xs text-muted">
              L'adresse textuelle et l'emplacement sur la carte sont deux réglages totalement distincts
            </p>
          </div>
        </div>

        <div className="space-y-6 pt-1">
          {/* 1. Static address write by hand field */}
          <div className="space-y-1.5">
            <FormField
              label="1. Adresse de l'établissement (saisie à la main)"
              error={errors.address?.message}
            >
              <Input
                placeholder="Ex: 15 Avenue Habib Bourguiba, Tunis 1001 (ou indication d'étage, quartier...)"
                className="h-10 rounded-xl"
                {...register('address')}
              />
            </FormField>
            <p className="text-[11px] text-muted">
              Ce texte s'affiche tel quel sur les blocs de contact de votre site web. Il n'influence pas la position de la carte ci-dessous.
            </p>
          </div>

          {/* 2. Interactive map to set school location */}
          <div className="space-y-2 pt-2 border-t border-line/40">
            <div>
              <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-600" />
                2. Emplacement de l'école sur la carte (Indépendant du texte)
              </h4>
              <p className="text-[11px] text-muted mt-0.5">
                Positionnez le repère exactement là où se trouve votre école. C'est cet emplacement qui s'affiche sur la carte de la page d'accueil.
              </p>
            </div>

            <SchoolMapPicker
              latitude={watchedLat}
              longitude={watchedLng}
              zoom={watchedZoom}
              onChange={({ latitude, longitude, zoom }) => {
                setValue('mapLatitude', latitude, { shouldDirty: true });
                setValue('mapLongitude', longitude, { shouldDirty: true });
                if (zoom) setValue('mapZoom', zoom, { shouldDirty: true });
              }}
            />
          </div>
        </div>
      </div>

      {/* Section 5: Réseaux Sociaux Dynamiques */}
      <div className="bg-white rounded-2xl border border-line/60 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-line/40 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-base font-bold text-ink">Réseaux sociaux</h3>
              <p className="text-xs text-muted">
                Ajoutez n'importe quel réseau social en indiquant son nom et son lien
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: '', url: '' })}
            className="rounded-xl h-9 px-3 text-xs font-semibold border-brand-200 text-brand-700 hover:bg-brand-50"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Ajouter un réseau
          </Button>
        </div>

        {/* Quick add suggestions */}
        <div>
          <span className="text-xs font-medium text-muted block mb-1.5">
            Suggestions rapides à ajouter en un clic :
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_NETWORKS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => append({ name, url: '' })}
                className="text-xs px-2.5 py-1 rounded-lg bg-surface border border-line hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                + {name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Social Links List */}
        <div className="space-y-3 pt-2">
          {fields.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-line text-center text-muted">
              <Globe className="w-8 h-8 text-muted/40 mx-auto mb-2" />
              <p className="text-xs font-medium">Aucun réseau social configuré.</p>
              <p className="text-[11px] text-muted/80 mt-0.5">
                Cliquez sur « Ajouter un réseau » ci-dessus pour ajouter des liens vers vos pages.
              </p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl border border-line bg-surface/40 hover:bg-surface/80 transition-colors"
              >
                <div className="w-full sm:w-1/3">
                  <Input
                    placeholder="Nom du réseau (ex: TikTok, Facebook, etc.)"
                    className="h-10 rounded-xl text-xs font-semibold"
                    {...register(`socialLinks.${index}.name` as const)}
                  />
                  {errors.socialLinks?.[index]?.name && (
                    <p className="text-[11px] text-danger mt-1">
                      {errors.socialLinks[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="w-full sm:flex-1">
                  <Input
                    placeholder="Lien URL (ex: https://...)"
                    className="h-10 rounded-xl text-xs font-mono"
                    {...register(`socialLinks.${index}.url` as const)}
                  />
                  {errors.socialLinks?.[index]?.url && (
                    <p className="text-[11px] text-danger mt-1">
                      {errors.socialLinks[index]?.url?.message}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="h-10 w-10 p-0 text-muted hover:text-rose-600 hover:bg-rose-50 rounded-xl shrink-0 self-end sm:center"
                  title="Supprimer ce réseau"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </form>
  );
};

export default SiteSettingsTab;
