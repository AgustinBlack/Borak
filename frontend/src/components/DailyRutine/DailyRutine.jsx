import { useState, useEffect } from 'react';
import styles from './DailyRutine.module.css';

const DailyRutine = () => {
    // Datos de ejemplo de rutinas por día. Reemplaza con datos reales o props.
    const rutinas = [
        {
            dia: 'lunes',
            ejercicios: [
                { id: 1, nombre: 'Push-ups', series: 3, reps: 10 },
                { id: 2, nombre: 'Squats', series: 4, reps: 12 },
            ]
        },
        {
            dia: 'martes',
            ejercicios: [
                { id: 3, nombre: 'Planks', series: 3, reps: 30 }, // reps en segundos para planks
                { id: 4, nombre: 'Lunges', series: 3, reps: 10 },
            ]
        },
        // Agrega más días según sea necesario
    ];

    const [diaActual, setDiaActual] = useState('');
    const [rutinaDelDia, setRutinaDelDia] = useState(null);
    const [progreso, setProgreso] = useState({});

    useEffect(() => {
        const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
        setDiaActual(hoy);
        const rutina = rutinas.find(r => r.dia === hoy);
        setRutinaDelDia(rutina);
        if (rutina) {
            const initialProgreso = {};
            rutina.ejercicios.forEach(ej => {
                initialProgreso[ej.id] = { series: '', reps: '', peso: '' };
            });
            setProgreso(initialProgreso);
        }
    }, []);

    const handleChange = (id, field, value) => {
        setProgreso(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    if (!rutinaDelDia) {
        return <p>No hay rutina programada para hoy ({diaActual}).</p>;
    }

    return (
        <div className={styles.container}>
            <h1>Rutina del Día: {diaActual.charAt(0).toUpperCase() + diaActual.slice(1)}</h1>
            <div className={styles.ejercicios}>
                {rutinaDelDia.ejercicios.map(ej => (
                    <div key={ej.id} className={styles.ejercicio}>
                        <h3>{ej.nombre}</h3>
                        <p>Series sugeridas: {ej.series}</p>
                        <p>Reps sugeridas: {ej.reps}</p>
                        <div className={styles.inputs}>
                            <label>
                                Series realizadas:
                                <input
                                    type="number"
                                    value={progreso[ej.id]?.series || ''}
                                    onChange={(e) => handleChange(ej.id, 'series', e.target.value)}
                                />
                            </label>
                            <label>
                                Reps realizadas:
                                <input
                                    type="number"
                                    value={progreso[ej.id]?.reps || ''}
                                    onChange={(e) => handleChange(ej.id, 'reps', e.target.value)}
                                />
                            </label>
                            <label>
                                Peso (kg):
                                <input
                                    type="number"
                                    value={progreso[ej.id]?.peso || ''}
                                    onChange={(e) => handleChange(ej.id, 'peso', e.target.value)}
                                />
                            </label>
                        </div>
                    </div>
                ))}
            </div>
            <button className={styles.guardar}>Guardar Progreso</button>
        </div>
    );
};

export default DailyRutine;