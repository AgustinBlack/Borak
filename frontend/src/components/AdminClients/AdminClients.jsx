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

const AdminClients = ({ user }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [usersData, setUsersData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [targetClient, setTargetClient] = useState("");
    const [newRutineName, setNewRutineName] = useState("");

    const [routineDays, setRoutineDays] = useState([]);

    const [editingRoutine, setEditingRoutine] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:3000/users");
                const data = await response.json();
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

    // =========================
    // CREAR RUTINA
    // =========================

    const addDay = () => {
        setRoutineDays([
            ...routineDays,
            { 
                name: `Día ${routineDays.length + 1}`, 
                weekDay: null, // 🔥 CAMBIO CLAVE
                exercises: [] 
            }
        ]);
    };

    const addExerciseToDay = (dayIndex) => {
        const updated = [...routineDays];
        updated[dayIndex].exercises.push({ name: "", series: "", reps: "", weight: "" });
        setRoutineDays(updated);
    };

    const removeExerciseFromDay = (dayIndex, exIndex) => {
        const updated = [...routineDays];
        updated[dayIndex].exercises = updated[dayIndex].exercises.filter((_, i) => i !== exIndex);
        setRoutineDays(updated);
    };

    const handleDayExerciseChange = (dayIndex, exIndex, field, value) => {
        const updated = [...routineDays];
        updated[dayIndex].exercises[exIndex][field] = value;
        setRoutineDays(updated);
    };

    const handleSaveRoutine = async () => {
        try {
            if (!targetClient) {
                alert("Seleccioná un cliente");
                return;
            }

            if (!newRutineName.trim()) {
                alert("Poné un nombre a la rutina");
                return;
            }

            if (routineDays.length === 0) {
                alert("Agregá al menos un día");
                return;
            }

            // 🔥 VALIDACIÓN NUEVA
            if (routineDays.some(day => day.weekDay === null)) {
                alert("Todos los días deben tener un día asignado");
                return;
            }

            const cleanDays = routineDays.map(day => ({
                name: day.name,
                weekDay: day.weekDay,
                exercises: day.exercises.map(ex => ({
                    name: ex.name,
                    series: Number(ex.series),
                    reps: Number(ex.reps),
                    weight: Number(ex.weight)
                }))
            }));

            const res = await fetch("http://localhost:3000/assign-routine", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: targetClient,
                    routineName: newRutineName,
                    days: cleanDays
                })
            });

            if (!res.ok) {
                alert("Error al guardar rutina");
                return;
            }

            alert("Rutina guardada 🔥");

            setShowCreateModal(false);
            setRoutineDays([]);
            setNewRutineName("");
            setTargetClient("");

        } catch (err) {
            console.error(err);
            alert("Error inesperado");
        }
    };

    // =========================
    // EDITAR RUTINA
    // =========================

    const handleEditRoutine = async (userId) => {
        try {
            const res = await fetch(`http://localhost:3000/routine/${userId}`);
            const data = await res.json();

            const ejercicios = data.days?.flatMap(d => d.exercises) || [];
            setEditingRoutine(ejercicios);
            setEditingUserId(userId);
            setShowEditModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleExerciseChange = (index, field, value) => {
        const updated = [...editingRoutine];
        updated[index][field] = value;
        setEditingRoutine(updated);
    };

    const handleDeleteExercise = (index) => {
        setEditingRoutine(editingRoutine.filter((_, i) => i !== index));
    };

    const handleAddExercise = () => {
        setEditingRoutine([
            ...editingRoutine,
            { name: "Nuevo ejercicio", series: "", reps: "", weight: "" }
        ]);
    };

    const handleUpdateRoutine = async () => {
        try {
            await fetch(`http://localhost:3000/update-routine/${editingUserId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    days: [
                        {
                            name: "Día único",
                            exercises: editingRoutine
                        }
                    ]
                })
            });

            alert("Rutina actualizada 🔥");
            setShowEditModal(false);

        } catch (err) {
            console.error(err);
        }
    };

    if (user?.role !== 'pf') {
        return <p className={styles.errorMsg}>No tienes permiso para acceder.</p>;
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
                        {filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>

                                    <button
                                        className={styles.btnAssign}
                                        onClick={() => {
                                            setTargetClient(u.id);
                                            setShowCreateModal(true);
                                        }}
                                    >
                                        Asignar Rutina
                                    </button>

                                    <button
                                        className={styles.btnEdit}
                                        onClick={() => handleEditRoutine(u.id)}
                                    >
                                        Modificar Rutina
                                    </button>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* MODAL CREAR */}
            {showCreateModal && (
                <div className={styles.modalCustom}>
                    <div className={styles.modalContentLarge}>

                        <h2>Nueva Rutina</h2>

                        <div className={styles.formGroup}>
                            <label>Nombre de la rutina</label>
                            <input
                                value={newRutineName}
                                onChange={(e) => setNewRutineName(e.target.value)}
                            />
                        </div>

                        <button className={styles.btnAddExercise} onClick={addDay}>
                            + Agregar Día
                        </button>

                        {routineDays.map((day, dayIndex) => (
                            <div key={dayIndex} className={styles.exerciseList}>
                                <strong>{day.name}</strong>

                                {/* 🔥 SELECT NUEVO */}
                                <select
                                    className={styles.selectDay}
                                    value={day.weekDay ?? ""}
                                    onChange={(e) => {
                                        const updated = [...routineDays];
                                        updated[dayIndex].weekDay = Number(e.target.value);
                                        setRoutineDays(updated);
                                    }}
                                >
                                    <option value="">Seleccionar día</option>
                                    <option value={1}>Lunes</option>
                                    <option value={2}>Martes</option>
                                    <option value={3}>Miércoles</option>
                                    <option value={4}>Jueves</option>
                                    <option value={5}>Viernes</option>
                                    <option value={6}>Sábado</option>
                                    <option value={0}>Domingo</option>
                                </select>

                                <button onClick={() => addExerciseToDay(dayIndex)} className={styles.btnAddExercise}>
                                    + Ejercicio
                                </button>

                                {day.exercises.map((ex, i) => (
                                    <div key={i} className={styles.exerciseAdder}>

                                        <select
                                            value={ex.name}
                                            onChange={(e) => handleDayExerciseChange(dayIndex, i, "name", e.target.value)}
                                        >
                                            <option value="">Elegir ejercicio</option>
                                            {ejerciciosDB.map(ej => (
                                                <option key={ej.id} value={ej.name}>{ej.name}</option>
                                            ))}
                                        </select>

                                        <input type="number" placeholder="S"
                                            onChange={(e) => handleDayExerciseChange(dayIndex, i, "series", e.target.value)}
                                        />
                                        <input type="number" placeholder="R"
                                            onChange={(e) => handleDayExerciseChange(dayIndex, i, "reps", e.target.value)}
                                        />
                                        <input type="number" placeholder="Kg"
                                            onChange={(e) => handleDayExerciseChange(dayIndex, i, "weight", e.target.value)}
                                        />

                                        <button
                                            className={styles.btnRemove}
                                            onClick={() => removeExerciseFromDay(dayIndex, i)}
                                        >
                                            ✕
                                        </button>

                                    </div>
                                ))}
                            </div>
                        ))}

                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={() => setShowCreateModal(false)}>
                                Cerrar
                            </button>
                            <button className={styles.btnSave} onClick={handleSaveRoutine}>
                                Guardar
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminClients;