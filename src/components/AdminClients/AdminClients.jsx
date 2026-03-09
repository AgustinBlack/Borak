import { useState } from "react";
import users from "../../data/users.json";
import rutines from "../../data/rutines.json";
import styles from "./AdminClients.module.css";

// Simulamos una base de datos de ejercicios (luego lo puedes pasar a un ejercicios.json)
const ejerciciosDB = [
    { id: 1, name: "Press de Banca", muscle: "Pecho" },
    { id: 2, name: "Sentadilla Libre", muscle: "Piernas" },
    { id: 3, name: "Peso Muerto", muscle: "Espalda/Piernas" },
    { id: 4, name: "Dominadas", muscle: "Espalda" },
    { id: 5, name: "Curl de Bíceps", muscle: "Brazos" },
    { id: 6, name: "Press Militar", muscle: "Hombros" }
];

const AdminClients = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [usersData, setUsersData] = useState(users);
    const [rutinesData, setRutinesData] = useState(rutines); 
    
    // Estados para modales principales
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // --- ESTADOS PARA CREAR RUTINA PERSONALIZADA ---
    const [targetClient, setTargetClient] = useState(""); // Cliente al que se le asignará
    const [newRutineName, setNewRutineName] = useState("");
    const [routineExercises, setRoutineExercises] = useState([]); // Lista de ejercicios añadidos
    
    // Controles para añadir un ejercicio específico a la lista
    const [selectedExercise, setSelectedExercise] = useState("");
    const [series, setSeries] = useState("");
    const [reps, setReps] = useState("");
    const [weight, setWeight] = useState("");

    const filteredUsers = usersData.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRutineName = (rutineId) => {
        const rutine = rutinesData.find(r => r.id === rutineId);
        return rutine ? rutine.name : "Sin rutina asignada";
    };

    // --- FUNCIONES DE ASIGNACIÓN SIMPLE ---
    const handleAssignRutine = (user) => {
        setSelectedUser(user);
        setShowAssignModal(true);
    };

    const assignRutine = (rutineId) => {
        if (selectedUser) {
            setUsersData(prevUsers =>
                prevUsers.map(user =>
                    user.id === selectedUser.id ? { ...user, currentRutineId: rutineId } : user
                )
            );
            setShowAssignModal(false);
            setSelectedUser(null);
        }
    };

    // --- FUNCIONES DE RUTINA PERSONALIZADA ---
    const addExerciseToList = () => {
        if (!selectedExercise || !series || !reps || !weight) {
            alert("Por favor completa todos los campos del ejercicio.");
            return;
        }

        const exerciseDetails = ejerciciosDB.find(e => e.id === parseInt(selectedExercise));
        
        const newExercise = {
            id: Date.now(), // ID temporal para la lista
            exerciseId: exerciseDetails.id,
            name: exerciseDetails.name,
            series: series,
            reps: reps,
            weight: weight
        };

        setRoutineExercises([...routineExercises, newExercise]);
        
        // Limpiamos los inputs del ejercicio para añadir el siguiente
        setSelectedExercise("");
        setSeries("");
        setReps("");
        setWeight("");
    };

    const removeExerciseFromList = (idToRemove) => {
        setRoutineExercises(routineExercises.filter(ex => ex.id !== idToRemove));
    };

    const handleSaveCustomRoutine = () => {
        if (!targetClient || !newRutineName || routineExercises.length === 0) {
            alert("Falta información: Selecciona un cliente, un nombre de rutina y al menos 1 ejercicio.");
            return;
        }

        // 1. Crear la nueva rutina
        const newRutineId = rutinesData.length > 0 ? Math.max(...rutinesData.map(r => r.id)) + 1 : 1;
        const rutineToAdd = {
            id: newRutineId,
            name: newRutineName,
            exercises: routineExercises
        };

        // 2. Guardarla en la "base de datos" local de rutinas
        setRutinesData([...rutinesData, rutineToAdd]);

        // 3. Asignársela automáticamente al cliente seleccionado
        setUsersData(prevUsers =>
            prevUsers.map(user =>
                user.id === parseInt(targetClient) ? { ...user, currentRutineId: newRutineId } : user
            )
        );

        // 4. Cerrar y limpiar todo
        setShowCreateModal(false);
        setTargetClient("");
        setNewRutineName("");
        setRoutineExercises([]);
    };

    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <h1>Panel de Administración: Clientes</h1>
                <button 
                    className={styles.btnCreate} 
                    onClick={() => setShowCreateModal(true)}
                >
                    + Crear Rutina Personalizada
                </button>
            </div>
            
            <div className={styles.searchBar}>
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table className={styles.clientsTable}>
                {/* ... (Tu tabla intacta) ... */}
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rutina Actual</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{getRutineName(user.currentRutineId)}</td>
                            <td>
                                <button className={styles.btnEdit}>Ver Perfil</button>
                                <button className={styles.btnAssign} onClick={() => handleAssignRutine(user)}>Asignar Existente</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL 1: Asignar rutina existente */}
            {showAssignModal && selectedUser && (
                <div className={styles.modal}>
                    {/* ... (Tu modal 1 intacto) ... */}
                    <div className={styles.modalContent}>
                        <h2>Asignar Rutina a {selectedUser.name}</h2>
                        <select onChange={(e) => assignRutine(parseInt(e.target.value))}>
                            <option value="">Seleccionar rutina...</option>
                            {rutinesData.map(rutine => (
                                <option key={rutine.id} value={rutine.id}>{rutine.name}</option>
                            ))}
                        </select>
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={() => setShowAssignModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: Crear rutina personalizada */}
            {showCreateModal && (
                <div className={styles.modalCustom}>
                    <div className={styles.modalContentLarge}>
                        <h2>Constructor de Rutina</h2>
                        
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>1. Seleccionar Cliente:</label>
                                <select value={targetClient} onChange={(e) => setTargetClient(e.target.value)}>
                                    <option value="">Elegir cliente...</option>
                                    {usersData.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>2. Nombre de la Rutina:</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Fuerza Máxima Sem 1" 
                                    value={newRutineName}
                                    onChange={(e) => setNewRutineName(e.target.value)}
                                />
                            </div>
                        </div>

                        <hr className={styles.divider} />
                        
                        <h3>3. Agregar Ejercicios</h3>
                        <div className={styles.exerciseAdder}>
                            <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
                                <option value="">Seleccionar Ejercicio...</option>
                                {ejerciciosDB.map(ej => (
                                    <option key={ej.id} value={ej.id}>{ej.name} ({ej.muscle})</option>
                                ))}
                            </select>
                            
                            <input type="number" placeholder="Series" value={series} onChange={(e) => setSeries(e.target.value)} min="1"/>
                            <input type="number" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} min="1"/>
                            <input type="number" placeholder="Peso (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} min="0"/>
                            
                            <button className={styles.btnAddExercise} onClick={addExerciseToList}>+ Añadir</button>
                        </div>

                        {/* Lista visual de ejercicios agregados */}
                        {routineExercises.length > 0 && (
                            <ul className={styles.exerciseList}>
                                {routineExercises.map((ex) => (
                                    <li key={ex.id}>
                                        <span><strong>{ex.name}</strong> - {ex.series} series x {ex.reps} reps ({ex.weight} kg)</span>
                                        <button className={styles.btnRemove} onClick={() => removeExerciseFromList(ex.id)}>X</button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={() => setShowCreateModal(false)}>Cancelar</button>
                            <button className={styles.btnSave} onClick={handleSaveCustomRoutine}>Guardar y Asignar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminClients;