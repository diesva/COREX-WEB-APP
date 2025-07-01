import { useState, useEffect } from "react";
import styled from "styled-components";

const SearchableSelect = ({ options, value, onChange, label, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);

  // Sincronizar searchTerm con value cuando value cambia
  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  // Filtrar opciones según el término de búsqueda
  const filteredOptions = options.filter((option) =>
    option.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.id.includes(searchTerm)
  );

  // Manejar la selección de una opción
  const handleSelect = (option) => {
    if (option) {
      onChange(option.descripcion);
      setSearchTerm(option.descripcion);
    } else {
      onChange(""); // Limpiar selección
      setSearchTerm("");
    }
    setIsOpen(false);
  };

  // Manejar el enfoque del input
  const handleFocus = () => {
    setSearchTerm(""); // Limpiar búsqueda para mostrar todas las opciones
    setIsOpen(true);
  };

  return (
    <FormInputGroup>
      <label>{label}</label>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder={value ? "" : placeholder} // Ocultar placeholder si hay selección
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
        />
        {isOpen && (
          <SelectContainer>
            <select
              size={Math.min(filteredOptions.length + 1, 6)} // +1 para la opción "-- Seleccione --"
              onChange={(e) => {
                if (e.target.value === "") {
                  handleSelect(null); // Limpiar selección
                } else {
                  const selectedOption = filteredOptions.find(
                    (opt) => opt.descripcion === e.target.value
                  );
                  if (selectedOption) handleSelect(selectedOption);
                }
              }}
              value={value || ""}
            >
              <option value="">-- Seleccione --</option>
              {filteredOptions.map((option) => (
                <option key={option.id} value={option.descripcion}>
                  {option.id} - {option.descripcion}
                </option>
              ))}
            </select>
          </SelectContainer>
        )}
      </SearchContainer>
    </FormInputGroup>
  );
};

const FormInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  label {
    font-size: 14px;
    color: ${(props) => props.theme.text};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};
  border: 1px solid #414244;
  border-radius: 10px;
  padding: 12px 15px;
  font-size: 16px;
  outline: none;
  width: 100%;
`;

const SelectContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background: ${(props) => props.theme.bg};
  border: 1px solid #ccc;
  border-radius: 10px;
  max-height: 200px;
  overflow-y: auto;

  select {
    width: 100%;
    background: transparent;
    border: none;
    padding: 10px;
    font-size: 14px;
    color: ${(props) => props.theme.text};
    outline: none;
    cursor: pointer;

    option {
      padding: 8px;
      white-space: normal; /* Permitir texto largo */
      word-wrap: break-word;
    }
  }
`;

export default SearchableSelect;