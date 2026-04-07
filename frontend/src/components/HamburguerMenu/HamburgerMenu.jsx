import { useState } from "react";
import { Link } from "react-router-dom";
import clases from "./Hamburger.module.css";

export default function HamburgerMenu({ user, logout, isAdmin }) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <div
        className={`${clases.hamburger} ${open ? clases.open : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span />
        <span />
        <span />
      </div>

      <div className={`${clases.menu} ${open ? clases.show : ""}`}>
        <ul onClick={closeMenu}>
          <li><Link className={clases.link} to="/seccion/Rutina">Rutina</Link></li>
          <li><Link className={clases.link} to="/seccion/Progresos">Progresos</Link></li>
          <li><Link className={clases.link} to="/seccion/Objetivos">Objetivos</Link></li>
          <li><Link className={clases.link} to="/seccion/Perfil">Perfil</Link></li>
          <li><Link className={clases.link} to="/seccion/US">Nosotros</Link></li>

          {isAdmin && (
            <li>
              <Link
                className={clases.link}
                to="/seccion/AdministrarPerfiles"
                style={{ color: "#181710", fontWeight: "bold" }}
              >
                Administrar perfiles
              </Link>
            </li>
          )}

          <button
            onClick={logout}
            className={clases.logoutBtn}
            style={{
              marginTop: "20px", padding: "0.7rem",
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cerrar sesión
          </button>
        </ul>
      </div>
    </>
  );
}