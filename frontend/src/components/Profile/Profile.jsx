import { useState, useEffect } from 'react';
import styles from './Profile.module.css';

const Profile = ({ user }) => {

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/profile/${user.id}`);
        const data = await res.json();

        setProfile(data);
        setFormData(data);

      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };

    if (user?.id) {
      fetchProfile();
    }

  }, [user]);

  if (!profile) {
    return <p>Cargando perfil...</p>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === 'peso' || name === 'altura'
        ? parseFloat(value)
        : value
    });
  };

  const handleObjetivoChange = (index, value) => {
    const updated = [...formData.objetivos];
    updated[index] = value;

    setFormData({
      ...formData,
      objetivos: updated
    });
  };

  const handleAddObjetivo = () => {
    setFormData({
      ...formData,
      objetivos: [...formData.objetivos, '']
    });
  };

  const handleRemoveObjetivo = (index) => {
    const updated = formData.objetivos.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      objetivos: updated
    });
  };

  // 🔥 AHORA GUARDA EN BACKEND
  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:3000/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      setProfile(data);
      setIsEditing(false);

    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const calculateIMC = () => {
    const alturaEnMetros = profile.altura / 100;
    return (profile.peso / (alturaEnMetros * alturaEnMetros)).toFixed(1);
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>

        {/* HEADER */}
        <div className={styles.profileHeader}>
          <img 
            src={profile.avatar} 
            alt="Avatar" 
            className={styles.avatar}
          />

          <div className={styles.headerInfo}>
            <h1>{profile.nombre}</h1>
            <p>{profile.email}</p>
          </div>

          <button 
            className={styles.editBtn}
            onClick={() => {
              setIsEditing(!isEditing);
              setFormData(profile);
            }}
          >
            {isEditing ? '✕' : '✎ Editar'}
          </button>
        </div>

        <div className={styles.profileContent}>
          {isEditing ? (

            <form className={styles.editForm}>

              <div className={styles.formGroup}>
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Peso</label>
                  <input
                    type="number"
                    name="peso"
                    value={formData.peso}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Altura</label>
                  <input
                    type="number"
                    name="altura"
                    value={formData.altura}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Experiencia</label>
                <input
                  type="text"
                  name="experiencia"
                  value={formData.experiencia}
                  onChange={handleInputChange}
                />
              </div>

              {/* OBJETIVOS */}
              <div className={styles.formGroup}>
                <label>Objetivos</label>

                <div className={styles.objetivosList}>
                  {formData.objetivos.map((obj, i) => (
                    <div key={i} className={styles.objetivoInput}>
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => handleObjetivoChange(i, e.target.value)}
                      />

                      {formData.objetivos.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => handleRemoveObjetivo(i)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className={styles.addObjetivoBtn}
                  onClick={handleAddObjetivo}
                >
                  + Agregar objetivo
                </button>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleSave}
                >
                  Guardar
                </button>

                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>

            </form>

          ) : (

            <>
              <div className={styles.infoSection}>
                <h2>Información</h2>

                <div className={styles.infoGrid}>
                  <div className={styles.infoCard}>
                    <span className={styles.label}>Peso</span>
                    <p className={styles.value}>{profile.peso} kg</p>
                  </div>

                  <div className={styles.infoCard}>
                    <span className={styles.label}>Altura</span>
                    <p className={styles.value}>{profile.altura} cm</p>
                  </div>

                  <div className={styles.infoCard}>
                    <span className={styles.label}>IMC</span>
                    <p className={styles.value}>{calculateIMC()}</p>
                  </div>
                </div>
              </div>

              <div className={styles.objetivosSection}>
                <h2>Objetivos</h2>

                <ul className={styles.objetivosList}>
                  {profile.objetivos.map((obj, i) => (
                    <li key={i} className={styles.objetivoItem}>
                      <span className={styles.bullet}>✓</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;