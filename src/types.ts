export type Role = 'student' | 'educator' | 'admin';
export type UserRole = Role; 
export type Status = 'active' | 'suspended' | 'Active' | 'Inactive'; // Accommodates both casings
export type EnrollmentStatus = 'enrolled' | 'completed' | 'dropped';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: Role;
  dob?: string;
  bio: string | null;
  status: Status;
  name?: string; 
  avatar?: string;
}

export interface Course {
  id: number | string;
  course_code?: string;
  instructor_id?: number;
  title: string;
  description: string;
  longDescription?: string;
  price?: number;
  rating?: number;
  instructor?: string;
  enrolledCount?: number;
  modulesCount?: number;
  image?: string;
  reviews?: Review[];
}

export interface RegisteredCourse {
  id: number;
  student_id: number;
  course_id: number;
  status: EnrollmentStatus;
  enroll_date: string;
  finish_date: string | null;
}

export interface ExamGrade {
  id: number;
  student_id: number;
  course_id: number;
  grade: string;
  issued_date: string;
  graded_by: number;
}

export interface Receipt {
  id: number;
  date: string;
  amount: number;
  courseId: number;
  courseTitle: string;
  buyerName: string;
  buyerEmail: string;
  status: string;
  instructor?: string;
  paymentMethod?: string;
  accountNumber?: string;
}

export type PaymentReceipt = Receipt; 

export interface CourseFeedback {
  id: number;
  course_id: number;
  user_id: number;
  content: string;
  date_time: string;
  author_name?: string;
}

export interface CourseMaterial {
  id: number;
  course_id: number;
  uploader_id: number;
  filename: string;
  file_path: string;
}

export interface CourseQuiz {
  id: number;
  title: string;
  questions_count: number;
  created_at: string;
}

export interface ActiveStudent {
  id: number;
  username: string;
  email: string;
  enroll_date: string;
}