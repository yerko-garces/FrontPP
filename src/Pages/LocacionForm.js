import React, { useState } from 'react';

function LocacionForm({ proyectoId, onSubmit }) {
  const [nombre, setNombre] = useState('');

  const handleSubmit = () => {
    onSubmit({
      nombre,
      proyecto: { id: proyectoId },
    });
    setNombre(''); // Limpiar el formulario
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
      <button type="button" onClick={handleSubmit}>Crear Locación</button>
    </div>
  );
}

export default LocacionForm;