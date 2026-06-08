import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
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
import { main } from 'motion/react-m';

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

  // Current logged in user profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('eduunity_current_user');
    if (saved) {
      return JSON.parse(saved);
    }
    return null; // Start with NO session by default
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

  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
    setActiveTab('courses'); // Send them back to the catalog on logout
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
                <h1 className="text-md font-black text-slate-950 tracking-tight leading-none">MyEduConnect</h1>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none block mt-0.5">unified learning</span>
              </div>
            </div>

        {/* Navigation Bar: DYNAMIC SESSION CONTROL */}
          {currentUser && (
            <nav id="horizontal-menu-nav" className="hidden md:flex items-center gap-1">
              
              {/* --- 1. ADMIN SESSION --- */}
              {currentUser.role === 'admin' && (
                <>
                  <button onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('admin'); setAdminSubTab('dashboard'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'admin' && adminSubTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'}`}>Dashboard</button>
                  <button onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('admin'); setAdminSubTab('ledger'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'admin' && adminSubTab === 'ledger' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'}`}>Global Billing Ledger</button>
                  <button onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('admin'); setAdminSubTab('users'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'admin' && adminSubTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'}`}>User Management</button>
                  <button onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('profile'); setAdminSubTab('profile'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'}`}>Profile</button>
                </>
              )}

              {/* --- 2. EDUCATOR SESSION --- */}
              {currentUser.role === 'educator' && (
                <>
                  <button onClick={() => { setSelectedCourseId(null); updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('courses'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'courses' && activeReceiptId === null ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'}`}>Course Catalog</button>
                  <button onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('educator'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'educator' && activeReceiptId === null ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'}`}>Educator Portal</button>
                  <button onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('profile'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'profile' && activeReceiptId === null ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'}`}>Profile Bio</button>
                </>
              )}

              {/* --- 3. STUDENT SESSION --- */}
              {currentUser.role === 'student' && (
                <>
                  <button onClick={() => { setSelectedCourseId(null); updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('courses'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'courses' && activeReceiptId === null ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'}`}>Course Catalog</button>
                  <button onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('billing'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'billing' && activeReceiptId === null ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'}`}>Payment Ledger</button>
                  <button onClick={() => { updateAddressBarState(null); handleProfileEmailChange(null); setActiveTab('profile'); }} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'profile' && activeReceiptId === null ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'}`}>Profile Bio</button>
                </>
              )}
            </nav>
          )}

          {/* Top Right Profile Dropdown */}
          <div className="relative shrink-0 flex items-center gap-2">
              {currentUser && (
                <div className="relative">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-1.5 p-1.5 hover:bg-slate-50 border border-transparent hover:border-gray-150 rounded-xl transition-all cursor-pointer">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-7.5 h-7.5 rounded-lg bg-gray-100 border border-gray-250 object-cover" />
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 top-11 z-50 bg-white border border-gray-250 rounded-xl shadow-lg w-48 p-2">
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <span className="text-sm font-bold text-slate-800 block truncate">{currentUser.name}</span>
                      </div>
                      <button onClick={() => { setShowProfileMenu(false); handleLogout(); }} className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded">Sign Out</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1">
          {!currentUser ? (
            <Login onLoginSuccess={(user) => {
              setCurrentUser(user);
              if (user.role === 'admin') { setActiveTab('admin'); } else { setActiveTab('courses'); }
            }} />
          ) : activeReceiptId !== null ? (
            <ReceiptView
              receiptId={activeReceiptId}
              receipts={receipts}
              currentUserEmail={currentUser.email}
              onBack={() => updateAddressBarState(null)}
            />
          ) : (
            <div>
              {/* --- UNIVERSAL CONTENT (Accessible by multiple sessions) --- */}
              {activeTab === 'courses' && (currentUser.role === 'student' || currentUser.role === 'educator') && (
                <div>
                  {selectedCourseId ? (
                    (() => {
                      const course = courses.find(c => c.id === selectedCourseId);
                      if (!course) return <p className="text-center py-8">Course not found.</p>;
                      const isEnrolled = currentUser.enrolledCourses.includes(course.id);
                      return (
                        <CourseDetailPage course={course} isEnrolled={isEnrolled} userRole={currentUser.role} buyerEmail={currentUser.email} buyerName={currentUser.name} receipts={receipts} onBack={() => setSelectedCourseId(null)} onCompleteEnrollment={handleCompleteEnrollment} onAddReview={(content, rating) => handleAddReview(course.id, content, rating)} />
                      );
                    })()
                  ) : (
                    <CourseCatalog courses={filteredCatalogCourses} enrolledCourseIds={currentUser.enrolledCourses} onEnroll={(id) => setSelectedCourseId(id)} onViewDetail={(id) => setSelectedCourseId(id)} userRole={currentUser.role} onCreateCoursePrompt={() => setActiveTab('educator')} />
                  )}
                </div>
              )}

              {/* Universal Profile Viewer */}
              {activeTab === 'profile' && resolvedProfileUser && (
                <ProfilePage user={resolvedProfileUser} onUpdateBio={handleUpdateBio} enrolledCoursesCount={resolvedProfileUser.enrolledCourses ? resolvedProfileUser.enrolledCourses.length : 0} isIdorTarget={isIdorTarget} loggedInUserRole={currentUser.role} />
              )}

              {/* --- STRICT STUDENT CONTENT --- */}
              {activeTab === 'billing' && currentUser.role === 'student' && (
                <BillingHistory receipts={receipts} userEmail={currentUser.email} onViewReceipt={(id) => updateAddressBarState(id)} />
              )}

              {/* --- STRICT EDUCATOR CONTENT --- */}
              {activeTab === 'educator' && currentUser.role === 'educator' && (
                <EducatorDashboard courses={courses.filter((c) => c.instructor === currentUser.name || c.instructor === 'Dr. Helen Vance')} onCreateCourse={handleCreateCourse} />
              )}
              
              {/* --- STRICT ADMIN CONTENT --- */}
              {activeTab === 'admin' && currentUser.role === 'admin' && (
                <div>
                  {adminSubTab === 'dashboard' && <AdminPanel receipts={receipts} users={usersDb} coursesCount={courses.length} onViewReceipt={(id) => updateAddressBarState(id)} mode="dashboard" />}
                  {adminSubTab === 'ledger' && <AdminPanel receipts={receipts} users={usersDb} coursesCount={courses.length} onViewReceipt={(id) => updateAddressBarState(id)} mode="ledger" />}
                  {adminSubTab === 'users' && <div className="py-8 max-w-7xl mx-auto px-4"><UserManagement users={usersDb} onUpdateUsers={setUsersDb} /></div>}
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="bg-slate-900 text-slate-400 text-[11px] border-t border-slate-800 py-6 font-mono">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-1.5">
              {/* Fixed: text-s changed to text-sm */}
              <span className="text-white text-sm">🎓</span>
              {/* Added text-white here if you want this specific sentence to be stark white */}
              <span className="text-white">MyEduConnect © 2026. Emphasizing shared cohesion.</span>
            </div>

            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>

          </div>
        </footer>
      </div>
    );
  }
