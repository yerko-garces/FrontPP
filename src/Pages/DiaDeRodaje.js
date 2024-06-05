// DiaDeRodaje.js
import React, { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const DiaDeRodaje = ({ bloque, handleEliminarBloque, handleGuardarBloque }) => {
  const [titulo, setTitulo] = useState(bloque.titulo || '');
  const [fecha, setFecha] = useState(bloque.fecha || new Date());
  const [hora, setHora] = useState(bloque.hora || new Date());

  const handleTituloChange = (e) => {
    setTitulo(e.target.value);
  };

  const handleFechaChange = (e) => {
    setFecha(new Date(e.target.value));
  };

  const handleHoraChange = (e) => {
    setHora(new Date(`2000-01-01T${e.target.value}:00`));
  };

  const handleGuardar = () => {
    const bloqueActualizado = {
      ...bloque,
      titulo,
      fecha,
      hora,
    };
    handleGuardarBloque(bloqueActualizado);
  };

  return (
    <div className="dia-de-rodaje">
      <div className="bloque-asignado">
        <div className="bloque-info">
          <input type="text" value={titulo} onChange={handleTituloChange} placeholder="Título" />
          <input type="date" value={dayjs(fecha).format('YYYY-MM-DD')} onChange={handleFechaChange} />
          <input type="time" value={dayjs(hora).format('HH:mm')} onChange={handleHoraChange} />
        </div>
        <div className="bloque-escena">
        <span>{bloque.escena?.escena?.titulo_escena || 'Sin escena'}</span>
          <button onClick={() => handleEliminarBloque(bloque)}>Eliminar</button>
          <button onClick={handleGuardar}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default DiaDeRodaje;