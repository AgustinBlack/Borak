import { useState } from "react"
import exercises from "../../data/exercises.json"
import rutineExercises from "../../data/rutineExercises.json"
import rutines from "../../data/rutines.json"
import userRutines from "../../data/userRutines.json"
import users from "../../data/users.json"
import workoutExercises from "../../data/workoutExercises.json"
import workoutSessions from "../../data/workoutSessions.json"
import WorkoutCalendar from "../CalendarWorkout/CalendarWorkout"

const Rutine = () => {
    const [query, setQuery] = useState("")
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedExercise, setSelectedExercise] = useState(null)

    const filteredExercises = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(query.toLowerCase())
    )

    
    const rutine = rutines.find(r => r.id === 1)
    
    const rutineExerciseList = rutineExercises.filter((ex) => ex.rutineId === rutine.id)

    const days = {}

    rutineExerciseList.forEach((ex) => {
        if (!days[ex.day]) {
            days[ex.day] = []
        }

        const excerciseInfo =  exercises.find(e => e.id === ex.exerciseId)
        days[ex.day].push({
            ...ex,
            exercise: excerciseInfo})
    })

    console.log(days)

    return (
        <>
            <h1>Rutina</h1>

            {/* <p>Agregar:
                Cuadro que muestre rutina completa por dias.
                <br />
                calendario que muestre que dia de la rutina toca en cada fecha y si esa fecha ya paso que se ponga con color verde si fue a entrenar y rojo si no.
                <br />
                Espacio para que el cliente agregue comentarios sobre la rutina.
                <br />
                Crear un nuevo componente que filtre el dia de la rutina que toca en el dia de la fecha y lo mustre con la opcion para que coplete cuantas series y reps hizo y con cuanto peso. 
                <br />
                Boton para modificar la rutina (solo lo vamos a podes hacer los PF).
                <br />
                Agregar al costado de cada ejercicio de la rutina un boton para que el cliente vea el video del ejercicio en caso de necesitar y aparte tres opciones para elegir bien - masomenos - mal, la idea es que selecciones una de las tres en base a como se sintio haciendo ese ejercicio.
            </p> */}

            <>
            <h1>{rutine.name}</h1>

            <WorkoutCalendar workoutSessions={workoutSessions} />

            {Object.keys(days).map((day) => (
            <div key={day} style={{ marginBottom: "30px" }}>
                
                <h2>Día {day}</h2>

                {days[day].map((ex) => (
                <div key={ex.id} style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "10px"
                }}>

                    <h3>{ex.exercise.name}</h3>

                    <p>
                    {ex.sets} sets x {ex.reps}
                    </p>

                    <p>Descanso: {ex.rest} segundos</p>

                    <img
                    src={ex.exercise.image}
                    alt={ex.exercise.name}
                    width="150"
                    />

                </div>
                ))}

            </div>
            ))}
            </>

            <div style={{ position: "relative", width: "300px" }}>
                <input
                    type="text"
                    placeholder="Buscar ejercicio..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setShowDropdown(true)
                        setSelectedExercise(null)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    style={{
                        width: "100%",
                        padding: "10px",
                        fontSize: "16px",
                    }}
                />

                {showDropdown && (
                    <div
                        style={{
                            position: "absolute",
                            width: "100%",
                            maxHeight: "200px",
                            overflowY: "auto",
                            border: "1px solid #ccc",
                            background: "white",
                            zIndex: 1000,
                        }}
                    >
                        {filteredExercises.length > 0 ? (
                            filteredExercises.map((exercise) => (
                                <div
                                    key={exercise.id}
                                    onClick={() => {
                                        setQuery(exercise.name)
                                        setSelectedExercise(exercise)
                                        setShowDropdown(false)
                                    }}
                                    style={{
                                        padding: "8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    {exercise.name}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: "8px" }}>
                                No se encontraron ejercicios
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 🔥 PREVIEW DEL EJERCICIO */}
            {selectedExercise && (
                <div
                    style={{
                        marginTop: "30px",
                        padding: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        width: "400px"
                    }}
                >
                    <h2>{selectedExercise.name}</h2>

                    <p>
                        <strong>Músculo principal:</strong>{" "}
                        {selectedExercise.primaryMuscle}
                    </p>

                    {selectedExercise.secondaryMuscles.length > 0 && (
                        <p>
                            <strong>Músculos secundarios:</strong>{" "}
                            {selectedExercise.secondaryMuscles.join(", ")}
                        </p>
                    )}

                    <p>
                        <strong>Tipo:</strong> {selectedExercise.type}
                    </p>

                    <p>
                        <strong>Equipamiento:</strong>{" "}
                        {selectedExercise.equipment}
                    </p>

                    <img
                        src={selectedExercise.image}
                        alt={selectedExercise.name}
                        style={{
                            width: "100%",
                            marginTop: "15px",
                            borderRadius: "6px"
                        }}
                    />
                </div>
            )}
        </>
    )
}

export default Rutine