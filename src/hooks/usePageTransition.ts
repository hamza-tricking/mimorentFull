'use client';

import { useLoading } from '../contexts/LoadingContext';
import { useTransition } from 'react';

export function usePageTransition() {
  const { setLoading } = useLoading();
  const [isPending, startTransition] = useTransition();

  const handleNavigation = (callback: () => void) => {
    startTransition(() => {
      setLoading(true);
      callback();
      
      // Hide loading after 1 second
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    });
  };

  return { isPending, handleNavigation };
}
