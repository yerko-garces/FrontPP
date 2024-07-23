import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PersonajeForm from './PersonajeForm';
import LocacionForm from './LocacionForm';
import '../Assets/EscenaForms.css';

function EscenaForm({ capituloId, escena, personajes, locaciones, proyectoId, onSubmit, onAddPersonaje, onAddLocacion }) {

  const [tituloEscena, setTituloEscena] = useState(escena ? escena.titulo_escena : '');
  const [numeroEscena, setNumeroEscena] = useState(escena ? escena.numeroEscena : '');
  const [interiorExterior, setInteriorExterior] = useState(escena ? escena.interiorExterior : 'INTERIOR');
  const [diaNoche, setDiaNoche] = useState(escena ? escena.diaNoche : 'DIA');
  const [resumen, setResumen] = useState(escena ? escena.resumen : '');
  const [selectedPersonajes, setSelectedPersonajes] = useState(escena ? escena.personajes.map(p => p.id) : []);
  const [selectedLocacion, setSelectedLocacion] = useState(escena ? (escena.locacion ? escena.locacion.id : null) : null);
  const [personajesList, setPersonajesList] = useState(personajes); // Estado local para la lista de personajes
  const [locacionesList, setLocacionesList] = useState(locaciones); // Estado local para la lista de personajes

  const [showPersonajeForm, setShowPersonajeForm] = useState(false);
  const [showLocacionForm, setShowLocacionForm] = useState(false);

  useEffect(() => {
    if (escena) {
      setTituloEscena(escena.titulo_escena);
      setNumeroEscena(escena.numeroEscena);
      setInteriorExterior(escena.interiorExterior);
      setDiaNoche(escena.diaNoche);
      setResumen(escena.resumen);
      setSelectedPersonajes(escena.personajes.map(p => p.id));
      setSelectedLocacion(escena.locacion ? escena.locacion.id : null);
    }
  }, [escena]);

  useEffect(() => {
    setPersonajesList(personajes); // Actualiza la lista de personajes cuando cambie el prop
  }, [personajes]);

  const resetForm = () => {
    setTituloEscena('');
    setNumeroEscena('');
    setInteriorExterior('INTERIOR');
    setDiaNoche('DIA');
    setResumen('');
    setSelectedPersonajes([]);
    setSelectedLocacion(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      titulo_escena: tituloEscena,
      numeroEscena,
      interiorExterior,
      diaNoche,
      resumen,
      personajes: selectedPersonajes,
      locacion: selectedLocacion,
      proyectoId,
    });
    resetForm();
  };

  const handlePersonajeSubmit = async (personaje) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/personajes/', {
        ...personaje,
        proyecto: { id: proyectoId },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersonajesList([...personajesList, response.data]); // Actualiza la lista local de personajes
      setSelectedPersonajes([...selectedPersonajes, response.data.id]);
      setShowPersonajeForm(false);
    } catch (error) {
      console.error('Error al agregar personaje:', error);
    }
  };

  const handleAddPersonaje = (personaje) => {
    handlePersonajeSubmit(personaje);
  };

  const handlePersonajeChange = (personajeId) => {
    if (selectedPersonajes.includes(personajeId)) {
      setSelectedPersonajes(selectedPersonajes.filter(id => id !== personajeId));
    } else {
      setSelectedPersonajes([...selectedPersonajes, personajeId]);
    }
  };

  const handleLocacionSubmit = async (locacion) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/locaciones/', {
        ...locacion,
        proyecto: { id: proyectoId },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocacionesList([...locacionesList, response.data]); // Actualiza la lista local de locaciones
      setSelectedLocacion(response.data.id); // Selecciona la nueva locación
      setShowLocacionForm(false); // Cierra el formulario de locación
    } catch (error) {
      console.error('Error al agregar locación:', error);
    }
  };

  const handleAddLocacion = async (locacion) => {
    handleLocacionSubmit(locacion);
  };

  const toggleShowPersonajeForm = () => {
    setShowPersonajeForm(!showPersonajeForm);
  };

  const toggleShowLocacionForm = () => {
    setShowLocacionForm(!showLocacionForm);
  };

  return (
    <div>
      <div>
        <p><strong>Proyecto ID:</strong> {proyectoId || 'No disponible'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <table className="form-table">
          <tbody>
            <tr>
              <td>
                <label htmlFor="tituloEscena">Número Escena:</label>
              </td>
              <td>
                <input
                  type="text"
                  id="tituloEscena"
                  value={tituloEscena}
                  onChange={(e) => setTituloEscena(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="numeroEscena">Take:</label>
              </td>
              <td>
                <input
                  type="text"
                  id="numeroEscena"
                  value={numeroEscena}
                  onChange={(e) => setNumeroEscena(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="interiorExterior">Interior/Exterior:</label>
              </td>
              <td>
                <select
                  id="interiorExterior"
                  value={interiorExterior}
                  onChange={(e) => setInteriorExterior(e.target.value)}
                >
                  <option value="INTERIOR">Interior</option>
                  <option value="EXTERIOR">Exterior</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="diaNoche">Día/Noche:</label>
              </td>
              <td>
                <select
                  id="diaNoche"
                  value={diaNoche}
                  onChange={(e) => setDiaNoche(e.target.value)}
                >
                  <option value="DIA">Día</option>
                  <option value="NOCHE">Noche</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="resumen">Resumen:</label>
              </td>
              <td>
                <textarea
                  id="resumen"
                  value={resumen}
                  onChange={(e) => setResumen(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Personajes:</label>
              </td>
              <td>
                {Array.isArray(personajesList) && personajesList.map(personaje => (
                  <div key={personaje.id}>
                    <input
                      type="checkbox"
                      value={personaje.id}
                      checked={selectedPersonajes.includes(personaje.id)}
                      onChange={() => handlePersonajeChange(personaje.id)}
                    />
                    <label>{personaje.nombre}</label>
                  </div>
                ))}
                <button type="button" className="btn-create" onClick={toggleShowPersonajeForm}>
                  {showPersonajeForm ? 'Cancelar' : 'Agregar Personajes'}
                </button>
                {showPersonajeForm && (
                  <PersonajeForm
                    proyectoId={proyectoId}
                    onSubmit={handleAddPersonaje}
                  
                  />
                )}
              </td>
            </tr>
            <tr>
              <td>
                <label>Locación:</label>
              </td>
              <td>
              <select value={selectedLocacion || ''} onChange={(e) => setSelectedLocacion(parseInt(e.target.value))}>
  <option value="">Seleccionar locación</option>
  {Array.isArray(locacionesList) && locacionesList.map(locacion => (
    <option key={locacion.id} value={locacion.id}>{locacion.nombre}</option>
  ))}
</select>
                <button type="button" className="btn-create" onClick={toggleShowLocacionForm}>
                  {showLocacionForm ? 'Cancelar' : 'Agregar Locación'}
                </button>
                {showLocacionForm && (
                  <LocacionForm
                    proyectoId={proyectoId}
                    onSubmit={handleAddLocacion}
                  />
                )}
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <button type="submit">{escena ? 'Actualizar Escena' : 'Crear Escena'}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}

export default EscenaForm;


