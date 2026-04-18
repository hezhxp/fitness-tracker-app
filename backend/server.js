const express = require("express"); // "Import Express - helps us build the backend server easily"
const cors = require("cors"); // "Import CORS - allows frontend (app) to talk to backend"
const bcrypt = require("bcrypt"); // "Import bcrypt to hash passwords"
const jwt = require("jsonwebtoken"); // "Import JWT to create login tokens"
const pool = require("./db"); // "Import database connection"
require("dotenv").config(); // "Load environment variables"
const authMiddleware = require("./middleware"); // "Import auth middleware"

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

// "Login route"
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // "Check if email and password were sent"
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // "Find user by email"
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // "If no user found, stop here"
    if (userResult.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const user = userResult.rows[0];

    // "Compare entered password with hashed password in database"
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    // "Create token"
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // "If login is correct, send success response"
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login route error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// "Protected route"
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    // "req.user comes from the decoded JWT token"
    const userId = req.user.userId;

    const userResult = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Protected profile route accessed successfully",
      user: userResult.rows[0],
    });
  } catch (error) {
    console.error("Profile route error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

const PORT = 5000; 
// "Port = where the server runs (like a door number)"
app.listen(PORT, () => {
  // "Start the server"
  console.log(`Server running on port ${PORT}`); 
  // "Print message to confirm server is running"
});