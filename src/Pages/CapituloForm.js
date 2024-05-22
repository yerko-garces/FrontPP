import React, { useState } from 'react';

function CapituloForm({ proyectoId, capitulo, onSubmit }) {
  const [nombre, setNombre] = useState(capitulo ? capitulo.nombre_capitulo : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nombre_capitulo: nombre });
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
        />
      </div>
      {}
      <button type="submit">Crear Capítulo</button>
    </form>
  );
}

export default CapituloForm;
