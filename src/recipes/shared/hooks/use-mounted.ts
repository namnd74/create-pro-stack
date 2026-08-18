import { useState, useEffect } from 'react';

/**
 * Hook to check if component is mounted on the client.
 * Essential for preventing SSR Hydration Mismatch in Next.js.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
