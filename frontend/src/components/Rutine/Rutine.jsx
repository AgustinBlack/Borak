// import { useState, useEffect } from "react";
// import workoutSessions from "../../data/workoutSessions.json";
// import WorkoutCalendar from "../CalendarWorkout/CalendarWorkout";
// import styles from "./Rutine.module.css";

// const Rutine = ({ user }) => {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [exerciseLogs, setExerciseLogs] = useState({});
//   const [routineData, setRoutineData] = useState([]); // 👈 ahora son DAYS
//   const [routineName, setRoutineName] = useState("");
//   const [loading, setLoading] = useState(true);

//   // --- FETCH BACKEND ---
//   useEffect(() => {
//     const fetchRoutine = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:3000/routine/${user?.id}`
//         );

//         if (response.status === 404) {
//           setRoutineData([]);
//         } else if (response.ok) {
//           const data = await response.json();

//           // 🔥 IMPORTANTE
//           setRoutineData(data.days || []);
//           setRoutineName(data.name || "Mi Rutina");
//         }
//       } catch (error) {
//         console.error("Error al traer la rutina:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user?.id) fetchRoutine();
//   }, [user]);

//   // --- INPUT HANDLER ---
//   const handleInputChange = (exerciseName, setNumber, field, value) => {
//     setExerciseLogs((prev) => ({
//       ...prev,
//       [exerciseName]: {
//         ...prev[exerciseName],
//         [setNumber]: {
//           ...prev[exerciseName]?.[setNumber],
//           [field]: value,
//         },
//       },
//     }));
//   };

//   if (loading) return <p>Cargando tu entrenamiento...</p>;
//   if (!routineData || routineData.length === 0)
//     return <p>No tienes una rutina asignada aún.</p>;

//   return (
//     <>
//       <h2>{routineName}</h2>

//       <WorkoutCalendar
//         workoutSessions={workoutSessions}
//         onDateClick={(date) => setSelectedDate(date)}
//       />

//       <div style={{ marginTop: "40px" }}>
//         <h2>Rutina del día {selectedDate.toLocaleDateString()}</h2>

//         <div className={styles.ejercicios}>
//           {/* 🔥 AHORA RECORREMOS DÍAS */}
//           {routineData.map((day, dayIndex) => (
//             <div key={dayIndex} className={styles.diaContainer}>
//               <h3>{day.name}</h3>

//               {/* 🔥 EJERCICIOS DEL DÍA */}
//               {day.exercises.map((ex, index) => (
//                 <div key={index} className={styles.ejercicio}>
//                   <h4>{ex.name}</h4>
//                   <p>
//                     Objetivo: {ex.series} sets x {ex.reps} reps
//                   </p>
//                   <p>Peso sugerido: {ex.weight} kg</p>

//                   <div className={styles.logContainer}>
//                     <h4>Registrar hoy</h4>

//                     {[...Array(ex.series)].map((_, i) => {
//                       const setNumber = i + 1;

//                       return (
//                         <div key={setNumber} className={styles.setRow}>
//                           <span>Set {setNumber}</span>

//                           <input
//                             type="number"
//                             placeholder="Reps reales"
//                             onChange={(e) =>
//                               handleInputChange(
//                                 ex.name,
//                                 setNumber,
//                                 "reps",
//                                 e.target.value
//                               )
//                             }
//                           />

//                           <input
//                             type="number"
//                             placeholder="Peso usado"
//                             onChange={(e) =>
//                               handleInputChange(
//                                 ex.name,
//                                 setNumber,
//                                 "weight",
//                                 e.target.value
//                               )
//                             }
//                           />
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Rutine;







// import { useState, useEffect } from "react";
// import workoutSessions from "../../data/workoutSessions.json";
// import WorkoutCalendar from "../CalendarWorkout/CalendarWorkout";
// import styles from "./Rutine.module.css";

// const Rutine = ({ user }) => {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [exerciseLogs, setExerciseLogs] = useState({});
//   const [routineData, setRoutineData] = useState([]);
//   const [routineName, setRoutineName] = useState("");
//   const [loading, setLoading] = useState(true);

//   // --- FETCH BACKEND ---
//   useEffect(() => {
//     const fetchRoutine = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:3000/routine/${user?.id}`
//         );

//         if (response.status === 404) {
//           setRoutineData([]);
//         } else if (response.ok) {
//           const data = await response.json();

//           setRoutineData(data.days || []);
//           setRoutineName(data.name || "Mi Rutina");
//         }
//       } catch (error) {
//         console.error("Error al traer la rutina:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user?.id) fetchRoutine();
//   }, [user]);

//   // --- INPUT HANDLER ---
//   const handleInputChange = (exerciseName, setNumber, field, value) => {
//     setExerciseLogs((prev) => ({
//       ...prev,
//       [exerciseName]: {
//         ...prev[exerciseName],
//         [setNumber]: {
//           ...prev[exerciseName]?.[setNumber],
//           [field]: value,
//         },
//       },
//     }));
//   };

//   // 🔥 CALCULAR DÍA SEGÚN FECHA
//   const selectedDayIndex =
//     routineData.length > 0
//       ? selectedDate.getDate() % routineData.length
//       : 0;

//   const selectedDay = routineData[selectedDayIndex];

//   if (loading) return <p>Cargando tu entrenamiento...</p>;
//   if (!routineData || routineData.length === 0)
//     return <p>No tienes una rutina asignada aún.</p>;

//   return (
//     <>
//       <h2>{routineName}</h2>

//       <WorkoutCalendar
//         workoutSessions={workoutSessions}
//         onDateClick={(date) => setSelectedDate(date)}
//       />

//       <div style={{ marginTop: "40px" }}>
//         <h2>
//           Rutina del día {selectedDate.toLocaleDateString()}
//         </h2>

//         <div className={styles.ejercicios}>
//           {/* 🔥 SOLO EL DÍA SELECCIONADO */}
//           {selectedDay && (
//             <div className={styles.diaContainer}>
//               <h3>{selectedDay.name}</h3>

//               {selectedDay.exercises.map((ex, index) => (
//                 <div key={index} className={styles.ejercicio}>
//                   <h4>{ex.name}</h4>

//                   <p>
//                     Objetivo: {ex.series} sets x {ex.reps} reps
//                   </p>

//                   <p>Peso sugerido: {ex.weight} kg</p>

//                   <div className={styles.logContainer}>
//                     <h4>Registrar hoy</h4>

//                     {[...Array(ex.series)].map((_, i) => {
//                       const setNumber = i + 1;

//                       return (
//                         <div
//                           key={setNumber}
//                           className={styles.setRow}
//                         >
//                           <span>Set {setNumber}</span>

//                           <input
//                             type="number"
//                             placeholder="Reps reales"
//                             onChange={(e) =>
//                               handleInputChange(
//                                 ex.name,
//                                 setNumber,
//                                 "reps",
//                                 e.target.value
//                               )
//                             }
//                           />

//                           <input
//                             type="number"
//                             placeholder="Peso usado"
//                             onChange={(e) =>
//                               handleInputChange(
//                                 ex.name,
//                                 setNumber,
//                                 "weight",
//                                 e.target.value
//                               )
//                             }
//                           />
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Rutine;

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

  // 🔥 CALCULAR DÍA
  const selectedDayIndex =
    routineData.length > 0
      ? selectedDate.getDate() % routineData.length
      : 0;

  const selectedDay = routineData[selectedDayIndex];

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
          {selectedDay && (
            <div className={styles.diaContainer}>
              <h3>{selectedDay.name}</h3>

              {selectedDay.exercises.map((ex, index) => (
                <div key={index} className={styles.ejercicio}>
                  <h4>{ex.name}</h4>

                  <p>
                    Objetivo: {ex.series} x {ex.reps}
                  </p>

                  <p>Peso sugerido: {ex.weight} kg</p>

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
                            onChange={(e) =>
                              handleInputChange(
                                ex.name,
                                setNumber,
                                "reps",
                                e.target.value
                              )
                            }
                          />

                          <input
                            type="number"
                            placeholder="Peso usado"
                            onChange={(e) =>
                              handleInputChange(
                                ex.name,
                                setNumber,
                                "weight",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
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