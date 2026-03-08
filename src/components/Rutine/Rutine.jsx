import { useState } from "react"
import exercises from "../../data/exercises.json"
import rutineExercises from "../../data/rutineExercises.json"
import rutines from "../../data/rutines.json"
import workoutSessions from "../../data/workoutSessions.json"
import WorkoutCalendar from "../CalendarWorkout/CalendarWorkout"
import styles from "./Rutine.module.css"

const Rutine = () => {

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calificaciones, setCalificaciones] = useState({})

  const handleCalificacion = (id, calif) => {
    setCalificaciones(prev => ({ ...prev, [id]: calif }))
  }

  const handleVerVideo = (url) => {
    if (url) {
      window.open(url, "_blank")
    }
  }

  // 🔹 Rutina actual
  const rutine = rutines.find(r => r.id === 1)

  const rutineExerciseList = rutineExercises.filter(
    (ex) => ex.rutineId === rutine.id
  )

  // 🔹 Agrupar ejercicios por día
  const days = {}

  rutineExerciseList.forEach((ex) => {

    if (!days[ex.day]) {
      days[ex.day] = []
    }

    const exerciseInfo = exercises.find(
      e => e.id === ex.exerciseId
    )

    days[ex.day].push({
      ...ex,
      exercise: exerciseInfo
    })

  })

  // 🔹 Días de entrenamiento
  const trainingSchedule = {
    1: 1, // lunes -> día 1
    3: 2, // miércoles -> día 2
    5: 3  // viernes -> día 3
  }

  // 🔹 Día seleccionado
  const selectedDay = selectedDate.getDay()

  const rutineDay = trainingSchedule[selectedDay]

  const selectedExercises = rutineDay
    ? days[rutineDay] || []
    : []

  return (
    <>
      <h1>Rutina</h1>

      <h2>{rutine.name}</h2>

      <WorkoutCalendar
        workoutSessions={workoutSessions}
        onDateClick={(date) => setSelectedDate(date)}
      />

      <div style={{ marginTop: "40px" }}>

        <h2>
          Rutina del día {selectedDate.toLocaleDateString()}
        </h2>

        {rutineDay ? (

          <div className={styles.ejercicios}>

            <h3>Día {rutineDay}</h3>

            {selectedExercises.map((ex) => (

              <div
                key={ex.id}
                className={styles.ejercicio}
              >

                <h3>{ex.exercise.name}</h3>

                <p>
                  {ex.sets} sets x {ex.reps}
                </p>

                <p>
                  Descanso: {ex.rest} segundos
                </p>

                <img
                  src={ex.exercise.image}
                  alt={ex.exercise.name}
                  width="150"
                />

                <button
                  onClick={() => handleVerVideo(ex.exercise.videoUrl)}
                >
                  Ver video
                </button>

                <div className={styles.calificacion}>

                  <button
                    className={
                      calificaciones[ex.id] === "bien"
                        ? styles.selected
                        : ""
                    }
                    onClick={() =>
                      handleCalificacion(ex.id, "bien")
                    }
                  >
                    Bien
                  </button>

                  <button
                    className={
                      calificaciones[ex.id] === "masomenos"
                        ? styles.selected
                        : ""
                    }
                    onClick={() =>
                      handleCalificacion(ex.id, "masomenos")
                    }
                  >
                    Más o menos
                  </button>

                  <button
                    className={
                      calificaciones[ex.id] === "mal"
                        ? styles.selected
                        : ""
                    }
                    onClick={() =>
                      handleCalificacion(ex.id, "mal")
                    }
                  >
                    Mal
                  </button>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <p>Hoy es día de descanso</p>

        )}

      </div>

      <div>
        <p>Comentarios</p>
      </div>

    </>
  )
}

export default Rutine