import React, { useState, useEffect } from 'react';
import { UserProfile, Role } from '../types';
import { User, Mail, FileText, Settings, BadgeCheck } from 'lucide-react'; 

interface ProfilePageProps {
  user: UserProfile;
  onUpdateBio: (targetEmail: string, newBio: string) => void;
  enrolledCoursesCount: number;
  isIdorTarget: boolean; // Kept in interface to prevent App.tsx type errors, but unused visually
  loggedInUserRole?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateBio,
  enrolledCoursesCount,
  loggedInUserRole,
}) => {
  const [bioText, setBioText] = useState<string>(user.bio ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState(false);

  // Sync local bio state when the viewed user changes (e.g. during IDOR navigation)
  useEffect(() => {
    setBioText(user.bio ?? '');
    setIsEditing(false);
  }, [user.id, user.bio]);

  const handleSave = () => {
    onUpdateBio(user.email, bioText);
    setIsEditing(false);
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2000);
  };

  const getRoleDesc = (role: Role): string => {
    switch (role) {
      case 'student':  return 'Direct Learner & Team Contributor';
      case 'educator': return 'Syllabus Architect & Peer Mentor';
      case 'admin':    return 'Platform Security Authority & System Trustee';
    }
  };

  const getRoleTheme = (role: Role) => {
    switch (role) {
      case 'student':  return { bg: 'bg-indigo-50 border-indigo-250 text-indigo-700', label: 'Student Persona' };
      case 'educator': return { bg: 'bg-teal-50 border-teal-200 text-teal-700',       label: 'Educator Authority' };
      case 'admin':    return { bg: 'bg-rose-50 border-rose-200 text-rose-700',        label: 'Primary Administrator' };
    }
  };

  const displayName = user.username;

  return (
    <div id="profile-container" className="max-w-3xl mx-auto py-8 px-4 space-y-6">

      {/* Profile header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-slate-800" />

        <div className="p-6 md:p-8 -mt-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            {/* Avatar — falls back to initials if no avatar URL */}
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl font-black">
                {displayName.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="md:mb-2 space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getRoleTheme(user.role).bg}`}>
                  {getRoleTheme(user.role).label}
                </span>
              </div>
              <p className="text-xs text-indigo-600 font-medium font-mono">{getRoleDesc(user.role)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save confirmation */}
      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold">
          ✓ Biography updated successfully.
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Account overview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4 md:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-slate-800">
            <Settings size={16} className="text-indigo-600" />
            <span className="font-bold text-sm">Account Overview</span>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <User className="text-slate-400" size={16} />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider font-mono">Username</span>
                <span className="text-xs text-slate-800 font-semibold truncate block">{user.username}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-slate-400" size={16} />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider font-mono">Registered Email</span>
                <span className="text-xs text-slate-800 font-semibold truncate block">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="text-slate-400" size={16} />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider font-mono">Enrolled Ingress</span>
                <span className="text-xs text-slate-800 font-bold font-mono block">
                  {user.role === 'student' ? `${enrolledCoursesCount} Courses` : 'Educator Syllabus'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Biography */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs md:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-slate-800">
              <BadgeCheck size={17} className="text-indigo-600" />
              <span className="font-bold text-sm">Biography Dossier</span>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-indigo-600 hover:text-indigo-500 font-bold cursor-pointer"
              >
                Modify Bio text
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsEditing(false); setBioText(user.bio ?? ''); }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="text-xs text-emerald-600 hover:text-emerald-500 font-bold cursor-pointer"
                >
                  Save Bio
                </button>
              </div>
            )}
          </div>

          <div>
            {!isEditing ? (
              <p className="text-sm text-gray-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-gray-150 whitespace-pre-wrap font-mono">
                {user.bio || 'No custom biography set. Clarify your learning directions or role scope here...'}
              </p>
            ) : (
              <div className="space-y-3">
                <textarea
                  id="profile-bio-textarea"
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Share details about your academic path, interests, and how you engage with peer networks..."
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Save biography details
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};