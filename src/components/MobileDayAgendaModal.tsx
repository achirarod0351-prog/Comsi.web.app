import React from 'react';
import { motion } from 'motion/react';
import { 
  X, Calendar, Plus, Clock, Check, Play, Edit, Trash2, CalendarDays
} from 'lucide-react';
import { EventItem, getCategoryTheme, formatThaiDate } from '../types';

interface MobileDayAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  events: EventItem[];
  onAddEventClick: () => void;
  onEditEvent: (event: EventItem) => void;
  onToggleStatus: (id: string, currentStatus: EventItem['status']) => Promise<void>;
}

export default function MobileDayAgendaModal({
  isOpen,
  onClose,
  selectedDate,
  events,
  onAddEventClick,
  onEditEvent,
  onToggleStatus
}: MobileDayAgendaModalProps) {
  if (!isOpen) return null;

  // Filter events of the selected date
  const dayEvents = events.filter(e => e.date === selectedDate);

  // Sort events by startTime
  const sortedEvents = [...dayEvents].sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
      />

      {/* Drawer / Modal Container */}
      <motion.div
        initial={{ y: '100%', opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0.5 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[80vh] sm:max-h-[75vh] z-10 overflow-hidden"
      >
        {/* Notch / Handle decoration for mobile only */}
        <div className="flex justify-center py-2.5 shrink-0 bg-white sm:hidden">
          <div className="w-12 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 sm:pt-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-mono">
              กำหนดการรายวัน
            </h3>
            <p className="text-base font-bold text-slate-800 mt-0.5">
              {formatThaiDate(selectedDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Event List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3">
                <CalendarDays className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">ไม่มีกิจกรรมสำหรับวันนี้</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                แตะปุ่มด้านล่างเพื่อเพิ่มแผนการเรียน การบ้าน หรือวันหยุดของคุณ
              </p>
            </div>
          ) : (
            sortedEvents.map((event) => {
              const theme = getCategoryTheme(event.category);
              const isCompleted = event.status === 'completed';
              const isInProgress = event.status === 'in_progress';
              const borderLeftColor = theme?.borderLeft || 'border-l-indigo-500';

              return (
                <div
                  key={event.id}
                  className={`p-4 rounded-2xl border-y border-r border-l-4 ${borderLeftColor} bg-white border-slate-100 shadow-sm flex items-start gap-3.5 transition-all active:scale-[0.99]`}
                >
                  {/* Status Checkbox */}
                  <button
                    onClick={() => {
                      const nextStatusMap: Record<EventItem['status'], EventItem['status']> = {
                        pending: 'in_progress',
                        in_progress: 'completed',
                        completed: 'pending'
                      };
                      onToggleStatus(event.id, nextStatusMap[event.status]);
                    }}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : isInProgress
                          ? 'bg-amber-100 border-amber-400 text-amber-700'
                          : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30'
                    }`}
                  >
                    {isCompleted && <Check className="w-4 h-4" />}
                    {isInProgress && <Play className="w-3 h-3 fill-current" />}
                  </button>

                  {/* Info details */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      onClose();
                      onEditEvent(event);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${theme.bg} ${theme.text}`}>
                        {theme.label}
                      </span>
                      
                      {(event.startTime || event.endTime) && (
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {event.startTime || '00:00'}{event.endTime ? ` - ${event.endTime}` : ''}
                        </span>
                      )}
                    </div>

                    <h4 className={`text-sm font-bold leading-snug break-words ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {event.title}
                    </h4>

                    {event.description && (
                      <p className={`text-xs mt-1 leading-relaxed break-words ${isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => {
                      onClose();
                      onEditEvent(event);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0 flex gap-3">
          <button
            onClick={() => {
              onClose();
              onAddEventClick();
            }}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มกิจกรรมใหม่</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
