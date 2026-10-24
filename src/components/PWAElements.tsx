import React, { useEffect, useState } from 'react';
import { Download, WifiOff, Share2, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowGuide(true);
          }
        }}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
        aria-label="Install Offline Desktop App"
      >
        <Download className="w-3.5 h-3.5 text-amber-400" />
        <span>{isIOS ? 'Install on iOS' : 'Install Desktop App'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 id="pwa-guide-title" className="text-base font-semibold text-white">
                Offline Desktop & Mobile Installation
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
                aria-label="Close installation guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Sankalp SSC CGL Command Center is pre-cached via Service Worker for 100% offline study access.
            </p>
            {isIOS ? (
              <div className="mt-4 space-y-2 text-xs text-slate-300 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <p className="flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>1. Tap the <strong>Share</strong> button in Safari toolbar.</span>
                </p>
                <p>2. Scroll down and select <strong>Add to Home Screen</strong>.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2 text-xs text-slate-300 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <p>1. Click the <strong>Install App</strong> icon in your browser address bar (Chrome / Edge / Brave).</p>
                <p>2. Or open this app in a standalone window to enable one-click desktop installation.</p>
              </div>
            )}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 text-xs font-medium bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineBanner: React.FC<{ simulateOffline: boolean }> = ({ simulateOffline }) => {
  const isOnline = useOnlineStatus();
  const effectiveOffline = !isOnline || simulateOffline;

  if (!effectiveOffline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-lg"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Study Mode Active — Using local cached syllabus & vaults</span>
    </div>
  );
};
