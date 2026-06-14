type AudioContextConstructor = typeof AudioContext;

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: AudioContextConstructor;
}

/**
 * Returns the browser AudioContext constructor, including the legacy
 * webkit-prefixed fallback used by older Safari versions.
 */
export function getAudioContextClass(): AudioContextConstructor | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
}
