'use client';

import { useEffect } from 'react';

/**
 * Borra la cookie del mensaje "flash" una vez que la página ya lo mostró.
 */
export default function FlashClear() {
  useEffect(() => {
    document.cookie = 'bs_flash=; Max-Age=0; path=/';
  }, []);
  return null;
}
