import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AgregarItemsComponent = ({ planId, onItemsUpdated }) => {
  const [inventarioItems, setInventarioItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    fetchInventarioItems();
  }, []);

  const fetchInventarioItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const userResponse = await axios.get('http://localhost:8080/api/proyectos/usuario-id', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usuarioId = userResponse.data;
      const inventarioResponse = await axios.get(`http://localhost:8080/api/items/bodega/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
        transformResponse: [(data) => data] // Prevent axios from parsing JSON
      });
      console.log('Raw response:', inventarioResponse.data);
      const parsedData = JSON.parse(inventarioResponse.data);
      setInventarioItems(parsedData || []);
    } catch (error) {
      console.error('Error fetching inventario items:', error);
      if (error instanceof SyntaxError) {
        console.error('JSON parsing error:', error.message);
      }
      setInventarioItems([]);
    }
  };

  const handleAddItem = async () => {
    if (selectedItem && cantidad > 0) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `http://localhost:8080/api/planes/${planId}/items/${selectedItem}?cantidad=${cantidad}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Item agregado exitosamente');
        setSelectedItem('');
        setCantidad(1);
        fetchInventarioItems();
        if (onItemsUpdated) onItemsUpdated();
      } catch (error) {
        console.error("Hubo un error al agregar el ítem", error);
        alert(error.response?.data?.message || "Error al agregar el ítem");
      }
    }
  };

  return (
    <div>
      <h3>Agregar Item al Plan</h3>
      <select
        value={selectedItem}
        onChange={(e) => setSelectedItem(e.target.value)}
      >
        <option value="">Seleccione un item</option>
        {Array.isArray(inventarioItems) && inventarioItems.map(item => (
          <option key={item.id} value={item.id}>{item.nombre} (Disponible: {item.cantidad})</option>
        ))}
      </select>
      <input
        type="number"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        min="1"
      />
      <button onClick={handleAddItem}>Agregar Item</button>
    </div>
  );
};

export default AgregarItemsComponent;