const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

/* ================================
   ENDPOINT: LOGIN 
   ================================ */
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

    // Devolvemos el usuario completo (incluyendo el ID y el ROLE para el Admin)
    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el login");
  }
});

/* ================================
   ENDPOINT: OBTENER USUARIOS
   ================================ */
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error del servidor");
  }
});

/* ================================
   ENDPOINT: REGISTRAR USUARIO
   ================================ */
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

/* ================================
   ENDPOINT: OBTENER RUTINA
   ================================ */
app.get("/routine/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT r.name AS routine_name, e.exercise_name, e.series, e.reps, e.weight_kg 
       FROM routines r 
       JOIN routine_exercises e ON r.id = e.routine_id 
       WHERE r.user_id = $1`, 
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No se encontró rutina" });
    }
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener la rutina");
  }
});

/* ================================
   ENDPOINT: ASIGNAR RUTINA (PROFE)
   ================================ */
app.post("/assign-routine", async (req, res) => {
  const { userId, routineName, exercises } = req.body;
  try {
    const routineResult = await pool.query(
      "INSERT INTO routines (user_id, name) VALUES ($1, $2) RETURNING id",
      [userId, routineName]
    );
    const routineId = routineResult.rows[0].id;

    for (const ex of exercises) {
      await pool.query(
        "INSERT INTO routine_exercises (routine_id, exercise_name, series, reps, weight_kg) VALUES ($1, $2, $3, $4, $5)",
        [routineId, ex.name, ex.series, ex.reps, ex.weight]
      );
    }
    res.json({ message: "Rutina asignada con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al asignar rutina");
  }
});

// SIEMPRE AL FINAL: Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});

