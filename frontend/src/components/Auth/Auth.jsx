import { useState } from "react";
import Login from "../Login/Login";
import Register from "../Register/Register";

function Auth() {

  const [isLogin, setIsLogin] = useState(true);

  return (

    <div>

      {isLogin ? <Login /> : <Register />}

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