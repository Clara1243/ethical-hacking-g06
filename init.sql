CREATE DATABASE IF NOT EXISTS edu_unity_db;
USE edu_unity_db;

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