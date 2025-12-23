import { Component, OnInit } from '@angular/core';
import { Lunar } from 'lunar-javascript';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lunar-calendar.component.html',
    styleUrls: ['./lunar-calendar.component.scss'],
})
export class LunarCalendarComponent implements OnInit {
  todaySolar: string = '';
  // Lịch dương
  todayLunar = '';
  // Lịch âm tiếng Việt
  todayLunarZh: string = '';
  // Lịch âm tiếng Hoa
  todayLunarEn: string = '';
  // Lịch âm tiếng Anh
  canChiDay: string = '';
  canChiMonth: string = '';
  canChiYear: string = '';
  tietVi: string = '';
  canChiVi: string = '';
  jieQi: string = '';
  canChiEn: string = '';

  currentMonth = 0;
  currentYear = 0;
  currentDay: number = 0;
  currentWeekday: string = '';

  lunarMonthNumber: number = 0;
  lunarDayNumber: number = 0;

  yearGC = '';
  monthGC = '';
   dayGC = '';

  monthDays: { solar: number; lunar: number | null; isToday: boolean }[][] = [];

  // Tiết khí tiếng Việt
  tietZh: string = '';
  // Tiết khí tiếng Hoa
  zodiacHoursVi: string[] = [];
  zodiacHoursZh: string[] = [];
  private canMap: { [han: string]: string } = {
    甲: 'Giáp ',
    乙: 'Ất ',
    丙: 'Bính ',
    丁: 'Đinh ',
    戊: 'Mậu ',
    己: 'Kỷ ',
    庚: 'Canh ',
    辛: 'Tân ',
    壬: 'Nhâm ',
    癸: 'Quý ',
  };
  private chiMap: { [han: string]: string } = {
    子: 'Tý',
    丑: 'Sửu',
    寅: 'Dần',
    卯: 'Mão',
    辰: 'Thìn',
    巳: 'Tỵ',
    午: 'Ngọ',
    未: 'Mùi',
    申: 'Thân',
    酉: 'Dậu',
    戌: 'Tuất',
    亥: 'Hợi',
  };
  // Map tên tiết khí từ tiếng Hoa sang tiếng Việt
  private tietMap: { [zh: string]: string } = {
    小寒: 'Tiểu hàn',
    大寒: 'Đại hàn',
    立春: 'Lập xuân',
    雨水: 'Vũ thuỷ',
    惊蛰: 'Kinh trập',
    春分: 'Xuân phân',
    清明: 'Thanh minh',
    谷雨: 'Cốc vũ',
    立夏: 'Lập hạ',
    小满: 'Tiểu mãn',
    芒种: 'Mang chủng',
    夏至: 'Hạ chí',
    小暑: 'Tiểu thử',
    大暑: 'Đại thử',
    立秋: 'Lập thu',
    处暑: 'Xử thử',
    白露: 'Bạch lộ',
    秋分: 'Thu phân',
    寒露: 'Hàn lộ',
    霜降: 'Sương giáng',
    立冬: 'Lập đông',
    小雪: 'Tiểu tuyết',
    大雪: 'Đại tuyết',
    冬至: 'Đông chí',
  };

  ngOnInit() {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();

    this.currentDay = today.getDate();

    const daysOfWeek = [
      'Chủ Nhật',
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
    ];
    this.currentWeekday = daysOfWeek[today.getDay()];

    this.generateMonthCalendar();

    const lunar = Lunar.fromDate(today);

    this.todaySolar = today.toLocaleDateString('vi-VN');

    // Lịch âm
    this.todayLunarZh = lunar.toString(); // Chữ Hán
    const convertGanChi = (gc: string) => {
      if (!gc) return '';
      const [gan, chi] = gc.split('');
      return `${this.canMap[gan] || gan}${this.chiMap[chi] || chi}`;
    };
    const yearGC = lunar.getYearInGanZhi();
    const monthGC = lunar.getMonthInGanZhi();
    const dayGC = lunar.getDayInGanZhi();
    this.todayLunar = `${this.todayLunarZh}`;

    this.parseLunarDate(this.todayLunar);

    // Can Chi
    this.canChiVi = `Năm ${convertGanChi(yearGC)} Tháng ${convertGanChi(
      monthGC
    )} Ngày ${convertGanChi(dayGC)} `;
    this.canChiEn = this.todayLunarZh; // giữ chữ Hán


    this.yearGC =  `Năm ${convertGanChi(yearGC)} - ${yearGC} `;
    this.monthGC = `Tháng ${convertGanChi(monthGC)} - ${monthGC}`;
    this.dayGC = `Ngày ${convertGanChi(dayGC)} - ${dayGC} `;

    // Tiết khí
    const jieQi = lunar.getJieQi() || lunar.getPrevJieQi();
    this.jieQi = `${this.tietMap[jieQi] || jieQi} - ${jieQi}`;

    // Giờ hoàng đạo / hắc đạo
    const hoangDaoZhi = this.getHoangDaoHours(lunar.getDayGan());
    const allHours = lunar.getTimes();
    const zhiToKhungGio: { [zhi: string]: string } = {
      子: '23h-1h',
      丑: '1h-3h',
      寅: '3h-5h',
      卯: '5h-7h',
      辰: '7h-9h',
      巳: '9h-11h',
      午: '11h-13h',
      未: '13h-15h',
      申: '15h-17h',
      酉: '17h-19h',
      戌: '19h-21h',
      亥: '21h-23h',
    };
    const convertHourGanChi = (gc: string) => {
      if (!gc) return '';
      const [gan, chi] = gc.split('');
      return `${gan}${chi} - ${this.canMap[gan] || gan}${
        this.chiMap[chi] || chi
      }`;
    };

    this.zodiacHoursVi = allHours
      .filter((hour: any) => hoangDaoZhi.includes(hour.getZhi()))
      .map(
        (hour: any) =>
          `${convertHourGanChi(hour.getGanZhi())} (${
            zhiToKhungGio[hour.getZhi()]
          })`
      );

    this.zodiacHoursZh = allHours
      .filter((hour: any) => !hoangDaoZhi.includes(hour.getZhi()))
      .map(
        (hour: any) =>
          `${convertHourGanChi(hour.getGanZhi())} (${
            zhiToKhungGio[hour.getZhi()]
          })`
      );

    console.log('✅ Giờ hoàng đạo:', this.zodiacHoursVi);
    console.log('✅ Giờ hắc đạo:', this.zodiacHoursZh);
  }

parseLunarDate(lunarStr: string) {
    const afterYear = lunarStr.split('年')[1]; // "十月廿七"

    if (afterYear) {
      const parts = afterYear.split('月');
      const monthPart = parts[0]; // "十"
      const dayPart = parts[1];   // "廿七"

      this.lunarMonthNumber = this.decodeLunarValue(monthPart);
      this.lunarDayNumber = this.decodeLunarValue(dayPart);
    }
  }

  // Hàm chuyển đổi ký tự Hán Việt sang số
  decodeLunarValue(text: string): number {
    const map: { [key: string]: number } = {
      '正': 1, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
      '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
      '廿': 20, '卅': 30
    };

    if (text.length === 1) return map[text] || 0;

    // Trường hợp 2 ký tự (ví dụ: 十二 = 12, 廿七 = 27, 初五 = 5)
    if (text.startsWith('初')) return map[text[1]] || 0;
    if (text.startsWith('十')) return 10 + (map[text[1]] || 0);
    if (text.startsWith('廿')) return 20 + (map[text[1]] || 0);
    if (text.startsWith('卅')) return 30 + (map[text[1]] || 0);

    return 0;
  }

  private getHoangDaoHours(can: string): string[] {
    switch (can) {
      case '甲':
      case '己': // Giáp, Kỷ
        return ['子', '丑', '卯', '午', '未', '酉'];
      case '乙':
      case '庚': // Ất, Canh
        return ['寅', '辰', '巳', '申', '戌', '亥'];
      case '丙':
      case '辛': // Bính, Tân
        return ['子', '寅', '卯', '午', '申', '酉'];
      case '丁':
      case '壬': // Đinh, Nhâm
        return ['丑', '辰', '巳', '未', '戌', '亥'];
      case '戊':
      case '癸': // Mậu, Quý
        return ['子', '丑', '辰', '巳', '未', '戌'];
      default:
        return [];
    }
  }

  generateMonthCalendar() {
    const today = new Date();

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startWeekDay = firstDay.getDay(); // 0=CN, 1=T2...
    const totalDays = lastDay.getDate();

    let week: { solar: number; lunar: number; isToday: boolean }[] = [];
    const calendar: { solar: number; lunar: number; isToday: boolean }[][] = [];

    for (let i = 0; i < startWeekDay; i++) {
      week.push({ solar: 0, lunar: 0, isToday: false }); // ô trống đầu tuần
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const lunar = Lunar.fromDate(date);

      const lunarNumber = lunar.getDay(); // số âm 1-30
      const isToday = date.toDateString() === today.toDateString();

      week.push({ solar: day, lunar: lunarNumber, isToday });

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    // ô trống cuối tuần
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ solar: 0, lunar: 0, isToday: false });
      }
      calendar.push(week);
    }

    this.monthDays = calendar;
  }

  private lunarNumberMap: { [han: string]: number } = {
    初一: 1,
    初二: 2,
    初三: 3,
    初四: 4,
    初五: 5,
    初六: 6,
    初七: 7,
    初八: 8,
    初九: 9,
    初十: 10,
    十一: 11,
    十二: 12,
    十三: 13,
    十四: 14,
    十五: 15,
    十六: 16,
    十七: 17,
    十八: 18,
    十九: 19,
    二十: 20,
    二十一: 21,
    二十二: 22,
    二十三: 23,
    二十四: 24,
    二十五: 25,
    二十六: 26,
    二十七: 27,
    二十八: 28,
    二十九: 29,
    三十: 30,
  };
  private getLunarNumber(lunarDay: string): number {
    return this.lunarNumberMap[lunarDay] || 0;
  }
}
