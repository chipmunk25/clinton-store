'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator. userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    setIsIOS(isIOSDevice);

    // Don't show if already installed
    if (isInStandaloneMode) {
      return;
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // For iOS, show custom prompt after delay
    if (isIOSDevice && !isInStandaloneMode) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // For other browsers, listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt. prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto">
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Install Clinton Store</h3>
              {isIOS ?  (
                <p className="text-xs text-muted-foreground mt-1">
                  Tap <span className="inline-flex items-center"><svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L12 14M12 2L8 6M12 2L16 6M4 14V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V14"/></svg></span> then "Add to Home Screen"
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Add to your home screen for quick access
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {! isIOS && deferredPrompt && (
            <Button
              onClick={handleInstall}
              size="sm"
              className="w-full mt-3"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}