const FiltrosEscenas = ({ onFiltroChange, filtros }) => {
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      onFiltroChange({ ...filtros, [name]: value });
    };
  
    return (
      <div>
        <input
          type="text"
          name="filtro"
          value={filtros.filtro}
          onChange={handleInputChange}
          placeholder="Buscar por título"
        />
        <select
          name="diaNocheFiltro"
          value={filtros.diaNocheFiltro}
          onChange={handleInputChange}
        >
          <option value="">Día/Noche</option>
          <option value="DIA">Día</option>
          <option value="NOCHE">Noche</option>
        </select>
        <select
          name="interiorExteriorFiltro"
          value={filtros.interiorExteriorFiltro}
          onChange={handleInputChange}
        >
          <option value="">Interior/Exterior</option>
          <option value="INTERIOR">Interior</option>
          <option value="EXTERIOR">Exterior</option>
        </select>
        <select
          name="personajeFiltro"
          value={filtros.personajeFiltro}
          onChange={handleInputChange}
        >
          <option value="">Personaje</option>
          {filtros.personajes.map(personaje => (
            <option key={personaje.id} value={personaje.id}>
              {personaje.nombre}
            </option>
          ))}
        </select>
        <select
          name="locacionFiltro"
          value={filtros.locacionFiltro}
          onChange={handleInputChange}
        >
          <option value="">Locación</option>
          {filtros.locaciones.map(locacion => (
            <option key={locacion.id} value={locacion.id}>
              {locacion.nombre}
            </option>
          ))}
        </select>
        <select
          name="capituloFiltro"
          value={filtros.capituloFiltro}
          onChange={handleInputChange}
        >
          <option value="">Capítulo</option>
          {filtros.capitulos.map(capitulo => (
            <option key={capitulo.id} value={capitulo.id}>
              {capitulo.nombre_capitulo}
            </option>
          ))}
        </select>
      </div>
    );
  };


export default FiltrosEscenas;

