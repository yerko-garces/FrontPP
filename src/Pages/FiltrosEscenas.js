import React, { useState } from 'react';

function FiltrosEscenas({ onFiltroChange, filtros }) {
    const [filtro, setFiltro] = useState(filtros.filtro);
    const [diaNocheFiltro, setDiaNocheFiltro] = useState(filtros.diaNocheFiltro);
    const [interiorExteriorFiltro, setInteriorExteriorFiltro] = useState(filtros.interiorExteriorFiltro);
    const [personajeFiltro, setPersonajeFiltro] = useState(filtros.personajeFiltro);
    const [locacionFiltro, setLocacionFiltro] = useState(filtros.locacionFiltro);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        if (name === 'filtro') setFiltro(value);
        if (name === 'diaNocheFiltro') setDiaNocheFiltro(value);
        if (name === 'interiorExteriorFiltro') setInteriorExteriorFiltro(value);
        if (name === 'personajeFiltro') setPersonajeFiltro(value);
        if (name === 'locacionFiltro') setLocacionFiltro(value);

        // Notificar al componente padre sobre los cambios en los filtros
        onFiltroChange({
            filtro,
            diaNocheFiltro,
            interiorExteriorFiltro,
            personajeFiltro,
            locacionFiltro
        });
        onFiltroChange({ ...filtros, [name]: value });
    };

    return (
        <div className="plan-de-rodaje-filtros">
            <h2>Filtros</h2>
            <input
                type="text"
                name="filtro"
                placeholder="Filtrar escenas por título"
                value={filtro}
                onChange={handleFiltroChange}
            />
            <select name="diaNocheFiltro" value={diaNocheFiltro} onChange={handleFiltroChange}>
                <option value="">Dia-Noche</option>
                <option value="DIA">Día</option>
                <option value="NOCHE">Noche</option>
            </select>
            <select name="interiorExteriorFiltro" value={interiorExteriorFiltro} onChange={handleFiltroChange}>
                <option value="">Interior-Exterior</option>
                <option value="INTERIOR">Interior</option>
                <option value="EXTERIOR">Exterior</option>
            </select>
            <select name="personajeFiltro" value={personajeFiltro} onChange={handleFiltroChange}>
                <option value="">Seleccionar Personaje</option>
                {filtros.personajes.map(personaje => (
                    <option key={personaje.id} value={personaje.id}>{personaje.nombre}</option> // Usar personaje.nombre
                ))}
            </select>
            <select name="locacionFiltro" value={locacionFiltro} onChange={handleFiltroChange}>
                <option value="">Seleccionar Locación</option>
                {filtros.locaciones.map(locacion => (
                    <option key={locacion.id} value={locacion.id}>{locacion.nombre}</option>
                ))}
            </select>
        </div>
    );
}

export default FiltrosEscenas;
