// server.js — MyEduConnect API — Fixed Version
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

const xss = require('xss'); // For sanitizing user input to prevent XSS

const BCRYPT_SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'myeduconnect_fixed_branch_secret_key_2026';


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ─────────────────────────────────────────────
// Secure Auth Middleware — JWT Based
// ─────────────────────────────────────────────
app.use((req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);

  try {
    // The server verifies the signature. If tampered with or expired, it throws an error.
    const decoded = jwt.verify(token, JWT_SECRET);
    req.authenticatedUserId = decoded.id;
    req.authenticatedUserRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
});

// ─────────────────────────────────────────────
// Database — connection pool
// ─────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: 'root',
  password: 'rootpassword',
  database: 'MyEduConnect_db',
  waitForConnections: true,
  connectionLimit: 10,
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const sendError = (res, status, message) => res.status(status).json({ error: message });

const removePassword = (user) => {
  if (!user) return user;
  const { password, ...safeUser } = user;
  return safeUser;
};

// ─────────────────────────────────────────────
// Ownership / IDOR Authorization Middleware
// ─────────────────────────────────────────────
const requireOwnership = (getResourceUserId) =>
  asyncHandler(async (req, res, next) => {
    const callerId = req.authenticatedUserId;

    if (!callerId) {
      return sendError(res, 401, 'Not authenticated');
    }

    const resourceUserId = await getResourceUserId(req);

    // Actively block the request if the caller is not the owner
    // 1. First, check if the resource actually exists
    if (resourceUserId === null || resourceUserId === undefined) {
      return sendError(res, 404, 'Not found: The requested resource does not exist.');
    }

    // 2. Then, actively block the request if the caller is not the owner
    if (String(resourceUserId) !== String(callerId)) {
      return sendError(res, 403, 'Forbidden: You do not have permission to view this resource.');
    }

    next();
  });

// ─────────────────────────────────────────────
// Auth routes
// ─────────────────────────────────────────────
app.post('/api/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return sendError(res, 400, 'username and password are required');
  }

  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );

  if (rows.length === 0) {
    return sendError(res, 401, 'Incorrect credentials');
  }

  const user = rows[0];

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return sendError(res, 401, 'Incorrect credentials');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    ...removePassword(user),
    token
  });
}));

app.post('/api/register', asyncHandler(async (req, res) => {
  const { username, email, password, role, dob } = req.body;

  if (!username || !email || !password || !dob) {
    return sendError(res, 400, 'username, email, password, and dob are required');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  await pool.execute(
    `INSERT INTO users (username, email, password, role, dob, bio)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, email, hashedPassword, role ?? 'student', dob, 'New user profile.']
  );

  const [newUserRows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  const newUser = newUserRows[0];

  const token = jwt.sign(
    { id: newUser.id, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(201).json({
    ...removePassword(newUser),
    token
  });
}));

// ─────────────────────────────────────────────
// Student routes
// ─────────────────────────────────────────────
app.get(
  '/api/users/:id/courses',
  requireOwnership(req => Number(req.params.id)),
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      `SELECT c.*, rc.status, rc.enroll_date
       FROM registered_courses rc
       JOIN courses c ON rc.course_id = c.id
       WHERE rc.student_id = ?`,
      [req.params.id]
    );

    res.json(rows);
  })
);

app.get(
  '/api/users/:id/grades',
  requireOwnership(req => Number(req.params.id)),
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      `SELECT
         eg.id,
         eg.grade,
         eg.issued_date,
         c.title        AS courseTitle,
         c.course_code  AS courseCode,
         u.username     AS gradedBy
       FROM exam_grades eg
       JOIN courses c ON eg.course_id = c.id
       JOIN users u   ON eg.graded_by = u.id
       WHERE eg.student_id = ?`,
      [req.params.id]
    );

    res.json(rows);
  })
);

// ─────────────────────────────────────────────
// Receipt routes
// ─────────────────────────────────────────────
app.get(
  '/api/receipts',
  requireOwnership(req => {
    const userId = parseInt(req.query.userId, 10);
    return isNaN(userId) ? null : userId;
  }),
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.query.userId, 10);

    if (isNaN(userId)) {
      return sendError(res, 400, 'userId query param is required');
    }

    const [rows] = await pool.execute(
      `SELECT
         r.id,
         r.transaction_date  AS date,
         r.amount,
         c.title             AS courseTitle,
         u.username          AS buyerName,
         u.email             AS buyerEmail,
         'Paid'              AS status,
         r.payment_method    AS paymentMethod,
         r.account_number    AS accountNumber
       FROM receipts r
       JOIN users u   ON r.user_id   = u.id
       JOIN courses c ON r.course_id = c.id
       WHERE r.user_id = ?
       ORDER BY r.transaction_date DESC`,
      [userId]
    );

    res.json(rows);
  })
);

app.get(
  '/api/receipts/:id',
  requireOwnership(async (req) => {
    const [rows] = await pool.execute(
      'SELECT user_id FROM receipts WHERE id = ?',
      [req.params.id]
    );

    return rows[0]?.user_id ?? null;
  }),
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      `SELECT
         r.id,
         r.transaction_date  AS date,
         r.amount,
         c.title             AS courseTitle,
         u.username          AS buyerName,
         u.email             AS buyerEmail,
         'Paid'              AS status,
         r.payment_method    AS paymentMethod,
         r.account_number    AS accountNumber
       FROM receipts r
       JOIN users u   ON r.user_id   = u.id
       JOIN courses c ON r.course_id = c.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (!rows[0]) {
      return sendError(res, 404, 'Not found');
    }

    res.json(rows[0]);
  })
);

// ─────────────────────────────────────────────
// Course routes
// ─────────────────────────────────────────────
app.get('/api/courses', asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM courses');
  res.json(rows);
}));

app.get('/api/courses/:id/materials', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM course_materials WHERE course_id = ?',
    [req.params.id]
  );

  res.json(rows);
}));

app.get('/api/courses/:id/feedback', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT f.*, u.username AS author
     FROM course_feedback f
     JOIN users u ON f.user_id = u.id
     WHERE f.course_id = ?
     ORDER BY f.date_time DESC`,
    [req.params.id]
  );

  res.json(rows);
}));

app.get('/api/courses/:id/students', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.email, rc.enroll_date
     FROM registered_courses rc
     JOIN users u ON rc.student_id = u.id
     WHERE rc.course_id = ?`,
    [req.params.id]
  );

  res.json(rows);
}));

// INTENTIONAL VULNERABILITY: Stored XSS
// This endpoint accepts raw HTML/JavaScript payloads and stores them directly into the database without sanitization.
app.post('/api/courses/:id/feedback', asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const { content, rating } = req.body;
  const userId = req.authenticatedUserId;

  if (!userId) return sendError(res, 401, 'Not authenticated. Invalid or missing token.');
  if (!content || !rating) return sendError(res, 400, 'Content and rating are required');

  // Strip dangerous HTML tags before inserting into the database
  const sanitizedContent = xss(content);

  await pool.execute(
    `INSERT INTO course_feedback (course_id, user_id, content, rating, date_time)
     VALUES (?, ?, ?, ?, NOW())`,
    [courseId, userId, sanitizedContent, rating] 
  );

  const [newFeedback] = await pool.execute(
    `SELECT f.*, u.username AS author
     FROM course_feedback f
     JOIN users u ON f.user_id = u.id
     WHERE f.course_id = ? AND f.user_id = ?
     ORDER BY f.date_time DESC LIMIT 1`,
    [courseId, userId]
  );

  res.status(201).json(newFeedback[0]);
}));

// Retrieve all feedback for a specific course
app.get('/api/courses/:id/feedback', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT f.*, u.username AS author
     FROM course_feedback f
     JOIN users u ON f.user_id = u.id
     WHERE f.course_id = ?
     ORDER BY f.date_time DESC`,
    [req.params.id]
  );
  
  res.json(rows);
}));

// ─────────────────────────────────────────────
// Admin routes
// ─────────────────────────────────────────────
app.get('/api/admin/receipts', asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT
       r.id,
       r.transaction_date  AS date,
       r.amount,
       c.title             AS courseTitle,
       u.username          AS buyerName,
       u.email             AS buyerEmail,
       'Paid'              AS status
     FROM receipts r
     JOIN users u   ON r.user_id   = u.id
     JOIN courses c ON r.course_id = c.id
     ORDER BY r.transaction_date DESC`
  );

  res.json(rows);
}));

app.get('/api/users', asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, username, email, role, dob, bio FROM users'
  );

  res.json(rows);
}));

// ─────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  sendError(res, 500, 'Internal server error');
});

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
app.listen(3000, '0.0.0.0', () => {
  console.log('API running on port 3000 with bcrypt password hashing and JWT authentication');
});