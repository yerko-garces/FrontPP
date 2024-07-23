import React, { useState, useEffect, useRef } from 'react';

import axios from 'axios';

import dayjs from 'dayjs';

import { useLocation, useNavigate } from 'react-router-dom';

import { Link } from 'react-router-dom';

import Sortable from 'sortablejs';

import '../Assets/PlanDeRodaje.css';

import AsignarItemsFecha from './AsignarItemsFecha';

import RecuperarItemsFecha from './RecuperarItemsFecha';

import jsPDF from 'jspdf';

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

  const [escenasEnPlanesTemp, setEscenasEnPlanesTemp] = useState({});
  const [sortableInstances, setSortableInstances] = useState({});
  





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

        // Asegúrate de que cada plan tenga sus escenas cargadas

        const planesConEscenas = await Promise.all(planesResponse.data.map(async (plan) => {

          const planDetallado = await axios.get(`http://localhost:8080/api/planes/${plan.id}`, {

            headers: { Authorization: `Bearer ${token}` },

          });

          return planDetallado.data;

        }));

        setPlanes(planesConEscenas);

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



  const handleDrop = (e) => {
    e.preventDefault();

    const jsonData = e.dataTransfer.getData('application/json');

    try {
      const escenaData = JSON.parse(jsonData);
      if (!escenaData || !escenaData.escena || !escenaData.escena.id) {
        console.warn('Invalid scene data');
        return;
      }

      const dropTarget = e.target.closest('.plan-item');

      if (dropTarget) {
        const planId = parseInt(dropTarget.getAttribute('data-plan-id'));

        if (!isNaN(planId)) {
          // Actualizar el estado temporal
          setEscenasEnPlanesTemp(prev => ({
            ...prev,
            [planId]: [...(prev[planId] || []), escenaData.escena.id]
          }));

          // Actualizar el estado de los planes inmediatamente
          setPlanes(prevPlanes => prevPlanes.map(plan => {
            if (plan.id === planId) {
              const nuevaEscenaEtiqueta = {
                escena: escenaData.escena,
                posicion: (plan.planEscenaEtiquetas?.length || 0) + 1
              };
              return {
                ...plan,
                planEscenaEtiquetas: [...(plan.planEscenaEtiquetas || []), nuevaEscenaEtiqueta]
              };
            }
            return plan;
          }));

          console.log("Escena agregada al plan:", planId);
        } else {
          console.error('Invalid plan ID:', planId);
          alert('No se pudo determinar el plan de destino. Intenta nuevamente.');
        }
      } else {
        alert('Suelta la escena dentro de un plan válido.');
      }

    } catch (error) {
      console.error('Error parsing scene data:', error);
      alert('Error: The dragged element does not have the correct format.');
    }
  };

<<<<<<< HEAD
  const agregarEscenasAPlan = (planId, escenaIds) => {
    setEscenasEnPlanesTemp(prev => ({
      ...prev,
      [planId]: [...(prev[planId] || []), ...escenaIds] // Concatenar nuevas escenas
    }));
  };
=======


  const agregarEscenasAPlan = (planId, escenaIds) => {

    setEscenasEnPlanesTemp(prev => ({

      ...prev,

      [planId]: [...(prev[planId] || []), ...escenaIds] // Concatenar nuevas escenas

    }));

  };


>>>>>>> 5aa039c8581804c0b3cf8585947f8526a1bfb79a

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

      const escenasContainer = document.getElementById(`escenas-container-${capitulo.id}`);

      if (escenasContainer) {

        Sortable.create(escenasContainer, {

          group: {

            name: 'escenas',

            pull: 'clone',

            put: false,

          },

          animation: 150,

          sort: false,

          draggable: ".escena-item", // Asegura que solo los elementos con esta clase sean arrastrables

        });

      }

    });



    planes.forEach((plan) => {
      const planContainer = document.getElementById(`plan-container-${plan.id}`);
      if (planContainer && !sortableInstances[plan.id]) {
        const instance = Sortable.create(planContainer, {
          group: { name: 'planes', put: ['escenas'] },
          animation: 150,
          filter: '.new-escena', // Filtra las nuevas escenas para que no sean arrastrables
          onEnd: (evt) => {
            if (evt.to !== evt.from) {
              const escenaId = parseInt(evt.item.getAttribute('data-id'));
              const planId = parseInt(evt.to.getAttribute('data-plan-id'));
              agregarEscenasAPlan(planId, [escenaId]);
            }
            actualizarPosicionesEscenas(evt.to.id);
          }
        });
        setSortableInstances(prev => ({ ...prev, [plan.id]: instance }));
      }
    });

    return () => {
      // Destruye las instancias de Sortable al desmontar el componente
      Object.values(sortableInstances).forEach(instance => instance.destroy());
    };
  }, [planes]);

  const actualizarPosicionesEscenas = async (planContainerId) => {
    const planId = planContainerId.split('-')[2];
    const items = document.querySelectorAll(`#${planContainerId} .escena-item:not(.new-escena)`);
    const newOrder = Array.from(items).map((item, index) => ({
      escena: { id: parseInt(item.getAttribute('data-id')) },
      posicion: index + 1,
      plan: { id: parseInt(planId) }
    }));

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/planes/${planId}/elementos`,
        newOrder,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Actualizar el estado local
      setPlanes(prevPlanes => prevPlanes.map(plan => {
        if (plan.id === parseInt(planId)) {
          return {
            ...plan,
            planEscenaEtiquetas: newOrder.map(item => ({
              escena: plan.planEscenaEtiquetas.find(e => e.escena.id === item.escena.id).escena,
              posicion: item.posicion
            }))
          };
        }
        return plan;
      }));

    } catch (error) {
      console.error('Error al actualizar las posiciones de las escenas:', error);
      alert('Error al actualizar las posiciones de las escenas');
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

        titulo: newPlan.titulo,

        fecha: dayjs(newPlan.fecha).format('YYYY-MM-DD'),

        director: newPlan.director,

        proyecto: { id: proyectoId } // Solo enviamos el ID del proyecto

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
<<<<<<< HEAD
      const token = localStorage.getItem('token');
      for (const planId in escenasEnPlanesTemp) {
        const escenaIds = escenasEnPlanesTemp[planId];
        const elementos = escenaIds.map((escenaId, index) => ({
          escena: { id: escenaId },
          posicion: index + 1
        }));

        await axios.put(
          `http://localhost:8080/api/planes/${planId}/elementos/`,
          elementos,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Actualizar el estado de planes (opcional, si quieres reflejar los cambios en la interfaz)
        setPlanes(prevPlanes => prevPlanes.map(plan =>
          plan.id === parseInt(planId) ? { ...plan, escenas: elementos.map(el => el.escena) } : plan
        ));
      }
      setEscenasEnPlanesTemp({});  // Limpiar escenas temporales después de guardar
      alert('Planes guardados correctamente');
    } catch (error) {
      console.error('Error al guardar los planes:', error);
      alert('Error al guardar los planes');
    }
  };
=======

      const token = localStorage.getItem('token');

      for (const planId in escenasEnPlanesTemp) {

        const plan = planes.find(p => p.id === parseInt(planId));

        if (!plan) continue;



        // Combinar las escenas existentes con las nuevas

        const escenasExistentes = plan.planEscenaEtiquetas?.map(item => item.escena.id) || [];

        const todasLasEscenas = [...new Set([...escenasExistentes, ...escenasEnPlanesTemp[planId]])];



        const elementos = todasLasEscenas.map((escenaId, index) => ({

          escena: { id: escenaId },

          posicion: index + 1,

          plan: { id: parseInt(planId) }

        }));



        await axios.put(

          `http://localhost:8080/api/planes/${planId}/elementos`,

          elementos,

          {

            headers: { Authorization: `Bearer ${token}` },

          }

        );



        // Obtener el plan actualizado del servidor

        const planActualizado = await axios.get(`http://localhost:8080/api/planes/${planId}`, {

          headers: { Authorization: `Bearer ${token}` },

        });



        // Actualizar el estado de planes

        setPlanes(prevPlanes => prevPlanes.map(p =>

          p.id === parseInt(planId) ? planActualizado.data : p

        ));

      }

      setEscenasEnPlanesTemp({});  // Limpiar escenas temporales después de guardar

      alert('Planes guardados correctamente');

    } catch (error) {

      console.error('Error al guardar los planes:', error);

      alert('Error al guardar los planes');

    }

  };



>>>>>>> 5aa039c8581804c0b3cf8585947f8526a1bfb79a


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

    const escenaData = JSON.stringify({

      escena: {

        id: escena.escena.id,

        titulo_escena: escena.escena.titulo_escena,

        resumen: escena.escena.resumen,

        diaNoche: escena.escena.diaNoche

      }

    });

    e.dataTransfer.setData('application/json', escenaData);

    e.dataTransfer.effectAllowed = 'copy';

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

                    {escenasFiltradas

                      .filter((escenaObj) => escenaObj.escena.capitulo === capitulo.id)

                      .map((escenaObj) => (

                        <li

                          key={escenaObj.escena.id}  // Clave única agregada

                          className="escena-item"

                          draggable="true"

                          onDragStart={(e) => handleDragStart(e, escenaObj)}

                          data-id={escenaObj.escena.id}>

                          <span>{escenaObj.escena.titulo_escena || 'Sin título'}</span>

                          <span>{escenaObj.escena.resumen}</span>
<<<<<<< HEAD
                          
=======

>>>>>>> 5aa039c8581804c0b3cf8585947f8526a1bfb79a
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

          {planes.map((plan) => (
          <div key={plan.id} className="plan-item" data-plan-id={plan.id}>
            <h3>{plan.titulo}</h3>
            <p>Fecha: {new Date(plan.fecha).toLocaleDateString()}</p>
            <p>Director: {plan.director}</p>
            <h4>Escenas:</h4>
            <div
              id={`plan-container-${plan.id}`}
              className="plan-escenas-container"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {plan.planEscenaEtiquetas && plan.planEscenaEtiquetas.length > 0 ? (
                plan.planEscenaEtiquetas
                  .sort((a, b) => a.posicion - b.posicion)
                  .map((item) => (
                    <div
                      key={`${item.escena.id}-${item.posicion}`}
                      className={`escena-item ${escenasEnPlanesTemp[plan.id]?.includes(item.escena.id) ? 'new-escena' : ''}`}
                      data-id={item.escena.id}
                    >
                      {item.escena.titulo_escena || 'Sin título'}
                      {item.escena.resumen && <p>{item.escena.resumen}</p>}
                      {item.escena.diaNoche && <p>{item.escena.diaNoche}</p>}
                    </div>
                  ))
              ) : (
                <p>No hay escenas asignadas a este plan.</p>
              )}
            </div>
            <button onClick={() => handleEliminarPlan(plan.id)}>Eliminar Plan</button>
          </div>
        ))}

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