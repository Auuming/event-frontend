'use client';

import { useEffect } from 'react';

export default function HeaderSpacer() {
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('[data-header]') as HTMLElement;
      if (header) {
        const height = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };

    // Update on mount
    updateHeaderHeight();

    // Update on resize
    window.addEventListener('resize', updateHeaderHeight);

    // Use ResizeObserver for more accurate detection of header size changes
    const header = document.querySelector('[data-header]');
    if (header) {
      const resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      resizeObserver.observe(header);

      return () => {
        window.removeEventListener('resize', updateHeaderHeight);
        resizeObserver.disconnect();
      };
    }

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  return null;
}

