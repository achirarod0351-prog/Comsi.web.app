export interface LocalUser {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
  isLocal: boolean;
}

export interface EventItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  category: 'homework' | 'group_work' | 'exam' | 'holiday' | 'exam_term' | 'special';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: any;
}

export type CategoryTheme = {
  bg: string;
  text: string;
  border: string;
  dot: string;
  borderLeft: string;
  label: string;
};

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  homework: {
    bg: 'bg-blue-50 hover:bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
    borderLeft: 'border-l-blue-500',
    label: 'การบ้าน'
  },
  group_work: {
    bg: 'bg-teal-50 hover:bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-200',
    dot: 'bg-teal-600',
    borderLeft: 'border-l-teal-500',
    label: 'งานกลุ่ม'
  },
  exam: {
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-600',
    borderLeft: 'border-l-amber-500',
    label: 'สอบ'
  },
  holiday: {
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
    borderLeft: 'border-l-emerald-500',
    label: 'วันหยุด'
  },
  exam_term: {
    bg: 'bg-rose-50 hover:bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-600',
    borderLeft: 'border-l-rose-500',
    label: 'สอบกลางภาค/ปลายภาค'
  },
  special: {
    bg: 'bg-purple-50 hover:bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-600',
    borderLeft: 'border-l-purple-500',
    label: 'กิจกรรมพิเศษ'
  }
};

export function getCategoryTheme(category: string): CategoryTheme {
  const legacyMap: Record<string, string> = {
    work: 'homework',
    personal: 'holiday',
    meeting: 'group_work',
    urgent: 'exam_term',
    other: 'special'
  };

  const resolved = legacyMap[category] || category;
  return CATEGORY_THEMES[resolved] || CATEGORY_THEMES.homework;
}

export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0]) + 543;
  const monthIndex = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  return `วันที่ ${day} ${thaiMonths[monthIndex]} พ.ศ. ${year}`;
}

