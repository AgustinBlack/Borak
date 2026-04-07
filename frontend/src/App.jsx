import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom"; 
import { useState, useEffect } from 'react';
import './App.css';

import Nav from './components/Nav/Nav';
import Home from './components/Home/Home';
import Rutine from './components/Rutine/Rutine';
import Progress from './components/Progress/Progress';
import Objetives from './components/Objetives/Objetives';
import Profile from './components/Profile/Profile';
import Us from './components/Us/Us';
import AdminClients from './components/AdminClients/AdminClients';
import Auth from './components/Auth/Auth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const isAdmin = user?.role === 'pf';

  return (
    <BrowserRouter>
      <Nav user={user} logout={handleLogout} isAdmin={isAdmin} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/seccion/Rutina" element={<Rutine user={user} />} />
        <Route path="/seccion/Objetivos" element={<Objetives user={user} />} />        
        <Route path='/seccion/Progresos' element={<Progress user={user} />} />        
        <Route path="/seccion/Perfil" element={<Profile user={user} />} />        
        <Route path="/seccion/Us" element={<Us />} />
        <Route
          path="/seccion/AdministrarPerfiles"
          element={isAdmin ? <AdminClients user={user} /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;