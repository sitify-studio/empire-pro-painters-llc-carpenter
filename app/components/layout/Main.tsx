'use client';

import type { ReactNode } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { PageContentLoader } from '@/app/components/ui/PageContentLoader';

export function Main({ children }: { children: ReactNode }) {
  const { loading } = useWebBuilder();

  if (loading) {
    return (
      <main className="relative z-10 flex min-h-screen items-center justify-center">
        <PageContentLoader />
      </main>
    );
  }

  return <main className="relative z-10 min-h-screen pt-16">{children}</main>;
}
