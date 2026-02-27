const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// BUG #1: Wrong default password - doesn't match docker-compose!
const pool = new Pool({
   user: process.env.DB_USER || 'dev_user',
   host: process.env.DB_HOST || 'localhost',
   database: process.env.DB_NAME || 'tododb',
   password: process.env.DB_PASSWORD || 'dev_password',
   port: process.env.DB_PORT || 5432,
});

// console.log("=== DEBUG ENVIRONMENT VARIABLES ===");
// console.log(process.env);
// console.log("====================================");

app.get('/health', (req, res) => {
   res.json({ status: 'healthy', version: '1.0.0' });
});

// GET todos
app.get('/api/todos', async (req, res) => {
   try {
      const result = await pool.query('SELECT * FROM todos ORDER BY id');
      res.json(result.rows);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// BUG #2: Missing validation - will cause test to fail!
// STUDENT TODO: Add validation to reject empty title
app.post('/api/todos', async (req, res) => {
   try {
      const { title, completed = false } = req.body;

      // STUDENT FIX: Add validation here!
      // Hint: Check if title is empty or undefined
      // Return 400 status with error message if invalid
      if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Title is required" });
      }

      const result = await pool.query(
         'INSERT INTO todos(title, completed) VALUES($1, $2) RETURNING *',
         [title, completed]
      );
      res.status(201).json(result.rows[0]);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// BUG #3: Missing DELETE endpoint - but test expects it!
// STUDENT TODO: Implement DELETE /api/todos/:id endpoint
// app.delete('/api/todos/:id', async (req, res) => {
   try {
      const { id } = req.params;
      await pool.query('DELETE FROM todos WHERE id = $1', [id]);
      res.status(200).json({ message: "Deleted successfully" });
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// BUG #4: Missing PUT endpoint for updating todos
// STUDENT TODO: Implement PUT /api/todos/:id endpoint
app.put('/api/todos/:id', async (req, res) => {
   try {
      const { id } = req.params;
      const { title, completed } = req.body;
      
      // Cập nhật Database và dùng RETURNING * để lấy dữ liệu mới nhất trả về cho test
      const result = await pool.query(
         'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
         [title, completed, id]
      );

      if (result.rows.length === 0) {
         return res.status(404).json({ error: "Todo not found" });
      }

      res.status(200).json(result.rows[0]);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

async function initDatabase() {
   try {
      await pool.query(`
         CREATE TABLE IF NOT EXISTS todos (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            completed BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         );
      `);
      console.log("Database initialized");
   } catch (err) {
      console.error("Database initialization failed:", err);
   }
}

const PORT = process.env.PORT || 8080;

// BUG #5: Server starts even in test mode, causing port conflicts
// STUDENT FIX: Only start server if NOT in test mode
async function startServer() {
   try {
      await initDatabase();

      if (process.env.NODE_ENV !== 'test') {
         app.listen(PORT, () => {
            console.log(`Backend running on port ${PORT}`);
         });
      }
   } catch (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
   }
}

if (process.env.NODE_ENV !== 'test') {
   startServer();
}
// BUG #6: App not exported - tests can't import it!
// STUDENT FIX: Export the app module
module.exports = app;