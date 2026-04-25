// import { useState, useEffect, useRef } from "react";
// import {
//   LineChart, Line, XAxis, YAxis,
//   CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from "recharts";
// import clases from "./Progress.module.css";

// const Progress = ({ user }) => {
//   const [ejercicios, setEjercicios] = useState([]);
//   const [selectedEjercicio, setSelectedEjercicio] = useState(null);
//   const [modalAbierto, setModalAbierto] = useState(false);
//   const modalRef = useRef(null);

//   useEffect(() => {
//     const fetchProgress = async () => {
//       try {
//         const res = await fetch(`http://localhost:3000/progress/${user.id}`);
//         const data = await res.json();
//         setEjercicios(data);
//         if (data.length > 0) setSelectedEjercicio(data[0]);
//       } catch (error) {
//         console.error("Error cargando progreso:", error);
//       }
//     };
//     if (user?.id) fetchProgress();
//   }, [user]);

//   // Cerrar modal clickeando fuera
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (modalRef.current && !modalRef.current.contains(e.target)) {
//         setModalAbierto(false);
//       }
//     };
//     if (modalAbierto) document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [modalAbierto]);

//   if (!selectedEjercicio) return <p>Cargando datos...</p>;

//   // Mejor serie por fecha (de todo el historial, no solo el último)
//   const sesionesPorFecha = selectedEjercicio.sesionesCrudas || {};
//   const fechasOrdenadas = Object.keys(sesionesPorFecha).sort((a, b) => {
//     const [dA, mA, yA] = a.split("/");
//     const [dB, mB, yB] = b.split("/");
//     return new Date(`${yA}-${mA}-${dA}`) - new Date(`${yB}-${mB}-${dB}`);
//   });

//   const LIMITE_VISIBLE = 4;
//   const hayMuchas = fechasOrdenadas.length > LIMITE_VISIBLE;
//   const fechasVisibles = fechasOrdenadas.slice(-LIMITE_VISIBLE);

//   const renderTarjetas = (fechas) =>
//     fechas.map((fecha) => {
//       const series = sesionesPorFecha[fecha];
//       const mejor = [...series].sort((a, b) => b.peso - a.peso)[0];
//       return (
//         <div key={fecha} className={clases.sesionCard}>
//           <div className={clases.sesionFecha}>{fecha}</div>
//           <div className={clases.mejorSerieCard}>
//             <span className={clases.mejorBadge}>Mejor serie</span>
//             <div className={clases.serieData}>
//               <div className={clases.serieDataItem}>
//                 <span className={clases.serieLabel}>Peso</span>
//                 <span className={clases.serieValue}>{mejor.peso} kg</span>
//               </div>
//               <div className={clases.serieDataItem}>
//                 <span className={clases.serieLabel}>Reps</span>
//                 <span className={clases.serieValue}>{mejor.repeticiones}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     });

//   return (
//     <div className={clases.divPadre}>
//       <h1>Tu progreso</h1>

//       <select
//         onChange={(e) => {
//           const ej = ejercicios.find(el => el.nombre === e.target.value);
//           setSelectedEjercicio(ej);
//           setModalAbierto(false);
//         }}
//       >
//         {ejercicios.map((ej) => (
//           <option key={ej.nombre} value={ej.nombre}>{ej.nombre}</option>
//         ))}
//       </select>

//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={selectedEjercicio.historico}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="semana" />
//           <YAxis yAxisId="left" />
//           <YAxis yAxisId="right" orientation="right" />
//           <Tooltip />
//           <Legend />
//           <Line yAxisId="left" type="monotone" dataKey="peso" stroke="#8884d8" name="Peso" />
//           <Line yAxisId="right" type="monotone" dataKey="repeticiones" stroke="#82ca9d" name="Reps" />
//         </LineChart>
//       </ResponsiveContainer>

//       {fechasOrdenadas.length > 0 && (
//         <div className={clases.ultimaSesionWrapper}>
//           <div className={clases.ultimaSesionHeader}>
//             <h2 className={clases.ultimaSesionTitle}>Mejor serie por sesión</h2>
//             {hayMuchas && (
//               <button
//                 className={clases.verTodoBtn}
//                 onClick={() => setModalAbierto(true)}
//               >
//                 Ver todo el historial
//               </button>
//             )}
//           </div>
//           <div className={clases.seriesGrid}>
//             {renderTarjetas(fechasVisibles)}
//           </div>
//         </div>
//       )}

//       {/* MODAL */}
//       {modalAbierto && (
//         <div className={clases.modalOverlay}>
//           <div className={clases.modalContent} ref={modalRef}>
//             <div className={clases.modalHeader}>
//               <h2>{selectedEjercicio.nombre} — historial completo</h2>
//               <button
//                 className={clases.modalClose}
//                 onClick={() => setModalAbierto(false)}
//               >
//                 ✕
//               </button>
//             </div>
//             <div className={clases.modalScroll}>
//               <div className={clases.seriesGridModal}>
//                 {renderTarjetas(fechasOrdenadas)}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Progress;

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
        <div className={clases.ultimaSesionWrapper}>
          <div className={clases.ultimaSesionHeader}>
            <h2 className={clases.ultimaSesionTitle}>Mejor serie por sesión</h2>
          </div>
          <div className={clases.seriesGrid}>
            {renderTarjetas(fechasOrdenadas)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;