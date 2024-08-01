import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DevolverItemsComponent = ({ planId, onItemsUpdated }) => {
  const [planItems, setPlanItems] = useState([]);
  const [returnQuantities, setReturnQuantities] = useState({});

  useEffect(() => {
    fetchPlanItems();
  }, [planId]);

  const fetchPlanItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/planes/${planId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlanItems(response.data || []);
    } catch (error) {
      console.error('Error fetching plan items:', error);
      setPlanItems([]);
    }
  };

  const handleReturnQuantityChange = (itemId, quantity) => {
    setReturnQuantities(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  const handleReturnItems = async () => {
    try {
      const token = localStorage.getItem('token');
      for (const [itemId, quantity] of Object.entries(returnQuantities)) {
        if (quantity > 0) {
          await axios.post(`http://localhost:8080/api/planes/${planId}/devolver-item`, {
            itemId: itemId,
            cantidad: quantity
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
      alert('Ítems devueltos exitosamente');
      setReturnQuantities({});
      fetchPlanItems();
      if (onItemsUpdated) onItemsUpdated();
    } catch (error) {
      console.error('Error returning items:', error);
      alert('Error al devolver ítems');
    }
  };

  return (
    <div className="devolver-items-container">
      <h2>Devolver Ítems del Plan</h2>
      {planItems.length > 0 ? (
        <ul>
          {planItems.map(planItem => (
            <li key={planItem.id}>
              {planItem.item.nombre} - En el plan: {planItem.cantidad}
              <input
                type="number"
                min="0"
                max={planItem.cantidad}
                value={returnQuantities[planItem.item.id] || ''}
                onChange={(e) => handleReturnQuantityChange(planItem.item.id, parseInt(e.target.value) || 0)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay ítems en este plan.</p>
      )}
      <button onClick={handleReturnItems}>Devolver Ítems Seleccionados</button>
    </div>
  );
};

export default DevolverItemsComponent;