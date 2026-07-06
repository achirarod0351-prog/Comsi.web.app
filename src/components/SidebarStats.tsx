import React from 'react';
import { EventItem, CATEGORY_THEMES, getCategoryTheme, formatThaiDate } from '../types';
import { 
  Calendar, CheckSquare, Clock, AlertCircle, Plus, Search, 
  Trash2, Edit, Check, Play, Square, Sparkles, Filter 
} from 'lucide-react';

interface SidebarStatsProps {
  selectedDate: string; // YYYY-MM-DD
  events: EventItem[];
  onAddEventClick: () => void;
  onEditEvent: (event: EventItem) => void;
  onToggleStatus: (id: string, currentStatus: EventItem['status']) => Promise<void>;
  
  // Search & Filter state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}

export default function SidebarStats({
  selectedDate,
  events,
  onAddEventClick,
  onEditEvent,
  onToggleStatus,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus
}: SidebarStatsProps) {
  
  // Filter events of the currently selected date
  const selectedDayEvents = events.filter(e => e.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* Search and Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          ค้นหาและกรองกิจกรรม
        </h3>

        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อเรื่องหรือรายละเอียด..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
          />
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">หมวดหมู่</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">ทั้งหมด</option>
              {Object.entries(CATEGORY_THEMES).map(([key, theme]) => (
                <option key={key} value={key}>{theme.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">สถานะ</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="in_progress">กำลังทำ</option>
              <option value="completed">เสร็จสิ้น</option>
            </select>
          </div>
        </div>
      </div>

      {/* Colors of activities & Legend */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            สีของกิจกรรมที่ต้องทำ
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            UNIVERSITY LIFE LEGEND
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.entries(CATEGORY_THEMES).map(([key, theme]) => {
            const count = events.filter(e => e.category === key).length;
            return (
              <div 
                key={key}
                className={`px-3 py-2.5 rounded-xl border ${theme.border} ${theme.bg} flex items-center justify-between transition-all`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.dot}`} />
                  <span className={`text-[11px] font-bold truncate ${theme.text}`}>
                    {theme.label}
                  </span>
                </div>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-white border ${theme.border} ${theme.text} shrink-0`}>
                  {count} งาน
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              กำหนดการเฉพาะวัน
            </h3>
            <p className="text-xs text-slate-700 font-bold mt-1">
              {formatThaiDate(selectedDate)}
            </p>
          </div>
          <button
            onClick={onAddEventClick}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-sm"
            title="เพิ่มกิจกรรมวันนี้นอกเหนือตาราง"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Day Event List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {selectedDayEvents.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50/40 rounded-xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">ยังไม่มีกิจกรรมสำหรับวันนี้</p>
              <button
                onClick={onAddEventClick}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold mt-1.5 underline underline-offset-2"
              >
                เพิ่มงานแรกของคุณที่นี่
              </button>
            </div>
          ) : (
            [...selectedDayEvents]
              .sort((a, b) => {
                if (!a.startTime) return 1;
                if (!b.startTime) return -1;
                return a.startTime.localeCompare(b.startTime);
              })
              .map((event) => {
                const theme = getCategoryTheme(event.category);
                const isCompleted = event.status === 'completed';
                const isInProgress = event.status === 'in_progress';

                const borderLeftColor = theme?.borderLeft || 'border-l-indigo-500';

                return (
                  <div
                    key={event.id}
                    className={`p-3.5 rounded-r-xl border-y border-r border-l-4 ${borderLeftColor} transition-all duration-200 hover:shadow-sm flex items-start gap-3 bg-white border-slate-200`}
                  >
                    {/* Status Toggle Box */}
                    <button
                      onClick={() => {
                        const nextStatusMap: Record<EventItem['status'], EventItem['status']> = {
                          pending: 'in_progress',
                          in_progress: 'completed',
                          completed: 'pending'
                        };
                        onToggleStatus(event.id, nextStatusMap[event.status]);
                      }}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isInProgress
                            ? 'bg-amber-100 border-amber-400 text-amber-700'
                            : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30'
                      }`}
                      title="กดเปลี่ยนสถานะกิจกรรม"
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5" />}
                      {isInProgress && <Play className="w-3 h-3 fill-current" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${theme.bg} ${theme.text}`}>
                          {theme.label}
                        </span>
                        
                        {(event.startTime || event.endTime) && (
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {event.startTime || '00:00'}{event.endTime ? ` - ${event.endTime}` : ''}
                          </span>
                        )}
                      </div>

                      <h4 className={`text-xs font-bold leading-snug truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {event.title}
                      </h4>

                      {event.description && (
                        <p className={`text-[11px] mt-1 leading-normal line-clamp-2 ${isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Edit button */}
                    <button
                      onClick={() => onEditEvent(event)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
