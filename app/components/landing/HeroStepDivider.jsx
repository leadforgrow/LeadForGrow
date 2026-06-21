export default function HeroStepDivider() {
  return (
    <div className="relative w-full leading-[0]" aria-hidden>
      <svg
        className="block w-full h-[40px] sm:h-[48px]"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Green cap — center tab points DOWN into white (reference style) */}
        <path
          fill="#D2EDD0"
          d="M0 0 H1440 V32 H920 L860 44 H580 L520 32 H0 V0 Z"
        />
        {/* Edge line along the cutout */}
        <path
          d="M0 32 H520 L580 44 H860 L920 32 H1440"
          stroke="#A8CFA5"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
