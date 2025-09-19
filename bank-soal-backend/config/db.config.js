module.exports = {
    HOST: "localhost",
    USER: "postgres",     // Change this to your PostgreSQL username
    PASSWORD: "Juliadi1945", // Change this to your PostgreSQL password
    DB: "bank_soal_db",
    PORT: 5432,
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };