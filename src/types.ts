export type Role = 'student' | 'educator' | 'admin';
export type Status = 'active' | 'suspended';

export interface UserProfile {
  id: number;
  username: string;
  role: Role;
  bio: string | null;
  status: Status;
}

export interface Course {
  id: number;
  instructor_id: number;
  title: string;
  description: string;
  price: number;
}

export interface Receipt {
  id: number;
  date: string;
  amount: number;
  courseTitle: string;
  buyerName: string;
  buyerEmail: string;
  status: string;
  instructor?: string;
  paymentMethod: string;
  accountNumber?: string;
}

export interface CourseMaterial {
  id: number;
  course_id: number;
  uploader_id: number;
  filename: string;
  file_path: string;
}