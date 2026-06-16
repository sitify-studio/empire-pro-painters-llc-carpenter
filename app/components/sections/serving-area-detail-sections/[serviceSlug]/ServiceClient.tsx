'use client';

import { useParams } from 'next/navigation';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { ServiceDetail } from '@/app/components/sections/ServiceDetail';
import { Footer } from '@/app/components/layout/Footer';
import Link from 'next/link';
import { useThemeColors } from '@/app/hooks/useTheme';

interface ServiceClientProps {
  serviceSlug: string;
}

export default function ServiceClient({ serviceSlug: serviceSlugProp }: ServiceClientProps) {
  const params = useParams();
  const serviceSlug = params.serviceSlug as string || serviceSlugProp;
  
  const { site, services, loading, error } = useWebBuilder();
  const themeColors = useThemeColors();
  
  const service = services.find((s: any) => s.slug === serviceSlug);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.pageBackground }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: themeColors.primaryButton }}
          />
          <p style={{ color: themeColors.secondaryText }}>Loading service...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.pageBackground }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: themeColors.mainText }}>Error</h2>
          <p style={{ color: themeColors.secondaryText }}>{error}</p>
          <Link href="/" className="mt-4 inline-block hover:underline" style={{ color: themeColors.primaryButton }}>
            Return Home
          </Link>
        </div>
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.pageBackground }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: themeColors.mainText }}>Service Not Found</h2>
          <p className="mb-4" style={{ color: themeColors.secondaryText }}>The service "{serviceSlug}" could not be found.</p>
          <Link href="/" className="inline-block hover:underline" style={{ color: themeColors.primaryButton }}>
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ServiceDetail service={service} allServices={services} />
      <Footer />
    </div>
  );
}
