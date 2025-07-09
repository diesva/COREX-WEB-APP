import { useEffect, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Spinner,
  useOperaciones,
  Btnsave,
  useUsuariosStore,
  useCategoriasStore,
  Selector,
  useProductosStore,
  useMarcaStore,
  ListaGenerica,
  Btnfiltro,
  RegistrarMarca,
  RegistrarCategorias,
} from "../../../index";
import { useForm } from "react-hook-form";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { Device } from "../../../styles/breakpoints";

export function RegistrarProductos({ onClose, dataSelect, accion }) {
  const { insertarProductos, editarProductos } = useProductosStore();
  const { datamarca, selectMarca, marcaItemSelect } = useMarcaStore();
  const { datacategorias, categoriaItemSelect, selectCategoria } = useCategoriasStore();
  const { dataempresa } = useEmpresaStore();

  // Estado para el combobox de unidad_medida
  const [stateUnidadMedida, setStateUnidadMedida] = useState(false);
  const [unidadMedidaSelect, setUnidadMedidaSelect] = useState(
    accion === "Editar" ? { descripcion: dataSelect.unidad_medida } : { descripcion: "" }
  );

  // Estado para el checkbox de fecha de vencimiento
  const [hasExpirationDate, setHasExpirationDate] = useState(
    accion === "Editar" ? !!dataSelect.fecha_vencimiento : false
  );

  const [stateMarca, setStateMarca] = useState(false);
  const [stateCategoria, setStateCategoria] = useState(false);
  const [openRegistroMarca, SetopenRegistroMarca] = useState(false);
  const [openRegistroCategoria, SetopenRegistroCategoria] = useState(false);
  const [subaccion, setAccion] = useState("");

  function nuevoRegistroMarca() {
    SetopenRegistroMarca(!openRegistroMarca);
    setAccion("Nuevo");
  }
  function nuevoRegistroCategoria() {
    SetopenRegistroCategoria(!openRegistroCategoria);
    setAccion("Nuevo");
  }

  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
    watch,
  } = useForm();

  // Opciones para el combobox de unidad_medida
  const unidadesMedida = [
    { id: 1, descripcion: "Gramo" },
    { id: 2, descripcion: "Kilogramo" },
    { id: 3, descripcion: "Mililitro" },
    { id: 4, descripcion: "Litro" },
    { id: 5, descripcion: "Unidad" },
    { id: 6, descripcion: "Galón" },
  ];

  // Función para seleccionar unidad_medida
  const selectUnidadMedida = (item) => {
    setUnidadMedidaSelect(item);
    setStateUnidadMedida(false);
  };

  async function insertar(data) {
    if (accion === "Editar") {
      const p = {
        id: dataSelect.id,
        descripcion: data.descripcion,
        idmarca: marcaItemSelect.id,
        stock: parseFloat(data.stock),
        stock_minimo: parseFloat(data.stockminimo),
        codigobarras: data.codigobarras,
        codigointerno: data.codigointerno,
        precioventa: parseFloat(data.precioventa),
        preciocompra: parseFloat(data.preciocompra),
        id_categoria: categoriaItemSelect.id,
        id_empresa: dataempresa.id,
        unidad_medida: unidadMedidaSelect.descripcion,
        fecha_vencimiento: hasExpirationDate ? data.fecha_vencimiento : null, // Enviar fecha o null
      };
      await editarProductos(p);
      onClose();
    } else {
      const p = {
        _descripcion: data.descripcion,
        _idmarca: marcaItemSelect.id,
        _stock: parseFloat(data.stock),
        _stock_minimo: parseFloat(data.stockminimo),
        _codigobarras: data.codigobarras,
        _codigointerno: data.codigointerno,
        _precioventa: parseFloat(data.precioventa),
        _preciocompra: parseFloat(data.preciocompra),
        _id_categoria: categoriaItemSelect.id,
        _id_empresa: dataempresa?.id,
        _unidad_medida: unidadMedidaSelect.descripcion,
        _fecha_vencimiento: hasExpirationDate ? data.fecha_vencimiento : null, // Enviar fecha o null
      };
      await insertarProductos(p);
      onClose();
    }
  }

  useEffect(() => {
    if (accion === "Editar") {
      selectMarca({ id: dataSelect.idmarca, descripcion: dataSelect.marca });
      selectCategoria({ id: dataSelect.id_categoria, descripcion: dataSelect.categoria });
      setUnidadMedidaSelect({ descripcion: dataSelect.unidad_medida });
      setHasExpirationDate(!!dataSelect.fecha_vencimiento); // Establecer estado del checkbox
    }
  }, []);

  return (
    <Container>
      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>{accion === "Editar" ? "Editar producto" : "Registrar nuevo producto"}</h1>
          </section>
          <section>
            <span onClick={onClose}>x</span>
          </section>
        </div>
        <form className="formulario" onSubmit={handleSubmit(insertar)}>
          <section className="seccion1">
            <article>
              <InputText icono={<v.icononombre />}>
                <input
                  className="form__field"
                  defaultValue={dataSelect.descripcion}
                  type="text"
                  placeholder=""
                  {...register("descripcion", { required: true })}
                />
                <label className="form__label">Nombre</label>
                {errors.descripcion?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>
            <ContainerSelector>
              <label>Marca: </label>
              <Selector
                state={stateMarca}
                color="#fc6027"
                texto1=""
                texto2={marcaItemSelect?.descripcion}
                funcion={() => setStateMarca(!stateMarca)}
              />
              <Btnfiltro
                funcion={nuevoRegistroMarca}
                bgcolor="#f6f3f3"
                textcolor="#353535"
                icono={<v.agregar />}
              />
              {stateMarca && (
                <ListaGenerica
                  bottom="-260px"
                  scroll="scroll"
                  setState={() => setStateMarca(!stateMarca)}
                  data={datamarca}
                  funcion={selectMarca}
                />
              )}
            </ContainerSelector>
            <article>
              <InputText icono={<v.iconostock />}>
                <input
                  step="0.01"
                  className="form__field"
                  defaultValue={dataSelect.stock}
                  type="number"
                  placeholder=""
                  {...register("stock", { required: true })}
                />
                <label className="form__label">Stock</label>
                {errors.stock?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>
            <article>
              <InputText icono={<v.iconostockminimo />}>
                <input
                  step="0.01"
                  className="form__field"
                  defaultValue={dataSelect.stock_minimo}
                  type="number"
                  placeholder=""
                  {...register("stockminimo", { required: true })}
                />
                <label className="form__label">Stock minimo</label>
                {errors.stockminimo?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>
            <ContainerSelector>
              <label>Categoria: </label>
              <Selector
                state={stateCategoria}
                color="#fc6027"
                texto1=""
                texto2={categoriaItemSelect?.descripcion}
                funcion={() => setStateCategoria(!stateCategoria)}
              />
              <Btnfiltro
                funcion={nuevoRegistroCategoria}
                bgcolor="#f6f3f3"
                textcolor="#353535"
                icono={<v.agregar />}
              />
              {stateCategoria && (
                <ListaGenerica
                  bottom="50px"
                  scroll="scroll"
                  setState={() => setStateCategoria(!stateCategoria)}
                  data={datacategorias}
                  funcion={selectCategoria}
                />
              )}
            </ContainerSelector>
            <ContainerSelector>
              <label>Unidad de medida: </label>
              <Selector
                state={stateUnidadMedida}
                color="#fc6027"
                texto1=""
                texto2={unidadMedidaSelect?.descripcion || "Seleccionar"}
                funcion={() => setStateUnidadMedida(!stateUnidadMedida)}
              />
              {stateUnidadMedida && (
                <ListaGenerica
                  bottom="50px"
                  scroll="scroll"
                  setState={() => setStateUnidadMedida(!stateUnidadMedida)}
                  data={unidadesMedida}
                  funcion={selectUnidadMedida}
                />
              )}
            </ContainerSelector>
            {/* Checkbox para fecha de vencimiento */}
            <CheckboxContainer>
              <label>
                <input
                  type="checkbox"
                  checked={hasExpirationDate}
                  onChange={(e) => setHasExpirationDate(e.target.checked)}
                />
                Bien con fecha de vencimiento
              </label>
            </CheckboxContainer>
            {/* Input condicional para fecha de vencimiento */}
            {hasExpirationDate && (
              <article>
                <InputText icono={<v.icononombre />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect.fecha_vencimiento}
                    type="date"
                    placeholder=""
                    {...register("fecha_vencimiento", { required: hasExpirationDate })}
                  />
                  <label className="form__label">Fecha de vencimiento</label>
                  {errors.fecha_vencimiento?.type === "required" && <p>Campo requerido</p>}
                </InputText>
              </article>
            )}
          </section>
          <section className="seccion2">
            <article>
              <InputText icono={<v.iconocodigobarras />}>
                <input
                  className="form__field"
                  defaultValue={dataSelect.codigobarras}
                  type="text"
                  placeholder=""
                  {...register("codigobarras", { required: true })}
                />
                <label className="form__label">Cuenta Contable</label>
                {errors.codigobarras?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>
            <article>
              <InputText icono={<v.iconocodigointerno />}>
                <input
                  className="form__field"
                  defaultValue={dataSelect.codigointerno}
                  type="text"
                  placeholder=""
                  {...register("codigointerno", { required: true })}
                />
                <label className="form__label">Codigo Catalogo MEF</label>
                {errors.codigointerno?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>
            <article>
              <InputText icono={<v.iconoprecioventa />}>
                <input
                  step="0.01"
                  className="form__field"
                  defaultValue={dataSelect.precioventa}
                  type="number"
                  placeholder=""
                  {...register("precioventa", { required: true })}
                />
                <label className="form__label">Precio de venta</label>
                {errors.precioventa?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>
            <article>
              <InputText icono={<v.iconopreciocompra />}>
                <input
                  step="0.01"
                  className="form__field"
                  defaultValue={dataSelect.preciocompra}
                  type="number"
                  placeholder=""
                  {...register("preciocompra", { required: true })}
                />
                <label className="form__label">Precio de compra</label>
                {errors.preciocompra?.type === "required" && <p>Campo requerido</p>}
              </InputText>
            </article>
          </section>
          <div className="btnguardarContent">
            <Btnsave icono={<v.iconoguardar />} titulo="Guardar" bgcolor="#EF552B" />
          </div>
        </form>
        {openRegistroMarca && (
          <RegistrarMarca
            dataSelect={dataSelect}
            onClose={() => SetopenRegistroMarca(!openRegistroMarca)}
            accion={subaccion}
          />
        )}
        {openRegistroCategoria && (
          <RegistrarCategorias
            dataSelect={dataSelect}
            onClose={() => SetopenRegistroCategoria(!openRegistroCategoria)}
            accion={subaccion}
          />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .sub-contenedor {
    overflow-y: auto;
    overflow-x: hidden;
    height: 90vh;

    &::-webkit-scrollbar {
      width: 6px;
      border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #484848;
      border-radius: 10px;
    }
    width: 100%;
    max-width: 90%;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: 13px 36px 20px 36px;
    z-index: 100;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-size: 20px;
        font-weight: 500;
      }
      span {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .formulario {
      display: grid;
      grid-template-columns: 1fr;
      gap: 15px;
      @media ${Device.tablet} {
        grid-template-columns: repeat(2, 1fr);
      }
      section {
        gap: 20px;
        display: flex;
        flex-direction: column;
      }
      .btnguardarContent {
        display: flex;
        justify-content: end;
        grid-column: 1;
        @media ${Device.tablet} {
          grid-column: 2;
        }
      }
    }
  }
`;

const ContainerSelector = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  position: relative;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  label {
    font-size: 16px;
    color: ${({ theme }) => theme.text};
  }
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;