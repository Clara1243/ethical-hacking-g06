import React, { useState, useEffect } from 'react';
import { UserProfile, Course, PaymentReceipt, UserRole, Review } from './types';
import { INITIAL_COURSES, INITIAL_RECEIPTS, USERS } from './data';
import { WebAddressBar } from './components/WebAddressBar';
import { CourseCatalog } from './components/CourseCatalog';
import { CourseDetailPage } from './components/CourseDetailPage';
import { EducatorDashboard } from './components/EducatorDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ProfilePage } from './components/ProfilePage';
import { BillingHistory } from './components/BillingHistory';
import { ReceiptView } from './components/ReceiptView';
import { UserManagement } from './components/UserManagement';

import { 
  Users as UsersIcon, 
  BookOpen, 
  CreditCard, 
  User as UserIcon, 
  ShieldCheck, 
  ChevronDown, 
  PlusCircle, 
  Terminal, 
  Lock, 
  GraduationCap, 
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';

export default function App() {
  // Load initial states from local storage or fallback to defaults
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('eduunity_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => {
    const saved = localStorage.getItem('eduunity_receipts');
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  const [usersDb, setUsersDb] = useState<Record<string, UserProfile>>(() => {
    const saved = localStorage.getItem('eduunity_users_db');
    return saved ? JSON.parse(saved) : USERS;
  });

  // Current logged in user profile (Student Alice by default to make testing immediate)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('eduunity_current_user');
    if (saved) {
      return JSON.parse(saved);
    }
    return USERS.student; // Default login as Alice Smith (Student)
  });

  // Current Selected Tab / Active Module
  const [activeTab, setActiveTab] = useState<'courses' | 'billing' | 'profile' | 'educator' | 'admin'>('courses');
  
  // Current active details course (null if viewing catalog grid)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Directly selected receipt ID (for direct receipt IDOR testing)
  const [activeReceiptId, setActiveReceiptId] = useState<number | null>(null);

  // Profile parameter for IDOR tests (null if viewing self)
  const [profileEmail, setProfileEmail] = useState<string | null>(null);

  // Sub tab for Admin navigation ('dashboard' | 'ledger' | 'users' | 'profile')
  const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'ledger' | 'users' | 'profile'>('dashboard');

  // Login dropdown toggles
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [customRoleName, setCustomRoleName] = useState('');
  const [customRoleEmail, setCustomRoleEmail] = useState('');
  const [customRoleType, setCustomRoleType] = useState<UserRole>('student');

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem('eduunity_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('eduunity_receipts', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem('eduunity_users_db', JSON.stringify(usersDb));
  }, [usersDb]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('eduunity_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('eduunity_current_user');
    }
  }, [currentUser]);

  // Sync state with URL parameters for real IDOR tests (Supporting BOTH receipts and profiles!)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rId = params.get('receipt_id');
    const emailParam = params.get('email');

    if (rId) {
      const numId = parseInt(rId, 10);
      if (!isNaN(numId)) {
        setActiveReceiptId(numId);
      }
    }
    if (emailParam) {
      setProfileEmail(emailParam);
      setActiveTab('profile');
    }

    // Set dynamic popstate listener to let address modification load receipts/profiles directly!
    const handlePopState = () => {
      const liveParams = new URLSearchParams(window.location.search);
      const liveId = liveParams.get('receipt_id');
      const liveEmail = liveParams.get('email');

      if (liveId) {
        const numId = parseInt(liveId, 10);
        if (!isNaN(numId)) {
          setActiveReceiptId(numId);
        }
      } else {
        setActiveReceiptId(null);
      }

      if (liveEmail) {
        setProfileEmail(liveEmail);
        setActiveTab('profile');
      } else {
        setProfileEmail(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update real URL parameter helper for Receipts
  const updateAddressBarState = (id: number | null) => {
    if (id !== null) {
      const newUrl = `${window.location.pathname}?receipt_id=${id}`;
      window.history.pushState({ receiptId: id }, '', newUrl);
    } else {
      window.history.pushState({}, '', window.location.pathname);
    }
    setActiveReceiptId(id);
    setProfileEmail(null);
  };

  // Update real URL parameter helper for Profiles
  const handleProfileEmailChange = (email: string | null) => {
    if (email !== null) {
      const newUrl = `${window.location.pathname}?email=${email}`;
      window.history.pushState({ email: email }, '', newUrl);
      setActiveTab('profile');
    } else {
      window.history.pushState({}, '', window.location.pathname);
    }
    setProfileEmail(email);
    setActiveReceiptId(null);
  };

  // Actions
  const handleCompleteEnrollment = (receipt: PaymentReceipt) => {
    // Add completed payment invoice record
    setReceipts((prev) => [receipt, ...prev]);

    if (!currentUser) return;

    // Update student's enrolled course references
    const updatedUser = {
      ...currentUser,
      enrolledCourses: Array.from(new Set([...currentUser.enrolledCourses, receipt.courseId])),
    };

    setCurrentUser(updatedUser);

    // Save in database dictionary
    setUsersDb((prev) => {
      const key = Object.keys(prev).find(k => prev[k].email === currentUser.email) || currentUser.role;
      return {
        ...prev,
        [key]: updatedUser,
      };
    });

    setSelectedCourseId(null);
    if (currentUser.role === 'admin') {
      setAdminSubTab('ledger');
    } else {
      setActiveTab('billing');
    }
  };

  // Add unfiltered review directly to course model (Showcasing XSS)
  const handleAddReview = (courseId: string, content: string, rating: number) => {
    if (!currentUser) {
      alert('Please select or create an active profile session to post feedback!');
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: currentUser.name,
      authorRole: currentUser.role,
      content: content, // UNSANITIZED RAW HTML (deliberate XSS vulnerability)
      rating,
      date: new Date().toISOString().split('T')[0],
    };

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            reviews: [newReview, ...c.reviews],
          };
        }
        return c;
      })
    );
  };

  // Support read and update Profile IDOR
  const handleUpdateBio = (targetEmail: string, newBio: string) => {
    setUsersDb((prev) => {
      const next = { ...prev };
      const key = Object.keys(next).find(k => next[k].email === targetEmail);
      if (key) {
        next[key] = {
          ...next[key],
          bio: newBio,
        };
      }
      return next;
    });

    if (currentUser && currentUser.email === targetEmail) {
      setCurrentUser(prev => prev ? { ...prev, bio: newBio } : null);
    }
  };

  const handleUpdateUserRole = (email: string, newRole: UserRole) => {
    setUsersDb((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key].email === email) {
          next[key] = {
            ...next[key],
            role: newRole,
          };
        }
      });
      return next;
    });

    if (currentUser && currentUser.email === email) {
      setCurrentUser((prev) => prev ? { ...prev, role: newRole } : null);
    }
  };

  const handleCreateCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    alert(`Success: "${newCourse.title}" published successfully! Directing to catalog...`);
    setActiveTab('courses');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowRoleSelector(false);
  };

  const handleQuickLogin = (role: UserRole) => {
    // Locate standard profile inside DB if available
    const key = Object.keys(usersDb).find((k) => usersDb[k].role === role);
    const profile = key ? usersDb[key] : USERS[role];
    
    setCurrentUser(profile);
    setShowRoleSelector(false);
    
    // Reset specific sub tabs
    if (role === 'admin') {
      setActiveTab('admin');
      setAdminSubTab('dashboard');
    } else if (role === 'educator') {
      setActiveTab('courses');
    } else {
      setActiveTab('courses');
    }
    setProfileEmail(null);
    updateAddressBarState(null);
  };

  const handleCustomRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleName.trim() || !customRoleEmail.trim()) return;

    const newProfile: UserProfile = {
      name: customRoleName,
      email: customRoleEmail,
      role: customRoleType,
      bio: 'New community researcher status. Focuses on collaborative team alignments.',
      avatar: customRoleType === 'educator' 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      enrolledCourses: [],
      status: 'Active'
    };

    setUsersDb((prev) => ({
      ...prev,
      [customRoleEmail.toLowerCase().replace(/\./g, '_')]: newProfile,
    }));
    setCurrentUser(newProfile);
    setShowRoleSelector(false);
    
    // reset input fields
    setCustomRoleName('');
    setCustomRoleEmail('');

    if (customRoleType === 'admin') {
      setActiveTab('admin');
      setAdminSubTab('dashboard');
    } else {
      setActiveTab('courses');
    }
  };

  // Safe checks for permissions to access special views
  const isAdmin = currentUser?.role === 'admin';
  const isEducator = currentUser?.role === 'educator';

  // Find the user object being displayed on the profile page
  const resolvedProfileEmail = profileEmail || (currentUser ? currentUser.email : '');
  const resolvedProfileUser = (Object.values(usersDb) as UserProfile[]).find(u => u.email.toLowerCase() === resolvedProfileEmail.toLowerCase()) || currentUser;
  const isIdorTarget = resolvedProfileUser !== null && currentUser !== null && resolvedProfileUser.email !== currentUser.email;

  // Filter Course Catalog list: Educator only sees courses owned by them ("Dr. Helen Vance" / matched role instructor name)
  const filteredCatalogCourses = isEducator && currentUser 
    ? courses.filter(c => c.instructor === currentUser.name || c.instructor === 'Dr. Helen Vance')
    : courses;

  return (
    <div id="full-application-viewport" className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Simulation Web Address Bar for direct URL modifications/inspections */}
      <WebAddressBar
        receiptId={activeReceiptId}
        onChangeReceiptId={updateAddressBarState}
        activeTab={activeTab}
        profileEmail={profileEmail}
        onChangeProfileEmail={handleProfileEmailChange}
      />

      {/* Main Brand Header */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => { setSelectedCourseId(null); updateAddressBarState(null); handleProfileEmailChange(null); if (isAdmin) { setActiveTab('admin'); setAdminSubTab('dashboard'); } else { setActiveTab('courses'); } }}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-black shadow-md shadow-indigo-650/20 group-hover:bg-indigo-600 transition-colors">
              🤝
            </div>
            <div>
              <h1 className="text-md font-black text-slate-950 tracking-tight leading-none">EduUnity Connect</h1>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none block mt-0.5">unified learning</span>
            </div>
          </div>

          {/* Navigation Bar: Changes dynamically depending on logged in role */}
          <nav id="horizontal-menu-nav" className="hidden md:flex items-center gap-1">
            
            {/* ADMIN UNIQUE NAV BAR BAR */}
            {isAdmin ? (
              <>
                <button
                  onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('admin'); setAdminSubTab('dashboard'); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'admin' && adminSubTab === 'dashboard'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('admin'); setAdminSubTab('ledger'); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'admin' && adminSubTab === 'ledger'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'
                  }`}
                >
                  Global Billing Ledger
                </button>
                <button
                  onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('admin'); setAdminSubTab('users'); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'admin' && adminSubTab === 'users'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'
                  }`}
                >
                  User Management
                </button>
                <button
                  onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('profile'); setAdminSubTab('profile'); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'
                  }`}
                >
                  Profile
                </button>
              </>
            ) : (
              /* STANDARD GUEST / student / educator NAV BAR */
              <>
                <button
                  onClick={() => { setSelectedCourseId(null); updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('courses'); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'courses' && activeReceiptId === null
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'
                  }`}
                >
                  Course Catalog
                </button>

                {/* Hide payment ledger for educators explicitly */}
                {currentUser && !isEducator && (
                  <button
                    onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('billing'); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'billing' && activeReceiptId === null
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'
                    }`}
                  >
                    Payment Ledger
                  </button>
                )}

                {currentUser && (
                  <button
                    onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('profile'); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'profile' && activeReceiptId === null
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'
                    }`}
                  >
                    Profile Bio
                  </button>
                )}

                {currentUser && isEducator && (
                  <button
                    onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('educator'); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'educator' && activeReceiptId === null
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'
                    }`}
                  >
                    Educator Portal
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Top Right authentication handler / log state switcher */}
          <div className="relative shrink-0 flex items-center gap-2">
            
            <div className="hidden lg:flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-mono font-bold">
              <Terminal size={10} />
              <span>Session: <strong className="uppercase">{currentUser ? currentUser.role : 'Guest'}</strong></span>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  id="user-avatar-dropdown-trigger"
                  onClick={() => setShowRoleSelector(!showRoleSelector)}
                  className="flex items-center gap-1.5 p-1.5 hover:bg-slate-50 border border-transparent hover:border-gray-150 rounded-xl transition-all cursor-pointer"
                  title="Session profile menu"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7.5 h-7.5 rounded-lg bg-gray-100 border border-gray-250 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                {showRoleSelector && (
                  <div id="user-profile-dropdown" className="absolute right-0 top-11 z-50 bg-white border border-gray-250 rounded-xl shadow-lg w-64 p-4 space-y-3.5">
                    <div className="border-b border-gray-100 pb-2.5">
                      <span className="text-[9px] font-mono text-gray-400 block font-bold leading-normal">ENGAGED PROFILE</span>
                      <span className="text-sm font-bold text-slate-800 block line-clamp-1">{currentUser.name}</span>
                      <span className="text-[10px] font-mono text-gray-500 block truncate">{currentUser.email}</span>
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] uppercase font-bold rounded-sm">
                        {currentUser.role} PRIVILEGE
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-gray-400 block font-bold uppercase">Role switchers (Lab)</span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => handleQuickLogin('student')}
                          className="py-1 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-705 rounded border border-gray-200"
                        >
                          Student
                        </button>
                        <button
                          onClick={() => handleQuickLogin('educator')}
                          className="py-1 bg-slate-50 hover:bg-slate-105 text-[10px] font-bold text-slate-705 rounded border border-gray-200"
                        >
                          Educator
                        </button>
                        <button
                          onClick={() => handleQuickLogin('admin')}
                          className="py-1 bg-slate-50 hover:bg-slate-105 text-[10px] font-bold text-slate-705 rounded border border-gray-200"
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => { setShowRoleSelector(false); handleProfileEmailChange(currentUser.email); }}
                        className="text-xs text-indigo-650 hover:text-indigo-600 font-bold"
                      >
                        Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="text-xs text-rose-600 hover:text-rose-500 font-bold"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button
                  id="navbar-login-register-btn"
                  onClick={() => setShowRoleSelector(!showRoleSelector)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Login/ Register
                </button>

                {showRoleSelector && (
                  <div className="absolute right-0 top-11 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-64 p-4 space-y-4">
                    <div className="space-y-1 text-center">
                      <h4 className="text-xs font-black text-gray-800 uppercase">Interactive Persona Choice</h4>
                      <p className="text-[10px] text-gray-400 leading-normal font-sans">Pick a role to test privileges immediately:</p>
                    </div>

                    <div className="space-y-1.5 font-sans">
                      <button
                        onClick={() => handleQuickLogin('student')}
                        className="w-full py-2 bg-slate-50 hover:bg-indigo-50 border border-gray-200 rounded text-xs font-bold text-indigo-700 flex items-center justify-center gap-1"
                      >
                        Student (Alice Smith)
                      </button>
                      <button
                        onClick={() => handleQuickLogin('educator')}
                        className="w-full py-2 bg-slate-50 hover:bg-teal-50 border border-gray-200 rounded text-xs font-bold text-teal-700 flex items-center justify-center gap-1"
                      >
                        Educator (Dr. Helen Vance)
                      </button>
                      <button
                        onClick={() => handleQuickLogin('admin')}
                        className="w-full py-2 bg-slate-50 hover:bg-rose-50 border border-gray-200 rounded text-xs font-bold text-rose-700 flex items-center justify-center gap-1"
                      >
                        Admin (System Authority)
                      </button>
                    </div>

                    <div className="border-t border-gray-150 pt-3 font-sans">
                      <span className="text-[10px] font-mono text-gray-400 block mb-2 font-bold uppercase text-center">Or Create custom user</span>
                      <form onSubmit={handleCustomRegister} className="space-y-2 text-xs">
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          className="w-full bg-slate-50 border border-gray-200 p-1.5 rounded"
                          value={customRoleName}
                          onChange={(e) => setCustomRoleName(e.target.value)}
                        />
                        <input
                          type="email"
                          required
                          placeholder="Email Address"
                          className="w-full bg-slate-50 border border-gray-200 p-1.5 rounded"
                          value={customRoleEmail}
                          onChange={(e) => setCustomRoleEmail(e.target.value)}
                        />
                        <select
                          className="w-full bg-slate-50 border border-gray-200 p-1.5 rounded font-bold"
                          value={customRoleType}
                          onChange={(e) => setCustomRoleType(e.target.value as UserRole)}
                        >
                          <option value="student">Student Authority</option>
                          <option value="educator">Educator Authority</option>
                          <option value="admin">Admin Authority</option>
                        </select>
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded cursor-pointer"
                        >
                          Build Workspace Session
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile view sub-navbar navigation */}
      <div className="md:hidden bg-indigo-900 text-white text-xs px-4 py-2 overflow-x-auto whitespace-nowrap flex gap-4 border-b border-indigo-850">
        {isAdmin ? (
          <>
            <button 
              onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('admin'); setAdminSubTab('dashboard'); }}
              className={`font-semibold ${activeTab === 'admin' && adminSubTab === 'dashboard' ? 'underline text-indigo-200 font-bold' : 'text-slate-350'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('admin'); setAdminSubTab('ledger'); }}
              className={`font-semibold ${activeTab === 'admin' && adminSubTab === 'ledger' ? 'underline text-indigo-200 font-bold' : 'text-slate-350'}`}
            >
              System Ledger
            </button>
            <button 
              onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('admin'); setAdminSubTab('users'); }}
              className={`font-semibold ${activeTab === 'admin' && adminSubTab === 'users' ? 'underline text-indigo-200 font-bold' : 'text-slate-350'}`}
            >
              User Management
            </button>
            <button 
              onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('profile'); }}
              className={`font-semibold ${activeTab === 'profile' ? 'underline text-indigo-200 font-bold' : 'text-slate-350'}`}
            >
              Profile
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => { setSelectedCourseId(null); updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('courses'); }}
              className={`font-semibold ${activeTab === 'courses' && activeReceiptId === null ? 'underline text-indigo-200' : 'text-slate-350'}`}
            >
              Courses
            </button>
            {currentUser && !isEducator && (
              <button 
                onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('billing'); }}
                className={`font-semibold ${activeTab === 'billing' && activeReceiptId === null ? 'underline text-indigo-200' : 'text-slate-350'}`}
              >
                Ledger
              </button>
            )}
            {currentUser && (
              <button 
                onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('profile'); }}
                className={`font-semibold ${activeTab === 'profile' && activeReceiptId === null ? 'underline text-indigo-200' : 'text-slate-350'}`}
              >
                Profile Bio
              </button>
            )}
            {currentUser && isEducator && (
              <button 
                onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('educator'); }}
                className={`font-semibold ${activeTab === 'educator' && activeReceiptId === null ? 'underline text-indigo-200 font-bold' : 'text-slate-350'}`}
              >
                Educator Portal
              </button>
            )}
          </>
        )}
      </div>

      {/* Main Educational Application Portal Container */}
      <main className="flex-1">
        
        {/* Direct Link Warning / Notification helper if viewing receipt IDOR */}
        {activeReceiptId !== null ? (
          <ReceiptView
            receiptId={activeReceiptId}
            receipts={receipts}
            currentUserEmail={currentUser ? currentUser.email : 'guest@sandbox.io'}
            onBack={() => updateAddressBarState(null)}
          />
        ) : (
          <div>
            {/* Standard Guest & Client Tab switches */}
            {activeTab === 'courses' && (
              <div>
                {selectedCourseId ? (
                  // Deep course detail view (supports student & educator differentiation + RCE file upload)
                  (() => {
                    const course = courses.find(c => c.id === selectedCourseId);
                    if (!course) return <p className="text-center py-8">Course not found.</p>;
                    const isEnrolled = currentUser ? currentUser.enrolledCourses.includes(course.id) : false;
                    return (
                      <CourseDetailPage
                        course={course}
                        isEnrolled={isEnrolled}
                        userRole={currentUser ? currentUser.role : 'student'}
                        buyerEmail={currentUser ? currentUser.email : ''}
                        buyerName={currentUser ? currentUser.name : ''}
                        receipts={receipts}
                        onBack={() => setSelectedCourseId(null)}
                        onCompleteEnrollment={handleCompleteEnrollment}
                        onAddReview={(content, rating) => handleAddReview(course.id, content, rating)}
                      />
                    );
                  })()
                ) : (
                  // Course catalog dashboard grid
                  <CourseCatalog
                    courses={filteredCatalogCourses}
                    enrolledCourseIds={currentUser ? currentUser.enrolledCourses : []}
                    onEnroll={(id) => setSelectedCourseId(id)}
                    onViewDetail={(id) => setSelectedCourseId(id)}
                    userRole={currentUser ? currentUser.role : 'student'}
                    onCreateCoursePrompt={() => setActiveTab('educator')}
                  />
                )}
              </div>
            )}

            {activeTab === 'billing' && currentUser && !isEducator && (
              <BillingHistory
                receipts={receipts}
                userEmail={currentUser.email}
                onViewReceipt={(id) => updateAddressBarState(id)}
              />
            )}

            {activeTab === 'profile' && resolvedProfileUser && (
              <ProfilePage
                user={resolvedProfileUser}
                onUpdateBio={handleUpdateBio}
                enrolledCoursesCount={resolvedProfileUser.enrolledCourses ? resolvedProfileUser.enrolledCourses.length : 0}
                isIdorTarget={isIdorTarget}
                loggedInUserRole={currentUser?.role}
              />
            )}

            {activeTab === 'educator' && currentUser && isEducator && (
              <EducatorDashboard
                courses={courses.filter((c) => c.instructor === currentUser.name || c.instructor === 'Dr. Helen Vance')}
                onCreateCourse={handleCreateCourse}
              />
            )}

            {/* ADMIN POWER PANEL TAB CONTROLLER */}
            {activeTab === 'admin' && currentUser && isAdmin && (
              <div>
                {adminSubTab === 'dashboard' && (
                  <AdminPanel
                    receipts={receipts}
                    users={usersDb}
                    coursesCount={courses.length}
                    onViewReceipt={(id) => updateAddressBarState(id)}
                    mode="dashboard"
                  />
                )}
                {adminSubTab === 'ledger' && (
                  <AdminPanel
                    receipts={receipts}
                    users={usersDb}
                    coursesCount={courses.length}
                    onViewReceipt={(id) => updateAddressBarState(id)}
                    mode="ledger"
                  />
                )}
                {adminSubTab === 'users' && (
                  <div className="py-8 max-w-7xl mx-auto px-4">
                    <UserManagement
                      users={usersDb}
                      onUpdateUsers={setUsersDb}
                    />
                  </div>
                )}
              </div>
            )}

            {/* In case tab selection maps to missing user state because logout */}
            {!currentUser && activeTab !== 'courses' && (
              <div className="py-20 text-center space-y-4 max-w-sm mx-auto px-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-650 flex items-center justify-center mx-auto text-xl font-bold">
                  🤝
                </div>
                <h3 className="text-md font-bold text-gray-800">Authorization Required</h3>
                <p className="text-xs text-gray-400 font-sans">
                  Please establish or select an active user session in the upper right header to access account ledgers, profiles, or operational panel components.
                </p>
                <button
                  onClick={() => setShowRoleSelector(true)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Establish Session
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-450 text-[11px] border-t border-slate-800 py-6 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-white text-xs">🎓</span>
            <span>EduUnity Connect © 2026. Emphasizing shared cohesion.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-500 font-bold">● VULNERABILITY LAB ACTIVE</span>
            <span>• Built for Ethical Hacking and Dynamic Penetration Demos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
