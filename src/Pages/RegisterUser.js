import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Assets/Login.css'; // Asegúrate de que la ruta sea correcta

function RegisterUser() {
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [popupMessage, setPopupMessage] = useState(''); // Estado para el mensaje del popup
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Estado para mostrar el mensaje de registro exitoso
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !contrasena) {
      setPopupMessage('Debes llenar todos los campos para poder registrarte');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/usuarios/registrar',
        {
          nombre,
          contrasena,
        }
      );

      console.log(response.data);
      setShowSuccessMessage(true); // Mostrar el mensaje de registro exitoso
    } catch (error) {
      console.error(error);
      setPopupMessage('Error al registrar usuario');
    }
  };

  const handleClosePopup = () => {
    setPopupMessage(''); // Cerrar el popup
  };

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage, navigate]);

  const handleGoToHome = () => {
    navigate('/'); // Redirigir a la página de inicio
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <h2>Registro de Usuario</h2>
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
            <button type="submit" className="register-button">
              Registrarse
            </button>
          </form>
          {popupMessage && (
            <div className="popup">
              <div className="popup-inner">
                <h3>{popupMessage}</h3>
                <button onClick={handleClosePopup}>Cerrar</button>
              </div>
            </div>
          )}
          {showSuccessMessage && (
            <div className="popup">
              <div className="popup-inner">
                <h3>Registro exitoso</h3>
              </div>
            </div>
          )}
          <button onClick={handleGoToHome} className="return-home-button">
            Volver a inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterUser;
