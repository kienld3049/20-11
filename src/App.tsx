import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, FileWarning } from 'lucide-react';
import { PasscodeAdminSession, TeacherCard } from './types/card';
import { OperationType, db, handleFirestoreError } from './lib/firebase';
import { isValidSlug } from './lib/cardUtils';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CardViewer } from './components/CardViewer';
import { LandingShowcase } from './components/LandingShowcase';
import { AdminStudio } from './components/AdminStudio';

const PASSCODE_STORAGE_KEY = 'trian_2011_admin_session';

function loadStoredPasscodeSession(): PasscodeAdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PASSCODE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PasscodeAdminSession;
    if (parsed?.mode === 'passcode' && typeof parsed.token === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function getCardSlugFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const paramCard = params.get('card') || params.get('to');
  if (paramCard?.trim()) return paramCard.trim();

  // Also support clean path like /card/<slug> if deployed with SPA fallback
  const match = window.location.pathname.match(/^\/card\/([a-zA-Z0-9_-]+)\/?$/);
  return match ? match[1] : null;
}

function AppContent() {
  const [cardSlug, setCardSlug] = useState<string | null>(() => getCardSlugFromUrl());
  const [publicCard, setPublicCard] = useState<TeacherCard | null>(null);
  const [loadingPublicCard, setLoadingPublicCard] = useState<boolean>(Boolean(cardSlug));
  const [publicCardNotFound, setPublicCardNotFound] = useState<boolean>(false);

  const [passcodeSession, setPasscodeSession] = useState<PasscodeAdminSession | null>(() =>
    loadStoredPasscodeSession()
  );
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync URL navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCardSlug(getCardSlugFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Verify stored passcode session against server on mount
  useEffect(() => {
    const stored = loadStoredPasscodeSession();
    if (!stored) return;
    fetch('/api/admin/session', {
      headers: { Authorization: `Bearer ${stored.token}` },
    })
      .then((res) => {
        if (!res.ok) {
          window.sessionStorage.removeItem(PASSCODE_STORAGE_KEY);
          setPasscodeSession(null);
        }
      })
      .catch(() => {
        // Keep current state cleanly if offline
      });
  }, []);

  // Fetch public card when ?card=<slug> is present (supports Express /api/cards & Firestore fallback)
  useEffect(() => {
    if (!cardSlug) {
      setPublicCard(null);
      setLoadingPublicCard(false);
      setPublicCardNotFound(false);
      return;
    }

    if (!isValidSlug(cardSlug)) {
      setPublicCard(null);
      setLoadingPublicCard(false);
      setPublicCardNotFound(true);
      return;
    }

    let active = true;
    setLoadingPublicCard(true);
    setPublicCardNotFound(false);

    const fetchCard = async () => {
      try {
        // 1. Check server card store first
        const apiRes = await fetch(`/api/cards/${encodeURIComponent(cardSlug)}`).catch(
          () => null
        );
        if (apiRes && apiRes.ok) {
          const payload = (await apiRes.json()) as { card?: TeacherCard };
          if (payload.card && active) {
            setPublicCard(payload.card);
            document.title = `${payload.card.honorific} ${payload.card.teacherName} — Thiệp Tri Ân 20/11`;
            setLoadingPublicCard(false);
            return;
          }
        }

        // 2. Fall back to Cloud Firestore if previously saved there
        const snap = await getDoc(doc(db, 'cards', cardSlug));
        if (!active) return;
        if (snap.exists()) {
          const data = snap.data() as Omit<TeacherCard, 'id'>;
          setPublicCard({ id: snap.id, ...data });
          document.title = `${data.honorific} ${data.teacherName} — Thiệp Tri Ân 20/11`;
        } else {
          setPublicCardNotFound(true);
        }
        setLoadingPublicCard(false);
      } catch (err) {
        if (!active) return;
        setLoadingPublicCard(false);
        handleFirestoreError(err, OperationType.GET, `cards/${cardSlug}`);
      }
    };

    void fetchCard();
    return () => {
      active = false;
    };
  }, [cardSlug]);

  const handleNavigateHome = () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.pathname = '/';
    window.history.pushState({}, '', url.toString());
    document.title = 'Thiệp Tri Ân 20/11 — Botanical & Handmade Paper';
    setCardSlug(null);
  };

  const handlePasscodeSignIn = async (passcode: string): Promise<boolean> => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        token?: string;
        displayName?: string;
        error?: string;
      };
      if (!res.ok || !data.token) {
        if (res.status === 404 || res.status === 405) {
          setAuthError(
            'Không tìm thấy API đăng nhập (/api/admin/login). Nếu tự host bản build, hãy chạy bằng npm start (node server.ts) thay vì host tĩnh.'
          );
        } else {
          setAuthError(data.error || 'Mật khẩu Admin chưa chính xác.');
        }
        return false;
      }

      const session: PasscodeAdminSession = {
        mode: 'passcode',
        token: data.token,
        displayName: data.displayName || 'Quản trị viên Thiệp 20/11',
      };
      window.sessionStorage.setItem(PASSCODE_STORAGE_KEY, JSON.stringify(session));
      setPasscodeSession(session);
      return true;
    } catch {
      setAuthError('Không thể kết nối máy chủ xác thực.');
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = () => {
    window.sessionStorage.removeItem(PASSCODE_STORAGE_KEY);
    setPasscodeSession(null);
  };

  // 1. Public Recipient Card View (?card=<slug>)
  if (cardSlug) {
    if (loadingPublicCard) {
      return (
        <div className="relative min-h-screen linen-sunlight-bg text-[#0F4C5C] flex flex-col items-center justify-center p-6 overflow-hidden">
          <div className="w-10 h-10 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif italic text-xl text-[#0F4C5C]">
            Đang chuẩn bị tấm thiệp tri ân...
          </p>
        </div>
      );
    }

    if (publicCardNotFound || !publicCard) {
      return (
        <div className="relative min-h-screen linen-sunlight-bg text-[#0F4C5C] flex items-center justify-center p-6 overflow-hidden">
          <div className="max-w-md w-full bg-white border border-[#F59E0B]/45 p-8 text-center shadow-2xl">
            <FileWarning className="w-10 h-10 text-[#F59E0B] mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-[#0F4C5C] mb-2">
              Không tìm thấy tấm thiệp này
            </h1>
            <p className="text-sm font-light text-[#0F4C5C]/80 leading-relaxed mb-6">
              Đường dẫn thiệp có thể đã được thay đổi hoặc chưa tồn tại. Vui lòng kiểm tra lại liên
              kết người gửi đã cung cấp.
            </p>
            <button
              type="button"
              onClick={handleNavigateHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F4C5C] hover:bg-[#0B3945] text-white text-sm font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về trang chủ</span>
            </button>
          </div>
        </div>
      );
    }

    return <CardViewer card={publicCard} onNavigateHome={handleNavigateHome} />;
  }

  // 2. Authenticated Admin Studio (Password only)
  if (passcodeSession) {
    return (
      <AdminStudio
        firebaseUser={null}
        passcodeSession={passcodeSession}
        onPasscodeExpired={() => {
          window.sessionStorage.removeItem(PASSCODE_STORAGE_KEY);
          setPasscodeSession(null);
        }}
        onSignOut={handleSignOut}
        onNavigateHome={() => undefined}
      />
    );
  }

  // 3. Direct Password Authentication Gate
  return (
    <LandingShowcase
      isAuthenticated={false}
      isSigningIn={isSigningIn}
      authError={authError}
      onPasscodeSignIn={handlePasscodeSignIn}
      onEnterStudio={() => undefined}
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
