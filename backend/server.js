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
      "SELECT id, name, email, age, weight, height, goal, activity_level, created_at FROM users WHERE id = $1",
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

// "Update profile route"
app.put("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { age, weight, height, goal, activity_level } = req.body;

    const updatedUser = await pool.query(
      `UPDATE users
       SET age = $1,
           weight = $2,
           height = $3,
           goal = $4,
           activity_level = $5
       WHERE id = $6
       RETURNING id, name, email, age, weight, height, goal, activity_level, created_at`,
      [age, weight, height, goal, activity_level, userId]
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// "Create routine route"
app.post("/routines", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Routine name is required" });
    }

    const newRoutine = await pool.query(
      "INSERT INTO routines (user_id, name) VALUES ($1, $2) RETURNING *",
      [userId, name]
    );

    res.status(201).json({
      message: "Routine created successfully",
      routine: newRoutine.rows[0],
    });
  } catch (error) {
    console.error("Create routine error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// "Get all routines for logged in user"
app.get("/routines", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const routines = await pool.query(
      "SELECT * FROM routines WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.status(200).json({
      routines: routines.rows,
    });
  } catch (error) {
    console.error("Get routines error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// "Add exercise to routine route"
app.post("/routines/:id/exercises", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const routineId = req.params.id;
    const { name, exercise_order } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Exercise name is required" });
    }

    const routineCheck = await pool.query(
      "SELECT * FROM routines WHERE id = $1 AND user_id = $2",
      [routineId, userId]
    );

    if (routineCheck.rows.length === 0) {
      return res.status(404).json({ message: "Routine not found" });
    }

    const newExercise = await pool.query(
      "INSERT INTO routine_exercises (routine_id, name, exercise_order) VALUES ($1, $2, $3) RETURNING *",
      [routineId, name, exercise_order || 1]
    );

    res.status(201).json({
      message: "Exercise added successfully",
      exercise: newExercise.rows[0],
    });
  } catch (error) {
    console.error("Add exercise error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// "Get exercises for a routine route"
app.get("/routines/:id/exercises", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const routineId = req.params.id;

    const routineCheck = await pool.query(
      "SELECT * FROM routines WHERE id = $1 AND user_id = $2",
      [routineId, userId]
    );

    if (routineCheck.rows.length === 0) {
      return res.status(404).json({ message: "Routine not found" });
    }

    const exercises = await pool.query(
      "SELECT * FROM routine_exercises WHERE routine_id = $1 ORDER BY exercise_order ASC",
      [routineId]
    );

    res.status(200).json({
      exercises: exercises.rows,
    });
  } catch (error) {
    console.error("Get exercises error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// "Get all exercises from library route"
app.get("/exercises", authMiddleware, async (req, res) => {
  try {
    const exercises = await pool.query(
      "SELECT * FROM exercise_library ORDER BY name ASC"
    );
    res.status(200).json({ exercises: exercises.rows });
  } catch (error) {
    console.error("Get exercises error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/routine-exercises/:exerciseId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { exerciseId } = req.params;

    const exerciseCheck = await pool.query(
      `SELECT routine_exercises.*
       FROM routine_exercises
       JOIN routines ON routine_exercises.routine_id = routines.id
       WHERE routine_exercises.id = $1 AND routines.user_id = $2`,
      [exerciseId, userId]
    );

    if (exerciseCheck.rows.length === 0) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    await pool.query("DELETE FROM routine_exercises WHERE id = $1", [exerciseId]);

    res.status(200).json({ message: "Exercise deleted successfully" });
  } catch (error) {
    console.error("Delete exercise error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/workout-sessions/finish", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { routineId, duration_seconds, sets } = req.body;

    if (!routineId || !sets || sets.length === 0) {
      return res.status(400).json({ message: "Missing workout data" });
    }

    const session = await pool.query(
      `INSERT INTO workout_sessions (user_id, routine_id, ended_at, duration_seconds)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
       RETURNING *`,
      [userId, routineId, duration_seconds]
    );

    const sessionId = session.rows[0].id;

    for (const set of sets) {
      await pool.query(
        `INSERT INTO workout_session_sets
         (workout_session_id, routine_exercise_id, set_number, weight, reps, is_completed)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          sessionId,
          set.routineExerciseId,
          set.setNumber,
          set.weight || null,
          set.reps || null,
          true,
        ]
      );
    }

    res.status(201).json({
      message: "Workout saved successfully",
      session: session.rows[0],
    });
  } catch (error) {
    console.error("Finish workout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const PORT = 5000; 
// "Port = where the server runs (like a door number)"
app.listen(PORT, () => {
  // "Start the server"
  console.log(`Server running on port ${PORT}`); 
  // "Print message to confirm server is running"
});