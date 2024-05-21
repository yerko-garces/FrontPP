import React, { useState } from 'react';
import axios from 'axios';

function PersonajeForm({ proyectoId, onSubmit }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const personaje = {
        nombre,
        descripcion,
        proyecto: { id: proyectoId },
      };
      await onSubmit(personaje);
      setNombre('');
      setDescripcion('');
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
      <div>
        <label htmlFor="descripcion">Descripción:</label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />
      </div>
      <button type="submit">Crear Personaje</button>
    </form>
  );
}

export default PersonajeForm;