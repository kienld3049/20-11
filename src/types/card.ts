export type MusicTheme =
  | 'bui-phan'
  | 'nguoi-thay'
  | 'mong-uoc-ky-niem-xua'
  | 'nho-on-thay-co'
  | 'canon-in-d'
  | 'custom'
  | 'none';

export type LacquerStyle =
  | 'royal-crimson'
  | 'imperial-gold'
  | 'lotus-burgundy';

export interface TeacherCard {
  id: string;
  honorific: string;
  teacherName: string;
  roleOrSubject: string;
  photoData: string;
  message: string;
  senderName: string;
  yearLabel: string;
  musicTheme: MusicTheme;
  customAudioUrl: string;
  lacquerStyle: LacquerStyle;
  ownerUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type TeacherCardInput = Omit<TeacherCard, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'>;

export interface AdminMember {
  uid: string;
  email: string;
  displayName: string;
  addedBy: string;
  createdAt?: unknown;
}

export interface PasscodeAdminSession {
  mode: 'passcode';
  token: string;
  displayName: string;
}


export const CARD_LIMITS = {
  idMax: 128,
  honorificMax: 40,
  teacherNameMax: 120,
  roleOrSubjectMax: 140,
  photoDataMax: 600000,
  messageMax: 2500,
  senderNameMax: 150,
  yearLabelMax: 40,
  customAudioUrlMax: 500,
} as const;

export const ASSETS = {
  sunlitFloral: '/src/assets/images/bright_sunlit_floral_bg_1795096389248.jpg',
  heroBg: '/src/assets/images/ceremonial_crimson_silk_bg_1795024490788.jpg',
  ivoryBg: '/src/assets/images/ivory_gold_silk_bg_1795024489114.jpg',
  lotusEmblem: '/src/assets/images/lacquer_lotus_emblem_1795023758743.jpg',
  samplePortrait: '/src/assets/images/teacher_portrait_sample_1795023759904.jpg',
  floralCorner: '/src/assets/images/lacquer_floral_corner_1795023760771.jpg',
} as const;

export const HONORIFIC_PRESETS = [
  'Kính tặng Cô',
  'Kính tặng Thầy',
  'Tri ân Cô',
  'Tri ân Thầy',
  'Kính tặng GS.TS',
  'Kính tặng PGS.TS',
] as const;

export const MUSIC_OPTIONS: Array<{
  id: MusicTheme;
  title: string;
  subtitle: string;
}> = [
  {
    id: 'bui-phan',
    title: 'Bụi Phấn — Không lời (Piano & Sáo Trúc 20/11)',
    subtitle: 'Bản hòa tấu Waltz 3/4 sâu lắng gợi nhớ phấn trắng bảng đen',
  },
  {
    id: 'nguoi-thay',
    title: 'Người Thầy — Không lời (Piano, Sáo & Dây)',
    subtitle: 'Ballad nhẹ nhàng, xúc động về bóng dáng người lái đò',
  },
  {
    id: 'mong-uoc-ky-niem-xua',
    title: 'Mong Ước Kỷ Niệm Xưa — Không lời (Piano & Strings)',
    subtitle: 'Giai điệu hoài niệm tuổi học trò và mái trường mến yêu',
  },
  {
    id: 'nho-on-thay-co',
    title: 'Nhớ Ơn Thầy Cô — Không lời (Celesta & Dương cầm)',
    subtitle: 'Âm hưởng tri ân ấm áp, trong trẻo ngày 20/11',
  },
  {
    id: 'canon-in-d',
    title: 'Canon in D — Bản thu dàn nhạc thật (MP3)',
    subtitle: 'Bản thu âm dàn nhạc cổ điển trang trọng với âm vang phòng hòa nhạc',
  },
  {
    id: 'custom',
    title: 'Nhạc MP3 tùy chọn (Dán đường dẫn)',
    subtitle: 'Phát trực tiếp tệp âm thanh HTTPS bạn cung cấp',
  },
  {
    id: 'none',
    title: 'Không phát nhạc nền',
    subtitle: 'Trình bày thiệp tĩnh trang nghiêm',
  },
];

export const LACQUER_STYLES: Array<{
  id: LacquerStyle;
  name: string;
  swatch: string;
  accent: string;
}> = [
  {
    id: 'imperial-gold',
    name: 'Nắng Ban Mai & Sen Vàng Tươi Sáng',
    swatch: '#FFF8EA',
    accent: '#D4AF37',
  },
  {
    id: 'lotus-burgundy',
    name: 'Lụa Ngà Hoa Sen & Chỉ Vàng',
    swatch: '#F7EFE2',
    accent: '#C89626',
  },
  {
    id: 'royal-crimson',
    name: 'Lụa Đỏ Son & Ánh Vàng Rực Rỡ',
    swatch: '#B01E24',
    accent: '#F0CA65',
  },
];

export const TRIBUTE_TEMPLATES: Array<{ label: string; text: string }> = [
  {
    label: 'Trang trọng & Sâu lắng',
    text: 'Nhân ngày Nhà giáo Việt Nam 20 tháng 11, chúng em xin kính gửi tới Thầy/Cô lời tri ân sâu sắc nhất. Cảm ơn Thầy/Cô đã luôn tận tụy thắp sáng ngọn lửa tri thức, kiên nhẫn dìu dắt và truyền cảm hứng để mỗi học trò vững bước trưởng thành. Kính chúc Thầy/Cô luôn dồi dào sức khỏe, bình an và giữ mãi niềm hạnh phúc bên bục giảng.',
  },
  {
    label: 'Ấm áp Tập thể Lớp',
    text: 'Dẫu thời gian có trôi qua và mai này mỗi đứa một phương trời, những bài giảng tâm huyết cùng nụ cười hiền hậu của Thầy/Cô vẫn luôn là ký ức đẹp đẽ nhất thời áo trắng. Nhân dịp 20/11, tập thể chúng em kính chúc Thầy/Cô thật nhiều sức khỏe, niềm vui và gặt hái thêm nhiều mùa quả ngọt cùng các thế hệ học trò.',
  },
  {
    label: 'Tri ân Cựu học sinh',
    text: 'Mỗi bước tiến của chúng em hôm nay đều in dấu sự chỉ bảo ân cần của Thầy/Cô năm xưa. Ngày 20/11 trở về, xin được nghiêng mình cảm ơn Người đã âm thầm chèo lái con đò tri thức qua biết bao mùa nắng mưa. Kính chúc Thầy/Cô mãi mạnh khỏe, an nhiên và tự hào về những lứa học trò của mình.',
  },
  {
    label: 'Ban Tổ Chức / Nhà Trường',
    text: 'Trân trọng gửi tới Quý Thầy/Cô những lời chúc mừng tốt đẹp nhất nhân Ngày Nhà giáo Việt Nam 20/11. Xin ghi nhận và tri ân những đóng góp bền bỉ, tâm huyết của Thầy/Cô trong sự nghiệp trồng người cao quý. Kính chúc Thầy/Cô luôn tràn đầy nhiệt huyết, hạnh phúc và thành công trên hành trình giáo dục.',
  },
];

export const SAMPLE_DEMO_CARD: TeacherCard = {
  id: 'mau-co-minh-anh',
  honorific: 'Kính tặng Cô',
  teacherName: 'Nguyễn Minh Anh',
  roleOrSubject: 'Tổ trưởng Bộ môn Ngữ Văn · Chủ nhiệm lớp 12A1',
  photoData: ASSETS.samplePortrait,
  message:
    'Nhân ngày Nhà giáo Việt Nam 20 tháng 11, tập thể học sinh lớp 12A1 xin kính gửi tới Cô lời tri ân sâu sắc nhất. Cảm ơn Cô vì những trang giáo án miệt mài thâu đêm, vì sự dịu dàng nhưng luôn nghiêm khắc giúp chúng em biết yêu từng con chữ và biết sống tử tế hơn mỗi ngày.\n\nKính chúc Cô luôn dồi dào sức khỏe, giữ mãi nụ cười rạng rỡ và ngọn lửa đam mê bên những thế hệ học trò thân yêu.',
  senderName: 'Tập thể lớp 12A1 — Niên khóa 2023–2026',
  yearLabel: '20 · 11 · 2026',
  musicTheme: 'bui-phan',
  customAudioUrl: '',
  lacquerStyle: 'imperial-gold',
  ownerUid: 'demo',
};
