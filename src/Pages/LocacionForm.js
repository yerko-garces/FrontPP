import React, { useState } from 'react';
import axios from 'axios';

function LocacionForm({ proyectoId, onSubmit }) {
  const [nombre, setNombre] = useState('');

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const locacion = {
        nombre,
        
        proyecto: { id: proyectoId },
      };
      await onSubmit(locacion);
      setNombre('');
    } catch (error) {
      console.error(error);
      // Manejar el error, mostrar mensaje al usuario
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="nombre">Nombre:</label>
        <input
          type="text"
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <button type="submit">Crear Locación</button>
    </form>
  );
}

export default LocacionForm;