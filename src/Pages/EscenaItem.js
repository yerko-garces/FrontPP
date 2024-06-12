import React from 'react';

const EscenaItem = ({ escenaObj }) => {
  return (
    <li className="escena-item">
      <span>{escenaObj.escena.titulo_escena || 'Sin título'}</span>
    </li>
  );
};

export default EscenaItem;