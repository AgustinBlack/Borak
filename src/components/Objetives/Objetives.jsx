import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Objetives.module.css';

const Objetives = () => {
  // Datos de ejemplo - evolución del entrenamiento mes a mes
  const trainingData = [
    { mes: 'Enero', repeticiones: 10, peso: 20 },
    { mes: 'Febrero', repeticiones: 12, peso: 22 },
    { mes: 'Marzo', repeticiones: 15, peso: 25 },
    { mes: 'Abril', repeticiones: 18, peso: 28 },
    { mes: 'Mayo', repeticiones: 22, peso: 32 },
    { mes: 'Junio', repeticiones: 25, peso: 35 },
  ];

  return (
    <div className={styles.objetivesContainer}>
      <h1>Evolución de tu Entrenamiento</h1>
      
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trainingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="repeticiones" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }}
              name="Repeticiones"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="peso" 
              stroke="#82ca9d" 
              activeDot={{ r: 8 }}
              name="Peso (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3>Repeticiones</h3>
          <p className={styles.improvement}>+150% mejora</p>
          <span>De 10 a 25 repeticiones</span>
        </div>
        <div className={styles.statCard}>
          <h3>Peso</h3>
          <p className={styles.improvement}>+75% mejora</p>
          <span>De 20 kg a 35 kg</span>
        </div>
        <div className={styles.statCard}>
          <h3>Consistencia</h3>
          <p className={styles.improvement}>100%</p>
          <span>Entrenamientos completados</span>
        </div>
      </div>
    </div>
  );
};

export default Objetives;
