import React, { useState } from 'react';
import {
  ArrowRight,
  Camera,
  CopyCheck,
  Download,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { SAMPLE_DEMO_CARD } from '../types/card';
import { CardViewer } from './CardViewer';
import { PetalCanvas } from './PetalCanvas';
import { ViewportCornerBotanicals } from './BotanicalIllustrations';

interface LandingShowcaseProps {
  isAuthenticated: boolean;
  isSigningIn: boolean;
  authError: string | null;
  onGoogleSignIn: () => Promise<void>;
  onPasscodeSignIn: (passcode: string) => Promise<boolean>;
  onEnterStudio: () => void;
}

export const LandingShowcase: React.FC<LandingShowcaseProps> = ({
  isAuthenticated,
  isSigningIn,
  authError,
  onGoogleSignIn,
  onPasscodeSignIn,
  onEnterStudio,
}) => {
  const [downloadedHtml, setDownloadedHtml] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleDownloadStandaloneHtml = () => {
    const link = document.createElement('a');
    link.href = '/thiep-20-11-botanical.html';
    link.download = 'thiep-20-11-botanical.html';
    link.click();
    setDownloadedHtml(true);
    window.setTimeout(() => setDownloadedHtml(false), 2500);
  };

  const handleSubmitPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!passcodeInput.trim()) {
      setLocalError('Vui lòng nhập mật khẩu Admin.');
      return;
    }
    const ok = await onPasscodeSignIn(passcodeInput.trim());
    if (ok) {
      setLoginModalOpen(false);
      setPasscodeInput('');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen linen-sunlight-bg text-[#0F4C5C] relative">
      <ViewportCornerBotanicals />
      <PetalCanvas active={true} />

      {/* Top Bar: 3-zone contract */}
      <header className="sticky top-0 z-40 border-b border-[#F59E0B]/30 bg-white/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#thiep-mau"
            className="font-serif font-semibold text-xl tracking-wide text-[#0F4C5C] whitespace-nowrap shrink-0"
          >
            Tri Ân 20 · 11
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-normal text-[#0F4C5C]/80">
            <a
              href="#thiep-mau"
              className="hover:text-[#D97706] transition-colors whitespace-nowrap shrink-0"
            >
              Thiệp mẫu
            </a>
            <a
              href="#quy-trinh"
              className="hover:text-[#D97706] transition-colors whitespace-nowrap shrink-0"
            >
              Quy trình Admin
            </a>
            <a
              href="#trien-khai"
              className="hover:text-[#D97706] transition-colors whitespace-nowrap shrink-0"
            >
              Xuất bản
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onEnterStudio}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium bg-[#0F4C5C] hover:bg-[#0B3945] text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Vào Studio Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setLocalError(null);
                  setLoginModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium bg-[#0F4C5C] hover:bg-[#0B3945] text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#FDE68A]" />
                <span>Đăng nhập Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Stage: Live Interactive Botanical & Handmade Paper Card */}
      <section id="thiep-mau" className="relative z-20 py-12 lg:py-16 border-b border-[#F59E0B]/25">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Editorial Intro & Actions */}
            <div className="lg:col-span-5 space-y-6">
              <p className="font-serif uppercase text-xs tracking-[0.22em] text-[#059669] font-semibold">
                Botanical &amp; Handmade Paper · 20/11
              </p>

              <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.16] text-[#0F4C5C] text-balance">
                Thiệp Tri Ân Thầy Cô{' '}
                <span className="italic font-semibold text-[#D97706]">
                  Giấy Cotton &amp; Hoa Lá Thủ Công
                </span>
              </h1>

              <p className="text-sm sm:text-base font-light text-[#0F4C5C]/85 leading-relaxed">
                Chạm vào thiệp hoặc bấm <strong>Mở lời chúc</strong> để lật 3D và xem lời tri ân
                trang trọng. Đăng nhập Admin để chụp ảnh chân dung, soạn lời chúc riêng và gửi link
                cho từng thầy cô.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={onEnterStudio}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F4C5C] hover:bg-[#0B3945] text-white text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Mở Studio Tạo Thiệp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalError(null);
                      setLoginModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F4C5C] hover:bg-[#0B3945] text-white text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-[#FDE68A]" />
                    <span>Đăng nhập Admin (Tạo Link)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownloadStandaloneHtml}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-[#FFFBEB] text-[#0F4C5C] border border-[#F59E0B]/55 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-[#D97706]" />
                  <span>{downloadedHtml ? 'Đã tải file HTML' : 'Tải 1 File HTML'}</span>
                </button>
              </div>
            </div>

            {/* Right: Live 3D-Flip Botanical Card */}
            <div className="lg:col-span-7">
              <CardViewer card={SAMPLE_DEMO_CARD} embedded />
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Admin Workflow */}
      <section id="quy-trinh" className="relative z-20 py-16 bg-white/75 backdrop-blur-xs border-b border-[#F59E0B]/25">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-10">
            <p className="font-serif uppercase text-xs tracking-[0.2em] text-[#059669] font-semibold mb-2">
              Hệ thống gửi thiệp cá nhân hóa
            </p>
            <h2 className="font-display text-3xl font-bold text-[#0F4C5C]">
              Chụp ảnh chân dung · Soạn lời chúc · Xuất link riêng
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <div className="bg-white border border-[#F59E0B]/35 p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-2xl font-bold text-[#F59E0B] tabular-nums">
                  01.
                </span>
                <Camera className="w-5 h-5 text-[#10B981]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#0F4C5C] mb-2">
                Chụp ảnh hoặc tải ảnh lên
              </h3>
              <p className="text-sm font-light text-[#0F4C5C]/80 leading-relaxed">
                Hỗ trợ chụp trực tiếp từ camera điện thoại/laptop hoặc chọn ảnh có sẵn, tự động cắt
                tỉ lệ 3:4 và nén gọn để hiển thị sắc nét.
              </p>
            </div>

            <div className="bg-white border border-[#F59E0B]/35 p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-2xl font-bold text-[#F59E0B] tabular-nums">
                  02.
                </span>
                <Sparkles className="w-5 h-5 text-[#10B981]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#0F4C5C] mb-2">
                Soạn lời chúc chân thành
              </h3>
              <p className="text-sm font-light text-[#0F4C5C]/80 leading-relaxed">
                Trong Studio Admin, bạn có thể chọn nhanh mẫu gợi ý hoặc tự viết tay lời chúc riêng
                mang đậm dấu ấn kỷ niệm gửi tới từng thầy cô.
              </p>
            </div>

            <div className="bg-white border border-[#F59E0B]/35 p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-2xl font-bold text-[#F59E0B] tabular-nums">
                  03.
                </span>
                <CopyCheck className="w-5 h-5 text-[#10B981]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#0F4C5C] mb-2">
                Copy link gửi qua Zalo
              </h3>
              <p className="text-sm font-light text-[#0F4C5C]/80 leading-relaxed">
                Đăng nhập Admin bằng mật khẩu hoặc Google để sinh link cá nhân hóa. Thầy cô mở link
                không cần đăng nhập vẫn xem được trọn vẹn thiệp 3D và nhạc nền.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Self-Hosting & Single HTML Export Section */}
      <section id="trien-khai" className="relative z-20 py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="bg-white border border-[#F59E0B]/40 p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-md">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#059669] font-semibold mb-2">
                <Globe className="w-4 h-4" />
                <span>Triển khai lên website riêng hoặc dùng file HTML độc lập</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#0F4C5C] mb-2">
                Linh hoạt nhúng hoặc triển khai toàn hệ thống
              </h2>
              <p className="text-sm font-light text-[#0F4C5C]/85 leading-relaxed">
                Bạn có thể tải tệp HTML độc lập để gửi hoặc mở trực tiếp, hoặc đăng nhập vào Studio
                Admin để lưu danh sách nhiều thầy cô, chụp ảnh chân dung, soạn lời chúc và copy
                link từng người.
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <a
                href="/thiep-20-11-botanical.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                <span>Mở bản 1-File HTML</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-20 border-t border-[#F59E0B]/25 bg-white/80 py-7 px-5 sm:px-8 text-center text-xs text-[#0F4C5C]/75">
        <span>Tri Ân Ngày Nhà Giáo Việt Nam 20/11 · Botanical &amp; Handmade Paper</span>
      </footer>

      {/* Admin Login Modal: Passcode + Google */}
      {loginModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0F4C5C]/55 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLoginModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white border border-[#F59E0B]/55 p-6 sm:p-8 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setLoginModalOpen(false)}
              aria-label="Đóng"
              className="absolute right-4 top-4 p-1 text-[#0F4C5C]/60 hover:text-[#0F4C5C] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#059669] text-xs uppercase tracking-[0.2em] font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Quyền Quản trị Studio</span>
            </div>

            <h2 className="font-display text-2xl font-bold text-[#0F4C5C] mb-1.5">
              Đăng nhập Admin 20/11
            </h2>
            <p className="text-xs text-[#0F4C5C]/75 mb-5 leading-relaxed">
              Nhập mật khẩu Admin để vào tạo thiệp, chụp ảnh chân dung và xuất link gửi từng thầy cô.
            </p>

            {displayError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-800">
                {displayError}
              </div>
            )}

            <form onSubmit={handleSubmitPasscode} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-passcode-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#0F4C5C]/80 mb-1.5"
                >
                  Mật khẩu Admin
                </label>
                <div className="relative">
                  <input
                    id="admin-passcode-input"
                    type={showPasscode ? 'text' : 'password'}
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="Nhập mật khẩu quản trị..."
                    autoFocus
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border border-[#F59E0B]/55 text-[#0F4C5C] focus:outline-none focus:border-[#10B981]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode((v) => !v)}
                    aria-label={showPasscode ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0F4C5C]/55 hover:text-[#0F4C5C] cursor-pointer"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0F4C5C] hover:bg-[#0B3B48] text-white text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSigningIn ? 'Đang xác thực...' : 'Vào Studio với Mật khẩu'}</span>
              </button>
            </form>

            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F59E0B]/35" />
              </div>
              <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider text-[#0F4C5C]/60">
                Hoặc
              </span>
            </div>

            <button
              type="button"
              disabled={isSigningIn}
              onClick={async () => {
                setLocalError(null);
                await onGoogleSignIn();
                setLoginModalOpen(false);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-[#FEF3C7]/60 border border-[#F59E0B]/55 text-[#0F4C5C] text-xs font-medium transition-colors disabled:opacity-60 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#AA7C32]" />
              <span>Đăng nhập bằng Google (Firebase)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
