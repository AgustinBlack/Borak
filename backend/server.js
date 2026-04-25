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
      `SELECT u.id, u.name, u.email, u.role, u.status,
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
   REGISTER (ACTUALIZADO 🔥)
================================ */
app.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      weight,
      height,
      experience,
      goals
    } = req.body;

    // 1. Crear usuario
    const newUser = await pool.query(
      `INSERT INTO users 
      (name, email, password, weight, height, experience) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, name, email`,
      [name, email, password, weight, height, experience]
    );

    const user = newUser.rows[0];

    // 2. Guardar objetivos
    if (goals && goals.length > 0) {
      const queries = goals.map(goal =>
        pool.query(
          `INSERT INTO goals (user_id, goal)
           VALUES ($1, $2)`,
          [user.id, goal]
        )
      );

      await Promise.all(queries);
    }

    res.status(201).json({
      ...user,
      goals
    });

  } catch (error) {
    console.error("ERROR REGISTER:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        message: "El email ya está registrado"
      });
    }

    res.status(500).json({
      message: "Error al registrar usuario"
    });
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
    // 1. Usuario
    const userRes = await pool.query(
      `SELECT id, name, email, weight, height, experience
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = userRes.rows[0];

    // 2. Goals
    const goalsRes = await pool.query(
      `SELECT goal FROM goals WHERE user_id = $1`,
      [userId]
    );

    const goals = goalsRes.rows.map(g => g.goal);

    res.json({
      id: user.id,
      nombre: user.name,
      email: user.email,
      peso: user.weight,
      altura: user.height,
      experiencia: user.experience,
      objetivos: goals,
      avatar: `https://ui-avatars.com/api/?name=${user.name}`
    });

  } catch (error) {
    console.error("Error perfil:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

/* ================================
   GUARDAR PROGRESO REAL (Neon)
================================ */
app.post("/routine-completed", async (req, res) => {
  // 1. Recibimos 'date' desde el body
  const { userId, exercises, date } = req.body;

  try {
    const queries = exercises.map((ex) => {
      return pool.query(
        `INSERT INTO workout_logs 
          (user_id, exercise_name, series_done, reps_done, weight_kg, date_completed) 
          VALUES ($1, $2, $3, $4, $5, $6)`, // 2. Agregamos la columna de fecha
        [userId, ex.exercise_name, ex.series, ex.reps, ex.weight_kg, date]
      );
    });

    await Promise.all(queries);
    res.status(200).json({ message: "¡Progreso guardado!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo guardar" });
  }
});

// ENDPOINT PARA LEER (Lo que pedirá Objetives.jsx o Progress.jsx)
app.get('/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT exercise_name, reps_done, weight_kg, date_completed 
       FROM workout_logs 
       WHERE user_id = $1 
       ORDER BY date_completed ASC`,
      [userId]
    );

    const ejerciciosMap = {};

    result.rows.forEach((log) => {
      const nombre = log.exercise_name;
      const fecha = new Date(log.date_completed).toLocaleDateString();

      if (!ejerciciosMap[nombre]) {
        ejerciciosMap[nombre] = { nombre, historico: [], sesionesCrudas: {} };
      }

      // Para el gráfico (agrupado por fecha, peso máximo)
      const hist = ejerciciosMap[nombre].historico;
      const existing = hist.find(h => h.semana === fecha);
      if (!existing) {
        hist.push({ semana: fecha, peso: Number(log.weight_kg), repeticiones: Number(log.reps_done) });
      } else if (Number(log.weight_kg) > existing.peso) {
        existing.peso = Number(log.weight_kg);
        existing.repeticiones = Number(log.reps_done);
      }

      // Para el detalle del último día (todas las series)
      if (!ejerciciosMap[nombre].sesionesCrudas[fecha]) {
        ejerciciosMap[nombre].sesionesCrudas[fecha] = [];
      }
      ejerciciosMap[nombre].sesionesCrudas[fecha].push({
        peso: Number(log.weight_kg),
        repeticiones: Number(log.reps_done)
      });
    });

    // Adjuntamos las series del último día a cada ejercicio
    const respuesta = Object.values(ejerciciosMap).map(ej => ({
      nombre: ej.nombre,
      historico: ej.historico,
      sesionesCrudas: ej.sesionesCrudas   // <-- mandamos todo el objeto
    }));

    res.json(respuesta);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener progresos");
  }
});


/* ================================
UPDATE PROFILE 🔥
================================ */
app.put("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  const {
    nombre,
    email,
    peso,
    altura,
    experiencia,
    objetivos
  } = req.body;

  try {

    // 1. Actualizar usuario
    const updatedUser = await pool.query(
      `UPDATE users
       SET name = $1,
           email = $2,
           weight = $3,
           height = $4,
           experience = $5
       WHERE id = $6
       RETURNING id, name, email, weight, height, experience`,
      [nombre, email, peso, altura, experiencia, userId]
    );

    // 2. Borrar objetivos anteriores
    await pool.query(
      `DELETE FROM goals WHERE user_id = $1`,
      [userId]
    );

    // 3. Insertar nuevos objetivos
    if (objetivos && objetivos.length > 0) {
      const queries = objetivos.map(obj =>
        pool.query(
          `INSERT INTO goals (user_id, goal)
           VALUES ($1, $2)`,
          [userId, obj]
        )
      );

      await Promise.all(queries);
    }

    const user = updatedUser.rows[0];

    // 4. Respuesta final
    res.json({
      id: user.id,
      nombre: user.name,
      email: user.email,
      peso: user.weight,
      altura: user.height,
      experiencia: user.experience,
      objetivos,
      avatar: `https://ui-avatars.com/api/?name=${user.name}`
    });

  } catch (error) {
    console.error("ERROR UPDATE PROFILE:", error);

    res.status(500).json({
      message: "Error al actualizar perfil"
    });
  }
});

app.post('/update-status', async (req, res) => {
  const { userId, status } = req.body; // status será 'approved' o 'rejected'

  try {
    // Validación básica
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    // Ejecutamos el UPDATE en Neon
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING *',
      [status, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: `Usuario ${status} correctamente`, user: result.rows[0] });
  } catch (error) {
    console.error('Error en Neon:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /completed-sessions/:userId
app.get('/completed-sessions/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT DISTINCT date_completed AS date FROM workout_logs WHERE user_id = $1 ORDER BY date_completed DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener sesiones' });
  }
});

/* ================================
   VERIFICACIÓN ESTRUCTURA DB (MIGRACIÓN)
================================ */
const verificarEstructura = async () => {
  try {
    // 1. Crear columna status en users si no existe
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved'
    `);

    // 2. Crear columna created_at en routines si no existe
    await pool.query(`
      ALTER TABLE routines 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    console.log("✅ Base de datos verificada y actualizada.");
  } catch (err) {
    console.error("❌ Error verificando DB:", err.message);
  }
};

verificarEstructura();

/* ================================
   RANKING
================================ */
app.get("/ranking", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, COUNT(DISTINCT DATE(wl.date_completed)) AS entrenamientos
       FROM users u
       LEFT JOIN workout_logs wl ON wl.user_id = u.id
       WHERE u.role = 'user'
       GROUP BY u.id, u.name
       ORDER BY entrenamientos DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener ranking" });
  }
});

/* ================================
   SERVER
================================ */
app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});