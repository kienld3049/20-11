import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import { MUSIC_OPTIONS, MusicTheme, TeacherCard } from '../types/card';
import { teacherMusic } from '../lib/teacherMusic';
import { downloadKeepsakeCard } from '../lib/cardUtils';
import { PetalCanvas } from './PetalCanvas';
import { PetalBurstCanvas } from './PetalBurstCanvas';
import { EnvelopeReveal } from './EnvelopeReveal';
import {
  BotanicalCornerArtwork,
  OpenBookPenIcon,
  PaperSvgFilters,
  ViewportCornerBotanicals,
} from './BotanicalIllustrations';

interface CardViewerProps {
  card: TeacherCard;
  isPreview?: boolean;
  embedded?: boolean;
  onExitPreview?: () => void;
  onNavigateHome?: () => void;
}

const MiniAudioWave: React.FC<{ playing: boolean }> = ({ playing }) => (
  <span className="inline-flex items-end gap-[2px] h-3.5 px-0.5" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <span
        key={i}
        className={`audio-bar ${
          playing
            ? 'bg-[#F59E0B] audio-bar-playing'
            : 'bg-[#0F4C5C]/45'
        }`}
        style={{
          animationDelay: playing ? `${i * 0.16}s` : '0s',
          transform: playing ? undefined : `scaleY(${[0.38, 0.72, 0.52, 0.62][i]})`,
        }}
      />
    ))}
  </span>
);

export const CardViewer: React.FC<CardViewerProps> = ({
  card,
  isPreview = false,
  embedded = false,
  onExitPreview,
  onNavigateHome,
}) => {
  const [envelopeOpen, setEnvelopeOpen] = useState<boolean>(embedded);
  const [cardEntered, setCardEntered] = useState<boolean>(embedded);
  const [isFlipped, setIsFlipped] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [activeMusicTheme, setActiveMusicTheme] = useState<MusicTheme>(card.musicTheme);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // 60fps 3D Tilt refs (direct DOM transform outside React render loop)
  const tiltShellRef = useRef<HTMLDivElement | null>(null);
  const tiltFrameRef = useRef<number | null>(null);
  const targetTiltRef = useRef({ rx: 0, ry: 0 });
  const currentTiltRef = useRef({ rx: 0, ry: 0 });

  const SYNTH_THEMES: MusicTheme[] = [
    'bui-phan',
    'nguoi-thay',
    'mong-uoc-ky-niem-xua',
    'nho-on-thay-co',
    'canon-in-d',
  ];

  const shortTrackName: Record<MusicTheme, string> = {
    'bui-phan': 'Bụi Phấn',
    'nguoi-thay': 'Người Thầy',
    'mong-uoc-ky-niem-xua': 'Mong Ước Kỷ Niệm Xưa',
    'nho-on-thay-co': 'Nhớ Ơn Thầy Cô',
    'canon-in-d': 'Canon in D',
    custom: 'Nhạc riêng',
    none: 'Tắt nhạc',
  };

  useEffect(() => {
    setActiveMusicTheme(card.musicTheme);
  }, [card.musicTheme]);

  const musicMeta = MUSIC_OPTIONS.find((m) => m.id === activeMusicTheme);

  useEffect(() => {
    setPortraitFailed(false);
  }, [card.id, card.photoData]);

  useEffect(() => {
    return () => {
      if (!embedded) {
        teacherMusic.stop();
      }
    };
  }, [embedded]);

  // Smooth 60fps lerp tilt loop + mobile DeviceOrientation support
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let active = true;
    const step = () => {
      if (!active) return;
      const cur = currentTiltRef.current;
      const tgt = targetTiltRef.current;

      cur.rx += (tgt.rx - cur.rx) * 0.14;
      cur.ry += (tgt.ry - cur.ry) * 0.14;

      if (tiltShellRef.current) {
        const nearZero =
          Math.abs(cur.rx) < 0.02 &&
          Math.abs(cur.ry) < 0.02 &&
          tgt.rx === 0 &&
          tgt.ry === 0;
        tiltShellRef.current.style.transform = nearZero
          ? 'rotateX(0deg) rotateY(0deg)'
          : `rotateX(${cur.rx.toFixed(2)}deg) rotateY(${cur.ry.toFixed(2)}deg)`;
      }

      tiltFrameRef.current = requestAnimationFrame(step);
    };

    tiltFrameRef.current = requestAnimationFrame(step);

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      const ry = Math.max(-4.5, Math.min(4.5, (e.gamma / 30) * 4.5));
      const rx = Math.max(-4.5, Math.min(4.5, ((e.beta - 45) / 30) * -4.5));
      targetTiltRef.current = { rx, ry };
    };

    window.addEventListener('deviceorientation', handleDeviceOrientation, {
      passive: true,
    });

    return () => {
      active = false;
      if (tiltFrameRef.current) cancelAnimationFrame(tiltFrameRef.current);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  const handlePointerTilt = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    targetTiltRef.current = {
      rx: Math.max(-4.8, Math.min(4.8, -ny * 4.8)),
      ry: Math.max(-4.8, Math.min(4.8, nx * 4.8)),
    };
  }, []);

  const handleResetTilt = useCallback(() => {
    targetTiltRef.current = { rx: 0, ry: 0 };
  }, []);

  const effectiveCard = card;

  const handleEnvelopeBreakStart = () => {
    if (activeMusicTheme !== 'none' && !teacherMusic.getIsPlaying()) {
      teacherMusic.start(activeMusicTheme, card.customAudioUrl);
      setIsMusicPlaying(true);
    }
  };

  const handleEnvelopeOpened = () => {
    setEnvelopeOpen(true);
    requestAnimationFrame(() => setCardEntered(true));
    if (activeMusicTheme !== 'none' && !teacherMusic.getIsPlaying()) {
      teacherMusic.start(activeMusicTheme, card.customAudioUrl);
      setIsMusicPlaying(true);
    }
  };

  const handleOpenFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setBurstKey((k) => k + 1);
    }
    if (activeMusicTheme !== 'none' && !teacherMusic.getIsPlaying()) {
      teacherMusic.start(activeMusicTheme, card.customAudioUrl);
      setIsMusicPlaying(true);
    }
  };

  const handleFlipBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
  };

  const handleToggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeMusicTheme === 'none') return;
    if (isMusicPlaying) {
      teacherMusic.stop();
      setIsMusicPlaying(false);
    } else {
      teacherMusic.start(activeMusicTheme, card.customAudioUrl);
      setIsMusicPlaying(true);
    }
  };

  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeMusicTheme === 'none' || activeMusicTheme === 'custom') return;
    const idx = SYNTH_THEMES.indexOf(activeMusicTheme);
    const nextTheme = SYNTH_THEMES[(idx + 1) % SYNTH_THEMES.length];
    setActiveMusicTheme(nextTheme);
    teacherMusic.start(nextTheme, card.customAudioUrl);
    setIsMusicPlaying(true);
  };

  const handleDownloadKeepsake = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      await downloadKeepsakeCard(effectiveCard);
    } finally {
      setIsDownloading(false);
    }
  };

  const paragraphs = effectiveCard.message
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const showPortrait = Boolean(effectiveCard.photoData?.trim()) && !portraitFailed;

  const cardContent = (
    <div
      className={`w-full max-w-[540px] mx-auto perspective-1600 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        cardEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      onPointerMove={handlePointerTilt}
      onPointerLeave={handleResetTilt}
    >
      {/* 60fps 3D Tilt Wrapper */}
      <div
        ref={tiltShellRef}
        className="w-full preserve-3d will-change-transform"
        style={{ transform: 'rotateX(0deg) rotateY(0deg)' }}
      >
        <div
          className={`relative w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] preserve-3d ${
            isFlipped ? 'rotate-y-180 card-is-flipped' : ''
          }`}
          style={{ minHeight: '680px' }}
        >
          {/* ================= FRONT FACE: BOTANICAL & HANDMADE PAPER ================= */}
          <div
            role="button"
            tabIndex={isFlipped ? -1 : 0}
            aria-hidden={isFlipped}
            aria-label="Chạm để mở lời chúc 20/11"
            onClick={() => !isFlipped && handleOpenFlip()}
            onKeyDown={(e) => {
              if (!isFlipped && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleOpenFlip();
              }
            }}
            style={{ transform: 'rotateY(0deg)' }}
            className={`absolute inset-0 backface-hidden select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B57] ${
              isFlipped ? 'pointer-events-none z-0' : 'pointer-events-auto cursor-pointer z-20'
            }`}
          >
            {/* Natural Deckle-Edge Paper Base */}
            <div className="absolute inset-0 cotton-deckle-layer rounded-sm pointer-events-none" />

            {/* Main Cotton Paper Layer */}
            <div className="relative h-full w-full cotton-paper-surface rounded-sm overflow-hidden flex flex-col justify-between px-7 sm:px-11 pt-9 pb-8">
              {/* SVG Cotton Paper Grain Overlay */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none opacity-65 mix-blend-multiply"
                style={{ filter: 'url(#cotton-paper-noise)' }}
              />

              {/* Fine Botanical Double Gold Hairline Border & Corner Flourishes */}
              <div
                aria-hidden="true"
                className="absolute inset-4 sm:inset-5 border border-[#C59B57]/38 pointer-events-none"
              >
                <div className="absolute inset-[5px] border border-[#D4AF37]/20" />
                <span className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]/75" />
                <span className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]/75" />
                <span className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]/75" />
                <span className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]/75" />
              </div>

              {/* Delicate Top-Right Eucalyptus & Gold Bud Accent */}
              <svg
                viewBox="0 0 140 120"
                fill="none"
                aria-hidden="true"
                className="absolute top-0 right-0 w-28 sm:w-36 h-auto pointer-events-none z-0 opacity-55"
              >
                <path d="M138 14 C108 26 84 48 64 78" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" />
                <ellipse cx="104" cy="24" rx="7" ry="12" transform="rotate(-62 104 24)" fill="#10B981" fillOpacity="0.32" stroke="#047857" strokeWidth="0.75" />
                <ellipse cx="86" cy="48" rx="6.5" ry="11" transform="rotate(-38 86 48)" fill="#34D399" fillOpacity="0.34" stroke="#047857" strokeWidth="0.75" />
                <ellipse cx="116" cy="44" rx="6" ry="10.5" transform="rotate(-84 116 44)" fill="#10B981" fillOpacity="0.28" stroke="#047857" strokeWidth="0.7" />
                <circle cx="64" cy="78" r="3.5" fill="#F59E0B" fillOpacity="0.7" />
                <circle cx="72" cy="68" r="2.2" fill="#FB7185" fillOpacity="0.7" />
              </svg>

              {/* Top Center Line-Art Icon: Open Book & Fountain Pen */}
              <div className="relative z-10 flex flex-col items-center pt-1">
                <OpenBookPenIcon className="w-28 h-16 sm:w-32 sm:h-[74px]" />
              </div>

            {/* Center Editorial Typography Block (Strictly clear of corner botanicals) */}
            <div className="relative z-10 flex flex-col items-center text-center my-auto pb-10 sm:pb-12">
              <div className="inline-flex items-center gap-2.5 mb-2">
                <span className="w-6 h-px bg-[#059669]/45" aria-hidden="true" />
                <p className="font-serif uppercase text-[11px] sm:text-xs tracking-[0.24em] text-[#059669] font-semibold">
                  CHÚC MỪNG NGÀY
                </p>
                <span className="w-6 h-px bg-[#059669]/45" aria-hidden="true" />
              </div>

              <h1 className="font-display font-semibold uppercase text-2xl sm:text-[30px] tracking-[0.1em] text-[#0F4C5C] leading-tight mb-3">
                NHÀ GIÁO VIỆT NAM
              </h1>

              {/* Clean Editorial 20/11 Typography directly on White Cotton Paper */}
              <div className="relative inline-flex items-center justify-center my-1">
                <span className="font-display font-bold text-[62px] sm:text-[78px] leading-none tracking-tight text-[#0F4C5C] tabular-nums">
                  20
                  <span className="text-[#0F4C5C] font-normal mx-1.5">/</span>
                  11
                </span>
              </div>

              <p className="font-display italic font-semibold text-[30px] sm:text-[38px] text-[#D97706] mt-2 leading-tight tracking-tight">
                Tri ân Thầy Cô
              </p>

              <p className="font-serif italic font-medium text-[15px] sm:text-[17px] text-[#0F4C5C]/80 mt-2 max-w-xs leading-relaxed tracking-[0.02em]">
                “Biết ơn những người đưa đò thầm lặng”
              </p>

              {/* Subtle Recipient Dedication + Open Action */}
              <div className="mt-6 flex flex-col items-center gap-3">
                {effectiveCard.teacherName && (
                  <p className="font-serif italic text-[17px] text-[#0F4C5C]/90">
                    {effectiveCard.honorific}{' '}
                    <span className="font-display not-italic font-semibold text-[#0F4C5C]">
                      {effectiveCard.teacherName}
                    </span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenFlip();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0F4C5C] hover:bg-[#0B3945] text-white text-xs font-medium tracking-[0.12em] uppercase transition-colors shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FDE68A]" />
                  <span>Mở lời chúc</span>
                </button>
              </div>
            </div>

              {/* Bottom-Left & Bottom Edge Watercolor Chrysanthemum & Sage Eucalyptus */}
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 pointer-events-none z-0 overflow-hidden"
              >
                <BotanicalCornerArtwork className="w-[88%] max-w-[410px] h-auto -ml-2 -mb-2" />
              </div>

              <div className="relative z-10 h-6" aria-hidden="true" />
            </div>
          </div>

          {/* ================= BACK FACE: PERSONALIZED TRIBUTE LETTER ================= */}
          <div
            aria-hidden={!isFlipped}
            className={`relative w-full h-full min-h-[680px] backface-hidden rotate-y-180 ${
              isFlipped ? 'pointer-events-auto z-20' : 'pointer-events-none z-0'
            }`}
          >
            {/* Natural Deckle-Edge Paper Base */}
            <div className="absolute inset-0 cotton-deckle-layer rounded-sm pointer-events-none" />

            <div className="relative h-full min-h-[680px] w-full cotton-paper-surface rounded-sm overflow-hidden flex flex-col justify-between px-6 sm:px-10 py-8 sm:py-9">
              {/* SVG Cotton Paper Grain Overlay */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none opacity-60 mix-blend-multiply"
                style={{ filter: 'url(#cotton-paper-noise)' }}
              />

              {/* Fine Gold Hairline Border & Corner Flourishes */}
              <div
                aria-hidden="true"
                className="absolute inset-3.5 sm:inset-4 border border-[#C59B57]/35 pointer-events-none"
              >
                <div className="absolute inset-[4px] border border-[#D4AF37]/18" />
                <span className="absolute -top-px -left-px w-3.5 h-3.5 border-t-2 border-l-2 border-[#D4AF37]/70" />
                <span className="absolute -top-px -right-px w-3.5 h-3.5 border-t-2 border-r-2 border-[#D4AF37]/70" />
                <span className="absolute -bottom-px -left-px w-3.5 h-3.5 border-b-2 border-l-2 border-[#D4AF37]/70" />
                <span className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b-2 border-r-2 border-[#D4AF37]/70" />
              </div>

              {/* Top Utility Bar inside Card */}
              <div className="relative z-30 flex items-center justify-between gap-2 pb-4 border-b border-[#F59E0B]/25">
                <button
                  type="button"
                  onClick={handleFlipBack}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#059669] hover:text-[#0F4C5C] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mặt trước</span>
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">

                  {activeMusicTheme !== 'none' && (
                    <div className="inline-flex items-center border border-[#F59E0B]/45 bg-white/80">
                      <button
                        type="button"
                        onClick={handleToggleMusic}
                        title={musicMeta?.title || 'Nhạc nền'}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-[#0F4C5C] hover:bg-[#FEF3C7]/60 transition-colors cursor-pointer"
                      >
                        <MiniAudioWave playing={isMusicPlaying} />
                        <span className="hidden sm:inline">
                          {isMusicPlaying ? shortTrackName[activeMusicTheme] : 'Nghe nhạc'}
                        </span>
                      </button>
                      {activeMusicTheme !== 'custom' && (
                        <button
                          type="button"
                          onClick={handleNextTrack}
                          title="Đổi bài hát khác"
                          aria-label="Đổi bài hát khác"
                          className="px-1.5 py-1 border-l border-[#F59E0B]/35 text-[#0F4C5C]/80 hover:text-[#D97706] hover:bg-[#FEF3C7]/60 transition-colors cursor-pointer"
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleDownloadKeepsake}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#F59E0B]/50 text-[#0F4C5C] transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>{isDownloading ? 'Đang lưu...' : 'Lưu ảnh'}</span>
                  </button>
                </div>
              </div>

              {/* Center Tribute Content: Staggered Fade-Up (0.8s) */}
              <div className="relative z-10 flex-1 flex flex-col justify-center py-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-5">
                  {showPortrait && (
                    <div
                      className="flex flex-col items-center gap-1.5 shrink-0 inner-reveal-item"
                      style={{ transitionDelay: '220ms' }}
                    >
                      <div className="w-24 h-32 sm:w-28 sm:h-36 p-1 border border-[#F59E0B]/55 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                        <img
                          src={effectiveCard.photoData}
                          alt={`${effectiveCard.honorific} ${effectiveCard.teacherName}`}
                          referrerPolicy="no-referrer"
                          onError={() => setPortraitFailed(true)}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className={`inner-reveal-item ${
                      showPortrait
                        ? 'text-center sm:text-left'
                        : 'text-center w-full'
                    }`}
                    style={{ transitionDelay: '340ms' }}
                  >
                    <p className="font-serif uppercase text-[11px] tracking-[0.24em] text-[#059669] font-semibold mb-1.5">
                      {card.yearLabel} · Tri Ân Thầy Cô
                    </p>
                    <p className="font-display italic font-semibold text-[18px] sm:text-[21px] tracking-[0.04em] text-[#B45309] leading-snug mb-0.5">
                      {effectiveCard.honorific}
                    </p>
                    <h2 className="font-display font-semibold text-2xl sm:text-[30px] tracking-tight text-[#0F4C5C] mt-0.5 text-balance">
                      {effectiveCard.teacherName}
                    </h2>
                    {card.roleOrSubject && (
                      <p className="font-serif italic text-sm text-[#0F4C5C]/75 mt-1">
                        {card.roleOrSubject}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className="h-px w-24 mx-auto bg-[#F59E0B]/45 mb-5 inner-reveal-item"
                  style={{ transitionDelay: '430ms' }}
                />

                <div className="space-y-3 font-serif font-medium text-[18px] sm:text-[19px] leading-[1.8] text-[#0F4C5C] max-w-prose mx-auto">
                  {paragraphs.map((p, idx) => (
                    <p
                      key={idx}
                      style={{ transitionDelay: `${500 + idx * 140}ms` }}
                      className={`inner-reveal-item ${
                        idx === 0
                          ? 'first-letter:text-[44px] first-letter:font-display first-letter:italic first-letter:font-bold first-letter:text-[#D97706] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.8]'
                          : ''
                      }`}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              {/* Bottom Signature */}
              <div
                className="relative z-10 pt-4 border-t border-[#F59E0B]/25 flex items-end justify-end gap-4 inner-reveal-item"
                style={{ transitionDelay: `${540 + paragraphs.length * 140}ms` }}
              >
                <div className="text-right">
                  <p className="font-display italic font-semibold text-[16px] sm:text-[18px] tracking-[0.04em] text-[#B45309] leading-snug mb-1">
                    Kính chúc,
                  </p>
                  <p className="font-display italic font-semibold text-base sm:text-lg text-[#0F4C5C]">
                    {effectiveCard.senderName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <>
        <PaperSvgFilters />
        <PetalBurstCanvas burstKey={burstKey} />
        {cardContent}
      </>
    );
  }

  return (
    <div className="relative min-h-screen linen-sunlight-bg text-[#0F4C5C] overflow-hidden flex flex-col">
      <PaperSvgFilters />
      <ViewportCornerBotanicals />
      <PetalCanvas active={true} />
      <PetalBurstCanvas burstKey={burstKey} />

      {/* Envelope & Wax Seal Opening Reveal for direct link recipients */}
      {!envelopeOpen && (
        <EnvelopeReveal
          card={effectiveCard}
          onBreakStart={handleEnvelopeBreakStart}
          onOpen={handleEnvelopeOpened}
        />
      )}

      {/* Minimal Top Bar for standalone / public ?card= view */}
      <header className="relative z-30 border-b border-[#F59E0B]/25 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
          {isPreview && onExitPreview ? (
            <button
              type="button"
              onClick={() => {
                teacherMusic.stop();
                onExitPreview();
              }}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#0F4C5C] hover:text-[#D97706] transition-colors whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Studio</span>
            </button>
          ) : (
              <button
              type="button"
              onClick={onNavigateHome}
              className="font-serif font-semibold text-base tracking-wide text-[#0F4C5C] hover:text-[#D97706] transition-colors whitespace-nowrap cursor-pointer"
            >
              Tri Ân 20/11
            </button>
          )}

          <div className="flex items-center gap-2">
            {activeMusicTheme !== 'none' && (
              <div className="inline-flex items-center border border-[#F59E0B]/45 bg-white">
                <button
                  type="button"
                  onClick={handleToggleMusic}
                  title={musicMeta?.title || 'Nhạc nền'}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium hover:bg-[#FEF3C7]/60 text-[#0F4C5C] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <MiniAudioWave playing={isMusicPlaying} />
                  <span>{isMusicPlaying ? shortTrackName[activeMusicTheme] : 'Nghe nhạc'}</span>
                </button>
                {activeMusicTheme !== 'custom' && (
                  <button
                    type="button"
                    onClick={handleNextTrack}
                    title="Đổi bài hát khác"
                    aria-label="Đổi bài hát khác"
                    className="px-2 py-1.5 border-l border-[#F59E0B]/35 text-[#0F4C5C]/80 hover:text-[#D97706] hover:bg-[#FEF3C7]/60 transition-colors cursor-pointer"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Centered Botanical Card Stage */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
        {cardContent}
      </main>
    </div>
  );
};
