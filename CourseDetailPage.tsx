import { Course, PaymentReceipt, UserProfile } from './types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Synergistic Software Development & Version Control',
    category: 'Computer Science',
    description: 'Learn the power of cooperative coding. Master Git branch strategies, group refactoring, and code review etiquette.',
    longDescription: 'In this course, you will dive deep into version control ecosystems designed for unified teams. We will cover peer feedback, trunk-based development, and how to operate and succeed in high-cohesion software teams. You will collaborate on group project repositories and understand standard workflow strategies used in enterprise open source.',
    rating: 4.8,
    duration: '6 weeks',
    instructor: 'Dr. Helen Vance',
    enrolledCount: 142,
    modulesCount: 12,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
    reviews: [
      {
        id: 'rev-1',
        author: 'Marcus Aurel',
        authorRole: 'student',
        content: 'This course completely transformed how our software project team coordinates work. Highly recommended!',
        rating: 5,
        date: '2026-05-15'
      },
      {
        id: 'rev-2',
        author: 'Clara Oswald',
        authorRole: 'student',
        content: 'Excellent section on pull request conflicts and peer review culture.',
        rating: 4,
        date: '2026-05-20'
      }
    ]
  },
  {
    id: 'course-2',
    title: 'Shared Ledger Auditing & Collaborative Accounting',
    category: 'Accountant',
    description: 'Explore multi-organization balance sheets, collaborative spreadsheet structures, and cooperative governance systems.',
    longDescription: 'Accountancy does not happen in a silo. This curriculum introduces collaborative ledger configurations, digital joint audit practices, and financial reporting protocols for unified corporate operations or co-ops. Learn to audit high-value shared journals with high precision.',
    rating: 4.6,
    duration: '8 weeks',
    instructor: 'Prof. Julian Stark',
    enrolledCount: 88,
    modulesCount: 16,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600',
    reviews: [
      {
        id: 'rev-3',
        author: 'Sarah Jenkins',
        authorRole: 'student',
        content: 'Very detailed breakdown of joint ventures and sharing audits. A must-watch helper for co-op financial experts.',
        rating: 5,
        date: '2026-05-18'
      }
    ]
  },
  {
    id: 'course-3',
    title: 'Cooperative Threat Intelligence & Red/Blue Team Defense',
    category: 'Network Security',
    description: 'Understand unified cyber-defense strategies. Implement shared security operations centers and cooperative pen testing.',
    longDescription: 'Security is a collective endeavor. This course teaches cyber teams how to share threat feeds, construct unified firewalls, and run cooperative penetration simulations. Experience real hands-on red versus blue scenarios in a multi-user environment.',
    rating: 4.9,
    duration: '10 weeks',
    instructor: 'Dean Arthur Pendelton',
    enrolledCount: 210,
    modulesCount: 20,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
    reviews: [
      {
        id: 'rev-4',
        author: 'Wade Wilson',
        authorRole: 'student',
        content: 'Phenomenal exercises. The vulnerability modules are highly interactive and great for teaching dynamic coordination.',
        rating: 5,
        date: '2026-05-25'
      }
    ]
  },
  {
    id: 'course-4',
    title: 'Cooperative Dynamics in Modern Psychology',
    category: 'Psychology',
    description: 'Analyze group cohesion, cooperative game theory, empathy-driven consensus building, and structural conflict resolution.',
    longDescription: 'Why do humans cooperate, and how can we design systems to optimize collective unity? Explore behavior modification models, social identity theories, neural predictors of empathy, and strategies for creating unified educational workspaces.',
    rating: 4.7,
    duration: '5 weeks',
    instructor: 'Dr. Evelyn Pine',
    enrolledCount: 124,
    modulesCount: 10,
    image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=600',
    reviews: [
      {
        id: 'rev-5',
        author: 'Leo Fitz',
        authorRole: 'student',
        content: 'This psychological approach to community-based design is exactly what we need to read to cultivate student cooperation.',
        rating: 5,
        date: '2026-05-28'
      }
    ]
  }
];

export const INITIAL_RECEIPTS: PaymentReceipt[] = [
  {
    id: 1041,
    date: '2026-05-10 14:32',
    amount: 149.00,
    courseId: 'course-1',
    courseTitle: 'Synergistic Software Development & Version Control',
    buyerName: 'Jane Cooper',
    buyerEmail: 'jane.cooper@eduunity.io',
    status: 'Paid',
    instructor: 'Dr. Helen Vance',
    paymentMethod: 'Visa •••• 4242'
  },
  {
    id: 1042,
    date: '2026-05-15 09:12',
    amount: 199.00,
    courseId: 'course-3',
    courseTitle: 'Cooperative Threat Intelligence & Red/Blue Team Defense',
    buyerName: 'Bob Vance',
    buyerEmail: 'bob.vance@vancerefrigeration.com',
    status: 'Paid',
    instructor: 'Dean Arthur Pendelton',
    paymentMethod: 'Visa •••• 1111'
  },
  {
    id: 1043,
    date: '2026-05-18 11:45',
    amount: 99.00,
    courseId: 'course-2',
    courseTitle: 'Shared Ledger Auditing & Collaborative Accounting',
    buyerName: 'Jane Cooper',
    buyerEmail: 'jane.cooper@eduunity.io',
    status: 'Paid',
    instructor: 'Prof. Julian Stark',
    paymentMethod: 'Mastercard •••• 5555'
  },
  {
    id: 1044,
    date: '2026-05-20 16:50',
    amount: 129.00,
    courseId: 'course-4',
    courseTitle: 'Cooperative Dynamics in Modern Psychology',
    buyerName: 'Alice Smith',
    buyerEmail: 'alice.smith@eduunity.io',
    status: 'Paid',
    instructor: 'Dr. Evelyn Pine',
    paymentMethod: 'Visa •••• 9999'
  }
];

export const USERS: Record<string, UserProfile> = {
  student: {
    name: 'Alice Smith',
    email: 'alice.smith@eduunity.io',
    role: 'student',
    bio: 'Avid learner specializing in network security and cooperative software projects. Believes coding is a team sport.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    enrolledCourses: ['course-4']
  },
  educator: {
    name: 'Dr. Helen Vance',
    email: 'helen.vance@eduunity.io',
    role: 'educator',
    bio: 'Associate Professor of Computer Science at EduUnity Connect. Enthusiastic advocate of open-source team initiatives and multi-peer project layouts.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    enrolledCourses: []
  },
  admin: {
    name: 'EduUnity Administrator',
    email: 'admin@eduunity.io',
    role: 'admin',
    bio: 'Head of system-wide services and role management. Directs site stability, course catalogs, and payment histories.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    enrolledCourses: []
  }
};
