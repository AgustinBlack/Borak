const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

// Middleware para leer JSON
app.use(cors());
app.use(express.json());

/*
================================
ENDPOINT: OBTENER USUARIOS
GET /users
================================
*/
app.get("/users", async (req, res) => {
  try {

    const result = await pool.query("SELECT * FROM users");

    res.json(result.rows);

  } catch (error) {

    console.error(error);
    res.status(500).send("Error del servidor");

  }
});

/*
================================
ENDPOINT: REGISTRAR USUARIO
POST /register
================================
*/
app.post("/register", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, password]
    );

    res.json(newUser.rows[0]);

  } catch (error) {

    console.error(error);
    res.status(500).send("Error al registrar usuario");

  }
});

/*
================================
ENDPOINT: LOGIN
POST /login
================================
*/
app.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);
    res.status(500).send("Error en el login");

  }
});


// Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});