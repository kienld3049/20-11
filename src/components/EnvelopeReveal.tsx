import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { TeacherCard } from '../types/card';
import { ViewportCornerBotanicals } from './BotanicalIllustrations';

interface EnvelopeRevealProps {
  card: Pick<TeacherCard, 'honorific' | 'teacherName' | 'roleOrSubject' | 'senderName'>;
  onOpen: () => void;
}

export const EnvelopeReveal: React.FC<EnvelopeRevealProps> = ({
  card,
  onOpen,
}) => {
  const [stage, setStage] = useState<'idle' | 'opening' | 'done'>('idle');

  const handleBreakSeal = () => {
    if (stage !== 'idle') return;
    setStage('opening');
    window.setTimeout(() => {
      setStage('done');
      onOpen();
    }, 950);
  };

  if (stage === 'done') return null;

  const isOpening = stage === 'opening';

  return (
    <div
      className={`fixed inset-0 z-50 linen-sunlight-bg flex flex-col items-center justify-center px-4 py-8 transition-opacity duration-500 ${
        isOpening ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ transitionDelay: isOpening ? '550ms' : '0ms' }}
    >
      <ViewportCornerBotanicals />

      <div className="relative z-10 w-full max-w-[490px] flex flex-col items-center">
        {/* Artisan Luxury Botanical Envelope */}
        <div className="relative w-full aspect-[1.38/1] min-h-[310px] sm:min-h-[348px] perspective-1600">
          {/* Emerging Inner Cotton Card Preview sliding upward on open */}
          <div
            className={`absolute inset-x-5 top-4 bottom-4 bg-white border border-[#D4AF37]/60 shadow-[0_18px_40px_-10px_rgba(15,76,92,0.22)] flex flex-col items-center justify-center px-6 text-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpening ? '-translate-y-24 scale-[1.03]' : 'translate-y-0'
            }`}
          >
            <div className="absolute inset-2.5 border border-[#D4AF37]/30 pointer-events-none" />
            <span className="font-serif uppercase text-[10px] tracking-[0.22em] text-[#059669] font-semibold">
              Chúc mừng Ngày Nhà giáo Việt Nam
            </span>
            <span className="font-display font-bold text-3xl sm:text-4xl text-[#0F4C5C] mt-1.5 tabular-nums">
              20<span className="text-[#0F4C5C] font-normal mx-0.5">/</span>11
            </span>
            <span className="font-display italic font-semibold text-xl text-[#D97706] mt-1">
              Tri ân Thầy Cô
            </span>
          </div>

          {/* Envelope Outer Shell & Paper Craft Folds */}
          <div
            className="absolute inset-0 rounded-[4px] bg-[#FFFDF8] border border-[#D4AF37]/55 shadow-[0_38px_82px_-16px_rgba(15,76,92,0.28),0_14px_32px_-10px_rgba(180,120,20,0.18)] overflow-hidden"
            style={{
              backgroundImage:
                'radial-gradient(at 22% 18%, rgba(255,255,255,0.92) 0%, rgba(254,243,199,0.28) 65%, transparent 100%)',
            }}
          >
            {/* Subtle Cotton Paper Grain */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-55 mix-blend-multiply"
              style={{ filter: 'url(#cotton-paper-noise)' }}
            />

            {/* Luxury Botanical Gold Liner visible inside upper pocket */}
            <svg
              viewBox="0 0 440 320"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="env-liner-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="50%" stopColor="#FEF3C7" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#ECFDF5" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id="env-pocket-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FFFDF7" />
                </linearGradient>
                <filter id="env-fold-shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="-2" stdDeviation="3.5" floodColor="#0F4C5C" floodOpacity="0.1" />
                </filter>
              </defs>

              {/* Inner Envelope Liner Backdrop */}
              <rect x="0" y="0" width="440" height="200" fill="url(#env-liner-grad)" />
              {/* Subtle Gold Botanical Line-Art on Liner */}
              <g opacity="0.28" stroke="#C59B57" strokeWidth="0.9" fill="none">
                <path d="M40 30 Q90 70 120 120" />
                <ellipse cx="70" cy="54" rx="7" ry="14" transform="rotate(-35 70 54)" />
                <ellipse cx="95" cy="82" rx="6" ry="12" transform="rotate(-25 95 82)" />
                <path d="M400 30 Q350 70 320 120" />
                <ellipse cx="370" cy="54" rx="7" ry="14" transform="rotate(35 370 54)" />
                <ellipse cx="345" cy="82" rx="6" ry="12" transform="rotate(25 345 82)" />
              </g>

              {/* Left & Right Side Flaps */}
              <polygon
                points="0,0 198,162 0,320"
                fill="#FFFDF8"
                stroke="#D4AF37"
                strokeOpacity="0.32"
                strokeWidth="1"
              />
              <polygon
                points="440,0 242,162 440,320"
                fill="#FFFDF8"
                stroke="#D4AF37"
                strokeOpacity="0.32"
                strokeWidth="1"
              />

              {/* Curved European Lower Pocket */}
              <path
                d="M0,320 L0,292 L182,154 Q220,126 258,154 L440,292 L440,320 Z"
                fill="url(#env-pocket-grad)"
                stroke="#D4AF37"
                strokeOpacity="0.45"
                strokeWidth="1.1"
                filter="url(#env-fold-shadow)"
              />
            </svg>

            {/* Fine Botanical Watercolor Accents on Envelope Lower Corners */}
            <svg
              viewBox="0 0 440 320"
              fill="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              {/* Bottom-left delicate eucalyptus & amber bloom */}
              <g opacity="0.88">
                <path d="M10 306 C38 282 54 252 62 214" stroke="#059669" strokeWidth="1.25" strokeLinecap="round" />
                <path d="M24 294 C54 286 82 288 106 298" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round" />
                <ellipse cx="42" cy="242" rx="7" ry="12" transform="rotate(-24 42 242)" fill="#10B981" fillOpacity="0.32" stroke="#059669" strokeWidth="0.75" />
                <ellipse cx="26" cy="264" rx="6.5" ry="11" transform="rotate(-48 26 264)" fill="#34D399" fillOpacity="0.34" stroke="#059669" strokeWidth="0.75" />
                <ellipse cx="76" cy="288" rx="8" ry="5.5" transform="rotate(14 76 288)" fill="#10B981" fillOpacity="0.3" stroke="#059669" strokeWidth="0.75" />
                <g transform="translate(46, 286)">
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <ellipse
                      key={deg}
                      cx="0"
                      cy="-12"
                      rx="3.4"
                      ry="9.5"
                      transform={`rotate(${deg})`}
                      fill="#F59E0B"
                      fillOpacity="0.46"
                      stroke="#D97706"
                      strokeWidth="0.5"
                    />
                  ))}
                  <circle cx="0" cy="0" r="4.8" fill="#D97706" fillOpacity="0.85" />
                  <circle cx="0" cy="0" r="2.2" fill="#FDE68A" />
                </g>
              </g>

              {/* Bottom-right companion coral bud & emerald leaves */}
              <g opacity="0.85">
                <path d="M430 306 C404 288 386 266 376 238" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" />
                <ellipse cx="394" cy="266" rx="6.5" ry="11" transform="rotate(28 394 266)" fill="#10B981" fillOpacity="0.3" stroke="#059669" strokeWidth="0.7" />
                <ellipse cx="412" cy="284" rx="7" ry="10.5" transform="rotate(52 412 284)" fill="#34D399" fillOpacity="0.34" stroke="#059669" strokeWidth="0.7" />
                <g transform="translate(396, 290)">
                  {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
                    <ellipse
                      key={deg}
                      cx="0"
                      cy="-10"
                      rx="3"
                      ry="8"
                      transform={`rotate(${deg})`}
                      fill="#FB7185"
                      fillOpacity="0.45"
                      stroke="#E11D48"
                      strokeWidth="0.45"
                    />
                  ))}
                  <circle cx="0" cy="0" r="4" fill="#F59E0B" fillOpacity="0.85" />
                </g>
              </g>
            </svg>

            {/* Delicate Gold-Trimmed Silk Belly Ribbon */}
            <div
              aria-hidden="true"
              className={`absolute inset-x-0 top-[47%] -translate-y-1/2 h-5 border-y border-[#FDE68A]/85 shadow-[0_2px_10px_rgba(15,76,92,0.16)] transition-opacity duration-400 ${
                isOpening ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                background:
                  'linear-gradient(90deg, rgba(15,76,92,0.88) 0%, rgba(16,110,115,0.92) 32%, rgba(20,128,122,0.94) 50%, rgba(16,110,115,0.92) 68%, rgba(15,76,92,0.88) 100%)',
              }}
            />

            {/* Recipient Luxury Vellum Nameplate on Lower Pocket */}
            <div
              className={`relative z-10 h-full flex flex-col justify-end items-center pb-5 sm:pb-6 px-8 transition-opacity duration-300 ${
                isOpening ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="bg-white/95 backdrop-blur-xs border border-[#D4AF37]/50 px-5 sm:px-7 py-2.5 shadow-[0_6px_18px_-6px_rgba(15,76,92,0.16)] text-center max-w-[82%] relative">
                <span className="absolute inset-1 border border-[#D4AF37]/25 pointer-events-none" />
                <p className="font-script text-[26px] sm:text-[30px] text-[#D97706] leading-none mb-1">
                  Kính gửi
                </p>
                <p className="font-display font-semibold text-lg sm:text-[22px] text-[#0F4C5C] leading-tight truncate">
                  {card.honorific} {card.teacherName}
                </p>
                {card.roleOrSubject && (
                  <p className="font-serif italic text-xs text-[#0F4C5C]/75 mt-0.5 truncate">
                    {card.roleOrSubject}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Top Curved Envelope Flap rotating open in 3D */}
          <div
            className="absolute inset-x-0 top-0 h-[55%] origin-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] preserve-3d pointer-events-none"
            style={{
              transform: isOpening ? 'rotateX(172deg)' : 'rotateX(0deg)',
              zIndex: isOpening ? 5 : 20,
            }}
          >
            <svg
              viewBox="0 0 440 176"
              preserveAspectRatio="none"
              className="w-full h-full drop-shadow-[0_8px_16px_rgba(15,76,92,0.16)]"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="env-top-flap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FFFBEB" />
                </linearGradient>
              </defs>
              <path
                d="M0,0 L440,0 L440,14 L256,154 Q220,180 184,154 L0,14 Z"
                fill="url(#env-top-flap)"
                stroke="#D4AF37"
                strokeOpacity="0.5"
                strokeWidth="1.2"
              />
              {/* Fine Gold Foil Inner Trim on Flap */}
              <path
                d="M14,8 L426,8 L250,144 Q220,166 190,144 Z"
                fill="none"
                stroke="#D4AF37"
                strokeOpacity="0.28"
                strokeWidth="0.9"
              />
            </svg>
          </div>

          {/* Botanical Eucalyptus Sprig Tucked Under Wax Seal */}
          <svg
            viewBox="0 0 120 120"
            fill="none"
            className={`absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 z-25 w-28 h-28 pointer-events-none transition-all duration-400 ${
              isOpening ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
            }`}
            aria-hidden="true"
          >
            <path d="M22 86 C42 66 64 46 98 28" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="42" cy="60" rx="6" ry="11" transform="rotate(-38 42 60)" fill="#10B981" fillOpacity="0.48" stroke="#047857" strokeWidth="0.8" />
            <ellipse cx="82" cy="40" rx="5.5" ry="10" transform="rotate(24 82 40)" fill="#34D399" fillOpacity="0.48" stroke="#047857" strokeWidth="0.8" />
            <ellipse cx="32" cy="78" rx="5" ry="9" transform="rotate(-62 32 78)" fill="#10B981" fillOpacity="0.4" stroke="#047857" strokeWidth="0.8" />
          </svg>

          {/* Interactive Organic Sculpted Gold Wax Seal "20·11" */}
          <button
            type="button"
            onClick={handleBreakSeal}
            aria-label="Chạm vào dấu sáp 20·11 để mở phong bì"
            className={`absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 z-30 w-[86px] h-[86px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
              isOpening
                ? 'scale-125 opacity-0 pointer-events-none'
                : 'wax-seal-btn hover:scale-105 active:scale-95'
            }`}
            style={{
              background:
                'radial-gradient(circle at 30% 28%, #FEF08A 0%, #F59E0B 34%, #C27803 70%, #78350F 100%)',
              border: '2px solid rgba(255, 255, 255, 0.78)',
            }}
          >
            <span className="w-[66px] h-[66px] rounded-full border border-[#FFFBEB]/70 flex flex-col items-center justify-center shadow-inner bg-radial from-white/10 to-transparent">
              <span className="font-display font-bold text-[16px] tracking-wider text-white drop-shadow-[0_1px_1.5px_rgba(70,45,10,0.75)]">
                20/11
              </span>
              <span className="text-[8px] uppercase tracking-[0.2em] text-[#FFFBEB] font-semibold mt-0.5">
                Tri ân
              </span>
            </span>
          </button>
        </div>

        {/* Open Action */}
        <div
          className={`mt-7 flex flex-col items-center gap-3 text-center transition-opacity duration-300 ${
            isOpening ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={handleBreakSeal}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0F4C5C] hover:bg-[#0B3945] text-white text-xs font-medium tracking-[0.14em] uppercase shadow-[0_10px_24px_-6px_rgba(15,76,92,0.4)] border border-[#D4AF37]/40 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FDE68A]" />
            <span>Mở phong bì tri ân</span>
          </button>
        </div>
      </div>
    </div>
  );
};
