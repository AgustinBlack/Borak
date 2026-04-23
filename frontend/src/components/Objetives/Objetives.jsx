import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Objetives.module.css';

const Objetives = ({ user }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Llamamos al endpoint de progreso que definimos en server.jsx
        const response = await fetch(`http://localhost:3000/progress/${user?.id}`);
        const result = await response.json();

        if (response.ok) {
          // El backend devuelve un array de ejercicios con su historial
          // Para el gráfico general, podemos usar el historial del primer ejercicio 
          // o mapear los datos según lo que necesites mostrar.
          if (result.length > 0) {
            setData(result[0].historico); // Usamos el histórico del primer ejercicio como ejemplo
          }
        }
      } catch (error) {
        console.error("Error al cargar objetivos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchProgress();
  }, [user]);

  if (loading) return <p className={styles.message}>Cargando tu evolución...</p>;

  // MENSAJE SI NO HAY DATOS (Lo que pediste)
  if (data.length === 0) {
    return (
      <div className={styles.objetivesContainer}>
        <h1>Evolución de tu Entrenamiento</h1>
        <div className={styles.noDataCard}>
          <p>No hay objetivos o progresos asignados aún.</p>
          <span>¡Sigue entrenando para empezar a ver tus métricas!</span>
        </div>
      </div>
    );
  }

  // Cálculos básicos para las tarjetas de stats basándonos en la DB
  const inicialPeso = data[0]?.peso || 0;
  const actualPeso = data[data.length - 1]?.peso || 0;
  const mejoraPeso = inicialPeso > 0 ? (((actualPeso - inicialPeso) / inicialPeso) * 100).toFixed(0) : 0;

  return (
    <div className={styles.objetivesContainer}>
      <h1>Evolución: {user.name}</h1>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="repeticiones"
              stroke="#8884d8"
              name="Reps"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="peso"
              stroke="#82ca9d"
              name="Peso (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3>Progreso Peso</h3>
          <p className={styles.improvement}>
            {mejoraPeso > 0 ? `+${mejoraPeso}` : mejoraPeso}% {mejoraPeso >= 0 ? 'mejora' : 'reducción'}</p>
          <span>De {inicialPeso}kg a {actualPeso}kg</span>
        </div>

        <div className={styles.statCard}>
          <h3>Última Marca</h3>
          <p className={styles.improvement}>{actualPeso} kg</p>
          <span>Peso máximo alcanzado</span>
        </div>

        <div className={styles.statCard}>
          <h3>Consistencia</h3>
          <p className={styles.improvement}>{Math.min(data.length * 10, 100)}%</p>
          <span>Basado en registros</span>
        </div>
      </div>
    </div>
  );
};

export default Objetives;