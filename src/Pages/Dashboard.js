import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProyectoForm from './ProyectoForm';
import CapituloForm from './CapituloForm';
import EscenaForm from './EscenaForm';
import PersonajeForm from './PersonajeForm';
import LocacionForm from './LocacionForm';
import ItemForm from './ItemForm';
import EscenaDetails from './EscenaDetails';
import PlanDeRodaje from './PlanDeRodaje';

import '../Assets/Dashboard.css';

function Dashboard() {
  const [proyectos, setProyectos] = useState([]);
  const [bodega, setBodega] = useState([]);
  const [personajes, setPersonajes] = useState([]);
  const [locaciones, setLocaciones] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [showProyectoForm, setShowProyectoForm] = useState(false);
  const [showCapituloForm, setShowCapituloForm] = useState(false);
  const [showEscenaForm, setShowEscenaForm] = useState(false);
  const [showPersonajeForm, setShowPersonajeForm] = useState(false);
  const [showLocacionForm, setShowLocacionForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showInventario, setShowInventario] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [selectedCapitulo, setSelectedCapitulo] = useState(null);
  const [selectedEscena, setSelectedEscena] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editingProyecto, setEditingProyecto] = useState(null);
  const [editingCapitulo, setEditingCapitulo] = useState(null);
  const [editingPersonaje, setEditingPersonaje] = useState(null);
  const [editingLocacion, setEditingLocacion] = useState(null);
  const [showPersonajes, setShowPersonajes] = useState(false);
  const [showProyectoDetalle, setShowProyectoDetalle] = useState(false);
  const [showProyectoDetails, setShowProyectoDetails] = useState(false);
  const [showLocaciones, setShowLocaciones] = useState(false);
  const [capitulosExpanded, setCapitulosExpanded] = useState(false);
  const [escenasExpanded, setEscenasExpanded] = useState(false);
  const [showPlanDeRodaje, setShowPlanDeRodaje] = useState(false);
  const [escenasExpandidas, setEscenasExpandidas] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const usuarioIdResponse = await axios.get('http://localhost:8080/api/proyectos/usuario-id', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuarioId(usuarioIdResponse.data);

        const proyectosResponse = await axios.get(`http://localhost:8080/api/proyectos/${usuarioIdResponse.data}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProyectos(proyectosResponse.data);

        const bodegaResponse = await axios.get(`http://localhost:8080/api/items/bodega/${usuarioIdResponse.data}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBodega(bodegaResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVerDetallesProyecto = (proyecto) => {
    setSelectedProyecto(proyecto);
    setShowProyectoDetalle(true); // Mostrar los detalles del proyecto
  };

  const handleCloseProyectoDetails = () => {
    setSelectedProyecto(null);
    setShowProyectoDetalle(false); // Ocultar los detalles del proyecto
  };

  const handleMostrarPlanDeRodaje = (proyecto) => {
    setSelectedProyecto(proyecto);
    setShowPlanDeRodaje(true); // Mostrar el Plan de Rodaje
  };

  const handleClosePlanDeRodaje = () => {
    setSelectedProyecto(null);
    setShowPlanDeRodaje(false); // Ocultar el Plan de Rodaje
  };

  useEffect(() => {
    const fetchPersonajesAndLocaciones = async () => {
      try {
        const token = localStorage.getItem('token');
        if (selectedProyecto) {
          const personajesResponse = await axios.get(`http://localhost:8080/api/personajes/proyecto/${selectedProyecto.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPersonajes(personajesResponse.data);
  
          const locacionesResponse = await axios.get(`http://localhost:8080/api/locaciones/proyecto/${selectedProyecto.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLocaciones(locacionesResponse.data);
        } else {
          setPersonajes([]);
          setLocaciones([]);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchPersonajesAndLocaciones();
  }, [selectedProyecto]);

  const toggleShowProyectoDetalle = () => {
    setShowProyectoDetalle(!showProyectoDetalle);
  };
  const toggleCapituloForm = () => {
    setShowCapituloForm((prevShowCapituloForm) => !prevShowCapituloForm);
    setSelectedCapitulo(null); // Desactivar cualquier selección anterior para un nuevo capítulo
  };

  const toggleCapitulos = () => {
    setCapitulosExpanded(!capitulosExpanded);
  };

  const toggleEscenas = () => {
    setEscenasExpanded(!escenasExpanded);
  };

  const toggleEscenaForm = () => {
    setShowEscenaForm(prev => !prev);
    if (showEscenaForm) {
      setSelectedEscena(null); // Reset the selected scene when cancelling
    }
  };

  const handleProyectoSubmit = async (proyecto) => {
    try {
      const token = localStorage.getItem('token');
      if (selectedProyecto) {
        const response = await axios.put(`http://localhost:8080/api/proyectos/${selectedProyecto.id}`, proyecto, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProyectos(
          proyectos.map((p) => (p.id === selectedProyecto.id ? response.data : p))
        );
      } else {
        const response = await axios.post('http://localhost:8080/api/proyectos/', proyecto, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProyectos([...proyectos, response.data]);
      }
      setShowProyectoForm(false);
      setSelectedProyecto(null);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleShowPersonajeForm = () => {
    setShowPersonajeForm(!showPersonajeForm);
  };

  const toggleShowPersonajes = () => {
    setShowPersonajes(!showPersonajes);
    // Si la lista de personajes se está cerrando, también cerrar el formulario
    if (!showPersonajes && showPersonajeForm) {
      setShowPersonajeForm(false);
    }
  };

  const handleProyectoEdit = (proyecto) => {
    setEditingProyecto({...proyecto, editingTitle: proyecto.titulo});
  };
  
  const handleProyectoEditConfirm = async (editingProyecto) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8080/api/proyectos/${editingProyecto.id}`, 
        { ...editingProyecto, titulo: editingProyecto.editingTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProyectos(proyectos.map((p) => p.id === editingProyecto.id ? response.data : p));
      setEditingProyecto(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProyectoEditCancel = () => {
    setEditingProyecto(null);
  };

  const handleProyectoDelete = async (proyectoId, proyectoTitulo) => {
    const confirmacion = window.confirm(`¿Estás seguro de eliminar el proyecto "${proyectoTitulo}"?`);
    if (confirmacion) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/proyectos/${proyectoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProyectos(proyectos.filter((proyecto) => proyecto.id !== proyectoId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCapituloSubmit = async (capitulo) => {
    try {
      const token = localStorage.getItem('token');
      if (selectedCapitulo) {
        // Editando un capítulo existente
        const response = await axios.put(`http://localhost:8080/api/capitulos/${selectedCapitulo.id}`, capitulo, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedProyecto((prevProyecto) => ({
          ...prevProyecto,
          capitulos: prevProyecto.capitulos.map((c) =>
            c.id === selectedCapitulo.id ? response.data : c
          ),
        }));
      } else {
        // Creando un nuevo capítulo
        const response = await axios.post(`http://localhost:8080/api/capitulos/${selectedProyecto.id}`, capitulo, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedProyecto((prevProyecto) => ({
          ...prevProyecto,
          capitulos: [...prevProyecto.capitulos, response.data],
        }));
      }
      setShowCapituloForm(false); // Cerrar el formulario después de la operación
      setSelectedCapitulo(null); // Asegurarse de que selectedCapitulo esté en null
    } catch (error) {
      console.error(error);
    }
  };


  const handleCapituloEdit = (capitulo) => {
    setEditingCapitulo(capitulo);
    setSelectedCapitulo(null);
  };

  const handleCapituloEditConfirm = async (capitulo) => {
    await handleCapituloSubmit(capitulo);
    setEditingCapitulo(null);
  };

  const handleCapituloEditCancel = () => {
    setEditingCapitulo(null);
  };

  const handleCapituloDelete = async (capituloId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/capitulos/${capituloId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedProyecto((prevProyecto) => ({
        ...prevProyecto,
        capitulos: prevProyecto.capitulos.filter((capitulo) => capitulo.id !== capituloId),
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handlePersonajeSubmit = async (personaje) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/personajes/', {
        ...personaje,
        proyecto: { id: selectedProyecto.id },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersonajes([...personajes, response.data]);
      setShowPersonajeForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePersonajeEdit = async (personajeId, personaje) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8080/api/personajes/${personajeId}`, {
        ...personaje,
        proyecto: selectedProyecto.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersonajes(
        personajes.map((p) => (p.id === personajeId ? response.data : p))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handlePersonajeEditInit = (personaje) => {
    setEditingPersonaje(personaje);
  };

  const handlePersonajeEditConfirm = async (personaje) => {
    await handlePersonajeEdit(personaje.id, personaje);
    setEditingPersonaje(null);
  };

  const handlePersonajeEditCancel = () => {
    setEditingPersonaje(null);
  };

  const handlePersonajeDelete = async (personajeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/personajes/${personajeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersonajes(personajes.filter((personaje) => personaje.id !== personajeId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLocacionSubmit = async (locacion) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/locaciones/', {
        ...locacion,
        proyecto: { id: selectedProyecto.id },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocaciones([...locaciones, response.data]);
      setShowLocacionForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLocacionEdit = async (locacionId, locacion) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8080/api/locaciones/${locacionId}`, {
        ...locacion,
        proyecto: selectedProyecto.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocaciones(
        locaciones.map((l) => (l.id === locacionId ? response.data : l))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleLocacionEditInit = (locacion) => {
    setEditingLocacion(locacion);
  };

  const handleLocacionEditConfirm = async (locacion) => {
    await handleLocacionEdit(locacion.id, locacion);
    setEditingLocacion(null);
  };

  const handleLocacionEditCancel = () => {
    setEditingLocacion(null);
  };

  const handleLocacionDelete = async (locacionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/locaciones/${locacionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocaciones(locaciones.filter((locacion) => locacion.id !== locacionId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleEscenaSubmit = async (escena) => {
    try {
      const token = localStorage.getItem('token');
      const escenaData = {
        ...escena,
        capitulo: { id: selectedCapitulo.id },
        personajes: escena.personajes.map(personajeId => ({ id: personajeId })),
        locacion: escena.locacion ? { id: escena.locacion } : null,
      };
  
      if (selectedEscena) {
        const response = await axios.put(`http://localhost:8080/api/escenas/${selectedEscena.id}`, escenaData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedCapitulo((prevCapitulo) => ({
          ...prevCapitulo,
          escenas: prevCapitulo.escenas.map((e) =>
            e.id === selectedEscena.id ? response.data : e
          ),
        }));
      } else {
        const response = await axios.post('http://localhost:8080/api/escenas/', escenaData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedCapitulo((prevCapitulo) => ({
          ...prevCapitulo,
          escenas: [...(prevCapitulo.escenas || []), response.data],
        }));
      }
      setShowEscenaForm(false);
      setSelectedEscena(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEscenaEdit = (escena) => {
    setSelectedEscena(escena);
    setShowEscenaForm(true);
  };

  const handleEscenaDelete = async (escenaId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/escenas/${escenaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedCapitulo((prevCapitulo) => ({
        ...prevCapitulo,
        escenas: prevCapitulo.escenas.filter((escena) => escena.id !== escenaId),
      }));
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

  const handleItemEdit = (item) => {
    setEditingItem(item);
  };

  const handleItemEditCancel = () => {
    setEditingItem(null);
  };

  const handleItemEditConfirm = async (item) => {
    await handleItemSubmit(item);
    setEditingItem(null);
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
  //
  const fetchEscenas = async (capituloId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/escenas/capitulo/${capituloId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Respuesta completa de escenas:', JSON.stringify(response.data, null, 2));
      setSelectedCapitulo((prevCapitulo) => ({
        ...prevCapitulo,
        escenas: response.data,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCapituloClick = (capitulo) => {
    setSelectedCapitulo(capitulo); // Selecciona el capítulo
    setEscenasExpandidas((prevState) => ({
      ...prevState,
      [capitulo.id]: !prevState[capitulo.id], // Alternar visibilidad de escenas
    }));
    fetchEscenas(capitulo.id); // Recuperar escenas para el capítulo seleccionado
  };

  const toggleShowLocaciones = () => {
    setShowLocaciones(!showLocaciones);
    if (!showLocaciones && showLocacionForm) {
      setShowLocacionForm(false);
    }
  };

  const navigateToPlanDeRodaje = (proyectoId) => {
    navigate('/plan-de-rodaje', { state: { proyectoId } });
  };

  const toggleShowLocacionForm = () => {
    setShowLocacionForm(!showLocacionForm);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="dashboard-container">
    {!showProyectoDetails && !showPlanDeRodaje && (
      <div className="proyecto-list">
        <h1 style={{ textAlign: 'center' }}>Mis Proyectos</h1>
        <ul>
          {proyectos.map((proyecto) => (
            <li key={proyecto.id} className="proyecto-item">
              <div className="proyecto-info" onClick={() => !editingProyecto && handleVerDetallesProyecto(proyecto)}>
                {editingProyecto && editingProyecto.id === proyecto.id ? (
                  <input
                    type="text"
                    value={editingProyecto.editingTitle}
                    onChange={(e) => setEditingProyecto({...editingProyecto, editingTitle: e.target.value})}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span>{proyecto.titulo}</span>
                )}
              </div>

              <div className="proyecto-actions">
                <button onClick={() => navigateToPlanDeRodaje(proyecto.id)}>
                  <i className="fas fa-film"></i> Plan de Rodaje
                </button>
                {editingProyecto && editingProyecto.id === proyecto.id ? (
                  <>
                    <div className="button-container">
                      <button className="btn-confirm" onClick={() => handleProyectoEditConfirm(editingProyecto)}>
                        <i className="fas fa-check"></i> Confirmar
                      </button>
                      <button className="btn-cancel" onClick={handleProyectoEditCancel}>
                        <i className="fas fa-times"></i> Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button className="btn-edit" onClick={() => handleProyectoEdit(proyecto)}>
                      <i className="fas fa-edit"></i> Editar nombre
                    </button>
                    <button className="btn-delete" onClick={() => handleProyectoDelete(proyecto.id, proyecto.titulo)}>
                      <i className="fas fa-trash"></i> Eliminar
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
 
         <button className="btn-create" onClick={() => setShowProyectoForm(true)}>Crear Nuevo Proyecto</button>
         {showProyectoForm && (
           <ProyectoForm
             usuarioId={usuarioId}
             proyecto={selectedProyecto}
             onSubmit={handleProyectoSubmit}
           />
         )}
       </div>
      )}
      <div className={`inventario-container ${showInventario ? 'visible' : ''}`}>
        <button className="inventario-toggle" onClick={() => setShowInventario(!showInventario)}>
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
            {showItemForm && <ItemForm onSubmit={handleItemSubmit} />}
          </div>
        )}
      </div>
      {selectedProyecto && (
        <div className="proyecto-details">
          <div className="close-details-button">
            <button onClick={handleCloseProyectoDetails}>
              <i className="fas fa-times"></i> Cerrar
            </button>
          </div>
          <h1 style={{ textAlign: 'center' }}>Proyecto: {selectedProyecto.titulo}</h1>
          <div className="capitulo-list">
            <h4>Capítulos:</h4>
            <button onClick={toggleCapitulos} className="btn-toggle">
              {capitulosExpanded ? 'Ocultar Capítulos' : 'Mostrar Capítulos'}
            </button>
            {capitulosExpanded && (
              <ul>
                {selectedProyecto.capitulos &&
                  selectedProyecto.capitulos.map((capitulo) => (
                    <li key={capitulo.id} className="capitulo-item">
                      <div
                        className="capitulo-item"
                        onClick={() => handleCapituloClick(capitulo)}
                        style={{
                          backgroundColor: selectedCapitulo && selectedCapitulo.id === capitulo.id ? '#007bff' : '#f0f0f0',
                          color: selectedCapitulo && selectedCapitulo.id === capitulo.id ? '#fff' : '#333',
                          cursor: 'pointer',
                        }}
                      >
                        {editingCapitulo && editingCapitulo.id === capitulo.id ? (
                          <input
                            type="text"
                            value={editingCapitulo.nombre_capitulo}
                            onChange={(e) => setEditingCapitulo({ ...editingCapitulo, nombre_capitulo: e.target.value })}
                          />
                        ) : (
                          <span>{capitulo.nombre_capitulo}</span>
                        )}
                      </div>

                      <div className="capitulo-actions">
                        {editingCapitulo && editingCapitulo.id === capitulo.id ? (
                          <>
                            <button className="btn-confirm" onClick={() => handleCapituloEditConfirm(editingCapitulo)}>
                              <i className="fas fa-check"></i> Confirmar
                            </button>
                            <button className="btn-cancel" onClick={handleCapituloEditCancel}>
                              <i className="fas fa-times"></i> Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn-edit" onClick={() => handleCapituloEdit(capitulo)}>
                              <i className="fas fa-edit"></i> Editar nombre
                            </button>
                            <button className="btn-delete" onClick={() => handleCapituloDelete(capitulo.id)}>
                              <i className="fas fa-trash"></i> Eliminar
                            </button>
                          </>
                        )}
                      </div>
                      {selectedCapitulo && selectedCapitulo.id === capitulo.id && (
                        <div className="escena-list">

                          {escenasExpandidas[capitulo.id] && (
                            <div className="escena-container">

{selectedCapitulo.escenas && selectedCapitulo.escenas.length > 0 ? (
  <table>
    <thead>
      <tr>
        <th>Escena</th>
        <th>Take</th>
        <th>Resumen</th>
        <th>Interior/Exterior</th>
        <th>Día/Noche</th>
        <th>Personajes</th>
        <th>Locación</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {selectedCapitulo.escenas.map((escena) => {
        const locacion = typeof escena.locacion === 'object' ? escena.locacion : locaciones[escena.locacion];

        console.log(`Escena ID: ${escena.id}`);
        console.log(`Título: ${escena.titulo_escena}`);
        console.log(`Locación:`, locacion);

        return (
          <tr key={escena.id}>
            <td>{escena.titulo_escena}</td>
            <td>{escena.numeroEscena}</td>
            <td>{escena.resumen}</td>
            <td>{escena.interiorExterior || "No especificado"}</td>
            <td>{escena.diaNoche || "No especificado"}</td>
            <td>
              {escena.personajes
                ? escena.personajes.map(p => p.nombre).join(', ')
                : "No especificado"}
            </td>
            <td>
              {locacion && locacion.nombre
                ? locacion.nombre
                : "No especificado"}
            </td>
            <td>
              <button className="btn-edit" onClick={() => handleEscenaEdit(escena)}>
                <i className="fas fa-edit"></i>
              </button>
              <button className="btn-delete" onClick={() => handleEscenaDelete(escena.id)}>
                <i className="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
) : (
  <p></p>
  
)}

<div className="escena-form-container">
      <button
        className={`btn-create ${showEscenaForm ? 'cancelar' : 'crear'}`}
        onClick={toggleEscenaForm}
      >
        {showEscenaForm ? 'Cancelar' : 'Crear Nueva Escena'}
      </button>
      {showEscenaForm && (
        <EscenaForm 
          capituloId={selectedCapitulo.id}
          escena={selectedEscena}
          personajes={personajes}
          locaciones={locaciones}
          interiorExterior={selectedEscena ? selectedEscena.interiorExterior : 'INTERIOR'}
          diaNoche={selectedEscena ? selectedEscena.diaNoche : 'DIA'}
          proyectoId={selectedProyecto.id}
          onSubmit={handleEscenaSubmit}

        />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            )}
<button className="btn-create" onClick={toggleCapituloForm}>
  {showCapituloForm ? 'Cancelar' : 'Crear Nuevo Capítulo'}
</button>
{showCapituloForm && (
  <CapituloForm proyectoId={selectedProyecto.id} capitulo={null} onSubmit={handleCapituloSubmit}  />
            )}
          </div>
          <div className="personaje-list">
            <h4>Personajes:</h4>
            <button className="btn-toggle" onClick={toggleShowPersonajes}>
              {showPersonajes ? 'Ocultar Personajes' : 'Mostrar Personajes'}
            </button>
            {showPersonajes && (
              <ul>
                {personajes.map((personaje) => (
                  <li key={personaje.id} className="personaje-item">
                    {editingPersonaje && editingPersonaje.id === personaje.id ? (
                      <input
                        type="text"
                        value={editingPersonaje.nombre}
                        onChange={(e) =>
                          setEditingPersonaje({ ...editingPersonaje, nombre: e.target.value })
                        }
                      />
                    ) : (
                      <span>{personaje.nombre}</span>
                    )}
                    <div className="personaje-actions">
                      {editingPersonaje && editingPersonaje.id === personaje.id ? (
                        <>
                          <button className="btn-confirm" onClick={() => handlePersonajeEditConfirm(editingPersonaje)}>
                            <i className="fas fa-check"></i> Confirmar
                          </button>
                          <button className="btn-cancel" onClick={handlePersonajeEditCancel}>
                            <i className="fas fa-times"></i> Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn-edit" onClick={() => handlePersonajeEditInit(personaje)}>
                            <i className="fas fa-edit"></i> Editar
                          </button>
                          <button className="btn-delete" onClick={() => handlePersonajeDelete(personaje.id)}>
                            <i className="fas fa-trash"></i> Eliminar
                          </button>
                        </>
                      )}
                    </div>
                    <div className="descripcion">{personaje.descripcion}</div>
                  </li>
                ))}
              </ul>
            )}
            <button className="btn-create" onClick={toggleShowPersonajeForm}>
              {showPersonajeForm ? 'Cancelar' : 'Agregar Personajes'}
            </button>
            {showPersonajeForm && (
              <PersonajeForm
                proyectoId={selectedProyecto.id}
                onSubmit={handlePersonajeSubmit}
              />
            )}
          </div>
          <div className="locacion-list">
            <h4>Locaciones:</h4>
            <button className="btn-toggle" onClick={toggleShowLocaciones}>
              {showLocaciones ? 'Ocultar Locaciones' : 'Mostrar Locaciones'}
            </button>
            {showLocaciones && (
              <ul>
                {locaciones.map((locacion) => (
                  <li key={locacion.id} className="locacion-item">
                    {editingLocacion && editingLocacion.id === locacion.id ? (
                      <input
                        type="text"
                        value={editingLocacion.nombre}
                        onChange={(e) =>
                          setEditingLocacion({ ...editingLocacion, nombre: e.target.value })
                        }
                      />
                    ) : (
                      <span>{locacion.nombre}</span>
                    )}
                    <div className="locacion-actions">
                      {editingLocacion && editingLocacion.id === locacion.id ? (
                        <>
                          <button className="btn-confirm" onClick={() => handleLocacionEditConfirm(editingLocacion)}>
                            <i className="fas fa-check"></i> Confirmar
                          </button>
                          <button className="btn-cancel" onClick={handleLocacionEditCancel}>
                            <i className="fas fa-times"></i> Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn-edit" onClick={() => handleLocacionEditInit(locacion)}>
                            <i className="fas fa-edit"></i> Editar
                          </button>
                          <button className="btn-delete" onClick={() => handleLocacionDelete(locacion.id)}>
                            <i className="fas fa-trash"></i> Eliminar
                          </button>
                        </>
                      )}
                    </div>
                    <div className="descripcion">{locacion.descripcion}</div>
                  </li>
                ))}
              </ul>
            )}
            <button className="btn-create" onClick={toggleShowLocacionForm}>
              {showLocacionForm ? 'Cancelar' : 'Agregar Locaciones'}
            </button>
            {showLocacionForm && (
              <LocacionForm
                proyectoId={selectedProyecto.id}
                onSubmit={handleLocacionSubmit}
                onCancel={() => setShowLocacionForm(false)}
              />
            )}

            {showPlanDeRodaje && (
              <PlanDeRodaje
                proyecto={selectedProyecto}
                escenas={selectedProyecto.capitulos.flatMap((capitulo) => capitulo.escenas)}
                inventario={bodega}
                onClose={handleClosePlanDeRodaje}
              />

            )}


          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

