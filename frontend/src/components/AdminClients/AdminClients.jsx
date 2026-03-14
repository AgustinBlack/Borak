import { useState, useEffect } from "react";
import styles from "./AdminClients.module.css";

const ejerciciosDB = [
    { id: 1, name: "Press de Banca", muscle: "Pecho" },
    { id: 2, name: "Sentadilla Libre", muscle: "Piernas" },
    { id: 3, name: "Peso Muerto", muscle: "Espalda/Piernas" },
    { id: 4, name: "Dominadas", muscle: "Espalda" },
    { id: 5, name: "Curl de Bíceps", muscle: "Brazos" },
    { id: 6, name: "Press Militar", muscle: "Hombros" }
];

// 1. RECIBIMOS 'user' COMO PROP (Esto arregla tu ReferenceError)
const AdminClients = ({ user }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [usersData, setUsersData] = useState([]); // Ahora empieza vacío
    const [loading, setLoading] = useState(true);

    const [selectedUser, setSelectedUser] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [targetClient, setTargetClient] = useState("");
    const [newRutineName, setNewRutineName] = useState("");
    const [routineExercises, setRoutineExercises] = useState([]);

    const [selectedExercise, setSelectedExercise] = useState("");
    const [series, setSeries] = useState("");
    const [reps, setReps] = useState("");
    const [weight, setWeight] = useState("");

    // 2. CARGAR CLIENTES REALES DE LA DB
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:3000/users");
                const data = await response.json();
                // Filtramos para ver solo clientes, no a otros profes
                setUsersData(data.filter(u => u.role === 'user'));
                setLoading(false);
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = usersData.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addExerciseToList = () => {
        if (!selectedExercise || !series || !reps || !weight) {
            alert("Completa todos los campos del ejercicio.");
            return;
        }
        const exerciseDetails = ejerciciosDB.find(e => e.id === parseInt(selectedExercise));
        const newExercise = {
            id: Date.now(),
            name: exerciseDetails.name,
            series: parseInt(series),
            reps: parseInt(reps),
            weight: parseFloat(weight)
        };
        setRoutineExercises([...routineExercises, newExercise]);
        setSelectedExercise(""); setSeries(""); setReps(""); setWeight("");
    };

    // 3. FUNCIÓN PARA GUARDAR EN POSTGRESQL (Conectada al servidor)
    const handleSaveCustomRoutine = async () => {
        if (!targetClient || !newRutineName || routineExercises.length === 0) {
            alert("Falta información clave.");
            return;
        }

        console.log({
            userId: targetClient,
            routineName: newRutineName,
            exercises: routineExercises
        })

        try {
            const response = await fetch("http://localhost:3000/assign-routine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: targetClient,
                    routineName: newRutineName,
                    exercises: routineExercises // Mandamos el array que armaste
                }),
            });

            if (response.ok) {
                alert("¡Rutina guardada en la base de datos con éxito!");
                setShowCreateModal(false);
                setRoutineExercises([]);
                setNewRutineName("");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al conectar con el servidor.");
        }
    };

    if (user?.role !== 'pf') {
        return <p className={styles.errorMsg}>No tienes permiso para acceder. Solo nivel Profe.</p>;
    }

    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <h1>Panel Profe: {user.name}</h1>
                <button className={styles.btnCreate} onClick={() => setShowCreateModal(true)}>
                    + Crear Rutina Personalizada
                </button>
            </div>

            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Buscar alumno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? <p>Cargando alumnos...</p> : (
                <table className={styles.clientsTable}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Cambia esta parte en tu <tbody> */}
                        {filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>
                                    {/* 1. Botón para abrir el constructor con este alumno ya elegido */}
                                    <button
                                        className={styles.btnAssign}
                                        onClick={() => {
                                            setTargetClient(u.id); // Selecciona al alumno automáticamente
                                            setShowCreateModal(true); // Abre el modal
                                        }}
                                    >
                                        Asignar Rutina
                                    </button>

                                    <button className={styles.btnEdit}>Ver Progreso</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* MODAL CONSTRUCTOR */}
            {showCreateModal && (
                <div className={styles.modalCustom}>
                    <div className={styles.modalContentLarge}>
                        <h2>Nueva Rutina para Alumno</h2>
                        <label>Seleccionar Alumno:</label>
                        <select value={targetClient} onChange={(e) => setTargetClient(e.target.value)}>
                            <option value="">Elegir...</option>
                            {usersData.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>

                        <input
                            type="text"
                            placeholder="Nombre de la rutina (ej: Empuje Lunes)"
                            value={newRutineName}
                            onChange={(e) => setNewRutineName(e.target.value)}
                        />

                        <div className={styles.exerciseAdder}>
                            <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
                                <option value="">Ejercicio...</option>
                                {ejerciciosDB.map(ej => <option key={ej.id} value={ej.id}>{ej.name}</option>)}
                            </select>
                            <input type="number" placeholder="S" value={series} onChange={(e) => setSeries(e.target.value)} />
                            <input type="number" placeholder="R" value={reps} onChange={(e) => setReps(e.target.value)} />
                            <input type="number" placeholder="Kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
                            <button onClick={addExerciseToList}>Añadir</button>
                        </div>

                        <ul className={styles.exerciseList}>
                            {routineExercises.map((ex) => (
                                <li key={ex.id}>{ex.name} - {ex.series}x{ex.reps} ({ex.weight}kg)</li>
                            ))}
                        </ul>

                        <div className={styles.modalActions}>
                            <button onClick={() => setShowCreateModal(false)}>Cerrar</button>
                            <button className={styles.btnSave} onClick={handleSaveCustomRoutine}>Guardar en DB</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminClients;