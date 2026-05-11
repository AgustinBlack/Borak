import { useState, useEffect } from "react";
import styles from "./AdminClients.module.css";

const SECCIONES = [
  "movilidad",
  "zona media",
  "circuito",
  "fisico"
];

const emptyExercise = () => ({
  name: "",
  type: "reps",
  series: "",
  reps: "",
  duration: "",
  weight: ""
});

const emptyDay = (index) => ({
  name: `Día ${index + 1}`,
  weekDay: null,
  secciones: {
    movilidad: [],
    "zona media": [],
    circuito: [],
    fisico: []
  }
});

const AdminClients = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [targetClient, setTargetClient] = useState("");
  const [newRutineName, setNewRutineName] = useState("");
  const [routineDays, setRoutineDays] = useState([]);
  const [editingRoutineName, setEditingRoutineName] = useState("");
  const [editingRoutineDays, setEditingRoutineDays] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseVideo, setNewExerciseVideo] = useState("");

  // =====================
  // FETCH USERS
  // =====================

  const fetchUsers = async () => {
    try {

      const response = await fetch(
        "http://localhost:3000/users-with-routines"
      );

      const data = await response.json();

      setUsersData(data);

    } catch (error) {
      console.error("Error al cargar usuarios:", error);

    } finally {
      setLoading(false);
    }
  };

  // =====================
  // FETCH EXERCISES
  // =====================

  const fetchExercises = async () => {
    try {

      const response = await fetch(
        "http://localhost:3000/exercises"
      );

      const data = await response.json();

      setExercises(data);

    } catch (err) {
      console.error("Error cargando ejercicios:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchExercises();
  }, []);

  // =====================
  // STATUS
  // =====================

  const handleStatusChange = async (
    userId,
    newStatus
  ) => {

    try {

      const response = await fetch(
        "http://localhost:3000/update-status",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            userId,
            status: newStatus
          })
        }
      );

      if (response.ok) {

        setUsersData(prev =>
          prev.map(u =>
            u.id === userId
              ? {
                ...u,
                status: newStatus
              }
              : u
          )
        );
      }

    } catch (error) {
      console.error(
        "Error al actualizar estado:",
        error
      );
    }
  };

  // =====================
  // CREATE EXERCISE
  // =====================

  const handleCreateExercise = async () => {

    try {

      if (!newExerciseName.trim()) {
        return alert("Poné un nombre");
      }

      const res = await fetch(
        "http://localhost:3000/exercises",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: newExerciseName,
            video_url: newExerciseVideo
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message);
      }

      setExercises(prev => [...prev, data]);

      setShowExerciseModal(false);

      setNewExerciseName("");

      setNewExerciseVideo("");

      alert("Ejercicio creado 🔥");

    } catch (err) {
      console.error(err);

      alert("Error creando ejercicio");
    }
  };

  // =====================
  // FILTER USERS
  // =====================

  const pendingUsers = usersData.filter(
    u => u.status === "pending"
  );

  const activeUsers = usersData.filter(
    u =>
      u.status === "approved" &&
      (
        u.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||

        u.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
  );

  // =====================
  // CREATE ROUTINE
  // =====================

  const addDay = () => {
    setRoutineDays([
      ...routineDays,
      emptyDay(routineDays.length)
    ]);
  };

  const removeDay = (dayIndex) => {
    setRoutineDays(prev =>
      prev.filter((_, i) => i !== dayIndex)
    );
  };

  const updateDayField = (
    dayIndex,
    field,
    value
  ) => {

    const updated = [...routineDays];

    updated[dayIndex] = {
      ...updated[dayIndex],
      [field]: value
    };

    setRoutineDays(updated);
  };

  const addExerciseToSection = (
    dayIndex,
    seccion
  ) => {

    const updated = [...routineDays];

    updated[dayIndex]
      .secciones[seccion]
      .push(emptyExercise());

    setRoutineDays(updated);
  };

  const removeExerciseFromSection = (
    dayIndex,
    seccion,
    exIndex
  ) => {

    const updated = [...routineDays];

    updated[dayIndex].secciones[seccion] =
      updated[dayIndex]
        .secciones[seccion]
        .filter((_, i) => i !== exIndex);

    setRoutineDays(updated);
  };

  const updateExerciseInSection = (
    dayIndex,
    seccion,
    exIndex,
    field,
    value
  ) => {

    const updated = [...routineDays];

    updated[dayIndex]
      .secciones[seccion][exIndex] = {
      ...updated[dayIndex]
        .secciones[seccion][exIndex],
      [field]: value
    };

    setRoutineDays(updated);
  };

  // =====================
  // FLATTEN DAYS
  // =====================

  const flattenDays = (days) =>
    days.map(day => ({
      name: day.name,

      weekDay: day.weekDay,

      exercises: SECCIONES.flatMap(sec =>
        (day.secciones?.[sec] || [])
          .filter(ex => ex.name)
          .map(ex => ({
            name: ex.name,
            section: sec,
            type: ex.type,
            series: Number(ex.series) || 0,

            reps:
              ex.type === "reps"
                ? Number(ex.reps) || 0
                : 0,

            duration:
              ex.type === "tiempo"
                ? Number(ex.duration) || 0
                : 0,

            weight: Number(ex.weight) || 0
          }))
      )
    }));

  // =====================
  // SAVE ROUTINE
  // =====================

  const handleSaveRoutine = async () => {

    if (!targetClient) {
      return alert("Seleccioná un cliente");
    }

    if (!newRutineName.trim()) {
      return alert("Poné un nombre");
    }

    if (routineDays.length === 0) {
      return alert("Agregá al menos un día");
    }

    if (
      routineDays.some(
        day => day.weekDay === null
      )
    ) {
      return alert(
        "Todos los días deben tener un día asignado"
      );
    }

    try {

      const res = await fetch(
        "http://localhost:3000/assign-routine",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            userId: targetClient,
            routineName: newRutineName,
            days: flattenDays(routineDays)
          })
        }
      );

      if (!res.ok) {
        return alert("Error al guardar");
      }

      alert("Rutina guardada 🔥");

      setShowCreateModal(false);

      setRoutineDays([]);

      setNewRutineName("");

      setTargetClient("");

      fetchUsers();

    } catch (err) {
      console.error(err);

      alert("Error inesperado");
    }
  };

  // =====================
  // EDIT ROUTINE
  // =====================

  const handleEditRoutine = async (
    userId
  ) => {

    try {

      const res = await fetch(
        `http://localhost:3000/routine/${userId}`
      );

      const data = await res.json();

      if (!res.ok) {
        return alert(
          data.message ||
          "No se encontró rutina"
        );
      }

      const daysWithSections =
        (data.days || []).map(day => {

          const secciones = {
            movilidad: [],
            "zona media": [],
            circuito: [],
            fisico: []
          };

          (day.exercises || []).forEach(ex => {

            const sec = ex.section || "fisico";

            if (secciones[sec]) {

              secciones[sec].push({
                name: ex.name,

                type:
                  ex.exercise_type || "reps",

                series: ex.series,

                reps: ex.reps,

                duration:
                  ex.duration_seconds || "",

                weight: ex.weight
              });
            }
          });

          return {
            name: day.name,
            weekDay: day.weekDay,
            secciones
          };
        });

      setEditingRoutineName(data.name || "");

      setEditingRoutineDays(daysWithSections);

      setEditingUserId(userId);

      setShowEditModal(true);

    } catch (err) {
      console.error(err);

      alert(
        "Error cargando la rutina"
      );
    }
  };

  const updateEditingDayField = (
    dayIndex,
    field,
    value
  ) => {

    const updated = [...editingRoutineDays];

    updated[dayIndex] = {
      ...updated[dayIndex],
      [field]: value
    };

    setEditingRoutineDays(updated);
  };

  const addEditingExercise = (
    dayIndex,
    seccion
  ) => {

    const updated = [...editingRoutineDays];

    updated[dayIndex]
      .secciones[seccion]
      .push(emptyExercise());

    setEditingRoutineDays(updated);
  };

  const removeEditingExercise = (
    dayIndex,
    seccion,
    exIndex
  ) => {

    const updated = [...editingRoutineDays];

    updated[dayIndex].secciones[seccion] =
      updated[dayIndex]
        .secciones[seccion]
        .filter((_, i) => i !== exIndex);

    setEditingRoutineDays(updated);
  };

  const updateEditingExercise = (
    dayIndex,
    seccion,
    exIndex,
    field,
    value
  ) => {

    const updated = [...editingRoutineDays];

    updated[dayIndex]
      .secciones[seccion][exIndex] = {
      ...updated[dayIndex]
        .secciones[seccion][exIndex],
      [field]: value
    };

    setEditingRoutineDays(updated);
  };

  const handleAddEditingDay = () => {
    setEditingRoutineDays([
      ...editingRoutineDays,
      emptyDay(editingRoutineDays.length)
    ]);
  };

  const handleDeleteEditingDay = (
    dayIndex
  ) => {

    setEditingRoutineDays(
      editingRoutineDays.filter(
        (_, i) => i !== dayIndex
      )
    );
  };

  const handleUpdateRoutine = async () => {

    try {

      await fetch(
        `http://localhost:3000/update-routine/${editingUserId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            routineName: editingRoutineName,
            days: flattenDays(editingRoutineDays)
          })
        }
      );

      alert("Rutina actualizada 🔥");

      setShowEditModal(false);

      setEditingUserId(null);

      setEditingRoutineName("");

      setEditingRoutineDays([]);

      fetchUsers();

    } catch (err) {
      console.error(err);

      alert("Error actualizando");
    }
  };

  // =====================
  // PERMISSIONS
  // =====================

  if (user?.role !== "pf") {
    return (
      <p className={styles.errorMsg}>
        No tienes permiso para acceder.
      </p>
    );
  }

  // =====================
  // RENDER SECCIONES
  // =====================

  const renderSecciones = (
    days,
    dayIndex,
    {
      updateExercise,
      addExercise,
      removeExercise,
      removeDay,
      updateDayField: updateField
    }
  ) => (

    <div
      key={dayIndex}
      className={styles.exerciseList}
    >

      <div className={styles.formRow}>

        <div className={styles.formGroup}>
          <label>Nombre del día</label>

          <input
            value={days[dayIndex].name}
            onChange={(e) =>
              updateField(
                dayIndex,
                "name",
                e.target.value
              )
            }
          />
        </div>

        <div className={styles.formGroup}>
          <label>Día de la semana</label>

          <select
            value={days[dayIndex].weekDay ?? ""}
            onChange={(e) =>
              updateField(
                dayIndex,
                "weekDay",
                e.target.value === ""
                  ? null
                  : Number(e.target.value)
              )
            }
          >
            <option value="">
              Seleccionar día
            </option>

            <option value={1}>Lunes</option>
            <option value={2}>Martes</option>
            <option value={3}>Miércoles</option>
            <option value={4}>Jueves</option>
            <option value={5}>Viernes</option>
            <option value={6}>Sábado</option>
            <option value={0}>Domingo</option>
          </select>
        </div>

        <button
          className={styles.btnRemove}
          onClick={() => removeDay(dayIndex)}
        >
          ✕
        </button>
      </div>

      {SECCIONES.map(seccion => (

        <div
          key={seccion}
          className={styles.seccionBlock}
        >

          <div className={styles.seccionHeader}>

            <h4 className={styles.seccionTitle}>
              {seccion.charAt(0).toUpperCase() +
                seccion.slice(1)}
            </h4>

            <button
              className={styles.btnAddExercise}
              onClick={() =>
                addExercise(dayIndex, seccion)
              }
            >
              + Ejercicio
            </button>
          </div>

          {days[dayIndex]
            .secciones[seccion].length === 0 && (

              <p className={styles.seccionVacia}>
                Sin ejercicios en esta sección
              </p>
            )}

          {days[dayIndex]
            .secciones[seccion]
            .map((ex, exIndex) => (

              <div
                key={exIndex}
                className={styles.exerciseAdder}
              >

                <select
                  value={ex.name}
                  onChange={(e) => {

                    if (
                      e.target.value === "__new__"
                    ) {
                      setShowExerciseModal(true);
                      return;
                    }

                    updateExercise(
                      dayIndex,
                      seccion,
                      exIndex,
                      "name",
                      e.target.value
                    );
                  }}
                >

                  <option value="">
                    Elegir ejercicio
                  </option>

                  <option value="__new__">
                    ➕ Agregar nuevo ejercicio
                  </option>

                  {exercises.map(ej => (
                    <option
                      key={ej.id}
                      value={ej.name}
                    >
                      {ej.name}
                    </option>
                  ))}
                </select>

                <select
                  value={ex.type}
                  onChange={(e) =>
                    updateExercise(
                      dayIndex,
                      seccion,
                      exIndex,
                      "type",
                      e.target.value
                    )
                  }
                >
                  <option value="reps">
                    Reps
                  </option>

                  <option value="tiempo">
                    Tiempo
                  </option>
                </select>

                <input
                  type="number"
                  placeholder="Series"
                  value={ex.series}
                  onChange={(e) =>
                    updateExercise(
                      dayIndex,
                      seccion,
                      exIndex,
                      "series",
                      e.target.value
                    )
                  }
                />

                {ex.type === "reps" ? (

                  <input
                    type="number"
                    placeholder="Reps"
                    value={ex.reps}
                    onChange={(e) =>
                      updateExercise(
                        dayIndex,
                        seccion,
                        exIndex,
                        "reps",
                        e.target.value
                      )
                    }
                  />

                ) : (

                  <input
                    type="number"
                    placeholder="Seg"
                    value={ex.duration}
                    onChange={(e) =>
                      updateExercise(
                        dayIndex,
                        seccion,
                        exIndex,
                        "duration",
                        e.target.value
                      )
                    }
                  />
                )}

                <input
                  type="number"
                  placeholder="Kg"
                  value={ex.weight}
                  onChange={(e) =>
                    updateExercise(
                      dayIndex,
                      seccion,
                      exIndex,
                      "weight",
                      e.target.value
                    )
                  }
                />

                <button
                  className={styles.btnRemove}
                  onClick={() =>
                    removeExercise(
                      dayIndex,
                      seccion,
                      exIndex
                    )
                  }
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.adminContainer}>

      {/* MODAL NUEVO EJERCICIO */}
      {showExerciseModal && (
        <div className={`${styles.modalCustom} ${styles.modalTop}`}>
          <div className={styles.modalContent}>
            <h2>Nuevo Ejercicio</h2>
            <div className={styles.formGroup}>
              <label>Nombre</label>
              <input
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Video URL (opcional)</label>
              <input
                value={newExerciseVideo}
                onChange={(e) => setNewExerciseVideo(e.target.value)}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowExerciseModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnSave} onClick={handleCreateExercise}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className={styles.header}>
        <h1>Panel Profe: {user.name}</h1>
      </div>

      {/* PENDIENTES */}
      {pendingUsers.length > 0 && (
        <div className={styles.pendingSection}>
          <h2>Solicitudes de acceso</h2>
          {pendingUsers.map(pUser => (
            <div key={pUser.id} className={styles.pendingRow}>
              <p><strong>{pUser.name}</strong> ({pUser.email}) solicita unirse.</p>
              <div className={styles.actionButtons}>
                <button onClick={() => handleStatusChange(pUser.id, "approved")} className={styles.btnApprove}>Aceptar</button>
                <button onClick={() => handleStatusChange(pUser.id, "rejected")} className={styles.btnReject}>Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BUSCADOR */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Buscar alumno..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA */}
      {loading ? <p>Cargando alumnos...</p> : (
        <table className={styles.clientsTable}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rutina actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.length > 0 ? activeUsers.map((u) => (
              <tr key={u.id} className={styles.clientRow}>
                <td data-label="Nombre">{u.name}</td>
                <td data-label="Email">{u.email}</td>
                <td data-label="Rutina">{u.current_routine || "Sin rutina"}</td>
                <td>
                  <button
                    className={styles.btnAssign}
                    onClick={() => { setTargetClient(u.id); setShowCreateModal(true); }}
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
            )) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No se encontraron alumnos activos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* MODAL CREAR RUTINA */}
      {showCreateModal && (
        <div className={styles.modalCustom}>
          <div className={styles.modalContentLarge}>
            <h2>Nueva Rutina</h2>
            <div className={styles.formGroup}>
              <label>Nombre de la rutina</label>
              <input value={newRutineName} onChange={(e) => setNewRutineName(e.target.value)} />
            </div>
            <button className={styles.btnAddExercise} onClick={addDay}>+ Agregar Día</button>

            {routineDays.map((_, dayIndex) =>
              renderSecciones(routineDays, dayIndex, {
                updateExercise: updateExerciseInSection,
                addExercise: addExerciseToSection,
                removeExercise: removeExerciseFromSection,
                removeDay: removeDay,
                updateDayField: updateDayField
              })
            )}

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowCreateModal(false)}>Cerrar</button>
              <button className={styles.btnSave} onClick={handleSaveRoutine}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR RUTINA */}
      {showEditModal && (
        <div className={styles.modalCustom}>
          <div className={styles.modalContentLarge}>
            <h2>Modificar Rutina</h2>
            <div className={styles.formGroup}>
              <label>Nombre de la rutina</label>
              <input value={editingRoutineName} onChange={(e) => setEditingRoutineName(e.target.value)} />
            </div>

            {editingRoutineDays.map((_, dayIndex) =>
              renderSecciones(editingRoutineDays, dayIndex, {
                updateExercise: updateEditingExercise,
                addExercise: addEditingExercise,
                removeExercise: removeEditingExercise,
                removeDay: handleDeleteEditingDay,
                updateDayField: updateEditingDayField
              })
            )}

            <button className={styles.btnAddExercise} onClick={handleAddEditingDay}>+ Agregar Día</button>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowEditModal(false)}>Cerrar</button>
              <button className={styles.btnSave} onClick={handleUpdateRoutine}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminClients;