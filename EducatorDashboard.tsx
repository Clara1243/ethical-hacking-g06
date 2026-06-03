import React, { useState } from 'react';
import { Search, Calendar, BookOpen, Users, Stars, ArrowUpRight, GraduationCap } from 'lucide-react';
import { Course } from '../types';

interface CourseCatalogProps {
  courses: Course[];
  enrolledCourseIds: string[];
  onEnroll: (courseId: string) => void;
  onViewDetail: (courseId: string) => void;
  userRole: 'student' | 'educator' | 'admin';
  onCreateCoursePrompt?: () => void; // For educators!
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['All', 'Computer Science', 'Accountant', 'Network Security', 'Psychology'];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || course.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="course-catalog-container" className="py-8 max-w-7xl mx-auto px-4 space-y-8">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-800">
        <div className="space-y-3 max-w-2xl">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-semibold text-xs rounded-full border border-indigo-500/30">
            Cooperative Learning Paradigm
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Cultivate Integration and Unity Through Joint Forums
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            Welcome to <strong className="text-indigo-200">EduUnity Connect</strong>, where student cooperation powers success. Browse shared peer syllabi, co-author system assessments, and learn from experts.
          </p>
        </div>
        
        {userRole === 'educator' && onCreateCoursePrompt && (
          <button
            onClick={onCreateCoursePrompt}
            className="px-6 py-3 bg-white hover:bg-slate-100 text-indigo-900 font-bold rounded-lg text-sm transition-all transform hover:-translate-y-0.5 shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <GraduationCap size={16} />
            Create Course Syllabus
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            id="course-search-field"
            type="text"
            className="w-full bg-slate-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            placeholder="Search collaborative subjects, instructors, or labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                (cat === 'All' && !selectedCategory) || (selectedCategory?.toLowerCase() === cat.toLowerCase())
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 hover:bg-indigo-50 text-slate-600 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Courses */}
      <div id="course-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-dashed border-slate-300 rounded-2xl py-12 text-center text-slate-500 text-sm">
            No courses found matching that criteria. Try adjusting your search query.
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between"
              >
                {/* Course Header Banner */}
                <div className="relative h-44 shrink-0 bg-slate-100 cursor-pointer overflow-hidden group" onClick={() => onViewDetail(course.id)}>
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-indigo-300 text-[10px] font-bold tracking-wider uppercase rounded-sm font-mono border border-indigo-500/20">
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs text-[10px] font-bold text-gray-800">
                    <Stars size={11} className="fill-amber-400 text-amber-400" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Course Body (clickable to view detail) */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 cursor-pointer" onClick={() => onViewDetail(course.id)}>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Instructor: <strong className="text-indigo-600 font-sans">{course.instructor}</strong></span>
                    </div>
                    <h3 className="text-md font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50/80 space-y-4">
                    {/* Course Metadata details */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-indigo-400" /> {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={12} className="text-indigo-400" /> {course.modulesCount} Modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-indigo-400" /> {course.enrolledCount} Peers
                      </span>
                    </div>

                    {/* Action buttons (Grid Enroll is requested!) */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewDetail(course.id)}
                        className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        Syllabus Details
                        <ArrowUpRight size={12} />
                      </button>

                      {isEnrolled ? (
                        <div className="flex-1 py-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200 text-center uppercase tracking-wide flex items-center justify-center gap-1 cursor-default">
                          ✓ Enrolled
                        </div>
                      ) : (
                        <button
                          onClick={() => onEnroll(course.id)}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
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
