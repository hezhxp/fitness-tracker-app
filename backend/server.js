const express = require("express"); // "Import Express - helps us build the backend server easily"
const cors = require("cors"); // "Import CORS - allows frontend (app) to talk to backend"
const bcrypt = require("bcrypt"); // "Import bcrypt to hash passwords"
const pool = require("./db"); // "Import database connection"

const app = express(); // "Create the backend server (our main app)"

app.use(cors()); // "Allow requests from other apps (frontend can connect to backend)"
app.use(express.json()); // "Allow backend to understand JSON data sent from frontend"

app.get("/", async (req, res) => { 
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows);
  // "Send current database time as response"
});

// "Register route"
app.post("/register", async (req, res) => {
  try {
    // "Get data sent from the user"
    const { name, email, password } = req.body;

    // "Check if all fields were provided"
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    // "Check if email already exists"
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // "Hash the password before saving"
    const hashedPassword = await bcrypt.hash(password, 10);

    // "Insert new user into database"
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name, email, hashedPassword]
    );

    // "Send back the new user data"
    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = 5000; 
// "Port = where the server runs (like a door number)"
app.listen(PORT, () => {
  // "Start the server"
  console.log(`Server running on port ${PORT}`); 
  // "Print message to confirm server is running"
});