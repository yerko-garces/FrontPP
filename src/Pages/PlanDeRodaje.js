import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Sortable from 'sortablejs';
import '../Assets/PlanDeRodaje.css';
import DiaDeRodaje from './DiaDeRodaje';
import html2pdf from 'html2pdf.js';

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
  const [capitulosActivos, setCapitulosActivos] = useState(new Set());
  const [filtro, setFiltro] = useState('');
  const [diaNocheFiltro, setDiaNocheFiltro] = useState('');
  const [interiorExteriorFiltro, setInteriorExteriorFiltro] = useState('');
  const [bloques, setBloques] = useState({});
  const [escenas, setEscenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const bloquesRefs = useRef({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [proyecto, setProyecto] = useState(null);
  const [capitulos, setCapitulos] = useState([]);

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
        setProyecto(proyectoResponse.data);

        const capitulosResponse = await axios.get(`http://localhost:8080/api/capitulos/${proyectoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const capitulosConEscenas = capitulosResponse.data.map(capitulo => ({
          ...capitulo,
          escenas: escenasResponse.data.filter(escena => escena.escena.capitulo === capitulo.id)
        }));
        setCapitulos(capitulosConEscenas);

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

  useEffect(() => {
    capitulos.forEach(capitulo => {
      const escenasContainer = document.getElementById(`escenas-container-${capitulo.id}`);
      if (escenasContainer) {
        Sortable.create(escenasContainer, {
          group: {
            name: 'shared',
            pull: 'clone',
            put: false
          },
          animation: 150,
          sort: false,
          onEnd: (evt) => {
            if (evt.from !== evt.to) {
              evt.from.appendChild(evt.item);
            }
          }
        });
      }
    });

    Object.keys(bloquesRefs.current).forEach((dia) => {
      if (bloquesRefs.current[dia]) {
        Sortable.create(bloquesRefs.current[dia], {
          group: 'bloques',
          animation: 150,
          onAdd: (evt) => {
            const escenaId = evt.item.getAttribute('data-id');
            const dia = evt.to.getAttribute('data-dia');
            if (dia) {
              const escena = escenas.find((e) => e.id === parseInt(escenaId));
              if (!escena) {
                alert('El elemento arrastrado no es una escena válida');
                return;
              }
              const nuevoBloque = {
                id: `nuevo-${new Date().getTime()}`,
                escena,
                fecha: new Date(dia), // Crear una nueva instancia de Date para fecha
                hora: new Date(), // Crear una nueva instancia de Date para hora
                titulo: '',
                posicion: bloques[dia]?.length + 1 || 1,
              };
              setBloques((prevBloques) => {
                const nuevoBloques = { ...prevBloques };
                nuevoBloques[dia] = [...(nuevoBloques[dia] || []), nuevoBloque];
                return nuevoBloques;
              });
            }
            evt.item.remove();
          },
        });
      }
    });
  }, [proyectoId, navigate, escenas, bloques, capitulos]);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
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

    try {
      await axios.put('http://localhost:8080/api/bloques/actualizar', [bloqueData], {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Bloque guardado correctamente');
    } catch (error) {
      console.error('Error al guardar el bloque:', error);
      alert('Error al guardar el bloque');
    }
  };

  const handleGuardarTodosBloques = async () => {
    const token = localStorage.getItem('token');
    const bloquesAGuardar = Object.values(bloques).flatMap((bloquesPorDia) =>
      bloquesPorDia.map(formatearBloque)
    );

    try {
      await axios.put('http://localhost:8080/api/bloques/actualizar', bloquesAGuardar, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Bloques guardados correctamente');
    } catch (error) {
      console.error('Error al guardar los bloques:', error.response ? error.response.data : error.message);
      alert('Error al guardar los bloques');
    }
  };

  const formatearBloque = (bloque) => {
    let horaDate;
    if (typeof bloque.hora === 'string') {
      // Si bloque.hora es una cadena de texto, convertirla a un objeto Date
      const [horas, minutos] = bloque.hora.split(':');
      horaDate = new Date();
      horaDate.setHours(parseInt(horas, 10));
      horaDate.setMinutes(parseInt(minutos, 10));
    } else {
      horaDate = bloque.hora;
    }
  
    const bloqueFormateado = {
      planDeRodaje: {
        id: proyectoId,
      },
      titulo: bloque.titulo !== undefined ? bloque.titulo : null,
      fecha: dayjs(bloque.fecha).isValid() ? dayjs(bloque.fecha).format('YYYY-MM-DD') : '',
      posicion: bloque.posicion,
      escena: bloque.escena?.id ? { id: bloque.escena.id } : null,
      id: bloque.id || null,
      hora: horaDate ? `${horaDate.getHours().toString().padStart(2, '0')}:${horaDate.getMinutes().toString().padStart(2, '0')}` : null,
    };
  
    return bloqueFormateado;
  };

  const handleEliminarBloque = async (id, dia) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/bloques/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBloques((prevBloques) => {
        const nuevoBloques = { ...prevBloques };
        nuevoBloques[dia] = prevBloques[dia].filter((bloque) => bloque.id !== id);
        return nuevoBloques;
      });
      alert('Bloque eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el bloque:', error);
      alert('Error al eliminar el bloque');
    }
  };

  const handleDrop = (e, dia, indexDestino) => {
    e.preventDefault();

    let bloqueData;
    try {
      bloqueData = JSON.parse(e.dataTransfer.getData('bloqueData'));
    } catch (error) {
      alert('El elemento arrastrado no es válido');
      return;
    }

    const { escena, fecha, hora } = bloqueData;

    if (!escena) {
      alert('El elemento arrastrado no es una escena válida');
      return;
    }

    const nuevoBloque = {
      escena: { ...escena },
      fecha: new Date(),
      hora: new Date(),
      titulo: '',
      posicion: bloques[dia]?.length + 1 || 1,
    };

    setBloques((prevBloques) => {
      const nuevoBloques = { ...prevBloques };
      if (indexDestino !== undefined) {
        nuevoBloques[dia].splice(indexDestino, 0, nuevoBloque);
      } else {
        nuevoBloques[dia] = [...(nuevoBloques[dia] || []), nuevoBloque];
      }
      return nuevoBloques;
    });

    setDraggedItem(null);
  };

  const handleDragStart = (e) => {
    setDraggedItem(e.item);
  };

  const actualizarBloque = (bloqueActualizado, dia) => {
    setBloques((prevBloques) => {
      const nuevoBloques = { ...prevBloques };
      nuevoBloques[dia] = prevBloques[dia].map((bloque) =>
        bloque.id === bloqueActualizado.id ? { ...bloqueActualizado } : bloque
      );
      return nuevoBloques;
    });
  };

  const handleDiaNocheFiltroChange = (e) => {
    setDiaNocheFiltro(e.target.value);
  };

  const handleInteriorExteriorFiltroChange = (e) => {
    setInteriorExteriorFiltro(e.target.value);
  };

  const generarPDF = () => {
    const elemento = document.querySelector('.plan-de-rodaje');
    html2pdf().from(elemento).save();
  };

  const escenasFiltradas = filterItems(escenas, filtro, diaNocheFiltro, interiorExteriorFiltro);

  if (loading) {
    return <div>Cargando...</div>;
  }
    // Función para alternar la activación/desactivación de un capítulo
    const toggleCapituloActivo = (capituloId) => {
      const newSet = new Set(capitulosActivos);
      if (newSet.has(capituloId)) {
        newSet.delete(capituloId);
      } else {
        newSet.add(capituloId);
      }
      setCapitulosActivos(newSet);
    };

  return (
    <div className="plan-de-rodaje" onDrop={(e) => handleDrop(e, 'Sin Fecha', undefined)} onDragOver={(e) => e.preventDefault()}>
      <div className="plan-de-rodaje-header">
        <div className="btn-dashboard-container">
        <button onClick={generarPDF}>Descargar PDF</button>
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
        {capitulos.map(capitulo => (
          <div key={capitulo.id} className="capitulo-container">
            <button
              className="capitulo-button"
              onClick={() => toggleCapituloActivo(capitulo.id)}
              aria-expanded={capitulosActivos.has(capitulo.id)}
              style={{ width: '100%' }}
            >
              {"Capitulo: " + capitulo.nombre_capitulo}
            </button>
            {capitulosActivos.has(capitulo.id) && (
              <div id={`escenas-container-${capitulo.id}`} className="escenas-list-container">
                <ul>
                  {escenasFiltradas.filter(escenaObj => escenaObj.escena.capitulo === capitulo.id).map(escenaObj => (
                    <li
                      key={escenaObj.escena.id}
                      className="escena-item"
                      data-id={escenaObj.escena.id}
                      draggable
                      onDragStart={(e) => {
                        const bloqueData = JSON.stringify(escenaObj);
                        e.dataTransfer.setData('bloqueData', bloqueData);
                        setDraggedItem(escenaObj);
                      }}
                    >
                      <span>{escenaObj.escena.titulo_escena || 'Sin título'}</span>
                      <span>{escenaObj.escena.resumen}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="dias-de-rodaje-container">
      <button className="guardar-btn" onClick={handleGuardarTodosBloques}>
        Guardar Bloques
      </button>
        {Object.keys(bloques).map((dia) => (
          <div
            key={`dia-${dia}`}
            className="dias-de-rodaje"
            data-dia={dia}
            ref={(el) => (bloquesRefs.current[dia] = el)}
            onDrop={(e) => handleDrop(e, dia)}
            onDragOver={(e) => e.preventDefault()}
          >
            <h4>{dia}</h4>
            {bloques[dia].map((bloque) => (
              <div key={bloque.id} className="bloque-item">
                <DiaDeRodaje
                  bloque={bloque}
                  handleEliminarBloque={handleEliminarBloque}
                  handleGuardarBloque={handleGuardarBloque}
                  dia={dia}
                  actualizarBloque={actualizarBloque}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default PlanDeRodaje;

