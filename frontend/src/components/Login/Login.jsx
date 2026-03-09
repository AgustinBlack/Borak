import { useState, useEffect } from "react"
import initialUsers from "../../data/users.json"
import styles from "./Login.module.css"

const Login = ({ onLogin }) => {

  const [isLogin, setIsLogin] = useState(true)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("cliente")

  const [error, setError] = useState("")

  const [users, setUsers] = useState([])

  useEffect(() => {

    const storedUsers = localStorage.getItem("users")

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    } else {
      setUsers(initialUsers)
      localStorage.setItem("users", JSON.stringify(initialUsers))
    }

  }, [])

  const handleSubmit = (e) => {

    e.preventDefault()

    if (isLogin) {

      const user = users.find(
        u => u.email === email && u.password === password
      )

      if (!user) {
        setError("Email o contraseña incorrectos")
        return
      }

      localStorage.setItem("user", JSON.stringify(user))
      onLogin(user)

    } else {

      const userExists = users.find(u => u.email === email)

      if (userExists) {
        setError("El email ya existe")
        return
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role
      }

      const updatedUsers = [...users, newUser]

      setUsers(updatedUsers)

      localStorage.setItem("users", JSON.stringify(updatedUsers))
      localStorage.setItem("user", JSON.stringify(newUser))

      onLogin(newUser)

    }

  }

  return (

    <div className={styles.container}>

      <form className={styles.form} onSubmit={handleSubmit}>

        <h2>{isLogin ? "Login" : "Registro"}</h2>

        {!isLogin && (

          <>
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              required
            />

            <select
              value={role}
              onChange={(e)=>setRole(e.target.value)}
            >
              <option value="cliente">Cliente</option>
              <option value="pf">Personal Trainer</option>
            </select>
          </>

        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit">
          {isLogin ? "Ingresar" : "Registrarse"}
        </button>

        <p
          className={styles.switch}
          onClick={()=>setIsLogin(!isLogin)}
        >
          {isLogin
            ? "No tenés cuenta? Registrate"
            : "Ya tenés cuenta? Iniciar sesión"}
        </p>

      </form>

    </div>

  )

}

export default Login