import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '20-11-2016';

const DATA_DIR = path.resolve(__dirname, '.data');
const CARDS_FILE = path.join(DATA_DIR, 'cards.json');
const SECRET_FILE = path.join(DATA_DIR, '.session-secret');

interface StoredCard {
  id: string;
  honorific: string;
  teacherName: string;
  roleOrSubject: string;
  photoData: string;
  message: string;
  senderName: string;
  yearLabel: string;
  musicTheme: 'bui-phan' | 'nguoi-thay' | 'mong-uoc-ky-niem-xua' | 'nho-on-thay-co' | 'canon-in-d' | 'custom' | 'none';
  customAudioUrl: string;
  lacquerStyle: 'royal-crimson' | 'imperial-gold' | 'lotus-burgundy';
  ownerUid: string;
  createdAt: number;
  updatedAt: number;
}

const VALID_MUSIC_THEMES = new Set([
  'bui-phan',
  'nguoi-thay',
  'mong-uoc-ky-niem-xua',
  'nho-on-thay-co',
  'canon-in-d',
  'custom',
  'none',
]);

const VALID_STYLES = new Set([
  'royal-crimson',
  'imperial-gold',
  'lotus-burgundy',
]);

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  ensureDataDir();
  if (fs.existsSync(SECRET_FILE)) {
    const existing = fs.readFileSync(SECRET_FILE, 'utf8').trim();
    if (existing.length >= 32) return existing;
  }
  const generated = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SECRET_FILE, generated, { mode: 0o600 });
  return generated;
}

const SESSION_SECRET = getSessionSecret();

function readCardsStore(): Record<string, StoredCard> {
  ensureDataDir();
  if (!fs.existsSync(CARDS_FILE)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(CARDS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, StoredCard>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCardsStore(store: Record<string, StoredCard>): void {
  ensureDataDir();
  const tmpFile = `${CARDS_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tmpFile, CARDS_FILE);
}

function signToken(payload: { role: string; exp: number }): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): { role: string; exp: number } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as { role?: string; exp?: number };
    if (
      payload.role !== 'passcode-admin' ||
      typeof payload.exp !== 'number' ||
      Date.now() > payload.exp
    ) {
      return null;
    }
    return { role: payload.role, exp: payload.exp };
  } catch {
    return null;
  }
}

function isValidSlug(id: string): boolean {
  return id.length >= 1 && id.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(id);
}

function requirePasscodeAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const verified = token ? verifyToken(token) : null;
  if (!verified) {
    res.status(401).json({ error: 'Phiên đăng nhập Admin đã hết hạn hoặc không hợp lệ.' });
    return;
  }
  next();
}

function sanitizeCardPayload(body: Record<string, unknown>): {
  error?: string;
  data?: Omit<StoredCard, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'>;
} {
  const honorific = String(body.honorific ?? '').trim().slice(0, 40);
  const teacherName = String(body.teacherName ?? '').trim().slice(0, 120);
  const roleOrSubject = String(body.roleOrSubject ?? '').trim().slice(0, 140);
  const photoData = String(body.photoData ?? '').trim();
  const message = String(body.message ?? '').trim().slice(0, 2500);
  const senderName = String(body.senderName ?? '').trim().slice(0, 150);
  const yearLabel = (String(body.yearLabel ?? '').trim() || '20 · 11 · 2026').slice(0, 40);
  const musicThemeRaw = String(body.musicTheme ?? 'bui-phan');
  const customAudioUrl = String(body.customAudioUrl ?? '').trim().slice(0, 500);
  const lacquerStyleRaw = String(body.lacquerStyle ?? 'imperial-gold');

  if (!honorific || !teacherName) {
    return { error: 'Vui lòng nhập đầy đủ danh xưng và họ tên thầy/cô.' };
  }
  if (!message) {
    return { error: 'Vui lòng nhập lời chúc tri ân.' };
  }
  if (!senderName) {
    return { error: 'Vui lòng nhập tên người gửi hoặc tập thể.' };
  }
  if (photoData.length > 600000) {
    return { error: 'Dung lượng ảnh vượt quá giới hạn 600KB.' };
  }

  const musicTheme = VALID_MUSIC_THEMES.has(musicThemeRaw)
    ? (musicThemeRaw as StoredCard['musicTheme'])
    : 'bui-phan';
  const lacquerStyle = VALID_STYLES.has(lacquerStyleRaw)
    ? (lacquerStyleRaw as StoredCard['lacquerStyle'])
    : 'imperial-gold';

  return {
    data: {
      honorific,
      teacherName,
      roleOrSubject,
      photoData,
      message,
      senderName,
      yearLabel,
      musicTheme,
      customAudioUrl,
      lacquerStyle,
    },
  };
}

// Simple in-memory rate limiter for AI wish generation
const wishRateBuckets = new Map<string, { count: number; resetAt: number }>();
function checkWishRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = wishRateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    wishRateBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (bucket.count >= 25) return false;
  bucket.count += 1;
  return true;
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Passcode Admin Login (default passcode: 20-11-2016)
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const passcode = String(req.body?.passcode ?? '').trim();
    if (!passcode) {
      res.status(400).json({ error: 'Vui lòng nhập mật khẩu Admin.' });
      return;
    }

    const inputBuf = Buffer.from(passcode);
    const expectedBuf = Buffer.from(ADMIN_PASSCODE);
    const match =
      inputBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(inputBuf, expectedBuf);

    if (!match) {
      res.status(401).json({ error: 'Mật khẩu Admin chưa chính xác.' });
      return;
    }

    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const token = signToken({ role: 'passcode-admin', exp });
    res.json({
      token,
      exp,
      displayName: 'Quản trị viên Thiệp 20/11',
    });
  });

  app.get('/api/admin/session', requirePasscodeAdmin, (_req: Request, res: Response) => {
    res.json({ authenticated: true, displayName: 'Quản trị viên Thiệp 20/11' });
  });

  // Public card fetch by slug ID
  app.get('/api/cards/:id', (req: Request, res: Response) => {
    const id = String(req.params.id ?? '');
    if (!isValidSlug(id)) {
      res.status(400).json({ error: 'Mã thiệp không hợp lệ.' });
      return;
    }
    const store = readCardsStore();
    const card = store[id];
    if (!card) {
      res.status(404).json({ error: 'Không tìm thấy thiệp.' });
      return;
    }
    res.json({ card });
  });

  // Admin card CRUD
  app.get('/api/cards', requirePasscodeAdmin, (_req: Request, res: Response) => {
    const store = readCardsStore();
    const cards = Object.values(store).sort((a, b) => b.updatedAt - a.updatedAt);
    res.json({ cards });
  });

  app.post('/api/cards', requirePasscodeAdmin, (req: Request, res: Response) => {
    const rawId = String(req.body?.id ?? '').trim();
    if (!isValidSlug(rawId)) {
      res.status(400).json({ error: 'Mã đường dẫn không hợp lệ.' });
      return;
    }
    const validated = sanitizeCardPayload(req.body || {});
    if (validated.error || !validated.data) {
      res.status(400).json({ error: validated.error });
      return;
    }

    const store = readCardsStore();
    let finalId = rawId;
    if (store[finalId]) {
      const suffix = crypto.randomBytes(2).toString('hex');
      finalId = `${rawId.slice(0, 118)}-${suffix}`;
    }

    const now = Date.now();
    const card: StoredCard = {
      id: finalId,
      ...validated.data,
      ownerUid: 'passcode-admin',
      createdAt: now,
      updatedAt: now,
    };

    store[finalId] = card;
    writeCardsStore(store);
    res.status(201).json({ card });
  });

  app.put('/api/cards/:id', requirePasscodeAdmin, (req: Request, res: Response) => {
    const id = String(req.params.id ?? '');
    if (!isValidSlug(id)) {
      res.status(400).json({ error: 'Mã đường dẫn không hợp lệ.' });
      return;
    }
    const store = readCardsStore();
    const existing = store[id];
    if (!existing) {
      res.status(404).json({ error: 'Thiệp không tồn tại.' });
      return;
    }
    const validated = sanitizeCardPayload(req.body || {});
    if (validated.error || !validated.data) {
      res.status(400).json({ error: validated.error });
      return;
    }

    const updated: StoredCard = {
      ...existing,
      ...validated.data,
      id,
      ownerUid: existing.ownerUid,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    };
    store[id] = updated;
    writeCardsStore(store);
    res.json({ card: updated });
  });

  app.delete('/api/cards/:id', requirePasscodeAdmin, (req: Request, res: Response) => {
    const id = String(req.params.id ?? '');
    if (!isValidSlug(id)) {
      res.status(400).json({ error: 'Mã đường dẫn không hợp lệ.' });
      return;
    }
    const store = readCardsStore();
    if (!store[id]) {
      res.status(404).json({ error: 'Thiệp không tồn tại.' });
      return;
    }
    delete store[id];
    writeCardsStore(store);
    res.json({ deleted: true });
  });

  // Dynamic AI Vietnamese 20/11 Wish Generator using @google/genai
  app.post('/api/generate-wish', async (req: Request, res: Response) => {
    const clientIp = req.ip || 'local';
    if (!checkWishRateLimit(clientIp)) {
      res.status(429).json({ error: 'Bạn thao tác quá nhanh. Vui lòng đợi vài giây rồi thử lại.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ để sinh lời chúc AI.',
      });
      return;
    }

    const honorific = String(req.body?.honorific ?? 'Kính tặng Cô').trim().slice(0, 40);
    const teacherName = String(req.body?.teacherName ?? '').trim().slice(0, 120);
    const roleOrSubject = String(req.body?.roleOrSubject ?? '').trim().slice(0, 140);
    const senderName = String(req.body?.senderName ?? 'Học trò').trim().slice(0, 150);
    const tone = String(req.body?.tone ?? 'Trang trọng & Sâu lắng').trim().slice(0, 80);
    const memories = String(req.body?.memories ?? '').trim().slice(0, 300);

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = [
        'Hãy viết một lời chúc mừng Ngày Nhà giáo Việt Nam 20/11 bằng tiếng Việt thật tự nhiên, chân thành, giàu cảm xúc và đúng xưng hô.',
        `- Xưng hô mở đầu: ${honorific}${teacherName ? ` ${teacherName}` : ''}`,
        roleOrSubject ? `- Bộ môn / Vai trò: ${roleOrSubject}` : '',
        `- Người gửi / Tập thể: ${senderName}`,
        `- Phong cách mong muốn: ${tone}`,
        memories ? `- Kỷ niệm / Điểm nhấn riêng cần lồng ghép khéo léo: ${memories}` : '',
        'Yêu cầu định dạng:',
        '- Chỉ trả về nội dung lời chúc (không viết tiêu đề, không viết chữ "Kính tặng," hay ký tên ở cuối vì thiệp đã có phần chữ ký riêng).',
        '- Độ dài khoảng 65 đến 110 chữ, chia thành 2 đoạn ngắn cân đối để trình bày đẹp trên mặt thiệp giấy cotton.',
        '- Nếu phong cách là "Thơ lục bát", hãy viết 4-6 câu thơ lục bát ấm áp, đúng niêm luật kèm 1 câu chúc ngắn.',
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Bạn là nhà văn và người biên tập thiệp tri ân tiếng Việt tinh tế. Ngôn từ ấm áp, sâu sắc, tránh sáo rỗng máy móc, tuyệt đối không dùng markdown hay dấu ngoặc kép bao quanh.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const text = response.text?.trim();
      if (!text) {
        res.status(502).json({ error: 'Không nhận được nội dung lời chúc từ AI. Vui lòng thử lại.' });
        return;
      }

      res.json({ message: text });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      res.status(502).json({
        error: `Lỗi kết nối AI sinh lời chúc: ${errMsg}`,
      });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint not found' });
        return;
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

void createServer();
