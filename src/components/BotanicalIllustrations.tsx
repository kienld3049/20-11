import React from 'react';

export const PaperSvgFilters: React.FC = () => (
  <svg width="0" height="0" className="hidden" aria-hidden="true">
    <defs>
      {/* Cotton paper subtle fiber noise */}
      <filter id="cotton-paper-noise" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.82"
          numOctaves="3"
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix type="saturate" values="0" in="noise" result="monoNoise" />
        <feComponentTransfer in="monoNoise" result="softNoise">
          <feFuncA type="linear" slope="0.048" />
        </feComponentTransfer>
      </filter>

      {/* Natural deckle-edge handmade torn paper silhouette */}
      <filter id="deckle-edge-filter" x="-4%" y="-4%" width="108%" height="108%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.032"
          numOctaves="3"
          seed="11"
          result="edgeNoise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="edgeNoise"
          scale="4.5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

export const OpenBookPenIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 74"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M60 59C51 54.5 34 53 19 56.5C16.8 57 15 55.4 15 53.1V20.8C15 19.1 16.2 17.7 17.9 17.3C33.5 13.8 50.5 15.8 60 21.5C69.5 15.8 86.5 13.8 102.1 17.3C103.8 17.7 105 19.1 105 20.8V53.1C105 55.4 103.2 57 101 56.5C86 53 69 54.5 60 59Z"
      stroke="#B58E4C"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M60 21.5V59" stroke="#B58E4C" strokeWidth="1.2" strokeLinecap="round" />
    <path
      d="M19 59.5C34.5 56.3 50.5 57.6 60 62C69.5 57.6 85.5 56.3 101 59.5"
      stroke="#C59B57"
      strokeOpacity="0.65"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M25 27C35 25.5 45 26 52 28.5M25 34C35 32.5 45 33 52 35.5M25 41C35 39.5 44 40 50 42"
      stroke="#C59B57"
      strokeOpacity="0.6"
      strokeWidth="0.95"
      strokeLinecap="round"
    />
    <path
      d="M95 27C85 25.5 75 26 68 28.5M95 34C85 32.5 75 33 68 35.5M95 41C85 39.5 76 40 70 42"
      stroke="#C59B57"
      strokeOpacity="0.6"
      strokeWidth="0.95"
      strokeLinecap="round"
    />
    <g transform="translate(65, 5) rotate(28)">
      <path
        d="M8 0L12.5 10.5L10.5 42C10.5 43.2 9.4 44 8 44C6.6 44 5.5 43.2 5.5 42L3.5 10.5L8 0Z"
        fill="#FFFFFF"
        stroke="#0F4C5C"
        strokeOpacity="0.65"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <path d="M8 0V11" stroke="#0F4C5C" strokeOpacity="0.65" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="1.1" fill="#F59E0B" />
      <path d="M4.2 17H11.8" stroke="#C59B57" strokeWidth="1" />
    </g>
  </svg>
);

export const BotanicalCornerArtwork: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 460 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Fresh Emerald / Jade Eucalyptus Stems (#10B981) */}
    <g opacity="0.82">
      <path
        d="M12 204C78 192 160 198 258 205C318 209 376 202 434 188"
        stroke="#059669"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
      <path
        d="M28 198C26 142 36 88 64 36"
        stroke="#059669"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M36 178C78 148 124 128 168 118"
        stroke="#10B981"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <ellipse cx="44" cy="64" rx="11" ry="18" transform="rotate(-24 44 64)" fill="#10B981" fillOpacity="0.34" stroke="#047857" strokeWidth="0.9" />
      <ellipse cx="26" cy="96" rx="10" ry="16" transform="rotate(-48 26 96)" fill="#34D399" fillOpacity="0.36" stroke="#047857" strokeWidth="0.85" />
      <ellipse cx="52" cy="108" rx="11" ry="17" transform="rotate(18 52 108)" fill="#10B981" fillOpacity="0.3" stroke="#047857" strokeWidth="0.85" />
      <ellipse cx="22" cy="136" rx="11" ry="18" transform="rotate(-55 22 136)" fill="#10B981" fillOpacity="0.36" stroke="#047857" strokeWidth="0.9" />
      <ellipse cx="96" cy="136" rx="9" ry="15" transform="rotate(42 96 136)" fill="#34D399" fillOpacity="0.34" stroke="#047857" strokeWidth="0.85" />
      <ellipse cx="136" cy="126" rx="9" ry="14" transform="rotate(64 136 126)" fill="#10B981" fillOpacity="0.32" stroke="#047857" strokeWidth="0.85" />
      <ellipse cx="166" cy="116" rx="7.5" ry="12" transform="rotate(75 166 116)" fill="#34D399" fillOpacity="0.38" stroke="#047857" strokeWidth="0.8" />
      <ellipse cx="212" cy="196" rx="13" ry="8.5" transform="rotate(-12 212 196)" fill="#10B981" fillOpacity="0.34" stroke="#047857" strokeWidth="0.85" />
      <ellipse cx="268" cy="202" rx="14" ry="8.5" transform="rotate(10 268 202)" fill="#34D399" fillOpacity="0.35" stroke="#047857" strokeWidth="0.85" />
      <ellipse cx="322" cy="198" rx="12" ry="8" transform="rotate(-16 322 198)" fill="#10B981" fillOpacity="0.3" stroke="#047857" strokeWidth="0.8" />
      <ellipse cx="378" cy="194" rx="12" ry="7.5" transform="rotate(14 378 194)" fill="#34D399" fillOpacity="0.32" stroke="#047857" strokeWidth="0.8" />
      <ellipse cx="422" cy="186" rx="10" ry="6.5" transform="rotate(-18 422 186)" fill="#10B981" fillOpacity="0.34" stroke="#047857" strokeWidth="0.8" />
    </g>

    {/* Vibrant Amber Chrysanthemum #1 (#F59E0B) */}
    <g transform="translate(68, 166)" opacity="0.92">
      {Array.from({ length: 16 }).map((_, idx) => (
        <ellipse
          key={`outer-${idx}`}
          cx="0"
          cy="-26"
          rx="6.2"
          ry="19"
          transform={`rotate(${idx * 22.5})`}
          fill="#F59E0B"
          fillOpacity="0.44"
          stroke="#D97706"
          strokeWidth="0.7"
          strokeOpacity="0.7"
        />
      ))}
      {Array.from({ length: 12 }).map((_, idx) => (
        <ellipse
          key={`inner-${idx}`}
          cx="0"
          cy="-16"
          rx="4.8"
          ry="13"
          transform={`rotate(${idx * 30 + 11})`}
          fill="#FBBF24"
          fillOpacity="0.58"
          stroke="#B45309"
          strokeWidth="0.65"
          strokeOpacity="0.65"
        />
      ))}
      <circle cx="0" cy="0" r="8.5" fill="#D97706" fillOpacity="0.8" />
      <circle cx="0" cy="0" r="4.5" fill="#FDE68A" fillOpacity="0.9" />
    </g>

    {/* Coral Rose Companion Bloom #2 (#FB7185) */}
    <g transform="translate(148, 186) scale(0.74)" opacity="0.9">
      {Array.from({ length: 14 }).map((_, idx) => (
        <ellipse
          key={`b2-outer-${idx}`}
          cx="0"
          cy="-24"
          rx="5.8"
          ry="17"
          transform={`rotate(${idx * (360 / 14)})`}
          fill="#FB7185"
          fillOpacity="0.44"
          stroke="#E11D48"
          strokeWidth="0.65"
          strokeOpacity="0.55"
        />
      ))}
      {Array.from({ length: 10 }).map((_, idx) => (
        <ellipse
          key={`b2-inner-${idx}`}
          cx="0"
          cy="-14"
          rx="4.5"
          ry="11"
          transform={`rotate(${idx * 36 + 15})`}
          fill="#FDA4AF"
          fillOpacity="0.6"
        />
      ))}
      <circle cx="0" cy="0" r="7.5" fill="#F59E0B" fillOpacity="0.82" />
    </g>

    {/* Small bright coral-gold bud on upper-left stem */}
    <g transform="translate(65, 36) rotate(18)" opacity="0.86">
      <path d="M0 6C-6 0 -5 -10 0 -13C5 -10 6 0 0 6Z" fill="#FB7185" fillOpacity="0.65" stroke="#E11D48" strokeWidth="0.75" />
      <path d="M-4 4C-6 8 -2 10 0 8C2 10 6 8 4 4" stroke="#059669" strokeWidth="1" strokeLinecap="round" />
    </g>
  </svg>
);

/* 4-Corner Soft Viewport Background Botanicals for Spatial Depth */
export const ViewportCornerBotanicals: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
    {/* Bottom-Left */}
    <div className="absolute -bottom-6 -left-6 w-64 sm:w-80 opacity-45">
      <BotanicalCornerArtwork className="w-full h-auto" />
    </div>
    {/* Top-Right (mirrored) */}
    <div className="absolute -top-6 -right-6 w-60 sm:w-72 opacity-40 rotate-180">
      <BotanicalCornerArtwork className="w-full h-auto" />
    </div>
    {/* Top-Left (vertical flip) */}
    <div className="absolute -top-6 -left-6 w-52 sm:w-64 opacity-30 -scale-y-100">
      <BotanicalCornerArtwork className="w-full h-auto" />
    </div>
    {/* Bottom-Right (horizontal flip) */}
    <div className="absolute -bottom-6 -right-6 w-56 sm:w-72 opacity-35 -scale-x-100">
      <BotanicalCornerArtwork className="w-full h-auto" />
    </div>
  </div>
);

export const GoldSparkleCluster: React.FC = () => (
  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 text-[#F59E0B] absolute -top-2 left-3 sparkle-twinkle"
      fill="currentColor"
    >
      <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
    </svg>
    <svg
      viewBox="0 0 24 24"
      className="w-3 h-3 text-[#C59B57] absolute top-2 right-1 sparkle-twinkle"
      style={{ animationDelay: '0.9s' }}
      fill="currentColor"
    >
      <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
    </svg>
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5 text-[#F59E0B] absolute -bottom-1 right-6 sparkle-twinkle"
      style={{ animationDelay: '1.7s' }}
      fill="currentColor"
    >
      <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
    </svg>
    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]/80 absolute top-1/2 -left-2" />
    <span className="w-1 h-1 rounded-full bg-[#10B981]/65 absolute bottom-2 left-8" />
    <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185]/70 absolute -top-1 right-10" />
  </div>
);
