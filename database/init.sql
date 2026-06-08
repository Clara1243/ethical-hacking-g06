CREATE DATABASE IF NOT EXISTS MyEduConnect_db;
USE MyEduConnect_db;

-- 1. Users Table (Supports UserManagement.tsx & ProfilePage.tsx)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Vulnerability: Plain text for Cryptographic weakness
    role ENUM('student', 'educator', 'admin') DEFAULT 'student',
    bio TEXT, -- Target for IDOR / XSS on the ProfilePage
    status ENUM('active', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Courses Table (Supports CourseCatalog.tsx & EducatorDashboard.tsx)
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- 3. Receipts/Transactions Table (Supports BillingHistory.tsx & ReceiptView.tsx)
CREATE TABLE receipts (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Vulnerability: Sequential IDs for IDOR attacks
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
) AUTO_INCREMENT=1000;

-- 4. Course Materials (Supports the Vulnerable File Upload in CourseDetailPage.tsx)
CREATE TABLE course_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    uploader_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL, -- Vulnerability: Storing path for directory traversal/execution
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (uploader_id) REFERENCES users(id)
);

-- ==========================================
-- INSERT MOCK DATA FOR EDUUNITY PLATFORM
-- ==========================================

-- 1. Insert Users (VULNERABILITY: Plain text passwords for Crypto Weakness)
INSERT INTO users (id, username, password, role, bio) VALUES 
(1, 'admin@eduunity.io', 'admin123', 'admin', 'Head of system-wide services and role management. Directs site stability, course catalogs, and payment histories.'),
(2, 'helen.vance@eduunity.io', 'helen123', 'educator', 'Associate Professor of Computer Science at EduUnity Connect. Enthusiastic advocate of open-source team initiatives.'),
(3, 'alice.smith@eduunity.io', 'alice123', 'student', 'Avid learner specializing in network security and cooperative software projects. Believes coding is a team sport.'),
(4, 'jane.cooper@eduunity.io', 'jane123', 'student', 'Dedicated student focusing on synergistic development.'),
(5, 'bob.vance@vancerefrigeration.com', 'bob123', 'student', 'Student exploring cooperative threat intelligence.');

-- 2. Insert Courses (Linked to Instructor ID 2: Dr. Helen Vance)
INSERT INTO courses (id, instructor_id, title, description, price) VALUES 
(1, 2, 'Synergistic Software Development & Version Control', 'Learn the power of cooperative coding. Master Git branch strategies, group refactoring, and code review etiquette.', 149.00),
(2, 2, 'Shared Ledger Auditing & Collaborative Accounting', 'Explore multi-organization balance sheets, collaborative spreadsheet structures, and cooperative governance systems.', 99.00),
(3, 2, 'Cooperative Threat Intelligence & Red/Blue Team Defense', 'Understand unified cyber-defense strategies. Implement shared security operations centers and cooperative pen testing.', 199.00),
(4, 2, 'Cooperative Dynamics in Modern Psychology', 'Analyze group cohesion, cooperative game theory, empathy-driven consensus building, and structural conflict resolution.', 129.00);

-- 3. Insert Reviews (VULNERABILITY: Prepped for Stored XSS tests)
INSERT INTO reviews (course_id, user_id, review_text) VALUES 
(1, 3, 'This course completely transformed how our software project team coordinates work. Highly recommended!'),
(1, 4, 'Excellent section on pull request conflicts and peer review culture.'),
(2, 5, 'Very detailed breakdown of joint ventures and sharing audits. A must-watch helper for co-op financial experts.');

-- 4. Insert Receipts/Transactions (VULNERABILITY: Plaintext cards & Sequential IDs starting at 1041)
ALTER TABLE receipts AUTO_INCREMENT = 1041;
INSERT INTO receipts (user_id, course_id, amount, payment_method, transaction_date) VALUES 
(4, 1, 149.00, 'Visa •••• 4242', '2026-05-10 14:32:00'),
(5, 3, 199.00, 'Visa •••• 1111', '2026-05-15 09:12:00'),
(4, 2, 99.00, 'Mastercard •••• 5555', '2026-05-18 11:45:00'),
(3, 4, 129.00, 'Visa •••• 9999', '2026-05-20 16:50:00');