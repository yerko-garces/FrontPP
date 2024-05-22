import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Assets/Login.css';

function Login() {
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Estado para el mensaje de error
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !contrasena) {
      setErrorMessage('Rellene todos los campos para ingresar');
      return;
    }

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
      setErrorMessage('Nombre de usuario o contraseña incorrecta');
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
        {errorMessage && (
          <div className="popup">
            <div className="popup-inner">
              <h3>{errorMessage}</h3>
              <button onClick={() => setErrorMessage('')}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
