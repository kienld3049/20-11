import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Lock, Sparkles } from 'lucide-react';
import { SAMPLE_DEMO_CARD } from '../types/card';
import { CardViewer } from './CardViewer';
import { PetalCanvas } from './PetalCanvas';
import { OpenBookPenIcon, ViewportCornerBotanicals } from './BotanicalIllustrations';

interface LandingShowcaseProps {
  isAuthenticated: boolean;
  isSigningIn: boolean;
  authError: string | null;
  onPasscodeSignIn: (passcode: string) => Promise<boolean>;
  onEnterStudio: () => void;
}

export const LandingShowcase: React.FC<LandingShowcaseProps> = ({
  isAuthenticated,
  isSigningIn,
  authError,
  onPasscodeSignIn,
  onEnterStudio,
}) => {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSamplePreview, setShowSamplePreview] = useState(false);

  if (showSamplePreview) {
    return (
      <CardViewer
        card={SAMPLE_DEMO_CARD}
        isPreview
        onExitPreview={() => setShowSamplePreview(false)}
      />
    );
  }

  const handleSubmitPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!passcodeInput.trim()) {
      setLocalError('Vui lòng nhập mật khẩu Admin.');
      return;
    }
    const ok = await onPasscodeSignIn(passcodeInput.trim());
    if (ok) {
      setPasscodeInput('');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="relative min-h-screen linen-sunlight-bg text-[#0F4C5C] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <ViewportCornerBotanicals />
      <PetalCanvas active={true} />

      <div className="relative z-20 w-full max-w-md cotton-paper-surface border border-[#C59B57]/55 p-7 sm:p-9 shadow-2xl">
        {/* Corner gold hairlines */}
        <span className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D4AF37]/70 pointer-events-none" />
        <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D4AF37]/70 pointer-events-none" />
        <span className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D4AF37]/70 pointer-events-none" />
        <span className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D4AF37]/70 pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-6">
          <OpenBookPenIcon className="w-24 h-14 mb-2" />
          <div className="inline-flex items-center gap-1.5 text-[#059669] text-[11px] uppercase tracking-[0.22em] font-semibold mb-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Xác thực Quản trị · 20/11</span>
          </div>
          <h1 className="font-display text-2xl sm:text-[28px] font-bold text-[#0F4C5C] leading-tight">
            Studio Chỉnh Sửa Thiệp
          </h1>
          <p className="text-xs text-[#0F4C5C]/75 mt-1.5 leading-relaxed">
            Nhập mật khẩu quản trị để vào soạn lời chúc, tải ảnh chân dung và tạo đường dẫn gửi
            tặng từng Thầy/Cô.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={onEnterStudio}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0F4C5C] hover:bg-[#0B3B48] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#FDE68A]" />
              <span>Vào Studio Chỉnh Sửa</span>
            </button>
          </div>
        ) : (
          <>
            {displayError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed">
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
                    placeholder="Nhập mật khẩu để mở trang chỉnh sửa..."
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
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0F4C5C] hover:bg-[#0B3B48] text-white text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
              >
                <KeyRound className="w-4 h-4 text-[#FDE68A]" />
                <span>{isSigningIn ? 'Đang xác thực...' : 'Xác thực & Vào Trang Chỉnh Sửa'}</span>
              </button>
            </form>
          </>
        )}

        <div className="mt-6 pt-4 border-t border-[#F59E0B]/25 flex items-center justify-between gap-2 text-xs text-[#0F4C5C]/75">
          <button
            type="button"
            onClick={() => setShowSamplePreview(true)}
            className="inline-flex items-center gap-1.5 text-[#0F4C5C]/80 hover:text-[#D97706] font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Xem thử thiệp mẫu</span>
          </button>

          <a
            href="/thiep-20-11-botanical.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#059669] hover:text-[#0F4C5C] font-medium transition-colors"
          >
            Mở bản 1-File HTML
          </a>
        </div>
      </div>
    </div>
  );
};
