'use client';

import { useEffect } from 'react';
import { useLoading } from '../contexts/LoadingContext';

export default function LoadingController() {
  const { setLoading } = useLoading();

  useEffect(() => {
    // Hide loading screen after 1 second
    const timer = setTimeout(() => {
      console.log('Setting loading to false from LoadingController');
      setLoading(false);
    }, 1000);

    // Cleanup timer on unmount
    return () => {
      console.log('Cleaning up LoadingController timer');
      clearTimeout(timer);
    };
  }, [setLoading]);

  console.log('LoadingController rendered');

  return null;
}
