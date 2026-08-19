'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker
          .register('/sw.js')
          .then(function (reg) {
            console.log('[SW] Registrado:', reg.scope);
          })
          .catch(function (err) {
            console.warn('[SW] Error:', err);
          });
      });
    }
  }, []);

  return null;
}
