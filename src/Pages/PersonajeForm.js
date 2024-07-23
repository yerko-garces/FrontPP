// PersonajeForm.jsx
import React, { useState } from 'react';

function PersonajeForm({ proyectoId, onSubmit }) {
  const [nombre, setNombre] = useState('');

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const personaje = {
        nombre,
        proyecto: { id: proyectoId },
      };

      console.log('Enviando personaje:', personaje);

      await onSubmit(personaje);
      setNombre('');
    } catch (error) {
      console.error('Error al enviar personaje:', error);
    }
  };

  return (
    <div>
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
      <button type="button" onClick={handleSubmit}>Crear Personaje</button>
    </div>
  );
}

export default PersonajeForm;