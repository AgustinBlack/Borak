const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

/* ================================
   LOGIN
================================ */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE email = $1 AND password = $2",
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

/* ================================
   USUARIOS
================================ */
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error del servidor");
  }
});

/* ================================
   REGISTER
================================ */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userRole = role || "cliente";

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role`,
      [name, email, password, userRole]
    );

    res.json(newUser.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error al registrar usuario");
  }
});

/* ================================
   OBTENER RUTINA (CORREGIDO 🔥)
================================ */
app.get("/routine/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT * FROM routines
      WHERE user_id = $1
      ORDER BY id DESC
      LIMIT 1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No hay rutina" });
    }

    res.json(result.rows[0]); // 👈 DEVUELVE days

  } catch (error) {
    console.error("ERROR AL OBTENER RUTINA:", error);
    res.status(500).send("Error al obtener la rutina");
  }
});

/* ================================
   ASIGNAR RUTINA (CON DAYS)
================================ */
app.post("/assign-routine", async (req, res) => {
  const { userId, routineName, days } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO routines (user_id, name, days)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [userId, routineName, JSON.stringify(days)]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("ERROR GUARDANDO RUTINA:", err);
    res.status(500).json({ error: "Error al guardar rutina" });
  }
});

/* ================================
   ACTUALIZAR RUTINA 🔥
================================ */
app.put("/update-routine/:userId", async (req, res) => {
  const { userId } = req.params;
  const { exercises } = req.body;

  try {
    await pool.query(
      `
      UPDATE routines
      SET days = $1
      WHERE user_id = $2
      `,
      [JSON.stringify(days), userId]
    );

    res.json({ message: "Rutina actualizada" });

  } catch (err) {
    console.error("ERROR ACTUALIZANDO:", err);
    res.status(500).json({ error: "Error al actualizar rutina" });
  }
});

/* ================================
   PROGRESO (ADAPTADO A JSON 🔥)
================================ */
app.get("/progress/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT days, created_at
      FROM routines
      WHERE user_id = $1
      ORDER BY created_at ASC
      `,
      [userId]
    );

    const ejerciciosMap = {};

    result.rows.forEach((routine) => {
      const days = routine.days || [];

      days.forEach((day) => {
        day.exercises.forEach((ex) => {

          if (!ejerciciosMap[ex.name]) {
            ejerciciosMap[ex.name] = {
              nombre: ex.name,
              historico: []
            };
          }

          ejerciciosMap[ex.name].historico.push({
            semana: `Semana ${ejerciciosMap[ex.name].historico.length + 1}`,
            peso: ex.weight,
            repeticiones: ex.reps,
            fecha: routine.created_at
          });

        });
      });
    });

    res.json(Object.values(ejerciciosMap));

  } catch (error) {
    console.error("Error obteniendo progreso:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

/* ================================
   PERFIL
================================ */
app.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    const profile = {
      id: user.id,
      nombre: user.name,
      email: user.email,
      peso: 75,
      altura: 180,
      objetivos: ["Ganar masa muscular", "Mejorar resistencia"],
      avatar: `https://ui-avatars.com/api/?name=${user.name}`
    };

    res.json(profile);

  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

/* ================================
   SERVER
================================ */
app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});