import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Login/Login'
import Home from './components/Home/Home'
import './App.css'
import Nav from './components/Nav/Nav'
import Rutine from './components/Rutine/Rutine'
import Progress from './components/Progress/Progress'
import Objetives from './components/Objetives/Objetives'
import Profile from './components/Profile/Profile'
import Us from './components/Us/Us'

function App() {

  const [user, setUser] = useState(null)

  useEffect(() => {

    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

  }, [])

  const handleLogout = () => {

    localStorage.removeItem("user")
    setUser(null)

  }

  // SI NO ESTA LOGUEADO
  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (

    <BrowserRouter>
      <Home/>
      <Nav />

      <h1>Bienvenido {user.name}</h1>

      <button onClick={handleLogout}>
        Cerrar sesión
      </button>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path='/seccion/Rutina'
          element={<Rutine user={user} />}
        />

        <Route
          path='/seccion/Objetivos'
          element={<Objetives />}
        />

        <Route
          path='/seccion/Progresos'
          element={<Progress />}
        />

        <Route
          path='/seccion/Perfil'
          element={<Profile user={user} />}
        />

        <Route
          path='/seccion/Us'
          element={<Us />}
        />

      </Routes>

    </BrowserRouter>

  )
}

export default App