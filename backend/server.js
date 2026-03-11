const express = require("express");
const pool = require("./config/db");

const app = express();

app.use(express.json());

app.get("/users", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.json(users.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error del servidor");
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});