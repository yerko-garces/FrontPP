import React, { useState } from 'react';

const DiaDeRodaje = ({ dia, bloques, inventario, handleEliminarBloque, handleEliminarInventario, handleAgregarBloque }) => {
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleAgregarBloque(draggedItem, dia);
    setDraggedItem(null);
  };

  return (
    <div className="dia-de-rodaje" onDragOver={(e) => handleDragOver(e)} onDrop={(e) => handleDrop(e, null)}>
      <div className="dia-info">
        <h4>{dia}</h4>
        <p>Fecha: {bloques[0]?.fecha ? new Date(bloques[0].fecha).toLocaleDateString() : 'Sin fecha'}</p>
        <p>Hora: {bloques[0]?.hora ? new Date(bloques[0].hora).toLocaleTimeString() : 'Sin hora'}</p>
      </div>
      <div className="escenas-asignadas">
        <h5>Escenas:</h5>
        {bloques.length === 0 ? (
          <p>Ingresa tus escenas aquí</p>
        ) : (
          <ul>
            {bloques.map((bloque) => (
              <li
                key={bloque.id}
                className="escena-asignada"
                draggable
                onDragStart={(e) => handleDragStart(e, bloque)}
              >
                <span>{bloque.escena ? bloque.escena.titulo : bloque.titulo || 'Sin título'}</span>
                <button onClick={() => handleEliminarBloque(bloque, dia)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="inventario-asignado">
        <h5>Inventario:</h5>
        <ul>
          {inventario?.map((item) => (
            <li
              key={item.id}
              className="item-asignado"
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
            >
              <span>{item.nombre}</span>
              <button onClick={() => handleEliminarInventario(item, dia)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DiaDeRodaje;