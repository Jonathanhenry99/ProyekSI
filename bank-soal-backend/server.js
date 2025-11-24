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

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const courseTagRoutes = require('./routes/courseTag.routes');
const questionSetRoutes = require('./routes/questionSet.routes');
const fileRoutes = require('./routes/file.routes');
const dosenRoutes = require('./routes/dosen.routes');
const materialRoutes = require('./routes/materialTag.routes');
const dropdownRoutes = require('./routes/dropdown.routes');
const courseMaterialRoutes = require('./routes/courseMaterial.routes');
const questionPackageRoutes = require('./routes/questionPackage.routes');

// Use routes
courseMaterialRoutes(app);
authRoutes(app);
userRoutes(app);
courseTagRoutes(app);
questionSetRoutes(app);
fileRoutes(app);
dosenRoutes(app);
materialRoutes(app);
dropdownRoutes(app);
questionPackageRoutes(app);

// Database connection and server start (FIXED - only once!)
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log("✅ Database synchronized successfully");
    
    // Start server ONLY after DB sync is successful
    const PORT = process.env.PORT || 8080; // CHANGED FROM 8081 to 8080
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
 
    });
  })
  .catch(err => {
    console.error("❌ Failed to sync database:", err);
    process.exit(1); // Exit if database sync fails
  });