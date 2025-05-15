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
import { useState, useEffect, useRef } from "react";
import { destinos } from "../../../store/destinos";
import SearchableSelect from "./SearchableSelect";
import { supabase } from "../../../index";

// Función para convertir números a texto
const numberToText = (num) => {
  const unidades = [
    "CERO", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
    "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"
  ];
  const decenas = [
    "", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"
  ];

  if (num < 0) return "CERO";
  if (num < 20) return unidades[num];
  if (num < 100) {
    const decena = Math.floor(num / 10);
    const unidad = num % 10;
    if (unidad === 0) return decenas[decena];
    return `${decenas[decena]} Y ${unidades[unidad]}`;
  }
  return num.toString(); // Para números >= 100, devolvemos el número como string
};

// Estilos del PDF
const styles = StyleSheet.create({
  page: { 
    flexDirection: "column",
    padding: 20,
    backgroundColor: "transparent",
  },
  image: {
    width: 60,
    height: 40,
    marginBottom: 5,
    position: "relative",
    zIndex: 1,
  },
  boldText: {
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 6,
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  table: { 
    width: "100%", 
    marginTop: 5,
    borderTop: 1,
    borderTopColor: "#000",
    borderRight: 1,
    borderRightColor: "#000",
  },
  row: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#000",
    minHeight: 15,
    alignItems: "center",
  },
  cell: {
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  headerCell: {
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  itemCell: {
    width: 40,
    textAlign: "left",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  itemHeaderCell: {
    width: 40,
    textAlign: "left",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  codigoCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  codigoHeaderCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  cantidadCell: {
    width: 60,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  cantidadHeaderCell: {
    width: 60,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  descripcionCell: {
    width: 260,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  descripcionHeaderCell: {
    width: 260,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  cuentaCell: {
    width: 90,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  cuentaHeaderCell: {
    width: 90,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  cantDespCell: {
    width: 90,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  cantDespHeaderCell: {
    width: 90,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  precioUnitCell: {
    width: 90,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  precioUnitHeaderCell: {
    width: 90,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  totalCell: {
    width: 90,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  totalHeaderCell: {
    width: 90,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  totalRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#000",
    minHeight: 15,
    alignItems: "center",
    backgroundColor: "#dcdcdc",
  },
  totalPrecioUnitCell: {
    width: 90,
    textAlign: "center", // Centrar el texto "TOTAL"
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
    fontWeight: "bold",
    backgroundColor: "#dcdcdc", // Asegurar que el fondo cubra toda la celda
  },
  totalTotalCell: {
    width: 90,
    textAlign: "center", // Centrar el valor total
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
    fontWeight: "bold",
    backgroundColor: "#dcdcdc", // Asegurar que el fondo cubra toda la celda
  },
  emptyCell: {
    width: 40,
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
    backgroundColor: "#dcdcdc", // Asegurar que las celdas vacías también tengan el fondo
  },
  emptyCellWide: {
    width: 80,
    fontSize: 6,
    padding: 3,
    borderLeft: 0,
    borderLeftColor: "#000",
    backgroundColor: "#dcdcdc", // Asegurar que las celdas vacías también tengan el fondo
  },
  emptyCellMedium: {
    width: 60,
    fontSize: 6,
    padding: 3,
    borderLeft: 0,
    borderLeftColor: "#000",
    backgroundColor: "#dcdcdc", // Asegurar que las celdas vacías también tengan el fondo
  },
  emptyCellExtraWide: {
    width: 260,
    fontSize: 6,
    padding: 3,
    borderLeft: 0,
    borderLeftColor: "#000",
    backgroundColor: "#dcdcdc", // Asegurar que las celdas vacías también tengan el fondo
  },
  emptyCellLong: {
    width: 90,
    fontSize: 6,
    padding: 3,
    borderLeft: 0,
    borderLeftColor: "#000",
    backgroundColor: "#dcdcdc", // Asegurar que las celdas vacías también tengan el fondo
  },
  body: {
    flex: 1,
    flexDirection: "column",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: 1,
    borderTopColor: "#000",
    paddingTop: 10,
    marginTop: 20,
  },
  signature: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  signatureLine: {
    width: 100,
    marginBottom: 3,
  },
  signatureText: {
    fontSize: 6,
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
  align-items: "center",
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${(props) => props.theme.bg};
  padding: 15px;
  border-radius: 8px;
  width: 350px;
  max-width: 90%;
  text-align: center;
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  margin: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background-color: ${(props) => (props.primary ? "#007bff" : "#ccc")};
  color: white;
`;

// Contenedor para el PDF
const PDFContainer = styled.div`
  position: relative;
  width: 842px;
  height: 595px;
  margin-top: 20px;
  border: 1px solid #ccc;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  .pdfviewer {
    width: 100%;
    height: 100%;
  }
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
    removeProductoItem,
  } = useProductosStore();
  const { dataempresa } = useEmpresaStore();

  const [dependencia, setDependencia] = useState("");
  const [solicitaEntrega, setSolicitaEntrega] = useState("");
  const [destino, setDestino] = useState("");
  const [referencia, setReferencia] = useState("");
  const [ctaMayor, setCtaMayor] = useState("");
  const [programa, setPrograma] = useState("");
  const [subPrograma, setSubPrograma] = useState("");
  const [meta, setMeta] = useState("");

  const [contador, setContador] = useState(null);
  const [showPDF, setShowPDF] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPrintable, setIsPrintable] = useState(false);
  const pdfViewerRef = useRef(null);

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

  const { data: dataproductosbuscador } = useQuery({
    queryKey: ["buscar productos", { id_empresa: dataempresa?.id, descripcion: buscador }],
    queryFn: () => buscarProductos({ id_empresa: dataempresa?.id, descripcion: buscador }),
    enabled: !!dataempresa && !!buscador,
  });

  // Filtrar productos que tienen una última salida
  const productosConUltimaSalida = dataKardex
    .map((movimientos, index) => {
      const ultimaSalida = movimientos
        .filter((m) => m.tipo === "salida")
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
      return ultimaSalida ? { ...ultimaSalida, id: `${index}-${ultimaSalida.id}`, producto: productoItemSelect[index] } : null;
    })
    .filter(Boolean);

  // Lista de productos seleccionados que tienen última salida (para mostrar en la UI y permitir eliminación)
  const productosMostrados = productosConUltimaSalida.map(item => item.producto);

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

  const resumenCuentas = {};
  dataKardex.forEach(movimientos => {
    const ultimaSalida = movimientos
      .filter((m) => m.tipo === "salida")
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];

    if (ultimaSalida) {
      const cuenta = ultimaSalida.codigobarras || "SIN CUENTA";
      const cantidad = parseFloat(ultimaSalida.cantidad) || 0;
      const precio = parseFloat(ultimaSalida.preciocompra) || 0;
      const total = cantidad * precio;
      resumenCuentas[cuenta] = (resumenCuentas[cuenta] || 0) + total;
    }
  });
  const totalResumen = Object.values(resumenCuentas).reduce((acc, curr) => acc + curr, 0);

  const cantidadProductos = productosConUltimaSalida.length;
  const cantidadProductosTexto = numberToText(cantidadProductos);

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

  const handleGenerateClick = () => {
    setShowModal(true);
  };

  const handleResetPage = () => {
    window.location.reload();
  };

  const handleRemoveProduct = (productId) => {
    removeProductoItem(productId);
  };

  useEffect(() => {
    if (showPDF) {
      const checkIframe = setInterval(() => {
        const pdfViewer = pdfViewerRef.current;
        if (pdfViewer) {
          const iframe = pdfViewer.querySelector("iframe");
          if (iframe) {
            setIsPrintable(true);
            clearInterval(checkIframe);
          }
        }
      }, 100); // Verifica cada 100ms

      // Si después de 5 segundos no se encuentra el iframe, mostramos el botón de todos modos
      const timeout = setTimeout(() => {
        setIsPrintable(true);
        clearInterval(checkIframe);
      }, 5000);

      return () => {
        clearInterval(checkIframe);
        clearTimeout(timeout);
      };
    }
  }, [showPDF]);

  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

  const isGenerateDisabled = !dependencia || productosConUltimaSalida.length === 0;

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

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <FormInputGroup>
            <label style={{ fontSize: 12 }}>Dependencia solicitante:</label>
            <select value={dependencia} onChange={(e) => setDependencia(e.target.value)} style={{ fontSize: 14, padding: "10px 12px" }}>
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
            <label style={{ fontSize: 12 }}>Solicito Entregar a:</label>
            <input
              type="text"
              value={solicitaEntrega}
              onChange={(e) => setSolicitaEntrega(e.target.value)}
              style={{ fontSize: 14, padding: "10px 12px" }}
            />
          </FormInputGroup>
          <SearchableSelect
            label="Con Destino a:"
            options={destinos}
            value={destino}
            onChange={setDestino}
            placeholder="Buscar destino..."
            labelStyle={{ fontSize: 12 }}
            inputStyle={{ fontSize: 14, padding: "10px 12px" }}
          />
          <FormInputGroup>
            <label style={{ fontSize: 12 }}>Referencia:</label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              style={{ fontSize: 14, padding: "10px 12px" }}
            />
          </FormInputGroup>
        </div>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <FormInputGroup>
            <label style={{ fontSize: 12 }}>Cuenta Mayor:</label>
            <input
              type="text"
              value={ctaMayor}
              onChange={(e) => setCtaMayor(e.target.value)}
              style={{ fontSize: 14, padding: "10px 12px" }}
            />
          </FormInputGroup>
          <FormInputGroup>
            <label style={{ fontSize: 12 }}>Programa:</label>
            <input
              type="text"
              value={programa}
              onChange={(e) => setPrograma(e.target.value)}
              style={{ fontSize: 14, padding: "10px 12px" }}
            />
          </FormInputGroup>
          <FormInputGroup>
            <label style={{ fontSize: 12 }}>Sub-Programa:</label>
            <input
              type="text"
              value={subPrograma}
              onChange={(e) => setSubPrograma(e.target.value)}
              style={{ fontSize: 14, padding: "10px 12px" }}
            />
          </FormInputGroup>
          <FormInputGroup>
            <label style={{ fontSize: 12 }}>Meta:</label>
            <input
              type="text"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              style={{ fontSize: 14, padding: "10px 12px" }}
            />
          </FormInputGroup>
        </div>
      </div>

      {/* Mostrar productos seleccionados con última salida y opción de eliminar */}
      {productosMostrados.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: 16 }}>Productos Seleccionados</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {productosMostrados.map((product, index) => (
              <li key={product.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ marginRight: "10px" }}>{product.descripcion || `Producto ${index + 1}`}</span>
                <button
                  onClick={() => handleRemoveProduct(product.id)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ButtonGroup>
        <FormInputGroup>
          <button
            onClick={handleGenerateClick}
            disabled={isGenerateDisabled}
            style={{
              padding: "8px 16px",
              backgroundColor: isGenerateDisabled ? "#ccc" : "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: isGenerateDisabled ? "not-allowed" : "pointer",
              fontSize: 14,
            }}
          >
            Generar
          </button>
        </FormInputGroup>
      </ButtonGroup>

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            {showPDF ? (
              <>
                <h3 style={{ fontSize: 16 }}>Reinicio Requerido</h3>
                <p style={{ fontSize: 12 }}>Es necesario reiniciar la página para generar un nuevo documento.</p>
                <ModalButton primary onClick={handleResetPage}>
                  Reiniciar página
                </ModalButton>
                <ModalButton onClick={() => setShowModal(false)}>
                  Cancelar
                </ModalButton>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 16 }}>Confirmar Generación</h3>
                <p style={{ fontSize: 12 }}>¿Está seguro de generar el documento?</p>
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

      {showPDF && (
        <PDFContainer>
          <PDFViewer ref={pdfViewerRef} className="pdfviewer">
            <Document title="Reporte de stock todos">
              <Page size="A4" orientation="landscape" style={styles.page}>
                <Image src="../src/assets/GORE.png" style={styles.image} />
                <View style={styles.body}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 6,
                      marginBottom: 5,
                    }}
                  >
                    <View style={{ width: "30%" }}>
                      <Text>UNIDAD EJECUTORA SUB REGION</Text>
                      <Text>DE DESARROLLO ILO N°003</Text>
                      <Text>ALMACEN CENTRAL</Text>
                      <Text>AV. VENECIA N°222</Text>
                      <Text>RUC: 20532480397</Text>
                    </View>
                    <View style={{ width: "40%", textAlign: "center" }}>
                      <Text style={styles.titleText}>PEDIDO COMPROBANTE DE SALIDA</Text>
                      <View style={{ fontSize: 6, textAlign: "center", marginBottom: 5 }}>
                        <Text>Stock: {dataempresa?.nombre || "Almacen Desconocido"}</Text>
                      </View>
                    </View>
                    <View style={{ width: "20%", textAlign: "right" }}>
                      <Text>Fecha: {formattedDate}</Text>
                      <Text>Generado por: {dataKardex?.[0]?.[0]?.nombres || "Usuario X"}</Text>
                      <Text>Número de Documento:</Text>
                      <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                        {contador || "Cargando..."}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      fontSize: 6,
                      marginBottom: 15,
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
                    {productosConUltimaSalida.length > 0 &&
                      productosConUltimaSalida.map((ultimaSalida, i) => renderTableRow(ultimaSalida, false, i))}
                    {productosConUltimaSalida.length > 0 && renderTableRow({}, false, null, true)}
                  </View>
                  <View style={{ marginTop: 15, flexDirection: "row", justifyContent: "space-between", width: "40%" }}>
                    <View style={{ width: "60%" }}>
                      <Text style={{ fontSize: 8, fontWeight: "bold", marginBottom: 3 }}>
                        Resumen por Código de Cuenta
                      </Text>
                      <View style={[styles.row, { backgroundColor: "#f0f0f0" }]}>
                        <Text style={[styles.cell, { fontWeight: "bold", width: 160 }]}>Código Cuenta</Text>
                        <Text style={[styles.cell, { fontWeight: "bold", width: 105 }]}>Total Precio (S/.)</Text>
                      </View>
                      {Object.entries(resumenCuentas).map(([codigo, total]) => (
                        <View key={codigo} style={styles.row}>
                          <Text style={[styles.cell, { width: 120 }]}>{codigo}</Text>
                          <Text style={[styles.cell, { width: 80 }]}>
                            S/. {total.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        </View>
                      ))}
                      <View style={[styles.row, { marginTop: 5, backgroundColor: "#dcdcdc" }]}>
                        <Text style={[styles.cell, { fontWeight: "bold", width: 120 }]}>TOTAL GENERAL</Text>
                        <Text style={[styles.cell, { fontWeight: "bold", width: 80 }]}>
                          S/. {totalResumen.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>
                    <View style={{ width: "20%", paddingLeft: 5 }}>
                      <Text style={{ fontSize: 8, marginBottom: 3 }}>
                        Cantidad de Productos seleccionados:
                      </Text>
                      <View style={{ fontSize: 8, marginBottom: 3 }}>
                        <Text> {cantidadProductos} ({cantidadProductosTexto})</Text>
                      </View>
                    </View>
                    <View style={{ width: "20%", paddingLeft: 5 }}>
                      <Text style={{ fontSize: 8 }}>
                        Fecha de Recepción: _______________
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.footer} fixed>
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
              </Page>
            </Document>
          </PDFViewer>
        </PDFContainer>
      )}
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
    border-radius: 8px;
    overflow: hidden;
  }
`;

const FormInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  label {
    font-size: 12;
    color: ${(props) => props.theme.text};
  }
  input,
  select,
  button {
    background-color: ${(props) => props.theme.bg};
    color: ${(props) => props.theme.text};
    border: 1px solid #414244;
    border-radius: 8px;
    padding: 10px 12px;
    fontSize: 14;
    outline: none;
    width: 100%;
  }
  select:focus,
  button:focus {
    outline: none;
  }
`;

export default KardexEntradaSalida;