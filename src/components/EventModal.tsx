import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Type, Tag, AlignLeft, Info, Trash2, CheckCircle2 } from 'lucide-react';
import { EventItem, CATEGORY_THEMES } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<EventItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  selectedDate: string; // YYYY-MM-DD
  editingEvent?: EventItem | null;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  editingEvent
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState<EventItem['category']>('homework');
  const [status, setStatus] = useState<EventItem['status']>('pending');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setDate(editingEvent.date);
      setStartTime(editingEvent.startTime || '');
      setEndTime(editingEvent.endTime || '');
      
      // Resolve legacy categories to new university ones
      const legacyMap: Record<string, EventItem['category']> = {
        work: 'homework',
        personal: 'holiday',
        meeting: 'group_work',
        urgent: 'exam_term',
        other: 'special'
      };
      setCategory(legacyMap[editingEvent.category] || editingEvent.category);
      setStatus(editingEvent.status);
    } else {
      setTitle('');
      setDescription('');
      setDate(selectedDate);
      setStartTime('');
      setEndTime('');
      setCategory('homework');
      setStatus('pending');
    }
    setError('');
    setShowDeleteConfirm(false);
  }, [editingEvent, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('กรุณากรอกหัวข้อกิจกรรม/งาน');
      return;
    }

    if (startTime && endTime && startTime > endTime) {
      setError('เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        category,
        status
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingEvent || !onDelete) return;
    setSubmitting(true);
    try {
      await onDelete(editingEvent.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-800 font-display">
                {editingEvent ? 'แก้ไขกิจกรรม/งาน' : 'เพิ่มกิจกรรม/งานใหม่'}
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Event specifications
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">หัวข้อกิจกรรม/งาน *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Type className="w-4 h-4" />
              </span>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ระบุชื่องานหรือกิจกรรมที่ต้องการจดบันทึก..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">รายละเอียดเพิ่มเติม</label>
            <div className="relative">
              <span className="absolute top-3 left-3.5 text-slate-400">
                <AlignLeft className="w-4 h-4" />
              </span>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุรายละเอียดเพิ่มเติม สถานที่ หรือคำอธิบายงาน..."
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Date and Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">วันที่</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                required
              />
            </div>

            {/* Start Time */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">เวลาเริ่มต้น</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">เวลาสิ้นสุด</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">หมวดหมู่</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Tag className="w-3.5 h-3.5" />
                </span>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventItem['category'])}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none"
                >
                  {Object.entries(CATEGORY_THEMES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">สถานะ</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventItem['status'])}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none"
                >
                  <option value="pending">รอดำเนินการ (Pending)</option>
                  <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
                  <option value="completed">เสร็จสิ้นแล้ว (Completed)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex flex-col gap-3 border-t border-slate-200">
            {showDeleteConfirm ? (
              <div className="w-full bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <span className="text-[11px] font-bold text-rose-700">
                  คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={submitting}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3" />
                        ยืนยันลบ
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 w-full">
                {editingEvent && onDelete ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ลบกิจกรรม
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-lg text-xs font-bold uppercase tracking-wider"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'บันทึก'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
