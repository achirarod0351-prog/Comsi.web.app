import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import AuthScreen from './components/AuthScreen';
import CalendarGrid from './components/CalendarGrid';
import SidebarStats from './components/SidebarStats';
import EventModal from './components/EventModal';
import MobileDayAgendaModal from './components/MobileDayAgendaModal';
import { EventItem, LocalUser } from './types';
import { 
  Calendar, LogOut, User as UserIcon, Sparkles, AlertCircle, 
  Plus, CheckCircle, Search, CalendarDays, BarChart2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | LocalUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Selected date state (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Active month/year state being shown on calendar
  const [currentDate, setCurrentDate] = useState(new Date());

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileAgendaOpen, setIsMobileAgendaOpen] = useState(false);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // Close auth modal when user logs in successfully
  useEffect(() => {
    if (currentUser) {
      setIsAuthOpen(false);
    }
  }, [currentUser]);

  // Sync events from Firestore or LocalStorage in real-time
  useEffect(() => {
    if (!currentUser) {
      setLoadingEvents(true);
      const q = query(collection(db, 'events'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: EventItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data
          } as EventItem);
        });
        setEvents(list);
        setLoadingEvents(false);
      }, (error) => {
        console.error("Firestore loading error for guest:", error);
        setLoadingEvents(false);
      });
      return unsubscribe;
    }

    const isLocalUser = 'isLocal' in currentUser && currentUser.isLocal;

    if (isLocalUser) {
      setLoadingEvents(true);
      const loadLocalEvents = () => {
        try {
          const stored = localStorage.getItem('local_calendar_events');
          const list = stored ? JSON.parse(stored) : [];
          setEvents(list);
        } catch (e) {
          console.error("Failed to load local events:", e);
        } finally {
          setLoadingEvents(false);
        }
      };

      loadLocalEvents();

      const handleLocalUpdate = () => {
        loadLocalEvents();
      };
      window.addEventListener('local_events_updated', handleLocalUpdate);
      return () => {
        window.removeEventListener('local_events_updated', handleLocalUpdate);
      };
    } else {
      setLoadingEvents(true);
      
      // Listen to real-time updates for all shared events
      const q = query(collection(db, 'events'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: EventItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data
          } as EventItem);
        });
        setEvents(list);
        setLoadingEvents(false);
      }, (error) => {
        console.error("Firestore loading error:", error);
        setLoadingEvents(false);
      });

      return unsubscribe;
    }
  }, [currentUser]);

  // Handle saving an event (Create or Update)
  const handleSaveEvent = async (eventData: Omit<EventItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) return;

    const isLocalUser = 'isLocal' in currentUser && currentUser.isLocal;

    if (isLocalUser) {
      try {
        const stored = localStorage.getItem('local_calendar_events');
        const list: EventItem[] = stored ? JSON.parse(stored) : [];

        if (editingEvent) {
          // Update existing local event
          const updatedList = list.map(item => {
            if (item.id === editingEvent.id) {
              return {
                ...item,
                ...eventData,
                updatedAt: new Date().toISOString()
              };
            }
            return item;
          });
          localStorage.setItem('local_calendar_events', JSON.stringify(updatedList));
        } else {
          // Create new local event
          const newEvent: EventItem = {
            id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: currentUser.uid,
            title: eventData.title,
            description: eventData.description,
            date: eventData.date,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            category: eventData.category,
            status: eventData.status,
            createdAt: new Date().toISOString()
          };
          list.push(newEvent);
          localStorage.setItem('local_calendar_events', JSON.stringify(list));
        }
        window.dispatchEvent(new Event('local_events_updated'));
      } catch (error) {
        console.error("Error saving local event:", error);
        throw error;
      }
    } else {
      try {
        if (editingEvent) {
          // Update existing event
          const eventRef = doc(db, 'events', editingEvent.id);
          await updateDoc(eventRef, {
            ...eventData,
            updatedAt: serverTimestamp()
          });
        } else {
          // Create new event
          const eventsCol = collection(db, 'events');
          await addDoc(eventsCol, {
            ...eventData,
            userId: currentUser.uid,
            createdAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error saving event:", error);
        throw error;
      }
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = async (id: string) => {
    if (!currentUser) return;

    const isLocalUser = 'isLocal' in currentUser && currentUser.isLocal;

    if (isLocalUser) {
      try {
        const stored = localStorage.getItem('local_calendar_events');
        if (stored) {
          const list: EventItem[] = JSON.parse(stored);
          const filtered = list.filter(item => item.id !== id);
          localStorage.setItem('local_calendar_events', JSON.stringify(filtered));
          window.dispatchEvent(new Event('local_events_updated'));
        }
      } catch (error) {
        console.error("Error deleting local event:", error);
        throw error;
      }
    } else {
      try {
        const eventRef = doc(db, 'events', id);
        await deleteDoc(eventRef);
      } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
      }
    }
  };

  // Handle instant status toggle in list
  const handleToggleStatus = async (id: string, newStatus: EventItem['status']) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const isLocalUser = 'isLocal' in currentUser && currentUser.isLocal;

    if (isLocalUser) {
      try {
        const stored = localStorage.getItem('local_calendar_events');
        if (stored) {
          const list: EventItem[] = JSON.parse(stored);
          const updated = list.map(item => {
            if (item.id === id) {
              return { ...item, status: newStatus };
            }
            return item;
          });
          localStorage.setItem('local_calendar_events', JSON.stringify(updated));
          window.dispatchEvent(new Event('local_events_updated'));
        }
      } catch (error) {
        console.error("Error updating local status:", error);
      }
    } else {
      try {
        const eventRef = doc(db, 'events', id);
        await updateDoc(eventRef, {
          status: newStatus
        });
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  // Log out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Apply client-side filters on full loaded events
  const filteredEvents = events.filter((event) => {
    // 1. Category Filter
    if (selectedCategory !== 'all' && event.category !== selectedCategory) {
      return false;
    }
    // 2. Status Filter
    if (selectedStatus !== 'all' && event.status !== selectedStatus) {
      return false;
    }
    // 3. Keyword Search
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      const matchTitle = event.title.toLowerCase().includes(term);
      const matchDesc = event.description?.toLowerCase().includes(term) || false;
      if (!matchTitle && !matchDesc) {
        return false;
      }
    }
    return true;
  });

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500 font-display">กำลังเตรียมระบบปฏิทินอัจฉริยะ...</p>
        </div>
      </div>
    );
  }

  const handleUseLocalMode = () => {
    const localUser: LocalUser = {
      uid: 'local_user_' + Math.random().toString(36).substring(2, 11),
      email: 'โหมดออฟไลน์ (Local Mode)',
      isAnonymous: true,
      isLocal: true
    };
    localStorage.setItem('local_calendar_user', JSON.stringify(localUser));
    setCurrentUser(localUser);
    setIsAuthOpen(false);
  };

  // Set selected date from month click and open modal
  const handleDaySelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    if (window.innerWidth < 1024) {
      setIsMobileAgendaOpen(true);
    }
  };

  const handleOpenAddModal = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: EventItem) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Top Header Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg shadow-sm">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold font-display tracking-tight text-slate-800 flex items-center gap-1.5">
                ปฏิทินอัจฉริยะ 
                <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold font-mono uppercase tracking-wider hidden sm:block">
                Geometric Balance Workspace
              </p>
            </div>
          </div>

          {/* User Session */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-700">
                    {currentUser.isAnonymous ? 'ผู้ใช้งานทั่วไป (Guest)' : currentUser.email}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ระบบปฏิทินออนไลน์ (คลาวด์)
                  </span>
                </div>

                <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                <button
                  onClick={handleSignOut}
                  className="px-3.5 py-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all flex items-center gap-2 border border-slate-200 hover:border-rose-200 text-xs font-bold uppercase tracking-wider"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow text-xs font-bold uppercase tracking-wider"
              >
                <UserIcon className="w-4 h-4" />
                <span>เข้าสู่ระบบเป็น Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {loadingEvents && (
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl mb-6 flex items-center gap-3 text-indigo-800 text-xs font-medium">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
            <span>กำลังดึงข้อมูลปฏิทินล่าสุดจากฐานข้อมูลคลาวด์...</span>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Calendar Side */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <CalendarGrid 
              currentDate={currentDate}
              onCurrentDateChange={setCurrentDate}
              events={filteredEvents}
              selectedDate={selectedDate}
              onSelectDate={handleDaySelect}
              onEditEvent={handleOpenEditModal}
              onAddEvent={(dateStr) => {
                handleDaySelect(dateStr);
                handleOpenAddModal();
              }}
            />

            {/* Quick action block on calendar footer */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1.5 text-center sm:text-left relative z-10">
                <h4 className="text-sm font-bold font-display flex items-center gap-1.5 justify-center sm:justify-start">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  พร้อมเพิ่มกิจกรรมใหม่แล้วหรือยัง?
                </h4>
                <p className="text-xs text-slate-400">
                  คุณสามารถเพิ่มแผนงาน กิจกรรมส่วนตัว หรือการจัดประชุมลงในวันของคุณได้ทันที
                </p>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm shrink-0 flex items-center gap-1.5 relative z-10"
              >
                <Plus className="w-4 h-4" />
                เพิ่มกิจกรรมตอนนี้
              </button>
            </div>
          </div>

          {/* Sidebar / Stats Side */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <SidebarStats 
              selectedDate={selectedDate}
              events={events}
              onAddEventClick={handleOpenAddModal}
              onEditEvent={handleOpenEditModal}
              onToggleStatus={handleToggleStatus}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        <div className="max-w-7xl mx-auto px-4">
          Smart Calendar Workspace • Secure Firestore Sync • Geometric Balance Style
        </div>
      </footer>

      {/* Add / Edit Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <EventModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveEvent}
            onDelete={editingEvent ? handleDeleteEvent : undefined}
            selectedDate={selectedDate}
            editingEvent={editingEvent}
          />
        )}
      </AnimatePresence>

      {/* Mobile Day Agenda Modal */}
      <AnimatePresence>
        {isMobileAgendaOpen && (
          <MobileDayAgendaModal
            isOpen={isMobileAgendaOpen}
            onClose={() => setIsMobileAgendaOpen(false)}
            selectedDate={selectedDate}
            events={events}
            onAddEventClick={handleOpenAddModal}
            onEditEvent={handleOpenEditModal}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </AnimatePresence>

      {/* Admin Auth Modal */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthScreen 
            onUseLocalMode={handleUseLocalMode}
            isModal={true}
            onClose={() => setIsAuthOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
