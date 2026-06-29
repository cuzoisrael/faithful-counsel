import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const InstallPWA = () => {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("iacpd-install-dismissed")) { setDismissed(true); return; }
    const handler = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    // iOS Safari has no beforeinstallprompt — show manual hint
    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
    const inStandalone = (window.navigator as any).standalone || window.matchMedia("(display-mode: standalone)").matches;
    if (isIOS && !inStandalone) setIosHint(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => { sessionStorage.setItem("iacpd-install-dismissed", "1"); setDismissed(true); };

  if (dismissed || (!evt && !iosHint)) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-40 bg-card border border-border rounded-xl shadow-card p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
        <Download size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">Install IACPD on your device</p>
        {evt ? (
          <p className="text-xs text-muted-foreground mt-0.5">Get faster access and a home-screen icon — no app store needed.</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">Tap the Share icon in Safari, then “Add to Home Screen”.</p>
        )}
        {evt && (
          <button
            onClick={async () => { await evt.prompt(); await evt.userChoice; dismiss(); }}
            className="mt-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
          >
            Install app
          </button>
        )}
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
        <X size={16} />
      </button>
    </div>
  );
};

export default InstallPWA;
