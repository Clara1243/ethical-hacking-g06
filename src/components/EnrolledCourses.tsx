import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Course } from '../types';

interface EnrolledCourseData extends Course {
  status: string;
  enroll_date: string;
}

interface EnrolledCoursesProps {
  studentId: number;
  onViewDetail: (courseId: number) => void;
}

export const EnrolledCourses: React.FC<EnrolledCoursesProps> = ({ studentId, onViewDetail }) => {
  const [courses, setCourses] = useState<EnrolledCourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('token');

    fetch(`/api/users/${studentId}/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Send the secure JWT
        'Authorization': `Bearer ${token}` 
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data: EnrolledCourseData[]) => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch(err => {
        console.error('Failed to fetch enrolled courses:', err);
        setError('Could not load enrolled courses. Please try again later.');
      })
      .finally(() => setIsLoading(false));
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500 font-bold font-mono">Loading your learning modules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-sm font-medium text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
          <BookOpen size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Enrolled Courses</h2>
          <p className="text-sm text-gray-500">Modules you are currently registered for or have completed.</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 font-bold">You are not enrolled in any courses yet.</p>
          <p className="text-xs text-gray-400 mt-2">Head over to the Course Catalog to find your next module.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-black tracking-widest uppercase rounded-md font-mono">
                    {course.course_code}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    course.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {course.status === 'completed' && <CheckCircle2 size={10} />}
                    {course.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1">{course.title}</h3>

                <div className="flex items-center gap-4 text-xs text-gray-500 font-mono mt-3">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    Enrolled: {new Date(course.enroll_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => onViewDetail(course.id)}
                  className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Access Coursework
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};