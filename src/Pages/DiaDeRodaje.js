import React, { useState } from 'react';
import dayjs from 'dayjs';

const DiaDeRodaje = ({ bloque, handleEliminarBloque, handleGuardarBloque, dia, actualizarBloque }) => {
  const [titulo, setTitulo] = useState(bloque.titulo || '');
  const [fecha, setFecha] = useState(dayjs(bloque.fecha).isValid() ? dayjs(bloque.fecha).toDate() : new Date());
  const [hora, setHora] = useState(bloque.hora ? new Date(`2000-01-01T${bloque.hora}:00Z`) : new Date());

  const handleTituloChange = (e) => {
    const newTitulo = e.target.value;
    setTitulo(newTitulo);
    actualizarBloque({ ...bloque, titulo: newTitulo }, dia);
  };
  
  const handleFechaChange = (e) => {
    const nuevaFecha = new Date(e.target.value);
    setFecha(nuevaFecha);
    actualizarBloque({ ...bloque, fecha: nuevaFecha }, dia);
  };

  const handleHoraChange = (e) => {
    const [horaStr, minutoStr] = e.target.value.split(':');
    const nuevaHora = new Date(fecha);
    nuevaHora.setHours(parseInt(horaStr, 10));
    nuevaHora.setMinutes(parseInt(minutoStr, 10));
    setHora(nuevaHora);
    actualizarBloque({ ...bloque, hora: nuevaHora }, dia);
  };

  const handleGuardar = () => {
    handleGuardarBloque({ ...bloque, titulo, fecha, hora });
  };

  const handleEliminar = () => {
    handleEliminarBloque(bloque.id, dia);
  };

   return (
    <div className="dia-de-rodaje">
      <input
        type="text"
        placeholder="Título del bloque"
        value={titulo}
        onChange={handleTituloChange}
      />
      <input
        type="date"
        value={dayjs(fecha).format('YYYY-MM-DD')} // Mostrar la fecha en formato 'YYYY-MM-DD'
        onChange={handleFechaChange}
      />
      <input
        type="time"
        value={`${hora.getHours()}:${hora.getMinutes().toString().padStart(2, '0')}`}
        onChange={handleHoraChange}
      />
      <button onClick={handleGuardar}>Guardar</button>
      <button onClick={handleEliminar}>Eliminar</button>
      {bloque.escena ? (
        <div className="bloque-escena">
          <span>Escena:</span>
          <span>{bloque.escena.titulo_escena || 'Sin título'}</span>
        </div>
      ) : (
        <div className="bloque-escena">
          <span>No hay escena asignada a este bloque</span>
        </div>
      )}
    </div>
  );
};

export default DiaDeRodaje;
