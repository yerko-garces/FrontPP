import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DiaDeRodaje = ({
  bloque,
  handleEliminarBloque,
  dia,
  onTituloChange,
  onFechaChange,
  onHoraChange,
}) => {
  const [titulo, setTitulo] = useState(bloque.titulo || '');
  const [fecha, setFecha] = useState(dayjs(bloque.fecha).isValid() ? dayjs(bloque.fecha).toDate() : new Date());
  const [hora, setHora] = useState(bloque.hora || '');

  const handleEliminar = () => {
    handleEliminarBloque(bloque.id, dia);
  };

  const handleTituloChange = (e) => {
    setTitulo(e.target.value);
    onTituloChange(bloque.id, e.target.value);
  };

  const handleFechaChange = (date) => {
    setFecha(date);
    onFechaChange(bloque.id, date);
  };

  const handleHoraChange = (e) => {
    setHora(e.target.value);
    onHoraChange(bloque.id, e.target.value);
  };

  return (
    <div className="dia-de-rodaje">
      <input
        type="text"
        placeholder="Título del bloque"
        value={titulo}
        onChange={handleTituloChange}
      />
      <DatePicker
        selected={fecha}
        onChange={handleFechaChange}
        dateFormat="dd/MM/yyyy" // Cambio de formato de fecha
      />
      <input
        type="time"
        value={hora}
        onChange={handleHoraChange}
      />
      {bloque.escena ? (
        <div className="bloque-escena">
          <span>Escena:</span>
          <span>{bloque.escena.titulo_escena || 'Sin título'}</span>
          <span>Resumen:</span>
          <span>{bloque.escena.resumen || 'Sin título'}</span>
        </div>
      ) : (
        <div className="bloque-escena">
          <span>No hay escena asignada a este bloque</span>
        </div>
      )}
      <button className="eliminar-btn" onClick={handleEliminar}>Eliminar</button>
    </div>
  );
};

export default DiaDeRodaje;