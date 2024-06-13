import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const DiaDeRodaje = ({ bloque, handleEliminarBloque, handleGuardarBloque, dia, actualizarBloque }) => {
  const [titulo, setTitulo] = useState(bloque.titulo || '');
  const [fecha, setFecha] = useState(dayjs(bloque.fecha).isValid() ? dayjs(bloque.fecha).toDate() : new Date());
  const [hora, setHora] = useState(bloque.hora ? new Date(bloque.hora) : null);

  useEffect(() => {
    if (typeof bloque.hora === 'string') {
      setHora(bloque.hora);
    }
  }, [bloque.hora]);

  const handleTituloChange = (e) => {
    const newTitulo = e.target.value;
    setTitulo(newTitulo);
    actualizarBloque({ ...bloque, titulo: newTitulo }, dia);
  };

  const handleFechaChange = (date) => {
    setFecha(date);
    actualizarBloque({ ...bloque, fecha: date }, dia);
  };

  const handleHoraChange = (e) => {
    const newHora = e.target.value;
    setHora(newHora);
    actualizarBloque({ ...bloque, hora: newHora }, dia);
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
