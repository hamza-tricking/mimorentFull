'use client';

import { useLoading } from '../contexts/LoadingContext';
import LoadingScreen from './LoadingScreen';

export default function GlobalLoading() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return <LoadingScreen />;
}
