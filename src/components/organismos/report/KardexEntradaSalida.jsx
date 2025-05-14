import styled from "styled-components";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";
import {
  Buscador,
  ListaGenerica,
  useEmpresaStore,
  useProductosStore,
} from "../../../index";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { destinos } from "../../../store/destinos";
import SearchableSelect from "./SearchableSelect";
import { supabase } from "../../../index";

// Estilos del PDF
const styles = StyleSheet.create({
  page: { 
    flexDirection: "column", 
    padding: 30,
    backgroundColor: "transparent",
  },
  image: {
    width: 75,
    height: 50,
    marginBottom: 10,
    position: "relative",
    zIndex: 1,
  },
  boldText: {
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 8,
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    marginLeft: 10,
  },
  table: { 
    width: "100%", 
    marginTop: 10,
    borderTop: 1,
    borderTopColor: "#000",
    borderRight: 1,
    borderRightColor: "#000",
  },
  row: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#000",
    minHeight: 20,
    alignItems: "center",
  },
  // Estilos base para celdas y encabezados
  cell: {
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  headerCell: {
    fontSize: 7,
    padding: 4,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  // ITEM
  itemCell: {
    width: 40,
    textAlign: "left",
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  itemHeaderCell: {
    width: 40,
    textAlign: "left",
    fontSize: 7,
    padding: 4,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  // CÓDIGO
  codigoCell: {
    width: 80,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  codigoHeaderCell: {
    width: 80,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  // CANTIDAD
  cantidadCell: {
    width: 60,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  cantidadHeaderCell: {
    width: 60,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  // DESCRIPCIÓN
  descripcionCell: {
    width: 220,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  descripcionHeaderCell: {
    width: 220,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  // CUENTA
  cuentaCell: {
    width: 90,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  cuentaHeaderCell: {
    width: 90,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  // CANT. DESPACHADA
  cantDespCell: {
    width: 90,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  cantDespHeaderCell: {
    width: 90,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  // PREC.UNIT.
  precioUnitCell: {
    width: 90,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  precioUnitHeaderCell: {
    width: 90,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  // TOTAL
  totalCell: {
    width: 90,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  totalHeaderCell: {
    width: 90,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  // Fila TOTAL
  totalRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#000",
    minHeight: 20,
    alignItems: "center",
    backgroundColor: "#dcdcdc",
  },
  totalPrecioUnitCell: {
    width: 90,
    textAlign: "right",
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
    fontWeight: "bold",
  },
  totalTotalCell: {
    width: 90,
    textAlign: "center",
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
    fontWeight: "bold",
  },
  // Otras celdas vacías para la fila TOTAL
  emptyCell: {
    width: 40,
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  emptyCellWide: {
    width: 80,
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  emptyCellMedium: {
    width: 60,
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  emptyCellExtraWide: {
    width: 220,
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  emptyCellLong: {
    width: 90,
    fontSize: 7,
    padding: 4,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    width: "100%",
  },
  signature: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },
  signatureLine: {
    width: 120,
    borderBottom: 1,
    borderBottomColor: "#000",
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 8,
    textAlign: "center",
  },
});

// Estilos para el modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  text-align: center;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  background-color: ${(props) => (props.primary ? "#007bff" : "#ccc")};
  color: white;
`;

function KardexEntradaSalida() {
  const [stateListaproductos, setStateListaProductos] = useState(false);
  const {
    reportKardexEntradaSalida,
    buscarProductos,
    buscador,
    setBuscador,
    addProductoItem,
    productoItemSelect,
  } = useProductosStore();
  const { dataempresa } = useEmpresaStore();

  // Estados del formulario
  const [dependencia, setDependencia] = useState("");
  const [solicitaEntrega, setSolicitaEntrega] = useState("");
  const [destino, setDestino] = useState("");
  const [referencia, setReferencia] = useState("");
  const [ctaMayor, setCtaMayor] = useState("");
  const [programa, setPrograma] = useState("");
  const [subPrograma, setSubPrograma] = useState("");
  const [meta, setMeta] = useState("");

  // Estados para el contador y el modal
  const [contador, setContador] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Consulta para el kardex
  const { data: dataKardex = [] } = useQuery({
    queryKey: ["reporte kardex entrada salida", productoItemSelect.map(p => p.id)],
    queryFn: async () => {
      const responses = await Promise.all(
        productoItemSelect.map(p =>
          reportKardexEntradaSalida({
            _id_empresa: dataempresa?.id,
            _id_producto: p.id,
          })
        )
      );
      return responses;
    },
    enabled: !!dataempresa && productoItemSelect.length > 0,
  });

  // Consulta para el buscador de productos
  const { data: dataproductosbuscador } = useQuery({
    queryKey: ["buscar productos", { id_empresa: dataempresa?.id, descripcion: buscador }],
    queryFn: () => buscarProductos({ id_empresa: dataempresa?.id, descripcion: buscador }),
    enabled: !!dataempresa && !!buscador,
  });

  // Calcular el total de la tabla
  const tableTotal = dataKardex.length > 0
    ? dataKardex
        .map((movimientos, index) => {
          const ultimaSalida = movimientos
            .filter((m) => m.tipo === "salida")
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
          return ultimaSalida ? parseFloat(ultimaSalida.cantidad || 0) * parseFloat(ultimaSalida.preciocompra || 0) : 0;
        })
        .reduce((acc, curr) => acc + curr, 0)
    : 0;

  // Resumen por código de cuenta
  const resumenCuentas = {};
  dataKardex.forEach(movimientos => {
    const salidasUnicas = {};
    movimientos.forEach(m => {
      if (m.tipo === "salida") {
        const cuenta = m.codigobarras || "SIN CUENTA";
        if (!salidasUnicas[cuenta]) {
          const cantidad = parseFloat(m.cantidad) || 0;
          const precio = parseFloat(m.preciocompra) || 0;
          salidasUnicas[cuenta] = cantidad * precio;
        }
      }
    });
    Object.entries(salidasUnicas).forEach(([cuenta, total]) => {
      resumenCuentas[cuenta] = (resumenCuentas[cuenta] || 0) + total;
    });
  });
  const totalResumen = Object.values(resumenCuentas).reduce((acc, curr) => acc + curr, 0);

  // Función para renderizar filas de la tabla
  const renderTableRow = (rowData, isHeader = false, index = null, isTotal = false) => {
    if (isHeader) {
      return (
        <View style={styles.row} key="header">
          <Text style={styles.itemHeaderCell}>ITEM</Text>
          <Text style={styles.codigoHeaderCell}>CÓDIGO</Text>
          <Text style={styles.cantidadHeaderCell}>CANTIDAD</Text>
          <Text style={styles.descripcionHeaderCell}>DESCRIPCIÓN</Text>
          <Text style={styles.cuentaHeaderCell}>CUENTA</Text>
          <Text style={styles.cantDespHeaderCell}>CANT. DESPACHADA</Text>
          <Text style={styles.precioUnitHeaderCell}>PREC.UNIT.</Text>
          <Text style={styles.totalHeaderCell}>TOTAL</Text>
        </View>
      );
    } else if (isTotal) {
      return (
        <View style={styles.totalRow} key="total">
          <Text style={styles.emptyCell}></Text>
          <Text style={styles.emptyCellWide}></Text>
          <Text style={styles.emptyCellMedium}></Text>
          <Text style={styles.emptyCellExtraWide}></Text>
          <Text style={styles.emptyCellLong}></Text>
          <Text style={styles.emptyCellLong}></Text>
          <Text style={styles.totalPrecioUnitCell}>TOTAL</Text>
          <Text style={styles.totalTotalCell}>
            {`S/. ${tableTotal.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.row} key={rowData.id}>
          <Text style={styles.itemCell}>{index + 1}</Text>
          <Text style={styles.codigoCell}>{rowData.codigointerno || ""}</Text>
          <Text style={styles.cantidadCell}>{rowData.stock || ""}</Text>
          <Text style={styles.descripcionCell}>{rowData.descripcion || ""}</Text>
          <Text style={styles.cuentaCell}>{rowData.codigobarras || ""}</Text>
          <Text style={styles.cantDespCell}>{rowData.cantidad || ""}</Text>
          <Text style={styles.precioUnitCell}>
            {rowData.preciocompra
              ? `S/. ${parseFloat(rowData.preciocompra).toLocaleString("es-PE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : ""}
          </Text>
          <Text style={styles.totalCell}>
            {rowData.cantidad && rowData.preciocompra
              ? `S/. ${(parseFloat(rowData.cantidad) * parseFloat(rowData.preciocompra)).toLocaleString("es-PE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : ""}
          </Text>
        </View>
      );
    }
  };

  // Función para incrementar el contador en Supabase
  const incrementarContador = async () => {
    try {
      const { data, error } = await supabase
        .from("contador_documentos")
        .select("contador")
        .eq("id", 1)
        .single();

      if (error) throw error;

      const nuevoContador = data.contador + 1;

      const { error: updateError } = await supabase
        .from("contador_documentos")
        .update({ contador: nuevoContador, updated_at: new Date().toISOString() })
        .eq("id", 1);

      if (updateError) throw updateError;

      setContador(nuevoContador);
      setShowPDF(true);
      setShowModal(false);
    } catch (error) {
      console.error("Error al actualizar el contador:", error);
      alert("No se pudo generar el documento. Intenta de nuevo.");
    }
  };

  // Función para manejar el clic en "Generar"
  const handleGenerateClick = () => {
    setShowModal(true);
  };

  // Función para reiniciar la página
  const handleResetPage = () => {
    window.location.reload();
  };

  // Fecha formateada
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

  // Validar si el botón debe estar habilitado
  const isGenerateDisabled = !dependencia || productoItemSelect.length === 0;

  return (
    <Container>
      <Buscador
        funcion={() => setStateListaProductos(!stateListaproductos)}
        setBuscador={setBuscador}
      />
      <BuscadorContainer>
        {stateListaproductos && (
          <ListaGenerica
            funcion={(p) => {
              addProductoItem(p);
              setBuscador("");
              setStateListaProductos(false);
            }}
            setState={() => setStateListaProductos(false)}
            data={dataproductosbuscador?.slice(0, 3)}
          />
        )}
      </BuscadorContainer>

      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <FormInputGroup>
            <label>Dependencia solicitante:</label>
            <select value={dependencia} onChange={(e) => setDependencia(e.target.value)}>
              <option value="">-- Seleccione --</option>
              <option>Área de Liquidaciones</option>
              <option>Cuna Jardín San Gerónimo</option>
              <option>Gerencia General Regional</option>
              <option>Gerencia Sub Regional</option>
              <option>Oficina Sub Regional de Administración</option>
              <option>Oficina Sub Regional de Asesoría Jurídica</option>
              <option>Oficina Sub Regional de Planeamiento y Presupuesto</option>
              <option>Oficina Sub Regional de Supervisión</option>
              <option>Órgano de Control Institucional</option>
              <option>Programa de Mantenimiento de Infraestructura</option>
              <option>Sub Gerencia de Desarrollo Económico Social y Ambiental</option>
              <option>Sub Gerencia de Infraestructura Pública</option>
              <option>Unidad de Almacén</option>
              <option>Unidad de Contabilidad</option>
              <option>Unidad de Formulación y Estudios</option>
              <option>Unidad de Informática</option>
              <option>Unidad de Logística</option>
              <option>Unidad de Patrimonio</option>
              <option>Unidad de Recursos Humanos</option>
              <option>Unidad de Tesorería</option>
            </select>
          </FormInputGroup>
          <FormInputGroup>
            <label>Solicito Entregar a:</label>
            <input
              type="text"
              value={solicitaEntrega}
              onChange={(e) => setSolicitaEntrega(e.target.value)}
            />
          </FormInputGroup>
          <SearchableSelect
            label="Con Destino a:"
            options={destinos}
            value={destino}
            onChange={setDestino}
            placeholder="Buscar destino..."
          />
          <FormInputGroup>
            <label>Referencia:</label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />
          </FormInputGroup>
        </div>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <FormInputGroup>
            <label>Cuenta Mayor:</label>
            <input
              type="text"
              value={ctaMayor}
              onChange={(e) => setCtaMayor(e.target.value)}
            />
          </FormInputGroup>
          <FormInputGroup>
            <label>Programa:</label>
            <input
              type="text"
              value={programa}
              onChange={(e) => setPrograma(e.target.value)}
            />
          </FormInputGroup>
          <FormInputGroup>
            <label>Sub-Programa:</label>
            <input
              type="text"
              value={subPrograma}
              onChange={(e) => setSubPrograma(e.target.value)}
            />
          </FormInputGroup>
          <FormInputGroup>
            <label>Meta:</label>
            <input
              type="text"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
            />
          </FormInputGroup>
        </div>
      </div>

      {/* Botón Generar */}
      <FormInputGroup>
        <button
          onClick={handleGenerateClick}
          disabled={isGenerateDisabled}
          style={{
            padding: "10px 20px",
            backgroundColor: isGenerateDisabled ? "#ccc" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: isGenerateDisabled ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          Generar
        </button>
      </FormInputGroup>

      {/* Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            {showPDF ? (
              <>
                <h3>Reinicio Requerido</h3>
                <p>Es necesario reiniciar la página para generar un nuevo documento.</p>
                <ModalButton primary onClick={handleResetPage}>
                  Reiniciar página
                </ModalButton>
                <ModalButton onClick={() => setShowModal(false)}>
                  Cancelar
                </ModalButton>
              </>
            ) : (
              <>
                <h3>Confirmar Generación</h3>
                <p>¿Está seguro de generar el documento?</p>
                <ModalButton primary onClick={incrementarContador}>
                  Aceptar
                </ModalButton>
                <ModalButton onClick={() => setShowModal(false)}>
                  Cancelar
                </ModalButton>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Mostrar PDF */}
      {showPDF && (
        <PDFViewer className="pdfviewer">
          <Document title="Reporte de stock todos">
            <Page size="A4" orientation="landscape" style={styles.page}>
              <Image
                src="../src/assets/GORE.png"
                style={styles.image}
              />
              <View style={{ flexDirection: "column", width: "100%" }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    fontSize: 6,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ width: "48%" }}>
                    <Text>UNIDAD EJECUTORA SUB REGION</Text>
                    <Text>DE DESARROLLO ILO N°003</Text>
                    <Text>ALMACEN CENTRAL</Text>
                    <Text>AV. VENECIA N°222</Text>
                    <Text>RUC: 20532480397</Text>
                  </View>
                  <View style={{ width: "10%" }}>
                    <Text>Fecha: {formattedDate}</Text>
                    <Text>Generado por: {dataKardex?.[0]?.[0]?.nombres || "Usuario X"}</Text>
                    <Text>Número de Documento: {contador || "Cargando..."}</Text>
                  </View>
                </View>
                <Text style={styles.titleText}>
                  PEDIDO COMPROBANTE DE SALIDA
                </Text>
                <View style={{ fontSize: 8, textAlign: "center", marginBottom: 10 }}>
                  <Text>Stock: {dataempresa?.nombre || "Almacen Desconocido"}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    fontSize: 8,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ width: "48%" }}>
                    <Text style={styles.boldText}>
                      Dependencia Solicitante: {dependencia || "No especificado"}
                    </Text>
                    <Text style={styles.boldText}>
                      Solicito Entregar a: {solicitaEntrega || "No especificado"}
                    </Text>
                    <Text style={styles.boldText}>
                      Con Destino a: {destino || "No especificado"}
                    </Text>
                    <Text style={styles.boldText}>
                      Referencia: {referencia || "No especificado"}
                    </Text>
                  </View>
                  <View style={{ width: "30%" }}>
                    <Text style={styles.boldText}>
                      Cuenta Mayor: {ctaMayor || "No especificado"}
                    </Text>
                    <Text style={styles.boldText}>
                      Programa: {programa || "No especificado"}
                    </Text>
                    <Text style={styles.boldText}>
                      Sub-Programa: {subPrograma || "No especificado"}
                    </Text>
                    <Text style={styles.boldText}>
                      Meta: {meta || "No especificado"}
                    </Text>
                  </View>
                </View>
                <View style={styles.table}>
                  {renderTableRow({}, true)}
                  {dataKardex.length > 0 &&
                    dataKardex
                      .map((movimientos, index) => {
                        const ultimaSalida = movimientos
                          .filter((m) => m.tipo === "salida")
                          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
                        return ultimaSalida ? { ...ultimaSalida, id: `${index}-${ultimaSalida.id}` } : null;
                      })
                      .filter(Boolean)
                      .map((ultimaSalida, i) => renderTableRow(ultimaSalida, false, i))}
                  {dataKardex.length > 0 && renderTableRow({}, false, null, true)}
                </View>
                <View style={{ marginTop: 30 }}>
                  <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 5 }}>
                    Resumen por Código de Cuenta
                  </Text>
                  <View style={[styles.row, { backgroundColor: "#f0f0f0" }]}>
                    <Text style={[styles.cell, { fontWeight: "bold", width: 200 }]}>Código Cuenta</Text>
                    <Text style={[styles.cell, { fontWeight: "bold", width: 200 }]}>Total Precio (S/.)</Text>
                  </View>
                  {Object.entries(resumenCuentas).map(([codigo, total]) => (
                    <View key={codigo} style={styles.row}>
                      <Text style={[styles.cell, { width: 200 }]}>{codigo}</Text>
                      <Text style={[styles.cell, { width: 200 }]}>
                        S/. {total.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.row, { marginTop: 10, backgroundColor: "#dcdcdc" }]}>
                    <Text style={[styles.cell, { fontWeight: "bold", width: 200 }]}>TOTAL GENERAL</Text>
                    <Text style={[styles.cell, { fontWeight: "bold", width: 200 }]}>
                      S/. {totalResumen.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
                <View style={styles.signaturesContainer}>
                  <View style={styles.signature}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureText}>Jefe de Abastecimiento</Text>
                  </View>
                  <View style={styles.signature}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureText}>Solicitante</Text>
                  </View>
                  <View style={styles.signature}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureText}>Jefe de Almacén</Text>
                  </View>
                  <View style={styles.signature}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureText}>Recibí Conforme</Text>
                  </View>
                </View>
              </View>
            </Page>
          </Document>
        </PDFViewer>
      )}
    </Container>
  );
}

// Estilos con styled-components
const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 15px;
  .pdfviewer {
    width: 100%;
    height: 100%;
  }
`;

const BuscadorContainer = styled.div`
  position: relative;
  width: 100%;
  > div {
    position: absolute;
    top: 0px;
    left: 0;
    right: 0;
    z-index: 10;
    background: ${(props) => props.theme.bg};
    border: 1px solid #ccc;
    border-radius: 10px;
    overflow: hidden;
  }
`;

const FormInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  label {
    font-size: 14px;
    color: ${(props) => props.theme.text};
  }
  input,
  select,
  button {
    background-color: ${(props) => props.theme.bg};
    color: ${(props) => props.theme.text};
    border: 1px solid #414244;
    border-radius: 10px;
    padding: 12px 15px;
    font-size: 16px;
    outline: none;
    width: 100%;
  }
  select:focus,
  button:focus {
    outline: none;
  }
`;

export default KardexEntradaSalida;