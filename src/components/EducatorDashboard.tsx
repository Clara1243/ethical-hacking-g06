import React, { useState } from 'react';
import { Course } from '../types';
import { BookOpen, Users, PlusCircle, Sparkles, TrendingUp, Trophy } from 'lucide-react'; // Unused icons removed

interface EducatorDashboardProps {
  courses: Course[];
  onCreateCourse: (course: Course) => void;
}

export const EducatorDashboard: React.FC<EducatorDashboardProps> = ({
  courses,
  onCreateCourse,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('6 weeks');
  const [modulesCount, setModulesCount] = useState(8);
  const [longDescription, setLongDescription] = useState('');

  // Performance calculations
  const totalEnrolls = courses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const averageRating = courses.reduce((sum, c) => sum + c.rating, 0) / (courses.length || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Create custom new course
    const newCourse: Course = {
      id: `course-${Date.now()}` as any,
      title,
      category,
      description,
      longDescription: longDescription || description,
      rating: 5.0,
      duration,
      instructor: 'Dr. Helen Vance',
      enrolledCount: 0,
      modulesCount,
      image: category === 'Computer Science' || category === 'Network Security'
        ? 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600'
        : 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=600',
      reviews: []
    };

    onCreateCourse(newCourse);
    setShowCreateModal(false);
    
    // Reset inputs
    setTitle('');
    setDescription('');
    setLongDescription('');
    setDuration('6 weeks');
    setModulesCount(8);
  };

  return (
    <div id="educator-dashboard-container" className="py-8 max-w-7xl mx-auto px-4 space-y-8">
      {/* Upper header action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Educator Syllabus & Tracking Panel</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Author cooperative curriculums, analyze class performance reviews, and view active peer integrations.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 md:mt-0 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95"
        >
          <PlusCircle size={16} />
          Create New Course
        </button>
      </div>

      {/* Educator Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-300 font-mono font-bold tracking-wider uppercase block">Your Active Courses</span>
            <span className="text-3xl font-black font-mono">{courses.length} Lectures</span>
          </div>
          <BookOpen size={32} className="text-indigo-400" />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-mono font-bold tracking-wider uppercase block">Student Enrollment Rate</span>
            <span className="text-3xl font-black text-slate-900 font-mono">{totalEnrolls} Peers</span>
          </div>
          <Users size={32} className="text-emerald-500" />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-mono font-bold tracking-wider uppercase block">Average Student Rating</span>
            <span className="text-3xl font-black text-slate-900 font-mono">{averageRating.toFixed(1)} / 5.0</span>
          </div>
          <Trophy size={32} className="text-amber-500" />
        </div>
      </div>

      {/* Classroom stats graph */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <TrendingUp size={18} className="text-indigo-600" />
          <span className="font-bold text-gray-950 text-sm">Course Performance Charts & Tracking Logs</span>
        </div>

        <div className="space-y-4">
          {courses.map((course) => {
            const percentage = Math.min(100, Math.floor((course.enrolledCount / 300) * 100));
            return (
              <div key={course.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-gray-800 font-sans truncate pr-4">{course.title}</span>
                  <span className="text-slate-500 font-mono shrink-0">{course.enrolledCount} active students</span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex items-center relative border border-slate-200">
                  <div
                    className="h-full bg-linear-to-r from-indigo-500 to-indigo-600 rounded-full"
                    style={{ width: `${percentage || 1}%` }}
                  />
                  <span className="absolute right-2.5 text-[9px] font-bold font-mono text-slate-500">
                    {percentage}% Target (Cap: 300)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Course Modal overlay dialog */}
      {showCreateModal && (
        <div id="create-course-modal" className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="font-bold text-gray-900 text-md flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600" />
                Author Curriculum Syllabus
              </span>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g. Cooperative Security Incident Management"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Category</label>
                  <select
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-hidden focus:ring-2"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Network Security">Network Security</option>
                    <option value="Psychology">Psychology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                    placeholder="e.g. 6 weeks"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Syllabus Highlight (Short description)</label>
                <textarea
                  required
                  rows={2}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  placeholder="Provide a general summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Comprehensive Lectures Outline</label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-sm"
                  placeholder="Provide details about joint team project tasks, modules, grading parameters..."
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Publish syllabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};