import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, FolderOpen, Upload, FileText, CheckSquare, Edit3, Save } from 'lucide-react';
import { Course, Receipt, CourseMaterial, ActiveStudent, CourseQuiz } from '../types';
import { CheckoutWizard } from './CheckoutWizard';
import { ReviewSection } from './ReviewSection';

interface CourseDetailPageProps {
  course: Course;
  isEnrolled: boolean;
  userRole: 'student' | 'educator' | 'admin';
  buyerEmail: string;
  buyerName: string;
  onBack: () => void;
  onCompleteEnrollment: (receipt: Receipt) => void;
  onAddReview: (content: string, rating: number) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  course, isEnrolled, userRole, buyerEmail, buyerName, onBack, onCompleteEnrollment, onAddReview
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'coursework' | 'participants'>('overview');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const isEducator = userRole === 'educator';
  const authenticatedUserId = isEducator ? course.instructor_id : 1;

  // --- EDUCATOR EDIT STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(course.title);
  const [editDesc, setEditDesc] = useState(course.description);

  // --- DATABASE STATES ---
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [quizzes, setQuizzes] = useState<CourseQuiz[]>([]);
  const [activeStudents, setActiveStudents] = useState<ActiveStudent[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    if (!course.id) return;

    // Fetch Materials (Corrected URL)
    fetch(`/api/courses/${course.id}/materials`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': authenticatedUserId.toString()      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => setMaterials(data))
      .catch(err => console.error('Failed to fetch materials:', err));

    // Fetch Feedback (Corrected URL)
    fetch(`/api/courses/${course.id}/feedback`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': authenticatedUserId.toString()
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => setFeedbacks(data))
      .catch(err => console.error('Failed to fetch feedback:', err));

    // Fetch Students
    if (isEducator) {
      
      fetch(`/api/courses/${course.id}/students`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': authenticatedUserId.toString()
        }
      })
        .then(res => {
          if (!res.ok) throw new Error(`Server returned ${res.status}`);
          return res.json();
        })
        .then(data => setActiveStudents(data))
        .catch(err => console.error('Failed to fetch students:', err));
    }
  }, [course.id, isEducator, authenticatedUserId]);

  // LOCAL POST FUNCTION FOR XSS EXPLOIT
  const handlePostReview = async (content: string, rating: number) => {
    try {
      const response = await fetch(`/api/courses/${course.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Utilizing the existing IDOR-vulnerable variable
          'X-User-Id': authenticatedUserId.toString() 
        },
        body: JSON.stringify({ content, rating }),
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return;
      }

      const newFeedback = await response.json();
      
      // CRITICAL FOR XSS: Instantly update the local React state.
      // This forces the dangerouslySetInnerHTML in ReviewSection to render the raw payload.
      setFeedbacks((prevFeedbacks) => [newFeedback, ...prevFeedbacks]);

    } catch (error) {
      console.error('Failed to post feedback:', error);
    }
  };

  // VULNERABLE FILE UPLOAD LOGIC (Unrestricted file type & path execution logic)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newMaterial: CourseMaterial = {
        id: Date.now(),
        course_id: course.id,
        uploader_id: 2, // Assuming Educator ID
        filename: file.name,
        file_path: `/uploads/courses/${course.id}/${file.name}`, // Vulnerable path exposure
      };
      const updated = [...materials, newMaterial];
      setMaterials(updated);
      localStorage.setItem(`db_materials_${course.id}`, JSON.stringify(updated));
    }
  };

  const handleCreateQuiz = () => {
    const quizName = prompt("Enter new quiz title (e.g., 'Midterm Assessment'):");
    if (quizName) {
      const newQuiz: CourseQuiz = {
        id: Date.now(),
        title: quizName,
        questions_count: 10,
        created_at: new Date().toISOString().split('T')[0]
      };
      const updated = [...quizzes, newQuiz];
      setQuizzes(updated);
      localStorage.setItem(`db_quizzes_${course.id}`, JSON.stringify(updated));
    }
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
    alert("Course details updated in database.");
  };

  if (isCheckingOut) {
    return (
      <div className="py-8">
        <CheckoutWizard course={course} buyerName={buyerName} buyerEmail={buyerEmail} onComplete={(r) => { setIsCheckingOut(false); onCompleteEnrollment(r); }} onCancel={() => setIsCheckingOut(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-bold text-sm mb-6 transition-colors cursor-pointer">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Course Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold font-mono rounded border border-slate-200">
            {course.course_code}
          </span>
          {isEducator && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 cursor-pointer">
              <Edit3 size={14} /> Edit Course
            </button>
          )}
          {isEducator && isEditing && (
            <button onClick={handleSaveEdits} className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-500 cursor-pointer">
              <Save size={14} /> Save Changes
            </button>
          )}
        </div>

        {isEditing ? (
          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full text-2xl font-bold text-slate-900 border border-gray-300 rounded p-2 mb-2" />
        ) : (
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">{editTitle}</h1>
        )}
        
        <p className="text-sm text-gray-500 mb-6">Course Administrator ID: {course.instructor_id}</p>

        {!isEnrolled && !isEducator && (
          <button onClick={() => setIsCheckingOut(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer">
            Enroll in Module (${Number(course.price).toFixed(2)})
          </button>
        )}
      </div>

      {/* Tabs */}
      {(isEnrolled || isEducator) && (
        <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Overview & Feedback</button>
          <button onClick={() => setActiveTab('coursework')} className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'coursework' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Coursework & Materials</button>
          {isEducator && (
            <button onClick={() => setActiveTab('participants')} className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'participants' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Participants</button>
          )}
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {(!isEnrolled && !isEducator) || activeTab === 'overview' ? (
        <div className="space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Course Description</h3>
            {isEditing ? (
              <textarea rows={5} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full text-sm text-gray-700 border border-gray-300 rounded p-3" />
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{editDesc}</p>
            )}
          </div>
          
          <ReviewSection reviews={feedbacks} onAddReview={handlePostReview} />
        </div>
      ) : null}

      {/* TAB CONTENT: COURSEWORK */}
      {activeTab === 'coursework' && (isEnrolled || isEducator) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FolderOpen size={20} className="text-indigo-600"/> Documents & Files</h3>
              {isEducator && (
                <div>
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                  <label htmlFor="file-upload" className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 border border-indigo-200">
                    <Upload size={14} /> Upload File
                  </label>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {materials.length === 0 && <p className="text-sm text-gray-500 italic">No materials have been uploaded yet.</p>}
              {materials.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-slate-50 hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded"><FileText size={16}/></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{file.filename}</p>
                      <p className="text-[10px] text-gray-400 font-mono">Path: {file.file_path}</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">Download</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><CheckSquare size={20} className="text-emerald-600"/> Assessments</h3>
              {isEducator && (
                <button onClick={handleCreateQuiz} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg cursor-pointer border border-emerald-200">
                  Create Quiz Form
                </button>
              )}
            </div>

            <div className="space-y-3">
              {quizzes.length === 0 && <p className="text-sm text-gray-500 italic">No assessments available.</p>}
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-slate-50 hover:bg-white transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{quiz.title}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{quiz.questions_count} Questions • Created {quiz.created_at}</p>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-500 cursor-pointer transition-colors">
                    {isEducator ? 'Edit Quiz' : 'Attempt Quiz'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: PARTICIPANTS */}
      {activeTab === 'participants' && isEducator && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Users size={20} className="text-indigo-600"/> Active Students List</h3>
            <p className="text-xs text-gray-500 mt-1">Data synchronized from registered_courses database table.</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold">Student ID</th>
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Enrollment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="p-4 text-sm font-mono text-gray-600">{student.id}</td>
                  <td className="p-4 text-sm font-bold text-slate-800 capitalize">{student.username}</td>
                  <td className="p-4 text-sm font-mono text-indigo-600">{student.email}</td>
                  <td className="p-4 text-sm text-gray-600">{student.enroll_date}</td>
                </tr>
              ))}
              {activeStudents.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500 text-sm">No students currently enrolled.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};