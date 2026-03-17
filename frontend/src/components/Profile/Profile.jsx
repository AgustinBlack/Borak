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
    const updatedObjetivos = [...formData.objetivos];
    updatedObjetivos[index] = value;

    setFormData({
      ...formData,
      objetivos: updatedObjetivos
    });
  };

  const handleAddObjetivo = () => {
    setFormData({
      ...formData,
      objetivos: [...formData.objetivos, '']
    });
  };

  const handleRemoveObjetivo = (index) => {
    const updatedObjetivos = formData.objetivos.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      objetivos: updatedObjetivos
    });
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
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

        {/* Header */}
        <div className={styles.profileHeader}>
          <img 
            src={profile.avatar} 
            alt="Avatar del usuario" 
            className={styles.avatar}
          />

          <div className={styles.headerInfo}>
            <h1>{profile.nombre} {profile.apellido}</h1>
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

        {/* Contenido */}
        <div className={styles.profileContent}>
          {isEditing ? (

            // MODO EDICIÓN
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
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
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
                  <label>Peso (kg)</label>
                  <input
                    type="number"
                    name="peso"
                    value={formData.peso}
                    onChange={handleInputChange}
                    step="0.1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Altura (cm)</label>
                  <input
                    type="number"
                    name="altura"
                    value={formData.altura}
                    onChange={handleInputChange}
                    step="0.1"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Objetivos</label>

                <div className={styles.objetivosList}>
                  {formData.objetivos.map((objetivo, index) => (
                    <div key={index} className={styles.objetivoInput}>

                      <input
                        type="text"
                        value={objetivo}
                        onChange={(e) => handleObjetivoChange(index, e.target.value)}
                        placeholder={`Objetivo ${index + 1}`}
                      />

                      {formData.objetivos.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => handleRemoveObjetivo(index)}
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
                  Guardar cambios
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

            // MODO VISUALIZACIÓN
            <>
              <div className={styles.infoSection}>
                <h2>Información Personal</h2>

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
                <h2>Tus Objetivos</h2>

                <ul className={styles.objetivosList}>
                  {profile.objetivos.map((objetivo, index) => (
                    <li key={index} className={styles.objetivoItem}>
                      <span className={styles.bullet}>✓</span>
                      {objetivo}
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
