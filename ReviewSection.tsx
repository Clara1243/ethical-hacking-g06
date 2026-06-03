export type UserRole = 'student' | 'educator' | 'admin';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  bio: string;
  avatar: string;
  enrolledCourses: string[]; // Course IDs
  status?: 'Active' | 'Inactive';
}

export interface Review {
  id: string;
  author: string;
  authorRole: UserRole;
  content: string;
  rating: number;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string; // e.g. computer science, accountant, network security, psychology
  rating: number;
  duration: string;
  instructor: string;
  enrolledCount: number;
  modulesCount: number;
  image: string;
  reviews: Review[];
}

export interface PaymentReceipt {
  id: number;
  date: string;
  amount: number;
  courseId: string;
  courseTitle: string;
  buyerName: string;
  buyerEmail: string;
  status: 'Paid' | 'Pending' | 'Refunded';
  instructor?: string;
  paymentMethod?: string;
}
