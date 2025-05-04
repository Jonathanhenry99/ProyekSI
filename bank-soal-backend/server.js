const express = require("express");
const cors = require("cors");
const db = require("./models");
const Role = db.role;

const app = express();

// Configure CORS
const corsOptions = {
  origin: "http://localhost:5173" // Your React app's URL
};

app.use(cors(corsOptions));

// Parse JSON requests
app.use(express.json());

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Database connection
db.sequelize.sync().then(() => {
  console.log("Database synchronized");
  initial(); // Initialize roles
});

// Simple route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Bank Soal Informatika API." });
});

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

authRoutes(app);
userRoutes(app);

// Set port and start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Initialize roles in the database
function initial() {
  Role.findOrCreate({
    where: { id: 1 },
    defaults: { name: "user" }
  });
 
  Role.findOrCreate({
    where: { id: 2 },
    defaults: { name: "admin" }
  });
}