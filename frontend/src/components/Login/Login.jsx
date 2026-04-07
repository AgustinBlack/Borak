import { useState } from "react";
import styles from "./Login.module.css";

// Agregamos { onLogin } como prop para poder avisarle a App.jsx que entramos
function Login({ onLogin }) { 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Guardamos en el motor del navegador
        localStorage.setItem("user", JSON.stringify(data));

        // 2. ¡ESTA ES LA LLAVE! Avisamos al estado global de la App
        onLogin(data); 

        alert("¡Bienvenido a BORAK!");
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Inicia sesión</h2>
      <form onSubmit={handleLogin} className={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;