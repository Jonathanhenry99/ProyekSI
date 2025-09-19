const express = require("express");
const cors = require("cors");
const db = require("./models"); // Import your Sequelize setup

const app = express();

// Configure CORS
const corsOptions = {
    origin: "http://localhost:5173" // URL aplikasi React Anda
};

app.use(cors(corsOptions));

// Parse JSON requests
app.use(express.json());

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Database connection
db.sequelize.sync({ alter: true }).then(() => { // Gunakan { alter: true } untuk sinkronisasi model dengan DB (hati-hati di production)
    console.log("Database synchronized");
}).catch(err => {
    console.error("Failed to sync database:", err.message);
});

// Simple route for testing
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Bank Soal Informatika API." });
});

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const courseTagRoutes = require('./routes/courseTag.routes');
const questionSetRoutes = require('./routes/questionSet.routes');
const fileRoutes = require('./routes/file.routes');
const dosenRoutes = require('./routes/dosen.routes'); // <-- Import route dosen baru
const materialRoutes = require('./routes/materialTag.routes'); // <-- Import route dosen baru
const dropdownRoutes = require('./routes/dropdown.routes'); // <-- Import route dropdown baru
const courseMaterialRoutes = require('./routes/courseMaterial.routes');


courseMaterialRoutes(app);
authRoutes(app);
userRoutes(app);
courseTagRoutes(app);
questionSetRoutes(app);
fileRoutes(app);
dosenRoutes(app); // <-- Gunakan route dosen baru
materialRoutes(app)
dropdownRoutes(app)

// Set port and start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});