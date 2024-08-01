import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ItemForm from './ItemForm'; // Asegúrate de tener este componente

const Inventario = () => {
  const [showInventario, setShowInventario] = useState(false);
  const [bodega, setBodega] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);

  useEffect(() => {
    if (showInventario) {
      fetchInventario();
    }
  }, [showInventario]);

  const fetchInventario = async () => {
    try {
      const token = localStorage.getItem('token');
      // Obtener el ID del usuario actual
      const userResponse = await axios.get('http://localhost:8080/api/proyectos/usuario-id', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usuarioId = userResponse.data;
      // Ahora usa este usuarioId para obtener la bodega
      const response = await axios.get(`http://localhost:8080/api/items/bodega/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBodega(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const toggleInventario = () => {
    setShowInventario(!showInventario);
  };

  const handleItemEdit = (item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleItemEditConfirm = async (item) => {
    await handleItemSubmit(item);
    setEditingItem(null);
  };

  const handleItemEditCancel = () => {
    setEditingItem(null);
    setShowItemForm(false);
  };

  const handleItemDelete = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBodega(bodega.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleItemSubmit = async (item) => {
    try {
      const token = localStorage.getItem('token');
      if (editingItem) {
        const response = await axios.put(`http://localhost:8080/api/items/${editingItem.id}`, item, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBodega(bodega.map((i) => (i.id === editingItem.id ? response.data : i)));
        setEditingItem(null);
      } else {
        const response = await axios.post('http://localhost:8080/api/items/', item, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBodega([...bodega, response.data]);
      }
      setShowItemForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`inventario-container ${showInventario ? 'visible' : ''}`}>
      <button className="inventario-toggle" onClick={toggleInventario}>
        <i className="fas fa-boxes"></i> Inventario
      </button>
      {showInventario && (
        <div className={`inventario-window ${editingItem ? 'expanded' : ''}`}>
          <h2>Inventario</h2>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bodega.map((item) => (
                <tr key={item.id}>
                  <td>
                    {editingItem && editingItem.id === item.id ? (
                      <input
                        type="text"
                        value={editingItem.nombre}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, nombre: e.target.value })
                        }
                      />
                    ) : (
                      item.nombre
                    )}
                  </td>
                  <td>
                    {editingItem && editingItem.id === item.id ? (
                      <input
                        type="number"
                        value={editingItem.cantidad}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, cantidad: e.target.value })
                        }
                      />
                    ) : (
                      item.cantidad
                    )}
                  </td>
                  <td>
                    {editingItem && editingItem.id === item.id ? (
                      <input
                        type="text"
                        value={editingItem.categoria}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, categoria: e.target.value })
                        }
                      />
                    ) : (
                      item.categoria
                    )}
                  </td>
                  <td className="item-actions">
                    {editingItem && editingItem.id === item.id ? (
                      <>
                        <button className="btn-confirm" onClick={() => handleItemEditConfirm(editingItem)}>
                          <i className="fas fa-check"></i> Confirmar
                        </button>
                        <button className="btn-cancel" onClick={handleItemEditCancel}>
                          <i className="fas fa-times"></i> Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-edit" onClick={() => handleItemEdit(item)}>
                          <i className="fas fa-edit"></i> Editar
                        </button>
                        <button className="btn-delete" onClick={() => handleItemDelete(item.id)}>
                          <i className="fas fa-trash"></i> Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn-create" onClick={() => setShowItemForm(true)}>Crear Item</button>
          {showItemForm && <ItemForm onSubmit={handleItemSubmit} item={editingItem} />}
        </div>
      )}
    </div>
  );
};

export default Inventario;