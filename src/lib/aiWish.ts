export const WISH_TONE_PRESETS = [
  'Trang trọng & Sâu lắng',
  'Ấm áp & Gần gũi',
  'Cựu học sinh tri ân',
  'Thơ lục bát',
  'Vui tươi & Trẻ trung',
] as const;

export type WishTone = (typeof WISH_TONE_PRESETS)[number];

export interface GenerateWishParams {
  honorific: string;
  teacherName: string;
  roleOrSubject?: string;
  senderName: string;
  tone: string;
  memories?: string;
}

export async function generateAiWish(params: GenerateWishParams): Promise<string> {
  const response = await fetch('/api/generate-wish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
  };

  if (!response.ok || !payload.message) {
    throw new Error(
      payload.error || 'Không thể sinh lời chúc từ AI lúc này. Vui lòng thử lại.'
    );
  }

  return payload.message;
}
