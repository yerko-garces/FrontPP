import React, { useState, useEffect } from 'react';

import axios from 'axios';

import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';



const RecuperarItemsFecha = ({ onClose, onRecuperar, fecha: fechaInicial }) => {

  const [fecha, setFecha] = useState(fechaInicial || new Date());

  const [itemsAsignados, setItemsAsignados] = useState([]);

  const [itemsSeleccionados, setItemsSeleccionados] = useState({});



  useEffect(() => {

    fetchItemsAsignados();

  }, [fecha]);



  const fetchItemsAsignados = async () => {

    try {

      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:8080/api/bloque-items/por-fecha', {

        headers: { Authorization: `Bearer ${token}` },

        params: { fecha: fecha.toISOString().split('T')[0] }

      });

      setItemsAsignados(response.data);

    } catch (error) {

      console.error('Error fetching assigned items:', error);

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

    const itemsParaRecuperar = Object.entries(itemsSeleccionados)

      .filter(([_, cantidad]) => cantidad > 0)

      .reduce((acc, [id, cantidad]) => {

        acc[id] = cantidad;

        return acc;

      }, {});

    onRecuperar(fecha, itemsParaRecuperar);

  };



  return (

    <div className="recuperar-items-fecha">

      <h3>Recuperar Items de Fecha</h3>

      <DatePicker selected={fecha} onChange={date => setFecha(date)} />

      <form onSubmit={handleSubmit}>

        {itemsAsignados.map(item => (

          <div key={item.id}>

            <label>

              {item.item.nombre} (Asignados: {item.cantidad})

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

        <button type="submit">Recuperar Items</button>

        <button type="button" onClick={onClose}>Cancelar</button>

      </form>

    </div>

  );

};



export default RecuperarItemsFecha;