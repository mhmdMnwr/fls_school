import React from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { SiteSettings } from '@/types/api';

export interface ContactMapSectionProps {
  settings?: SiteSettings;
}

export const ContactMapSection: React.FC<ContactMapSectionProps> = ({ settings }) => {
  const phoneHref = (phone?: string) =>
    phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : '#';
  const whatsappHref = (wa?: string) =>
    wa ? `https://wa.me/${wa.replace(/[^\d]/g, '')}` : '#';

  const lat = settings?.mapLatitude;
  const lng = settings?.mapLongitude;
  const hasCoordinates =
    typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);

  const embedUrl = hasCoordinates
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=${settings?.mapZoom || 15}&output=embed`
    : settings?.googleMapsEmbedUrl || settings?.mapsEmbedUrl;

  const mapsExternalUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : settings?.mapsUrl ||
      (settings?.address ? `https://maps.google.com/?q=${encodeURIComponent(settings.address)}` : 'https://maps.google.com');

  const isValidEmbedUrl = Boolean(
    embedUrl && (/^https:\/\/(www\.|maps\.)?google\.[a-z.]+\/maps.*$/.test(embedUrl.trim()) || hasCoordinates)
  );

  const hasPhone = Boolean(settings?.phone);
  const hasWhatsapp = Boolean(settings?.whatsapp);
  const hasEmail = Boolean(settings?.email);

  return (
    <section id="contact" className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-100 scroll-mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1.5">
          <span className="inline-block px-3.5 py-1 rounded-full bg-slate-100 text-xs font-bold uppercase tracking-wider text-[#0B2545]">
            Localisation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
            Coordonnées & Plan d'accès
          </h2>
          <p className="text-sm text-slate-500">
            Retrouvez notre établissement à Tunis ou localisez facilement notre campus sur la carte.
          </p>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {settings?.address && (
            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#0B2545] text-white flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="w-5 h-5 text-[#F5A623]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Adresse
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#0B2545] leading-snug">
                  {settings.address}
                </p>
              </div>
            </div>
          )}

          {hasPhone && (
            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#0B2545] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Phone className="w-5 h-5 text-[#F5A623]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Téléphone
                </span>
                <a
                  href={phoneHref(settings?.phone)}
                  className="text-xs sm:text-sm font-bold text-[#0B2545] hover:text-[#F5A623] transition-colors block leading-snug truncate"
                >
                  {settings?.phone}
                </a>
              </div>
            </div>
          )}

          {hasWhatsapp && (
            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#0B2545] text-white flex items-center justify-center shrink-0 shadow-sm">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  WhatsApp
                </span>
                <a
                  href={whatsappHref(settings?.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors block leading-snug truncate"
                >
                  {settings?.whatsapp}
                </a>
              </div>
            </div>
          )}

          {hasEmail && (
            <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#0B2545] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Mail className="w-5 h-5 text-[#F5A623]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Email
                </span>
                <a
                  href={`mailto:${settings?.email}`}
                  className="text-xs sm:text-sm font-bold text-[#0B2545] hover:text-[#F5A623] transition-colors block leading-snug truncate"
                >
                  {settings?.email}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Map & School visit note (Zero "horaires d'ouverture") */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: School visit note */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0B2545] text-white shadow-sm space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#F5A623] text-xs font-bold uppercase tracking-wider">
                Visite du campus
              </span>
              <h4 className="text-base font-bold text-white">Venez découvrir notre école</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Notre secrétariat et nos équipes pédagogiques sont ravis de vous accueillir pour vous présenter nos salles de classe modernes, notre laboratoire et nos espaces d'apprentissage.
              </p>
            </div>
          </div>

          {/* Right Column: Google Maps Iframe */}
          <div className="lg:col-span-8">
            {isValidEmbedUrl && embedUrl ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md h-[380px] bg-slate-100 relative">
                  <iframe
                    title="Carte de localisation de FLS School"
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-1">
                  <span className="font-semibold text-[#0B2545]">{settings?.address || 'FLS School'}</span>
                  <a
                    href={mapsExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-[#0B2545] hover:text-[#F5A623] transition-colors"
                  >
                    <span>Ouvrir sur Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white shadow-sm text-slate-400 h-[380px] flex flex-col items-center justify-center">
                <MapPin className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-[#0B2545]">Emplacement de l'école</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  {settings?.address || "L'emplacement de l'école sera bientôt configuré."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
