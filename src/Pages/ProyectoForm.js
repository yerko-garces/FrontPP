import React, { useState } from 'react';

function ProyectoForm({ usuarioId, proyecto, onSubmit }) {
  const [titulo, setTitulo] = useState(proyecto ? proyecto.titulo : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ titulo });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="titulo">Título:</label>
        <input
          type="text"
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>
      <button type="submit">{proyecto ? 'Actualizar Proyecto' : 'Crear Proyecto'}</button>
    </form>
  );
}

export default ProyectoForm;