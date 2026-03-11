import { useState } from "react";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {

  e.preventDefault();

  try {

    const response = await fetch("http://localhost:3000/register", {

      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name,
        email,
        password
      })

    });

    const data = await response.json();

    if (response.ok) {

      alert("Usuario registrado correctamente");

      localStorage.setItem("user", JSON.stringify(data));

      window.location.reload(); // recarga la app

    } else {

      alert(data.message || "Error al registrar usuario");

    }

  } catch (error) {

    console.error(error);
    alert("Error en el registro");

  }

};

  return (

    <form onSubmit={handleRegister}>

      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">
        Registrarse
      </button>

    </form>

  );

}

export default Register;