import React, { useState } from 'react';
import { Search, GraduationCap } from 'lucide-react';
import { Course } from '../types';

interface CourseCatalogProps {
  courses: Course[];
  enrolledCourseIds: number[];
  onEnroll: (courseId: number) => void;
  onViewDetail: (courseId: number) => void;
  userRole: 'student' | 'educator' | 'admin';
  onCreateCoursePrompt?: () => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  enrolledCourseIds,
  onEnroll,
  onViewDetail,
  userRole,
  onCreateCoursePrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter((course) => {
    return course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           course.course_code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div id="course-catalog-container" className="py-8 max-w-7xl mx-auto px-4 space-y-8">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            MyEduConnect Learning Portal
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            Access your collaborative modules, download course materials, and participate in unified assessments.
          </p>
        </div>
        
        {userRole === 'educator' && onCreateCoursePrompt && (
          <button
            onClick={onCreateCoursePrompt}
            className="px-6 py-3 bg-white hover:bg-slate-100 text-indigo-900 font-bold rounded-lg text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <GraduationCap size={16} />
            Create New Module
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            className="w-full bg-slate-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by course code, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-dashed border-slate-300 rounded-2xl py-12 text-center text-slate-500 text-sm">
            No active courses found matching your search.
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            return (
              <div key={course.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                
                <div className="p-6 border-b border-gray-100 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-black tracking-widest uppercase rounded-md font-mono">
                      {course.course_code}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2 cursor-pointer hover:text-indigo-600" onClick={() => onViewDetail(course.id)}>
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-end space-y-4">
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onViewDetail(course.id)}
                      className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      View Details
                    </button>

                    {isEnrolled ? (
                      <div className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 text-center flex items-center justify-center gap-1 cursor-default">
                        ✓ Enrolled
                      </div>
                    ) : userRole === 'educator' ? (
                      <div className="flex-1 py-2.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg border border-slate-200 text-center">
                        Manage
                      </div>
                    ) : (
                      <button
                        onClick={() => onEnroll(course.id)}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};