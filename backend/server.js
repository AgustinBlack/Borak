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

app.get("/users-with-routines", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role,
        (SELECT name FROM routines r WHERE r.user_id = u.id ORDER BY created_at DESC LIMIT 1) AS current_routine
       FROM users u
       WHERE u.role = 'user'`
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
   OBTENER RUTINA COMPLETA (Actualizado)
================================ */
app.get("/routine/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const routineRes = await pool.query(
      `SELECT * FROM routines WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    if (routineRes.rows.length === 0) {
      return res.status(404).json({ message: "No hay rutina" });
    }

    const routine = routineRes.rows[0];

    const daysRes = await pool.query(
      `SELECT * FROM routine_days WHERE routine_id = $1`,
      [routine.id]
    );

    const days = [];

    for (const day of daysRes.rows) {
      const exRes = await pool.query(
        `SELECT * FROM routine_exercises WHERE day_id = $1`,
        [day.id]
      );

      days.push({
        name: day.name,
        weekDay: day.week_day, // <--- Asegúrate de que esta columna exista en tu DB
        exercises: exRes.rows.map(ex => ({
          name: ex.exercise_name,
          series: ex.series,
          reps: ex.reps,
          weight: ex.weight_kg
        }))
      });
    }

    res.json({
      ...routine,

      days
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener rutina" });
  }
});

/* ================================
   ASIGNAR RUTINA (CON DAYS)
================================ */
app.post("/assign-routine", async (req, res) => {
  try {
    const { userId, routineName, days } = req.body;

    // 1. Crear rutina
    const routineResult = await pool.query(
      `INSERT INTO routines (user_id, name)
       VALUES ($1, $2)
       RETURNING id`,
      [userId, routineName]
    );

    const routineId = routineResult.rows[0].id;

    // 2. Crear días y ejercicios
    for (const day of days) {

     // Dentro del bucle de days:
const dayResult = await pool.query(
  `INSERT INTO routine_days (routine_id, name, week_day) -- Agregamos week_day
   VALUES ($1, $2, $3)
   RETURNING id`,
  [routineId, day.name, day.weekDay] // Usamos el valor que viene del AdminProfiles.jsx
);

      const dayId = dayResult.rows[0].id;

      for (const ex of day.exercises) {
        await pool.query(
          `INSERT INTO routine_exercises 
           (routine_id, exercise_name, series, reps, weight_kg, day_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            routineId,
            ex.name,
            ex.series,
            ex.reps,
            ex.weight,
            dayId
          ]
        );
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error("ERROR REAL:", error);
    res.status(500).json({ error: "Error al asignar rutina" });
  }
});


/* ================================
   ACTUALIZAR RUTINA 🔥
================================ */
app.put("/update-routine/:userId", async (req, res) => {
  const { userId } = req.params;
  const { routineName, days } = req.body;

  try {
    const routineRes = await pool.query(
      `SELECT id FROM routines
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (routineRes.rows.length === 0) {
      return res.status(404).json({ error: "No se encontró rutina para actualizar" });
    }

    const routineId = routineRes.rows[0].id;

    if (routineName) {
      await pool.query(
        `UPDATE routines SET name = $1 WHERE id = $2`,
        [routineName, routineId]
      );
    }

    await pool.query(`DELETE FROM routine_exercises WHERE routine_id = $1`, [routineId]);
    await pool.query(`DELETE FROM routine_days WHERE routine_id = $1`, [routineId]);


    for (const day of days) {
      const dayResult = await pool.query(
        `INSERT INTO routine_days (routine_id, name, week_day)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [routineId, day.name, day.weekDay]
      );

      const dayId = dayResult.rows[0].id;

      for (const ex of day.exercises) {
        await pool.query(
          `INSERT INTO routine_exercises 
           (routine_id, day_id, exercise_name, series, reps, weight_kg)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [routineId, dayId, ex.name, ex.series, ex.reps, ex.weight]
        );
      }
    }

    res.json({ message: "Rutina actualizada" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
   GUARDAR PROGRESO REAL (Neon)
================================ */
app.post("/routine-completed", async (req, res) => {
  const { userId, exercises } = req.body; // 'exercises' es el array que enviamos desde el Front

  try {
    // Usamos una transacción o un loop para insertar cada ejercicio
    const queries = exercises.map((ex) => {
      return pool.query(
        `INSERT INTO workout_logs 
         (user_id, exercise_name, series_done, reps_done, weight_kg) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, ex.exercise_name, ex.series, ex.reps, ex.weight_kg]
      );
    });

    await Promise.all(queries);
    res.status(200).json({ message: "¡Progreso guardado en Neon correctamente!" });

  } catch (err) {
    console.error("ERROR AL GUARDAR EN WORKOUT_LOGS:", err);
    res.status(500).json({ error: "No se pudo guardar el progreso" });
  }
});



// ENDPOINT PARA LEER (Lo que pedirá Objetives.jsx o Progress.jsx)
app.get('/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
        const result = await pool.query(
          'SELECT exercise_name, reps_done, weight_kg, date_completed FROM workout_logs WHERE user_id = $1 ORDER BY date_completed ASC',
          [userId]
        );

        // Agrupamos los datos por nombre de ejercicio
        const ejerciciosMap = {};

        result.rows.forEach((log) => {
          const nombre = log.exercise_name;

          if (!ejerciciosMap[nombre]) {
            ejerciciosMap[nombre] = {
              nombre: nombre,
              historico: []
            };
          }

          ejerciciosMap[nombre].historico.push({
            semana: new Date(log.date_completed).toLocaleDateString(), // Usamos la fecha como etiqueta
            peso: log.weight_kg,
            repeticiones: log.reps_done
          });
        });

        res.json(Object.values(ejerciciosMap));
      } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener progresos");
      }
    });


    /* ================================
       SERVER
    ================================ */
    app.listen(3000, () => {
      console.log("Servidor corriendo en puerto 3000"); 
    });