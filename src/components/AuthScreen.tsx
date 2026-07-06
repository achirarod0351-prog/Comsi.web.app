import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';
import { Calendar, Lock, Mail, Sparkles, UserPlus, LogIn, ArrowRight, Chrome, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthScreenProps {
  onUseLocalMode: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export default function AuthScreen({ onUseLocalMode, isModal = false, onClose }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authErrorType, setAuthErrorType] = useState<'none' | 'operation-not-allowed' | 'admin-restricted'>('none');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setError('');
    setAuthErrorType('none');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setAuthErrorType('operation-not-allowed');
        setError('Firebase Auth: วิธีการเข้าสู่ระบบนี้ยังไม่เปิดใช้งาน (Operation Not Allowed)');
      } else if (err.code === 'auth/admin-restricted-operation') {
        setAuthErrorType('admin-restricted');
        setError('Firebase Auth: การสมัครสมาชิกหรือลงทะเบียนถูกจำกัดโดยผู้ดูแลระบบ (Admin Restricted Operation)');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('อีเมลนี้ถูกใช้งานแล้ว');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (err.code === 'auth/invalid-email') {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
      } else {
        setError('เกิดข้อผิดพลาด: ' + (err.message || 'กรุณาลองใหม่อีกครั้ง'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setAuthErrorType('none');
    setLoading(true);
    try {
      // Allow testing without registering an email
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setAuthErrorType('operation-not-allowed');
        setError('Firebase Auth: วิธีเข้าสู่ระบบแบบผู้เยี่ยมชมยังไม่เปิดใช้งาน (Operation Not Allowed)');
      } else if (err.code === 'auth/admin-restricted-operation') {
        setAuthErrorType('admin-restricted');
        setError('Firebase Auth: การสมัคร/เข้าสู่ระบบแบบผู้เยี่ยมชมถูกจำกัดโดยผู้ดูแลระบบ (Admin Restricted Operation)');
      } else {
        setError('ไม่สามารถเข้าสู่ระบบแบบผู้เยี่ยมชมได้: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setAuthErrorType('none');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setAuthErrorType('operation-not-allowed');
        setError('Firebase Auth: วิธีเข้าสู่ระบบด้วย Google ยังไม่เปิดใช้งาน (Operation Not Allowed)');
      } else {
        setError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const cardBody = (
    <>
      {/* Close button if provided */}
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors z-20"
          title="ปิด"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4 border border-indigo-100">
            <Calendar className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 font-display tracking-tight">
            ปฏิทินอัจฉริยะ (Smart Calendar)
          </h1>
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-1">
            Geometric Balance Workspace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold text-center">
                  {error}
                </div>
                {authErrorType === 'operation-not-allowed' && (
                  <div className="p-4 bg-slate-900 text-white rounded-xl text-[11px] space-y-2.5 shadow-md border border-slate-800 text-left leading-relaxed">
                    <p className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      วิธีแก้ไข / How to Enable:
                    </p>
                    <p className="text-slate-300">
                      วิธีเข้าสู่ระบบนี้ยังไม่เปิดใช้งานในโครงการ Firebase ของคุณ กรุณาทำตามขั้นตอนนี้เพื่อเปิดใช้งาน:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>เปิด <a href={`https://console.firebase.google.com/project/${auth.app.options.projectId || 'your-project-id'}/authentication/providers`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-bold">Firebase Console</a></li>
                      <li>คลิกแท็บ <strong>"Sign-in method"</strong></li>
                      <li>คลิก <strong>"Add new provider"</strong> แล้วเปิดใช้งาน (Enable) <strong>"Email/Password"</strong> (และ <strong>"Google"</strong> หากใช้ด้วย)</li>
                      <li>กด <strong>"Save"</strong> แล้วรีเฟรชหน้านี้เพื่อเข้าใช้งานใหม่</li>
                    </ol>
                  </div>
                )}
                {authErrorType === 'admin-restricted' && (
                  <div className="p-4 bg-slate-900 text-white rounded-xl text-[11px] space-y-2.5 shadow-md border border-slate-800 text-left leading-relaxed">
                    <p className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      วิธีแก้ไข / Admin Restriction Fix:
                    </p>
                    <p className="text-slate-300">
                      Firebase ได้จำกัดสิทธิ์การสมัครบัญชีใหม่ กรุณาเปิดสิทธิ์ที่คอนโซล:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>เปิด <a href={`https://console.firebase.google.com/project/${auth.app.options.projectId || 'your-project-id'}/authentication/settings`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-bold">Firebase Authentication Settings</a></li>
                      <li>ที่หมวดหมู่ <strong>"User actions"</strong> ให้ทำเครื่องหมายถูกที่ <strong>"Enable create (sign-up)"</strong></li>
                      <li>บันทึกแล้วลองใหม่อีกครั้ง</li>
                    </ol>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">อีเมลผู้ใช้งาน</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">รหัสผ่าน</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                สมัครสมาชิก
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-y-0 left-0 right-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative px-3 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            หรือใช้ Google
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            <Chrome className="w-4 h-4 text-rose-500" />
            เข้าสู่ระบบด้วย Google (ใช้งานได้ทันที)
          </button>

          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setAuthErrorType('none');
            }}
            className="w-full text-center text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors py-2 block"
          >
            {isSignUp ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่' : 'ยังไม่มีบัญชีใช่หรือไม่? สมัครสมาชิกที่นี่'}
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 pt-6 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Securely Powered by Firebase
        </div>
      </>
    );

    if (isModal) {
      return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans animate-in fade-in duration-200">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto"
          >
            {cardBody}
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-2xl p-8 relative z-10"
        >
          {cardBody}
        </motion.div>
      </div>
    );
}
