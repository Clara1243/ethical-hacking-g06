import React, { useState, useEffect } from 'react';
import { GraduationCap, Calendar, User } from 'lucide-react';

interface GradeRecord {
  id: number;
  grade: string;
  issued_date: string;
  courseTitle: string;
  courseCode: string;
  gradedBy: string;
}

interface StudentGradesProps {
  studentId: number;
}

export const StudentGrades: React.FC<StudentGradesProps> = ({ studentId }) => {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // FIXED: Added absolute URL and X-User-Id Header to satisfy requireOwnership middleware
    fetch(`/api/users/${studentId}/grades`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': studentId.toString()
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data: GradeRecord[]) => {
        if (Array.isArray(data)) setGrades(data);
      })
      .catch(err => {
        console.error('Failed to fetch grades:', err);
        setError('Could not load academic records. Please try again later.');
      })
      .finally(() => setIsLoading(false));
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500 font-bold font-mono">Retrieving Academic Records...</p>
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
          <GraduationCap size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Academic Transcript</h2>
          <p className="text-sm text-gray-500">Official examination results and course completions.</p>
        </div>
      </div>

      {grades.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 font-bold">No examination records found.</p>
          <p className="text-xs text-gray-400 mt-2">Complete a course assessment to view your grades here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold">Course Module</th>
                  <th className="p-4 font-bold">Instructor</th>
                  <th className="p-4 font-bold">Date Issued</th>
                  <th className="p-4 font-bold text-right">Final Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-gray-900">{record.courseTitle}</div>
                      <div className="text-[10px] font-mono text-indigo-600 mt-0.5">{record.courseCode}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <User size={14} className="text-gray-400" />
                        {record.gradedBy}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(record.issued_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg border border-emerald-200 shadow-xs">
                        {record.grade}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};