import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/api/public';
import { LandingHeader } from './components/LandingHeader';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ProgramsSection } from './components/ProgramsSection';
import { TeachersSection } from './components/TeachersSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { RegistrationSection } from './components/RegistrationSection';
import { LandingFooter } from './components/LandingFooter';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'FLS School · Accueil & Inscriptions';
  }, []);

  const { data: settings } = useQuery({
    queryKey: ['public', 'site-settings'],
    queryFn: publicApi.getSiteSettings,
    staleTime: 60_000,
  });

  const { data: siteInfo } = useQuery({
    queryKey: ['public', 'site-info'],
    queryFn: publicApi.getSiteInfo,
    staleTime: 60_000,
  });

  const { data: levels } = useQuery({
    queryKey: ['public', 'levels'],
    queryFn: publicApi.getLevels,
    staleTime: 60_000,
  });

  const { data: teachers } = useQuery({
    queryKey: ['public', 'teachers'],
    queryFn: publicApi.getTeachers,
    staleTime: 60_000,
  });

  const { data: testimonialsData } = useQuery({
    queryKey: ['public', 'testimonials'],
    queryFn: () => publicApi.getTestimonials(1, 6),
    staleTime: 60_000,
  });

  const { data: testimonialSummary } = useQuery({
    queryKey: ['public', 'testimonials-summary'],
    queryFn: publicApi.getTestimonialsSummary,
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen flex flex-col bg-page-bg text-ink selection:bg-brand-500/20 font-sans antialiased overflow-x-hidden w-full max-w-full">
      <LandingHeader settings={settings} />

      <main className="flex-1 overflow-x-hidden w-full max-w-full">
        <HeroSection settings={settings} siteInfo={siteInfo} />
        <AboutSection settings={settings} />
        <TeachersSection teachers={teachers} />
        <ProgramsSection levels={levels} />
        <TestimonialsSection
          testimonials={testimonialsData?.data}
          summary={testimonialSummary}
        />
        <RegistrationSection settings={settings} />
      </main>

      <LandingFooter settings={settings} />
    </div>
  );
};

export default LandingPage;
