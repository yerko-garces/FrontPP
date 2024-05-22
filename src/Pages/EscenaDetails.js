import React, { useState, useEffect } from 'react';
import '../Assets/EscenaDetails.css';

function EscenaDetails({ escena, personajes, locaciones, items }) {
    return (
      <div className="escena-details">
        <div className="detail-box">
          <h5>Resumen</h5>
          <p>{escena.resumen}</p>
        </div>
        <div className="detail-box">
          <h5>Interior/Exterior</h5>
          <p>{escena.interior_exterior}</p>
        </div>
        <div className="detail-box">
          <h5>Día/Noche</h5>
          <p>{escena.dia_noche}</p>
        </div>
        <div className="detail-box">
          <h5>Personajes</h5>
          <ul>
            {escena.personajes.map((personaje) => (
              <li key={personaje.id}>{personaje.nombre}</li>
            ))}
          </ul>
        </div>
        <div className="detail-box">
          <h5>Locación</h5>
          <p>{escena.locacion ? escena.locacion.nombre : 'N/A'}</p>
        </div>
        <div className="detail-box">
          <h5>Items</h5>
          <ul>
            {escena.items.map((item) => (
              <li key={item.id}>{item.nombre}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

export default EscenaDetails;