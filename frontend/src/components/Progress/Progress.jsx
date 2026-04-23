import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const Progress = ({ user }) => {

  const [ejercicios, setEjercicios] = useState([]);
  const [selectedEjercicio, setSelectedEjercicio] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`http://localhost:3000/progress/${user.id}`);
        const data = await res.json();

        const dataAgrupada = data.map(ejercicio => {
          const historicoSimplificado = [];
          const visitasPorFecha = {};

          ejercicio.historico.forEach(log => {
            const fecha = log.semana;

            if (!visitasPorFecha[fecha]) {
              visitasPorFecha[fecha] = {
                semana: fecha,
                peso: Number(log.peso),
                repeticiones: Number(log.repeticiones)
              };
              historicoSimplificado.push(visitasPorFecha[fecha]);
            } else {
              // 🔥 CORRECCIÓN: Si el peso de esta serie es mayor al que ya guardamos,
              // actualizamos tanto el peso como las repeticiones de ESA serie específica.
              if (Number(log.peso) > visitasPorFecha[fecha].peso) {
                visitasPorFecha[fecha].peso = Number(log.peso);
                visitasPorFecha[fecha].repeticiones = Number(log.repeticiones);
              }
            }
          });

          return {
            ...ejercicio,
            historico: historicoSimplificado
          };
        });

        setEjercicios(dataAgrupada);
        if (dataAgrupada.length > 0) {
          setSelectedEjercicio(dataAgrupada[0]);
        }
      } catch (error) {
        console.error("Error cargando progreso:", error);
      }
    };

    if (user?.id) fetchProgress();
  }, [user]);

  if (!selectedEjercicio || !selectedEjercicio.historico) {
    return <p>Cargando datos o no hay historial para este ejercicio...</p>;
  }

  const ultimo = selectedEjercicio?.historico?.[selectedEjercicio.historico.length - 1];

  return (
    <div>

      <h1>Tu progreso</h1>

      <select
        onChange={(e) => {
          const ejercicio = ejercicios.find(el => el.nombre === e.target.value);
          setSelectedEjercicio(ejercicio);
        }}
      >

        {ejercicios.map((ej) => (
          <option key={ej.nombre} value={ej.nombre}>
            {ej.nombre}
          </option>
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

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="peso"
            stroke="#8884d8"
            name="Peso"
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="repeticiones"
            stroke="#82ca9d"
            name="Reps"
          />

        </LineChart>

      </ResponsiveContainer>

      <h3>Último entrenamiento</h3>

      <p>Peso: {ultimo.peso} kg</p>
      <p>Reps: {ultimo.repeticiones}</p>

    </div>
  );

};

export default Progress;

// import { useState, useEffect } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer
// } from "recharts";

// const Progress = ({ user }) => {

//   const [ejercicios, setEjercicios] = useState([]);
//   const [selectedEjercicio, setSelectedEjercicio] = useState(null);

//   useEffect(() => {
//     const fetchProgress = async () => {
//       try {
//         const res = await fetch(`http://localhost:3000/progress/${user.id}`);
//         const data = await res.json();

//         const dataAgrupada = data.map(ejercicio => {
//           const historicoSimplificado = [];
//           const visitasPorFecha = {};

//           ejercicio.historico.forEach(log => {
//             const fecha = log.semana;

//             if (!visitasPorFecha[fecha]) {
//               visitasPorFecha[fecha] = {
//                 semana: fecha,
//                 peso: Number(log.peso),
//                 repeticiones: Number(log.repeticiones)
//               };
//               historicoSimplificado.push(visitasPorFecha[fecha]);
//             } else {
//               if (Number(log.peso) > visitasPorFecha[fecha].peso) {
//                 visitasPorFecha[fecha].peso = Number(log.peso);
//                 visitasPorFecha[fecha].repeticiones = Number(log.repeticiones);
//               }
//             }
//           });

//           return {
//             ...ejercicio,
//             historico: historicoSimplificado
//           };
//         });

//         setEjercicios(dataAgrupada);
//         if (dataAgrupada.length > 0) {
//           setSelectedEjercicio(dataAgrupada[0]);
//         }
//       } catch (error) {
//         console.error("Error cargando progreso:", error);
//       }
//     };

//     if (user?.id) fetchProgress();
//   }, [user]);

//   if (!selectedEjercicio || !selectedEjercicio.historico) {
//     return <p>Cargando datos o no hay historial para este ejercicio...</p>;
//   }

//   // 🔥 NUEVO: cálculo dinámico de máximos
//   const maxPeso = Math.max(
//     ...selectedEjercicio.historico.map(d => d.peso)
//   );

//   const maxReps = Math.max(
//     ...selectedEjercicio.historico.map(d => d.repeticiones)
//   );

//   const ultimo = selectedEjercicio.historico[selectedEjercicio.historico.length - 1];

//   return (
//     <div>

//       <h1>Tu progreso</h1>

//       <select
//         onChange={(e) => {
//           const ejercicio = ejercicios.find(el => el.nombre === e.target.value);
//           setSelectedEjercicio(ejercicio);
//         }}
//       >
//         {ejercicios.map((ej) => (
//           <option key={ej.nombre} value={ej.nombre}>
//             {ej.nombre}
//           </option>
//         ))}
//       </select>

//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={selectedEjercicio.historico}>

//           <CartesianGrid strokeDasharray="3 3" />

//           <XAxis dataKey="semana" />

//           {/* 🔥 PESO DINÁMICO */}
//           <YAxis
//             yAxisId="left"
//             domain={[0, Math.ceil(maxPeso * 1.3)]}
//           />

//           {/* 🔥 REPS DINÁMICO */}
//           <YAxis
//             yAxisId="right"
//             orientation="right"
//             domain={[0, Math.ceil(maxReps * 1.3)]}
//           />

//           <Tooltip />
//           <Legend />

//           <Line
//             yAxisId="left"
//             type="monotone"
//             dataKey="peso"
//             stroke="#8884d8"
//             name="Peso"
//           />

//           <Line
//             yAxisId="right"
//             type="monotone"
//             dataKey="repeticiones"
//             stroke="#82ca9d"
//             name="Reps"
//           />

//         </LineChart>
//       </ResponsiveContainer>

//       <h3>Último entrenamiento</h3>
//       <p>Peso: {ultimo.peso} kg</p>
//       <p>Reps: {ultimo.repeticiones}</p>

//     </div>
//   );
// };

// export default Progress;