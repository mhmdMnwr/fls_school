import React from 'react';
import {
  BookOpen,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  ExternalLink,
  ArrowUp,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';
import { SiteSettings } from '@/types/api';
import { APP_NAME } from '@/config/brand';

export interface LandingFooterProps {
  settings?: SiteSettings;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ settings }) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Compile list of social links (dynamic list from settings, or legacy fallbacks)
  const socialLinks: { name: string; url: string }[] = [];
  if (settings?.socialLinks && settings.socialLinks.length > 0) {
    settings.socialLinks.forEach((item) => {
      if (item.name && item.url) socialLinks.push(item);
    });
  } else {
    if (settings?.facebookUrl) socialLinks.push({ name: 'Facebook', url: settings.facebookUrl });
    if (settings?.instagramUrl) socialLinks.push({ name: 'Instagram', url: settings.instagramUrl });
    if (settings?.linkedinUrl) socialLinks.push({ name: 'LinkedIn', url: settings.linkedinUrl });
    if (settings?.youtubeUrl) socialLinks.push({ name: 'YouTube', url: settings.youtubeUrl });
    if (settings?.tiktokUrl) socialLinks.push({ name: 'TikTok', url: settings.tiktokUrl });
  }

  const getSocialIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('facebook') || lower.includes('fb')) return <Facebook className="w-4 h-4" />;
    if (lower.includes('instagram') || lower.includes('insta')) return <Instagram className="w-4 h-4" />;
    if (lower.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (lower.includes('youtube')) return <Youtube className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  const phoneHref = (phone?: string) =>
    phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : '#';
  const whatsappHref = (wa?: string) =>
    wa ? `https://wa.me/${wa.replace(/[^\d]/g, '')}` : '#';

  const embedUrl = settings?.googleMapsEmbedUrl || settings?.mapsEmbedUrl;
  const isValidEmbedUrl = Boolean(
    embedUrl && /^https:\/\/(www\.|maps\.)?google\.[a-z.]+\/maps.*$/.test(embedUrl.trim())
  );

  const mapsLink =
    settings?.mapsUrl ||
    (settings?.address
      ? `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`
      : undefined);

  return (
    <footer id="contact" className="bg-[#0B2545] text-white pt-14 pb-8 border-t border-white/10 scroll-mt-10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-white/15">
          {/* Col 1: Brand & Slogan (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md border border-white/20 overflow-hidden p-1">
                <img
                  src="/images/fls-logo.png"
                  alt="FLS School Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight block">
                  {APP_NAME}
                </span>
                <span className="text-[11px] text-slate-300 font-medium block">
                  Apprendre aujourd'hui, réussir demain
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {settings?.tagline ||
                "Un cadre d'apprentissage moderne pour un avenir meilleur. Nous accompagnons chaque élève vers l'excellence avec bienveillance et rigueur."}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Haut de page</span>
              </button>
            </div>
          </div>

          {/* Col 2: Navigation Rapide (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5A623]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a
                  href="#hero"
                  onClick={(e) => scrollToSection(e, '#hero')}
                  className="hover:text-white transition-colors"
                >
                  Accueil
                </a>
              </li>
              <li>
                <a
                  href="#a-propos"
                  onClick={(e) => scrollToSection(e, '#a-propos')}
                  className="hover:text-white transition-colors"
                >
                  À propos
                </a>
              </li>
              <li>
                <a
                  href="#professeurs"
                  onClick={(e) => scrollToSection(e, '#professeurs')}
                  className="hover:text-white transition-colors"
                >
                  Nos professeurs
                </a>
              </li>
              <li>
                <a
                  href="#programme"
                  onClick={(e) => scrollToSection(e, '#programme')}
                  className="hover:text-white transition-colors"
                >
                  Niveaux & Matières
                </a>
              </li>
              <li>
                <a
                  href="#avis"
                  onClick={(e) => scrollToSection(e, '#avis')}
                  className="hover:text-white transition-colors"
                >
                  Avis des parents
                </a>
              </li>
              <li>
                <a
                  href="#inscription"
                  onClick={(e) => scrollToSection(e, '#inscription')}
                  className="hover:text-[#F5A623] font-bold text-white transition-colors"
                >
                  Pré-inscription
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Coordonnées (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5A623]">
              Contact & Coordonnées
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              {settings?.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                  <span className="leading-snug">{settings.address}</span>
                </div>
              )}

              {settings?.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#F5A623] shrink-0" />
                  <a
                    href={phoneHref(settings.phone)}
                    className="hover:text-white transition-colors"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}

              {settings?.whatsapp && (
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={whatsappHref(settings.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {settings.whatsapp}
                  </a>
                </div>
              )}

              {settings?.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#F5A623] shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-white transition-colors truncate"
                  >
                    {settings.email}
                  </a>
                </div>
              )}
            </div>

            {/* Social links under contact */}
            {socialLinks.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Réseaux sociaux
                </span>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#F5A623] hover:text-[#0B2545] text-white text-xs font-medium transition-all group"
                      title={item.name}
                    >
                      <span className="shrink-0">{getSocialIcon(item.name)}</span>
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Col 4: Plan d'accès & Google Maps (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5A623]">
              Plan d'accès
            </h4>

            {isValidEmbedUrl && embedUrl ? (
              <div className="space-y-2">
                <div className="overflow-hidden rounded-xl border border-white/15 h-36 bg-slate-900 relative shadow-sm">
                  <iframe
                    title="Plan d'accès FLS School"
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
                {mapsLink && (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5A623] hover:text-[#E59819] transition-colors"
                  >
                    <span>Ouvrir sur Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ) : mapsLink ? (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <MapPin className="w-4 h-4 text-[#F5A623] shrink-0" />
                  <span>{settings?.address || 'FLS School'}</span>
                </div>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5A623] hover:text-[#E59819] transition-colors pt-1"
                >
                  <span>Voir l'itinéraire Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Coordonnées GPS disponibles sur demande auprès de notre secrétariat.
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar with developer credit */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {currentYear} {APP_NAME}. Tous droits réservés.</p>

          <p className="text-center font-medium">
            developed by{' '}
            <a
              href="https://mnwrameur.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5A623] hover:underline font-semibold transition-colors"
            >
              "ameur mohammed menouer"
            </a>
          </p>

          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-white transition-colors">
              Mentions légales
            </a>
            <a href="#hero" className="hover:text-white transition-colors">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
