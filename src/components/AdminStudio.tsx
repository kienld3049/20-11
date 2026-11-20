import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  Camera,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  ImagePlus,
  LogOut,
  MessageSquareText,
  Music2,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserPlus,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  ASSETS,
  AdminMember,
  CARD_LIMITS,
  HONORIFIC_PRESETS,
  LACQUER_STYLES,
  LacquerStyle,
  MUSIC_OPTIONS,
  MusicTheme,
  PasscodeAdminSession,
  TRIBUTE_TEMPLATES,
  TeacherCard,
  TeacherCardInput,
} from '../types/card';
import {
  OperationType,
  SUPER_ADMIN_EMAIL,
  db,
  handleFirestoreError,
} from '../lib/firebase';
import {
  buildShareLink,
  buildZaloShareText,
  compressPortraitImage,
  generateCardSlug,
  isValidSlug,
  slugifyVietnamese,
} from '../lib/cardUtils';
import { teacherMusic } from '../lib/teacherMusic';
import { CardViewer } from './CardViewer';
import { CameraCaptureModal } from './CameraCaptureModal';
import { ViewportCornerBotanicals } from './BotanicalIllustrations';

interface AdminStudioProps {
  firebaseUser: User | null;
  passcodeSession: PasscodeAdminSession | null;
  onPasscodeExpired: () => void;
  onSignOut: () => void;
  onNavigateHome: () => void;
}

const DEFAULT_FORM: TeacherCardInput = {
  honorific: 'Kính tặng Cô',
  teacherName: '',
  roleOrSubject: '',
  photoData: '',
  message: TRIBUTE_TEMPLATES[0].text,
  senderName: 'Tập thể lớp 12A1 — Niên khóa 2023–2026',
  yearLabel: '20 · 11 · 2026',
  musicTheme: 'bui-phan',
  customAudioUrl: '',
  lacquerStyle: 'imperial-gold',
};

export const AdminStudio: React.FC<AdminStudioProps> = ({
  firebaseUser,
  passcodeSession,
  onPasscodeExpired,
  onSignOut,
  onNavigateHome,
}) => {
  const isPasscodeMode = Boolean(passcodeSession);
  const isSuperAdmin =
    !isPasscodeMode &&
    Boolean(firebaseUser?.emailVerified) &&
    firebaseUser?.email === SUPER_ADMIN_EMAIL;

  const [checkingRole, setCheckingRole] = useState(!isPasscodeMode);
  const [isAdmin, setIsAdmin] = useState(isPasscodeMode);

  const [activeTab, setActiveTab] = useState<'studio' | 'settings'>('studio');
  const [cards, setCards] = useState<TeacherCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugInput, setSlugInput] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState<TeacherCardInput>(DEFAULT_FORM);
  const [photoSourceMode, setPhotoSourceMode] = useState<'upload' | 'url'>('upload');
  const [compressingImage, setCompressingImage] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastSavedCard, setLastSavedCard] = useState<TeacherCard | null>(null);

  // Audio preview state
  const [previewingMusic, setPreviewingMusic] = useState(false);
  const [fullPreviewCard, setFullPreviewCard] = useState<TeacherCard | null>(null);

  // Copy & delete UI states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Collaborator Admin management (Firebase SuperAdmin only)
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Verify Firebase admin authorization when not in Passcode mode
  useEffect(() => {
    if (isPasscodeMode) {
      setIsAdmin(true);
      setCheckingRole(false);
      return;
    }

    if (!firebaseUser) {
      setIsAdmin(false);
      setCheckingRole(false);
      return;
    }

    let active = true;
    const checkAccess = async () => {
      if (!firebaseUser.emailVerified) {
        if (active) {
          setIsAdmin(false);
          setCheckingRole(false);
        }
        return;
      }
      if (isSuperAdmin) {
        if (active) {
          setIsAdmin(true);
          setCheckingRole(false);
        }
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'admins', firebaseUser.uid));
        if (active) {
          setIsAdmin(snap.exists());
          setCheckingRole(false);
        }
      } catch {
        if (active) {
          setIsAdmin(false);
          setCheckingRole(false);
        }
      }
    };
    void checkAccess();
    return () => {
      active = false;
    };
  }, [isPasscodeMode, firebaseUser, isSuperAdmin]);

  const fetchPasscodeCards = useCallback(async () => {
    if (!passcodeSession) return;
    setLoadingCards(true);
    try {
      const res = await fetch('/api/cards', {
        headers: { Authorization: `Bearer ${passcodeSession.token}` },
      });
      if (res.status === 401) {
        onPasscodeExpired();
        return;
      }
      const data = (await res.json()) as { cards?: TeacherCard[] };
      setCards(Array.isArray(data.cards) ? data.cards : []);
    } catch {
      setFormError('Không thể tải danh sách thiệp từ máy chủ.');
    } finally {
      setLoadingCards(false);
    }
  }, [passcodeSession, onPasscodeExpired]);

  // Load cards (Passcode API or Firestore snapshot)
  useEffect(() => {
    if (!isAdmin) return;

    if (isPasscodeMode) {
      void fetchPasscodeCards();
      return;
    }

    if (!firebaseUser) return;
    setLoadingCards(true);

    const cardsRef = collection(db, 'cards');
    const q = isSuperAdmin
      ? query(cardsRef, orderBy('updatedAt', 'desc'))
      : query(cardsRef, where('ownerUid', '==', firebaseUser.uid), orderBy('updatedAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: TeacherCard[] = snapshot.docs.map((d) => {
          const data = d.data() as Omit<TeacherCard, 'id'>;
          return {
            id: d.id,
            ...data,
          };
        });
        setCards(list);
        setLoadingCards(false);
      },
      (error) => {
        setLoadingCards(false);
        handleFirestoreError(error, OperationType.LIST, 'cards');
      }
    );

    return () => unsub();
  }, [isAdmin, isPasscodeMode, fetchPasscodeCards, isSuperAdmin, firebaseUser]);

  // Listen to collaborator admins for SuperAdmin
  useEffect(() => {
    if (!isSuperAdmin) return;
    const unsub = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => d.data() as AdminMember);
        setAdmins(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'admins');
      }
    );
    return () => unsub();
  }, [isSuperAdmin]);

  useEffect(() => {
    return () => {
      teacherMusic.stop();
    };
  }, []);

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.teacherName.toLowerCase().includes(q) ||
        c.roleOrSubject.toLowerCase().includes(q) ||
        c.senderName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [cards, searchQuery]);

  const handleTeacherNameChange = (name: string) => {
    setForm((prev) => ({ ...prev, teacherName: name }));
    if (!editingId && !slugTouched) {
      setSlugInput(name.trim() ? generateCardSlug(name) : '');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError(null);
    setCompressingImage(true);
    try {
      const compressed = await compressPortraitImage(file);
      setForm((prev) => ({ ...prev, photoData: compressed }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Không thể xử lý ảnh.');
    } finally {
      setCompressingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleToggleMusicPreview = () => {
    if (form.musicTheme === 'none') return;
    if (previewingMusic) {
      teacherMusic.stop();
      setPreviewingMusic(false);
    } else {
      teacherMusic.start(form.musicTheme, form.customAudioUrl);
      setPreviewingMusic(true);
    }
  };

  const handleResetEditor = () => {
    setEditingId(null);
    setSlugInput('');
    setSlugTouched(false);
    setForm(DEFAULT_FORM);
    setFormError(null);
    setLastSavedCard(null);
  };

  const handleStartEdit = (card: TeacherCard) => {
    setActiveTab('studio');
    setEditingId(card.id);
    setSlugInput(card.id);
    setSlugTouched(true);
    setForm({
      honorific: card.honorific,
      teacherName: card.teacherName,
      roleOrSubject: card.roleOrSubject,
      photoData: card.photoData,
      message: card.message,
      senderName: card.senderName,
      yearLabel: card.yearLabel,
      musicTheme: card.musicTheme,
      customAudioUrl: card.customAudioUrl,
      lacquerStyle: card.lacquerStyle,
    });
    setPhotoSourceMode(card.photoData.startsWith('http') ? 'url' : 'upload');
    setFormError(null);
    setLastSavedCard(card);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const honorific = form.honorific.trim().slice(0, CARD_LIMITS.honorificMax);
    const teacherName = form.teacherName.trim().slice(0, CARD_LIMITS.teacherNameMax);
    const roleOrSubject = form.roleOrSubject.trim().slice(0, CARD_LIMITS.roleOrSubjectMax);
    const photoData = form.photoData.trim();
    const message = form.message.trim().slice(0, CARD_LIMITS.messageMax);
    const senderName = form.senderName.trim().slice(0, CARD_LIMITS.senderNameMax);
    const yearLabel = (form.yearLabel.trim() || '20 · 11 · 2026').slice(0, CARD_LIMITS.yearLabelMax);
    const customAudioUrl = form.customAudioUrl.trim().slice(0, CARD_LIMITS.customAudioUrlMax);

    if (!honorific || !teacherName) {
      setFormError('Vui lòng nhập đầy đủ danh xưng và họ tên thầy/cô.');
      return;
    }
    if (!message) {
      setFormError('Vui lòng nhập lời chúc tri ân gửi tới thầy/cô.');
      return;
    }
    if (!senderName) {
      setFormError('Vui lòng nhập tên người gửi hoặc tập thể.');
      return;
    }
    if (photoData.length > CARD_LIMITS.photoDataMax) {
      setFormError('Dung lượng ảnh vượt quá giới hạn cho phép. Vui lòng chọn ảnh khác.');
      return;
    }

    const rawSlug = editingId
      ? editingId
      : slugInput.trim()
        ? slugifyVietnamese(slugInput)
        : generateCardSlug(teacherName);

    if (!isValidSlug(rawSlug)) {
      setFormError(
        'Mã đường dẫn chỉ được chứa chữ không dấu, số, dấu gạch ngang (-) hoặc gạch dưới (_).'
      );
      return;
    }

    setSaving(true);

    // Passcode Admin mode -> Express API
    if (isPasscodeMode && passcodeSession) {
      try {
        const endpoint = editingId
          ? `/api/cards/${encodeURIComponent(editingId)}`
          : '/api/cards';
        const method = editingId ? 'PUT' : 'POST';
        const res = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${passcodeSession.token}`,
          },
          body: JSON.stringify({
            id: rawSlug,
            honorific,
            teacherName,
            roleOrSubject,
            photoData,
            message,
            senderName,
            yearLabel,
            musicTheme: form.musicTheme,
            customAudioUrl,
            lacquerStyle: form.lacquerStyle,
          }),
        });

        if (res.status === 401) {
          onPasscodeExpired();
          return;
        }

        const payload = (await res.json().catch(() => ({}))) as {
          card?: TeacherCard;
          error?: string;
        };

        if (!res.ok || !payload.card) {
          setFormError(payload.error || 'Không thể lưu thiệp. Vui lòng thử lại.');
          return;
        }

        setSlugInput(payload.card.id);
        setEditingId(payload.card.id);
        setLastSavedCard(payload.card);
        await fetchPasscodeCards();
      } catch {
        setFormError('Lỗi kết nối khi lưu thiệp lên máy chủ.');
      } finally {
        setSaving(false);
      }
      return;
    }

    // Firebase Admin mode -> Cloud Firestore
    if (!firebaseUser) {
      setSaving(false);
      return;
    }

    const cardPath = `cards/${rawSlug}`;
    try {
      if (editingId) {
        await updateDoc(doc(db, 'cards', editingId), {
          honorific,
          teacherName,
          roleOrSubject,
          photoData,
          message,
          senderName,
          yearLabel,
          musicTheme: form.musicTheme,
          customAudioUrl,
          lacquerStyle: form.lacquerStyle,
          updatedAt: serverTimestamp(),
        });
      } else {
        const existingSnap = await getDoc(doc(db, 'cards', rawSlug));
        const finalId = existingSnap.exists() ? generateCardSlug(teacherName) : rawSlug;

        await setDoc(doc(db, 'cards', finalId), {
          honorific,
          teacherName,
          roleOrSubject,
          photoData,
          message,
          senderName,
          yearLabel,
          musicTheme: form.musicTheme,
          customAudioUrl,
          lacquerStyle: form.lacquerStyle,
          ownerUid: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setSlugInput(finalId);
        const createdCard: TeacherCard = {
          id: finalId,
          honorific,
          teacherName,
          roleOrSubject,
          photoData,
          message,
          senderName,
          yearLabel,
          musicTheme: form.musicTheme,
          customAudioUrl,
          lacquerStyle: form.lacquerStyle,
          ownerUid: firebaseUser.uid,
        };
        setLastSavedCard(createdCard);
        setEditingId(finalId);
        setSaving(false);
        return;
      }

      setLastSavedCard({
        id: rawSlug,
        honorific,
        teacherName,
        roleOrSubject,
        photoData,
        message,
        senderName,
        yearLabel,
        musicTheme: form.musicTheme,
        customAudioUrl,
        lacquerStyle: form.lacquerStyle,
        ownerUid: firebaseUser.uid,
      });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, cardPath);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      window.setTimeout(() => {
        setCopiedId((curr) => (curr === key ? null : curr));
      }, 2200);
    } catch {
      setFormError('Trình duyệt không cho phép sao chép tự động. Vui lòng sao chép thủ công.');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setDeletingId(cardId);
    try {
      if (isPasscodeMode && passcodeSession) {
        const res = await fetch(`/api/cards/${encodeURIComponent(cardId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${passcodeSession.token}` },
        });
        if (res.status === 401) {
          onPasscodeExpired();
          return;
        }
        if (editingId === cardId) {
          handleResetEditor();
        }
        setConfirmDeleteId(null);
        await fetchPasscodeCards();
        return;
      }

      await deleteDoc(doc(db, 'cards', cardId));
      if (editingId === cardId) {
        handleResetEditor();
      }
      setConfirmDeleteId(null);
    } catch (err) {
      if (!isPasscodeMode) {
        handleFirestoreError(err, OperationType.DELETE, `cards/${cardId}`);
      } else {
        setFormError('Không thể xóa thiệp lúc này.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setAdminError(null);
    const uid = newAdminUid.trim();
    const email = newAdminEmail.trim().toLowerCase();
    const displayName = newAdminName.trim() || email;

    if (!isValidSlug(uid)) {
      setAdminError('UID không hợp lệ (chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới).');
      return;
    }
    if (!email.includes('@')) {
      setAdminError('Vui lòng nhập email hợp lệ của cộng tác viên.');
      return;
    }

    setAddingAdmin(true);
    try {
      await setDoc(doc(db, 'admins', uid), {
        uid,
        email: email.slice(0, 254),
        displayName: displayName.slice(0, 120),
        addedBy: firebaseUser.uid,
        createdAt: serverTimestamp(),
      });
      setNewAdminUid('');
      setNewAdminEmail('');
      setNewAdminName('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `admins/${uid}`);
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveCollaborator = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'admins', uid));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `admins/${uid}`);
    }
  };

  // Fullscreen preview mode
  if (fullPreviewCard) {
    return (
      <CardViewer
        card={fullPreviewCard}
        isPreview
        onExitPreview={() => setFullPreviewCard(null)}
      />
    );
  }

  // Loading authorization check
  if (checkingRole) {
    return (
      <div className="min-h-screen linen-sunlight-bg text-[#2D2926] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#C59B57] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#2D2926]/80">Đang xác thực quyền Quản trị...</p>
        </div>
      </div>
    );
  }

  // Unauthorized Firebase user screen
  if (!isAdmin && firebaseUser) {
    return (
      <div className="relative min-h-screen linen-sunlight-bg text-[#2D2926] flex items-center justify-center p-6 overflow-hidden">
        <div className="relative z-10 max-w-lg w-full bg-[#FAF7F0] border border-[#C59B57]/55 p-8 shadow-xl">
          <div className="flex items-center gap-3 text-[#7A8B74] mb-4">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold">
              Giới hạn quyền Quản trị
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2D2926] mb-3">
            Tài khoản này chưa được cấp quyền Admin
          </h1>
          <p className="text-sm font-light text-[#2D2926]/80 leading-relaxed mb-6">
            Bạn đang đăng nhập bằng{' '}
            <strong className="font-medium text-[#2D2926]">{firebaseUser.email}</strong>. Bạn có
            thể quay về dùng <strong>Mật khẩu Admin</strong> hoặc gửi mã UID dưới đây cho chủ sở
            hữu để được cấp quyền Google Admin.
          </p>

          <div className="bg-[#EAE3D5]/70 border border-[#C59B57]/40 p-4 mb-6">
            <p className="text-xs text-[#7A8B74] mb-1.5">Mã UID của bạn</p>
            <div className="flex items-center justify-between gap-3">
              <code className="font-mono text-xs text-[#2D2926] truncate">
                {firebaseUser.uid}
              </code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(firebaseUser.uid);
                  setCopiedUid(true);
                  window.setTimeout(() => setCopiedUid(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FAF7F0] hover:bg-white text-[#2D2926] border border-[#C59B57]/50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedUid ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUid ? 'Đã chép UID' : 'Sao chép UID'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D2926] hover:bg-[#423C38] text-[#FAF7F0] text-sm font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đổi cách đăng nhập</span>
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#C59B57]/60 text-[#2D2926] hover:bg-[#EAE3D5]/40 text-sm font-medium transition-colors cursor-pointer"
            >
              <span>Về trang chủ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeOwnerLabel = isPasscodeMode
    ? passcodeSession?.displayName || 'Quản trị viên'
    : firebaseUser?.email || 'Admin';

  const previewCard: TeacherCard = {
    id: editingId || slugInput || 'xem-truoc',
    ...form,
    honorific: form.honorific || 'Kính tặng Cô',
    teacherName: form.teacherName || 'Tên Thầy / Cô',
    senderName: form.senderName || 'Người gửi',
    yearLabel: form.yearLabel || '20 · 11 · 2026',
    message: form.message || 'Lời chúc tri ân sẽ hiển thị trang trọng tại đây.',
    ownerUid: isPasscodeMode ? 'passcode-admin' : firebaseUser?.uid || 'admin',
  };

  return (
    <div className="min-h-screen linen-sunlight-bg text-[#0F4C5C] relative">
      <ViewportCornerBotanicals />
      {/* Top Bar: Bright 3-zone contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-[#0F4C5C] border-b border-[#F59E0B]/35 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={onNavigateHome}
            className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#0F4C5C] hover:text-[#D97706] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Studio Thiệp 20/11
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#0F4C5C]/70">
            <button
              type="button"
              onClick={() => setActiveTab('studio')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'studio'
                  ? 'text-[#0F4C5C] font-semibold underline underline-offset-8 decoration-[#F59E0B]'
                  : 'hover:text-[#0F4C5C]'
              }`}
            >
              Quản lý Thiệp
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'settings'
                  ? 'text-[#0F4C5C] font-semibold underline underline-offset-8 decoration-[#F59E0B]'
                  : 'hover:text-[#0F4C5C]'
              }`}
            >
              Phân quyền &amp; Triển khai
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs text-[#0F4C5C]/70 truncate max-w-[180px]">
              {activeOwnerLabel}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-[#F59E0B]/45 bg-white hover:bg-[#FEF3C7]/60 text-[#0F4C5C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden relative z-30 bg-white/95 border-b border-[#F59E0B]/30 px-4 py-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('studio')}
          className={`flex-1 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'studio' ? 'bg-[#0F4C5C] text-white' : 'text-[#0F4C5C]/75'
          }`}
        >
          Quản lý Thiệp
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'settings' ? 'bg-[#0F4C5C] text-white' : 'text-[#0F4C5C]/75'
          }`}
        >
          Phân quyền &amp; Triển khai
        </button>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {activeTab === 'studio' ? (
          <div className="space-y-10">
            {/* Share-Ready Notification Banner */}
            {lastSavedCard && (
              <section className="bg-white text-[#0F4C5C] border border-[#F59E0B]/55 p-6 shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#059669] font-semibold mb-1">
                      Thiệp đã sẵn sàng trao gửi
                    </p>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0F4C5C] truncate">
                      {lastSavedCard.honorific} {lastSavedCard.teacherName}
                    </h2>
                    <p className="font-mono text-xs text-[#0F4C5C]/70 mt-1.5 break-all">
                      {buildShareLink(lastSavedCard.id)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyText(
                          `banner-link-${lastSavedCard.id}`,
                          buildShareLink(lastSavedCard.id)
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F4C5C] hover:bg-[#0B3B48] text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {copiedId === `banner-link-${lastSavedCard.id}` ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>
                        {copiedId === `banner-link-${lastSavedCard.id}`
                          ? 'Đã sao chép Link'
                          : 'Sao chép Link'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyText(
                          `banner-msg-${lastSavedCard.id}`,
                          buildZaloShareText(
                            lastSavedCard,
                            buildShareLink(lastSavedCard.id)
                          )
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FEF3C7]/60 text-[#0F4C5C] border border-[#F59E0B]/55 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {copiedId === `banner-msg-${lastSavedCard.id}` ? (
                        <Check className="w-4 h-4 text-[#059669]" />
                      ) : (
                        <MessageSquareText className="w-4 h-4 text-[#D97706]" />
                      )}
                      <span>
                        {copiedId === `banner-msg-${lastSavedCard.id}`
                          ? 'Đã chép Lời nhắn'
                          : 'Chép Lời nhắn + Link'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFullPreviewCard(lastSavedCard)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FEF3C7]/60 border border-[#F59E0B]/45 text-[#0F4C5C] text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Mở thử Thiệp</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Editor + Live Preview Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Form */}
              <form
                onSubmit={handleSaveCard}
                className="lg:col-span-7 bg-white border border-[#F59E0B]/45 p-6 sm:p-8 space-y-6 shadow-md"
              >
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#F59E0B]/25">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-[#0F4C5C]">
                      {editingId ? 'Chỉnh sửa Thiệp Tri Ân' : 'Tạo Thiệp Mới Gửi Thầy Cô'}
                    </h1>
                    <p className="text-xs text-[#0F4C5C]/70 mt-1">
                      Nhập tên, chụp hoặc tải ảnh chân dung, soạn lời chúc thủ công và bấm lưu để
                      sinh link chia sẻ.
                    </p>
                  </div>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleResetEditor}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#F59E0B]/50 text-[#0F4C5C] hover:bg-[#FEF3C7]/60 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tạo thiệp mới</span>
                    </button>
                  )}
                </div>

                {formError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-sm text-red-800">
                    {formError}
                  </div>
                )}

                {/* Honorific & Teacher Name */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F4C5C]/80">
                    Danh xưng &amp; Họ tên Thầy / Cô
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {HONORIFIC_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, honorific: preset }))}
                        className={`px-3 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                          form.honorific === preset
                            ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                            : 'bg-white text-[#0F4C5C]/80 border-[#F59E0B]/40 hover:border-[#F59E0B]'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={form.honorific}
                        maxLength={CARD_LIMITS.honorificMax}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, honorific: e.target.value }))
                        }
                        placeholder="Danh xưng..."
                        className="w-full px-3.5 py-2.5 text-sm border border-[#C59B57]/40 bg-white focus:outline-none focus:border-[#7A8B74]"
                        required
                      />
                    </div>
                    <div className="sm:col-span-8">
                      <input
                        type="text"
                        value={form.teacherName}
                        maxLength={CARD_LIMITS.teacherNameMax}
                        onChange={(e) => handleTeacherNameChange(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Thị Minh Anh"
                        className="w-full px-3.5 py-2.5 text-sm border border-[#C59B57]/40 bg-white focus:outline-none focus:border-[#7A8B74]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Role / Subject + Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2926]/75 mb-1.5">
                      Bộ môn / Chức vụ (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={form.roleOrSubject}
                      maxLength={CARD_LIMITS.roleOrSubjectMax}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, roleOrSubject: e.target.value }))
                      }
                      placeholder="VD: Giáo viên Chủ nhiệm lớp 12A1"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#C59B57]/40 bg-white focus:outline-none focus:border-[#7A8B74]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2926]/75 mb-1.5">
                      Mã đường dẫn (Link ID)
                    </label>
                    <input
                      type="text"
                      value={slugInput}
                      disabled={Boolean(editingId)}
                      maxLength={CARD_LIMITS.idMax}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setSlugInput(e.target.value);
                      }}
                      placeholder="tu-dong-tao-theo-ten"
                      className="w-full px-3.5 py-2.5 font-mono text-xs border border-[#C59B57]/40 bg-[#EAE3D5]/35 disabled:text-[#2D2926]/55 focus:outline-none focus:border-[#7A8B74]"
                    />
                  </div>
                </div>

                {/* Portrait Capture & Uploader */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#2D2926]/75">
                      Ảnh chân dung Thầy / Cô (Chụp hoặc Tải lên)
                    </label>
                    <div className="flex items-center gap-1 p-0.5 bg-[#EAE3D5]/70 border border-[#C59B57]/35">
                      <button
                        type="button"
                        onClick={() => setPhotoSourceMode('upload')}
                        className={`px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                          photoSourceMode === 'upload'
                            ? 'bg-white text-[#2D2926] shadow-xs'
                            : 'text-[#2D2926]/65'
                        }`}
                      >
                        Chụp / Tải ảnh
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoSourceMode('url')}
                        className={`px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                          photoSourceMode === 'url'
                            ? 'bg-white text-[#2D2926] shadow-xs'
                            : 'text-[#2D2926]/65'
                        }`}
                      >
                        Dán URL ảnh
                      </button>
                    </div>
                  </div>

                  {photoSourceMode === 'upload' ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-dashed border-[#C59B57]/55 bg-white/60">
                      <div className="w-20 h-24 shrink-0 border border-[#C59B57]/60 bg-[#FAF7F0] overflow-hidden flex items-center justify-center">
                        {form.photoData ? (
                          <img
                            src={form.photoData}
                            alt="Xem trước chân dung"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <img
                            src={ASSETS.lotusEmblem}
                            alt="Biểu tượng mặc định"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-75"
                          />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCameraModalOpen(true)}
                            disabled={compressingImage}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#0F4C5C] hover:bg-[#0B3B48] text-white transition-colors cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Chụp ảnh (Camera)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={compressingImage}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white hover:bg-[#FEF3C7]/60 text-[#0F4C5C] border border-[#F59E0B]/50 transition-colors cursor-pointer"
                          >
                            <ImagePlus className="w-4 h-4 text-[#D97706]" />
                            <span>
                              {compressingImage
                                ? 'Đang tối ưu ảnh...'
                                : form.photoData
                                  ? 'Chọn ảnh khác'
                                  : 'Chọn ảnh từ máy'}
                            </span>
                          </button>

                          {form.photoData && (
                            <button
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, photoData: '' }))}
                              className="inline-flex items-center gap-1 px-3 py-2 text-xs text-[#0F4C5C]/65 hover:text-red-700 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Bỏ ảnh</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-[#0F4C5C]/65">
                          Hỗ trợ chụp trực tiếp bằng camera hoặc chọn ảnh có sẵn (tự động cắt gọn
                          chuẩn khung 3:4).
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={form.photoData.startsWith('data:') ? '' : form.photoData}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, photoData: e.target.value }))
                        }
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 text-sm border border-[#F59E0B]/45 bg-white focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  )}
                </div>

                {/* Tribute Message: Quick Templates + Manual Textarea */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#0F4C5C]/80">
                      Lời chúc Tri ân (Chọn mẫu gợi ý hoặc tự chỉnh sửa)
                    </label>
                    <span className="text-xs text-[#0F4C5C]/55 tabular-nums">
                      {form.message.length}/{CARD_LIMITS.messageMax}
                    </span>
                  </div>

                  {/* Quick Fixed Templates */}
                  <div className="flex flex-wrap gap-1.5">
                    {TRIBUTE_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, message: tpl.text }))}
                        className="px-2.5 py-1 text-xs border border-[#C59B57]/35 bg-white/80 hover:border-[#7A8B74] hover:text-[#7A8B74] text-[#2D2926]/75 transition-colors cursor-pointer"
                      >
                        Mẫu: {tpl.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={5}
                    value={form.message}
                    maxLength={CARD_LIMITS.messageMax}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Viết hoặc chỉnh sửa lời chúc chân thành gửi tới thầy cô..."
                    className="w-full px-3.5 py-3 text-sm leading-relaxed border border-[#C59B57]/40 bg-white focus:outline-none focus:border-[#7A8B74]"
                    required
                  />
                </div>

                {/* Sender & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2926]/75 mb-1.5">
                      Người gửi / Tập thể
                    </label>
                    <input
                      type="text"
                      value={form.senderName}
                      maxLength={CARD_LIMITS.senderNameMax}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, senderName: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 text-sm border border-[#C59B57]/40 bg-white focus:outline-none focus:border-[#7A8B74]"
                      required
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2926]/75 mb-1.5">
                      Dấu ngày kỷ niệm
                    </label>
                    <input
                      type="text"
                      value={form.yearLabel}
                      maxLength={CARD_LIMITS.yearLabelMax}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, yearLabel: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 text-sm border border-[#C59B57]/40 bg-white tabular-nums focus:outline-none focus:border-[#7A8B74]"
                      required
                    />
                  </div>
                </div>

                {/* Music & Paper Accent */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[#C59B57]/25">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#2D2926]/75">
                        Bài hát tri ân
                      </label>
                      {form.musicTheme !== 'none' && (
                        <button
                          type="button"
                          onClick={handleToggleMusicPreview}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#7A8B74] hover:underline cursor-pointer"
                        >
                          {previewingMusic ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>Dừng nghe thử</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Nghe thử</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <select
                      value={form.musicTheme}
                      onChange={(e) => {
                        teacherMusic.stop();
                        setPreviewingMusic(false);
                        setForm((prev) => ({
                          ...prev,
                          musicTheme: e.target.value as MusicTheme,
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#C59B57]/40 bg-white focus:outline-none focus:border-[#7A8B74]"
                    >
                      {MUSIC_OPTIONS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>

                    {form.musicTheme === 'custom' && (
                      <input
                        type="url"
                        value={form.customAudioUrl}
                        maxLength={CARD_LIMITS.customAudioUrlMax}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, customAudioUrl: e.target.value }))
                        }
                        placeholder="https://example.com/nhac-20-11.mp3"
                        className="mt-2 w-full px-3.5 py-2 text-xs border border-[#C59B57]/40 bg-white focus:outline-none focus:border-[#7A8B74]"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2926]/75 mb-1.5">
                      Sắc thái Giấy &amp; Ánh kim
                    </label>
                    <div className="space-y-1.5">
                      {LACQUER_STYLES.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, lacquerStyle: st.id as LacquerStyle }))
                          }
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium border text-left transition-colors cursor-pointer ${
                            form.lacquerStyle === st.id
                              ? 'border-[#7A8B74] bg-[#EAE3D5]/60 text-[#2D2926]'
                              : 'border-[#C59B57]/30 bg-white text-[#2D2926]/75 hover:border-[#C59B57]/60'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 shrink-0 border border-[#C59B57]"
                            style={{ backgroundColor: st.swatch }}
                          />
                          <span className="truncate">{st.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving || compressingImage}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0F4C5C] hover:bg-[#0B3B48] text-white text-sm font-semibold transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
                  >
                    <span>
                      {saving
                        ? 'Đang lưu thiệp...'
                        : editingId
                          ? 'Cập nhật Thiệp & Giữ Link'
                          : 'Lưu & Tạo Link Chia Sẻ'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      teacherMusic.stop();
                      setPreviewingMusic(false);
                      setFullPreviewCard(previewCard);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3.5 border border-[#F59E0B]/55 bg-white hover:bg-[#FEF3C7]/60 text-[#0F4C5C] text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[#D97706]" />
                    <span>Xem trước toàn màn hình</span>
                  </button>
                </div>
              </form>

              {/* Right Column: Compact Botanical Live Preview Card */}
              <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                <div className="bg-[#FEF3C7]/85 p-5 border border-[#F59E0B]/45 shadow-lg">
                  <div className="bg-white border border-[#F59E0B]/45 p-6 shadow-md">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] font-semibold text-[#059669] mb-4">
                      <span>Xem trước trực tiếp</span>
                      <span className="tabular-nums">{previewCard.yearLabel}</span>
                    </div>

                    <div className="border border-[#F59E0B]/35 p-4 bg-[#FEF3C7]/25 flex items-center gap-4 mb-5">
                      <div className="w-20 h-28 shrink-0 border border-[#F59E0B]/55 bg-white overflow-hidden">
                        <img
                          src={previewCard.photoData || ASSETS.lotusEmblem}
                          alt={previewCard.teacherName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display italic font-semibold text-[15px] tracking-[0.04em] text-[#B45309] mb-0.5">
                          {previewCard.honorific}
                        </p>
                        <h3 className="font-serif font-semibold text-2xl text-[#0F4C5C] leading-tight truncate">
                          {previewCard.teacherName}
                        </h3>
                        {previewCard.roleOrSubject && (
                          <p className="text-xs text-[#0F4C5C]/70 mt-1 line-clamp-2">
                            {previewCard.roleOrSubject}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white text-[#0F4C5C] p-5 border border-[#F59E0B]/35">
                      <p className="font-serif text-base leading-relaxed line-clamp-6 whitespace-pre-line">
                        {previewCard.message}
                      </p>
                      <div className="mt-4 pt-3 border-t border-[#F59E0B]/25 text-right">
                        <p className="font-display italic font-semibold text-[15px] tracking-[0.04em] text-[#B45309] mb-0.5">
                          Kính chúc,
                        </p>
                        <p className="font-serif font-semibold text-base text-[#0F4C5C]">
                          {previewCard.senderName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-[#0F4C5C]/80">
                      <span className="flex items-center gap-1.5">
                        <Music2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span className="truncate max-w-[200px]">
                          {MUSIC_OPTIONS.find((m) => m.id === previewCard.musicTheme)?.title}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setFullPreviewCard(previewCard)}
                        className="text-[#059669] hover:text-[#0F4C5C] hover:underline font-semibold whitespace-nowrap cursor-pointer"
                      >
                        Mở thử thiệp 3D →
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            {/* Saved Cards Directory */}
            <section className="bg-white border border-[#F59E0B]/45 p-6 sm:p-8 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F59E0B]/25">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#0F4C5C]">
                    Danh sách Thiệp đã tạo ({cards.length})
                  </h2>
                  <p className="text-xs text-[#0F4C5C]/70 mt-1">
                    Bấm sao chép link hoặc sao chép lời nhắn kèm link để gửi trực tiếp cho từng
                    thầy cô.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#0F4C5C]/45 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên thầy cô, bộ môn..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[#F59E0B]/45 bg-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              {loadingCards ? (
                <div className="py-10 space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-16 bg-[#EAE3D5]/60 animate-pulse" />
                  ))}
                </div>
              ) : filteredCards.length === 0 ? (
                <div className="py-14 text-center">
                  <p className="font-display text-xl font-semibold text-[#2D2926] mb-2">
                    {searchQuery ? 'Không tìm thấy thiệp phù hợp' : 'Chưa có tấm thiệp nào được tạo'}
                  </p>
                  <p className="text-sm text-[#2D2926]/65">
                    {searchQuery
                      ? 'Hãy thử tìm bằng từ khóa khác.'
                      : 'Điền thông tin thầy cô ở biểu mẫu phía trên để tạo tấm thiệp đầu tiên.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#C59B57]/20">
                  {filteredCards.map((card) => {
                    const shareUrl = buildShareLink(card.id);
                    const isConfirmingDelete = confirmDeleteId === card.id;

                    return (
                      <div
                        key={card.id}
                        className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#EAE3D5]/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-16 shrink-0 border border-[#C59B57]/60 bg-[#FAF7F0] overflow-hidden">
                            <img
                              src={card.photoData || ASSETS.lotusEmblem}
                              alt={card.teacherName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#2D2926] truncate">
                              {card.honorific} {card.teacherName}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#2D2926]/65 mt-0.5">
                              {card.roleOrSubject && (
                                <>
                                  <span className="truncate max-w-[240px]">
                                    {card.roleOrSubject}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                </>
                              )}
                              <span className="font-mono text-[#7A8B74]">{card.id}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => void handleCopyText(`link-${card.id}`, shareUrl)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#7A8B74] hover:bg-[#667760] text-[#FAF7F0] transition-colors whitespace-nowrap cursor-pointer"
                          >
                            {copiedId === `link-${card.id}` ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {copiedId === `link-${card.id}` ? 'Đã chép Link' : 'Copy Link'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleCopyText(
                                `msg-${card.id}`,
                                buildZaloShareText(card, shareUrl)
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#C59B57]/45 bg-white hover:bg-[#EAE3D5]/40 text-[#2D2926] transition-colors whitespace-nowrap cursor-pointer"
                          >
                            {copiedId === `msg-${card.id}` ? (
                              <Check className="w-3.5 h-3.5 text-[#7A8B74]" />
                            ) : (
                              <MessageSquareText className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {copiedId === `msg-${card.id}` ? 'Đã chép' : 'Copy Lời nhắn'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFullPreviewCard(card)}
                            title="Mở thử thiệp"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#C59B57]/45 bg-white hover:bg-[#EAE3D5]/40 text-[#2D2926] transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(card)}
                            title="Chỉnh sửa"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#C59B57]/45 bg-white hover:bg-[#EAE3D5]/40 text-[#2D2926] transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>

                          {isConfirmingDelete ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={deletingId === card.id}
                                onClick={() => void handleDeleteCard(card.id)}
                                className="px-2.5 py-2 text-xs font-semibold bg-red-700 text-white hover:bg-red-800 cursor-pointer"
                              >
                                {deletingId === card.id ? 'Đang xóa...' : 'Xác nhận xóa'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-2 text-xs text-[#2D2926]/70 hover:text-[#2D2926] cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(card.id)}
                              title="Xóa thiệp"
                              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium border border-[#C59B57]/35 text-[#2D2926]/65 hover:text-red-700 hover:border-red-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Settings & Self-Deployment Tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Self-Deployment Checklist */}
            <section className="lg:col-span-6 bg-[#FAF7F0] border border-[#C59B57]/40 p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex items-center gap-2.5 text-[#7A8B74]">
                <Globe className="w-5 h-5" />
                <h2 className="font-display text-2xl font-bold text-[#2D2926]">
                  Triển khai lên Website riêng
                </h2>
              </div>
              <p className="text-sm text-[#2D2926]/80 leading-relaxed">
                Bạn có thể chạy máy chủ Node.js (`npm run build && npm start`) để vận hành trang
                chỉnh sửa với xác thực mật khẩu Admin:
              </p>

              <ol className="space-y-4 text-sm text-[#2D2926]/85">
                <li className="border border-[#C59B57]/30 p-4 bg-white/70">
                  <p className="font-semibold text-[#2D2926] mb-1">
                    01. Cấu hình biến môi trường
                  </p>
                  <p className="text-xs text-[#2D2926]/70 leading-relaxed">
                    Đặt <code className="font-mono bg-[#EAE3D5] px-1.5 py-0.5">ADMIN_PASSCODE</code>{' '}
                    (mặc định <span className="font-mono">20-11-2026</span>) trên máy chủ của bạn.
                  </p>
                </li>
                <li className="border border-[#C59B57]/30 p-4 bg-white/70">
                  <p className="font-semibold text-[#2D2926] mb-1">
                    02. Đóng gói &amp; Khởi chạy
                  </p>
                  <p className="text-xs text-[#2D2926]/70 leading-relaxed">
                    Chạy <code className="font-mono bg-[#EAE3D5] px-1.5 py-0.5">npm run build</code>{' '}
                    và khởi chạy bằng <code className="font-mono bg-[#EAE3D5] px-1.5 py-0.5">npm start</code>.
                  </p>
                </li>
                <li className="border border-[#C59B57]/30 p-4 bg-white/70">
                  <p className="font-semibold text-[#2D2926] mb-1">
                    03. Gửi link cá nhân hóa cho Thầy Cô
                  </p>
                  <p className="text-xs text-[#2D2926]/70 leading-relaxed">
                    Mỗi đường dẫn dạng{' '}
                    <span className="font-mono">https://ten-mien-cua-ban/?card=co-minh-anh-4k9p</span>{' '}
                    sẽ tự động hiển thị đúng tên, ảnh và lời chúc của thầy cô đó.
                  </p>
                </li>
              </ol>
            </section>

            {/* Admin Security Info */}
            <section className="lg:col-span-6 bg-[#FAF7F0] border border-[#C59B57]/40 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-[#7A8B74]">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="font-display text-2xl font-bold text-[#2D2926]">
                  Bảo mật Trang Chỉnh Sửa
                </h2>
              </div>

              <div className="p-4 bg-white/70 border border-[#C59B57]/30 text-xs text-[#2D2926]/80 space-y-1">
                <p>
                  <strong>Chế độ hiện tại:</strong> Xác thực bằng Mật khẩu Admin
                </p>
                <p className="text-[#2D2926]/65">
                  Chỉ người có mật khẩu mới vào được Studio chỉnh sửa, tạo và quản lý danh sách
                  thiệp.
                </p>
              </div>

              {isSuperAdmin ? (
                <>
                  <form onSubmit={handleAddCollaborator} className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D2926]/75">
                      Thêm Cộng tác viên Admin mới
                    </h3>
                    {adminError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800">
                        {adminError}
                      </div>
                    )}
                    <input
                      type="text"
                      value={newAdminUid}
                      onChange={(e) => setNewAdminUid(e.target.value)}
                      placeholder="UID của người dùng (họ đăng nhập để lấy UID)"
                      className="w-full px-3.5 py-2 text-xs font-mono border border-[#C59B57]/40 bg-white focus:outline-none focus:border-[#7A8B74]"
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="Email Google"
                        className="w-full px-3.5 py-2 text-sm border border-[#C59B57]/40 bg-white focus:outline-none focus:border-[#7A8B74]"
                        required
                      />
                      <input
                        type="text"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="Tên hiển thị"
                        className="w-full px-3.5 py-2 text-sm border border-[#C59B57]/40 bg-white focus:outline-none focus:border-[#7A8B74]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={addingAdmin}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#7A8B74] hover:bg-[#667760] text-[#FAF7F0] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{addingAdmin ? 'Đang thêm...' : 'Cấp quyền Admin'}</span>
                    </button>
                  </form>

                  <div className="pt-4 border-t border-[#C59B57]/25 space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#2D2926]/75">
                      Danh sách Cộng tác viên ({admins.length})
                    </h3>
                    {admins.length === 0 ? (
                      <p className="text-xs text-[#2D2926]/65 py-2">
                        Chưa có cộng tác viên nào được thêm.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#C59B57]/20">
                        {admins.map((adm) => (
                          <div
                            key={adm.uid}
                            className="py-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-[#2D2926] truncate">
                                {adm.displayName}
                              </p>
                              <p className="text-[#2D2926]/65 truncate">{adm.email}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => void handleRemoveCollaborator(adm.uid)}
                              className="px-2.5 py-1 text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer shrink-0"
                            >
                              Thu hồi
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-[#2D2926]/70 leading-relaxed">
                  Bạn đang sử dụng phiên Quản trị trực tiếp bằng mật khẩu Admin để tạo, chụp ảnh và
                  quản lý danh sách thiệp.
                </p>
              )}
            </section>
          </div>
        )}
      </main>

      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={(dataUrl) => setForm((prev) => ({ ...prev, photoData: dataUrl }))}
      />
    </div>
  );
};
