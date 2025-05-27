import styled from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "../../../index";
import {
  Document,
  Page,
  Text,
  View,
  PDFViewer,
} from "@react-pdf/renderer";
import { Buscador, ListaGenerica, useProductosStore, useEmpresaStore } from "../../../index";
import { destinos } from "../../../store/destinos";
import SearchableSelect from "./SearchableSelect";
import { styles } from "../../../styles/pdfStyles";

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
  return num.toString();
};

// Estilos
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${(props) => props.theme.bg};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  padding: 12px;
  background-color: ${(props) => props.theme.bg};
  color: white;
  font-size: 14px;
  text-align: left;
  border-bottom: 1px solid #414244;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${(props) => props.theme.bg};
  }
  &:nth-child(odd) {
    background-color: ${(props) => props.theme.bg};
  }
`;

const TableCell = styled.td`
  padding: 12px;
  font-size: 14px;
  color: ${(props) => props.theme.text};
  border-bottom: 1px solid #414244;
`;

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
  background-color: ${(props) => props.theme.bg};
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  margin: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background-color: ${(props) => (props.primary ? "#007bff" : props.danger ? "#ff4444" : "#ccc")};
  color: white;
`;

const FormInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  label {
    font-size: 12px;
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
    font-size: 14px;
    outline: none;
    width: 100%;
  }
  select:focus,
  button:focus {
    outline: none;
  }
`;

const PDFContainer = styled.div`
  width: 100%;
  min-height: 595px;
  margin-top: 20px;
  border: 1px solid #ccc;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  .pdfviewer {
    width: 100%;
    height: 595px;
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
    border-radius: 8px;
    overflow: hidden;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 14px;
  margin-top: 10px;
`;

function EdicionNeasList() {
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stateListaproductos, setStateListaProductos] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [localProductos, setLocalProductos] = useState([]);
  const [pdfError, setPdfError] = useState(null);
  const queryClient = useQueryClient();

  const { dataempresa } = useEmpresaStore();
  const {
    buscarProductos,
    buscador,
    setBuscador,
    addProductoItem,
    removeProductoItem,
  } = useProductosStore();

  // Estados para los campos del formulario
  const [dependencia, setDependencia] = useState("");
  const [solicitaEntrega, setSolicitaEntrega] = useState("");
  const [destino, setDestino] = useState("");
  const [referencia, setReferencia] = useState("");
  const [ctaMayor, setCtaMayor] = useState("");
  const [programa, setPrograma] = useState("");
  const [subPrograma, setSubPrograma] = useState("");
  const [meta, setMeta] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [generadoPor, setGeneradoPor] = useState("");
  const [fechaGeneracion, setFechaGeneracion] = useState("");

  // Consulta para obtener todos los reportes de registro_nea
  const { data: reportes = [], isLoading, error } = useQuery({
    queryKey: ["reportes_nea"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registro_nea")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Consulta para buscar productos
  const { data: dataproductosbuscador } = useQuery({
    queryKey: ["buscar productos", { id_empresa: dataempresa?.id, descripcion: buscador }],
    queryFn: () => buscarProductos({ id_empresa: dataempresa?.id, descripcion: buscador }),
    enabled: !!dataempresa && !!buscador,
  });

  // Mutación para actualizar el reporte
  const updateReporteMutation = useMutation({
    mutationFn: async (updatedData) => {
      const { data: existing } = await supabase
        .from("registro_nea")
        .select("id")
        .eq("numero_documento", updatedData.numero_documento)
        .neq("id", selectedReporte.id)
        .single();

      if (existing) {
        throw new Error(`El documento con ID ${updatedData.numero_documento} ya está registrado`);
      }

      const { error } = await supabase
        .from("registro_nea")
        .update({
          ...updatedData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedReporte.id);
      if (error) throw error;
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reportes_nea"]);
      setSuccessMessage("Reporte actualizado exitosamente.");
      setTimeout(() => {
        setSuccessMessage("");
        setShowModal(false);
      }, 2000);
    },
    onError: (error) => {
      setErrorMessage(`Error al actualizar el reporte: ${error.message}`);
    },
  });

  const handleEditReporte = (reporte) => {
    setSelectedReporte(reporte);
    // Autocompletar los campos
    setNumeroDocumento(reporte.numero_documento);
    setDependencia(reporte.dependencia_solicitante);
    setSolicitaEntrega(reporte.solicita_entrega || "");
    setDestino(reporte.destino || "");
    setReferencia(reporte.referencia || "");
    setCtaMayor(reporte.cuenta_mayor || "");
    setPrograma(reporte.programa || "");
    setSubPrograma(reporte.sub_programa || "");
    setMeta(reporte.meta || "");
    setGeneradoPor(reporte.generado_por || "Usuario X");
    setLocalProductos(reporte.productos || []);
    // Formatear fecha_generacion para input datetime-local
    const fecha = new Date(reporte.fecha_generacion);
    const formattedFecha = fecha.toISOString().slice(0, 16); // Ej: "2025-05-23T10:46"
    setFechaGeneracion(formattedFecha);
    setShowModal(true);
    setPdfError(null);
  };

  const handleSaveChanges = () => {
    if (!numeroDocumento || !dependencia || !fechaGeneracion) {
      setErrorMessage("El número de documento, la dependencia solicitante y la fecha de generación son obligatorios.");
      return;
    }

    const total_monto = localProductos.reduce((acc, producto) => {
      const cantidad = parseFloat(producto.cantidad) || 0;
      const precio = parseFloat(producto.preciocompra) || 0;
      return acc + cantidad * precio;
    }, 0);

    setIsSaving(true);
    updateReporteMutation.mutate({
      numero_documento: numeroDocumento,
      dependencia_solicitante: dependencia,
      solicita_entrega: solicitaEntrega || null,
      destino: destino || null,
      referencia: referencia || null,
      cuenta_mayor: ctaMayor || null,
      programa: programa || null,
      sub_programa: subPrograma || null,
      meta: meta || null,
      productos: localProductos,
      total_monto,
      id_empresa: parseInt(dataempresa?.id),
      generado_por: generadoPor,
      fecha_generacion: new Date(fechaGeneracion).toISOString(),
    });
  };

  const handleCloseModal = () => {
    setSelectedReporte(null);
    setNumeroDocumento("");
    setDependencia("");
    setSolicitaEntrega("");
    setDestino("");
    setReferencia("");
    setCtaMayor("");
    setPrograma("");
    setSubPrograma("");
    setMeta("");
    setGeneradoPor("");
    setFechaGeneracion("");
    setLocalProductos([]);
    setShowModal(false);
    setSuccessMessage("");
    setErrorMessage("");
    setIsSaving(false);
    setPdfError(null);
  };

  const handleAddProduct = (producto) => {
    setLocalProductos((prev) => [...prev, { ...producto, cantidad: 1 }]);
    addProductoItem(producto);
    setBuscador("");
    setStateListaProductos(false);
  };

  const handleRemoveProduct = (productId) => {
    setLocalProductos((prev) => prev.filter((p) => p.id !== productId));
    removeProductoItem(productId);
  };

  // Cálculos para el PDF
  const productosConUltimaSalida = localProductos.map((producto, index) => ({
    ...producto,
    id: `${index}-${producto.id || index}`,
    producto,
  }));

  const tableTotal = localProductos.reduce((acc, producto) => {
    const cantidad = parseFloat(producto.cantidad) || 0;
    const precio = parseFloat(producto.preciocompra) || 0;
    return acc + cantidad * precio;
  }, 0);

  const resumenCuentas = {};
  localProductos.forEach((producto) => {
    const cuenta = producto.codigobarras || "SIN CUENTA";
    const cantidad = parseFloat(producto.cantidad) || 0;
    const precio = parseFloat(producto.preciocompra) || 0;
    const total = cantidad * precio;
    resumenCuentas[cuenta] = (resumenCuentas[cuenta] || 0) + total;
  });
  const totalResumen = Object.values(resumenCuentas).reduce((acc, curr) => acc + curr, 0);

  const cantidadProductos = localProductos.length;
  const cantidadProductosTexto = numberToText(cantidadProductos);

  const renderTableRow = (rowData, isHeader = false, index = null, isTotal = false) => {
    if (isHeader) {
      return (
        <View style={styles.row} key="header">
          <Text style={styles.itemHeaderCell}>ITEM</Text>
          <Text style={styles.codigoHeaderCell}>CÓDIGO</Text>
          <Text style={styles.cantidadHeaderCell}>CANTIDAD</Text>
          <Text style={styles.descripcionHeaderCell}>DESCRIPCIÓN</Text>
          <Text style={styles.unidadmedidaHeaderCell}>UND.MED.</Text>
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
          <Text style={styles.emptyCellMedium}></Text>
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
          <Text style={styles.unidadmedidaCell}>{rowData.producto?.unidad_medida || ""}</Text>
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

  // Formatear fecha para el PDF
  const formattedDate = fechaGeneracion
    ? new Date(fechaGeneracion).toLocaleString("es-PE", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "No especificado";

  // Depuración de datos
  useEffect(() => {
    if (showModal) {
      console.log("Datos para el PDF (NEA):", {
        numeroDocumento,
        dependencia,
        solicitaEntrega,
        destino,
        referencia,
        ctaMayor,
        programa,
        subPrograma,
        meta,
        generadoPor,
        fechaGeneracion,
        localProductos,
        tableTotal,
        resumenCuentas,
        totalResumen,
        cantidadProductos,
      });
    }
  }, [
    showModal,
    numeroDocumento,
    dependencia,
    solicitaEntrega,
    destino,
    referencia,
    ctaMayor,
    programa,
    subPrograma,
    meta,
    generadoPor,
    fechaGeneracion,
    localProductos,
    tableTotal,
    resumenCuentas,
    totalResumen,
    cantidadProductos,
  ]);

  if (isLoading) {
    return <Container>Cargando reportes...</Container>;
  }

  if (error) {
    return <Container>Error al cargar los reportes: {error.message}</Container>;
  }

  return (
    <Container>
      <h2>Lista de Reportes NEA</h2>
      {reportes.length === 0 ? (
        <p>No hay reportes registrados.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <TableHeader>Número de Documento</TableHeader>
              <TableHeader>Dependencia Solicitante</TableHeader>
              <TableHeader>Fecha de Generación</TableHeader>
              <TableHeader>Total Monto</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </tr>
          </thead>
          <tbody>
            {reportes.map((reporte) => (
              <TableRow key={reporte.id}>
                <TableCell>{reporte.numero_documento}</TableCell>
                <TableCell>{reporte.dependencia_solicitante}</TableCell>
                <TableCell>
                  {new Date(reporte.fecha_generacion).toLocaleString("es-PE")}
                </TableCell>
                <TableCell>
                  S/. {reporte.total_monto?.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleEditReporte(reporte)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Editar
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      {showModal && selectedReporte && (
        <ModalOverlay>
          <ModalContent>
            {successMessage && (
              <p style={{ color: "green", marginBottom: "10px" }}>{successMessage}</p>
            )}
            {errorMessage && (
              <p style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</p>
            )}
            <h2>Editar Reporte NEA</h2>

            <Buscador
              funcion={() => setStateListaProductos(!stateListaproductos)}
              setBuscador={setBuscador}
            />
            <BuscadorContainer>
              {stateListaproductos && (
                <ListaGenerica
                  funcion={handleAddProduct}
                  setState={() => setStateListaProductos(false)}
                  data={dataproductosbuscador?.slice(0, 3)}
                />
              )}
            </BuscadorContainer>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "250px" }}>
                <FormInputGroup>
                  <label>Número de Documento:</label>
                  <input
                    type="text"
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                  />
                </FormInputGroup>
                <FormInputGroup>
                  <label>Dependencia Solicitante:</label>
                  <select
                    value={dependencia}
                    onChange={(e) => setDependencia(e.target.value)}
                    style={{ fontSize: 14, padding: "10px 12px" }}
                  >
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
                  labelStyle={{ fontSize: 12 }}
                  inputStyle={{ fontSize: 14, padding: "10px 12px" }}
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
              <div style={{ flex: 1, minWidth: "250px" }}>
                <FormInputGroup>
                  <label>Fecha de Generación:</label>
                  <input
                    type="datetime-local"
                    value={fechaGeneracion}
                    onChange={(e) => setFechaGeneracion(e.target.value)}
                  />
                </FormInputGroup>
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
                <FormInputGroup>
                  <label>Generado Por:</label>
                  <input
                    type="text"
                    value={generadoPor}
                    onChange={(e) => setGeneradoPor(e.target.value)}
                  />
                </FormInputGroup>
              </div>
            </div>

            {localProductos.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: 16 }}>Productos Seleccionados</h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {localProductos.map((product, index) => (
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
                <ModalButton
                  primary
                  onClick={handleSaveChanges}
                  disabled={isSaving || !numeroDocumento || !dependencia || !fechaGeneracion}
                >
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </ModalButton>
              </FormInputGroup>
              <FormInputGroup>
                <ModalButton onClick={handleCloseModal}>
                  Cancelar
                </ModalButton>
              </FormInputGroup>
            </ButtonGroup>

            <PDFContainer>
              
              {pdfError ? (
                <ErrorMessage>
                  Error al renderizar el PDF: {pdfError.message || "Error desconocido"}
                </ErrorMessage>
              ) : (
                <PDFViewer className="pdfviewer">
                  <Document title="Reporte NEA">
                    <Page size="A4" orientation="landscape" style={styles.page}>
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
                            <Text style={styles.titleText}>COMPROBANTE DE SALIDA NEA</Text>
                            <View style={{ fontSize: 6, textAlign: "center", marginBottom: 5 }}>
                              <Text>Stock: {dataempresa?.nombre || "Almacen Desconocido"}</Text>
                            </View>
                          </View>
                          <View style={{ width: "20%", textAlign: "right" }}>
                            <Text>Fecha: {formattedDate}</Text>
                            <Text>Generado por: {generadoPor || "Usuario X"}</Text>
                            <Text>Número de Documento:</Text>
                            <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                              {numeroDocumento || "Cargando..."}
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
                          {productosConUltimaSalida.length > 0 ? (
                            productosConUltimaSalida.map((ultimaSalida, i) =>
                              renderTableRow(ultimaSalida, false, i)
                            )
                          ) : (
                            <View style={styles.row}>
                              <Text style={styles.descripcionCell}>No hay productos seleccionados</Text>
                            </View>
                          )}
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
                            {Object.entries(resumenCuentas).length > 0 ? (
                              Object.entries(resumenCuentas).map(([codigo, total]) => (
                                <View key={codigo} style={styles.row}>
                                  <Text style={[styles.cell, { width: 120 }]}>{codigo}</Text>
                                  <Text style={[styles.cell, { width: 80 }]}>
                                    S/. {total.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </Text>
                                </View>
                              ))
                            ) : (
                              <View style={styles.row}>
                                <Text style={[styles.cell, { width: 120 }]}>No hay cuentas</Text>
                                <Text style={[styles.cell, { width: 80 }]}>S/. 0.00</Text>
                              </View>
                            )}
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
              )}
            </PDFContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default EdicionNeasList;