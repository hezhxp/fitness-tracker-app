const express = require("express"); // "Import Express - helps us build the backend server easily"
const cors = require("cors"); // "Import CORS - allows frontend (app) to talk to backend"

const app = express(); // "Create the backend server (our main app)"

app.use(cors()); // "Allow requests from other apps (frontend can connect to backend)"
app.use(express.json()); // "Allow backend to understand JSON data sent from frontend"

app.get("/", (req, res) => { 
  // "When someone visits the homepage '/'"
  res.send("API is running..."); 
  // "Send this response back to the user"
});

const PORT = 5000; 
// "Port = where the server runs (like a door number)"

app.listen(PORT, () => {
  // "Start the server"
  console.log(`Server running on port ${PORT}`); 
  // "Print message to confirm server is running"
});