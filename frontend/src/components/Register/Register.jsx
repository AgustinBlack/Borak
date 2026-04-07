import { useState } from "react";
import styles from "./Register.module.css";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [experience, setExperience] = useState("");

  const [goals, setGoals] = useState([""]);

  // =========================
  // OBJETIVOS
  // =========================
  const handleGoalChange = (index, value) => {
    const updated = [...goals];
    updated[index] = value;
    setGoals(updated);
  };

  const addGoal = () => {
    setGoals([...goals, ""]);
  };

  const removeGoal = (index) => {
    const updated = goals.filter((_, i) => i !== index);
    setGoals(updated);
  };

  // =========================
  // REGISTER
  // =========================
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
          password,
          weight: Number(weight),
          height: Number(height),
          experience,
          goals: goals.filter(g => g.trim() !== "")
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Usuario registrado correctamente 🔥");
        localStorage.setItem("user", JSON.stringify(data));
        window.location.reload();
      } else {
        alert(data.message || "Error al registrar usuario");
      }

    } catch (error) {
      console.error(error);
      alert("Error en el registro");
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerContent}>

          <h2 className={styles.registerTitle}>Crear cuenta</h2>

          <form onSubmit={handleRegister}>

            <div className={styles.formGroup}>
              <label>Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>

            <div className={styles.formRow}>

              <div className={styles.formGroup}>
                <label>Peso (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Altura (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                />
              </div>

            </div>

            <div className={styles.formGroup}>
              <label>Experiencia</label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Contá tu experiencia entrenando..."
              />
            </div>

            {/* OBJETIVOS */}
            <div className={styles.goalsSection}>
              <h3>Objetivos</h3>

              {goals.map((goal, index) => (
                <div className={styles.goalInput} key={index}>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => handleGoalChange(index, e.target.value)}
                    placeholder={`Objetivo ${index + 1}`}
                  />

                  {goals.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeGoal(index)}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className={styles.addGoalBtn}
                onClick={addGoal}
              >
                ➕ Agregar objetivo
              </button>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn}>
                Registrarse
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default Register;