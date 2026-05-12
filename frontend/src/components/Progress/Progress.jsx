import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import clases from "./Progress.module.css";

const Progress = ({ user }) => {
  const [ejercicios, setEjercicios] = useState([]);
  const [selectedEjercicio, setSelectedEjercicio] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`http://localhost:3000/progress/${user.id}`);
        const data = await res.json();
        setEjercicios(data);
        if (data.length > 0) setSelectedEjercicio(data[0]);
      } catch (error) {
        console.error("Error cargando progreso:", error);
      }
    };
    if (user?.id) fetchProgress();
  }, [user]);

  if (!selectedEjercicio) return <p>Cargando datos...</p>;

  const historico = selectedEjercicio.historico || [];
  const inicialPeso = historico[0]?.peso || 0;
  const actualPeso = historico[historico.length - 1]?.peso || 0;
  const mejoraPeso = inicialPeso > 0 ? (((actualPeso - inicialPeso) / inicialPeso) * 100).toFixed(0) : 0;
  const consistencia = Math.min(historico.length * 10, 100);

  const sesionesPorFecha = selectedEjercicio.sesionesCrudas || {};
  const fechasOrdenadas = Object.keys(sesionesPorFecha).sort((a, b) => {
    const [dA, mA, yA] = a.split("/");
    const [dB, mB, yB] = b.split("/");
    return new Date(`${yA}-${mA}-${dA}`) - new Date(`${yB}-${mB}-${dB}`);
  });

  const renderTarjetas = (fechas) =>
    fechas.map((fecha) => {
      const series = sesionesPorFecha[fecha];
      const mejor = [...series].sort((a, b) => b.peso - a.peso)[0];
      return (
        <div key={fecha} className={clases.sesionCard}>
          <div className={clases.sesionFecha}>{fecha}</div>
          <div className={clases.mejorSerieCard}>
            <span className={clases.mejorBadge}>Mejor serie</span>
            <div className={clases.serieData}>
              <div className={clases.serieDataItem}>
                <span className={clases.serieLabel}>Peso</span>
                <span className={clases.serieValue}>{mejor.peso} kg</span>
              </div>
              <div className={clases.serieDataItem}>
                <span className={clases.serieLabel}>Reps</span>
                <span className={clases.serieValue}>{mejor.repeticiones}</span>
              </div>
            </div>
          </div>
        </div>
      );
    });

  return (
    <div className={clases.divPadre}>
      <h1>Tu progreso</h1>

      <select
        onChange={(e) => {
          const ej = ejercicios.find(el => el.nombre === e.target.value);
          setSelectedEjercicio(ej);
        }}
      >
        {ejercicios.map((ej) => (
          <option key={ej.nombre} value={ej.nombre}>{ej.nombre}</option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={selectedEjercicio.historico}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semana" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="peso" stroke="#8884d8" name="Peso" />
          <Line yAxisId="right" type="monotone" dataKey="repeticiones" stroke="#82ca9d" name="Reps" />
        </LineChart>
      </ResponsiveContainer>

      {fechasOrdenadas.length > 0 && (
        <>
          <div className={clases.ultimaSesionWrapper}>
            <div className={clases.ultimaSesionHeader}>
              <h2 className={clases.ultimaSesionTitle}>Mejor serie por sesión</h2>
            </div>
            <div className={clases.seriesGrid}>
              {renderTarjetas(fechasOrdenadas)}
            </div>
          </div>

          <div className={clases.statsContainer}>
            <div className={clases.statCard}>
              <h3>Progreso de peso</h3>
              <p className={clases.improvement}>{mejoraPeso > 0 ? `+${mejoraPeso}` : mejoraPeso}%</p>
              <span>{inicialPeso}kg → {actualPeso}kg</span>
            </div>
            <div className={clases.statCard}>
              <h3>Último registro</h3>
              <p className={clases.improvement}>{actualPeso} kg</p>
              <span>Último peso registrado</span>
            </div>
            <div className={clases.statCard}>
              <h3>Consistencia</h3>
              <p className={clases.improvement}>{consistencia}%</p>
              <span>Basado en tus sesiones</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Progress;