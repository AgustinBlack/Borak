import { useState } from "react"
import exercises from "../../data/exercises.json"
import rutineExercises from "../../data/rutineExercises.json"
import rutines from "../../data/rutines.json"
import workoutSessions from "../../data/workoutSessions.json"
import WorkoutCalendar from "../CalendarWorkout/CalendarWorkout"
import styles from "./Rutine.module.css"

const Rutine = ({ user }) => {

  const [selectedDate, setSelectedDate] = useState(new Date())

  const [exerciseLogs, setExerciseLogs] = useState({})

  const handleInputChange = (exerciseId, setNumber, field, value) => {

    setExerciseLogs(prev => {

      const updated = { ...prev }

      if (!updated[exerciseId]) {
        updated[exerciseId] = {}
      }

      if (!updated[exerciseId][setNumber]) {
        updated[exerciseId][setNumber] = {}
      }

      updated[exerciseId][setNumber][field] = value

      return updated

    })

  }

  const handleVerVideo = (url) => {
    if (url) window.open(url, "_blank")
  }

  // Rutina del usuario
  const rutine = rutines.find(r => r.id === 1)

  const rutineExerciseList = rutineExercises.filter(
    (ex) => ex.rutineId === rutine.id
  )

  // Agrupar por día
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

  const trainingSchedule = {
    1: 1,
    3: 2,
    5: 3
  }

  const selectedDay = selectedDate.getDay()

  const rutineDay = trainingSchedule[selectedDay]

  const selectedExercises = rutineDay
    ? days[rutineDay] || []
    : []

  return (

    <>

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
                  onClick={() =>
                    handleVerVideo(ex.exercise.videoUrl)
                  }
                >
                  Ver video
                </button>

                {/* INPUTS PARA REGISTRAR ENTRENAMIENTO */}

                <div className={styles.logContainer}>

                  <h4>Registrar entrenamiento</h4>

                  {[...Array(ex.sets)].map((_, index) => {

                    const setNumber = index + 1

                    return (

                      <div
                        key={setNumber}
                        className={styles.setRow}
                      >

                        <span>Set {setNumber}</span>

                        <input
                          type="number"
                          placeholder="Reps"
                          onChange={(e) =>
                            handleInputChange(
                              ex.id,
                              setNumber,
                              "reps",
                              e.target.value
                            )
                          }
                        />

                        <input
                          type="number"
                          placeholder="Peso (kg)"
                          onChange={(e) =>
                            handleInputChange(
                              ex.id,
                              setNumber,
                              "weight",
                              e.target.value
                            )
                          }
                        />

                      </div>

                    )

                  })}

                </div>

              </div>

            ))}

          </div>

        ) : (

          <p>Hoy es día de descanso</p>

        )}

      </div>

    </>
  )
}

export default Rutine