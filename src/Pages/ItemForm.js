import React, { useState } from 'react';

function ItemForm({ item, onSubmit }) {
  const [nombre, setNombre] = useState(item ? item.nombre : '');
  const [cantidad, setCantidad] = useState(item ? item.cantidad : 0);
  const [categoria, setCategoria] = useState(item ? item.categoria : 'AUDIO');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nombre, cantidad, categoria });
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
      <div>
        <label htmlFor="cantidad">Cantidad:</label>
        <input
          type="number"
          id="cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(parseInt(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="categoria">Categoría:</label>
        <select
          id="categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="AUDIO">Audio</option>
          <option value="ILUMINACION">Iluminación</option>
          <option value="CAMARAS">Cámaras</option>
          <option value="GRIPERIA">Gripería</option>
        </select>
      </div>
      <button type="submit">{item ? 'Actualizar Item' : 'Crear Item'}</button>
    </form>
  );
}

export default ItemForm;