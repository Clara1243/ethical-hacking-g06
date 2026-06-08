import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Stars, 
  Calendar, 
  BookOpen, 
  Users, 
  BadgeCheck, 
  DollarSign, 
  Upload, 
  FileText, 
  Trash, 
  FolderOpen
} from 'lucide-react';
import { Course, Receipt } from '../types';
import { ReviewSection } from './ReviewSection';
import { CheckoutWizard } from './CheckoutWizard';

interface CourseDetailPageProps {
  course: Course;
  isEnrolled: boolean;
  userRole: 'student' | 'educator' | 'admin';
  buyerEmail: string;
  buyerName: string;
  receipts: Receipt[];
  onBack: () => void;
  onCompleteEnrollment: (receipt: Receipt) => void;
  onAddReview: (content: string, rating: number) => void;
}

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  content: string;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  course,
  isEnrolled,
  userRole,
  buyerEmail,
  buyerName,
  receipts,
  onBack,
  onCompleteEnrollment,
  onAddReview,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // File upload states for Educator (Vulnerability: No validation logic exists here)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    const saved = localStorage.getItem(`eduunity_materials_${course.id}`);
    if (saved) return JSON.parse(saved);
    return [
      {
        name: 'Syllabus_Cooperative_Growth_2026.pdf',
        type: 'application/pdf',
        size: 245,
        uploadedAt: '2026-05-12 11:30',
        content: '%PDF-1.4 Course Syllabus details...'
      }
    ];
  });

  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    localStorage.setItem(`eduunity_materials_${course.id}`, JSON.stringify(uploadedFiles));
  }, [uploadedFiles, course.id]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processUpload = (name: string, type: string, sizeBytes: number, contentText: string) => {
    const sizeKb = Math.round(sizeBytes / 1024) || 2;
    const newFile: UploadedFile = {
      name: name,
      type: type || 'application/octet-stream',
      size: sizeKb,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      content: contentText,
    };
    setUploadedFiles(prev => [newFile, ...prev]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string || '';
        processUpload(file.name, file.type, file.size, text);
      };
      reader.readAsText(file);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string || '';
        processUpload(file.name, file.type, file.size, text);
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteMaterial = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const DEFAULT_STUDENTS_BY_COURSE: Record<string, string[]> = {
    'course-1': ['Jane Cooper', 'Alice Smith', 'Clara Oswald'],
    'course-2': ['Sarah Jenkins', 'Marcus Aurel', 'Jane Cooper'],
    'course-3': ['Bob Vance', 'Wade Wilson', 'Marcus Aurel'],
    'course-4': ['Alice Smith', 'Leo Fitz', 'Jane Cooper'],
  };

  const enrolledFromReceipts = receipts
    .filter(r => r.courseId === course.id)
    .map(r => r.buyerName);
  const allStudents = Array.from(new Set([...(DEFAULT_STUDENTS_BY_COURSE[course.id] || []), ...enrolledFromReceipts]));

  if (isCheckingOut) {
    return (
      <div className="py-8">
        <CheckoutWizard
          course={course}
          buyerName={buyerName}
          buyerEmail={buyerEmail}
          onComplete={(receipt) => {
            setIsCheckingOut(false);
            onCompleteEnrollment(receipt);
          }}
          onCancel={() => setIsCheckingOut(false)}
        />
      </div>
    );
  }

  const isEducator = userRole === 'educator';

  return (
    <div id="course-detail-container" className="max-w-4xl mx-auto py-8 px-4">
      <button
        id="back-to-courses-button"
        onClick={onBack}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-medium mb-6 transition-colors group cursor-pointer"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Course Catalog
      </button>

      {/* Course Hero Header */}
      <div className={`text-white rounded-2xl overflow-hidden shadow-lg border mb-8 ${isEducator ? 'bg-teal-950 border-teal-800' : 'bg-slate-900 border-slate-800'}`}>
        <div className="md:flex">
          <div className="md:w-1/2 relative h-64 md:h-auto">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 to-transparent opacity-80" />
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 font-bold tracking-wide uppercase text-[10px] rounded border ${isEducator ? 'bg-teal-600 border-teal-400' : 'bg-indigo-600 border-indigo-400'}`}>
                {course.category}
              </span>
            </div>
          </div>

          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
                  {course.title}
                </h2>
              </div>
              <p className="text-xs text-indigo-300 font-mono mb-4">
                Instructed by <span className="font-bold underline">{course.instructor}</span>
              </p>
              <div className="flex items-center gap-4 mb-4 text-xs text-slate-300 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={13} /> {course.modulesCount} Modules
                </span>
                <span className="flex items-center gap-1">
                  <Users size={13} /> {allStudents.length} Registered Peers
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-6 text-slate-200">
                <div className="flex items-center text-amber-400">
                  <Stars size={14} className="fill-amber-400 text-amber-400" />
                </div>
                <span className="text-sm font-bold">{course.rating}</span>
                <span className="text-xs text-slate-400">({course.reviews?.length || 0} reviews)</span>
              </div>
            </div>

            <div>
              {isEducator ? (
                <div className="bg-teal-900/60 border border-teal-800 p-3 rounded-lg text-teal-200 text-xs flex items-center gap-2">
                  <BadgeCheck size={18} className="text-teal-400 shrink-0" />
                  <div>
                    <p className="font-bold">Signed in as Course Instructor</p>
                    <p className="text-[10px] text-teal-300 mt-0.5">Manage materials and monitor student enrollment below.</p>
                  </div>
                </div>
              ) : isEnrolled ? (
                <div className="flex items-center gap-2 bg-emerald-950/55 border border-emerald-800 p-3 rounded-lg text-emerald-200 text-xs">
                  <BadgeCheck size={18} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold">You are enrolled in this course!</p>
                    <p className="text-[10px] text-emerald-400/80 mt-0.5">Access syllabus blocks and collaborate with peers.</p>
                  </div>
                </div>
              ) : (
                <button
                  id="enroll-checkout-button"
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-md"
                >
                  <DollarSign size={16} />
                  Enroll Now (${course.price ? course.price.toFixed(2) : '149.00'})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Left Side Column: Syllabus summary */}
        <div className="bg-white rounded-xl col-span-2 shadow-xs border border-gray-100 p-6 md:p-8 space-y-4">
          <h3 className="text-md font-extrabold text-slate-800">Course Information</h3>
          <p className="text-gray-600 text-xs leading-relaxed">
            {course.longDescription || course.description}
          </p>

          <h4 className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase mb-2">Curriculum Blocks</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-gray-100">
              <span className="text-xs font-bold text-slate-800">Unit 1: Introduction & Fundamentals</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Establishing core concepts and terminology for the modules ahead.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-gray-100">
              <span className="text-xs font-bold text-slate-800">Unit 2: Practical Application</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Hands-on exercises and real-world scenario mapping.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-gray-100">
              <span className="text-xs font-bold text-slate-800">Unit 3: Final Assessment</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Comprehensive review and final project submission guidelines.</p>
            </div>
          </div>
        </div>

        {/* Right Side Column */}
        {isEducator ? (
          <div className="bg-white rounded-xl col-span-1 border border-teal-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-teal-150 text-teal-800">
              <Users size={16} className="text-teal-600" />
              <span className="font-extrabold text-xs uppercase tracking-wider">Class Roster</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-normal">
              Students currently enrolled in your module:
            </p>
            <div id="educator-roster-list" className="space-y-2.5 max-h-64 overflow-y-auto">
              {allStudents.map((name, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 bg-teal-50/50 rounded-lg border border-teal-100/50">
                  <div className="w-6.5 h-6.5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">{name}</span>
                    <span className="text-[9px] text-teal-600/80 font-mono">Active</span>
                  </div>
                </div>
              ))}
              {allStudents.length === 0 && (
                <p className="text-[10px] text-gray-400 text-center py-4">No enrollments yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl col-span-1 border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-gray-150 text-indigo-850">
              <BookOpen size={14} className="text-indigo-600" />
              <span className="font-extrabold text-xs uppercase tracking-wider">Course Requirements</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              To succeed in this course, please ensure you meet the following prerequisites:
            </p>
            <div className="p-3 bg-slate-50 border border-gray-150 rounded-lg text-[10px] text-slate-600 leading-relaxed">
              <ul className="list-disc pl-3.5 space-y-1.5">
                <li>A stable internet connection for live sessions.</li>
                <li>Basic understanding of the subject matter.</li>
                <li>Commitment of 4-6 hours per week.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* EDUCATOR MATERIAL MANAGEMENT */}
      {isEducator && (
        <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm mb-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="space-y-1">
              <h3 className="text-md font-extrabold text-teal-950 flex items-center gap-1.5">
                <FolderOpen size={18} className="text-teal-600" />
                Course Materials Manager
              </h3>
              <p className="text-[11px] text-gray-500">Upload documents, assignments, and slides for your students.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upload Area */}
            <div className="space-y-2">
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  dragActive ? 'border-indigo-500 bg-indigo-50/20' : 'border-gray-200 hover:bg-slate-50'
                }`}
              >
                <Upload size={24} className="text-gray-400 shrink-0" />
                <div>
                  <span className="text-sm font-bold text-slate-700 block">Click or drag files here</span>
                  <span className="text-xs text-gray-400">Maximum file size: 50MB</span>
                </div>
                <input 
                  type="file" 
                  id="material-file-upload-input" 
                  className="hidden" 
                  onChange={handleManualUpload}
                />
                <label 
                  htmlFor="material-file-upload-input"
                  className="mt-2 px-4 py-1.5 bg-white border border-gray-200 hover:border-teal-500 hover:text-teal-600 text-slate-600 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm"
                >
                  Browse Files
                </label>
              </div>
            </div>

            {/* File List */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider">Uploaded Files</span>
                <span className="text-[10px] text-gray-400">{uploadedFiles.length} item(s)</span>
              </div>

              <div id="server-filesystem-list" className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="p-3 rounded-xl border bg-white border-gray-200 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <FileText size={16} className="text-teal-600 shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-700 block truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {file.size} KB • Uploaded {file.uploadedAt.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center shrink-0">
                      <button
                        onClick={() => handleDeleteMaterial(file.name)}
                        className="p-2 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete file"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {uploadedFiles.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-xs text-gray-400">No materials uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Reviews */}
      <ReviewSection reviews={course.reviews || []} onAddReview={onAddReview} />
    </div>
  );
};