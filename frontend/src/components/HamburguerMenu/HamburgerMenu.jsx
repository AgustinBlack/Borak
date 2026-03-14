import { useState } from "react";
import { Link } from "react-router-dom";
import clases from "./Hamburger.module.css";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogout = () => {

    localStorage.removeItem("user")
    setUser(null)

  }

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
        <ul>
          <Link className={clases.link} to="/seccion/Rutina">Rutina</Link>
          <Link className={clases.link} to="/seccion/Progresos">Progresos</Link>
          <Link className={clases.link} to="/seccion/Objetivos">Objetivos</Link>
          <Link className={clases.link} to="/seccion/Perfil">Perfil</Link>
          <Link className={clases.link} to="/seccion/US">Nosotros</Link>
          <Link className={clases.link} to="/seccion/AdministrarPerfiles">Administrar perfiles</Link>

          <button onClick={handleLogout}>
            Cerrar sesión
          </button>
        </ul>
      </div>
    </>
  );
}