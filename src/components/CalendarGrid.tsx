import React from 'react';
import { EventItem, CATEGORY_THEMES, getCategoryTheme } from '../types';
import { ChevronLeft, ChevronRight, Check, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface CalendarGridProps {
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
  events: EventItem[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  onEditEvent: (event: EventItem) => void;
  onAddEvent?: (dateStr: string) => void;
}

export default function CalendarGrid({
  currentDate,
  onCurrentDateChange,
  events,
  selectedDate,
  onSelectDate,
  onEditEvent,
  onAddEvent
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month labels in Thai
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const daysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  // Total days in current month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  // First day of current month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Previous month days to display
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const prevMonthPadding = Array.from({ length: firstDayIndex }, (_, i) => {
    const dayNum = prevMonthDays - firstDayIndex + i + 1;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    return {
      dayNum,
      isCurrentMonth: false,
      dateString: formatDateString(prevMonthDate),
      dateObj: prevMonthDate
    };
  });

  // Current month days
  const currentMonthDays = Array.from({ length: totalDays }, (_, i) => {
    const dayNum = i + 1;
    const currentMonthDate = new Date(year, month, dayNum);
    return {
      dayNum,
      isCurrentMonth: true,
      dateString: formatDateString(currentMonthDate),
      dateObj: currentMonthDate
    };
  });

  // Next month days to display
  const remainingSlots = 42 - (prevMonthPadding.length + currentMonthDays.length);
  const nextMonthPadding = Array.from({ length: remainingSlots }, (_, i) => {
    const dayNum = i + 1;
    const nextMonthDate = new Date(year, month + 1, dayNum);
    return {
      dayNum,
      isCurrentMonth: false,
      dateString: formatDateString(nextMonthDate),
      dateObj: nextMonthDate
    };
  });

  const allGridDays = [...prevMonthPadding, ...currentMonthDays, ...nextMonthPadding];

  function formatDateString(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Handle month navigation
  const prevMonth = () => {
    onCurrentDateChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onCurrentDateChange(new Date(year, month + 1, 1));
  };

  const setToday = () => {
    onCurrentDateChange(new Date());
    const todayStr = formatDateString(new Date());
    onSelectDate(todayStr);
  };

  const todayStr = formatDateString(new Date());

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, EventItem[]>);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Calendar Controller */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-display flex items-center gap-1.5">
            <span>{thaiMonths[month]}</span>
            <span className="text-slate-400 font-normal">{(year + 543)}</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
            Smart Monthly Agenda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={setToday}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
          >
            วันนี้
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-all"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-all"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Day Titles */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {daysOfWeek.map((day, idx) => (
          <div 
            key={idx} 
            className={`text-center text-xs font-bold py-3 uppercase tracking-wider ${
              idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-indigo-500' : 'text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 flex-1 min-h-[380px] bg-slate-100/50 gap-[1px]">
        {allGridDays.map((cell, idx) => {
          const dayEvents = eventsByDate[cell.dateString] || [];
          const isSelected = selectedDate === cell.dateString;
          const isToday = todayStr === cell.dateString;
          
          // Sort events by startTime
          const sortedEvents = [...dayEvents].sort((a, b) => {
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
          });

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(cell.dateString)}
              className={`min-h-[85px] p-2 flex flex-col justify-between cursor-pointer group transition-all duration-150 select-none bg-white relative ${
                cell.isCurrentMonth 
                  ? 'text-slate-700' 
                  : 'text-slate-300 opacity-40 bg-slate-50/50'
              } ${
                isSelected 
                  ? 'bg-indigo-50/25 ring-2 ring-inset ring-indigo-500/70 z-10' 
                  : 'hover:bg-slate-50/80'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span 
                  className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    isToday 
                      ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                      : isSelected 
                        ? 'text-indigo-600 bg-indigo-50 font-bold' 
                        : cell.isCurrentMonth 
                          ? 'text-slate-800' 
                          : 'text-slate-400'
                  }`}
                >
                  {cell.dayNum}
                </span>

                <div className="flex items-center gap-1">
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-bold px-1 py-0.5 rounded-md">
                      {dayEvents.length}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDate(cell.dateString);
                      onAddEvent?.(cell.dateString);
                    }}
                    className="hidden sm:flex p-1 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 items-center justify-center"
                    title="เพิ่มกิจกรรมสำหรับวันนี้"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day Event List (Micro badge view) */}
              <div className="space-y-1 mt-2 flex-1 flex flex-col justify-end overflow-hidden max-h-[65px] w-full">
                {sortedEvents.slice(0, 3).map((event) => {
                  const theme = getCategoryTheme(event.category);
                  const isCompleted = event.status === 'completed';
                  
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents triggering container click
                        onEditEvent(event);
                      }}
                      className={`text-[9px] sm:text-[10px] leading-tight px-1.5 py-1 rounded-md flex items-center gap-1 border border-transparent transition-all truncate font-medium ${
                        isCompleted 
                          ? 'bg-slate-100 text-slate-400 line-through' 
                          : `${theme.bg} ${theme.text} hover:scale-[1.02]`
                      }`}
                      title={`${event.title} (${event.startTime || 'ทั้งวัน'})`}
                    >
                      <span className={`w-1 h-1 rounded-full shrink-0 ${isCompleted ? 'bg-slate-400' : theme.dot}`} />
                      <span className="truncate flex-1">
                        {event.startTime && <span className="font-semibold mr-0.5">{event.startTime}</span>}
                        {event.title}
                      </span>
                      {isCompleted && <Check className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
                    </div>
                  );
                })}

                {sortedEvents.length > 3 && (
                  <div className="text-[8px] text-slate-400 font-bold text-center py-0.5 bg-slate-50 rounded-md">
                    +อีก {sortedEvents.length - 3} งาน
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
