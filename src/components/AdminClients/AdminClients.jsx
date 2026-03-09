import { useState } from "react";
import users from "../../data/users.json";
import rutines from "../../data/rutines.json";
import styles from "./AdminClients.module.css";

const AdminClients = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [usersData, setUsersData] = useState(users); // Estado local para usuarios
    const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado para asignar rutina
    const [showAssignModal, setShowAssignModal] = useState(false); // Controla el modal de asignación

    // Filtramos clientes por nombre o email
    const filteredUsers = usersData.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRutineName = (rutineId) => {
        const rutine = rutines.find(r => r.id === rutineId);
        return rutine ? rutine.name : "Sin rutina asignada";
    };

    // Función para abrir el modal de asignación
    const handleAssignRutine = (user) => {
        setSelectedUser(user);
        setShowAssignModal(true);
    };

    // Función para asignar la rutina
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

    return (
        <div className={styles.adminContainer}>
            <h1>Panel de Administración: Clientes</h1>
            
            <div className={styles.searchBar}>
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <table className={styles.clientsTable}>
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
                                <button className={styles.btnAssign} onClick={() => handleAssignRutine(user)}>Asignar Rutina</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal para asignar rutina */}
            {showAssignModal && selectedUser && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>Asignar Rutina a {selectedUser.name}</h2>
                        <select onChange={(e) => assignRutine(parseInt(e.target.value))}>
                            <option value="">Seleccionar rutina...</option>
                            {rutines.map(rutine => (
                                <option key={rutine.id} value={rutine.id}>{rutine.name}</option>
                            ))}
                        </select>
                        <button onClick={() => setShowAssignModal(false)}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminClients;