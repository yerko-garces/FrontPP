import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../Assets/PlanDeRodaje.css';
import DiaDeRodaje from './DiaDeRodaje';

const filterItems = (items, searchText, diaNocheFilter, interiorExteriorFilter) => {
  return items.filter(item => {
    const tituloEscena = item?.escena?.titulo_escena || '';
    const diaNoche = item?.escena?.diaNoche || '';
    const interiorExterior = item?.escena?.interiorExterior || '';
    const matchesSearchText = tituloEscena.toLowerCase().includes(searchText.toLowerCase());
    const matchesDiaNoche = diaNocheFilter ? diaNoche === diaNocheFilter : true;
    const matchesInteriorExterior = interiorExteriorFilter ? interiorExterior === interiorExteriorFilter : true;
    return matchesSearchText && matchesDiaNoche && matchesInteriorExterior;
  });
};

const PlanDeRodaje = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { proyectoId } = location.state || {};

  const [filtro, setFiltro] = useState('');
  const [diaNocheFiltro, setDiaNocheFiltro] = useState(''); // Estado para el filtro de Día/Noche
  const [interiorExteriorFiltro, setInteriorExteriorFiltro] = useState(''); // Estado para el filtro de Interior/Exterior
  const [bloques, setBloques] = useState({});
  const [escenas, setEscenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);
  const [proyecto, setProyecto] = useState(null); // Estado para almacenar los detalles del proyecto

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
        const proyectoResponse = await axios.get(`http://localhost:8080/api/proyectos/proyecto/${proyectoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProyecto(proyectoResponse.data); // Establecer los detalles del proyecto en el estado
        const bloquesResponse = await axios.get(`http://localhost:8080/api/planes-de-rodaje/${proyectoId}/bloques`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bloquesPorDia = bloquesResponse.data.reduce((acc, bloque) => {
          const dia = dayjs(bloque.fecha).format('YYYY-MM-DD');
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

  const handleDiaNocheFiltroChange = (e) => {
    setDiaNocheFiltro(e.target.value);
  };

  const handleInteriorExteriorFiltroChange = (e) => {
    setInteriorExteriorFiltro(e.target.value);
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
    const nuevoBloque = {
      escena: draggedItem,
      fecha: new Date(),
      hora: new Date(),
      titulo: '',
      posicion: bloques[dia]?.length + 1 || 1,
    };
    setBloques((prevBloques) => ({
      ...prevBloques,
      [dia]: [...(prevBloques[dia] || []), nuevoBloque],
    }));
    setDraggedItem(null);
  };

  const handleGuardarBloque = async (bloqueActualizado) => {
    const token = localStorage.getItem('token');
    const bloqueData = {
      planDeRodaje: {
        id: proyectoId,
      },
      titulo: bloqueActualizado.titulo,
      fecha: dayjs(bloqueActualizado.fecha).format('YYYY-MM-DD'),
      hora: dayjs(bloqueActualizado.hora).format('HH:mm:ss'),
      posicion: bloqueActualizado.posicion,
    };

    if (bloqueActualizado.escena?.id) {
      bloqueData.escena = {
        id: bloqueActualizado.escena.id,
      };
    }

    console.log('Datos del bloque:', bloqueData);

    try {
      console.log('Enviando solicitud PUT para actualizar bloque');
      await axios.put('http://localhost:8080/api/bloques/actualizar', [bloqueData], {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Bloque guardado correctamente');
    } catch (error) {
      console.error('Error al guardar el bloque:', error);
      alert('Error al guardar el bloque');
    }
  };

  const handleEliminarBloque = (bloque, dia) => {
    setBloques((prevBloques) => {
      const nuevoBloques = { ...prevBloques };
      nuevoBloques[dia] = prevBloques[dia].filter((b) => b.id !== bloque.id);
      return nuevoBloques;
    });
  };

  const escenasFiltradas = filterItems(escenas, filtro, diaNocheFiltro, interiorExteriorFiltro);

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
        <h1 className="titulo-proyecto">{proyecto.titulo}</h1>
      </div>
      <div className="plan-de-rodaje-body">
        <div className="escenas-container">
          <h3>Escenas</h3>
          <div className="plan-de-rodaje-controles">
        <div className="plan-de-rodaje-filtros">
          <input
            type="text"
            placeholder="Filtrar escenas por título"
            value={filtro}
            onChange={handleFiltroChange}
          />
          <select value={diaNocheFiltro} onChange={handleDiaNocheFiltroChange}>
            <option value="">Dia-Noche</option>
            <option value="DIA">Día</option>
            <option value="NOCHE">Noche</option>
          </select>
          <select value={interiorExteriorFiltro} onChange={handleInteriorExteriorFiltroChange}>
            <option value="">Interior-Exterior</option>
            <option value="INTERIOR">Interior</option>
            <option value="EXTERIOR">Exterior</option>
          </select>
        </div>
      </div>
          <ul>
            {escenasFiltradas.map((escenaObj) => (
              <li
                key={escenaObj.escena.id}
                className="escena-item"
                draggable
                onDragStart={(e) => handleDragStart(e, escenaObj)}
              >
                <span>{escenaObj.escena.titulo_escena || 'Sin título'}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="dias-de-rodaje"
          onDragOver={(e) => handleDragOver(e)}
          onDrop={(e) => handleDrop(e, Object.keys(bloques)[0])}
        >
          {Object.keys(bloques).map((dia) => (
            <div key={dia}>
              <h4>{dia}</h4>
              {bloques[dia].map((bloque) => (
                <DiaDeRodaje
                  key={bloque.id || `${dia}-${bloque.posicion}`}
                  bloque={bloque}
                  handleEliminarBloque={handleEliminarBloque}
                  handleGuardarBloque={handleGuardarBloque}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanDeRodaje;


