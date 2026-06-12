import React, { useState, useEffect, useCallback } from 'react';
import { Login } from './components/Login';
import { UserProfile, Course, Receipt, Role, Review } from './types';
import { INITIAL_COURSES, USERS } from './data';
import { CourseCatalog } from './components/CourseCatalog';
import { CourseDetailPage } from './components/CourseDetailPage';
import { EducatorDashboard } from './components/EducatorDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ProfilePage } from './components/ProfilePage';
import { BillingHistory } from './components/BillingHistory';
import { ReceiptView } from './components/ReceiptView';
import { UserManagement } from './components/UserManagement';
import { StudentGrades } from './components/StudentGrades';
import { EnrolledCourses } from './components/EnrolledCourses';
import { ChevronDown } from 'lucide-react';

// Provide a minimal JSX IntrinsicElements declaration for environments
// where the global JSX namespace is not present to avoid TS7026 errors.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// ─────────────────────────────────────────────
// Types & Nav Config 
// ─────────────────────────────────────────────

type ActiveTab = 'courses' | 'billing' | 'profile' | 'educator' | 'admin' | 'grades' | 'enrolled';
type AdminSubTab = 'dashboard' | 'ledger' | 'users' | 'profile';

function useUrlParams(
  onReceiptId: (id: number | null) => void,
  onEmail: (email: string | null) => void,
) {
  useEffect(() => {
    const sync = () => {
      const params = new URLSearchParams(window.location.search);
      const rawId = params.get('receipt_id');
      const email = params.get('email');
      onReceiptId(rawId ? (parseInt(rawId, 10) || null) : null);
      onEmail(email || null);
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [onReceiptId, onEmail]);
}

interface NavItem {
  label: string;
  onClick: () => void;
  isActive: boolean;
}

function useNavItems(
  role: Role | undefined,
  activeTab: ActiveTab,
  adminSubTab: AdminSubTab,
  activeReceiptId: number | null,
  setters: {
    setActiveTab: (t: ActiveTab) => void;
    setAdminSubTab: (t: AdminSubTab) => void;
    setSelectedCourseId: (id: number | null) => void;
    clearUrlState: () => void;
  },
): NavItem[] {
  const { setActiveTab, setAdminSubTab, setSelectedCourseId, clearUrlState } = setters;
  const nav = (label: string, onClick: () => void, active: boolean): NavItem => ({ label, onClick, isActive: active });
  const noReceipt = activeReceiptId === null;

  if (role === 'admin') return [
    nav('Dashboard',            () => { clearUrlState(); setActiveTab('admin'); setAdminSubTab('dashboard'); }, activeTab === 'admin' && adminSubTab === 'dashboard'),
    nav('Global Billing Ledger',() => { clearUrlState(); setActiveTab('admin'); setAdminSubTab('ledger');    }, activeTab === 'admin' && adminSubTab === 'ledger'),
    nav('User Management',      () => { clearUrlState(); setActiveTab('admin'); setAdminSubTab('users');     }, activeTab === 'admin' && adminSubTab === 'users'),
    nav('Profile',              () => { clearUrlState(); setActiveTab('profile'); setAdminSubTab('profile'); }, activeTab === 'profile'),
  ];

  if (role === 'educator') return [
    nav('Course Catalog', () => { setSelectedCourseId(null); clearUrlState(); setActiveTab('courses');  }, activeTab === 'courses'  && noReceipt),
    nav('Educator Portal',() => { clearUrlState(); setActiveTab('educator');                            }, activeTab === 'educator' && noReceipt),
    nav('Profile Bio',    () => { clearUrlState(); setActiveTab('profile');                             }, activeTab === 'profile'  && noReceipt),
  ];

  if (role === 'student') return [
    nav('Course Catalog',   () => { setSelectedCourseId(null); clearUrlState(); setActiveTab('courses');  }, activeTab === 'courses'  && noReceipt),
    nav('Enrolled Courses', () => { clearUrlState(); setActiveTab('enrolled');                            }, activeTab === 'enrolled' && noReceipt),
    nav('Exam Results',     () => { clearUrlState(); setActiveTab('grades');                              }, activeTab === 'grades'   && noReceipt),
    nav('Payment Ledger',   () => { clearUrlState(); setActiveTab('billing');                             }, activeTab === 'billing'  && noReceipt),
    nav('Profile Bio',      () => { clearUrlState(); setActiveTab('profile');                             }, activeTab === 'profile'  && noReceipt),
  ];

  return [];
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function App() {
  // ── State ──────────────────────────────────
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [usersDb, setUsersDb] = useState<Record<string, UserProfile>>(USERS);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [activeReceiptId, setActiveReceiptId] = useState<number | null>(null);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // ── Data fetching ──────────────────────────
  // Courses + users — fetched once on mount
  useEffect(() => {
    fetch('http://localhost:3000/api/courses')
      .then(res => res.json())
      .then((data: Course[]) => setCourses(data))
      .catch(err => console.error('Failed to fetch courses:', err));

    fetch('http://localhost:3000/api/users')
      .then(res => res.json())
      .then((data: UserProfile[]) => {
        const userMap = data.reduce<Record<string, UserProfile>>((acc, u) => {
          acc[u.username.toLowerCase()] = u;
          return acc;
        }, {});
        setUsersDb(userMap);
      })
      .catch(err => console.error('Failed to fetch users:', err));
  }, []);

  // Enrolled course IDs
  useEffect(() => {
    if (currentUser?.role === 'student') {
      fetch(`http://localhost:3000/api/users/${currentUser.id}/courses`, { 
        headers: {
          'X-User-Id': currentUser.id.toString()
        }
      })
        .then(res => res.json())
        .then((data: Course[]) => {
          if (Array.isArray(data)) setEnrolledCourseIds(data.map(c => c.id));
        })
        .catch(err => console.error('Failed to fetch enrolled courses:', err));
    } else {
      setEnrolledCourseIds([]);
    }
  }, [currentUser]);

  // ── URL sync ───────────────────────────────

  const handleUrlReceiptId = useCallback((id: number | null) => {
    setActiveReceiptId(id);
    if (id !== null) setProfileEmail(null);
  }, []);

  const handleUrlEmail = useCallback((email: string | null) => {
    setProfileEmail(email);
    if (email) setActiveTab('profile');
  }, []);

  useUrlParams(handleUrlReceiptId, handleUrlEmail);

  // ── URL helpers ────────────────────────────

  const pushReceiptUrl = (id: number | null) => {
    const url = id !== null ? `${window.location.pathname}?receipt_id=${id}` : window.location.pathname;
    window.history.pushState(id !== null ? { receiptId: id } : {}, '', url);
    setActiveReceiptId(id);
    setProfileEmail(null);
  };

  const pushEmailUrl = (email: string | null) => {
    const url = email !== null ? `${window.location.pathname}?email=${email}` : window.location.pathname;
    window.history.pushState(email !== null ? { email } : {}, '', url);
    setProfileEmail(email);
    setActiveReceiptId(null);
    if (email) setActiveTab('profile');
  };

  const clearUrlState = useCallback(() => {
    window.history.pushState({}, '', window.location.pathname);
    setActiveReceiptId(null);
    setProfileEmail(null);
  }, []);

  // ── Handlers ───────────────────────────────

  const handleCompleteEnrollment = (receipt: Receipt) => {
    if (!currentUser) return;
    const courseId = (receipt as any).course_id ?? (receipt as any).courseId;
    setEnrolledCourseIds(prev => Array.from(new Set([...prev, courseId])));
    setSelectedCourseId(null);
    if (currentUser.role === 'admin') setAdminSubTab('ledger');
    else setActiveTab('billing');
  };

  const handleAddReview = (courseId: number, content: string, rating: number) => {
    if (!currentUser) { alert('Please login to post feedback!'); return; }
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: currentUser.username,
      authorRole: currentUser.role,
      content, 
      rating,
      date: new Date().toISOString().split('T')[0],
    };
    setCourses(prev =>
      prev.map(c => c.id === courseId ? { ...c, reviews: [newReview, ...(c.reviews ?? [])] } : c),
    );
  };

  const handleUpdateBio = (targetEmail: string, newBio: string) => {
    if (currentUser?.email === targetEmail) {
      setCurrentUser(prev => prev ? { ...prev, bio: newBio } : null);
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab(user.role === 'admin' ? 'admin' : 'courses');
  };

  const handleLogout = () => {
    // Reverted to simple state clearing. No API call needed.
    setCurrentUser(null);
    setActiveTab('courses');
    clearUrlState();
  };

  // ── Derived values ─────────────────────────

  const resolvedProfileEmail = profileEmail ?? currentUser?.email ?? '';
  const resolvedProfileUser =
    (Object.values(usersDb) as UserProfile[]).find(
      u => u.email.toLowerCase() === resolvedProfileEmail.toLowerCase(),
    ) ?? currentUser;

  const isIdorTarget =
    resolvedProfileUser !== null &&
    currentUser !== null &&
    resolvedProfileUser?.email !== currentUser?.email;

  const isEducator = currentUser?.role === 'educator';
  const filteredCatalogCourses = isEducator && currentUser
    ? courses.filter(c => c.instructor_id === currentUser.id)
    : courses;

  // ── Navigation ─────────────────────────────

  const navItems = useNavItems(
    currentUser?.role,
    activeTab,
    adminSubTab,
    activeReceiptId,
    { setActiveTab, setAdminSubTab, setSelectedCourseId, clearUrlState },
  );

  const navBtnClass = (isActive: boolean) =>
    `px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-slate-850 hover:bg-slate-50'
    }`;

  // ── Render ─────────────────────────────────

  return (
    <div
      id="full-application-viewport"
      className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-800 antialiased selection:bg-indigo-500 selection:text-white"
    >
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          <div
            onClick={() => {
              setSelectedCourseId(null);
              clearUrlState();
              pushEmailUrl(null);
              if (currentUser?.role === 'admin') { setActiveTab('admin'); setAdminSubTab('dashboard'); }
              else { setActiveTab('courses'); }
            }}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-black shadow-md shadow-indigo-650/20 group-hover:bg-indigo-600 transition-colors">
              🤝
            </div>
            <div>
              <h1 className="text-md font-black text-slate-950 tracking-tight leading-none">MyEduConnect</h1>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none block mt-0.5">
                unified learning
              </span>
            </div>
          </div>

          {currentUser && (
            <nav id="horizontal-menu-nav" className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button key={item.label} onClick={item.onClick} className={navBtnClass(item.isActive)}>
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          <div className="relative shrink-0 flex items-center gap-2">
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(v => !v)}
                  className="flex items-center gap-1.5 p-1.5 hover:bg-slate-50 border border-transparent hover:border-gray-150 rounded-xl transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-11 z-50 bg-white border border-gray-250 rounded-xl shadow-lg w-48 p-2">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <span className="text-sm font-bold text-slate-800 block truncate">{currentUser.username}</span>
                    </div>
                    <button
                      onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </header>

      <main className="flex-1">
        {!currentUser ? (
          <Login onLoginSuccess={handleLoginSuccess} />

        ) : activeReceiptId !== null ? (
          <ReceiptView receiptId={activeReceiptId} currentUserId={currentUser.id} currentUserEmail={currentUser.email} onBack={() => pushReceiptUrl(null)} />
        ) : (
          <div>
            {activeTab === 'courses' && (currentUser.role === 'student' || currentUser.role === 'educator') && (
              selectedCourseId ? (() => {
                const course = courses.find(c => c.id === selectedCourseId);
                if (!course) return <p className="text-center py-8">Course not found.</p>;
                return (
                  <CourseDetailPage
                    course={course}
                    isEnrolled={enrolledCourseIds.includes(course.id)}
                    userRole={currentUser.role}
                    buyerEmail={currentUser.email}
                    buyerName={currentUser.username}
                    onBack={() => setSelectedCourseId(null)}
                    onCompleteEnrollment={handleCompleteEnrollment}
                    onAddReview={(content, rating) => handleAddReview(course.id, content, rating)}
                  />
                );
              })() : (
                <CourseCatalog
                  courses={filteredCatalogCourses}
                  enrolledCourseIds={enrolledCourseIds}
                  onEnroll={id => setSelectedCourseId(id)}
                  onViewDetail={id => setSelectedCourseId(id)}
                  userRole={currentUser.role}
                  onCreateCoursePrompt={() => setActiveTab('educator')}
                />
              )
            )}

            {activeTab === 'profile' && resolvedProfileUser && (
              <ProfilePage
                user={resolvedProfileUser}
                onUpdateBio={handleUpdateBio}
                enrolledCoursesCount={resolvedProfileUser.id === currentUser.id ? enrolledCourseIds.length : 0}
                isIdorTarget={isIdorTarget}
                loggedInUserRole={currentUser.role}
              />
            )}

            {activeTab === 'billing' && currentUser.role === 'student' && (
              <BillingHistory
                userId={currentUser.id}
                userEmail={currentUser.email}
                onViewReceipt={id => pushReceiptUrl(id)}
              />
            )}

            {activeTab === 'grades' && currentUser.role === 'student' && (
              <StudentGrades studentId={currentUser.id} />
            )}

            {activeTab === 'educator' && currentUser.role === 'educator' && (
              <EducatorDashboard
                courses={courses.filter(c => c.instructor_id === currentUser.id)}
                onCreateCourse={course => setCourses(prev => [course, ...prev])}
              />
            )}

            {activeTab === 'admin' && currentUser.role === 'admin' && (
              <div>
                {adminSubTab === 'dashboard' && (
                  <AdminPanel users={usersDb} coursesCount={courses.length} onViewReceipt={id => pushReceiptUrl(id)} mode="dashboard"
                  currentUserId={currentUser.id} />
                )}
                {adminSubTab === 'ledger' && (
                  <AdminPanel users={usersDb} coursesCount={courses.length} onViewReceipt={id => pushReceiptUrl(id)} mode="ledger"
                  currentUserId={currentUser.id} />
                )}
                {adminSubTab === 'users' && (
                  <div className="py-8 max-w-7xl mx-auto px-4">
                    <UserManagement users={usersDb} onUpdateUsers={setUsersDb} 
                    currentUserId={currentUser.id}/>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'enrolled' && currentUser.role === 'student' && (
              <EnrolledCourses
                studentId={currentUser.id}
                onViewDetail={id => { setSelectedCourseId(id); setActiveTab('courses'); }}
              />
            )}
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 text-[11px] border-t border-slate-800 py-6 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-white text-sm">🎓</span>
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