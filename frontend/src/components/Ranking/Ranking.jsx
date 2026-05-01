import { useState, useEffect } from "react";
import styles from "./Ranking.module.css";

const Ranking = ({ user }) => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await fetch("http://localhost:3000/ranking");
        const data = await res.json();
        setRanking(data);
      } catch (error) {
        console.error("Error cargando ranking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  if (loading) return <p>Cargando ranking...</p>;
  if (ranking.length === 0) return <p>No hay datos de ranking aún.</p>;

  const getInitials = (name) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const podium = [ranking[1], ranking[0], ranking[2]].filter(Boolean);
  const maxPuntos = Number(ranking[0]?.puntos) || 1;

  return (
    <div className={styles.rankingContainer}>
      <div className={styles.headerRow}>
        <h1>Ranking Borak</h1>
      </div>

      {ranking.length >= 1 && (
        <div className={styles.podium}>
          {podium.map((entry, i) => {
            const pos = i === 0 ? 2 : i === 1 ? 1 : 3;
            const isYou = entry.id === user?.id;
            return (
              <div
                key={entry.id}
                className={`${styles.podCard} ${styles[`pos${pos}`]} ${isYou ? styles.you : ""}`}
              >
                <div className={`${styles.podPos} ${styles[`posNum${pos}`]}`}>{pos}</div>
                <div className={`${styles.avatar} ${styles[`avatarPos${pos}`]}`}>
                  {getInitials(entry.name)}
                </div>
                <div className={styles.podName}>
                  {isYou ? "Vos" : entry.name.split(" ")[0]}
                </div>
                <div className={styles.podPts}>{entry.puntos} pts</div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.list}>
        {ranking.map((entry, index) => {
          const isYou = entry.id === user?.id;
          const pct = Math.round((Number(entry.puntos) / maxPuntos) * 100);
          return (
            <div
              key={entry.id}
              className={`${styles.row} ${isYou ? styles.youRow : ""}`}
            >
              <span className={styles.rowPos}>{index + 1}</span>
              <div className={`${styles.rowAvatar} ${isYou ? styles.youAvatar : ""}`}>
                {isYou ? "VOS" : getInitials(entry.name)}
              </div>
              <span className={styles.rowName}>
                {isYou ? `${entry.name} (vos)` : entry.name}
              </span>
              <div className={styles.barWrap}>
                <div className={styles.bar} style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.rowPts}>{entry.puntos} pts</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Ranking;