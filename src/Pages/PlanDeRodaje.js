import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import axios from 'axios';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import { useLocation } from 'react-router-dom';
import FiltrosEscenas from './FiltrosEscenas';
import AgregarItemsComponent from './AgregarItemsComponent';
import DevolverItemsComponent from './DevolverItemsComponent';
import Inventario from './Inventario';


const Escena = ({ escena, index, moveEscena }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'ESCENA',
    item: { id: escena.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  return (
    <div ref={dragRef} style={{ opacity, cursor: 'move', marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <div><strong>{escena.content}</strong></div>

      {/* Mostrar todos los campos de la escena */}
      {Object.entries(escena).map(([key, value]) => {
        // Excluir campos que no quieres mostrar (id, tipo, etc.)
        if (key !== 'id' && key !== 'tipo') {
          return (
            <div key={key}>
              {key}: {Array.isArray(value) ? value.map(item => item.nombre).join(', ') : value}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

const ElementoSeleccionado = ({ elemento, index, moveElemento, removeElemento, updateHora, updateEtiqueta }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'ELEMENTO_SELECCIONADO',
    item: { id: elemento.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropRef] = useDrop({
    accept: 'ELEMENTO_SELECCIONADO',
    hover: (item, monitor) => {
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveElemento(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const opacity = isDragging ? 0.5 : 1;

  return (
    <div ref={(node) => dragRef(dropRef(node))} style={{ opacity, cursor: 'move', marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
      {elemento.tipo === 'escena' ? (
        <>
          <div><strong>{elemento.content}</strong></div>
          {elemento.resumen && <div>Resumen: {elemento.resumen}</div>}
          {elemento.diaNoche && <div>Día/Noche: {elemento.diaNoche}</div>}
          <input
            type="time"
            value={elemento.hora || ''}
            onChange={(e) => updateHora(elemento.id, e.target.value)}
            style={{ marginRight: '10px' }}
          />
        </>
      ) : (
        <input
          type="text"
          value={elemento.descripcion || ''}
          onChange={(e) => updateEtiqueta(elemento.id, e.target.value)}
          placeholder="Descripción de la etiqueta"
          style={{ marginRight: '10px', width: '70%' }}
        />
      )}
      <button onClick={() => removeElemento(elemento.id)} style={estiloBoton('red')}>Remover</button>
    </div>
  );
};

const estiloBoton = (color) => ({
  padding: '8px 16px',
  margin: '5px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: color,
  color: 'white',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
});




const PlanDeRodaje = () => {
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [todasLasEscenas, setTodasLasEscenas] = useState([]);
  const [escenasDisponibles, setEscenasDisponibles] = useState([]);
  const [elementosSeleccionados, setElementosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ titulo: '', fecha: '', director: '' });
  const proyectoRef = useRef(null);
  const [planes, setPlanes] = useState([]);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [escenasEnPlanesTemp, setEscenasEnPlanesTemp] = useState({});
  const [inventarioItems, setInventarioItems] = useState([]);

  const [filtros, setFiltros] = useState({
    filtro: '',
    diaNocheFiltro: '',
    interiorExteriorFiltro: '',
    personajeFiltro: '',
    locacionFiltro: '',
    personajes: [],
    locaciones: []
  });

  const location = useLocation();
  const { proyectoId } = location.state || {};

  const toggleGestionarItems = (planId) => {
    setSelectedPlanId(prevId => prevId === planId ? null : planId);
  };

  const fetchPlanItems = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/planes/${planId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching plan items:', error);
      return [];
    }
  };

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
      });
      setInventarioItems(inventarioResponse.data || []);
    } catch (error) {
      console.error('Error fetching inventario items:', error);
      setInventarioItems([]);
    }
  };

  const fetchData = useCallback(async (proyecto) => {
    if (!proyectoId) {
      console.error('ID de proyecto no disponible');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const [escenasResponse, planesResponse, personajesResponse, locacionesResponse] = await Promise.all([
        axios.get(`http://localhost:8080/api/escenas/proyecto/${proyectoId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:8080/api/planes/proyecto/${proyectoId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:8080/api/personajes/proyecto/${proyectoId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:8080/api/locaciones/proyecto/${proyectoId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const proyectoResponse = await axios.get(`http://localhost:8080/api/proyectos/proyecto/${proyectoId}`, { headers: { Authorization: `Bearer ${token}` } });
      setNombreProyecto(proyectoResponse.data.titulo); // Guardar el nombre del proyecto


      // Procesamiento de escenas (sin cambios)
      const escenasProcesadas = escenasResponse.data.map(escenaObj => ({
        id: escenaObj.escena.id.toString(),
        content: escenaObj.escena.titulo_escena || 'Sin título',
        resumen: escenaObj.escena.resumen,
        diaNoche: escenaObj.escena.diaNoche,
        interiorExterior: escenaObj.escena.interiorExterior,
        tipo: 'escena',
        personajes: Array.isArray(escenaObj.personajes) ? escenaObj.personajes.map(personaje => personaje.id) : [], // Dejar los IDs como números
        locacion: escenaObj.locacion ? escenaObj.locacion.id : null // ID de locación como número (o null si no existe)
      }));

      setTodasLasEscenas(escenasProcesadas);
      setEscenasDisponibles(escenasProcesadas);
      setPlanes(planesResponse.data);

      // Ajustar filtros (convertir IDs a números)
      setFiltros(prevFiltros => ({
        ...prevFiltros,
        personajes: personajesResponse.data,
        locaciones: locacionesResponse.data,
        personajeFiltro: prevFiltros.personajeFiltro ? parseInt(prevFiltros.personajeFiltro, 10) : '', // Convertir a número
        locacionFiltro: prevFiltros.locacionFiltro ? parseInt(prevFiltros.locacionFiltro, 10) : ''  // Convertir a número
      }));

      setLoading(false);
    } catch (error) {
      console.error('Error al obtener datos:', error);
      setLoading(false);
      // Manejo de errores (mostrar mensaje al usuario, etc.)
    }
    proyectoRef.current = proyecto;
  }, [proyectoId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFiltroChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    aplicarFiltros();
  };

  const aplicarFiltros = useCallback(() => {
    let escenasFiltradas = todasLasEscenas;

    if (filtros.filtro) {
      escenasFiltradas = escenasFiltradas.filter(escena =>
        escena.content.toLowerCase().includes(filtros.filtro.toLowerCase())
      );
    }

    if (filtros.diaNocheFiltro) {
      escenasFiltradas = escenasFiltradas.filter(escena =>
        escena.diaNoche === filtros.diaNocheFiltro
      );
    }

    if (filtros.interiorExteriorFiltro) {
      escenasFiltradas = escenasFiltradas.filter(escena =>
        escena.interiorExterior === filtros.interiorExteriorFiltro
      );
    }

    if (filtros.personajeFiltro) {
      escenasFiltradas = escenasFiltradas.filter(escena =>
        escena.personajes.includes(filtros.personajeFiltro) // Comparar directamente con el ID numérico
      );
    }

    if (filtros.locacionFiltro) {
      escenasFiltradas = escenasFiltradas.filter(escena =>
        escena.locacion === filtros.locacionFiltro // Comparar directamente con el ID numérico
      );
    }

    setEscenasDisponibles(escenasFiltradas);
  }, [todasLasEscenas, filtros]);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros]);

  const moveElemento = (dragIndex, hoverIndex) => {
    const elemento = elementosSeleccionados[dragIndex];
    const updatedElementosSeleccionados = [...elementosSeleccionados];
    updatedElementosSeleccionados.splice(dragIndex, 1);
    updatedElementosSeleccionados.splice(hoverIndex, 0, elemento);

    const elementosConPosicionActualizada = updatedElementosSeleccionados.map((elem, index) => ({
      ...elem,
      posicion: index + 1
    }));

    setElementosSeleccionados(elementosConPosicionActualizada);
  };

  const handleDrop = useCallback((item) => {
    const escena = escenasDisponibles.find((e) => e.id === item.id);
    if (escena) {
      setElementosSeleccionados((prevElementos) => [
        ...prevElementos,
        { ...escena, tipo: 'escena', hora: '', posicion: prevElementos.length + 1 }
      ]);
      setEscenasDisponibles((prevEscenas) => prevEscenas.filter((e) => e.id !== item.id));
    }
  }, [escenasDisponibles]);

  const [, dropRef] = useDrop({
    accept: 'ESCENA',
    drop: handleDrop,
  });

  const removeElemento = (elementoId) => {
    const elemento = elementosSeleccionados.find((e) => e.id === elementoId);

    if (elemento.tipo === 'escena') {
      setEscenasDisponibles((prevEscenas) => {
        const newEscenas = todasLasEscenas.filter(e =>
          prevEscenas.some(pe => pe.id === e.id) || e.id === elementoId
        );
        return newEscenas;
      });
    }

    setElementosSeleccionados((prevElementos) => {
      const filteredElementos = prevElementos.filter((e) => e.id !== elementoId);
      return filteredElementos.map((elem, index) => ({ ...elem, posicion: index + 1 }));
    });
  };

  const updateHora = (escenaId, hora) => {
    setElementosSeleccionados((prevElementos) =>
      prevElementos.map((elemento) =>
        elemento.id === escenaId ? { ...elemento, hora } : elemento
      )
    );
  };

  const updateEtiqueta = (etiquetaId, descripcion) => {
    setElementosSeleccionados((prevElementos) =>
      prevElementos.map((elemento) =>
        elemento.id === etiquetaId ? { ...elemento, descripcion } : elemento
      )
    );
  };

  const agregarEtiqueta = () => {
    const nuevaEtiqueta = {
      id: `etiqueta-${Date.now()}`,
      tipo: 'etiqueta',
      descripcion: '',
      posicion: elementosSeleccionados.length + 1
    };
    setElementosSeleccionados((prevElementos) => [...prevElementos, nuevaEtiqueta]);
  };

  const handleCrearPlan = () => {
    setShowPlanForm(true);
  };

  const handlePlanInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlan((prevPlan) => ({
      ...prevPlan,
      [name]: value
    }));
  };

  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/planes/', {
        titulo: newPlan.titulo,
        fecha: dayjs(newPlan.fecha).format('YYYY-MM-DD'),
        director: newPlan.director,
        proyecto: { id: proyectoId },
        escenas: elementosSeleccionados.filter(elem => elem.tipo === 'escena')
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Plan creado:', response.data);
      setShowPlanForm(false);
      setNewPlan({ titulo: '', fecha: '', director: '' });
      setElementosSeleccionados([]);

      await fetchData();
    } catch (error) {
      console.error('Error al crear nuevo plan:', error);
      alert('Error al crear nuevo plan');
    }
  };

  const handleBorrarPlan = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/planes/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (planSeleccionado && planSeleccionado.id === planId) {
        setPlanSeleccionado(null);
        setElementosSeleccionados([]);
      }

      await fetchData();
    } catch (error) {
      console.error('Error al borrar plan:', error);
      alert('Error al borrar plan');
    }
  };

  const handleSeleccionarPlan = (plan) => {
    setPlanSeleccionado(plan);

    const elementosAsociados = plan.planEscenaEtiquetas
      .map((item, index) => {
        if (item.escena) {
          return {
            id: item.escena.id.toString(),
            tipo: 'escena',
            content: item.escena.titulo_escena || 'Sin título',
            resumen: item.escena.resumen,
            diaNoche: item.escena.diaNoche,
            hora: item.hora,
            posicion: item.posicion || index + 1
          };
        } else if (item.etiqueta) {
          return {
            id: `etiqueta-${item.etiqueta.id || Date.now()}`,
            tipo: 'etiqueta',
            descripcion: item.etiqueta.nombre,
            posicion: item.posicion || index + 1
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.posicion - b.posicion);

    setElementosSeleccionados(elementosAsociados);

    setEscenasDisponibles(todasLasEscenas.filter(escena =>
      !elementosAsociados.some(e => e.tipo === 'escena' && e.id === escena.id)
    ));
  };


  const generarPDF = (proyecto, planes) => {

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Plan de Rodaje", 105, 20, { align: 'center' });

    let paginaActual = 1;
    let offsetY = 30;

    planes.forEach((plan, indexPlan) => {
      if (indexPlan > 0) {
        doc.addPage();
        offsetY = 30;
      }


      doc.setFontSize(14);
      doc.text(`Plan: ${plan.titulo}`, 20, offsetY);
      offsetY += 10;
      doc.text(`Fecha: ${new Date(plan.fecha).toLocaleDateString()}`, 20, offsetY);
      offsetY += 10;
      doc.text(`Director: ${plan.director || "No especificado"}`, 20, offsetY);
      offsetY += 20;

      plan.planEscenaEtiquetas.forEach((elementoPlan, indexElemento) => {
        const elemento = elementoPlan.escena || elementoPlan.etiqueta;

        if (elemento.tipo === 'escena') {
          doc.text(`Escena ${indexElemento + 1}: ${elemento.content}`, 20, offsetY);
          if (elemento.resumen) {
            offsetY += 10;
            doc.setFontSize(12);
            doc.text(`Resumen: ${elemento.resumen}`, 30, offsetY);
          }
          if (elemento.diaNoche) {
            offsetY += 10;
            doc.setFontSize(12);
            doc.text(`Dia/Noche: ${elemento.diaNoche}`, 30, offsetY);
          }
          if (elemento.hora) {
            offsetY += 10;
            doc.setFontSize(12);
            doc.text(`Hora: ${elemento.hora}`, 30, offsetY);
          }
        } else if (elemento.tipo === 'etiqueta') {
          doc.setFontSize(12);
          doc.text(`Etiqueta ${indexElemento + 1}: ${elemento.descripcion}`, 30, offsetY);
        }

        offsetY += 20;
        if (offsetY > 260) {
          doc.addPage();
          paginaActual++;
          offsetY = 30;
          doc.setFontSize(16);
          doc.text(`Proyecto: ${proyecto.titulo}`, 20, 20);
        }
      });
    });

    doc.save('plan_de_rodaje.pdf');
  };


  const handleAsociarElementos = async () => {
    if (!planSeleccionado) {
      alert('Por favor, selecciona un plan primero');
      return;
    }

    const elementosAsociados = elementosSeleccionados.map((elemento) => {
      if (elemento.tipo === 'escena') {
        return {
          escena: { id: parseInt(elemento.id) },
          hora: elemento.hora || '00:00',
          posicion: elemento.posicion
        };
      } else {
        return {
          etiqueta: { nombre: elemento.descripcion },
          posicion: elemento.posicion
        };
      }
    });

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/planes/${planSeleccionado.id}/elementos`, elementosAsociados, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Elementos asociados exitosamente');

      await fetchData();
    } catch (error) {
      console.error('Error al asociar elementos:', error);
      alert('Error al asociar elementos');
    }
  };

  const togglePlanDetails = (planId) => {
    setPlanSeleccionado(prev => prev && prev.id === planId ? null : planes.find(p => p.id === planId));
  };

  //Arreglao

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <h2>{nombreProyecto}</h2>
      <FiltrosEscenas onFiltroChange={handleFiltroChange} filtros={filtros} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Columna izquierda para escenas disponibles */}
        <div style={{ width: '50%', overflowY: 'auto', padding: '10px', borderRight: '1px solid #ccc' }}>
        <h2>Escenas Disponibles</h2>
          <div style={{ minHeight: '200px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            {escenasDisponibles.map((escena, index) => (
              <Escena key={escena.id} escena={escena} index={index} />
            ))}
          </div>
        </div>
  
        {/* Columna derecha para planes y elementos seleccionados */}
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '10px' }}>
          <h2>Planes</h2>
          {planes.map((plan) => (
            <div key={plan.id} className="plan-item" style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h3>{plan.titulo}</h3>
              <p>Fecha: {new Date(plan.fecha).toLocaleDateString()}</p>
              <p>Director: {plan.director}</p>
              <h4>Escenas:</h4>
              <div id={`plan-container-${plan.id}`} className="plan-escenas-container">
                {plan.planEscenaEtiquetas && plan.planEscenaEtiquetas.length > 0 ? (
                  plan.planEscenaEtiquetas
                    .sort((a, b) => a.posicion - b.posicion)
                    .map((item) => {
                      if (!item || !item.escena) return null;
                      return (
                        <div key={`${item.escena.id}-${item.posicion}`} className="escena-item">
                          {item.escena.titulo_escena || 'Sin título'}
                          {item.escena.resumen && <p>{item.escena.resumen}</p>}
                          {item.escena.diaNoche && <p>{item.escena.diaNoche}</p>}
                        </div>
                      );
                    })
                ) : (
                  <p>No hay escenas asignadas a este plan.</p>
                )}
              </div>
              {selectedPlanId === plan.id && (
                <div className="gestionar-items-container">
                  <AgregarItemsComponent
                    planId={plan.id}
                    onItemsUpdated={() => {
                      fetchPlanItems(plan.id).then(items => {
                        setPlanes(prevPlanes => prevPlanes.map(p =>
                          p.id === plan.id ? { ...p, planItems: items } : p
                        ));
                      });
                      fetchData();
                    }}
                  />
                  <DevolverItemsComponent planId={plan.id} onItemsUpdated={fetchData} />
                </div>
              )}
              <button onClick={() => toggleGestionarItems(plan.id)}>
                {selectedPlanId === plan.id ? 'Cerrar Gestión' : 'Gestionar Items'}
              </button>
              <button onClick={() => handleBorrarPlan(plan.id)} style={estiloBoton('red')}>Eliminar Plan</button>
              <button onClick={() => handleSeleccionarPlan(plan)} style={estiloBoton('blue')}>Seleccionar</button>
  
              {/* Elementos seleccionados para el plan */}
              {planSeleccionado && planSeleccionado.id === plan.id && (
                <div style={{ marginTop: '20px' }}>
                  <h3>Elementos Seleccionados para {planSeleccionado.titulo}</h3>
                  <div ref={dropRef} style={{ minHeight: '200px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                    {elementosSeleccionados.map((elemento, index) => (
                      <ElementoSeleccionado
                        key={elemento.id}
                        elemento={elemento}
                        index={index}
                        moveElemento={moveElemento}
                        removeElemento={removeElemento}
                        updateHora={updateHora}
                        updateEtiqueta={updateEtiqueta}
                      />
                    ))}
                    <button onClick={agregarEtiqueta} style={estiloBoton('blue')}>Agregar Etiqueta</button>
                    <button onClick={handleAsociarElementos} style={estiloBoton('green')}>Asociar Elementos al Plan</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button onClick={() => generarPDF(proyectoRef.current, planes)} style={estiloBoton('blue')}>Descargar PDF</button>
          <button onClick={handleCrearPlan} style={estiloBoton('green')}>Crear Nuevo Plan</button>
          {showPlanForm && (
            <form onSubmit={handleSubmitPlan} style={{ marginTop: '20px' }}>
              <input
                type="text"
                name="titulo"
                value={newPlan.titulo}
                onChange={handlePlanInputChange}
                placeholder="Título del plan"
                required
              />
              <input
                type="date"
                name="fecha"
                value={newPlan.fecha}
                onChange={handlePlanInputChange}
                required
              />
              <input
                type="text"
                name="director"
                value={newPlan.director}
                onChange={handlePlanInputChange}
                placeholder="Director"
                required
              />
              <button type="submit">Crear Plan</button>
              <button type="button" onClick={() => setShowPlanForm(false)}>Cancelar</button>
            </form>
          )}
        </div>
      </div>
      <Inventario />
    </div>
  );
};

const PlanDeRodajeWrapper = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <PlanDeRodaje />
    </DndProvider>
  );
};

export default PlanDeRodajeWrapper;