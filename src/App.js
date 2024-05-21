import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterUser from './Pages/RegisterUser';

import Dashboard from './Pages/Dashboard';
import Home from './Pages/Home'; // Importar el componente Home

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route exact path="/" element={<Home />} /> {/* Renderizar el componente Home en la ruta raíz */}
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:projectId" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;