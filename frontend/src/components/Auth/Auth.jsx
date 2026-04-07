import { useState } from "react";
import Login from "../Login/Login";
import Register from "../Register/Register";
import styles from "./Auth.module.css";

function Auth({ onLogin }) {

  const [isLogin, setIsLogin] = useState(true);

  return (
    <div>
      {isLogin ? (
        <Login onLogin={onLogin} /> 
      ) : (
        <Register onLogin={onLogin} />
      )}

      {isLogin ? (
        <p>
          No tenés cuenta?{" "}
          <button className={styles.button} onClick={() => setIsLogin(false)}>
            Registrate
          </button>
        </p>
      ) : (
        <p>
          Ya tenés cuenta?{" "}
          <button onClick={() => setIsLogin(true)}>
            Iniciar sesión
          </button>
        </p>
      )}
    </div>
  );
}

export default Auth;