CREATE DATABASE IF NOT EXISTS MyEduConnect_db;
USE MyEduConnect_db;

-- 1. Unified Authentication & User Info
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- VULNERABILITY: Plain text passwords
    role ENUM('student', 'educator', 'admin') DEFAULT 'student',
    dob DATE, 
    bio TEXT, 
    status ENUM('active', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Courses Table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    instructor_id INT NOT NULL,
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- 3. Registered Courses (Maps students to courses)
CREATE TABLE registered_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    status ENUM('enrolled', 'completed', 'dropped') DEFAULT 'enrolled',
    enroll_date DATE DEFAULT (CURRENT_DATE),
    finish_date DATE NULL,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 4. Exam Grades
CREATE TABLE exam_grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    grade VARCHAR(5) NOT NULL,
    issued_date DATE DEFAULT (CURRENT_DATE),
    graded_by INT NOT NULL, -- Teacher ID
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (graded_by) REFERENCES users(id)
);

-- 5. Receipts / Payments
CREATE TABLE receipts (
    id INT AUTO_INCREMENT PRIMARY KEY, -- VULNERABILITY: Sequential IDs for IDOR
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    account_number VARCHAR(50), -- SENSITIVE data for IDOR exploit
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
) AUTO_INCREMENT=1000;

-- 6. Course Materials 
CREATE TABLE course_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    uploader_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL, 
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (uploader_id) REFERENCES users(id)
);

-- 7. Course Feedback (Replaces reviews)
CREATE TABLE course_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL, -- VULNERABILITY: Prepped for Stored XSS
    rating INT DEFAULT 5, -- Added Rating column
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);