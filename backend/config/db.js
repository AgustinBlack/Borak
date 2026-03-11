const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "training_borak",
  password: "pacuso2026",
  port: 5432,
});

module.exports = pool;