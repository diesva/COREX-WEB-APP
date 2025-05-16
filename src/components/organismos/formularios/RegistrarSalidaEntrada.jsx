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
  useMarcaStore,
  Buscador,
  useProductosStore,
  ListaGenerica,
} from "../../../index";
import { useForm } from "react-hook-form";
import { CirclePicker } from "react-color";
import Emojipicker from "emoji-picker-react";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useKardexStore } from "../../../store/KardexStore";
import { supabase } from "../../../index"; // Import supabase for direct table updates

export function RegistrarSalidaEntrada({ onClose, dataSelect, accion, tipo }) {
  const { idusuario } = useUsuariosStore();
  const [stateListaProd, SetstateListaProd] = useState(false);
  const [focused, setFocused] = useState(false);
  const { dataproductos, productoItemSelect, selectProductos, setBuscador } =
    useProductosStore();
  const { insertarKardex } = useKardexStore();
  const { dataempresa } = useEmpresaStore();
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();

  // NUEVO
  const [isSubmitting, setIsSubmitting] = useState(false); // Desactiva botón
  const [estadoProceso, setEstadoproceso] = useState(false); // loader + bloqueo

  async function insertar(data) {
    try {
      const cantidad = parseFloat(data.cantidad);
      const stockActual = productoItemSelect.stock;
      // NEW: Parse price for entries
      const precioCompra = tipo === "entrada" ? parseFloat(data.preciocompra) : null;

      // Validation for cantidad
      if (isNaN(cantidad) || cantidad < 0) {
        alert("La cantidad no puede ser menor a cero.");
        return;
      }

      if (tipo === "salida" && cantidad > stockActual) {
        alert("La cantidad no puede ser mayor al stock disponible.");
        return;
      }

      // NEW: Validation for preciocompra when tipo === "entrada"
      if (tipo === "entrada" && (isNaN(precioCompra) || precioCompra < 0)) {
        alert("El precio de compra debe ser un número positivo.");
        return;
      }

      setEstadoproceso(true); // Bloquea botón y muestra loader
      setIsSubmitting(true); // Disable submit button

      const p = {
        fecha: new Date(),
        tipo: tipo,
        id_usuario: idusuario,
        id_producto: productoItemSelect.id,
        cantidad: cantidad,
        detalle: data.detalle,
        id_empresa: dataempresa.id,
        // NEW: Include preciocompra in kardex for entries
        preciocompra: tipo === "entrada" ? precioCompra : null,
      };

      // Insert into kardex table
      await insertarKardex(p);

      // NEW: Update preciocompra in productos table for entries
      if (tipo === "entrada") {
        const { error } = await supabase
          .from("productos")
          .update({ preciocompra: precioCompra })
          .eq("id", productoItemSelect.id)
          .eq("id_empresa", dataempresa.id);

        if (error) {
          console.error("Error updating preciocompra:", error);
          throw new Error("No se pudo actualizar el precio de compra.");
        }
      }

      // UX: breve espera y recarga
      setTimeout(() => {
        window.location.reload();
      }, 5500);
    } catch (err) {
      console.error(err);
      alert("Error al guardar. Intenta nuevamente.");
      setEstadoproceso(false);
      setIsSubmitting(false);
    }
  }

  return (
    <Container>
      {estadoProceso && <Spinner />} {/* Muestra loader */}
      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>{accion == "Editar" ? "Editar marca" : "Registrar " + tipo}</h1>
          </section>
          <section>
            <span onClick={onClose}>x</span>
          </section>
        </div>
        <div className="contentBuscador">
          <div onClick={() => SetstateListaProd(!stateListaProd)}>
            <Buscador
              setBuscador={setBuscador}
              onFocus={() => setFocused(true)}
            />
          </div>

          {stateListaProd && (
            <ListaGenerica
              bottom="-250px"
              scroll="scroll"
              setState={() => SetstateListaProd(!stateListaProd)}
              data={dataproductos}
              funcion={selectProductos}
            />
          )}
        </div>

        <CardProducto>
          <span style={{ color: "#1fee61", fontWeight: "bold" }}>
            {productoItemSelect.descripcion}
          </span>
          <span style={{ color: "#f6faf7" }}>
            stock actual: {productoItemSelect.stock}
          </span>
          {/* NEW: Display current preciocompra for entries */}
          {tipo === "entrada" && (
            <span style={{ color: "#f6faf7" }}>
              precio compra actual: S/.{" "}
              {productoItemSelect.preciocompra?.toFixed(2) || "0.00"}
            </span>
          )}
        </CardProducto>

        <form className="formulario" onSubmit={handleSubmit(insertar)}>
          <section>
            <article>
              <InputText icono={<v.iconomarca />}>
                <input
                  disabled={isSubmitting}
                  className="form__field"
                  defaultValue={dataSelect.cantidad}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("cantidad", {
                    required: "Campo requerido",
                    min: { value: 0, message: "La cantidad no puede ser negativa" },
                  })}
                />
                <label className="form__label">Cantidad</label>
                {errors.cantidad && <p>{errors.cantidad.message}</p>}
              </InputText>
            </article>
            {/* NEW: Price input for entries */}
            {tipo === "entrada" && (
              <article>
                <InputText icono={<v.iconomarca />}>
                  <input
                    disabled={isSubmitting}
                    className="form__field"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("preciocompra", {
                      required: "Campo requerido",
                      min: {
                        value: 0,
                        message: "El precio no puede ser negativo",
                      },
                    })}
                  />
                  <label className="form__label">Precio Compra (S/.)</label>
                  {errors.preciocompra && <p>{errors.preciocompra.message}</p>}
                </InputText>
              </article>
            )}
            <article>
              <InputText icono={<v.iconomarca />}>
                <input
                  disabled={isSubmitting}
                  className="form__field"
                  defaultValue={dataSelect.detalle}
                  type="text"
                  placeholder=""
                  {...register("detalle", {
                    required: "Campo requerido",
                  })}
                />
                <label className="form__label">Motivo</label>
                {errors.detalle && <p>{errors.detalle.message}</p>}
              </InputText>
            </article>

            <div className="btnguardarContent">
              <button
                type="submit"
                disabled={estadoProceso}
                style={{
                  all: "unset",
                  cursor: estadoProceso ? "not-allowed" : "pointer",
                  opacity: estadoProceso ? 0.6 : 1,
                }}
              >
                <Btnsave
                  icono={<v.iconoguardar />}
                  titulo={estadoProceso ? "Guardando..." : "Guardar"}
                  bgcolor="#ef552b"
                />
              </button>
            </div>
          </section>
        </form>
      </div>
    </Container>
  );
}

// Styled components remain unchanged
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
    width: 500px;
    max-width: 85%;
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
    .contentBuscador {
      position: relative;
    }
    .formulario {
      section {
        gap: 20px;
        display: flex;
        flex-direction: column;
        .colorContainer {
          .colorPickerContent {
            padding-top: 15px;
            min-height: 50px;
          }
        }
      }
    }
  }
`;

const ContentTitle = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;
  svg {
    font-size: 25px;
  }
  input {
    border: none;
    outline: none;
    background: transparent;
    padding: 2px;
    width: 40px;
    font-size: 28px;
  }
`;

const ContainerEmojiPicker = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const CardProducto = styled.section`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  border-radius: 15px;
  border: 1px dashed #54f04f;
  background-color: rgba(84, 240, 79, 0.1);
  padding: 10px;
`;