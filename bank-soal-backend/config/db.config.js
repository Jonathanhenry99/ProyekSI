module.exports = {
    HOST: "localhost",
    USER: "hayyavevila",     // Change this to your PostgreSQL username
    PASSWORD: "gendisss", // Change this to your PostgreSQL password
    DB: "postgres",
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
  