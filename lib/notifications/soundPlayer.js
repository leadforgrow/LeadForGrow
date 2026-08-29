/**
 * Web Audio API sound player — used for in-app notifications (new message,
 * new lead). Deliberately does NOT bundle any MP3 files: synthesised tones
 * work everywhere, keep the bundle size at zero, and never fail to load.
 *
 * Two guards worth knowing about:
 *
 * 1. Browsers block audio playback until the user has interacted with the
 *    page at least once (spec: "user activation"). The first sound we try
 *    to play after page load may silently fail. That's OK — visual cues
 *    (browser Notification, title flash) still fire, and subsequent sounds
 *    play after the first click / keypress.
 *
 * 2. `AudioContext` is expensive to construct. We create a single shared
 *    instance and reuse it, but recreate on demand if the browser suspended
 *    it (e.g. after being backgrounded for a long time).
 */

let ctx = null;

function getContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch { return null; }
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/**
 * Play a two-note chime. `notes` is an array of { freq (Hz), start (s),
 * duration (s), volume (0..1) }. Small ADSR envelope so it doesn't click.
 */
function playChime(notes, { totalDuration = 0.5 } = {}) {
  const ac = getContext();
  if (!ac) return;

  const now = ac.currentTime;
  for (const note of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = note.type || 'sine';
    osc.frequency.setValueAtTime(note.freq, now + note.start);

    // ADSR-lite: 20ms attack, hold, then linear release
    gain.gain.setValueAtTime(0, now + note.start);
    gain.gain.linearRampToValueAtTime(note.volume ?? 0.18, now + note.start + 0.02);
    gain.gain.linearRampToValueAtTime(0, now + note.start + note.duration);

    osc.start(now + note.start);
    osc.stop(now + note.start + note.duration + 0.05);
  }
}

/**
 * playMessageChime — WhatsApp-style two-note ding for incoming messages.
 * Ascending fifth (523 → 784 Hz), quick and light.
 */
export function playMessageChime() {
  playChime([
    { freq: 523.25, start: 0.00, duration: 0.12, type: 'sine' },
    { freq: 783.99, start: 0.08, duration: 0.20, type: 'sine' },
  ]);
}

/**
 * playLeadChime — softer, longer tone for new leads (they're more important
 * than a chat message so it deserves a distinct sound, not just a repeat).
 * Descending third with a hint of triangle wave for warmth.
 */
export function playLeadChime() {
  playChime([
    { freq: 659.25, start: 0.00, duration: 0.18, type: 'triangle', volume: 0.22 },
    { freq: 523.25, start: 0.16, duration: 0.28, type: 'triangle', volume: 0.20 },
  ]);
}

/**
 * playPaidChime — celebratory ascending arpeggio for a completed payment.
 * Approximates a cash-register "ka-ching" without needing an actual audio
 * sample — three ascending notes ending on a bright triangle wave.
 * Meant to be distinct + rewarding — this is the dopamine moment for the
 * shop owner: they got paid.
 */
export function playPaidChime() {
  playChime([
    { freq: 523.25, start: 0.00, duration: 0.10, type: 'triangle', volume: 0.22 }, // C5
    { freq: 659.25, start: 0.08, duration: 0.10, type: 'triangle', volume: 0.22 }, // E5
    { freq: 783.99, start: 0.16, duration: 0.14, type: 'triangle', volume: 0.24 }, // G5
    { freq: 1046.5, start: 0.24, duration: 0.32, type: 'triangle', volume: 0.26 }, // C6 (higher octave — celebration)
  ]);
}
