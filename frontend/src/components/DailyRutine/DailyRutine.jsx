import { useState, useEffect } from 'react';
import WorkoutCalendar from './CalendarWorkout'; 
import styles from './DailyRutine.module.css';

const DailyRutine = ({ user }) => {
    // 1. ESTADOS
    const [fullRoutine, setFullRoutine] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [rutinaDelDia, setRutinaDelDia] = useState(null);
    const [progreso, setProgreso] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // 2. LÓGICA DE FILTRADO — va ANTES del useEffect que la usa
    const filtrarPorDia = (routine, date) => {
        const dayOfWeek = date.getDay();
        const dayMatch = routine.days.find(d => Number(d.weekDay) === dayOfWeek); // 🔥 fix cast

        if (dayMatch) {
            setRutinaDelDia(dayMatch);
            const initialProgreso = {};
            dayMatch.exercises.forEach((_, index) => {
                initialProgreso[index] = { series: '', reps: '', peso: '' };
            });
            setProgreso(initialProgreso);
        } else {
            setRutinaDelDia(null);
        }
    }; // <-- cierra filtrarPorDia

    // 3. CARGA INICIAL
    useEffect(() => {
        const fetchRoutine = async () => {
            try {
                const res = await fetch(`http://localhost:3000/routine/${user.id}`);
                const data = await res.json();
                
                if (res.ok) {
                    setFullRoutine(data);
                    filtrarPorDia(data, new Date());
                }
            } catch (error) {
                console.error("Error cargando rutina:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchRoutine();
    }, [user.id]); // <-- cierra useEffect

    // 4. MANEJADORES DE EVENTOS
    const handleDateClick = (date) => {
        setSelectedDate(date);
        setSaveMessage('');
        if (fullRoutine) {
            filtrarPorDia(fullRoutine, date);
        }
    };

    const handleChange = (index, field, value) => {
        setProgreso(prev => ({
            ...prev,
            [index]: { ...prev[index], [field]: value }
        }));
    };

    const handleGuardar = async () => {
        if (!rutinaDelDia) return;
        setSaving(true);
        setSaveMessage('');

        const exercisesToSave = rutinaDelDia.exercises.map((ej, index) => {
            const p = progreso[index];
            return {
                exercise_name: ej.name,
                series: p?.series !== '' ? parseInt(p.series, 10) : ej.series,
                reps: p?.reps !== '' ? parseInt(p.reps, 10) : ej.reps,
                weight_kg: p?.peso !== '' ? parseFloat(p.peso) : ej.weight
            };
        });

        try {
            const res = await fetch('http://localhost:3000/routine-completed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    exercises: exercisesToSave
                })
            });

            if (res.ok) {
                setSaveMessage('¡Entrenamiento guardado con éxito! 🔥');
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            setSaveMessage('Error al conectar con el servidor.');
        } finally {
            setSaving(false);
        }
    };

    // 5. RENDERIZADO
    if (loading) return <div className={styles.container}><p>Cargando información...</p></div>;

    return (
        <div className={styles.container}>
            <h1>Tu Plan de Entrenamiento</h1>
            
            <div style={{ marginBottom: "30px", display: "flex", justifyContent: "center" }}>
                <WorkoutCalendar 
                    routineDays={fullRoutine?.days || []} 
                    onDateClick={handleDateClick}
                    workoutSessions={[]}
                />
            </div>

            <hr style={{ margin: "20px 0", borderColor: "#333" }} />

            <h2>
                Rutina del {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>

            {!rutinaDelDia ? (
                <p className={styles.noRutina}>Hoy es tu día de descanso. ¡A recuperar energías! 🔋</p>
            ) : (
                <>
                    <p className={styles.routineSubtitle}>Enfoque: {rutinaDelDia.name} ({fullRoutine.name})</p>
                    
                    <div className={styles.ejercicios}>
                        {rutinaDelDia.exercises.map((ej, index) => (
                            <div key={index} className={styles.ejercicio}>
                                <h3>{ej.name}</h3>
                                <div className={styles.sugerido}>
                                    <span>Sugerido: {ej.series} series x {ej.reps} reps ({ej.weight}kg)</span>
                                </div>
                                
                                <div className={styles.inputs}>
                                    <label>Series:
                                        <input
                                            type="number"
                                            placeholder={ej.series}
                                            value={progreso[index]?.series || ''}
                                            onChange={(e) => handleChange(index, 'series', e.target.value)}
                                        />
                                    </label>
                                    <label>Reps:
                                        <input
                                            type="number"
                                            placeholder={ej.reps}
                                            value={progreso[index]?.reps || ''}
                                            onChange={(e) => handleChange(index, 'reps', e.target.value)}
                                        />
                                    </label>
                                    <label>Peso:
                                        <input
                                            type="number"
                                            placeholder={ej.weight}
                                            value={progreso[index]?.peso || ''}
                                            onChange={(e) => handleChange(index, 'peso', e.target.value)}
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        className={styles.guardar}
                        onClick={handleGuardar}
                        disabled={saving}
                    >
                        {saving ? 'Guardando...' : 'Finalizar y Guardar Entrenamiento'}
                    </button>
                    {saveMessage && <p className={styles.saveMessage}>{saveMessage}</p>}
                </>
            )}
        </div>
    );
};

export default DailyRutine;