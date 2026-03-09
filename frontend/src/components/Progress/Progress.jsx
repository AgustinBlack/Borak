import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Progress.module.css';

const Progress = () => {
  // Datos de todos los ejercicios de la rutina
  const ejercicios = [
    {
      id: 1,
      nombre: 'Press de Banca',
      musculos: 'Pecho, Tríceps',
      historico: [
        { semana: 'Semana 1', peso: 60, repeticiones: 8 },
        { semana: 'Semana 2', peso: 62, repeticiones: 8 },
        { semana: 'Semana 3', peso: 65, repeticiones: 9 },
        { semana: 'Semana 4', peso: 65, repeticiones: 10 },
        { semana: 'Semana 5', peso: 70, repeticiones: 8 },
        { semana: 'Semana 6', peso: 72, repeticiones: 9 },
      ]
    },
    {
      id: 2,
      nombre: 'Sentadillas',
      musculos: 'Piernas, Glúteos',
      historico: [
        { semana: 'Semana 1', peso: 80, repeticiones: 10 },
        { semana: 'Semana 2', peso: 85, repeticiones: 10 },
        { semana: 'Semana 3', peso: 90, repeticiones: 9 },
        { semana: 'Semana 4', peso: 90, repeticiones: 11 },
        { semana: 'Semana 5', peso: 95, repeticiones: 10 },
        { semana: 'Semana 6', peso: 100, repeticiones: 10 },
      ]
    },
    {
      id: 3,
      nombre: 'Peso Muerto',
      musculos: 'Espalda, Glúteos',
      historico: [
        { semana: 'Semana 1', peso: 100, repeticiones: 6 },
        { semana: 'Semana 2', peso: 105, repeticiones: 6 },
        { semana: 'Semana 3', peso: 110, repeticiones: 6 },
        { semana: 'Semana 4', peso: 110, repeticiones: 7 },
        { semana: 'Semana 5', peso: 115, repeticiones: 6 },
        { semana: 'Semana 6', peso: 120, repeticiones: 6 },
      ]
    },
    {
      id: 4,
      nombre: 'Flexiones',
      musculos: 'Pecho, Tríceps, Hombros',
      historico: [
        { semana: 'Semana 1', peso: 0, repeticiones: 8 },
        { semana: 'Semana 2', peso: 0, repeticiones: 10 },
        { semana: 'Semana 3', peso: 0, repeticiones: 12 },
        { semana: 'Semana 4', peso: 0, repeticiones: 14 },
        { semana: 'Semana 5', peso: 0, repeticiones: 15 },
        { semana: 'Semana 6', peso: 0, repeticiones: 18 },
      ]
    },
    {
      id: 5,
      nombre: 'Dominadas',
      musculos: 'Espalda, Brazos',
      historico: [
        { semana: 'Semana 1', peso: 0, repeticiones: 5 },
        { semana: 'Semana 2', peso: 0, repeticiones: 6 },
        { semana: 'Semana 3', peso: 0, repeticiones: 7 },
        { semana: 'Semana 4', peso: 0, repeticiones: 8 },
        { semana: 'Semana 5', peso: 0, repeticiones: 9 },
        { semana: 'Semana 6', peso: 0, repeticiones: 10 },
      ]
    }
  ];

  const [selectedEjercicioId, setSelectedEjercicioId] = useState(ejercicios[0].id);

  // Obtener el ejercicio seleccionado
  const ejercicioActual = ejercicios.find(e => e.id === selectedEjercicioId);
  const ultimoDato = ejercicioActual.historico[ejercicioActual.historico.length - 1];

  // Calcular progreso
  const primerDato = ejercicioActual.historico[0];
  const progressPeso = ((ultimoDato.peso - primerDato.peso) / (primerDato.peso || 1) * 100).toFixed(1);
  const progressReps = ultimoDato.repeticiones - primerDato.repeticiones;

  return (
    <div className={styles.progressContainer}>
      <h1>Tu Progreso</h1>

      {/* Selector de Ejercicios */}
      <div className={styles.filterSection}>
        <label htmlFor="ejercicio-select">Selecciona un ejercicio:</label>
        <select 
          id="ejercicio-select"
          className={styles.selectEjercicio}
          value={selectedEjercicioId}
          onChange={(e) => setSelectedEjercicioId(Number(e.target.value))}
        >
          {ejercicios.map(ejercicio => (
            <option key={ejercicio.id} value={ejercicio.id}>
              {ejercicio.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Gráfico de Progreso */}
      <div className={styles.chartWrapper}>
        <h2>{ejercicioActual.nombre}</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={ejercicioActual.historico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" />
            <YAxis yAxisId="left" label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Repeticiones', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            {ejercicioActual.historico.some(d => d.peso > 0) && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="peso" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }}
                name="Peso (kg)"
                strokeWidth={2}
              />
            )}
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="repeticiones" 
              stroke="#82ca9d" 
              activeDot={{ r: 8 }}
              name="Repeticiones"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Información del Ejercicio Actual */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Ejercicio</h3>
          <p className={styles.mainValue}>{ejercicioActual.nombre}</p>
          <span className={styles.subValue}>{ejercicioActual.musculos}</span>
        </div>

        <div className={styles.statCard}>
          <h3>Repeticiones Actuales</h3>
          <p className={styles.mainValue}>{ultimoDato.repeticiones}</p>
          <span className={styles.improvement}>
            {progressReps > 0 ? '+' : ''}{progressReps} reps
          </span>
        </div>

        {ultimoDato.peso > 0 && (
          <div className={styles.statCard}>
            <h3>Peso Actual</h3>
            <p className={styles.mainValue}>{ultimoDato.peso} kg</p>
            <span className={styles.improvement}>
              {progressPeso > 0 ? '+' : ''}{progressPeso}%
            </span>
          </div>
        )}

        <div className={styles.statCard}>
          <h3>Progreso Total</h3>
          <p className={styles.mainValue}>
            {Math.abs(progressReps) || Math.abs(progressPeso)}%
          </p>
          <span className={styles.subValue}>Mejora registrada</span>
        </div>
      </div>

      {/* Lista de Todos los Ejercicios */}
      <div className={styles.ejerciciosListSection}>
        <h2>Todos los Ejercicios de tu Rutina</h2>
        <div className={styles.ejerciciosList}>
          {ejercicios.map(ejercicio => {
            const ultimoRegistro = ejercicio.historico[ejercicio.historico.length - 1];
            return (
              <div 
                key={ejercicio.id}
                className={`${styles.ejercicioCard} ${selectedEjercicioId === ejercicio.id ? styles.active : ''}`}
                onClick={() => setSelectedEjercicioId(ejercicio.id)}
              >
                <div className={styles.cardHeader}>
                  <h3>{ejercicio.nombre}</h3>
                  <span className={styles.muscles}>{ejercicio.musculos}</span>
                </div>
                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.label}>Reps</span>
                    <span className={styles.value}>{ultimoRegistro.repeticiones}</span>
                  </div>
                  {ultimoRegistro.peso > 0 && (
                    <div className={styles.stat}>
                      <span className={styles.label}>Peso</span>
                      <span className={styles.value}>{ultimoRegistro.peso} kg</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Progress;
