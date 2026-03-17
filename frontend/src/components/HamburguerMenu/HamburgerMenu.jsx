import { useState } from "react";
import { Link } from "react-router-dom";
import clases from "./Hamburger.module.css";

// 1. Recibimos 'user', 'logout' e 'isAdmin' como props
export default function HamburgerMenu({ user, logout, isAdmin }) {
  const [open, setOpen] = useState(false);

  // Función para cerrar el menú cuando se hace click en un link
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
        <ul onClick={closeMenu}> {/* Cerramos menú al tocar cualquier link */}
          <li><Link className={clases.link} to="/seccion/Rutina">Rutina</Link></li>
          <li><Link className={clases.link} to="/seccion/Progresos">Progresos</Link></li>
          <li><Link className={clases.link} to="/seccion/Objetivos">Objetivos</Link></li>
          <li><Link className={clases.link} to="/seccion/Perfil">Perfil</Link></li>
          <li><Link className={clases.link} to="/seccion/US">Nosotros</Link></li>

          {/* --- LO NUEVO: CONDICIONAL PARA ADMIN --- */}
          {isAdmin && (
            <li>
              <Link 
                className={clases.link} 
                to="/seccion/AdministrarPerfiles"
                style={{ color: "#ffcc00", fontWeight: "bold" }}
              >
                Administrar perfiles
              </Link>
            </li>
          )}

          <button 
            onClick={logout} 
            className={clases.logoutBtn}
            style={{ marginTop: "20px" }}
          >
            Cerrar sesión
          </button>
        </ul>
      </div>
    </>
  );
}