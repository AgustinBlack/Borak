import { useState, useEffect } from "react"; // Agregamos useEffect
import workoutSessions from "../../data/workoutSessions.json";
import WorkoutCalendar from "../CalendarWorkout/CalendarWorkout";
import styles from "./Rutine.module.css";

const Rutine = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [exerciseLogs, setExerciseLogs] = useState({});
  
  // --- NUEVOS ESTADOS PARA LOS DATOS DE POSTGRES ---
  const [routineData, setRoutineData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- PETICIÓN AL BACKEND ---
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        // Usamos el ID del usuario que viene por props
        const response = await fetch(`http://localhost:3000/routine/${user.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setRoutineData(data);
        }
      } catch (error) {
        console.error("Error al traer la rutina:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchRoutine();
  }, [user]);

  const handleInputChange = (exerciseName, setNumber, field, value) => {
    setExerciseLogs(prev => ({
      ...prev,
      [exerciseName]: {
        ...prev[exerciseName],
        [setNumber]: { ...prev[exerciseName]?.[setNumber], [field]: value }
      }
    }));
  };

  if (loading) return <p>Cargando tu entrenamiento...</p>;
  if (routineData.length === 0) return <p>No tienes una rutina asignada aún.</p>;

  // Nombre de la rutina (tomado del primer ejercicio que devuelve el JOIN)
  const routineName = routineData[0]?.routine_name || "Mi Rutina";

  return (
    <>
      <h2>{routineName}</h2>

      <WorkoutCalendar
        workoutSessions={workoutSessions}
        onDateClick={(date) => setSelectedDate(date)}
      />

      <div style={{ marginTop: "40px" }}>
        <h2>Rutina del día {selectedDate.toLocaleDateString()}</h2>

        <div className={styles.ejercicios}>
          {routineData.map((ex, index) => (
            <div key={index} className={styles.ejercicio}>
              <h3>{ex.exercise_name}</h3>
              <p>Objetivo: {ex.series} sets x {ex.reps} reps</p>
              <p>Peso sugerido: {ex.weight_kg} kg</p>

              <div className={styles.logContainer}>
                <h4>Registrar hoy</h4>
                {[...Array(ex.series)].map((_, i) => {
                  const setNumber = i + 1;
                  return (
                    <div key={setNumber} className={styles.setRow}>
                      <span>Set {setNumber}</span>
                      <input
                        type="number"
                        placeholder="Reps reales"
                        onChange={(e) => handleInputChange(ex.exercise_name, setNumber, "reps", e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Peso usado"
                        onChange={(e) => handleInputChange(ex.exercise_name, setNumber, "weight", e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Rutine;