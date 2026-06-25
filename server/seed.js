const mysql = require('mysql2/promise');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: 'root',
  password: 'rootpassword',
  database: 'MyEduConnect_db'
};

async function seedDatabase() {
  console.log('🌱 Starting Advanced Relational Seeding...');
  const connection = await mysql.createConnection(dbConfig);

  try {
    // 0. WIPE EXISTING DATA
    console.log('🧹 Wiping old data and resetting IDs...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      'course_feedback',
      'course_materials',
      'exam_grades',
      'receipts',
      'registered_courses',
      'courses',
      'users'
    ];

    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. GENERATE USERS
    console.log('👥 Generating Admins, Educators, and Students...');
    const users = [];

    // IDs 1-5: Admins
    for (let i = 0; i < 5; i++) {
      const hashedPassword = await bcrypt.hash('password123', 10);

      users.push([
        faker.internet.username(),
        faker.internet.email(),
        hashedPassword,
        'admin',
        '1980-01-01',
        'System Admin'
      ]);
    }

    // IDs 6-15: Educators
    for (let i = 0; i < 10; i++) {
      const hashedPassword = await bcrypt.hash('password123', 10);

      users.push([
        faker.person.fullName(),
        faker.internet.email(),
        hashedPassword,
        'educator',
        '1985-05-15',
        'Course Instructor'
      ]);
    }

    // IDs 16-115: Students
    for (let i = 0; i < 100; i++) {
      const hashedPassword = await bcrypt.hash('password123', 10);

      users.push([
        faker.person.fullName(),
        faker.internet.email(),
        hashedPassword,
        'student',
        '2005-08-20',
        'Active Student'
      ]);
    }

    await connection.query(
      `INSERT INTO users (username, email, password, role, dob, bio) VALUES ?`,
      [users]
    );

    // 2. GENERATE COURSES
    console.log('📚 Generating Courses & Materials...');
    const courses = [];
    const courseData = [];
    let courseIdCounter = 1;

    for (let educatorId = 6; educatorId <= 15; educatorId++) {
      for (let j = 0; j < 2; j++) {
        const price = faker.number.float({
          min: 50,
          max: 200,
          fractionDigits: 2
        });

        courses.push([
          `C${faker.number.int({ min: 1000, max: 9999 })}`,
          faker.company.catchPhrase(),
          faker.lorem.paragraph(),
          price,
          faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
          educatorId
        ]);

        courseData.push({
          id: courseIdCounter,
          price: price,
          educatorId: educatorId
        });

        courseIdCounter++;
      }
    }

    await connection.query(
      `INSERT INTO courses (course_code, title, description, price, rating, instructor_id) VALUES ?`,
      [courses]
    );

    // 3. GENERATE COURSE MATERIALS
    const materials = [];

    for (let cId = 1; cId <= 20; cId++) {
      materials.push([
        cId,
        courseData[cId - 1].educatorId,
        `Syllabus_Module_${cId}.pdf`,
        `/uploads/courses/${cId}/Syllabus_${cId}.pdf`
      ]);
    }

    await connection.query(
      `INSERT INTO course_materials (course_id, uploader_id, filename, file_path) VALUES ?`,
      [materials]
    );

    // 4. GENERATE ENROLLMENTS, RECEIPTS, AND GRADES
    console.log('🎓 Processing Enrollments, Receipts, and Exams...');
    const enrollments = [];
    const receipts = [];
    const grades = [];
    const enrollmentMap = {};

    for (const course of courseData) {
      const selectedStudents = faker.helpers.arrayElements(
        Array.from({ length: 100 }, (_, i) => i + 16),
        12
      );

      enrollmentMap[course.id] = selectedStudents;

      for (const studentId of selectedStudents) {
        const isCompleted = Math.random() > 0.5;
        const status = isCompleted ? 'completed' : 'enrolled';
        const date = faker.date.recent({ days: 90 }).toISOString().split('T')[0];

        enrollments.push([
          studentId,
          course.id,
          status,
          date
        ]);

        receipts.push([
          studentId,
          course.id,
          course.price,
          faker.helpers.arrayElement(['Mastercard', 'Visa', 'FPX']),
          faker.finance.creditCardNumber('#### #### #### ####'),
          `${date} 10:00:00`
        ]);

        if (isCompleted) {
          grades.push([
            studentId,
            course.id,
            faker.helpers.arrayElement(['A', 'B', 'C', 'A-']),
            date,
            course.educatorId
          ]);
        }
      }
    }

    await connection.query(
      `INSERT INTO registered_courses (student_id, course_id, status, enroll_date) VALUES ?`,
      [enrollments]
    );

    await connection.query(
      `INSERT INTO receipts (user_id, course_id, amount, payment_method, account_number, transaction_date) VALUES ?`,
      [receipts]
    );

    await connection.query(
      `INSERT INTO exam_grades (student_id, course_id, grade, issued_date, graded_by) VALUES ?`,
      [grades]
    );

    // 5. GENERATE VARIED COURSE FEEDBACK
    console.log('💬 Generating Realistic Student Reviews...');
    const feedbacks = [];

    const reviewTemplates = [
      'This course was exactly what I needed. ',
      'The instructor explained the concepts clearly. ',
      'I learned a lot, but the coursework was quite challenging! ',
      'Fantastic module, highly recommended. ',
      'A bit fast-paced, but overall a great learning experience. ',
      'The syllabus was well-structured and easy to follow. ',
      'I really enjoyed the collaborative aspects of this class. ',
      'Solid material, though I wish there were more practical exercises. '
    ];

    for (const course of courseData) {
      const enrolledStudentsInCourse = enrollmentMap[course.id];

      const reviewers = faker.helpers.arrayElements(
        enrolledStudentsInCourse,
        faker.number.int({ min: 3, max: 6 })
      );

      for (const studentId of reviewers) {
        const rating = faker.number.int({ min: 3, max: 5 });
        const baseText = faker.helpers.arrayElement(reviewTemplates);
        const extraText = faker.lorem.sentence();
        const content = baseText + extraText;
        const date = faker.date.recent({ days: 30 }).toISOString().split('T')[0] + ' 14:30:00';

        feedbacks.push([
          course.id,
          studentId,
          content,
          rating,
          date
        ]);
      }
    }

    await connection.query(
      `INSERT INTO course_feedback (course_id, user_id, content, rating, date_time) VALUES ?`,
      [feedbacks]
    );

    console.log(`✅ Success: Generated 100 Students, 20 Courses, 240 Receipts, and ${feedbacks.length} Reviews.`);
    console.log('🎉 Database Seeding Complete!');

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await connection.end();
  }
}

seedDatabase();