import { ASSETS, CARD_LIMITS, TeacherCard } from '../types/card';

export function slugifyVietnamese(input: string): string {
  const normalized = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'thiep-tri-an';
}

export function generateCardSlug(teacherName: string): string {
  const base = slugifyVietnamese(teacherName).slice(0, 48);
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${base}-${suffix}`;
}

export function isValidSlug(slug: string): boolean {
  return (
    slug.length >= 1 &&
    slug.length <= CARD_LIMITS.idMax &&
    /^[a-zA-Z0-9_-]+$/.test(slug)
  );
}

export function buildShareLink(cardId: string): string {
  if (typeof window === 'undefined') {
    return `?card=${encodeURIComponent(cardId)}`;
  }
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('card', cardId);
  return url.toString();
}

export function buildZaloShareText(
  card: Pick<TeacherCard, 'honorific' | 'teacherName' | 'senderName'>,
  link: string
): string {
  return `Nhân ngày Nhà giáo Việt Nam 20/11, ${card.senderName} xin trân trọng gửi tới ${card.honorific} ${card.teacherName} tấm thiệp tri ân nhỏ thay lời cảm ơn sâu sắc:\n${link}`;
}

export function compressCanvasPortrait(canvas: HTMLCanvasElement): string {
  const qualities = [0.84, 0.72, 0.58, 0.45];
  for (const q of qualities) {
    const output = canvas.toDataURL('image/jpeg', q);
    if (output.length <= 480000) {
      return output;
    }
  }
  throw new Error('Ảnh có dung lượng quá lớn sau khi nén. Vui lòng chọn ảnh nhẹ hơn.');
}

export async function compressPortraitImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP).');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh vừa chọn.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Định dạng ảnh không được trình duyệt hỗ trợ.'));
    image.src = dataUrl;
  });

  const maxW = 720;
  const maxH = 960;
  const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
  const targetW = Math.max(1, Math.round(img.width * ratio));
  const targetH = Math.max(1, Math.round(img.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');
  }

  ctx.fillStyle = '#FAF7F0';
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);

  return compressCanvasPortrait(canvas);
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split(/\n+/);
  const lines: string[] = [];

  for (let p = 0; p < paragraphs.length; p++) {
    const words = paragraphs[p].trim().split(/\s+/).filter(Boolean);
    let current = '';

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) {
      lines.push(current);
    }
    if (p < paragraphs.length - 1) {
      lines.push('');
    }
  }

  return lines;
}

async function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function downloadKeepsakeCard(card: TeacherCard): Promise<void> {
  const width = 1200;
  const height = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Sunlit morning gradient (#FEF3C7 -> #FDE68A)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#FEF3C7');
  bgGrad.addColorStop(1, '#FDE68A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Crisp bright white cotton paper sheet with soft shadow
  ctx.save();
  ctx.shadowColor = 'rgba(15, 76, 92, 0.22)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(46, 46, width - 92, height - 92);
  ctx.restore();

  // Outer gold foil double hairline frame
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(64, 64, width - 128, height - 128);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(76, 76, width - 152, height - 152);

  // Header label
  ctx.fillStyle = '#10B981';
  ctx.font = '600 22px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`CHÚC MỪNG NGÀY NHÀ GIÁO VIỆT NAM  ·  ${card.yearLabel}`, width / 2, 126);

  // Portrait frame (360 x 460)
  const frameW = 360;
  const frameH = 460;
  const frameX = (width - frameW) / 2;
  const frameY = 162;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(frameX - 10, frameY - 10, frameW + 20, frameH + 20);
  ctx.strokeStyle = '#C59B57';
  ctx.lineWidth = 2;
  ctx.strokeRect(frameX - 10, frameY - 10, frameW + 20, frameH + 20);

  const portrait =
    (await loadImageSafe(card.photoData)) ??
    (await loadImageSafe(ASSETS.lotusEmblem));

  if (portrait) {
    const scale = Math.max(frameW / portrait.width, frameH / portrait.height);
    const drawW = portrait.width * scale;
    const drawH = portrait.height * scale;
    const drawX = frameX + (frameW - drawW) / 2;
    const drawY = frameY + (frameH - drawH) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(frameX, frameY, frameW, frameH);
    ctx.clip();
    ctx.drawImage(portrait, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  // Teacher honorific & name
  ctx.fillStyle = '#D97706';
  ctx.font = 'italic 600 34px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(card.honorific, width / 2, 682);

  ctx.fillStyle = '#0F4C5C';
  ctx.font = '700 56px "Playfair Display", Georgia, serif';
  ctx.fillText(card.teacherName, width / 2, 748);

  if (card.roleOrSubject) {
    ctx.fillStyle = '#10B981';
    ctx.font = '500 24px "Be Vietnam Pro", sans-serif';
    ctx.fillText(card.roleOrSubject, width / 2, 796);
  }

  // Crisp letter panel
  const paperX = 110;
  const paperY = 842;
  const paperW = width - 220;
  const paperH = 610;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(paperX, paperY, paperW, paperH);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(paperX + 12, paperY + 12, paperW - 24, paperH - 24);

  // Letter body
  ctx.fillStyle = '#0F4C5C';
  ctx.font = '500 27px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'left';
  const lines = wrapTextLines(ctx, card.message, paperW - 120);
  let textY = paperY + 84;
  const maxLines = 11;
  for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
    ctx.fillText(lines[i], paperX + 60, textY);
    textY += lines[i] === '' ? 20 : 40;
  }

  // Sender signature
  ctx.textAlign = 'right';
  ctx.fillStyle = '#D97706';
  ctx.font = '400 38px "Great Vibes", "Dancing Script", cursive';
  ctx.fillText('Kính chúc & Tri ân,', paperX + paperW - 60, paperY + paperH - 96);

  ctx.fillStyle = '#0F4C5C';
  ctx.font = 'italic 600 28px "Playfair Display", Georgia, serif';
  ctx.fillText(card.senderName, paperX + paperW - 60, paperY + paperH - 52);

  // Trigger download
  const link = document.createElement('a');
  link.download = `thiep-20-11-${slugifyVietnamese(card.teacherName)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
