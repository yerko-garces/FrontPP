// EscenaForm.js
import React, { useState, useEffect } from 'react';

import '../Assets/Forms.css';

function EscenaForm({ capituloId, escena, personajes, locaciones, items, onSubmit }) {
  const [tituloEscena, setTituloEscena] = useState(escena ? escena.titulo_escena : '');
  const [numeroEscena, setNumeroEscena] = useState(escena ? escena.numeroEscena : '');
  const [interiorExterior, setInteriorExterior] = useState(escena ? escena.interior_exterior : 'INTERIOR');
  const [diaNoche, setDiaNoche] = useState(escena ? escena.dia_noche : 'DIA');
  const [resumen, setResumen] = useState(escena ? escena.resumen : '');
  const [selectedPersonajes, setSelectedPersonajes] = useState(escena ? escena.personajes.map(p => p.id) : []);
  const [selectedLocacion, setSelectedLocacion] = useState(escena ? (escena.locacion ? escena.locacion.id : null) : null);
  const [selectedItems, setSelectedItems] = useState(escena ? escena.items.map(i => i.id) : []);

  useEffect(() => {
    if (escena) {
      setTituloEscena(escena.titulo_escena);
      setNumeroEscena(escena.numeroEscena);
      setInteriorExterior(escena.interior_exterior);
      setDiaNoche(escena.dia_noche);
      setResumen(escena.resumen);
      setSelectedPersonajes(escena.personajes.map(p => p.id));
      setSelectedLocacion(escena.locacion ? escena.locacion.id : null);
      setSelectedItems(escena.items.map(i => i.id));
    }
  }, [escena]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      titulo_escena: tituloEscena,
      numeroEscena,
      interior_exterior: interiorExterior,
      dia_noche: diaNoche,
      resumen,
      personajes: selectedPersonajes,
      locacion: selectedLocacion,
      items: selectedItems,
    });
  };

  const handlePersonajeChange = (personajeId) => {
    if (selectedPersonajes.includes(personajeId)) {
      setSelectedPersonajes(selectedPersonajes.filter(id => id !== personajeId));
    } else {
      setSelectedPersonajes([...selectedPersonajes, personajeId]);
    }
  };

  const handleItemChange = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        
        <label htmlFor="tituloEscena">Numero Escena:</label>
        <input
          type="text"
          id="tituloEscena"
          value={tituloEscena}
          onChange={(e) => setTituloEscena(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="numeroEscena">Take:</label> 
        <input
          type="text"
          id="numeroEscena"
          value={numeroEscena}
          onChange={(e) => setNumeroEscena(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="interiorExterior">Interior/Exterior:</label>
        <select
          id="interiorExterior"
          value={interiorExterior}
          onChange={(e) => setInteriorExterior(e.target.value)}
        >
          <option value="INTERIOR">Interior</option>
          <option value="EXTERIOR">Exterior</option>
        </select>
      </div>
      <div>
        <label htmlFor="diaNoche">Día/Noche:</label>
        <select
          id="diaNoche"
          value={diaNoche}
          onChange={(e) => setDiaNoche(e.target.value)}
        >
          <option value="DIA">Día</option>
          <option value="NOCHE">Noche</option>
        </select>
      </div>
      <div>
        <label htmlFor="resumen">Resumen:</label>
        <textarea
          id="resumen"
          value={resumen}
          onChange={(e) => setResumen(e.target.value)}
        />
      </div>
      <div>
        <label>Personajes:</label>
        {Array.isArray(personajes) && personajes.map(personaje => (
          <div key={personaje.id}>
            <input
              type="checkbox"
              value={personaje.id}
              checked={selectedPersonajes.includes(personaje.id)}
              onChange={() => handlePersonajeChange(personaje.id)}
            />
            <label>{personaje.nombre}</label>
          </div>
        ))}
      </div>
      <div>
        <label>Locación:</label>
        <select value={selectedLocacion || ''} onChange={(e) => setSelectedLocacion(parseInt(e.target.value))}>
          <option value="">Seleccionar locación</option>
          {Array.isArray(locaciones) && locaciones.map(locacion => (
            <option key={locacion.id} value={locacion.id}>{locacion.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Items:</label>
        {Array.isArray(items) && items.map(item => (
          <div key={item.id}>
            <input
              type="checkbox"
              value={item.id}
              checked={selectedItems.includes(item.id)}
              onChange={() => handleItemChange(item.id)}
            />
            <label>{item.nombre}</label>
          </div>
        ))}
      </div>
      <button type="submit">{escena ? 'Actualizar Escena' : 'Crear Escena'}</button>
    </form>
  );
}

export default EscenaForm;
