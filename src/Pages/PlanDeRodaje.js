import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../Assets/PlanDeRodaje.css';

const PlanDeRodaje = ({ onClose }) => {
  const { projectId } = useParams();
  const [filtro, setFiltro] = useState('');
  const [diasDeRodaje, setDiasDeRodaje] = useState({});
  const [escenas, setEscenas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const escenasResponse = await axios.get(`http://localhost:8080/api/escenas/proyecto/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEscenas(escenasResponse.data);

        const inventarioResponse = await axios.get(`http://localhost:8080/api/items/bodega/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventario(inventarioResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  const handleAgregarEscena = (escena, dia) => {
    setDiasDeRodaje((prevDias) => ({
      ...prevDias,
      [dia]: [...(prevDias[dia] || []), escena],
    }));
  };

  const handleAgregarInventario = (item, dia) => {
    setDiasDeRodaje((prevDias) => ({
      ...prevDias,
      [dia]: {
        ...prevDias[dia],
        inventario: [...(prevDias[dia]?.inventario || []), item],
      },
    }));
  };

  const handleEliminarEscena = (escena, dia) => {
    setDiasDeRodaje((prevDias) => ({
      ...prevDias,
      [dia]: prevDias[dia].filter((e) => e !== escena),
    }));
  };

  const handleEliminarInventario = (item, dia) => {
    setDiasDeRodaje((prevDias) => ({
      ...prevDias,
      [dia]: {
        ...prevDias[dia],
        inventario: prevDias[dia].inventario.filter((i) => i !== item),
      },
    }));
  };

  const escenasFiltradas = escenas.filter((escena) =>
    escena.titulo_escena.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) {
    return <div>Cargando...</div>;
  }
  
    return (
      <div className="plan-de-rodaje">
        <div className="plan-de-rodaje-header">
          <h2>Plan de Rodaje</h2>
          <input
            type="text"
            placeholder="Filtrar escenas por título"
            value={filtro}
            onChange={handleFiltroChange}
          />
          <button onClick={onClose}>Cerrar</button>
        </div>
  
        <div className="plan-de-rodaje-body">
          <div className="escenas-container">
            <h3>Escenas</h3>
            <ul>
              {escenasFiltradas.map((escena) => (
                <li key={escena.id} className="escena-item">
                  <span>{escena.titulo_escena}</span>
                  <div>
                    {Object.keys(diasDeRodaje).map((dia) => (
                      <button
                        key={dia}
                        className={`dia-btn ${
                          diasDeRodaje[dia]?.some((e) => e.id === escena.id)
                            ? 'asignada'
                            : ''
                        }`}
                        onClick={() => handleAgregarEscena(escena, dia)}
                      >
                        {dia}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
  
          <div className="inventario-container">
            <h3>Inventario</h3>
            <ul>
              {inventario.map((item) => (
                <li key={item.id} className="inventario-item">
                  <span>{item.nombre}</span>
                  <div>
                    {Object.keys(diasDeRodaje).map((dia) => (
                      <button
                        key={dia}
                        className={`dia-btn ${
                          diasDeRodaje[dia]?.inventario?.some((i) => i.id === item.id)
                            ? 'asignada'
                            : ''
                        }`}
                        onClick={() => handleAgregarInventario(item, dia)}
                      >
                        {dia}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
  
          <div className="dias-de-rodaje">
            {Object.keys(diasDeRodaje).map((dia) => (
              <div key={dia} className="dia-de-rodaje">
                <h4>{dia}</h4>
                <div className="escenas-asignadas">
                  <h5>Escenas:</h5>
                  <ul>
                    {diasDeRodaje[dia].map((escena) => (
                      <li key={escena.id} className="escena-asignada">
                        <span>{escena.titulo_escena}</span>
                        <button onClick={() => handleEliminarEscena(escena, dia)}>
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="inventario-asignado">
                  <h5>Inventario:</h5>
                  <ul>
                    {diasDeRodaje[dia]?.inventario?.map((item) => (
                      <li key={item.id} className="item-asignado">
                        <span>{item.nombre}</span>
                        <button onClick={() => handleEliminarInventario(item, dia)}>
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default PlanDeRodaje; 