import { useState } from "react";
import Login from "../Login/Login";
import Register from "../Register/Register";

// 1. Recibimos onLogin de App.jsx
function Auth({ onLogin }) {

  const [isLogin, setIsLogin] = useState(true);

  return (
    <div>
      {/* 2. Se la pasamos a los componentes hijos */}
      {isLogin ? (
        <Login onLogin={onLogin} /> 
      ) : (
        <Register onLogin={onLogin} />
      )}

      {isLogin ? (
        <p>
          No tenés cuenta?{" "}
          <button onClick={() => setIsLogin(false)}>
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