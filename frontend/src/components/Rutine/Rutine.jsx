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
  const [completedDates, setCompletedDates] = useState([]);
  const [inputKey, setInputKey] = useState(0);

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
      }

      try {
        const sessionsRes = await fetch(`http://localhost:3000/completed-sessions/${user?.id}`);
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setCompletedDates(sessionsData.map(s => s.date.slice(0, 10)));
        }
      } catch (error) {
        console.error("Error al traer sesiones:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchRoutine();
  }, [user]);

  // Estas van DESPUÉS del useEffect, no antes
  const selectedDateStr = selectedDate.toISOString().slice(0, 10);
  const isCompletedToday = completedDates.includes(selectedDateStr);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDay = selectedDate < today;
  const isMissedDay = isPastDay && !!dailyRoutine && !isCompletedToday;

  useEffect(() => {
    const dayOfWeek = selectedDate.getDay();
    const foundDay = routineData.find((day) => Number(day.weekDay) === dayOfWeek);
    setDailyRoutine(foundDay || null);
    setExerciseLogs({});
  }, [selectedDate, routineData]);

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

  const handleSaveWorkout = async () => {
    if (!dailyRoutine) return;
    setSaving(true);

    const hayInputsVacios = dailyRoutine.exercises.some((ex) => {
      for (let serieIndex = 0; serieIndex < ex.series; serieIndex++) {
        const set = exerciseLogs[ex.name]?.[serieIndex];
        if (!set || !set.reps || !set.weight_kg) return true;
      }
      return false;
    });

    if (hayInputsVacios) {
      alert("Completá todos los campos de reps y kg antes de guardar.");
      setSaving(false);
      return;
    }

    const exercisesToSave = [];
    dailyRoutine.exercises.forEach((ex) => {
      const sets = exerciseLogs[ex.name];
      if (sets) {
        const setKeys = Object.keys(sets);
        let totalReps = 0;
        let maxWeight = 0;
        setKeys.forEach((key) => {
          totalReps += parseInt(sets[key].reps || 0);
          const weightToUse = parseFloat(sets[key].weight_kg || ex.weight);
          if (weightToUse > maxWeight) maxWeight = weightToUse;
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          exercises: exercisesToSave,
          date: selectedDate.toISOString()
        })
      });

      if (res.ok) {
        // Calcular puntos del entrenamiento
        await fetch("http://localhost:3000/calculate-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            date: selectedDate.toISOString()
          })
        });

        alert("¡Entrenamiento guardado! 🔥");
        setCompletedDates(prev => [...prev, selectedDateStr]);
        setExerciseLogs({});
        setInputKey(prev => prev + 1);
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
    <div className={styles.rutina}>
      <h1>{routineName}</h1>

      <div className={styles.layout}>

        {/* CALENDARIO */}
        <div className={`${styles.calendario} ${styles.card}`}>
          <WorkoutCalendar
            routineDays={routineData}
            workoutSessions={workoutSessions}
            onDateClick={(date) => setSelectedDate(date)}
            completedDates={completedDates}
          />
        </div>

        {/* ENTRENAMIENTO DEL DÍA */}
        <div className={`${styles.entrenamientoDelDia} ${styles.card}`}>
          <h2>Rutina del día: {selectedDate.toLocaleDateString()}</h2>

          <div className={styles.ejercicios}>
            {dailyRoutine ? (
              <div className={styles.diaContainer}>
                <h3>{dailyRoutine.name}</h3>

                {dailyRoutine.exercises.map((ex, index) => (
                  <div key={`${inputKey}-${index}`} className={styles.ejercicio}>
                    <div className={styles.ejercicioInfo}>
                      <h4>{ex.name}</h4>
                      <p>Objetivo: {ex.series} x {ex.reps} ({ex.weight}kg)</p>
                    </div>

                    <div className={styles.SetRepsContainer}>
                      {Array.from({ length: ex.series }).map((_, serieIndex) => (
                        <div key={serieIndex} className={styles.ejercicioDiv}>
                          <input
                            type="number"
                            placeholder="Reps"
                            className={styles.input}
                            onChange={(e) =>
                              handleInputChange(ex.name, serieIndex, "reps", e.target.value)
                            }
                          />
                          <input
                            type="number"
                            placeholder="Kg"
                            className={styles.input}
                            onChange={(e) =>
                              handleInputChange(ex.name, serieIndex, "weight_kg", e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSaveWorkout}
                  disabled={saving || isCompletedToday || isMissedDay}
                  className={`${styles.saveButton} ${isCompletedToday ? styles.saveButtonDone : ""}`}
                >
                  {isCompletedToday
                    ? "✅ Entrenamiento completado"
                    : isMissedDay
                      ? "❌ Día perdido"
                      : saving
                        ? "Guardando..."
                        : "Finalizar Entrenamiento 🔥"}
                </button>
              </div>
            ) : (
              <div>
                <h3>💤 Día de descanso</h3>
                <p>No hay entrenamiento asignado para hoy.</p>
              </div>
            )}
          </div>
        </div>

        {/* RUTINA COMPLETA */}
        <div className={`${styles.rutinaCompleta} ${styles.card}`}>
          <h2>Rutina completa</h2>

          <div className={styles.ejercicios}>
            {routineData.map((day, dayIndex) => (
              <div className={styles.ejercicioContainer} key={dayIndex}>
                <h3>{day.name}</h3>
                {day.exercises.map((ex, index) => (
                  <div key={index} className={styles.ejercicioMini}>
                    <span>{ex.name}</span>
                    <span>{ex.series} x {ex.reps} - {ex.weight}kg</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Rutine;