// PlanDeRodaje.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParams, Link } from 'react-router-dom';
import '../Assets/PlanDeRodaje.css';
import DiaDeRodaje from './DiaDeRodaje';

const filterItems = (items, searchText) => {
  return items.filter(item => {
    const tituloEscena = item?.titulo || '';
    return tituloEscena.toLowerCase().includes(searchText.toLowerCase());
  });
};

const PlanDeRodaje = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { proyectoId } = location.state || {};

  const [filtro, setFiltro] = useState('');
  const [bloques, setBloques] = useState({});
  const [escenas, setEscenas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);
  const [nuevoDia, setNuevoDia] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');

  useEffect(() => {
    if (!proyectoId) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const escenasResponse = await axios.get(`http://localhost:8080/api/escenas/proyecto/${proyectoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEscenas(escenasResponse.data);

        const inventarioResponse = await axios.get(`http://localhost:8080/api/items/bodega/${proyectoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventario(inventarioResponse.data);

        const bloquesResponse = await axios.get(`http://localhost:8080/api/bloques/proyecto/${proyectoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bloquesPorDia = bloquesResponse.data.reduce((acc, bloque) => {
          const dia = bloque.fecha;
          acc[dia] = [...(acc[dia] || []), bloque];
          return acc;
        }, {});
        setBloques(bloquesPorDia);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proyectoId, navigate]);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  const handleAgregarEscena = (escena, dia) => {
    setBloques((prevBloques) => ({
      ...prevBloques,
      [dia]: [
        ...(prevBloques[dia] || []),
        {
          escena: escena,
          fecha: dia,
          posicion: (prevBloques[dia]?.length || 0) + 1,
        },
      ],
    }));
  };

  const handleAgregarInventario = (item, dia) => {
    setBloques((prevBloques) => ({
      ...prevBloques,
      [dia]: {
        ...prevBloques[dia],
        inventario: [...(prevBloques[dia]?.inventario || []), item],
      },
    }));
  };

  const handleEliminarBloque = (bloque, dia) => {
    setBloques((prevBloques) => ({
      ...prevBloques,
      [dia]: prevBloques[dia].filter((b) => b.id !== bloque.id),
    }));
  };

  const handleEliminarInventario = (item, dia) => {
    setBloques((prevBloques) => ({
      ...prevBloques,
      [dia]: {
        ...prevBloques[dia],
        inventario: prevBloques[dia].inventario.filter((i) => i.id !== item.id),
      },
    }));
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dia) => {
    e.preventDefault();
    if (dia) {
      handleAgregarEscena(draggedItem, dia);
    } else if (nuevoDia.trim()) {
      setBloques((prevBloques) => ({
        ...prevBloques,
        [nuevoDia]: [draggedItem],
      }));
      setNuevoDia(''); // Restablecer el valor del nuevo día después de crearlo
    }
    setDraggedItem(null);
  };

  const escenasFiltradas = filterItems(escenas, filtro);


  const handleGuardarPlanDeRodaje = async () => {
    const token = localStorage.getItem('token');
    const bloquesPorEnviar = Object.values(bloques).flatMap(diaBloques => diaBloques);

    try {
      await Promise.all(bloquesPorEnviar.map(async bloque => {
        if (bloque.id) {
          await axios.put(`http://localhost:8080/api/bloques/${bloque.id}`, bloque, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          await axios.post('http://localhost:8080/api/bloques', bloque, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }));
      alert('Plan de rodaje guardado correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al guardar el plan de rodaje');
    }
  };

  const handleAgregarBloque = (escena, dia) => {
    setBloques((prevBloques) => ({
      ...prevBloques,
      [dia]: [
        ...(prevBloques[dia] || []),
        {
          escena: escena,
          fecha: dia,
          posicion: (prevBloques[dia]?.length || 0) + 1,
        },
      ],
    }));
  };

  const handleNuevoDiaChange = (e) => {
    setNuevoDia(e.target.value);
  };

  const handleNuevaFechaChange = (e) => {
    setNuevaFecha(e.target.value);
  };

  const handleNuevaHoraChange = (e) => {
    setNuevaHora(e.target.value);
  };

  const handleAgregarDia = () => {
    if (nuevoDia.trim() && nuevaFecha.trim() && nuevaHora.trim()) {
      const fechaNuevaDia = dayjs(nuevaFecha, 'YYYY-MM-DD').toDate();
      const horaNuevaDia = dayjs(nuevaHora, 'HH:mm').toDate();

      setBloques((prevBloques) => ({
        ...prevBloques,
        [nuevoDia]: [
          {
            titulo: nuevoDia,
            fecha: fechaNuevaDia,
            hora: horaNuevaDia,
            posicion: 1,
          },
        ],
      }));

      setNuevoDia('');
      setNuevaFecha('');
      setNuevaHora('');
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="plan-de-rodaje">
      <div className="plan-de-rodaje-header">
        <div className="btn-dashboard-container">
          <Link to="/dashboard">
            <button className="btn-dashboard">
              <i className="fas fa-film"></i> Volver a proyectos
            </button>
          </Link>
        </div>
        <h1 className="titulo-proyecto">Título del Proyecto</h1>
      </div>
  
      <div className="plan-de-rodaje-controles">
        <div className="plan-de-rodaje-filtros">
          <input
            type="text"
            placeholder="Filtrar escenas por título"
            value={filtro}
            onChange={handleFiltroChange}
          />
        </div>
  
        <div className="nuevo-dia-container">
          <div className="nuevo-dia-form">
            <input
              type="text"
              placeholder="Nuevo día de rodaje"
              value={nuevoDia}
              onChange={handleNuevoDiaChange}
            />
            <input
              type="date"
              value={nuevaFecha}
              onChange={handleNuevaFechaChange}
            />
            <input
              type="time"
              value={nuevaHora}
              onChange={handleNuevaHoraChange}
            />
            <button onClick={handleAgregarDia}>Agregar día</button>
          </div>
          <button onClick={handleGuardarPlanDeRodaje}>Guardar Plan de Rodaje</button>
        </div>
      </div>
  
      <div className="plan-de-rodaje-body">
        <div className="escenas-container">
          <h3>Escenas</h3>
          <ul>
            {escenasFiltradas.map((escena) => (
              <li
                key={escena.id}
                className="escena-item"
                draggable
                onDragStart={(e) => handleDragStart(e, escena)}
              >
                <span>{escena.titulo || 'Sin título'}</span>
              </li>
            ))}
          </ul>
        </div>
  
        <div
          className="dias-de-rodaje"
          onDragOver={(e) => handleDragOver(e)}
          onDrop={(e) => handleDrop(e, null)}
        >
          {Object.keys(bloques).map((dia) => (
            <DiaDeRodaje
              key={dia}
              dia={dia}
              bloques={bloques[dia]}
              inventario={bloques[dia]?.inventario}
              handleEliminarBloque={handleEliminarBloque}
              handleEliminarInventario={handleEliminarInventario}
              handleAgregarBloque={handleAgregarBloque}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanDeRodaje;