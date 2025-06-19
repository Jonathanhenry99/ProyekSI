module.exports = {
    HOST: "localhost",
    USER: "postgres",     // Change this to your PostgreSQL username
    PASSWORD: "Juliadi1945", // Change this to your PostgreSQL password
    DB: "bank_soal_db",
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
  git add bank-soal-backend/config/db.config.js
