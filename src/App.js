import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import RegisterUser from './Pages/RegisterUser';
import Dashboard from './Pages/Dashboard';
import Home from './Pages/Home';
import PlanDeRodaje from './Pages/PlanDeRodaje'; // Importar el componente PlanDeRodaje

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:projectId" element={<Dashboard />} />
          <Route path="/plan-de-rodaje" element={<PlanDeRodaje />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;