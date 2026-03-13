'use client';

import { useLoading } from '../contexts/LoadingContext';
import GlobalLoading from '../components/GlobalLoading';
import AppPageTransition from '../components/AppPageTransition';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoading();
  
  return (
    <>
      <AppPageTransition />
      {isLoading ? (
        <GlobalLoading />
      ) : (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          {children}
        </div>
      )}
    </>
  );
}
