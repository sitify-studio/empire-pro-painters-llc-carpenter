'use client';

interface PageContentLoaderProps {
  className?: string;
}

export function PageContentLoader({ className = '' }: PageContentLoaderProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--wb-primary,#7A9A5C)_20%,transparent)] border-t-[var(--wb-primary,#7A9A5C)]"
      />
    </div>
  );
}
