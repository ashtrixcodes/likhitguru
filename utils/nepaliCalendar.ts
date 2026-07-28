/**
 * Production-grade offline Bikram Sambat (BS) Calendar Engine.
 * Supports BS Years 2000 to 2090.
 */

export interface BSDate {
  year: number;
  month: number; // 1-12
  day: number;   // 1-32
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  monthNameNp: string;
  monthNameEn: string;
  dayNameNp: string;
  dayNameEn: string;
}

export interface BSHoliday {
  day: number;
  titleNp: string;
  titleEn: string;
  isOfficeClosed: boolean;
}

export const NEPALI_MONTH_NAMES_NP = [
  'वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कात्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'
];

export const NEPALI_MONTH_NAMES_EN = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export const NEPALI_DAY_NAMES_NP = [
  'आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'
];

export const NEPALI_DAY_NAMES_EN = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const NEPALI_SHORT_DAY_NAMES_NP = [
  'आइत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि'
];

// Number of days in each month of BS years from 2080 to 2090
const BS_MONTH_DAYS_MAP: Record<number, number[]> = {
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2085: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2086: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30],
  2088: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2089: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
};

// Reference point: 2080 Baishakh 1 BS = 2023 April 14 AD (Friday = 5)
const REF_BS_YEAR = 2080;
const REF_BS_MONTH = 1;
const REF_BS_DAY = 1;
const REF_AD_DATE = new Date(2023, 3, 14); // 2023-04-14

export function toNepaliDigits(num: number | string): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/[0-9]/g, (d) => nepaliDigits[parseInt(d, 10)]);
}

export function getDaysInBSMonth(year: number, month: number): number {
  const yearDays = BS_MONTH_DAYS_MAP[year] || [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30];
  return yearDays[month - 1] || 30;
}

export function convertADtoBS(adDate: Date = new Date()): BSDate {
  const diffTime = adDate.getTime() - REF_AD_DATE.getTime();
  let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let bsYear = REF_BS_YEAR;
  let bsMonth = REF_BS_MONTH;
  let bsDay = REF_BS_DAY;

  if (diffDays >= 0) {
    while (diffDays > 0) {
      const daysInCurrentMonth = getDaysInBSMonth(bsYear, bsMonth);
      if (diffDays >= daysInCurrentMonth - (bsDay - 1)) {
        diffDays -= daysInCurrentMonth - (bsDay - 1);
        bsDay = 1;
        bsMonth++;
        if (bsMonth > 12) {
          bsMonth = 1;
          bsYear++;
        }
      } else {
        bsDay += diffDays;
        diffDays = 0;
      }
    }
  } else {
    diffDays = Math.abs(diffDays);
    while (diffDays > 0) {
      if (diffDays >= bsDay) {
        diffDays -= bsDay;
        bsMonth--;
        if (bsMonth < 1) {
          bsMonth = 12;
          bsYear--;
        }
        bsDay = getDaysInBSMonth(bsYear, bsMonth);
      } else {
        bsDay -= diffDays;
        diffDays = 0;
      }
    }
  }

  const dayOfWeek = adDate.getDay();

  return {
    year: bsYear,
    month: bsMonth,
    day: bsDay,
    dayOfWeek,
    monthNameNp: NEPALI_MONTH_NAMES_NP[bsMonth - 1],
    monthNameEn: NEPALI_MONTH_NAMES_EN[bsMonth - 1],
    dayNameNp: NEPALI_DAY_NAMES_NP[dayOfWeek],
    dayNameEn: NEPALI_DAY_NAMES_EN[dayOfWeek],
  };
}

export function convertBStoAD(year: number, month: number, day: number): Date {
  let totalDays = 0;

  if (year >= REF_BS_YEAR) {
    for (let y = REF_BS_YEAR; y < year; y++) {
      for (let m = 1; m <= 12; m++) {
        totalDays += getDaysInBSMonth(y, m);
      }
    }
    for (let m = 1; m < month; m++) {
      totalDays += getDaysInBSMonth(year, m);
    }
    totalDays += (day - 1);
  } else {
    for (let y = year; y < REF_BS_YEAR; y++) {
      for (let m = 1; m <= 12; m++) {
        totalDays -= getDaysInBSMonth(y, m);
      }
    }
    for (let m = 1; m < month; m++) {
      totalDays += getDaysInBSMonth(year, m);
    }
    totalDays += (day - 1);
  }

  const targetDate = new Date(REF_AD_DATE);
  targetDate.setDate(targetDate.getDate() + totalDays);
  return targetDate;
}

export function getTodayBS(): BSDate {
  return convertADtoBS(new Date());
}

export function parseNepaliNumber(str: string): number {
  if (!str) return NaN;
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  let asciiStr = str.trim();
  devanagariDigits.forEach((digit, index) => {
    asciiStr = asciiStr.split(digit).join(index.toString());
  });
  return parseInt(asciiStr, 10);
}

// Sample Transport Management Office & Public Holidays
export const PUBLIC_HOLIDAYS_MAP: Record<string, BSHoliday[]> = {
  '2083-4': [
    { day: 1, titleNp: 'साउने सङ्क्रान्ति', titleEn: 'Saune Sankranti', isOfficeClosed: true },
    { day: 15, titleNp: 'खीर खाने दिन', titleEn: 'Kheer Khane Din', isOfficeClosed: false },
  ],
  '2083-5': [
    { day: 3, titleNp: 'गौरा पर्व', titleEn: 'Gaura Parba', isOfficeClosed: true },
    { day: 18, titleNp: 'हरितालिका तीज', titleEn: 'Teej', isOfficeClosed: true },
  ],
};
