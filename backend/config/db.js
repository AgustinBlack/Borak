const { Pool } = require("pg");
require("dotenv").config();
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error conectando a la nube:', err);
  } else {
    console.log('¡Conectado exitosamente a la base de datos de Neon!');
  }
});

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "training_borak",
//   password: "pacuso2026",
//   port: 5432,
// });

module.exports = pool;