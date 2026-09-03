/**
 * Custom "AI" badge icon — solid black rounded box with white "AI" text
 * and two gold sparkles (one large bottom-right, one small top-right).
 *
 * Self-contained inline SVG: no external asset, no licensing, no extra
 * network request. Uses a viewBox of 32×32 so it scales cleanly at any
 * Tailwind size class (h-4 through h-16 all look crisp).
 *
 * Palette is hardcoded (not currentColor) so it renders bright and
 * consistent regardless of parent background. If we ever want a
 * monochrome variant, add a `variant="mono"` prop and swap the fills.
 */
export default function AiBadgeIcon({ className = 'h-7 w-7' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="aiSparkGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FDE047" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Solid black rounded box */}
      <rect x="1" y="3" width="22" height="22" rx="5" fill="#0F172A" />

      {/* Centered "AI" — dominant-baseline:central lets us use the box's
          geometric center (14) instead of guessing baseline offsets. */}
      <text
        x="12"
        y="14"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="800"
        fill="white"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.5px' }}
      >
        AI
      </text>

      {/* Big 4-point sparkle bottom-right */}
      <path
        d="M25 17 L26.3 20.2 L29.5 21.5 L26.3 22.8 L25 26 L23.7 22.8 L20.5 21.5 L23.7 20.2 Z"
        fill="url(#aiSparkGrad)"
      />
      {/* Small accent sparkle top-right */}
      <path
        d="M27.5 6 L28.1 7.6 L29.8 8.2 L28.1 8.8 L27.5 10.4 L26.9 8.8 L25.2 8.2 L26.9 7.6 Z"
        fill="url(#aiSparkGrad)"
        opacity="0.85"
      />
    </svg>
  );
}
