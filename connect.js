const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// SQLite database connection
const db = new sqlite3.Database('users.db');

// Create a users table if it doesn't exist
db.run(`
   CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL
   )
`);

// Serve the HTML file
app.get('/', (req, res) => {
   res.sendFile(__dirname + '/signin signup.html');
});

// Handle user registration
app.post('/register', (req, res) => {
   const { username, email, password } = req.body;

   if (!username || !email || !password) {
      return res.status(400).send('Invalid request format');
   }

   db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err) => {
      if (err) {
         return res.status(500).send('Error registering user');
      }

      res.status(200).send('User registered successfully');
   });
});

// Handle user authentication
app.post('/login', (req, res) => {
   const { username, password } = req.body;

   if (!username || !password) {
      return res.status(400).send('Invalid request format');
   }

   db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
      if (err) {
         return res.status(500).send('Error authenticating user');
      }

      if (row) {
         res.status(200).send('Login successful');
      } else {
         res.status(401).send('Invalid username or password');
      }
   });
});

app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});
