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
  ListaModulos,
  TipouserData,
  TipoDocData,
  useGlobalStore,
  usePermisosStore,
} from "../../../index";
import { useForm } from "react-hook-form";
import { CirclePicker } from "react-color";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { Device } from "../../../styles/breakpoints";
import { useQuery } from "@tanstack/react-query";

export function RegistrarPersonal({
  onClose,
  dataSelect,
  accion,
  setdataSelect,
}) {
  const { insertarUsuario, editarusuario } = useUsuariosStore();
  const { dataempresa } = useEmpresaStore();
  const [stateMarca, setStateMarca] = useState(false);
  const [stateCategoria, setStateCategoria] = useState(false);
  const [openRegistroMarca, SetopenRegistroMarca] = useState(false);
  const [openRegistroCategoria, SetopenRegistroCategoria] = useState(false);
  const [subaccion, setAccion] = useState("");
  const { datamodulos } = useGlobalStore();
  const [checkboxs, setCheckboxs] = useState([]);
  const [tipouser, setTipouser] = useState({
    icono: "",
    descripcion: "empleado",
  });
  const [tipodoc, setTipodoc] = useState({ icono: "", descripcion: "dni" });
  const { datapermisosEdit, mostrarPermisosEdit } = usePermisosStore();
  const [errorMessage, setErrorMessage] = useState(""); // Estado para mensajes de error

  const { isLoading } = useQuery({
    queryKey: ["mostrarpermisosedit", { id_usuario: dataSelect.id }],
    queryFn: () => mostrarPermisosEdit({ id_usuario: dataSelect.id }),
    enabled: dataSelect.id != null,
  });

  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
    watch,
  } = useForm();

  async function insertar(data) {
    try {
      console.log("Datos del formulario:", data); // Depuración
      setErrorMessage(""); // Limpiar mensaje de error
      if (accion === "Editar") {
        const p = {
          id: dataSelect.id,
          nombres: data.nombres,
          nro_doc: data.nrodoc, // Corregido para coincidir con la tabla
          telefono: data.telefono,
          direccion: data.direccion,
          estado: "activo",
          tipouser: tipouser.descripcion,
          tipodoc: tipodoc.descripcion,
          correo: data.correo, // Aseguramos que se envíe el correo
        };
        console.log("Objeto para editar:", p); // Depuración
        await editarusuario(p, checkboxs, dataempresa.id);
        onClose();
      } else {
        const p = {
          nombres: data.nombres,
          correo: data.correo,
          nro_doc: data.nrodoc, // Corregido para coincidir con la tabla
          telefono: data.telefono,
          direccion: data.direccion,
          estado: "activo",
          tipouser: tipouser.descripcion,
          tipodoc: tipodoc.descripcion,
          id_empresa: dataempresa.id,
        };
        const parametrosAuth = {
          correo: data.correo,
          pass: data.pass,
        };
        console.log("Objeto para registrar:", p, "Auth:", parametrosAuth); // Depuración
        await insertarUsuario(parametrosAuth, p, checkboxs);
        onClose();
      }
    } catch (error) {
      console.error("Error al registrar/editar usuario:", error);
      setErrorMessage("Error al guardar el usuario. Por favor, intenta de nuevo.");
    }
  }

  useEffect(() => {
    if (accion === "Editar") {
      setTipodoc({ icono: "", descripcion: dataSelect.tipodoc });
      setTipouser({
        icono: "",
        descripcion: dataSelect.tipouser,
      });
    }
  }, []);

  if (isLoading) {
    return <span>cargando...</span>;
  }

  return (
    <Container>
      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>
              {accion === "Editar" ? "Editar personal" : "Registrar personal"}
            </h1>
          </section>
          <section>
            <span onClick={onClose}>x</span>
          </section>
        </div>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <form className="formulario" onSubmit={handleSubmit(insertar)}>
          <section className="seccion1">
            <article>
              <InputText icono={<v.icononombre />}>
                <input
                  className="form__field"
                  defaultValue={dataSelect.correo}
                  type="email"
                  placeholder=""
                  {...register("correo", {
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Formato de correo inválido",
                    },
                  })}
                />
                <label className="form__label">Correo</label>
                {errors.correo && <p>{errors.correo.message}</p>}
              </InputText>
            </article>
            {accion !== "Editar" && (
              <article>
                <InputText icono={<v.iconopass />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect.pass}
                    type="password"
                    placeholder=""
                    {...register("pass", {
                      required: "La contraseña es obligatoria",
                    })}
                  />
                  <label className="form__label">Contraseña</label>
                  {errors.pass && <p>{errors.pass.message}</p>}
                </InputText>
              </article>
            )}
            <article>
              <InputText icono={<v.icononombre />}>
                <input
                  className="form__field"
                  defaultValue={dataSelect.nombres}
                  type="text"
                  placeholder=""
                  {...register("nombres", {
                    required: "El nombre es obligatorio",
                  })}
                />
                <label className="form__label">Nombres</label>
                {errors.nombres && <p>{errors.nombres.message}</p>}
              </InputText>
            </article>
            <ContainerSelector>
              <label>Tipo doc: </label>
              <Selector
                state={stateMarca}
                color="#fc6027"
                texto1="🎴"
                texto2={tipodoc.descripcion}
                funcion={() => setStateMarca(!stateMarca)}
              />
              {stateMarca && (
                <ListaGenerica
                  bottom="-260px"
                  scroll="scroll"
                  setState={() => setStateMarca(!stateMarca)}
                  data={TipoDocData}
                  funcion={(p) => setTipodoc(p)}
                />
              )}
            </ContainerSelector>
            <article>
              <InputText icono={<v.iconostock />}>
                <input
                  className="form__field"
                  defaultValue={dataSelect.nro_doc} // Corregido para usar nro_doc
                  type="text"
                  placeholder=""
                  {...register("nrodoc", {
                    required: "El número de documento es obligatorio",
                  })}
                />
                <label className="form__label">Nro. doc</label>
                {errors.nrodoc && <p>{errors.nrodoc.message}</p>}
              </InputText>
            </article>
            <article>
              <InputText icono={<v.iconostockminimo />}>
                <input
                  className="form__field"
                  defaultValue={dataSelect.telefono}
                  type="tel"
                  placeholder=""
                  {...register("telefono", {
                    required: "El teléfono es obligatorio",
                  })}
                />
                <label className="form__label">Teléfono</label>
                {errors.telefono && <p>{errors.telefono.message}</p>}
              </InputText>
            </article>
            <article>
              <InputText icono={<v.iconocodigobarras />}>
                <input
                  className="form__field"
                  defaultValue={dataSelect.direccion}
                  type="text"
                  placeholder=""
                  {...register("direccion", {
                    required: "La dirección es obligatoria",
                  })}
                />
                <label className="form__label">Dirección</label>
                {errors.direccion && <p>{errors.direccion.message}</p>}
              </InputText>
            </article>
          </section>
          <section className="seccion2">
            <ContainerSelector>
              <label>Tipo: </label>
              <Selector
                state={stateCategoria}
                color="#fc6027"
                texto1="👷‍♂️"
                texto2={tipouser.descripcion}
                funcion={() => setStateCategoria(!stateCategoria)}
              />
              {stateCategoria && (
                <ListaGenerica
                  bottom="-150px"
                  scroll="scroll"
                  setState={() => setStateCategoria(!stateCategoria)}
                  data={TipouserData}
                  funcion={(p) => setTipouser(p)}
                />
              )}
            </ContainerSelector>
            <div>PERMISOS: 🔑</div>
            <ListaModulos
              accion={accion}
              setCheckboxs={setCheckboxs}
              checkboxs={checkboxs}
              tipouser={tipouser}
            />
          </section>
          <div className="btnguardarContent">
            <Btnsave
              icono={<v.iconoguardar />}
              titulo="Guardar"
              bgcolor="#EF552B"
            />
          </div>
        </form>
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

const ErrorMessage = styled.div`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
`;