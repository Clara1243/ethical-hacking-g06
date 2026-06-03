import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Stars, 
  Calendar, 
  BookOpen, 
  Users, 
  ShieldAlert, 
  BadgeCheck, 
  DollarSign, 
  Upload, 
  Terminal, 
  FileText, 
  Globe, 
  Play, 
  Trash, 
  Info, 
  ShieldCheck, 
  Check, 
  PlusCircle, 
  Clock, 
  ChevronRight,
  Sparkles,
  RefreshCw,
  FolderOpen,
  X
} from 'lucide-react';
import { Course, Review, PaymentReceipt } from '../types';
import { ReviewSection } from './ReviewSection';
import { CheckoutWizard } from './CheckoutWizard';

interface CourseDetailPageProps {
  course: Course;
  isEnrolled: boolean;
  userRole: 'student' | 'educator' | 'admin';
  buyerEmail: string;
  buyerName: string;
  receipts: PaymentReceipt[];
  onBack: () => void;
  onCompleteEnrollment: (receipt: PaymentReceipt) => void;
  onAddReview: (content: string, rating: number) => void;
}

interface UploadedFile {
  name: string;
  type: string;
  size: number; // in KB
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
  
  // Vulnerable file upload states for Educator
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    const saved = localStorage.getItem(`eduunity_materials_${course.id}`);
    if (saved) {
      return JSON.parse(saved);
    }
    // Fallback default files
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

  const [customFileName, setCustomFileName] = useState('');
  const [customFileContent, setCustomFileContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showShellModal, setShowShellModal] = useState(false);
  const [activeShellFile, setActiveShellFile] = useState<UploadedFile | null>(null);
  
  // Terminal commands interpreter mock
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [terminalInputCmd, setTerminalInputCmd] = useState('');
  const [selectedPresetCmd, setSelectedPresetCmd] = useState('whoami');

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
    alert(`Success: "${name}" uploaded successfully into server root filesystem! (Note: No validation checks were exerted on file name, type, or payload size).`);
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

  const handleAddPresetFile = (name: string, payload: string) => {
    processUpload(name, name.endsWith('.php') ? 'application/x-php' : 'application/x-sh', payload.length, payload);
  };

  const handleDeleteMaterial = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  // Launch simulated webshell console
  const handleLaunchShell = (file: UploadedFile) => {
    setActiveShellFile(file);
    setShowShellModal(true);
    setTerminalLogs([
      `[+] RCE Payload "${file.name}" detected on server hosting system!`,
      `[+] Invoking php-shell_exec execution wrapper via query parameter ?cmd=`,
      `[System State: Vulnerable Sandbox Activated]`,
      `$ whoami`,
      `www-data (Apache Server HTTP User with read-write uploads permissions)`
    ]);
  };

  const executeSimulatedCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    let response = '';
    const cleanCmd = trimmed.toLowerCase();

    if (cleanCmd === 'whoami') {
      response = 'www-data';
    } else if (cleanCmd === 'id') {
      response = 'uid=33(www-data) gid=33(www-data) groups=33(www-data)';
    } else if (cleanCmd === 'pwd') {
      response = '/var/www/eduunity-connect/uploads';
    } else if (cleanCmd.startsWith('ls')) {
      response = `total 24\ndrwxrwxrwx 1 www-data www-data 4096 Jun  3 12:00 .\ndrwxr-xr-x 1 root     root     4096 Jun  3 11:15 ..\n-rw-r--r-- 1 www-data www-data  612 Jun  3 12:05 config.php\n-rwxrwxrwx 1 www-data www-data  248 Jun  3 12:10 ${activeShellFile?.name || 'webshell.php'}`;
    } else if (cleanCmd.includes('passwd') || cleanCmd.includes('cat /etc/passwd')) {
      response = 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nstudent:x:1001:1001:Student Alice Smith:/home/student:/bin/bash';
    } else if (cleanCmd.includes('secrets.json') || cleanCmd.includes('cat') || cleanCmd.includes('secrets')) {
      response = '[\n  {\n    "flag_id": "FLAG{UNRESTRICTED_FILE_UPLOAD_LEADS_TO_RCE_2026}",\n    "severity": "CRITICAL",\n    "scope": "Server Infrequent Access Registry",\n    "admin_secret_key": "9d0238bc8eabc7f01248c8ac1f"\n  }\n]';
    } else if (cleanCmd === 'uname -a') {
      response = 'Linux eduunity-connect-server 6.1.0-21-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.90-1 x86_64 GNU/Linux';
    } else {
      response = `sh: 1: ${trimmed}: Command not found or restricted in simulation sandbox. Try popular commands: 'whoami', 'pwd', 'ls -la', 'cat secrets.json', 'uname -a'`;
    }

    setTerminalLogs(prev => [
      ...prev,
      `$ ${trimmed}`,
      response
    ]);
    setTerminalInputCmd('');
  };

  // Compile list of registered student names for the Course
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

  // If currently in the payment wizard cycle, replace page
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

      {/* Course Hero Header (Distinct student or educator look) */}
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
                <span className="text-xs text-slate-400">({course.reviews.length} reviews)</span>
              </div>
            </div>

            <div>
              {isEducator ? (
                <div className="bg-teal-900/60 border border-teal-800 p-3 rounded-lg text-teal-200 text-xs flex items-center gap-2">
                  <BadgeCheck size={18} className="text-teal-400 shrink-0" />
                  <div>
                    <p className="font-bold">Signed in as Course Instructor</p>
                    <p className="text-[10px] text-teal-300 mt-0.5">Edit lecture units, access student rosters, and run materials upload portal below.</p>
                  </div>
                </div>
              ) : isEnrolled ? (
                <div className="flex items-center gap-2 bg-emerald-950/55 border border-emerald-800 p-3 rounded-lg text-emerald-200 text-xs">
                  <BadgeCheck size={18} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold">You are enrolled in this course!</p>
                    <p className="text-[10px] text-emerald-400/80 mt-0.5">Explore syllabus blocks and collaborative workspaces below.</p>
                  </div>
                </div>
              ) : (
                <button
                  id="enroll-checkout-button"
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-md"
                >
                  <DollarSign size={16} />
                  Enroll Now ($149.00)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Left Side Column: Syllabus summary */}
        <div className="bg-white rounded-xl col-span-2 shadow-xs border border-gray-100 p-6 md:p-8 space-y-4">
          <h3 className="text-md font-extrabold text-slate-800">Course Coursework Insights</h3>
          <p className="text-gray-600 text-xs leading-relaxed">
            {course.longDescription || course.description}
          </p>

          <h4 className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase mb-2">Curriculum Blocks</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-gray-100">
              <span className="text-xs font-bold text-slate-800">Unit 1: System Cohesion & Team Communication</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Aligning individual tasks with shared team objectives under unified strategies.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-gray-100">
              <span className="text-xs font-bold text-slate-800">Unit 2: Active Peer Auditing Codes</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Peer-to-peer security assurance audits, conflict logs, and repository handoff tactics.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-gray-100">
              <span className="text-xs font-bold text-slate-800">Unit 3: Integrity Evaluation Projects</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Integrative laboratory experiments on cooperative defense simulations.</p>
            </div>
          </div>
        </div>

        {/* Right Side Column: Educator Special roster list */}
        {isEducator ? (
          <div className="bg-white rounded-xl col-span-1 border border-teal-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-teal-150 text-teal-800">
              <Users size={16} className="text-teal-600" />
              <span className="font-extrabold text-xs uppercase tracking-wider">Registered Students</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-normal">
              Below is the dynamic roster of students currently enrolled in this module:
            </p>
            <div id="educator-roster-list" className="space-y-2.5 max-h-64 overflow-y-auto">
              {allStudents.map((name, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 bg-teal-50/50 rounded-lg border border-teal-100/50">
                  <div className="w-6.5 h-6.5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">{name}</span>
                    <span className="text-[9px] text-teal-600/80 font-mono">STATUS: ACTIVE</span>
                  </div>
                </div>
              ))}
              {allStudents.length === 0 && (
                <p className="text-[10px] text-gray-400 text-center py-4">No enrolled student records found.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl col-span-1 border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-gray-150 text-indigo-850">
              <ShieldAlert size={14} className="text-indigo-600" />
              <span className="font-extrabold text-xs uppercase tracking-wider">Secure Audit Sandbox</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              This client terminal provides an ethical laboratory environment for testing dynamic vulnerabilities like IDOR and XSS.
            </p>
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] text-indigo-700 font-mono leading-relaxed">
              <strong>Interactive Checklist:</strong>
              <ul className="list-disc pl-3.5 mt-1 space-y-1">
                <li>Register a guest persona.</li>
                <li>Tamper with checkout hidden price parameters in Step 2.</li>
                <li>Switch to Educator to inspect uploaded scripts RCE.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* EDUCATOR SPECIAL SECTION: FILE UPLOADS VULNERABILITY LAB */}
      {isEducator && (
        <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
            <div className="space-y-1">
              <h3 className="text-md font-extrabold text-teal-950 flex items-center gap-1.5">
                <FolderOpen size={18} className="text-teal-600" />
                Course Materials & Lectures Manager (Vulnerable)
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">Simulate unrestricted file uploads to execute Arbitrary Remote Code (RCE).</p>
            </div>
            <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] uppercase tracking-wider font-bold rounded">
              ⚠️ Upload Vuln Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upload form block */}
            <div className="space-y-4">
              <span className="text-[10px] text-teal-800 uppercase font-black tracking-wider block">Add Interactive Materials</span>
              
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  dragActive ? 'border-indigo-500 bg-indigo-50/20' : 'border-teal-200 bg-teal-50/20 hover:bg-teal-50/40'
                }`}
              >
                <Upload size={24} className="text-teal-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Drag Syllabus File or Payload here</span>
                <span className="text-[10px] text-gray-400">Accepts PDFs, PNGs, and Executables freely</span>
                <input 
                  type="file" 
                  id="material-file-upload-input" 
                  className="hidden" 
                  onChange={handleManualUpload}
                />
                <label 
                  htmlFor="material-file-upload-input"
                  className="mt-2 px-3 py-1 bg-teal-650 hover:bg-teal-600 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Browse Files
                </label>
              </div>

              {/* Preset Pentesting Shell payloads */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold font-mono">
                  <Terminal size={14} className="text-amber-600" />
                  <span>PRESETS FOR TESTING FILE UPLOADS:</span>
                </div>
                <p className="text-[10px] leading-relaxed text-amber-800/90">
                  Select a predefined executable payload script below to simulate a bad actor uploading a server back-door webshell, then click &ldquo;Run Executable&rdquo; to test root access.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddPresetFile('rce_webshell.php', '<?php echo shell_exec($_GET["cmd"]); ?>')}
                    className="py-1 bg-white hover:bg-amber-100 text-amber-800 text-[10px] font-mono font-bold rounded border border-amber-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    rce_webshell.php
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetFile('exploit_privesc.sh', '#!/bin/bash\nchmod +s /bin/bash')}
                    className="py-1 bg-white hover:bg-amber-100 text-amber-800 text-[10px] font-mono font-bold rounded border border-amber-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    exploit_privesc.sh
                  </button>
                </div>
              </div>
            </div>

            {/* List of files on server filesystem */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-teal-850 uppercase font-black tracking-wider">Server Root Upload Directory (/uploads/)</span>
                <span className="text-[9px] font-mono text-gray-400">Total size cached: {uploadedFiles.reduce((acc, f) => acc + f.size, 0)} KB</span>
              </div>

              <div id="server-filesystem-list" className="space-y-2 max-h-68 overflow-y-auto pr-1">
                {uploadedFiles.map((file, i) => {
                  const isPhp = file.name.endsWith('.php');
                  const isSh = file.name.endsWith('.sh');
                  const isMalicious = isPhp || isSh;
                  
                  return (
                    <div key={i} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isMalicious ? 'bg-rose-50/55 border-rose-200' : 'bg-slate-50 border-gray-150'
                    }`}>
                      <div className="flex items-center gap-2 px-1 min-w-0">
                        {isMalicious ? (
                          <Terminal size={16} className="text-rose-600 shrink-0" />
                        ) : (
                          <FileText size={16} className="text-teal-600 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className="text-xs font-bold font-mono text-slate-800 block truncate" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-[9px] text-gray-400 block font-mono">
                            Type: <span className="font-bold">{file.type}</span> • Size: {file.size} KB
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isMalicious ? (
                          <button
                            onClick={() => handleLaunchShell(file)}
                            className="bg-rose-600 hover:bg-rose-500 text-white p-1.5 rounded-lg flex items-center gap-1 text-[9px] font-bold font-mono transition-colors cursor-pointer uppercase tracking-wider"
                            title="Execute Server-side Shell payload"
                          >
                            <Play size={10} className="fill-white" />
                            Run Shell
                          </button>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-50 border border-emerald-250 text-emerald-700 text-[9px] rounded font-mono font-bold flex items-center gap-0.5">
                            <Globe size={10} /> Active
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteMaterial(file.name)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Purge material file"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {uploadedFiles.length === 0 && (
                  <p className="text-[10px] text-slate-400 text-center py-6">Directory is empty. No files uploaded to server root.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Reviews */}
      <ReviewSection reviews={course.reviews} onAddReview={onAddReview} />

      {/* WEBSHELL MODAL POPUP */}
      {showShellModal && activeShellFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowShellModal(false)} />
          
          <div className="relative bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl z-10 overflow-hidden flex flex-col h-[480px]">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="text-rose-500" size={18} />
                <div>
                  <h3 className="text-sm font-black font-mono">Web Shell Execution Simulator</h3>
                  <span className="text-[10px] text-rose-450 block font-mono">Payload: /var/www/uploads/{activeShellFile.name} (RCE Triggered)</span>
                </div>
              </div>
              <button onClick={() => setShowShellModal(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Explanation box */}
            <div className="p-3 bg-amber-950/20 border-b border-slate-800 text-[10.5px] text-amber-200/90 leading-relaxed shrink-0">
              <Info size={12} className="inline mr-1 text-amber-400 shrink-0" />
              <strong>Ethical Hacking Guide:</strong> Select a standard command from the quick menu or enter commands below. Unrestricted uploads allow executing system-level actions under the webserver service account permissions.
            </div>

            {/* Terminal Log outputs */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-2 bg-slate-950 selection:bg-emerald-800 selection:text-white">
              {terminalLogs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap leading-relaxed">
                  {log}
                </div>
              ))}
            </div>

            {/* Terminal Input Controls */}
            <div className="bg-slate-900 p-3 border-t border-slate-800 flex items-center gap-2.5 text-xs shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Quick Payload:</span>
                <select 
                  className="bg-slate-950 border border-slate-800 text-slate-300 rounded p-1 font-mono text-[10px] outline-none"
                  value={selectedPresetCmd}
                  onChange={(e) => {
                    setSelectedPresetCmd(e.target.value);
                    executeSimulatedCommand(e.target.value);
                  }}
                >
                  <option value="whoami">whoami</option>
                  <option value="id">id</option>
                  <option value="pwd">pwd</option>
                  <option value="ls -la /var/www">ls -la /var/www</option>
                  <option value="cat /etc/passwd">cat /etc/passwd</option>
                  <option value="cat secrets.json">cat secrets.json (Read flag)</option>
                  <option value="uname -a">uname -a</option>
                </select>
              </div>

              <div className="flex-1 flex gap-2">
                <input 
                  type="text"
                  placeholder="Type shell command (e.g. whoami, id, cat secrets.json)..."
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 p-1.5 rounded text-[11px] font-mono outline-none focus:border-emerald-600"
                  value={terminalInputCmd}
                  onChange={(e) => setTerminalInputCmd(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executeSimulatedCommand(terminalInputCmd);
                    }
                  }}
                />
                <button 
                  onClick={() => executeSimulatedCommand(terminalInputCmd)}
                  className="px-3 bg-rose-650 hover:bg-rose-600 text-white font-mono font-bold text-[10px] uppercase rounded cursor-pointer"
                >
                  Exec
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
