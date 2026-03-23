import { useState, useEffect } from "react";
import workoutSessions from "../../data/workoutSessions.json";
import WorkoutCalendar from "../CalendarWorkout/CalendarWorkout";
import styles from "./Rutine.module.css";

const Rutine = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [routineData, setRoutineData] = useState([]);
  const [routineName, setRoutineName] = useState("");
  const [loading, setLoading] = useState(true);

  // --- FETCH BACKEND ---
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/routine/${user?.id}`
        );

        if (response.status === 404) {
          setRoutineData([]);
        } else if (response.ok) {
          const data = await response.json();

          setRoutineData(data.days || []);
          setRoutineName(data.name || "Mi Rutina");
        }
      } catch (error) {
        console.error("Error al traer la rutina:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchRoutine();
  }, [user]);

  // --- INPUT HANDLER ---
  const handleInputChange = (exerciseName, setNumber, field, value) => {
    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseName]: {
        ...prev[exerciseName],
        [setNumber]: {
          ...prev[exerciseName]?.[setNumber],
          [field]: value,
        },
      },
    }));
  };



  const [saving, setSaving] = useState(false);

  const handleSaveWorkout = async () => {
    setSaving(true);

    // 1. Transformar los logs de los inputs en un array plano para la DB
    const exercisesToSave = [];

    // Recorremos los ejercicios del día seleccionado
    selectedDay.exercises.forEach((ex) => {
      const sets = exerciseLogs[ex.name];

      if (sets) {
        // Si el usuario registró sets, los promediamos o sumamos 
        // (Aquí lo más común es guardar el set más pesado o el promedio)
        // Para simplificar y seguir tu estructura de DB, sacamos el promedio:
        const setKeys = Object.keys(sets);
        let totalReps = 0;
        let maxWeight = 0;

        setKeys.forEach(key => {
          totalReps += parseInt(sets[key].reps || 0);
          const w = parseFloat(sets[key].weight || 0);
          if (w > maxWeight) maxWeight = w;
        });

        exercisesToSave.push({
          exercise_name: ex.name,
          series: setKeys.length,
          reps: Math.round(totalReps / setKeys.length) || ex.reps,
          weight_kg: maxWeight || ex.weight
        });
      } else {
        // Si no escribió nada, guardamos lo sugerido
        exercisesToSave.push({
          exercise_name: ex.name,
          series: ex.series,
          reps: ex.reps,
          weight_kg: ex.weight
        });
      }
    });

    try {
      const res = await fetch('http://localhost:3000/routine-completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          exercises: exercisesToSave
        })
      });

      if (res.ok) {
        alert("¡Entrenamiento guardado con éxito! 🔥");
      } else {
        alert("Error al guardar.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  // 🔥 CALCULAR DÍA
  const dayOfWeek = selectedDate.getDay();

  const selectedDay = routineData.find(
    (day) => day.weekDay === dayOfWeek
  );

  if (loading) return <p>Cargando tu entrenamiento...</p>;
  if (!routineData || routineData.length === 0)
    return <p>No tienes una rutina asignada aún.</p>;

  return (
    <>
      <h2>{routineName}</h2>

      <WorkoutCalendar
        workoutSessions={workoutSessions}
        onDateClick={(date) => setSelectedDate(date)}
      />

      {/* 🔝 RUTINA DEL DÍA */}
      <div style={{ marginTop: "40px" }}>
        <h2>
          Rutina del día {selectedDate.toLocaleDateString()}

        </h2>

        <div className={styles.ejercicios}>
          {selectedDay ? (
            <div className={styles.diaContainer}>
              <h3>{selectedDay.name}</h3>

              {selectedDay.exercises.map((ex, index) => (
                <div key={index} className={styles.ejercicio}>
                  <h4>{ex.name}</h4>
                  <p>{ex.series} x {ex.reps}</p>
                  <p>{ex.weight} kg</p>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.descanso}>
              <h3>💤 Día de descanso</h3>
              <p>No hay entrenamiento asignado</p>
            </div>
          )}
        </div>
      </div>

      {/* 🔽 RUTINA GENERAL (SOLO VISUAL) */}
      <div style={{ marginTop: "60px" }}>
        <h2>Rutina completa</h2>

        <div className={styles.ejercicios}>
          {routineData.map((day, dayIndex) => (
            <div key={dayIndex} className={styles.diaContainer}>
              <h3>{day.name}</h3>

              {day.exercises.map((ex, index) => (
                <div key={index} className={styles.ejercicio}>
                  <h4>{ex.name}</h4>

                  <p>
                    {ex.series} sets x {ex.reps} reps
                  </p>

                  <p>{ex.weight} kg</p>

                  {/* ❌ SIN INPUTS ACÁ */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};



export default Rutine;