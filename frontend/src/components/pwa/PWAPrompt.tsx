import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, X } from 'lucide-react';

/**
 * PWA install + update prompt.
 * Shows a banner when:
 *  1. A new service worker update is available (update prompt)
 *  2. The app can be installed (install prompt — beforeinstallprompt)
 */
export default function PWAPrompt() {
  // ── Service Worker update ──
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Check for updates every 60 minutes
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
  });

  // ── Install prompt ──
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowInstall(false);
      setInstallPrompt(null);
    }
  };

  const dismissInstall = () => {
    setShowInstall(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // ── Update banner ──
  if (needRefresh) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-md rounded-xl bg-stone-900 border border-primary-500/30 p-4 shadow-xl shadow-primary-500/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/20">
            <RefreshCw className="h-5 w-5 text-primary-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">Update Available</p>
            <p className="mt-0.5 text-xs text-stone-400">A new version of ClinicLink is ready.</p>
          </div>
          <button
            onClick={() => setNeedRefresh(false)}
            className="text-stone-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="mt-3 w-full rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          Update Now
        </button>
      </div>
    );
  }

  // ── Install banner ──
  if (showInstall) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-md rounded-xl bg-stone-900 border border-secondary-500/30 p-4 shadow-xl shadow-secondary-500/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-500/20">
            <Download className="h-5 w-5 text-secondary-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">Install ClinicLink</p>
            <p className="mt-0.5 text-xs text-stone-400">Add to your home screen for quick access and offline support.</p>
          </div>
          <button
            onClick={dismissInstall}
            className="text-stone-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white hover:bg-secondary-600 transition-colors"
          >
            Install
          </button>
          <button
            onClick={dismissInstall}
            className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-stone-300 hover:bg-stone-700 transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
