'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface LoadingWithTimeoutProps {
  timeout?: number; // en millisecondes
  onTimeout?: () => void;
  message?: string;
}

export default function LoadingWithTimeout({ 
  timeout = 5000, 
  onTimeout,
  message = 'Chargement...'
}: LoadingWithTimeoutProps) {
  const [isTimeout, setIsTimeout] = useState(false);
  const [showRefresh, setShowRefresh] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeout(true);
      if (onTimeout) {
        onTimeout();
      }
    }, timeout);

    // Afficher le bouton refresh après 3 secondes
    const refreshTimer = setTimeout(() => {
      setShowRefresh(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(refreshTimer);
    };
  }, [timeout, onTimeout]);

  const handleRefresh = () => {
    // Forcer le rechargement sans cache
    window.location.href = window.location.href + '?t=' + Date.now();
  };

  if (isTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chargement trop long
          </h2>
          <p className="text-gray-600 mb-6">
            La page met du temps à charger. Cela peut être dû à votre connexion ou au cache du navigateur.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Rafraîchir la page
            </button>
            <button
              onClick={() => {
                // Nettoyer le cache et recharger
                if (typeof window !== 'undefined') {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Nettoyer le cache et recharger
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{message}</p>
        {showRefresh && (
          <button
            onClick={handleRefresh}
            className="mt-4 text-sm text-red-600 hover:text-red-700 flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="h-3 w-3" />
            Rafraîchir si bloqué
          </button>
        )}
      </div>
    </div>
  );
}