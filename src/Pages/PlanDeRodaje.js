import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Sortable from 'sortablejs';
import '../Assets/PlanDeRodaje.css';
import DiaDeRodaje from './DiaDeRodaje';
import AsignarItemsFecha from './AsignarItemsFecha';
import RecuperarItemsFecha from './RecuperarItemsFecha';
import jsPDF from 'jspdf';
import html2pdf from 'html2pdf.js';
import ItemForm from './ItemForm';

const filterItems = (items, searchText, diaNocheFilter, interiorExteriorFilter, personajeFilter, locacionFilter) => {
  return items.filter(item => {
    const tituloEscena = item?.escena?.titulo_escena || '';
    const diaNoche = item?.escena?.diaNoche || '';
    const interiorExterior = item?.escena?.interiorExterior || '';
    const personajes = item?.escena?.personajes || [];
    const locacion = item?.escena?.locacion || '';

    const matchesSearchText = tituloEscena.toLowerCase().includes(searchText.toLowerCase());
    const matchesDiaNoche = diaNocheFilter ? diaNoche === diaNocheFilter : true;
    const matchesInteriorExterior = interiorExteriorFilter ? interiorExterior === interiorExteriorFilter : true;
    // Verificar si el personaje filtrado está presente en el array de personajes de la escena
    const matchesPersonaje = personajeFilter ? personajes.some(personaje => personaje.id === parseInt(personajeFilter)) : true;
    const matchesLocacion = locacionFilter ? locacion === parseInt(locacionFilter) : true;

    return matchesSearchText && matchesDiaNoche && matchesInteriorExterior && matchesPersonaje && matchesLocacion;
  });
};
const PlanDeRodaje = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { proyectoId } = location.state || {};
  const [capitulosActivos, setCapitulosActivos] = useState(new Set());
  const [filtro, setFiltro] = useState('');
  const [diaNocheFiltro, setDiaNocheFiltro] = useState('');
  const [personajeFiltro, setPersonajeFiltro] = useState('');
  const [locacionFiltro, setLocacionFiltro] = useState('');
  const [interiorExteriorFiltro, setInteriorExteriorFiltro] = useState('');
  const [planes, setPlanes] = useState([]);
  const [escenas, setEscenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const planesRefs = useRef({});
  const [proyecto, setProyecto] = useState(null);
  const [capitulos, setCapitulos] = useState([]);
  const [personajes, setPersonajes] = useState([]);
  const [locaciones, setLocaciones] = useState([]);
  const [showInventario, setShowInventario] = useState(false);
  const [bodega, setBodega] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAsignarItems, setShowAsignarItems] = useState(false);
  const [itemsAsignadosPorFecha, setItemsAsignadosPorFecha] = useState({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [showRecuperarItems, setShowRecuperarItems] = useState(false);

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
        const personajesResponse = await axios.get(`http://localhost:8080/api/personajes/proyecto/${proyectoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPersonajes(personajesResponse.data);

        // Recuperar locaciones
        const locacionesResponse = await axios.get(`http://localhost:8080/api/locaciones/proyecto/${proyectoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocaciones(locacionesResponse.data);

        const capitulosResponse = await axios.get(`http://localhost:8080/api/capitulos/${proyectoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const capitulosConEscenas = capitulosResponse.data.map(capitulo => ({
          ...capitulo,
          escenas: escenasResponse.data.filter(escena => escena.escena.capitulo === capitulo.id)
        }));
        setCapitulos(capitulosConEscenas);

        const planesResponse = await axios.get(`http://localhost:8080/api/planes/proyecto/${proyectoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlanes(planesResponse.data);
        fetchItemsAsignadosPorFecha();
        await fetchInventario();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [proyectoId, navigate]);
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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, planId) => {
    e.preventDefault();
    const escenaData = JSON.parse(e.dataTransfer.getData('escenaData'));
    agregarEscenaAPlan(planId, escenaData.escena.id);
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
  const handleItemEdit = (item) => {
    setEditingItem(item);
    setShowItemForm(true);
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
  const handleItemEditCancel = () => {
    setEditingItem(null);
    setShowItemForm(false);
  };
  const handleItemEditConfirm = async (item) => {
    await handleItemSubmit(item);
    setEditingItem(null);
  };
  const toggleInventario = () => {
    setShowInventario(!showInventario);
  };
  useEffect(() => {
    capitulos.forEach((capitulo) => {
      const escenasContainers = document.querySelectorAll('.escenas-container');
      escenasContainers.forEach((container) => {
        Sortable.create(container, {
          group: {
            name: 'escenas',
            pull: 'clone',
            put: false,
          },
          animation: 150,
          sort: false,
        });
      });

      planes.forEach((plan) => {
        const planContainer = document.getElementById(`plan-container-${plan.id}`);
        if (planContainer) {
          Sortable.create(planContainer, {
            group: {
              name: 'planes',
              put: ['escenas']  // Permite recibir elementos del grupo 'escenas'
            },
            animation: 150,
            onAdd: (evt) => {
              console.log('Evento onAdd activado', evt);
              const escenaId = evt.item.getAttribute('data-id');
              const planId = evt.to.getAttribute('data-plan-id');
              if (planId) {
                agregarEscenaAPlan(planId, escenaId);
              }
              evt.item.remove(); // Eliminar el elemento clonado
            },
            onUpdate: (evt) => {
              const planId = evt.to.getAttribute('data-plan-id');
              const newOrder = Array.from(evt.to.children).map(item => parseInt(item.getAttribute('data-id')));
              actualizarOrdenEscenas(planId, newOrder);
            }
          });
        }
      });
    }, [capitulos, planes, escenas]);

    const planesContainers = document.querySelectorAll('.planes-container');
    planesContainers.forEach((container) => {
      Sortable.create(container, {
        group: {
          name: 'planes',
          put: ['escenas'],
        },
        animation: 150,
        onAdd: (evt) => {
          const escenaId = evt.item.getAttribute('data-id');
          const planId = container.getAttribute('data-plan-id');
          agregarEscenaAPlan(planId, escenaId);
          evt.item.remove(); // Eliminar el elemento clonado
        },
        onUpdate: (evt) => {
          const planId = container.getAttribute('data-plan-id');
          const newOrder = Array.from(evt.to.children).map((item) => parseInt(item.getAttribute('data-id')));
          actualizarOrdenEscenas(planId, newOrder);
        },
      });
    });
  }, [planes, escenas]);

  const agregarEscenaAPlan = async (planId, escenaId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/planes/${planId}/${escenaId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Actualizar el estado localmente
      setPlanes(prevPlanes => prevPlanes.map(plan => {
        if (plan.id === planId) {
          return { ...plan, escenas: [...plan.escenas, { id: escenaId }] };
        }
        return plan;
      }));
    } catch (error) {
      console.error('Error al agregar escena al plan:', error);
      alert('Error al agregar escena al plan');
    }
  };

  const actualizarOrdenEscenas = async (planId, newOrder) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/planes/${planId}/escenas`, newOrder, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const planesActualizados = planes.map(plan => {
        if (plan.id === parseInt(planId)) {
          const escenasOrdenadas = newOrder.map(id => plan.escenas.find(e => e.id === id));
          return { ...plan, escenas: escenasOrdenadas };
        }
        return plan;
      });
      setPlanes(planesActualizados);
    } catch (error) {
      console.error('Error al actualizar el orden de las escenas:', error);
      alert('Error al actualizar el orden de las escenas');
    }
  };

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    titulo: '',
    fecha: '',
    director: ''
  });

  const handleCrearPlan = () => {
    setShowPlanForm(true);
  };

  const handlePlanInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlan(prevPlan => ({
      ...prevPlan,
      [name]: value
    }));
  };

  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/planes/', {
        ...newPlan,
        fecha: dayjs(newPlan.fecha).format('YYYY-MM-DD'),
        escenas: [],
        proyecto: { id: proyectoId }
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlanes([...planes, response.data]);
      setShowPlanForm(false);
      setNewPlan({ titulo: '', fecha: '', director: '' });
    } catch (error) {
      console.error('Error al crear nuevo plan:', error);
      alert('Error al crear nuevo plan');
    }
  };




  const handleEliminarPlan = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/planes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlanes(planes.filter(plan => plan.id !== id));
      alert('Plan eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el plan:', error);
      alert('Error al eliminar el plan');
    }
  };

  const handlePlanTituloChange = (id, nuevoTitulo) => {
    setPlanes(planes.map(plan =>
      plan.id === id ? { ...plan, titulo: nuevoTitulo } : plan
    ));
  };

  const handlePlanFechaChange = (id, nuevaFecha) => {
    setPlanes(planes.map(plan =>
      plan.id === id ? { ...plan, fecha: nuevaFecha } : plan
    ));
  };

  const handlePlanDirectorChange = (id, nuevoDirector) => {
    setPlanes(planes.map(plan =>
      plan.id === id ? { ...plan, director: nuevoDirector } : plan
    ));
  };

  const handleGuardarPlanes = async () => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(planes.map(plan =>
        axios.put(`http://localhost:8080/api/planes/${plan.id}`, plan, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ));
      alert('Planes guardados correctamente');
    } catch (error) {
      console.error('Error al guardar los planes:', error);
      alert('Error al guardar los planes');
    }
  };


  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };


  const handleDiaNocheFiltroChange = (e) => {
    setDiaNocheFiltro(e.target.value);
  };
  const handlePersonajeFiltroChange = (event) => {
    setPersonajeFiltro(event.target.value);
  };
  const handleInteriorExteriorFiltroChange = (e) => {
    setInteriorExteriorFiltro(e.target.value);
  };
  const handleLocacionFiltroChange = (event) => {
    setLocacionFiltro(event.target.value);
  };
  const generarPDF = () => {
    const doc = new jsPDF();
    // Configurar el título
    doc.setFontSize(18);
    doc.text('Plan de Rodaje', 105, 20, { align: 'center' });
    // Agregar información del proyecto
    doc.setFontSize(12);
    doc.text(`Nombre del proyecto: ${proyecto.titulo}`, 20, 40);
    doc.text(`Director: ${proyecto.director || 'No especificado'}`, 20, 50);
    // Agregar información de los bloques
    let yPos = 70;
    // Guardar el PDF
    doc.save('plan_de_rodaje.pdf');
  };

  const handleDragStart = (e, escena) => {
    e.dataTransfer.setData('escenaData', JSON.stringify(escena));
  };

  const escenasFiltradas = filterItems(escenas, filtro, diaNocheFiltro, interiorExteriorFiltro, personajeFiltro, locacionFiltro);
  //NUEVOOOO
  const fetchItemsAsignadosPorFecha = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/bloque-items/por-fecha', {
        headers: { Authorization: `Bearer ${token}` },
        params: { fecha: dayjs().format('YYYY-MM-DD') }
      });
      const itemsPorFecha = response.data.reduce((acc, item) => {
        const fecha = dayjs(item.bloque.fecha).format('YYYY-MM-DD');
        if (!acc[fecha]) acc[fecha] = [];
        acc[fecha].push(item);
        return acc;
      }, {});
      setItemsAsignadosPorFecha(itemsPorFecha);
    } catch (error) {
      console.error('Error al obtener items asignados por fecha:', error);
    }
  };
  const handleAsignarItems = async (fecha, items) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/bloque-items/asignar-por-fecha', {
        fecha: dayjs(fecha).format('YYYY-MM-DD'),
        items
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItemsAsignadosPorFecha();
      setShowAsignarItems(false);
    } catch (error) {
      console.error('Error al asignar items:', error);
      alert('Error al asignar items. Por favor, intente de nuevo.');
    }
  };
  const handleRecuperarItems = async (fecha, items) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/bloque-items/recuperar-por-fecha', {
        fecha: dayjs(fecha).format('YYYY-MM-DD'),
        items
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItemsAsignadosPorFecha();
      fetchInventario(); // Asegúrate de que esta función existe y actualiza el estado de la bodega
      setShowRecuperarItems(false);
    } catch (error) {
      console.error('Error al recuperar items:', error);
      alert('Error al recuperar items. Por favor, intente de nuevo.');
    }
  };
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
      <div className="asignar-items-container">
        <button onClick={() => setShowAsignarItems(true)} className="btn-asignar-items">
          Asignar Items a Fecha
        </button>
        <button onClick={() => setShowRecuperarItems(true)} className="btn-recuperar-items">
          Recuperar Items de Fecha
        </button>
        <button onClick={handleGuardarPlanes} className="guardar-btn">
          Guardar Planes
        </button>
        <button onClick={generarPDF} className="btn-descargar-pdf">Descargar PDF</button>
      </div>
      <div className="plan-de-rodaje-body">
        <div className="escenas-container">
          <div className="plan-de-rodaje-controles">
            <div className="plan-de-rodaje-filtros">
              <h2>Filtros</h2>
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
              <select value={personajeFiltro} onChange={handlePersonajeFiltroChange}>
                <option value="">Seleccionar Personaje</option>
                {personajes.map(personaje => (
                  <option key={personaje.id} value={personaje.id}>{personaje.nombre}</option>
                ))}
              </select>
              <select value={locacionFiltro} onChange={handleLocacionFiltroChange}>
                <option value="">Seleccionar Locación</option>
                {locaciones.map(locacion => (
                  <option key={locacion.id} value={locacion.id}>{locacion.nombre}</option>
                ))}
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
                        draggable="true"
                        onDragStart={(e) => {
                          const escenaData = JSON.stringify(escenaObj);
                          e.dataTransfer.setData('escenaData', escenaData);
                        }}
                      >
                        <span>{escenaObj.escena.titulo_escena || 'Sin título'}</span>
                        <span>{escenaObj.escena.resumen}</span>
                        <span>{escenaObj.escena.diaNoche}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="planes-container">
          <button className="crear-plan-btn" onClick={handleCrearPlan}>Crear Nuevo Plan</button>
          {planes.length > 0 ? (
            planes.map((plan) => (
              <div key={plan.id} className="plan-item">
                <h3>{plan.titulo}</h3>
                <p>Fecha: {new Date(plan.fecha).toLocaleDateString()}</p>
                <p>Director: {plan.director}</p>
                <h4>Escenas:</h4>
                <div
                  id={`plan-container-${plan.id}`}
                  data-plan-id={plan.id}
                  className="plan-escenas-container"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, plan.id)}
                >
                  {plan.escenas && plan.escenas.length > 0 ? (
                    plan.escenas.map((escena) => (
                      <div key={escena.id} className="escena-item">
                        {escena.titulo_escena || 'Sin título'}
                      </div>
                    ))
                  ) : (
                    <p>No hay escenas asignadas a este plan.</p>
                  )}
                </div>
                <button onClick={() => handleEliminarPlan(plan.id)}>Eliminar Plan</button>
              </div>
            ))
          ) : (
            <p>No hay planes creados aún.</p>
          )}
        </div>
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
      </div>
      {showAsignarItems && (
        <AsignarItemsFecha
          onClose={() => setShowAsignarItems(false)}
          onAsignar={handleAsignarItems}
          fecha={fechaSeleccionada}
        />
      )}
      {showRecuperarItems && (
        <RecuperarItemsFecha
          onClose={() => setShowRecuperarItems(false)}
          onRecuperar={handleRecuperarItems}
          fecha={fechaSeleccionada}
        />
      )}


      {showPlanForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Crear Nuevo Plan</h2>
            <form onSubmit={handleSubmitPlan}>
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
          </div>
        </div>
      )}
    </div>
  );
};
export default PlanDeRodaje;