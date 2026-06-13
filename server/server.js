// server.js — MyEduConnect API
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

// Accepts requests from anywhere. No cookie restrictions.
// app.use(cors()); 

app.use(cors({
  origin: '*', // enable any devices include mobile
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'x-user-id'], // 🌟 关键：强行放行这个头部！
  credentials: true
}));

app.use(express.json());

// ─────────────────────────────────────────────
// Mock Auth Middleware
// ─────────────────────────────────────────────
// Looks for the 'X-User-Id' header sent by the frontend React app
app.use((req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (userId) {
    req.authenticatedUserId = parseInt(userId, 10);
  }
  next();
});

// ─────────────────────────────────────────────
// Database — connection pool
// ─────────────────────────────────────────────

const pool = mysql.createPool({
  host: 'localhost',
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

// ─────────────────────────────────────────────
// Ownership / IDOR Authorization Middleware
// ─────────────────────────────────────────────

const requireOwnership = (getResourceUserId) =>
  asyncHandler(async (req, res, next) => {
    const callerId = req.authenticatedUserId; 
    if (!callerId) return sendError(res, 401, 'Not authenticated');

    const resourceUserId = await getResourceUserId(req);
    if (resourceUserId === null) return sendError(res, 404, 'Not found');
    if (String(resourceUserId) !== String(callerId)) return sendError(res, 403, 'Forbidden');

    next();
  });

// ─────────────────────────────────────────────
// Auth routes
// ─────────────────────────────────────────────

// INTENTIONAL VULNERABILITY: SQL Injection
app.post('/api/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return sendError(res, 400, 'username and password are required');
  
  // Vulnerable to ' OR '1'='1' -- 
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const [rows] = await pool.query(query);
  
  if (rows.length === 0) return sendError(res, 401, 'Incorrect credentials');
  
  // Return the user object so the React frontend can save it in state
  res.json(rows[0]);
}));

app.post('/api/register', asyncHandler(async (req, res) => {
  const { username, email, password, role, dob } = req.body;
  if (!username || !email || !password || !dob) {
    return sendError(res, 400, 'username, email, password, and dob are required');
  }

  await pool.execute(
    `INSERT INTO users (username, email, password, role, dob, bio)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, email, password, role ?? 'student', dob, 'New user profile.']
  );

  const [newUser] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  res.status(201).json(newUser[0]);
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
    if (isNaN(userId)) return sendError(res, 400, 'userId query param is required');

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

// INTENTIONAL VULNERABILITY: IDOR Check flaw
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
    if (!rows[0]) return sendError(res, 404, 'Not found');
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
  const [rows] = await pool.execute('SELECT * FROM users');
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

app.listen(3000, () => console.log('API running on http://localhost:3000'));