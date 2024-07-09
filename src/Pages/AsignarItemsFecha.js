import React, { useState, useEffect } from 'react';

import axios from 'axios';

import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';



const AsignarItemsFecha = ({ onClose, onAsignar, fecha: fechaInicial }) => {

  const [fecha, setFecha] = useState(fechaInicial || new Date());

  const [bodega, setBodega] = useState([]);

  const [itemsSeleccionados, setItemsSeleccionados] = useState({});



  useEffect(() => {

    fetchInventario();

  }, []);



  const fetchInventario = async () => {

    try {

      const token = localStorage.getItem('token');

      const userResponse = await axios.get('http://localhost:8080/api/proyectos/usuario-id', {

        headers: { Authorization: `Bearer ${token}` },

      });

      const usuarioId = userResponse.data;

      const response = await axios.get(`http://localhost:8080/api/items/bodega/${usuarioId}`, {

        headers: { Authorization: `Bearer ${token}` },

      });

      setBodega(response.data);

    } catch (error) {

      console.error('Error fetching inventory:', error);

    }

  };



  const handleItemChange = (itemId, cantidad) => {

    setItemsSeleccionados(prev => ({

      ...prev,

      [itemId]: cantidad

    }));

  };



  const handleSubmit = (e) => {

    e.preventDefault();

    onAsignar(fecha, itemsSeleccionados);

  };



  return (

    <div className="asignar-items-fecha">

      <h3>Asignar Items a Fecha</h3>

      <DatePicker selected={fecha} onChange={date => setFecha(date)} />

      <form onSubmit={handleSubmit}>

        {bodega.map(item => (

          <div key={item.id}>

            <label>

              {item.nombre} (Disponible: {item.cantidad})

              <input

                type="number"

                min="0"

                max={item.cantidad}

                value={itemsSeleccionados[item.id] || 0}

                onChange={e => handleItemChange(item.id, parseInt(e.target.value))}

              />

            </label>

          </div>

        ))}

        <button type="submit">Asignar Items</button>

        <button type="button" onClick={onClose}>Cancelar</button>

      </form>

    </div>

  );

};



export default AsignarItemsFecha;