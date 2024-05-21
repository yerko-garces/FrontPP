import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Assets/Login.css';

function Login() {
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/api/login', {
        nombre,
        contrasena,
      });

      const token = response.data;
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      // Mostrar mensaje de error al usuario
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Partner Prod</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de Usuario:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>
          <button type="submit">Iniciar Sesión</button>
        </form>
        <button className="register-button" onClick={() => navigate('/register')}>Registrarse</button>
      </div>
    </div>
  );
}

export default Login;