import { MusicTheme } from '../types/card';

interface ScheduledNote {
  midi: number;
  offsetBeats: number;
  beats: number;
  velocity?: number;
}

interface MeasureEvent {
  totalBeats: number;
  melody: ScheduledNote[];
  arpeggio: ScheduledNote[];
  pad?: ScheduledNote[];
  flute?: boolean;
  celesta?: boolean;
}

interface ScoreArrangement {
  bpm: number;
  measures: MeasureEvent[];
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Flowing 4-note broken chord arpeggio across 2 beats
function arp2(notes: [number, number, number, number]): ScheduledNote[] {
  return [
    { midi: notes[0], offsetBeats: 0, beats: 1.9, velocity: 0.42 },
    { midi: notes[1], offsetBeats: 0.5, beats: 1.4, velocity: 0.31 },
    { midi: notes[2], offsetBeats: 1.0, beats: 1.0, velocity: 0.35 },
    { midi: notes[3], offsetBeats: 1.5, beats: 0.9, velocity: 0.29 },
  ];
}

// Gentle 3/4 waltz piano accompaniment across 3 beats (Bass - Chord - Chord)
function waltz3(bass: number, chord: [number, number, number]): ScheduledNote[] {
  return [
    { midi: bass, offsetBeats: 0, beats: 2.8, velocity: 0.46 },
    { midi: chord[0], offsetBeats: 1, beats: 1.15, velocity: 0.24 },
    { midi: chord[1], offsetBeats: 1.02, beats: 1.15, velocity: 0.23 },
    { midi: chord[2], offsetBeats: 1.04, beats: 1.15, velocity: 0.23 },
    { midi: chord[0], offsetBeats: 2, beats: 1.0, velocity: 0.2 },
    { midi: chord[1], offsetBeats: 2.02, beats: 1.0, velocity: 0.19 },
    { midi: chord[2], offsetBeats: 2.04, beats: 1.0, velocity: 0.19 },
  ];
}

// ==================== 1. BỤI PHẤN — Không lời (Vũ Hoàng, C Major, 3/4 Piano & Sáo Trúc) ====================
const BUI_PHAN_SCORE: ScoreArrangement = {
  bpm: 92,
  measures: [
    // Intro bar (gentle C major waltz roll)
    {
      totalBeats: 3,
      melody: [{ midi: 76, offsetBeats: 2, beats: 0.9, velocity: 0.58 }],
      arpeggio: waltz3(48, [55, 60, 64]),
      pad: [{ midi: 48, offsetBeats: 0, beats: 3.1, velocity: 0.2 }],
    },
    // "Khi thầy viết bảng, bụi phấn rơi rơi"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 1.4, velocity: 0.74 }, // G4
        { midi: 69, offsetBeats: 1.5, beats: 0.55, velocity: 0.72 }, // A4
        { midi: 67, offsetBeats: 2.0, beats: 1.05, velocity: 0.74 }, // G4
      ],
      arpeggio: waltz3(48, [55, 60, 64]),
      pad: [{ midi: 48, offsetBeats: 0, beats: 3.1, velocity: 0.24 }],
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 64, offsetBeats: 0, beats: 1.4, velocity: 0.74 }, // E4
        { midi: 67, offsetBeats: 1.5, beats: 0.55, velocity: 0.7 }, // G4
        { midi: 62, offsetBeats: 2.0, beats: 1.05, velocity: 0.72 }, // D4
      ],
      arpeggio: waltz3(45, [52, 57, 60]),
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [{ midi: 60, offsetBeats: 0, beats: 2.7, velocity: 0.76 }], // C4
      arpeggio: waltz3(48, [55, 60, 64]),
      pad: [{ midi: 48, offsetBeats: 0, beats: 3.1, velocity: 0.22 }],
    },
    // "Có hạt bụi nào rơi trên bục giảng"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 62, offsetBeats: 0, beats: 1.4, velocity: 0.74 }, // D4
        { midi: 64, offsetBeats: 1.5, beats: 0.55, velocity: 0.72 }, // E4
        { midi: 67, offsetBeats: 2.0, beats: 1.05, velocity: 0.78 }, // G4
      ],
      arpeggio: waltz3(41, [53, 57, 60]),
      pad: [{ midi: 41, offsetBeats: 0, beats: 3.1, velocity: 0.24 }],
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 1.4, velocity: 0.78 }, // A4
        { midi: 72, offsetBeats: 1.5, beats: 0.55, velocity: 0.8 }, // C5
        { midi: 69, offsetBeats: 2.0, beats: 1.05, velocity: 0.74 }, // A4
      ],
      arpeggio: waltz3(48, [55, 60, 64]),
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 1.6, velocity: 0.76 }, // G4
        { midi: 64, offsetBeats: 2.0, beats: 1.1, velocity: 0.7 }, // E4
      ],
      arpeggio: waltz3(48, [55, 60, 64]),
    },
    // "Có hạt bụi nào vương trên tóc thầy"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 62, offsetBeats: 0, beats: 1.4, velocity: 0.74 }, // D4
        { midi: 64, offsetBeats: 1.5, beats: 0.55, velocity: 0.74 }, // E4
        { midi: 67, offsetBeats: 2.0, beats: 1.05, velocity: 0.78 }, // G4
      ],
      arpeggio: waltz3(50, [53, 57, 62]),
      pad: [{ midi: 50, offsetBeats: 0, beats: 3.1, velocity: 0.24 }],
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 1.4, velocity: 0.78 }, // A4
        { midi: 71, offsetBeats: 1.5, beats: 0.55, velocity: 0.78 }, // B4
        { midi: 72, offsetBeats: 2.0, beats: 1.05, velocity: 0.82 }, // C5
      ],
      arpeggio: waltz3(43, [50, 55, 59]),
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [{ midi: 74, offsetBeats: 0, beats: 2.7, velocity: 0.8 }], // D5
      arpeggio: waltz3(43, [50, 55, 59]),
      pad: [{ midi: 43, offsetBeats: 0, beats: 3.1, velocity: 0.24 }],
    },
    // Chorus: "Em yêu phút giây này, thầy em tóc như bạc thêm"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 72, offsetBeats: 0, beats: 1.0, velocity: 0.82 }, // C5
        { midi: 74, offsetBeats: 1.0, beats: 1.0, velocity: 0.82 }, // D5
        { midi: 76, offsetBeats: 2.0, beats: 1.0, velocity: 0.85 }, // E5
      ],
      arpeggio: waltz3(48, [55, 60, 64]),
      pad: [{ midi: 48, offsetBeats: 0, beats: 3.1, velocity: 0.28 }],
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 74, offsetBeats: 0, beats: 1.4, velocity: 0.8 }, // D5
        { midi: 72, offsetBeats: 1.5, beats: 1.5, velocity: 0.78 }, // C5
      ],
      arpeggio: waltz3(45, [52, 57, 60]),
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 1.0, velocity: 0.76 }, // A4
        { midi: 72, offsetBeats: 1.0, beats: 1.0, velocity: 0.8 }, // C5
        { midi: 74, offsetBeats: 2.0, beats: 1.0, velocity: 0.8 }, // D5
      ],
      arpeggio: waltz3(41, [53, 57, 60]),
      pad: [{ midi: 41, offsetBeats: 0, beats: 3.1, velocity: 0.26 }],
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 72, offsetBeats: 0, beats: 1.4, velocity: 0.78 }, // C5
        { midi: 69, offsetBeats: 1.5, beats: 0.6, velocity: 0.74 }, // A4
        { midi: 67, offsetBeats: 2.0, beats: 1.0, velocity: 0.74 }, // G4
      ],
      arpeggio: waltz3(48, [55, 60, 64]),
    },
    // "Bạc thêm vì bụi phấn, để cho em bài học hay"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 1.0, velocity: 0.78 }, // A4
        { midi: 72, offsetBeats: 1.0, beats: 1.0, velocity: 0.8 }, // C5
        { midi: 74, offsetBeats: 2.0, beats: 1.0, velocity: 0.8 }, // D5
      ],
      arpeggio: waltz3(41, [53, 57, 60]),
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 72, offsetBeats: 0, beats: 1.4, velocity: 0.78 }, // C5
        { midi: 69, offsetBeats: 1.5, beats: 1.5, velocity: 0.74 }, // A4
      ],
      arpeggio: waltz3(43, [50, 55, 59]),
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 64, offsetBeats: 0, beats: 1.0, velocity: 0.74 }, // E4
        { midi: 67, offsetBeats: 1.0, beats: 1.0, velocity: 0.76 }, // G4
        { midi: 69, offsetBeats: 2.0, beats: 1.0, velocity: 0.78 }, // A4
      ],
      arpeggio: waltz3(50, [53, 57, 62]),
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 1.4, velocity: 0.76 }, // G4
        { midi: 62, offsetBeats: 1.5, beats: 1.5, velocity: 0.72 }, // D4
      ],
      arpeggio: waltz3(43, [50, 55, 59]),
    },
    {
      totalBeats: 3,
      flute: true,
      melody: [{ midi: 72, offsetBeats: 0, beats: 3.2, velocity: 0.82 }], // C5
      arpeggio: [
        { midi: 48, offsetBeats: 0, beats: 3.2, velocity: 0.45 },
        { midi: 55, offsetBeats: 0.08, beats: 3.1, velocity: 0.3 },
        { midi: 60, offsetBeats: 0.16, beats: 3.0, velocity: 0.32 },
        { midi: 64, offsetBeats: 0.24, beats: 2.9, velocity: 0.3 },
      ],
      pad: [{ midi: 48, offsetBeats: 0, beats: 3.2, velocity: 0.26 }],
    },
  ],
};

// ==================== 2. NGƯỜI THẦY — Không lời (Nguyễn Nhất Huy, Am/C, 4/4 Ballad) ====================
const NGUOI_THAY_SCORE: ScoreArrangement = {
  bpm: 68,
  measures: [
    // "Người thầy vẫn lặng lẽ đi về sớm trưa"
    {
      totalBeats: 2,
      melody: [
        { midi: 64, offsetBeats: 0, beats: 0.55, velocity: 0.72 }, // E4
        { midi: 69, offsetBeats: 0.5, beats: 0.6, velocity: 0.78 }, // A4
        { midi: 71, offsetBeats: 1.0, beats: 0.55, velocity: 0.76 }, // B4
        { midi: 72, offsetBeats: 1.5, beats: 0.6, velocity: 0.8 }, // C5
      ],
      arpeggio: arp2([45, 52, 57, 60]), // Am
      pad: [{ midi: 45, offsetBeats: 0, beats: 2.2, velocity: 0.25 }],
    },
    {
      totalBeats: 2,
      melody: [
        { midi: 71, offsetBeats: 0, beats: 0.55, velocity: 0.75 }, // B4
        { midi: 69, offsetBeats: 0.5, beats: 0.55, velocity: 0.74 }, // A4
        { midi: 67, offsetBeats: 1.0, beats: 0.55, velocity: 0.72 }, // G4
        { midi: 69, offsetBeats: 1.5, beats: 1.1, velocity: 0.78 }, // A4
      ],
      arpeggio: arp2([40, 47, 52, 55]), // Em
    },
    // "Từng ngày giọt mồ hôi rơi nhòe trang giấy"
    {
      totalBeats: 2,
      melody: [
        { midi: 64, offsetBeats: 0, beats: 0.55, velocity: 0.72 }, // E4
        { midi: 69, offsetBeats: 0.5, beats: 0.6, velocity: 0.76 }, // A4
        { midi: 71, offsetBeats: 1.0, beats: 0.55, velocity: 0.76 }, // B4
        { midi: 72, offsetBeats: 1.5, beats: 0.6, velocity: 0.8 }, // C5
      ],
      arpeggio: arp2([41, 48, 53, 57]), // F
      pad: [{ midi: 41, offsetBeats: 0, beats: 2.2, velocity: 0.24 }],
    },
    {
      totalBeats: 2,
      melody: [
        { midi: 71, offsetBeats: 0, beats: 0.55, velocity: 0.74 }, // B4
        { midi: 69, offsetBeats: 0.5, beats: 0.55, velocity: 0.74 }, // A4
        { midi: 67, offsetBeats: 1.0, beats: 1.1, velocity: 0.72 }, // G4
      ],
      arpeggio: arp2([43, 50, 55, 59]), // G
    },
    // Chorus: "Dù năm tháng vô tình trôi mãi mãi"
    {
      totalBeats: 2,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.55, velocity: 0.78 }, // A4
        { midi: 72, offsetBeats: 0.5, beats: 0.55, velocity: 0.8 }, // C5
        { midi: 74, offsetBeats: 1.0, beats: 0.55, velocity: 0.82 }, // D5
        { midi: 76, offsetBeats: 1.5, beats: 0.7, velocity: 0.85 }, // E5
      ],
      arpeggio: arp2([48, 55, 60, 64]), // C
      pad: [{ midi: 48, offsetBeats: 0, beats: 2.2, velocity: 0.26 }],
    },
    {
      totalBeats: 2,
      flute: true,
      melody: [
        { midi: 74, offsetBeats: 0, beats: 0.55, velocity: 0.8 }, // D5
        { midi: 72, offsetBeats: 0.5, beats: 0.55, velocity: 0.76 }, // C5
        { midi: 69, offsetBeats: 1.0, beats: 1.1, velocity: 0.76 }, // A4
      ],
      arpeggio: arp2([43, 50, 55, 59]), // G
    },
    // "Thầy đã đi qua bao nhiêu chuyến đò... cho em thấy ánh mặt trời mai"
    {
      totalBeats: 2,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.55, velocity: 0.76 }, // A4
        { midi: 72, offsetBeats: 0.5, beats: 0.55, velocity: 0.78 }, // C5
        { midi: 74, offsetBeats: 1.0, beats: 0.55, velocity: 0.82 }, // D5
        { midi: 72, offsetBeats: 1.5, beats: 0.6, velocity: 0.76 }, // C5
      ],
      arpeggio: arp2([41, 48, 53, 57]), // F
      pad: [{ midi: 41, offsetBeats: 0, beats: 2.2, velocity: 0.26 }],
    },
    {
      totalBeats: 2,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.55, velocity: 0.75 }, // A4
        { midi: 67, offsetBeats: 0.5, beats: 0.55, velocity: 0.72 }, // G4
        { midi: 64, offsetBeats: 1.0, beats: 0.55, velocity: 0.7 }, // E4
        { midi: 69, offsetBeats: 1.5, beats: 1.8, velocity: 0.78 }, // A4
      ],
      arpeggio: arp2([45, 52, 57, 60]), // Am
      pad: [{ midi: 45, offsetBeats: 0, beats: 2.4, velocity: 0.26 }],
    },
  ],
};

// ==================== 3. MONG ƯỚC KỶ NIỆM XƯA — Không lời (Xuân Phương, G Major, 4/4) ====================
const MONG_UOC_SCORE: ScoreArrangement = {
  bpm: 74,
  measures: [
    // "Thời gian trôi qua mau, chỉ còn lại những kỷ niệm"
    {
      totalBeats: 2,
      melody: [
        { midi: 62, offsetBeats: 0, beats: 0.55, velocity: 0.72 }, // D4
        { midi: 67, offsetBeats: 0.5, beats: 0.55, velocity: 0.76 }, // G4
        { midi: 69, offsetBeats: 1.0, beats: 0.55, velocity: 0.76 }, // A4
        { midi: 71, offsetBeats: 1.5, beats: 0.6, velocity: 0.78 }, // B4
      ],
      arpeggio: arp2([43, 50, 55, 59]), // G
      pad: [{ midi: 43, offsetBeats: 0, beats: 2.2, velocity: 0.22 }],
    },
    {
      totalBeats: 2,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.85, velocity: 0.76 }, // A4
        { midi: 67, offsetBeats: 0.75, beats: 0.45, velocity: 0.72 }, // G4
        { midi: 64, offsetBeats: 1.25, beats: 0.85, velocity: 0.72 }, // E4
      ],
      arpeggio: arp2([42, 50, 54, 57]), // D/F#
    },
    // "Kỷ niệm thân yêu ơi, sẽ còn nhớ mãi tiếng thầy cô"
    {
      totalBeats: 2,
      melody: [
        { midi: 62, offsetBeats: 0, beats: 0.55, velocity: 0.72 }, // D4
        { midi: 67, offsetBeats: 0.5, beats: 0.55, velocity: 0.76 }, // G4
        { midi: 69, offsetBeats: 1.0, beats: 0.55, velocity: 0.78 }, // A4
        { midi: 71, offsetBeats: 1.5, beats: 0.6, velocity: 0.8 }, // B4
      ],
      arpeggio: arp2([40, 47, 52, 55]), // Em
      pad: [{ midi: 40, offsetBeats: 0, beats: 2.2, velocity: 0.22 }],
    },
    {
      totalBeats: 2,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.7, velocity: 0.76 }, // A4
        { midi: 67, offsetBeats: 0.75, beats: 0.55, velocity: 0.74 }, // G4
        { midi: 67, offsetBeats: 1.25, beats: 0.9, velocity: 0.74 }, // G4
      ],
      arpeggio: arp2([47, 54, 59, 62]), // Bm
    },
    // Chorus: "Nếu có ước muốn trong cuộc đời này"
    {
      totalBeats: 2,
      flute: true,
      celesta: true,
      melody: [
        { midi: 71, offsetBeats: 0, beats: 0.55, velocity: 0.78 }, // B4
        { midi: 74, offsetBeats: 0.5, beats: 0.55, velocity: 0.8 }, // D5
        { midi: 76, offsetBeats: 1.0, beats: 0.55, velocity: 0.84 }, // E5
        { midi: 74, offsetBeats: 1.5, beats: 0.6, velocity: 0.78 }, // D5
      ],
      arpeggio: arp2([48, 55, 60, 64]), // C
      pad: [{ midi: 48, offsetBeats: 0, beats: 2.2, velocity: 0.25 }],
    },
    {
      totalBeats: 2,
      flute: true,
      celesta: true,
      melody: [
        { midi: 71, offsetBeats: 0, beats: 0.55, velocity: 0.76 }, // B4
        { midi: 69, offsetBeats: 0.5, beats: 0.55, velocity: 0.74 }, // A4
        { midi: 67, offsetBeats: 1.0, beats: 0.55, velocity: 0.74 }, // G4
        { midi: 69, offsetBeats: 1.5, beats: 0.75, velocity: 0.76 }, // A4
      ],
      arpeggio: arp2([43, 50, 55, 59]), // G
    },
    // "Hãy nhớ ước muốn cho thời gian trở lại..."
    {
      totalBeats: 2,
      flute: true,
      celesta: true,
      melody: [
        { midi: 71, offsetBeats: 0, beats: 0.55, velocity: 0.78 }, // B4
        { midi: 74, offsetBeats: 0.5, beats: 0.55, velocity: 0.8 }, // D5
        { midi: 76, offsetBeats: 1.0, beats: 0.55, velocity: 0.84 }, // E5
        { midi: 74, offsetBeats: 1.5, beats: 0.6, velocity: 0.78 }, // D5
      ],
      arpeggio: arp2([45, 52, 57, 60]), // Am
      pad: [{ midi: 45, offsetBeats: 0, beats: 2.2, velocity: 0.24 }],
    },
    {
      totalBeats: 2,
      flute: true,
      celesta: true,
      melody: [
        { midi: 71, offsetBeats: 0, beats: 0.55, velocity: 0.76 }, // B4
        { midi: 69, offsetBeats: 0.5, beats: 0.55, velocity: 0.74 }, // A4
        { midi: 67, offsetBeats: 1.0, beats: 1.6, velocity: 0.78 }, // G4
      ],
      arpeggio: arp2([50, 57, 62, 66]), // D -> G
      pad: [{ midi: 43, offsetBeats: 0, beats: 2.4, velocity: 0.25 }],
    },
  ],
};

// ==================== 4. NHỚ ƠN THẦY CÔ — Không lời (F Major, 4/4 Celesta & Piano) ====================
const NHO_ON_THAY_CO_SCORE: ScoreArrangement = {
  bpm: 78,
  measures: [
    {
      totalBeats: 2,
      celesta: true,
      melody: [
        { midi: 65, offsetBeats: 0, beats: 0.55, velocity: 0.74 }, // F4
        { midi: 67, offsetBeats: 0.5, beats: 0.55, velocity: 0.74 }, // G4
        { midi: 69, offsetBeats: 1.0, beats: 0.55, velocity: 0.78 }, // A4
        { midi: 72, offsetBeats: 1.5, beats: 0.6, velocity: 0.8 }, // C5
      ],
      arpeggio: arp2([41, 48, 53, 57]), // F
      pad: [{ midi: 41, offsetBeats: 0, beats: 2.2, velocity: 0.22 }],
    },
    {
      totalBeats: 2,
      celesta: true,
      melody: [
        { midi: 74, offsetBeats: 0, beats: 0.85, velocity: 0.82 }, // D5
        { midi: 72, offsetBeats: 0.75, beats: 0.45, velocity: 0.76 }, // C5
        { midi: 69, offsetBeats: 1.25, beats: 0.9, velocity: 0.75 }, // A4
      ],
      arpeggio: arp2([38, 45, 50, 53]), // Dm
    },
    {
      totalBeats: 2,
      celesta: true,
      melody: [
        { midi: 70, offsetBeats: 0, beats: 0.55, velocity: 0.76 }, // Bb4
        { midi: 69, offsetBeats: 0.5, beats: 0.55, velocity: 0.74 }, // A4
        { midi: 67, offsetBeats: 1.0, beats: 0.55, velocity: 0.72 }, // G4
        { midi: 65, offsetBeats: 1.5, beats: 0.6, velocity: 0.72 }, // F4
      ],
      arpeggio: arp2([46, 53, 58, 62]), // Bb
      pad: [{ midi: 46, offsetBeats: 0, beats: 2.2, velocity: 0.22 }],
    },
    {
      totalBeats: 2,
      celesta: true,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 1.1, velocity: 0.76 }, // G4
        { midi: 64, offsetBeats: 1.0, beats: 1.1, velocity: 0.72 }, // E4
      ],
      arpeggio: arp2([48, 55, 60, 64]), // C
    },
    {
      totalBeats: 2,
      flute: true,
      celesta: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.55, velocity: 0.78 }, // A4
        { midi: 72, offsetBeats: 0.5, beats: 0.55, velocity: 0.8 }, // C5
        { midi: 74, offsetBeats: 1.0, beats: 0.55, velocity: 0.82 }, // D5
        { midi: 77, offsetBeats: 1.5, beats: 0.65, velocity: 0.84 }, // F5
      ],
      arpeggio: arp2([41, 48, 53, 57]), // F
      pad: [{ midi: 41, offsetBeats: 0, beats: 2.2, velocity: 0.24 }],
    },
    {
      totalBeats: 2,
      flute: true,
      celesta: true,
      melody: [
        { midi: 76, offsetBeats: 0, beats: 0.55, velocity: 0.82 }, // E5
        { midi: 74, offsetBeats: 0.5, beats: 0.55, velocity: 0.78 }, // D5
        { midi: 72, offsetBeats: 1.0, beats: 1.1, velocity: 0.78 }, // C5
      ],
      arpeggio: arp2([48, 55, 60, 64]), // C
    },
    {
      totalBeats: 2,
      flute: true,
      celesta: true,
      melody: [
        { midi: 70, offsetBeats: 0, beats: 0.55, velocity: 0.78 }, // Bb4
        { midi: 69, offsetBeats: 0.5, beats: 0.55, velocity: 0.76 }, // A4
        { midi: 67, offsetBeats: 1.0, beats: 1.0, velocity: 0.74 }, // G4
      ],
      arpeggio: arp2([43, 50, 55, 58]), // Gm
    },
    {
      totalBeats: 2,
      flute: true,
      celesta: true,
      melody: [{ midi: 65, offsetBeats: 0, beats: 2.3, velocity: 0.8 }], // F4
      arpeggio: arp2([41, 48, 53, 57]), // F
      pad: [{ midi: 41, offsetBeats: 0, beats: 2.4, velocity: 0.26 }],
    },
  ],
};

// ==================== 5. CANON IN D — Cổ điển (D Major, 4/4, Piano & Dây) ====================
const CANON_IN_D_SCORE: ScoreArrangement = {
  bpm: 64,
  measures: [
    { totalBeats: 2, melody: [], arpeggio: arp2([50, 57, 62, 66]), pad: [{ midi: 50, offsetBeats: 0, beats: 2.2, velocity: 0.22 }] },
    { totalBeats: 2, melody: [], arpeggio: arp2([45, 52, 57, 61]), pad: [{ midi: 45, offsetBeats: 0, beats: 2.2, velocity: 0.22 }] },
    { totalBeats: 2, melody: [{ midi: 78, offsetBeats: 0, beats: 2.1, velocity: 0.78 }], arpeggio: arp2([50, 57, 62, 66]), pad: [{ midi: 50, offsetBeats: 0, beats: 2.2, velocity: 0.26 }] },
    { totalBeats: 2, melody: [{ midi: 76, offsetBeats: 0, beats: 2.1, velocity: 0.72 }], arpeggio: arp2([45, 52, 57, 61]), pad: [{ midi: 45, offsetBeats: 0, beats: 2.2, velocity: 0.26 }] },
    { totalBeats: 2, melody: [{ midi: 74, offsetBeats: 0, beats: 2.1, velocity: 0.75 }], arpeggio: arp2([47, 54, 59, 62]), pad: [{ midi: 47, offsetBeats: 0, beats: 2.2, velocity: 0.26 }] },
    { totalBeats: 2, melody: [{ midi: 73, offsetBeats: 0, beats: 2.1, velocity: 0.7 }], arpeggio: arp2([42, 49, 54, 57]), pad: [{ midi: 42, offsetBeats: 0, beats: 2.2, velocity: 0.26 }] },
    { totalBeats: 2, melody: [{ midi: 71, offsetBeats: 0, beats: 2.1, velocity: 0.74 }], arpeggio: arp2([43, 50, 55, 59]), pad: [{ midi: 43, offsetBeats: 0, beats: 2.2, velocity: 0.26 }] },
    { totalBeats: 2, melody: [{ midi: 69, offsetBeats: 0, beats: 2.1, velocity: 0.68 }], arpeggio: arp2([38, 45, 50, 54]), pad: [{ midi: 38, offsetBeats: 0, beats: 2.2, velocity: 0.26 }] },
    { totalBeats: 2, melody: [{ midi: 71, offsetBeats: 0, beats: 2.1, velocity: 0.72 }], arpeggio: arp2([43, 50, 55, 59]), pad: [{ midi: 43, offsetBeats: 0, beats: 2.2, velocity: 0.26 }] },
    { totalBeats: 2, melody: [{ midi: 73, offsetBeats: 0, beats: 2.1, velocity: 0.74 }], arpeggio: arp2([45, 52, 57, 61]), pad: [{ midi: 45, offsetBeats: 0, beats: 2.2, velocity: 0.26 }] },
    {
      totalBeats: 2,
      melody: [
        { midi: 74, offsetBeats: 0, beats: 0.65, velocity: 0.76 },
        { midi: 78, offsetBeats: 0.5, beats: 0.65, velocity: 0.72 },
        { midi: 81, offsetBeats: 1.0, beats: 0.65, velocity: 0.8 },
        { midi: 79, offsetBeats: 1.5, beats: 0.65, velocity: 0.7 },
      ],
      arpeggio: arp2([50, 57, 62, 66]),
      pad: [{ midi: 50, offsetBeats: 0, beats: 2.2, velocity: 0.3 }],
    },
    {
      totalBeats: 2,
      melody: [
        { midi: 78, offsetBeats: 0, beats: 0.65, velocity: 0.76 },
        { midi: 74, offsetBeats: 0.5, beats: 0.65, velocity: 0.68 },
        { midi: 76, offsetBeats: 1.0, beats: 1.2, velocity: 0.74 },
      ],
      arpeggio: arp2([45, 52, 57, 61]),
      pad: [{ midi: 45, offsetBeats: 0, beats: 2.2, velocity: 0.3 }],
    },
    {
      totalBeats: 2,
      melody: [
        { midi: 74, offsetBeats: 0, beats: 0.65, velocity: 0.75 },
        { midi: 78, offsetBeats: 0.5, beats: 0.65, velocity: 0.72 },
        { midi: 71, offsetBeats: 1.0, beats: 0.65, velocity: 0.68 },
        { midi: 74, offsetBeats: 1.5, beats: 0.65, velocity: 0.72 },
      ],
      arpeggio: arp2([47, 54, 59, 62]),
      pad: [{ midi: 47, offsetBeats: 0, beats: 2.2, velocity: 0.3 }],
    },
    {
      totalBeats: 2,
      melody: [
        { midi: 73, offsetBeats: 0, beats: 0.65, velocity: 0.74 },
        { midi: 69, offsetBeats: 0.5, beats: 0.65, velocity: 0.66 },
        { midi: 73, offsetBeats: 1.0, beats: 1.2, velocity: 0.72 },
      ],
      arpeggio: arp2([42, 49, 54, 57]),
      pad: [{ midi: 42, offsetBeats: 0, beats: 2.2, velocity: 0.3 }],
    },
    {
      totalBeats: 2,
      melody: [
        { midi: 71, offsetBeats: 0, beats: 0.65, velocity: 0.76 },
        { midi: 74, offsetBeats: 0.5, beats: 0.65, velocity: 0.72 },
        { midi: 79, offsetBeats: 1.0, beats: 0.65, velocity: 0.8 },
        { midi: 78, offsetBeats: 1.5, beats: 0.65, velocity: 0.72 },
      ],
      arpeggio: arp2([43, 50, 55, 59]),
      pad: [{ midi: 43, offsetBeats: 0, beats: 2.2, velocity: 0.3 }],
    },
    {
      totalBeats: 2,
      melody: [
        { midi: 78, offsetBeats: 0, beats: 0.65, velocity: 0.75 },
        { midi: 74, offsetBeats: 0.5, beats: 0.65, velocity: 0.7 },
        { midi: 69, offsetBeats: 1.0, beats: 1.2, velocity: 0.72 },
      ],
      arpeggio: arp2([38, 45, 50, 54]),
      pad: [{ midi: 38, offsetBeats: 0, beats: 2.2, velocity: 0.3 }],
    },
  ],
};

class TeacherMusicPlayer {
  private ctx: AudioContext | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private timerId: number | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private measureIndex = 0;

  private createHallReverbBuffer(ctx: AudioContext): AudioBuffer {
    const duration = 2.4;
    const length = Math.floor(ctx.sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let prev = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const decay = Math.pow(1 - t, 2.7);
        const raw = (Math.random() * 2 - 1) * decay;
        prev = prev * 0.72 + raw * 0.28;
        data[i] = prev;
      }
    }
    return impulse;
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      compressor.knee.setValueAtTime(14, ctx.currentTime);
      compressor.ratio.setValueAtTime(3.5, ctx.currentTime);
      compressor.attack.setValueAtTime(0.01, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      const master = ctx.createGain();
      master.gain.value = 0.48;

      const dry = ctx.createGain();
      dry.gain.value = 0.76;

      const wet = ctx.createGain();
      wet.gain.value = 0.36;

      const convolver = ctx.createConvolver();
      convolver.buffer = this.createHallReverbBuffer(ctx);

      dry.connect(compressor);
      convolver.connect(wet);
      wet.connect(compressor);
      compressor.connect(master);
      master.connect(ctx.destination);

      this.ctx = ctx;
      this.dryGain = dry;
      this.wetGain = convolver as unknown as GainNode;
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playPianoNote(midi: number, when: number, durationSec: number, velocity = 0.7): void {
    const ctx = this.ctx;
    const dry = this.dryGain;
    const wet = this.wetGain;
    if (!ctx || !dry || !wet) return;

    const freq = midiToFreq(midi);
    const totalDur = Math.max(0.45, durationSec * 1.45);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 0.7;
    const brightFreq = Math.min(5400, Math.max(1200, freq * 5.6));
    const warmFreq = Math.max(620, freq * 1.85);
    filter.frequency.setValueAtTime(brightFreq, when);
    filter.frequency.exponentialRampToValueAtTime(warmFreq, when + Math.min(0.95, totalDur * 0.65));

    const env = ctx.createGain();
    const peak = Math.min(0.42, velocity * 0.32);
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(peak, when + 0.012);
    env.gain.exponentialRampToValueAtTime(peak * 0.42, when + Math.min(0.35, totalDur * 0.3));
    env.gain.exponentialRampToValueAtTime(0.0001, when + totalDur);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, when);
    const g1 = ctx.createGain();
    g1.gain.value = 0.76;

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, when);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.2, when);
    g2.gain.exponentialRampToValueAtTime(0.04, when + totalDur * 0.55);

    const osc3 = ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(freq * 3, when);
    const g3 = ctx.createGain();
    g3.gain.setValueAtTime(0.06, when);
    g3.gain.exponentialRampToValueAtTime(0.001, when + 0.22);

    osc1.connect(g1);
    osc2.connect(g2);
    osc3.connect(g3);
    g1.connect(filter);
    g2.connect(filter);
    g3.connect(filter);

    filter.connect(env);
    env.connect(dry);
    env.connect(wet);

    osc1.start(when);
    osc2.start(when);
    osc3.start(when);
    osc1.stop(when + totalDur + 0.05);
    osc2.stop(when + totalDur + 0.05);
    osc3.stop(when + totalDur + 0.05);
  }

  // Expressive warm Bamboo Flute / Violin lead with delayed vibrato LFO
  private playFluteLead(midi: number, when: number, durationSec: number, velocity = 0.6): void {
    const ctx = this.ctx;
    const dry = this.dryGain;
    const wet = this.wetGain;
    if (!ctx || !dry || !wet) return;

    const freq = midiToFreq(midi + 12);
    const totalDur = Math.max(0.32, durationSec * 1.08);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2100, when);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, when);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.2, when);

    const lfoDepth = ctx.createGain();
    lfoDepth.gain.setValueAtTime(0, when);
    lfoDepth.gain.linearRampToValueAtTime(freq * 0.0035, when + Math.min(0.28, totalDur * 0.45));

    lfo.connect(lfoDepth);
    lfoDepth.connect(osc.frequency);

    const env = ctx.createGain();
    const peak = Math.min(0.16, velocity * 0.14);
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(peak, when + 0.075);
    env.gain.exponentialRampToValueAtTime(peak * 0.72, when + totalDur * 0.75);
    env.gain.exponentialRampToValueAtTime(0.0001, when + totalDur);

    osc.connect(filter);
    filter.connect(env);
    env.connect(dry);
    env.connect(wet);

    osc.start(when);
    lfo.start(when);
    osc.stop(when + totalDur + 0.04);
    lfo.stop(when + totalDur + 0.04);
  }

  private playStringPad(midi: number, when: number, durationSec: number, velocity = 0.24): void {
    const ctx = this.ctx;
    const dry = this.dryGain;
    const wet = this.wetGain;
    if (!ctx || !dry || !wet) return;

    const freq = midiToFreq(midi);
    const totalDur = Math.max(0.8, durationSec * 1.25);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(720, when);

    const env = ctx.createGain();
    const peak = Math.min(0.22, velocity * 0.45);
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(peak, when + Math.min(0.42, totalDur * 0.35));
    env.gain.exponentialRampToValueAtTime(0.0001, when + totalDur);

    const oscA = ctx.createOscillator();
    oscA.type = 'triangle';
    oscA.frequency.setValueAtTime(freq, when);
    oscA.detune.setValueAtTime(-4.5, when);

    const oscB = ctx.createOscillator();
    oscB.type = 'sine';
    oscB.frequency.setValueAtTime(freq, when);
    oscB.detune.setValueAtTime(4.5, when);

    oscA.connect(filter);
    oscB.connect(filter);
    filter.connect(env);
    env.connect(dry);
    env.connect(wet);

    oscA.start(when);
    oscB.start(when);
    oscA.stop(when + totalDur + 0.05);
    oscB.stop(when + totalDur + 0.05);
  }

  private playCelestaChime(midi: number, when: number, durationSec: number, velocity = 0.35): void {
    const ctx = this.ctx;
    const dry = this.dryGain;
    const wet = this.wetGain;
    if (!ctx || !dry || !wet) return;

    const freq = midiToFreq(midi + 12);
    const totalDur = Math.max(0.7, durationSec * 1.4);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, when);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(velocity * 0.14, when + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, when + totalDur);

    osc.connect(env);
    env.connect(dry);
    env.connect(wet);
    osc.start(when);
    osc.stop(when + totalDur + 0.05);
  }

  private scheduleScoreLoop(theme: Exclude<MusicTheme, 'custom' | 'none'>): void {
    const score =
      theme === 'nguoi-thay'
        ? NGUOI_THAY_SCORE
        : theme === 'mong-uoc-ky-niem-xua'
          ? MONG_UOC_SCORE
          : theme === 'nho-on-thay-co'
            ? NHO_ON_THAY_CO_SCORE
            : theme === 'canon-in-d'
              ? CANON_IN_D_SCORE
              : BUI_PHAN_SCORE;

    const secPerBeat = 60 / score.bpm;

    const scheduleNextMeasure = () => {
      if (!this.isPlaying || !this.ctx) return;

      const measure = score.measures[this.measureIndex % score.measures.length];
      const baseTime = this.ctx.currentTime + 0.05;

      for (const note of measure.melody) {
        const when = baseTime + note.offsetBeats * secPerBeat;
        const dur = note.beats * secPerBeat;
        this.playPianoNote(note.midi, when, dur, note.velocity ?? 0.74);
        if (measure.flute) {
          this.playFluteLead(note.midi, when, dur, note.velocity ?? 0.65);
        }
        if (measure.celesta) {
          this.playCelestaChime(note.midi, when, dur, note.velocity ?? 0.4);
        }
      }

      for (const note of measure.arpeggio) {
        const when = baseTime + note.offsetBeats * secPerBeat;
        const dur = note.beats * secPerBeat;
        this.playPianoNote(note.midi, when, dur, note.velocity ?? 0.34);
      }

      if (measure.pad) {
        for (const padNote of measure.pad) {
          const when = baseTime + padNote.offsetBeats * secPerBeat;
          const dur = padNote.beats * secPerBeat;
          this.playStringPad(padNote.midi, when, dur, padNote.velocity ?? 0.24);
        }
      }

      this.measureIndex = (this.measureIndex + 1) % score.measures.length;
      const measureMs = measure.totalBeats * secPerBeat * 1000;
      this.timerId = window.setTimeout(scheduleNextMeasure, Math.max(180, measureMs - 30));
    };

    scheduleNextMeasure();
  }

  public start(theme: MusicTheme, customAudioUrl?: string): void {
    this.stop();
    if (theme === 'none') return;

    this.isPlaying = true;
    this.measureIndex = 0;

    if (theme === 'custom' && customAudioUrl?.trim()) {
      try {
        const audio = new Audio(customAudioUrl.trim());
        audio.loop = true;
        audio.volume = 0.55;
        this.customAudio = audio;
        void audio.play().catch(() => {
          if (this.isPlaying) {
            this.ensureContext();
            this.scheduleScoreLoop('bui-phan');
          }
        });
        return;
      } catch {
        // Fallback below
      }
    }

    this.ensureContext();
    const safeTheme: Exclude<MusicTheme, 'custom' | 'none'> =
      theme === 'nguoi-thay' ||
      theme === 'mong-uoc-ky-niem-xua' ||
      theme === 'nho-on-thay-co' ||
      theme === 'canon-in-d'
        ? theme
        : 'bui-phan';
    this.scheduleScoreLoop(safeTheme);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.src = '';
      this.customAudio = null;
    }
  }
}

export const teacherMusic = new TeacherMusicPlayer();
