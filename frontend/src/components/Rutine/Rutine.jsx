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
  const [saving, setSaving] = useState(false);
  const [dailyRoutine, setDailyRoutine] = useState(null);

  // --- 1. FETCH BACKEND ---
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const response = await fetch(`http://localhost:3000/routine/${user?.id}`);

        if (response.status === 404) {
          setRoutineData([]);
        } else if (response.ok) {
          const data = await response.json();
          const days = (data.days || []).map(day => ({
            ...day,
            weekDay: Number(day.weekDay)
          }));
          setRoutineData(days);
          setRoutineName(data.name || "Mi Rutina");
        }
      } catch (error) {
        console.error("Error al traer la rutina:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchRoutine();
  }, [user]); // <-- esta llave cierra el useEffect 1

  // --- 2. EFECTO PARA CALCULAR LA RUTINA DIARIA ---
  useEffect(() => {
    const dayOfWeek = selectedDate.getDay();
    const foundDay = routineData.find((day) => Number(day.weekDay) === dayOfWeek);
    setDailyRoutine(foundDay || null);
    setExerciseLogs({});
  }, [selectedDate, routineData]); // <-- esta llave cierra el useEffect 2

  // --- 3. INPUT HANDLER ---
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

  // --- 4. GUARDAR ENTRENAMIENTO ---
  const handleSaveWorkout = async () => {
    if (!dailyRoutine) return;

    setSaving(true);
    const exercisesToSave = [];

    dailyRoutine.exercises.forEach((ex) => {
      const sets = exerciseLogs[ex.name];

      if (sets) {
        const setKeys = Object.keys(sets);
        let totalReps = 0;
        let maxWeight = 0;

        setKeys.forEach((key) => {
          totalReps += parseInt(sets[key].reps || 0);
          const w = parseFloat(sets[key].weight || 0);
          if (w > maxWeight) maxWeight = w;
        });

        exercisesToSave.push({
          exercise_name: ex.name,
          series: setKeys.length,
          reps: Math.round(totalReps / setKeys.length) || ex.reps,
          weight_kg: maxWeight || ex.weight,
        });
      } else {
        exercisesToSave.push({
          exercise_name: ex.name,
          series: ex.series,
          reps: ex.reps,
          weight_kg: ex.weight,
        });
      }
    });

    try {
      const res = await fetch("http://localhost:3000/routine-completed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          exercises: exercisesToSave,
        }),
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

  if (loading) return <p>Cargando tu entrenamiento...</p>;
  if (!routineData || routineData.length === 0) return <p>No tienes una rutina asignada aún.</p>;

  return (
    <>
      <h2>{routineName}</h2>

      {/* 🔥 CALENDARIO CON DATOS REALES */}
      <WorkoutCalendar
        routineDays={routineData}
        workoutSessions={workoutSessions}
        onDateClick={(date) => setSelectedDate(date)}
      />

      <div style={{ marginTop: "40px" }}>
        <h2>Rutina del día: {selectedDate.toLocaleDateString()}</h2>

        <div className={styles.ejercicios}>
          {dailyRoutine ? (
            <div className={styles.diaContainer}>
              <h3>{dailyRoutine.name}</h3>

              {dailyRoutine.exercises.map((ex, index) => (
                <div key={index} className={styles.ejercicio}>
                  <h4>{ex.name}</h4>
                  <p>Objetivo: {ex.series} series x {ex.reps} reps ({ex.weight}kg)</p>

                  {Array.from({ length: ex.series }).map((_, serieIndex) => (
                    <div key={serieIndex} style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                      <span>Set {serieIndex + 1}:</span>
                      <input
                        type="number"
                        placeholder="Reps"
                        style={{ width: '60px' }}
                        onChange={(e) => handleInputChange(ex.name, serieIndex, "reps", e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Kg"
                        style={{ width: '60px' }}
                        onChange={(e) => handleInputChange(ex.name, serieIndex, "weight", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              ))}

              <button
                onClick={handleSaveWorkout}
                disabled={saving}
                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
              >
                {saving ? "Guardando..." : "Finalizar Entrenamiento 🔥"}
              </button>
            </div>
          ) : (
            <div className={styles.descanso}>
              <h3>💤 Día de descanso</h3>
              <p>No hay entrenamiento asignado para hoy. ¡A recuperar energías!</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "60px" }}>
        <h2>Rutina completa</h2>

        <div className={styles.ejercicios}>
          {routineData.map((day, dayIndex) => (
            <div key={dayIndex} className={styles.diaContainer}>
              <h3>{day.name}</h3>

              {day.exercises.map((ex, index) => (
                <div key={index} className={styles.ejercicio}>
                  <h4>{ex.name}</h4>
                  <p>{ex.series} sets x {ex.reps} reps</p>
                  <p>{ex.weight} kg</p>
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