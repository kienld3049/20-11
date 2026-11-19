import { MusicTheme } from '../types/card';

type InstrumentKind = 'piano' | 'flute' | 'strings' | 'celesta';

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

const SAMPLE_BANK: Record<InstrumentKind, { folder: string; cdn: string; notes: { name: string; midi: number }[] }> = {
  piano: {
    folder: '/samples/piano',
    cdn: 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_grand_piano-mp3',
    notes: [
      { name: 'C2', midi: 36 },
      { name: 'Eb2', midi: 39 },
      { name: 'Gb2', midi: 42 },
      { name: 'A2', midi: 45 },
      { name: 'C3', midi: 48 },
      { name: 'Eb3', midi: 51 },
      { name: 'Gb3', midi: 54 },
      { name: 'A3', midi: 57 },
      { name: 'C4', midi: 60 },
      { name: 'Eb4', midi: 63 },
      { name: 'Gb4', midi: 66 },
      { name: 'A4', midi: 69 },
      { name: 'C5', midi: 72 },
      { name: 'Eb5', midi: 75 },
      { name: 'Gb5', midi: 78 },
      { name: 'A5', midi: 81 },
      { name: 'C6', midi: 84 },
    ],
  },
  flute: {
    folder: '/samples/flute',
    cdn: 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/flute-mp3',
    notes: [
      { name: 'C4', midi: 60 },
      { name: 'Eb4', midi: 63 },
      { name: 'Gb4', midi: 66 },
      { name: 'A4', midi: 69 },
      { name: 'C5', midi: 72 },
      { name: 'Eb5', midi: 75 },
      { name: 'Gb5', midi: 78 },
      { name: 'A5', midi: 81 },
      { name: 'C6', midi: 84 },
    ],
  },
  strings: {
    folder: '/samples/strings',
    cdn: 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/string_ensemble_1-mp3',
    notes: [
      { name: 'C3', midi: 48 },
      { name: 'Eb3', midi: 51 },
      { name: 'Gb3', midi: 54 },
      { name: 'A3', midi: 57 },
      { name: 'C4', midi: 60 },
      { name: 'Eb4', midi: 63 },
      { name: 'Gb4', midi: 66 },
      { name: 'A4', midi: 69 },
      { name: 'C5', midi: 72 },
    ],
  },
  celesta: {
    folder: '/samples/celesta',
    cdn: 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/celesta-mp3',
    notes: [
      { name: 'C4', midi: 60 },
      { name: 'Eb4', midi: 63 },
      { name: 'Gb4', midi: 66 },
      { name: 'A4', midi: 69 },
      { name: 'C5', midi: 72 },
      { name: 'Eb5', midi: 75 },
      { name: 'Gb5', midi: 78 },
      { name: 'A5', midi: 81 },
    ],
  },
};

// Gentle 4/4 piano arpeggio across 4 beats
function arp4(bass: number, c1: number, c2: number, c3: number): ScheduledNote[] {
  return [
    { midi: bass, offsetBeats: 0, beats: 3.8, velocity: 0.54 },
    { midi: c1, offsetBeats: 0.5, beats: 1.6, velocity: 0.34 },
    { midi: c2, offsetBeats: 1.0, beats: 1.5, velocity: 0.38 },
    { midi: c3, offsetBeats: 1.5, beats: 1.4, velocity: 0.34 },
    { midi: c1, offsetBeats: 2.0, beats: 1.8, velocity: 0.36 },
    { midi: c2, offsetBeats: 2.5, beats: 1.4, velocity: 0.33 },
    { midi: c3, offsetBeats: 3.0, beats: 1.1, velocity: 0.36 },
    { midi: c2, offsetBeats: 3.5, beats: 0.9, velocity: 0.31 },
  ];
}

// Gentle 3/4 waltz piano accompaniment across 3 beats
function waltz3(bass: number, chord: [number, number, number]): ScheduledNote[] {
  return [
    { midi: bass, offsetBeats: 0, beats: 2.8, velocity: 0.56 },
    { midi: chord[0], offsetBeats: 1, beats: 1.15, velocity: 0.32 },
    { midi: chord[1], offsetBeats: 1.02, beats: 1.15, velocity: 0.3 },
    { midi: chord[2], offsetBeats: 1.04, beats: 1.15, velocity: 0.3 },
    { midi: chord[0], offsetBeats: 2, beats: 1.0, velocity: 0.28 },
    { midi: chord[1], offsetBeats: 2.02, beats: 1.0, velocity: 0.26 },
    { midi: chord[2], offsetBeats: 2.04, beats: 1.0, velocity: 0.26 },
  ];
}

// ==================== 1. BỤI PHẤN (Vũ Hoàng - Key of F Major, 3/4) ====================
const BUI_PHAN_SCORE: ScoreArrangement = {
  bpm: 88,
  measures: [
    // Intro F
    {
      totalBeats: 3,
      melody: [],
      arpeggio: waltz3(41, [53, 57, 60]),
      pad: [{ midi: 53, offsetBeats: 0, beats: 3.1, velocity: 0.28 }],
    },
    // "Khi thầy viết"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 72, offsetBeats: 0, beats: 1.5, velocity: 0.8 }, // C5 - Khi
        { midi: 69, offsetBeats: 1.5, beats: 0.5, velocity: 0.75 }, // A4 - thầy
        { midi: 72, offsetBeats: 2.0, beats: 1.0, velocity: 0.8 }, // C5 - viết
      ],
      arpeggio: waltz3(41, [53, 57, 60]),
      pad: [{ midi: 53, offsetBeats: 0, beats: 3.1, velocity: 0.3 }],
    },
    // "bảng, bụi phấn"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 74, offsetBeats: 0, beats: 1.0, velocity: 0.82 }, // D5 - bảng
        { midi: 65, offsetBeats: 1.0, beats: 1.0, velocity: 0.74 }, // F4 - bụi
        { midi: 72, offsetBeats: 2.0, beats: 1.0, velocity: 0.8 }, // C5 - phấn
      ],
      arpeggio: waltz3(50, [53, 57, 62]),
    },
    // "rơi rơi"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 74, offsetBeats: 0, beats: 0.5, velocity: 0.8 }, // D5
        { midi: 72, offsetBeats: 0.5, beats: 1.5, velocity: 0.78 }, // C5 - rơi
        { midi: 72, offsetBeats: 2.0, beats: 1.0, velocity: 0.76 }, // C5 - rơi
      ],
      arpeggio: waltz3(48, [52, 55, 60]),
      pad: [{ midi: 48, offsetBeats: 0, beats: 3.1, velocity: 0.28 }],
    },
    // "Có hạt bụi nào"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 70, offsetBeats: 0, beats: 1.0, velocity: 0.8 }, // Bb4 - Có
        { midi: 67, offsetBeats: 1.0, beats: 0.5, velocity: 0.75 }, // G4 - hạt
        { midi: 65, offsetBeats: 1.5, beats: 0.5, velocity: 0.74 }, // F4 - bụi
        { midi: 67, offsetBeats: 2.0, beats: 1.0, velocity: 0.78 }, // G4 - nào
      ],
      arpeggio: waltz3(46, [53, 58, 62]),
      pad: [{ midi: 58, offsetBeats: 0, beats: 3.1, velocity: 0.28 }],
    },
    // "rơi trên bục giảng"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 70, offsetBeats: 0, beats: 1.0, velocity: 0.78 }, // Bb4 - rơi
        { midi: 70, offsetBeats: 1.0, beats: 0.5, velocity: 0.76 }, // Bb4 - trên
        { midi: 72, offsetBeats: 1.5, beats: 0.5, velocity: 0.8 }, // C5 - bục
        { midi: 74, offsetBeats: 2.0, beats: 1.2, velocity: 0.82 }, // D5 - giảng
      ],
      arpeggio: waltz3(43, [55, 58, 62]),
    },
    // "Có hạt bụi nào"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 0.5, velocity: 0.75 }, // G4 - Có
        { midi: 69, offsetBeats: 0.5, beats: 0.5, velocity: 0.78 }, // A4 - hạt
        { midi: 64, offsetBeats: 1.0, beats: 1.0, velocity: 0.74 }, // E4 - bụi
        { midi: 62, offsetBeats: 2.0, beats: 0.5, velocity: 0.72 }, // D4
        { midi: 64, offsetBeats: 2.5, beats: 0.6, velocity: 0.74 }, // E4 - nào
      ],
      arpeggio: waltz3(48, [52, 55, 58]),
      pad: [{ midi: 48, offsetBeats: 0, beats: 3.1, velocity: 0.28 }],
    },
    // "vương trên tóc"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 64, offsetBeats: 0, beats: 1.0, velocity: 0.76 }, // E4
        { midi: 65, offsetBeats: 1.0, beats: 0.5, velocity: 0.78 }, // F4 - vương
        { midi: 67, offsetBeats: 1.5, beats: 0.5, velocity: 0.8 }, // G4 - trên
        { midi: 67, offsetBeats: 2.0, beats: 0.5, velocity: 0.78 }, // G4 - tóc
        { midi: 65, offsetBeats: 2.5, beats: 0.5, velocity: 0.76 }, // F4
      ],
      arpeggio: waltz3(41, [53, 57, 60]),
    },
    // "thầy..."
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 0.5, velocity: 0.78 },
        { midi: 69, offsetBeats: 0.5, beats: 1.5, velocity: 0.82 }, // A4 - thầy
        { midi: 65, offsetBeats: 2.0, beats: 1.1, velocity: 0.76 }, // F4
      ],
      arpeggio: waltz3(41, [53, 57, 60]),
      pad: [{ midi: 53, offsetBeats: 0, beats: 3.1, velocity: 0.28 }],
    },
    // Điệp khúc: "Em yêu phút"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 77, offsetBeats: 0, beats: 1.0, velocity: 0.85 }, // F5 - Em
        { midi: 77, offsetBeats: 1.0, beats: 1.0, velocity: 0.85 }, // F5 - yêu
        { midi: 79, offsetBeats: 2.0, beats: 1.0, velocity: 0.88 }, // G5 - phút
      ],
      arpeggio: waltz3(46, [53, 58, 62]),
      pad: [{ midi: 58, offsetBeats: 0, beats: 3.1, velocity: 0.34 }],
    },
    // "giây này"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 77, offsetBeats: 0, beats: 1.0, velocity: 0.84 }, // F5 - giây
        { midi: 74, offsetBeats: 1.0, beats: 0.5, velocity: 0.8 }, // D5
        { midi: 72, offsetBeats: 1.5, beats: 1.5, velocity: 0.8 }, // C5 - này
      ],
      arpeggio: waltz3(41, [53, 57, 60]),
    },
    // "thầy em tóc như"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 0.5, velocity: 0.76 }, // G4 - thầy
        { midi: 69, offsetBeats: 0.5, beats: 0.5, velocity: 0.78 }, // A4 - em
        { midi: 74, offsetBeats: 1.0, beats: 1.0, velocity: 0.82 }, // D5 - tóc
        { midi: 77, offsetBeats: 2.0, beats: 1.0, velocity: 0.84 }, // F5 - như
      ],
      arpeggio: waltz3(50, [53, 57, 62]),
      pad: [{ midi: 50, offsetBeats: 0, beats: 3.1, velocity: 0.3 }],
    },
    // "bạc thêm"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 76, offsetBeats: 0, beats: 1.0, velocity: 0.82 }, // E5 - bạc
        { midi: 74, offsetBeats: 1.0, beats: 0.5, velocity: 0.78 }, // D5
        { midi: 76, offsetBeats: 1.5, beats: 1.5, velocity: 0.82 }, // E5 - thêm
      ],
      arpeggio: waltz3(48, [52, 55, 60]),
    },
    // "Bạc thêm vì bụi"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 1.0, velocity: 0.8 }, // A4 - Bạc
        { midi: 72, offsetBeats: 1.0, beats: 1.0, velocity: 0.82 }, // C5 - thêm
        { midi: 65, offsetBeats: 2.0, beats: 0.5, velocity: 0.76 }, // F4 - vì
        { midi: 65, offsetBeats: 2.5, beats: 0.5, velocity: 0.76 }, // F4 - bụi
      ],
      arpeggio: waltz3(45, [52, 57, 60]),
      pad: [{ midi: 57, offsetBeats: 0, beats: 3.1, velocity: 0.3 }],
    },
    // "phấn, để cho em"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 1.0, velocity: 0.78 }, // G4 - phấn
        { midi: 69, offsetBeats: 1.0, beats: 1.0, velocity: 0.8 }, // A4 - để
        { midi: 67, offsetBeats: 2.0, beats: 0.5, velocity: 0.76 }, // G4 - cho
        { midi: 67, offsetBeats: 2.5, beats: 0.5, velocity: 0.76 }, // G4 - em
      ],
      arpeggio: waltz3(43, [55, 58, 62]),
    },
    // "bài học hay"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 65, offsetBeats: 0, beats: 1.0, velocity: 0.78 }, // F4 - bài
        { midi: 67, offsetBeats: 1.0, beats: 1.0, velocity: 0.8 }, // G4 - học
        { midi: 72, offsetBeats: 2.0, beats: 1.4, velocity: 0.84 }, // C5 - hay
      ],
      arpeggio: waltz3(48, [52, 55, 58]),
    },
    // "Mai sau lớn nên"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 77, offsetBeats: 0, beats: 1.0, velocity: 0.85 }, // F5
        { midi: 77, offsetBeats: 1.0, beats: 1.0, velocity: 0.85 }, // F5
        { midi: 79, offsetBeats: 2.0, beats: 1.0, velocity: 0.88 }, // G5
      ],
      arpeggio: waltz3(46, [53, 58, 62]),
      pad: [{ midi: 58, offsetBeats: 0, beats: 3.1, velocity: 0.34 }],
    },
    // "người"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 77, offsetBeats: 0, beats: 1.0, velocity: 0.84 }, // F5
        { midi: 74, offsetBeats: 1.0, beats: 0.5, velocity: 0.8 }, // D5
        { midi: 72, offsetBeats: 1.5, beats: 1.5, velocity: 0.8 }, // C5
      ],
      arpeggio: waltz3(41, [53, 57, 60]),
    },
    // "Làm sao có thể nào"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 0.5, velocity: 0.76 }, // G4
        { midi: 69, offsetBeats: 0.5, beats: 0.5, velocity: 0.78 }, // A4
        { midi: 74, offsetBeats: 1.0, beats: 1.0, velocity: 0.82 }, // D5
        { midi: 77, offsetBeats: 2.0, beats: 1.0, velocity: 0.84 }, // F5
      ],
      arpeggio: waltz3(50, [53, 57, 62]),
    },
    // "quên"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 76, offsetBeats: 0, beats: 1.0, velocity: 0.82 }, // E5
        { midi: 74, offsetBeats: 1.0, beats: 0.5, velocity: 0.78 }, // D5
        { midi: 76, offsetBeats: 1.5, beats: 1.5, velocity: 0.82 }, // E5
      ],
      arpeggio: waltz3(48, [52, 55, 60]),
    },
    // "Ngày xưa thầy dạy dỗ"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 1.0, velocity: 0.8 }, // A4
        { midi: 72, offsetBeats: 1.0, beats: 1.0, velocity: 0.82 }, // C5
        { midi: 65, offsetBeats: 2.0, beats: 0.5, velocity: 0.76 }, // F4
        { midi: 67, offsetBeats: 2.5, beats: 0.5, velocity: 0.78 }, // G4
      ],
      arpeggio: waltz3(46, [53, 58, 62]),
    },
    // "Khi em tuổi còn"
    {
      totalBeats: 3,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 1.0, velocity: 0.8 }, // A4
        { midi: 67, offsetBeats: 1.0, beats: 0.5, velocity: 0.76 }, // G4
        { midi: 67, offsetBeats: 1.5, beats: 0.5, velocity: 0.76 }, // G4
        { midi: 62, offsetBeats: 2.0, beats: 0.5, velocity: 0.74 }, // D4
        { midi: 64, offsetBeats: 2.5, beats: 0.5, velocity: 0.76 }, // E4
      ],
      arpeggio: waltz3(48, [52, 55, 58]),
    },
    // "thơ..."
    {
      totalBeats: 3,
      flute: true,
      melody: [{ midi: 65, offsetBeats: 0, beats: 3.1, velocity: 0.84 }], // F4
      arpeggio: [
        { midi: 41, offsetBeats: 0, beats: 3.1, velocity: 0.55 },
        { midi: 53, offsetBeats: 0.1, beats: 3.0, velocity: 0.36 },
        { midi: 57, offsetBeats: 0.2, beats: 2.9, velocity: 0.38 },
        { midi: 60, offsetBeats: 0.3, beats: 2.8, velocity: 0.36 },
      ],
      pad: [{ midi: 53, offsetBeats: 0, beats: 3.2, velocity: 0.32 }],
    },
  ],
};

// ==================== 2. NGƯỜI THẦY (Nguyễn Nhất Huy - A Minor, 4/4) ====================
const NGUOI_THAY_SCORE: ScoreArrangement = {
  bpm: 72,
  measures: [
    // "Người thầy, vẫn lặng lẽ đi về sớm"
    {
      totalBeats: 4,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.5, velocity: 0.78 }, // A4
        { midi: 69, offsetBeats: 0.5, beats: 0.9, velocity: 0.8 }, // A4
        { midi: 72, offsetBeats: 1.5, beats: 0.5, velocity: 0.82 }, // C5
        { midi: 69, offsetBeats: 2.0, beats: 0.5, velocity: 0.78 }, // A4
        { midi: 72, offsetBeats: 2.5, beats: 0.5, velocity: 0.82 }, // C5
        { midi: 71, offsetBeats: 3.0, beats: 0.5, velocity: 0.8 }, // B4
        { midi: 67, offsetBeats: 3.5, beats: 0.5, velocity: 0.76 }, // G4
      ],
      arpeggio: arp4(45, 52, 57, 60),
      pad: [{ midi: 57, offsetBeats: 0, beats: 4.1, velocity: 0.3 }],
    },
    // "trưa..."
    {
      totalBeats: 4,
      melody: [
        { midi: 71, offsetBeats: 0, beats: 0.75, velocity: 0.78 }, // B4
        { midi: 69, offsetBeats: 0.75, beats: 2.7, velocity: 0.82 }, // A4
      ],
      arpeggio: arp4(40, 47, 52, 57),
    },
    // "Từng ngày, giọt mồ hôi rơi nhòe trang"
    {
      totalBeats: 4,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 0.5, velocity: 0.76 }, // G4
        { midi: 67, offsetBeats: 0.5, beats: 0.9, velocity: 0.78 }, // G4
        { midi: 71, offsetBeats: 1.5, beats: 0.5, velocity: 0.8 }, // B4
        { midi: 72, offsetBeats: 2.0, beats: 0.5, velocity: 0.82 }, // C5
        { midi: 74, offsetBeats: 2.5, beats: 1.3, velocity: 0.84 }, // D5
      ],
      arpeggio: arp4(43, 50, 55, 59),
      pad: [{ midi: 55, offsetBeats: 0, beats: 4.1, velocity: 0.28 }],
    },
    // "giấy..."
    {
      totalBeats: 4,
      melody: [
        { midi: 74, offsetBeats: 0, beats: 0.5, velocity: 0.8 }, // D5
        { midi: 72, offsetBeats: 0.5, beats: 0.5, velocity: 0.78 }, // C5
        { midi: 74, offsetBeats: 1.0, beats: 0.5, velocity: 0.82 }, // D5
        { midi: 76, offsetBeats: 1.5, beats: 2.3, velocity: 0.84 }, // E5
      ],
      arpeggio: arp4(48, 55, 60, 64),
    },
    // "Để em đến, bến bờ ước mơ"
    {
      totalBeats: 4,
      melody: [
        { midi: 74, offsetBeats: 0, beats: 0.5, velocity: 0.8 }, // D5
        { midi: 76, offsetBeats: 0.5, beats: 0.5, velocity: 0.82 }, // E5
        { midi: 77, offsetBeats: 1.0, beats: 0.7, velocity: 0.84 }, // F5
        { midi: 76, offsetBeats: 1.75, beats: 0.5, velocity: 0.8 }, // E5
        { midi: 74, offsetBeats: 2.25, beats: 0.5, velocity: 0.78 }, // D5
        { midi: 79, offsetBeats: 2.75, beats: 0.5, velocity: 0.86 }, // G5
        { midi: 77, offsetBeats: 3.25, beats: 0.9, velocity: 0.84 }, // F5
      ],
      arpeggio: arp4(50, 57, 62, 65),
      pad: [{ midi: 53, offsetBeats: 0, beats: 4.1, velocity: 0.3 }],
    },
    // "Rồi năm tháng sông dài gió mưa"
    {
      totalBeats: 4,
      melody: [
        { midi: 72, offsetBeats: 0, beats: 0.5, velocity: 0.78 }, // C5
        { midi: 74, offsetBeats: 0.5, beats: 0.5, velocity: 0.8 }, // D5
        { midi: 76, offsetBeats: 1.0, beats: 0.9, velocity: 0.82 }, // E5
        { midi: 74, offsetBeats: 2.0, beats: 0.5, velocity: 0.78 }, // D5
        { midi: 72, offsetBeats: 2.5, beats: 0.5, velocity: 0.76 }, // C5
        { midi: 76, offsetBeats: 3.0, beats: 0.5, velocity: 0.8 }, // E5
        { midi: 74, offsetBeats: 3.5, beats: 0.7, velocity: 0.78 }, // D5
      ],
      arpeggio: arp4(48, 55, 60, 64),
    },
    // "Cành hoa trắng, vẫn lung linh trong vườn"
    {
      totalBeats: 4,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.5, velocity: 0.78 }, // A4
        { midi: 71, offsetBeats: 0.5, beats: 0.5, velocity: 0.8 }, // B4
        { midi: 72, offsetBeats: 1.0, beats: 0.9, velocity: 0.82 }, // C5
        { midi: 74, offsetBeats: 2.0, beats: 0.5, velocity: 0.82 }, // D5
        { midi: 72, offsetBeats: 2.5, beats: 0.5, velocity: 0.78 }, // C5
        { midi: 71, offsetBeats: 3.0, beats: 0.5, velocity: 0.78 }, // B4
        { midi: 69, offsetBeats: 3.5, beats: 0.5, velocity: 0.76 }, // A4
      ],
      arpeggio: arp4(45, 52, 57, 60),
    },
    // "xưa..."
    {
      totalBeats: 4,
      melody: [{ midi: 71, offsetBeats: 0, beats: 3.6, velocity: 0.8 }], // B4
      arpeggio: arp4(40, 47, 52, 56), // E
      pad: [{ midi: 52, offsetBeats: 0, beats: 4.1, velocity: 0.3 }],
    },
    // Điệp khúc: "Dù năm tháng vô tình trôi mãi mãi"
    {
      totalBeats: 4,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 71, offsetBeats: 0.5, beats: 0.5, velocity: 0.82 }, // B4
        { midi: 72, offsetBeats: 1.0, beats: 0.75, velocity: 0.85 }, // C5
        { midi: 71, offsetBeats: 1.75, beats: 0.5, velocity: 0.8 }, // B4
        { midi: 69, offsetBeats: 2.25, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 71, offsetBeats: 2.75, beats: 0.5, velocity: 0.82 }, // B4
        { midi: 72, offsetBeats: 3.25, beats: 0.8, velocity: 0.86 }, // C5
      ],
      arpeggio: arp4(45, 52, 57, 60),
      pad: [{ midi: 57, offsetBeats: 0, beats: 4.1, velocity: 0.34 }],
    },
    // "có hay bao mùa lá rơi"
    {
      totalBeats: 4,
      flute: true,
      melody: [
        { midi: 72, offsetBeats: 0, beats: 0.75, velocity: 0.84 }, // C5
        { midi: 72, offsetBeats: 0.75, beats: 0.5, velocity: 0.82 }, // C5
        { midi: 71, offsetBeats: 1.25, beats: 0.5, velocity: 0.8 }, // B4
        { midi: 69, offsetBeats: 1.75, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 68, offsetBeats: 2.25, beats: 0.5, velocity: 0.78 }, // G#4
        { midi: 71, offsetBeats: 2.75, beats: 0.5, velocity: 0.8 }, // B4
        { midi: 69, offsetBeats: 3.25, beats: 1.0, velocity: 0.82 }, // A4
      ],
      arpeggio: arp4(40, 47, 52, 56),
    },
    // "Thầy đã đến như muôn ngàn tia nắng"
    {
      totalBeats: 4,
      flute: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 71, offsetBeats: 0.5, beats: 0.5, velocity: 0.82 }, // B4
        { midi: 72, offsetBeats: 1.0, beats: 0.75, velocity: 0.85 }, // C5
        { midi: 71, offsetBeats: 1.75, beats: 0.5, velocity: 0.8 }, // B4
        { midi: 71, offsetBeats: 2.25, beats: 0.5, velocity: 0.8 }, // B4
        { midi: 68, offsetBeats: 2.75, beats: 0.5, velocity: 0.78 }, // G#4
        { midi: 69, offsetBeats: 3.25, beats: 0.8, velocity: 0.82 }, // A4
      ],
      arpeggio: arp4(45, 52, 57, 60),
    },
    // "sáng soi bước em trong cuộc đời"
    {
      totalBeats: 4,
      flute: true,
      melody: [
        { midi: 71, offsetBeats: 0, beats: 0.5, velocity: 0.82 }, // B4
        { midi: 72, offsetBeats: 0.5, beats: 0.5, velocity: 0.84 }, // C5
        { midi: 71, offsetBeats: 1.0, beats: 0.5, velocity: 0.82 }, // B4
        { midi: 72, offsetBeats: 1.5, beats: 0.5, velocity: 0.84 }, // C5
        { midi: 71, offsetBeats: 2.0, beats: 0.5, velocity: 0.8 }, // B4
        { midi: 69, offsetBeats: 2.5, beats: 0.5, velocity: 0.78 }, // A4
        { midi: 65, offsetBeats: 3.0, beats: 1.1, velocity: 0.78 }, // F4
      ],
      arpeggio: arp4(41, 48, 53, 57),
      pad: [{ midi: 53, offsetBeats: 0, beats: 4.1, velocity: 0.32 }],
    },
    // "Vẫn nhớ những khi trời mưa rơi"
    {
      totalBeats: 4,
      flute: true,
      melody: [
        { midi: 65, offsetBeats: 0, beats: 0.5, velocity: 0.78 }, // F4
        { midi: 65, offsetBeats: 0.5, beats: 0.5, velocity: 0.78 }, // F4
        { midi: 65, offsetBeats: 1.0, beats: 0.5, velocity: 0.78 }, // F4
        { midi: 64, offsetBeats: 1.5, beats: 0.5, velocity: 0.76 }, // E4
        { midi: 62, offsetBeats: 2.0, beats: 0.5, velocity: 0.74 }, // D4
        { midi: 64, offsetBeats: 2.5, beats: 1.4, velocity: 0.78 }, // E4
      ],
      arpeggio: arp4(50, 53, 57, 62),
    },
    // "vẫn chiếc áo xưa sờn đôi vai"
    {
      totalBeats: 4,
      flute: true,
      melody: [
        { midi: 64, offsetBeats: 0, beats: 0.5, velocity: 0.76 }, // E4
        { midi: 64, offsetBeats: 0.5, beats: 0.5, velocity: 0.76 }, // E4
        { midi: 64, offsetBeats: 1.0, beats: 0.5, velocity: 0.76 }, // E4
        { midi: 62, offsetBeats: 1.5, beats: 0.5, velocity: 0.74 }, // D4
        { midi: 60, offsetBeats: 2.0, beats: 0.5, velocity: 0.72 }, // C4
        { midi: 62, offsetBeats: 2.5, beats: 1.4, velocity: 0.76 }, // D4
      ],
      arpeggio: arp4(48, 55, 60, 64),
    },
    // "Thầy vẫn đi, buồn vui, lặng lẽ..."
    {
      totalBeats: 4,
      flute: true,
      melody: [
        { midi: 62, offsetBeats: 0, beats: 0.5, velocity: 0.76 }, // D4
        { midi: 67, offsetBeats: 0.5, beats: 0.5, velocity: 0.8 }, // G4
        { midi: 65, offsetBeats: 1.0, beats: 0.8, velocity: 0.78 }, // F4
        { midi: 64, offsetBeats: 2.0, beats: 0.5, velocity: 0.76 }, // E4
        { midi: 69, offsetBeats: 2.5, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 68, offsetBeats: 3.0, beats: 0.5, velocity: 0.78 }, // G#4
        { midi: 71, offsetBeats: 3.5, beats: 0.5, velocity: 0.8 }, // B4
      ],
      arpeggio: arp4(40, 47, 52, 56),
    },
    // Final resolve Am
    {
      totalBeats: 4,
      flute: true,
      melody: [{ midi: 69, offsetBeats: 0, beats: 3.6, velocity: 0.84 }],
      arpeggio: arp4(45, 52, 57, 60),
      pad: [{ midi: 57, offsetBeats: 0, beats: 4.1, velocity: 0.34 }],
    },
  ],
};

// ==================== 3. MONG ƯỚC KỶ NIỆM XƯA (Xuân Phương - F Major, 4/4) ====================
const MONG_UOC_SCORE: ScoreArrangement = {
  bpm: 76,
  measures: [
    // "Thời gian trôi qua mau"
    {
      totalBeats: 4,
      melody: [
        { midi: 60, offsetBeats: 0, beats: 0.5, velocity: 0.74 }, // C4
        { midi: 62, offsetBeats: 0.5, beats: 0.5, velocity: 0.76 }, // D4
        { midi: 65, offsetBeats: 1.0, beats: 1.0, velocity: 0.8 }, // F4
        { midi: 65, offsetBeats: 2.0, beats: 0.5, velocity: 0.78 }, // F4
        { midi: 65, offsetBeats: 2.5, beats: 1.3, velocity: 0.8 }, // F4
      ],
      arpeggio: arp4(41, 48, 53, 57),
      pad: [{ midi: 53, offsetBeats: 0, beats: 4.1, velocity: 0.28 }],
    },
    // "chỉ còn lại những kỷ niệm"
    {
      totalBeats: 4,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 67, offsetBeats: 0.5, beats: 0.5, velocity: 0.76 }, // G4
        { midi: 69, offsetBeats: 1.0, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 72, offsetBeats: 1.5, beats: 0.9, velocity: 0.84 }, // C5
        { midi: 67, offsetBeats: 2.5, beats: 0.5, velocity: 0.76 }, // G4
        { midi: 65, offsetBeats: 3.0, beats: 1.1, velocity: 0.78 }, // F4
      ],
      arpeggio: arp4(48, 55, 60, 64),
    },
    // "Kỷ niệm thân yêu ơi"
    {
      totalBeats: 4,
      melody: [
        { midi: 65, offsetBeats: 0, beats: 0.5, velocity: 0.78 }, // F4
        { midi: 65, offsetBeats: 0.5, beats: 0.5, velocity: 0.78 }, // F4
        { midi: 74, offsetBeats: 1.0, beats: 1.0, velocity: 0.85 }, // D5
        { midi: 74, offsetBeats: 2.0, beats: 0.5, velocity: 0.82 }, // D5
        { midi: 74, offsetBeats: 2.5, beats: 1.2, velocity: 0.84 }, // D5
      ],
      arpeggio: arp4(50, 57, 62, 65),
      pad: [{ midi: 50, offsetBeats: 0, beats: 4.1, velocity: 0.28 }],
    },
    // "sẽ còn nhớ mãi tiếng thầy cô"
    {
      totalBeats: 4,
      melody: [
        { midi: 72, offsetBeats: 0, beats: 0.5, velocity: 0.82 }, // C5
        { midi: 69, offsetBeats: 0.5, beats: 0.5, velocity: 0.78 }, // A4
        { midi: 72, offsetBeats: 1.0, beats: 0.5, velocity: 0.82 }, // C5
        { midi: 74, offsetBeats: 1.5, beats: 0.8, velocity: 0.84 }, // D5
        { midi: 74, offsetBeats: 2.3, beats: 0.5, velocity: 0.82 }, // D5
        { midi: 69, offsetBeats: 2.8, beats: 0.5, velocity: 0.78 }, // A4
        { midi: 72, offsetBeats: 3.3, beats: 0.8, velocity: 0.8 }, // C5
      ],
      arpeggio: arp4(45, 52, 57, 60),
    },
    // Điệp khúc: "Nếu có ước muốn trong cuộc đời này"
    {
      totalBeats: 4,
      flute: true,
      celesta: true,
      melody: [
        { midi: 65, offsetBeats: 0, beats: 0.5, velocity: 0.78 }, // F4
        { midi: 65, offsetBeats: 0.5, beats: 0.5, velocity: 0.78 }, // F4
        { midi: 65, offsetBeats: 1.0, beats: 0.5, velocity: 0.8 }, // F4
        { midi: 65, offsetBeats: 1.5, beats: 0.5, velocity: 0.8 }, // F4
        { midi: 67, offsetBeats: 2.0, beats: 0.5, velocity: 0.82 }, // G4
        { midi: 65, offsetBeats: 2.5, beats: 0.5, velocity: 0.8 }, // F4
        { midi: 67, offsetBeats: 3.0, beats: 0.5, velocity: 0.82 }, // G4
        { midi: 72, offsetBeats: 3.5, beats: 0.8, velocity: 0.86 }, // C5
      ],
      arpeggio: arp4(46, 53, 58, 62),
      pad: [{ midi: 58, offsetBeats: 0, beats: 4.1, velocity: 0.32 }],
    },
    // "Hãy nhớ ước muốn cho thời gian trở lại"
    {
      totalBeats: 4,
      flute: true,
      celesta: true,
      melody: [
        { midi: 72, offsetBeats: 0, beats: 0.5, velocity: 0.82 }, // C5
        { midi: 72, offsetBeats: 0.5, beats: 0.5, velocity: 0.82 }, // C5
        { midi: 74, offsetBeats: 1.0, beats: 0.75, velocity: 0.85 }, // D5
        { midi: 77, offsetBeats: 1.75, beats: 0.75, velocity: 0.88 }, // F5
        { midi: 67, offsetBeats: 2.5, beats: 0.5, velocity: 0.78 }, // G4
        { midi: 69, offsetBeats: 3.0, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 72, offsetBeats: 3.5, beats: 0.9, velocity: 0.84 }, // C5
      ],
      arpeggio: arp4(41, 48, 53, 57),
    },
    // "Cho bao khát vọng, đam mê cháy bỏng"
    {
      totalBeats: 4,
      flute: true,
      celesta: true,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 0.5, velocity: 0.8 }, // G4
        { midi: 69, offsetBeats: 0.5, beats: 0.5, velocity: 0.82 }, // A4
        { midi: 70, offsetBeats: 1.0, beats: 0.75, velocity: 0.84 }, // Bb4
        { midi: 69, offsetBeats: 1.75, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 67, offsetBeats: 2.25, beats: 0.5, velocity: 0.78 }, // G4
        { midi: 65, offsetBeats: 2.75, beats: 0.5, velocity: 0.76 }, // F4
        { midi: 64, offsetBeats: 3.25, beats: 0.9, velocity: 0.76 }, // E4
      ],
      arpeggio: arp4(43, 50, 55, 58),
      pad: [{ midi: 55, offsetBeats: 0, beats: 4.1, velocity: 0.3 }],
    },
    // "Sẽ còn mãi trong tim mọi người..."
    {
      totalBeats: 4,
      flute: true,
      celesta: true,
      melody: [
        { midi: 60, offsetBeats: 0, beats: 0.5, velocity: 0.76 }, // C4
        { midi: 62, offsetBeats: 0.5, beats: 0.5, velocity: 0.78 }, // D4
        { midi: 65, offsetBeats: 1.0, beats: 0.5, velocity: 0.8 }, // F4
        { midi: 69, offsetBeats: 1.5, beats: 0.5, velocity: 0.82 }, // A4
        { midi: 67, offsetBeats: 2.0, beats: 0.5, velocity: 0.8 }, // G4
        { midi: 65, offsetBeats: 2.5, beats: 1.6, velocity: 0.84 }, // F4
      ],
      arpeggio: arp4(41, 48, 53, 57),
      pad: [{ midi: 53, offsetBeats: 0, beats: 4.1, velocity: 0.32 }],
    },
  ],
};

// ==================== 4. NHỚ ƠN THẦY CÔ (Nguyễn Ngọc Thiện - Am/C, 4/4) ====================
const NHO_ON_THAY_CO_SCORE: ScoreArrangement = {
  bpm: 84,
  measures: [
    // "Về lại trường xưa với bao kỷ niệm"
    {
      totalBeats: 4,
      celesta: true,
      melody: [
        { midi: 64, offsetBeats: 0, beats: 0.5, velocity: 0.78 }, // E4
        { midi: 67, offsetBeats: 0.5, beats: 0.5, velocity: 0.8 }, // G4
        { midi: 69, offsetBeats: 1.0, beats: 0.5, velocity: 0.82 }, // A4
        { midi: 72, offsetBeats: 1.5, beats: 0.8, velocity: 0.84 }, // C5
        { midi: 69, offsetBeats: 2.3, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 67, offsetBeats: 2.8, beats: 0.5, velocity: 0.78 }, // G4
        { midi: 69, offsetBeats: 3.3, beats: 0.8, velocity: 0.8 }, // A4
      ],
      arpeggio: arp4(45, 52, 57, 60),
      pad: [{ midi: 57, offsetBeats: 0, beats: 4.1, velocity: 0.28 }],
    },
    // "Bóng dáng cô thầy vấn vương không rời"
    {
      totalBeats: 4,
      celesta: true,
      melody: [
        { midi: 67, offsetBeats: 0, beats: 0.5, velocity: 0.78 }, // G4
        { midi: 69, offsetBeats: 0.5, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 72, offsetBeats: 1.0, beats: 0.5, velocity: 0.82 }, // C5
        { midi: 74, offsetBeats: 1.5, beats: 0.5, velocity: 0.84 }, // D5
        { midi: 76, offsetBeats: 2.0, beats: 0.8, velocity: 0.86 }, // E5
        { midi: 74, offsetBeats: 2.8, beats: 0.5, velocity: 0.82 }, // D5
        { midi: 72, offsetBeats: 3.3, beats: 0.8, velocity: 0.8 }, // C5
      ],
      arpeggio: arp4(48, 55, 60, 64),
    },
    // "Một thời tuổi thơ trôi theo cánh phượng"
    {
      totalBeats: 4,
      celesta: true,
      melody: [
        { midi: 69, offsetBeats: 0, beats: 0.5, velocity: 0.8 }, // A4
        { midi: 72, offsetBeats: 0.5, beats: 0.5, velocity: 0.82 }, // C5
        { midi: 74, offsetBeats: 1.0, beats: 0.5, velocity: 0.84 }, // D5
        { midi: 76, offsetBeats: 1.5, beats: 0.5, velocity: 0.86 }, // E5
        { midi: 77, offsetBeats: 2.0, beats: 0.7, velocity: 0.88 }, // F5
        { midi: 76, offsetBeats: 2.7, beats: 0.4, velocity: 0.82 }, // E5
        { midi: 74, offsetBeats: 3.1, beats: 0.4, velocity: 0.8 }, // D5
        { midi: 72, offsetBeats: 3.5, beats: 0.6, velocity: 0.8 }, // C5
      ],
      arpeggio: arp4(41, 48, 53, 57),
      pad: [{ midi: 53, offsetBeats: 0, beats: 4.1, velocity: 0.28 }],
    },
    // "Lời thầy cô vọng mãi"
    {
      totalBeats: 4,
      celesta: true,
      melody: [
        { midi: 72, offsetBeats: 0, beats: 0.5, velocity: 0.82 }, // C5
        { midi: 74, offsetBeats: 0.5, beats: 0.5, velocity: 0.84 }, // D5
        { midi: 69, offsetBeats: 1.0, beats: 0.8, velocity: 0.8 }, // A4
        { midi: 67, offsetBeats: 2.0, beats: 0.6, velocity: 0.78 }, // G4
        { midi: 69, offsetBeats: 2.6, beats: 1.4, velocity: 0.82 }, // A4
      ],
      arpeggio: arp4(43, 50, 55, 59),
    },
    // "Bây giờ con về thăm ngôi trường xưa"
    {
      totalBeats: 4,
      flute: true,
      celesta: true,
      melody: [
        { midi: 76, offsetBeats: 0, beats: 0.5, velocity: 0.84 }, // E5
        { midi: 77, offsetBeats: 0.5, beats: 0.5, velocity: 0.85 }, // F5
        { midi: 79, offsetBeats: 1.0, beats: 0.5, velocity: 0.88 }, // G5
        { midi: 77, offsetBeats: 1.5, beats: 0.5, velocity: 0.84 }, // F5
        { midi: 76, offsetBeats: 2.0, beats: 0.5, velocity: 0.82 }, // E5
        { midi: 74, offsetBeats: 2.5, beats: 0.5, velocity: 0.8 }, // D5
        { midi: 76, offsetBeats: 3.0, beats: 1.0, velocity: 0.84 }, // E5
      ],
      arpeggio: arp4(48, 55, 60, 64),
      pad: [{ midi: 60, offsetBeats: 0, beats: 4.1, velocity: 0.32 }],
    },
    // "Con tìm cô thầy sau bao nhiêu năm"
    {
      totalBeats: 4,
      flute: true,
      celesta: true,
      melody: [
        { midi: 77, offsetBeats: 0, beats: 0.5, velocity: 0.84 }, // F5
        { midi: 79, offsetBeats: 0.5, beats: 0.5, velocity: 0.86 }, // G5
        { midi: 81, offsetBeats: 1.0, beats: 0.8, velocity: 0.88 }, // A5
        { midi: 79, offsetBeats: 1.8, beats: 0.6, velocity: 0.84 }, // G5
        { midi: 76, offsetBeats: 2.4, beats: 0.6, velocity: 0.82 }, // E5
        { midi: 74, offsetBeats: 3.0, beats: 0.5, velocity: 0.8 }, // D5
        { midi: 72, offsetBeats: 3.5, beats: 0.8, velocity: 0.8 }, // C5
      ],
      arpeggio: arp4(43, 50, 55, 59),
    },
    // "Cô thầy đâu rồi? Nghe trong tim con"
    {
      totalBeats: 4,
      flute: true,
      celesta: true,
      melody: [
        { midi: 77, offsetBeats: 0, beats: 0.5, velocity: 0.84 }, // F5
        { midi: 79, offsetBeats: 0.5, beats: 0.5, velocity: 0.86 }, // G5
        { midi: 81, offsetBeats: 1.0, beats: 0.7, velocity: 0.88 }, // A5
        { midi: 84, offsetBeats: 1.75, beats: 0.9, velocity: 0.9 }, // C6
        { midi: 81, offsetBeats: 2.7, beats: 0.6, velocity: 0.84 }, // A5
        { midi: 79, offsetBeats: 3.3, beats: 0.7, velocity: 0.82 }, // G5
      ],
      arpeggio: arp4(41, 48, 53, 57),
      pad: [{ midi: 53, offsetBeats: 0, beats: 4.1, velocity: 0.32 }],
    },
    // "vang tiếng cô thầy..."
    {
      totalBeats: 4,
      flute: true,
      celesta: true,
      melody: [
        { midi: 77, offsetBeats: 0, beats: 0.5, velocity: 0.82 }, // F5
        { midi: 76, offsetBeats: 0.5, beats: 0.5, velocity: 0.8 }, // E5
        { midi: 74, offsetBeats: 1.0, beats: 0.5, velocity: 0.78 }, // D5
        { midi: 72, offsetBeats: 1.5, beats: 0.5, velocity: 0.78 }, // C5
        { midi: 69, offsetBeats: 2.0, beats: 2.1, velocity: 0.84 }, // A4
      ],
      arpeggio: arp4(45, 52, 57, 60),
      pad: [{ midi: 57, offsetBeats: 0, beats: 4.1, velocity: 0.34 }],
    },
  ],
};

class TeacherMusicPlayer {
  private ctx: AudioContext | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private timerId: number | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private silentUnlockAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private measureIndex = 0;
  private buffers = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<InstrumentKind, Promise<void>>();

  private createHallReverbBuffer(ctx: AudioContext): AudioBuffer {
    const duration = 2.5;
    const length = Math.floor(ctx.sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let prev = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const decay = Math.pow(1 - t, 2.5);
        const raw = (Math.random() * 2 - 1) * decay;
        prev = prev * 0.7 + raw * 0.3;
        data[i] = prev;
      }
    }
    return impulse;
  }

  private enablePlaybackAudioSession(): void {
    try {
      const nav = navigator as unknown as { audioSession?: { type: string } };
      if (nav.audioSession && 'type' in nav.audioSession) {
        nav.audioSession.type = 'playback';
      }
    } catch {
      // Ignore unsupported audioSession API
    }
  }

  private startSilentSwitchBypass(): void {
    try {
      if (!this.silentUnlockAudio) {
        const silentWavDataUri =
          'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        const el = new Audio(silentWavDataUri);
        el.loop = true;
        el.setAttribute('playsinline', 'true');
        el.setAttribute('webkit-playsinline', 'true');
        this.silentUnlockAudio = el;
      }
      void this.silentUnlockAudio.play().catch(() => undefined);
    } catch {
      // Ignore mobile unlock helper errors
    }
  }

  private ensureContext(): AudioContext {
    this.enablePlaybackAudioSession();

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-16, ctx.currentTime);
      compressor.knee.setValueAtTime(14, ctx.currentTime);
      compressor.ratio.setValueAtTime(3.2, ctx.currentTime);
      compressor.attack.setValueAtTime(0.01, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      const master = ctx.createGain();
      master.gain.value = 0.85;

      const dry = ctx.createGain();
      dry.gain.value = 0.82;

      const wet = ctx.createGain();
      wet.gain.value = 0.34;

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

    // Play a 1-sample silent buffer synchronously inside gesture to unlock iOS Safari Web Audio
    try {
      const silentBuf = this.ctx.createBuffer(1, 1, 22050);
      const src = this.ctx.createBufferSource();
      src.buffer = silentBuf;
      src.connect(this.ctx.destination);
      src.start(0);
    } catch {
      // Ignore
    }

    return this.ctx;
  }

  private decodeAudioBuffer(ctx: AudioContext, data: ArrayBuffer): Promise<AudioBuffer | null> {
    return new Promise((resolve) => {
      try {
        const result = ctx.decodeAudioData(
          data,
          (decoded) => resolve(decoded),
          () => resolve(null)
        );
        if (result && typeof result.then === 'function') {
          result.then(resolve).catch(() => resolve(null));
        }
      } catch {
        resolve(null);
      }
    });
  }

  private async loadSampleUrl(url: string): Promise<ArrayBuffer | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('text/html')) return null;
      return await res.arrayBuffer();
    } catch {
      return null;
    }
  }

  private async ensureInstrumentSamples(kind: InstrumentKind): Promise<void> {
    const existing = this.loadingPromises.get(kind);
    if (existing) return existing;

    const ctx = this.ctx || this.ensureContext();
    const bank = SAMPLE_BANK[kind];

    const promise = Promise.all(
      bank.notes.map(async (entry) => {
        const key = `${kind}:${entry.midi}`;
        if (this.buffers.has(key)) return;
        let data = await this.loadSampleUrl(`${bank.folder}/${entry.name}.mp3`);
        if (!data) {
          data = await this.loadSampleUrl(`${bank.cdn}/${entry.name}.mp3`);
        }
        if (!data) return;
        const decoded = await this.decodeAudioBuffer(ctx, data);
        if (decoded) {
          this.buffers.set(key, decoded);
        }
      })
    ).then(() => undefined);

    this.loadingPromises.set(kind, promise);
    return promise;
  }

  private playSampledNote(
    kind: InstrumentKind,
    midi: number,
    when: number,
    durationSec: number,
    gainLevel: number
  ): void {
    const ctx = this.ctx;
    const dry = this.dryGain;
    const wet = this.wetGain;
    if (!ctx || !dry || !wet) return;

    const bank = SAMPLE_BANK[kind];
    let bestNote = bank.notes[0];
    let minDiff = Infinity;
    for (const candidate of bank.notes) {
      const diff = Math.abs(midi - candidate.midi);
      if (diff < minDiff) {
        minDiff = diff;
        bestNote = candidate;
      }
    }

    const buffer = this.buffers.get(`${kind}:${bestNote.midi}`);
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(Math.pow(2, (midi - bestNote.midi) / 12), when);

    const env = ctx.createGain();
    const attack =
      kind === 'strings' ? 0.28 : kind === 'flute' ? 0.055 : 0.005;
    const release =
      kind === 'piano' ? 0.55 : kind === 'celesta' ? 0.65 : kind === 'strings' ? 0.45 : 0.25;
    const sustainEnd = when + Math.max(0.18, durationSec);
    const totalEnd = sustainEnd + release;

    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(gainLevel, when + attack);
    env.gain.setValueAtTime(gainLevel * 0.92, sustainEnd);
    env.gain.exponentialRampToValueAtTime(0.0001, totalEnd);

    source.connect(env);
    env.connect(dry);
    env.connect(wet);

    source.start(when);
    source.stop(totalEnd + 0.05);
  }

  private scheduleScoreLoop(theme: Exclude<MusicTheme, 'custom' | 'none' | 'canon-in-d'>): void {
    const score =
      theme === 'nguoi-thay'
        ? NGUOI_THAY_SCORE
        : theme === 'mong-uoc-ky-niem-xua'
          ? MONG_UOC_SCORE
          : theme === 'nho-on-thay-co'
            ? NHO_ON_THAY_CO_SCORE
            : BUI_PHAN_SCORE;

    const secPerBeat = 60 / score.bpm;

    const scheduleNextMeasure = () => {
      if (!this.isPlaying || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }

      const measure = score.measures[this.measureIndex % score.measures.length];
      const baseTime = this.ctx.currentTime + 0.06;

      for (const note of measure.melody) {
        const when = baseTime + note.offsetBeats * secPerBeat;
        const dur = note.beats * secPerBeat;
        const vel = note.velocity ?? 0.78;
        this.playSampledNote('piano', note.midi, when, dur * 1.15, vel * 0.65);
        if (measure.flute) {
          this.playSampledNote('flute', note.midi, when, dur * 0.95, vel * 0.34);
        }
        if (measure.celesta) {
          this.playSampledNote('celesta', note.midi, when, dur * 1.2, vel * 0.28);
        }
      }

      for (const note of measure.arpeggio) {
        const when = baseTime + note.offsetBeats * secPerBeat;
        const dur = note.beats * secPerBeat;
        const vel = note.velocity ?? 0.36;
        this.playSampledNote('piano', note.midi, when, dur, vel * 0.56);
      }

      if (measure.pad) {
        for (const padNote of measure.pad) {
          const when = baseTime + padNote.offsetBeats * secPerBeat;
          const dur = padNote.beats * secPerBeat;
          const vel = padNote.velocity ?? 0.28;
          this.playSampledNote('strings', padNote.midi, when, dur, vel * 0.42);
        }
      }

      this.measureIndex = (this.measureIndex + 1) % score.measures.length;
      const measureMs = measure.totalBeats * secPerBeat * 1000;
      this.timerId = window.setTimeout(scheduleNextMeasure, Math.max(180, measureMs - 40));
    };

    scheduleNextMeasure();
  }

  private playRealAudioFile(src: string, fallbackSrc?: string): void {
    this.enablePlaybackAudioSession();
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.65;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    this.customAudio = audio;

    let fellBack = false;
    const triggerFallback = () => {
      if (fellBack || !this.isPlaying || !fallbackSrc) return;
      fellBack = true;
      audio.src = fallbackSrc;
      audio.load();
      void audio.play().catch(() => undefined);
    };

    audio.addEventListener('error', triggerFallback, { once: true });
    void audio.play().catch(triggerFallback);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public start(theme: MusicTheme, customAudioUrl?: string): void {
    this.stop();
    if (theme === 'none') return;

    this.isPlaying = true;
    this.measureIndex = 0;

    if (theme === 'custom' && customAudioUrl?.trim()) {
      this.playRealAudioFile(customAudioUrl.trim());
      return;
    }

    if (theme === 'canon-in-d') {
      this.playRealAudioFile(
        '/audio/canon-in-d.mp3',
        'https://upload.wikimedia.org/wikipedia/commons/c/c6/Canon_in_D_Major_%28ISRC_USUAN1100301%29.mp3'
      );
      return;
    }

    this.ensureContext();
    this.startSilentSwitchBypass();

    const safeTheme: Exclude<MusicTheme, 'custom' | 'none' | 'canon-in-d'> =
      theme === 'nguoi-thay' ||
      theme === 'mong-uoc-ky-niem-xua' ||
      theme === 'nho-on-thay-co'
        ? theme
        : 'bui-phan';

    // Load strings/flute/celesta in parallel, and begin playback as soon as piano is decoded
    void this.ensureInstrumentSamples('strings');
    void this.ensureInstrumentSamples('flute');
    if (safeTheme === 'mong-uoc-ky-niem-xua' || safeTheme === 'nho-on-thay-co') {
      void this.ensureInstrumentSamples('celesta');
    }

    void this.ensureInstrumentSamples('piano').then(() => {
      if (this.isPlaying) {
        this.scheduleScoreLoop(safeTheme);
      }
    });
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
    if (this.silentUnlockAudio) {
      this.silentUnlockAudio.pause();
    }
  }
}

export const teacherMusic = new TeacherMusicPlayer();
