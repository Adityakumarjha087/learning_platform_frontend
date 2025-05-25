'use client';

import { useLoading } from '../context/LoadingContext';

export const useLoadingOperation = () => {
  const { showLoading, hideLoading } = useLoading();

  const withLoading = async <T>(
    operation: () => Promise<T>,
    loadingMessage: string = 'Loading'
  ): Promise<T> => {
    showLoading(loadingMessage);
    try {
      const result = await operation();
      return result;
    } finally {
      hideLoading();
    }
  };

  return { withLoading };
}; 