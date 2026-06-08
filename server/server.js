// The actual API routes (/api/login, /api/register)

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'rootpassword', // Ensure this matches your init.sql
  database: 'MyEduConnect_db'
};

// DEBUGGED LOGIN ROUTE
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt for:", username); // Debugging
  
  const connection = await mysql.createConnection(dbConfig);
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  try {
    console.log("Executing Query:", query); // Debugging
    const [rows] = await connection.execute(query);
    await connection.end();
    
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(401).json({ error: 'Incorrect credentials' });
    }
  } catch (err) {
    console.error("SQL Error:", err.message); // Look at your terminal for this!
    res.status(500).json({ error: err.message });
  }
});

// DEBUGGED REGISTRATION ROUTE
app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  const accountUsername = email || username;

  console.log("Registering user:", accountUsername);

  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = `INSERT INTO users (username, password, role, bio) VALUES ('${accountUsername}', '${password}', '${role || 'student'}', 'New user profile.')`;
    
    console.log("Executing Insert:", query);
    await connection.execute(query);
    
    const [newUser] = await connection.execute(`SELECT * FROM users WHERE username = '${accountUsername}'`);
    await connection.end();

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error("Registration Error:", error.message); // Look at your terminal for this!
    res.status(400).json({ error: error.message }); // Send the REAL error, not a guess
  }
});

// VULNERABLE IDOR RECEIPT ROUTE 
app.get('/api/receipts/:id', async (req, res) => {
  const receiptId = req.params.id;
  const connection = await mysql.createConnection(dbConfig);
  
  // VULNERABILITY: Blind query without checking user ownership
  // Uses JOIN to map database columns to the exact fields React expects
  const query = `
    SELECT 
      r.id, 
      r.transaction_date as date, 
      r.amount, 
      c.title as courseTitle, 
      u.username as buyerName, 
      u.email as buyerEmail, 
      'Paid' as status, 
      r.payment_method as paymentMethod, 
      r.account_number as accountNumber
    FROM receipts r
    JOIN users u ON r.user_id = u.id
    JOIN courses c ON r.course_id = c.id
    WHERE r.id = ${receiptId}
  `;
  
  try {
    const [rows] = await connection.execute(query);
    await connection.end();
    res.json(rows[0] || { error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Reference API running on http://localhost:3000'));