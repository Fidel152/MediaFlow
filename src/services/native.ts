/**
 * Native Android & Web Bridge for MediaFlow
 * Provides seamless integration with Android features (Capacitor & Web APIs)
 */

export async function copyFromClipboard(): Promise<string> {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
  } catch (err) {
    console.warn('Clipboard read failed or permission denied', err);
  }
  return '';
}

export async function shareMediaContent(title: string, text: string, url?: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: url || window.location.href,
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Share failed', err);
      }
      return false;
    }
  } else if (navigator.clipboard) {
    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url || text);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function triggerHapticFeedback(): void {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  } catch {
    // Ignored in unsupported browsers
  }
}

export function triggerNotification(title: string, body: string): void {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    }
  } catch {
    // Ignored
  }
}
